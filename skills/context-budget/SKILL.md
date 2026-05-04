---
name: context-budget
description: 扫描所有 skills/rules/MCP 组件，估算 token 消耗并分类，检测膨胀与冗余，输出优化建议。
origin: 改编-ECC
version: 0.1.0
tags: [context-management, token-optimization, audit, maintenance]
---

# Context Budget — 上下文预算审计

扫描所有 OpenClaw 组件（skills、rules、MCP servers、AGENTS.md 等），估算 token 开销，分类评估，产出优化建议。

## When to Activate

- 新增多个 skill 后，想评估上下文负担
- 会话启动变慢或 compaction 频率明显增加
- 定期审计（建议每月一次）
- 怀疑 skill 膨胀导致响应质量下降

## 审计范围

| 组件 | 路径 | 估算方式 |
|------|------|----------|
| Workspace skills | `~/.openclaw/workspace/skills/*/SKILL.md` | 读取文件，~1.3 token/字符 |
| Agents skills | `~/.agents/skills/*/SKILL.md` | 同上 |
| Rules | `~/.openclaw/workspace/rules/common/*` | 同上 |
| Core identity | `AGENTS.md`, `SOUL.md`, `USER.md`, `TOOLS.md` | 同上 |
| MCP tools | 通过 `openclaw mcp list` 获取 schema | 每个 tool schema ~500 token |

## 执行步骤

### Phase 1: 数据采集

```bash
# 统计 skill 数量和大小
echo "=== Workspace Skills ==="
find ~/.openclaw/workspace/skills -name "SKILL.md" -exec wc -c {} + | sort -rn | head -30
echo "=== Agents Skills ==="
find ~/.agents/skills -name "SKILL.md" -exec wc -c {} + | sort -rn | head -30

# 统计 rules
echo "=== Rules ==="
find ~/.openclaw/workspace/rules -type f -exec wc -c {} + | sort -rn

# 统计核心文件
echo "=== Core Files ==="
for f in AGENTS.md SOUL.md USER.md TOOLS.md IDENTITY.md MEMORY.md; do
  [ -f ~/.openclaw/workspace/$f ] && wc -c ~/.openclaw/workspace/$f
done
```

### Phase 2: 分类评估

对每个组件进行三级分类：

| 级别 | 定义 | 示例 |
|------|------|------|
| **Always** | 每次会话都加载，无法避免 | AGENTS.md, SOUL.md, HEARTBEAT.md |
| **Sometimes** | 按需加载（skill 匹配），但匹配频率高 | coding-agent-plan-first, dev-workflow, github |
| **Rarely** | 极少触发 | bb-browser, lark-slides |

分类依据：
- **Always**: 核心身份文件 + 每次会话必然涉及的 skill
- **Sometimes**: 在 skill 描述中明确标注的高频 skill
- **Rarely**: 描述指向特定场景/工具的 skill

### Phase 3: 问题检测

#### 3.1 膨胀检测

- **重型 skill**（>200 行 SKILL.md）→ 标记为需精简
- **膨胀描述**（frontmatter description >100 字符）→ 建议压缩
- **冗余内容**（与其他 skill 重叠 >50%）→ 标记为合并候选

#### 3.2 冗余检测

- 功能重叠的 skill 对（如多个 lark 相关 skill 是否可合并）
- 描述过于相似但未明确区分的 skill
- 长期未触发且无外部引用的 skill

#### 3.3 MCP 开销检测

MCP tool schema 是最大的 token 消耗来源（每个 tool ~500 token）。

```bash
# 检查 MCP server 列表
openclaw mcp list 2>/dev/null || echo "需要通过 gateway 查看 MCP 配置"
```

- 每个 MCP server 暴露的 tool 数量
- 是否有不常用 MCP server 占用大量 context
- 建议：非必要 MCP 改为按需连接

### Phase 4: 产出报告

输出格式：

```markdown
# Context Budget Report — YYYY-MM-DD

## 总览
- Workspace Skills: N 个，总计 ~X token
- Agents Skills: N 个，总计 ~X token
- Rules: N 个，总计 ~X token
- Core Files: N 个，总计 ~X token
- MCP Tools: N 个，总计 ~X token
- **估算总上下文开销: ~X token**

## 分类统计
| 级别 | 数量 | 占比 |
|------|------|------|
| Always | N | X% |
| Sometimes | N | X% |
| Rarely | N | X% |

## 问题清单
### 膨胀（>200 行）
1. `skills/xxx/SKILL.md` — 250 行 → 建议：提取详细内容到子文件

### 冗余候选
1. `skills/aaa` ↔ `skills/bbb` — 功能重叠

### MCP 优化
1. `mcp-server-name` — 暴露 N 个 tool，建议评估是否全部必要

## 优化建议
1. [具体可操作的优化项]
```

## Token 估算参考

- 英文：~1.3 token/字符（平均）
- 中文：~2 token/字符（平均）
- 一个 100 行的 SKILL.md ≈ 3,000-5,000 token
- 一个 200 行的 SKILL.md ≈ 6,000-10,000 token
- MCP tool schema: ~500 token/tool
- AGENTS.md: ~2,000-3,000 token（当前）

## 与其他 Skill 的关系

- **skill-stocktake**: 评估 skill 质量，本 skill 评估 token 开销，互补使用
- **strategic-compact**: 上下文预算过高时，配合战略性压缩使用
- **zai-token-stats**: 统计实际 token 用量，本 skill 估算预算

## 注意事项

- Token 估算是近似值，实际消耗取决于模型 tokenizer
- 本 skill 不执行任何删除操作，仅提供建议
- 建议在执行优化前先做备份（`trash` 而非 `rm`）
