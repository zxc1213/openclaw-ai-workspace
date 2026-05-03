# Safety Verify — 高危操作语义安全验证

> 借鉴 OpenHarness LLM-as-Hook 设计，在 prompt 层面实现语义级安全验证

---

## 描述

在执行高危工具操作前，进行结构化安全自检，防止规则引擎无法覆盖的风险变体。

**当以下情况时使用此 Skill**：
1. 准备执行 `exec` 命令（非纯读取类：涉及写入、删除、安装、部署、systemctl 等）
2. 准备使用 `write`/`edit` 覆盖核心配置文件（AGENTS.md、SOUL.md、gateway config 等）
3. 准备调用 `gateway.config.apply` 或 `gateway.config.patch`
4. 准备使用 `message send` 向外部发送消息（非回复当前对话）
5. 准备执行 elevated（sudo）操作

**不适用于**：
- 纯读取操作（`read`、`web_search`、`web_fetch`、`feishu_*` 查询类）
- 回复当前对话（正常 assistant 回复）
- 已获用户明确授权的操作

---

## 自检流程

### Step 1: 授权验证

问自己：**这个操作是否在已授权范围内？**

检查清单：
- [ ] 用户是否在当前对话中明确要求了此操作？
- [ ] 操作是否在 AGENTS.md 安全边界内？
- [ ] 是否涉及用户私有数据外泄？

**如果任一答案是"否"** → 暂停，向用户确认。

### Step 2: 安全替代

问自己：**是否有更安全的替代方案？**

替代方案示例：
| 高危操作 | 更安全替代 |
|---------|-----------|
| `exec: sudo apt install xxx` | 先询问用户，确认后使用 `/approve` |
| `write: 覆盖核心配置文件` | 先 `read` 确认当前内容，再用 `edit` 精准修改 |
| `exec: rm -rf xxx` | 先用 `mv xxx /tmp/trash-xxx` 移到临时目录 |
| `exec: git push --force` | 禁止！按 AGENTS.md 红线规则 |
| `message: 向外部群发送消息` | 先向用户确认发送内容和目标 |

**如果有替代方案** → 使用更安全的方案。

### Step 3: 可逆性检查

问自己：**操作是否可逆？**

- ✅ 可逆：`edit`（git 可回退）、`mv`（可移回）、`write` 到临时文件
- ⚠️ 部分可逆：`exec` 安装软件（可卸载但有残留）、`gateway restart`
- ❌ 不可逆：`rm -rf`、`git push --force`、数据删除

**如果不可逆** → 必须向用户确认，并建议备份方案。

---

## 判定规则

### 🟢 直接执行（满足所有条件）
- 用户明确要求
- 在安全边界内
- 有安全替代或本身安全
- 可逆

### 🟡 需确认（任一条件不满足）
- 用户意图不够明确（"帮我优化一下配置" → 具体哪个？怎么优化？）
- 操作不可逆
- 涉及系统级变更

### 🔴 阻断（违反安全边界）
- 涉及私有数据外泄
- 违反 AGENTS.md 红线规则（git push --force、git commit --no-verify 等）
- 路径不在允许范围内

---

## 实现说明

这是一个 **prompt 层面**的安全验证机制，不是底层 Hook。它通过：
1. **AGENTS.md 规则**：作为系统指令的一部分被加载
2. **Skill 触发**：通过 description 匹配在相关操作前触发
3. **模型自我约束**：依赖模型的指令遵循能力

与 OpenHarness 的 LLM-as-Hook 对比：
| 维度 | OpenHarness | 本 Skill |
|------|------------|---------|
| 触发方式 | 底层 Hook 事件（PRE_TOOL_USE） | Prompt 规则 + Skill 匹配 |
| 验证方式 | 独立 LLM 调用（512 tokens） | 同一 LLM 自检（零额外成本） |
| 阻断能力 | 硬阻断（Hook 返回 blocked） | 软约束（依赖模型遵循） |
| 成本 | 每次高危调用 ~500 tokens | 零额外 tokens |

**局限性**：软约束不如硬阻断可靠。对于关键安全场景，仍需依赖 OpenClaw 的 elevated 权限审批机制。
