# Self-Improving Agent 研究与落地方案

> 日期: 2026-04-09
> 触发: Ray 想了解 Hermes Agent，问"能不能不让我强调，时刻不停地进化"
> 标签: #self-improving #agent-evolution #openclaw #hermes

---

## Hermes Agent 的自进化拆解

Hermes 的"closed learning loop"其实由三个独立机制组成，**没有魔法**：

### 机制 1: 自动记忆（Memory Proactive Save）
**原理**: Agent 在每次对话中，识别值得记住的信息，**主动**调用 memory tool 保存。
- 触发条件: 用户偏好、环境事实、纠错、项目约定、已完成工作
- 存储有字符上限（MEMORY 2200 字符，USER 1375 字符），满了自动合并/淘汰
- `flush memory before context is lost` — 压缩前自动保存

**OpenClaw 已有**: memory_store/memory_recall（OpenViking），但需要 prompt 驱动或心跳触发，不是 agent 主动判断"这个值得记"。

### 机制 2: 自动 Skill 创建（Skill Autogenesis）
**原理**: 解决复杂问题后，agent 自动生成 SKILL.md，下次遇到类似问题时直接复用。
- Agent 可以自己写/修改/删除 skill 文件
- Skill 有版本、标签、条件激活（平台、工具集）
- agentskills.io 开放标准，可跨 agent 共享

**OpenClaw 已有**: SKILL.md 体系 + ClawHub 生态，但 skill 创建是人工/外部驱动的，agent 不能自己写 skill。

### 机制 3: Skill 自优化（Skill Self-Improvement）
**原理**: 使用 skill 时如果发现问题（报错、效果不好），agent 自动修改 skill 内容。
- 使用中收集反馈
- 下次使用时改进

**OpenClaw 无**: 没有 skill 使用反馈闭环。

---

## 关键洞察

Hermes 的自进化**不需要框架层面的特殊能力**。它依赖的是：
1. **Agent 拥有文件写入权限**（memory 文件和 skill 文件）
2. **Prompt 中有明确的"什么时候该存记忆"指导**
3. **有容量管理机制**（满了会合并淘汰）

OpenClaw 完全具备这些基础条件：
- ✅ `write` 工具可以写文件
- ✅ `memory_store` 可以存记忆
- ✅ 心跳可以做容量管理
- ❌ 但 prompt 中没有"主动进化"的行为指令

**结论: 自进化的核心不是框架能力，是 prompt 行为设计。**

---

## OpenClaw 落地方案: 三层自进化体系

### 第一层: 主动记忆（立即可做，改 prompt）

**原理**: 在 AGENTS.md / SOUL.md 中加入"主动记忆行为准则"，让每次对话都自动判断该记什么。

**改动**:
1. **SOUL.md** 加入记忆行为:
```markdown
## 记忆行为（自动执行）
- 每次对话中，当发现以下信息时，主动调用 memory_store 保存，无需用户要求：
  - 用户的新偏好/习惯（如"我喜欢用 pnpm 不用 npm"）
  - 环境变更（如"项目从 webpack 迁移到 vite"）
  - 踩坑经验（如"这个 API 返回格式变了"）
  - 项目约定（如"这个项目用 pascal-case 命名"）
- 跳过：显而易见的事实、已有记忆、一次性调试上下文
```

2. **HEARTBEAT.md** 心跳增强:
   - 检查 OpenViking 记忆数量，过少时提醒
   - 定期整理：重复记忆合并、过时记忆淘汰

**成本**: 零，纯 prompt 改动
**效果**: 每次对话都在积累，不再需要你强调"记住这个"

### 第二层: 自动 Skill 创建（需要验证可行性）

**原理**: 复杂任务完成后，自动判断是否值得沉淀为 skill。

**改动**:
1. 在 AGENTS.md 加入 skill 创建准则:
```markdown
## 自动 Skill 创建
- 完成 subagent 任务后，如果任务是**通用的、可复用的**（如"PR review 流程"、"部署检查清单"），在 daily notes 中标记 `[skill-candidate]`
- 心跳时检查 skill-candidate 标记，由主会话审核是否创建 SKILL.md
- 创建的 skill 遵循 agentskills.io 标准格式
```

2. 心跳新增扫描逻辑:
   - 扫描 daily notes 中的 `[skill-candidate]`
   - 评估通用性和复用价值
   - 自动创建 SKILL.md 草稿到 `skills/` 目录

**风险**: 可能产生低质量 skill
**缓解**: 自动创建为草稿状态，需人工确认后激活

### 第三层: Skill 自优化（长期目标）

**原理**: 使用 skill 时收集反馈，定期改进。

**改动**:
1. Skill 使用后，subagent 返回结果中包含 effectiveness 评估
2. 心跳中分析：某 skill 最近 3 次使用是否都有效
3. 无效的 skill 标记为需要修订，下次使用时自动改进

**这个需要 OpenClaw 框架层面的支持**（skill 版本管理、使用追踪），目前做不到。

---

## 实施计划

| 阶段 | 内容 | 时间 | 依赖 |
|------|------|------|------|
| P0 | SOUL.md + HEARTBEAT.md 加入主动记忆行为 | 现在 | 无 |
| P1 | 心跳增强：记忆容量管理 + 技能候选扫描 | 1-2 天 | P0 |
| P2 | subagent 任务完成后自动标记 skill-candidate | 3-5 天 | P1 |
| P3 | Skill 草稿自动生成 + 人工审核流程 | 1 周 | P2 |
| P4 | Skill 自优化（需 OpenClaw 框架支持） | 待定 | OpenClaw 更新 |

---

## 与 Hermes 的差距评估

| 能力 | Hermes | OpenClaw + 本方案 | 差距 |
|------|--------|-------------------|------|
| 主动记忆 | 框架内置 | P0 可实现 | ❌→✅ 无差距 |
| 记忆容量管理 | 字符上限 + 自动合并 | 心跳 + OpenViking | ⚠️ 接近 |
| 自动 skill 创建 | agent 直接写文件 | 草稿 + 人工审核 | ⚠️ 多一步审核 |
| Skill 自优化 | 内置 | 待框架支持 | ❌ 有差距 |
| 用户建模 (Honcho) | 内置 | OpenViking 部分 | ⚠️ 有差距 |
| 轨迹采集 + RL | 内置 | 不在目标范围内 | ❌ 不同定位 |

**总结: P0-P2 实施后，日常自进化能力达到 Hermes 80% 水平。剩余 20% 是框架层面的能力，等 OpenClaw 更新。**
