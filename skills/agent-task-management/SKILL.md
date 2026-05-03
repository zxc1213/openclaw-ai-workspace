---
name: agent-task-management
description: "Agent 任务全生命周期管理与进度追踪。包含：任务派发（四要素模板）、实时进度查询、Canvas 看板可视化、执行后复盘与 skill 优化。触发：任务管理, 进度追踪, agent 看板, 任务复盘, task management. 需要OpenClaw subagent support."
---

# Agent 任务全生命周期管理

> 本 skill 是 `agent-task-dispatch` 的增强版，增加了进度追踪、可视化看板和执行复盘。

## 生命周期总览

```
分析拆解 → 派发执行 → 进度追踪 → 结果验收 → 复盘优化
    ↑                                          │
    └──────── 经验反馈 ←──────────────────────┘
```

## 一、任务派发（继承 agent-task-dispatch）

### 四要素模板（必用）
```markdown
## 任务：[简短标识]

### Goal
[一句话：做什么，产出什么]

### Context
- [关键背景，不超过5行]
- [相关文件路径/文档链接]

### Constraints
1. [硬性约束]
2. [上下文预算：简单<300, 中等300-500, 复杂500-800 token]
3. [建议 max_turns]
4. **progress_report**: 每 N 分钟输出进度摘要（默认5分钟）
5. **memory_scope**: coding | research | infra | project:<name> | 省略=全量

### Done 标准
1. [具体可检查的完成条件]
2. [输出格式要求]

### Meta（可选）
- **effort**: low | medium | high
- **critical_reminder**: [每轮重注入的关键提醒]
- **timeout**: [超时秒数，默认600]
```

### 派发要点
- 使用 `sessions_spawn` 派发，**持久任务用 `mode=session`**
- 复杂任务 timeout 建议设 1200-1800 秒
- 任务描述中明确要求 `progress_report`，agent 会在执行中输出进度节点

## 二、进度追踪

### 方式1：主动查询（随时可用）
```bash
# 查看所有活跃子任务
subagents(action=list)

# 查看子任务对话历史（需 sessions.visibility=agent 或 tree）
sessions_history(sessionKey=<childSessionKey>, limit=10)
```

### 方式2：进度汇报（任务模板中约定）
在任务 Constraints 中加入：
```
**progress_report**: 每5分钟输出一行进度摘要，格式：[PROGRESS] 已完成XX，下一步YY
```
这样 agent 会在执行过程中主动报告进度。

### 方式3：Canvas 看板（可视化）
当有活跃子任务时，用 Canvas 展示任务看板：

```
╔══════════════════════════════════════════════╗
║  📋 Agent 任务看板                    22:30  ║
╠══════════════════════════════════════════════╣
║                                              ║
║  🟢 进行中 (1)                               ║
║  ┌─────────────────────────────────────────┐ ║
║  │ 🤖 cc-gui-commit-progress-split         │ ║
║  │ Agent: 小米工程师 (mimo-v2.5-pro)       │ ║
║  │ 耗时: 8m38s    Token: 55k/1M           │ ║
║  │ 进度: 分析代码结构中...                  │ ║
║  └─────────────────────────────────────────┘ ║
║                                              ║
║  ✅ 已完成 (0)                               ║
║  ⏳ 排队中 (0)                               ║
║  ❌ 失败 (0)                                 ║
╚══════════════════════════════════════════════╝
```

看板数据来源：
- `subagents(action=list)` 获取活跃/历史任务
- `sessions_history` 获取最后几条消息判断进度
- 任务标签、状态、耗时、token 消耗

## 三、结果验收

### 完成检查清单
- [ ] 代码是否编译/构建通过
- [ ] Done 标准是否全部满足
- [ ] 是否有遗留问题（测试失败、TODO）
- [ ] 分支是否正确（基于目标分支）

### 结果记录（每次必做）
在 `memory/subagent-log.md` 追加：
```markdown
| 日期 | 类型 | Agent | 结果 | 耗时 | 备注 |
|------|------|-------|------|------|------|
| 2026-05-01 | coding | 小米工程师 | ⚠️ 超时 | 9m42s | 只完成文件分析，未动手改代码 |
```

## 四、执行复盘（每次任务结束后必做）

### 复盘维度
1. **时间效率**：预估 vs 实际耗时，是否合理
2. **上下文预算**：给的信息是否刚好够用，还是过多/不足
3. **Done 标准**：是否清晰无歧义
4. **超时处理**：如果超时，是因为任务太大还是 agent 效率低
5. **经验教训**：下次可以怎么改进

### 复盘输出格式
在当天 daily notes 中追加：
```markdown
### 任务复盘: [任务标识]
- **结果**: ✅成功 / ⚠️部分完成 / ❌失败
- **耗时**: X分钟（预估Y分钟）
- **问题**: [遇到的问题]
- **改进**: [下次怎么做]
- **skill优化建议**: [如有]
```

## 五、Skill 自优化机制

### 触发条件
- 同类任务连续 2 次出现问题 → 更新 skill
- 发现新的反模式 → 追加到 skill
- 用户提出改进建议 → 评估后采纳

### 优化流程
1. 在 daily notes 标记 `[skill-improvement: agent-task-management - 描述]`
2. 下次心跳时 review 并更新 SKILL.md
3. 更新后在 daily notes 记录变更

## 六、反模式（从实战中总结）

❌ 不设置 timeout，依赖默认值（可能不够）
❌ 不要求 progress_report，导致进度黑盒
❌ 复杂任务用 `mode=run`（超时丢失进度），应用 `mode=session`
❌ 派发后不检查项目目录是否存在（subagent workspace 不同）
❌ 配置变更触发重启前不保存进度
❌ 不记录复盘，重复踩同样的坑

## 七、实战 checklist

派发前：
- [ ] 项目路径是否在 agent workspace 可访问范围内（或用绝对路径）
- [ ] git 代理是否配置（跨网络操作）
- [ ] 目标分支是否最新（fetch + rebase）
- [ ] timeout 是否合理（复杂任务 ≥ 1200s）
- [ ] 任务模板是否包含 progress_report

执行中：
- [ ] 用 subagents list 查状态
- [ ] 用户询问时能给出进度
- [ ] 超时前考虑是否需要 steer 续命

完成后：
- [ ] 验收结果
- [ ] 记录 subagent-log
- [ ] 写复盘到 daily notes
- [ ] 评估是否需要优化 skill
