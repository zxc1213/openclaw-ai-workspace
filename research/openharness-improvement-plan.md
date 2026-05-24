# OpenHarness → OpenClaw 改进计划

> 创建日期: 2026-04-06 | 基于 `docs/openclaw-vs-openharness.md` 的行动建议

## 总体策略

OpenClaw 是 TypeScript 核心代码（npm 包），我们无法直接修改 `node_modules` 中的 minified 代码。改进路径有两条：

1. **提 Issue/PR 到 OpenClaw 官方**（长期，影响所有用户）
2. **Workspace 层面的 Harness 改进**（短期，提升我们自己的 Agent 行为质量）

本计划聚焦 **路径 2**——通过改进 AGENTS.md、Skills、Rules 等 Harness 文件，在不改 OpenClaw 核心代码的前提下，最大化借鉴 OpenHarness 的设计优势。

---

## P0-1: 工具失败隔离

### 目标
当模型同时调用多个工具时，单个工具失败不应中断其他工具的执行。模型应在下一轮看到错误信息并自行处理。

### 现状分析
OpenClaw 的工具执行机制：
- 位置: `agent-runner.runtime-CJ-tudLz.js`
- 关键代码: `pendingToolTasks` Set + `Promise.allSettled`（line 1964）
- 现有行为: `Promise.allSettled` **已经**会等待所有 tool task 完成，不管个别失败
- **结论**: OpenClaw 底层**已经具备**工具失败隔离能力（`allSettled` vs `all`）

### 我们能做的（Harness 层面）
虽然底层已支持，但可以在 AGENTS.md 和 coding-agent skill 中强化这个行为的利用：

1. **在 AGENTS.md 中明确指导**：鼓励模型一次调用多个独立工具，而不是串行
2. **在 coding-agent skill 中增加并行调用建议**：例如"需要读多个文件时，一次调用多个 read"
3. **记录到最佳实践**：将此发现写入 heartbeat-reflections/lessons.md

### 验证
让模型测试一下——同时调用两个工具，其中一个故意失败，看另一个是否正常返回。

---

## P0-2: Subagent maxTurns 硬上限

### 目标
为 subagent 设置 `max_turns` 上限，防止无限循环浪费 token。

### 现状分析
- `sessions_spawn` 参数中有 `runTimeoutSeconds`（超时时间控制）
- 但没有 `maxTurns`（轮次上限）参数
- 当前防无限循环的手段：超时（默认 300s）+ compaction

### 我们能做的
1. **在 AGENTS.md Subagent 任务派发规范中增加约定**：任务模板 Constraints 中增加 `max_turns` 字段
2. **在 subagent 派发 prompt 中注入轮次感知**：让 subagent 在接近预期轮次时主动总结
3. **提 Issue 给 OpenClaw 官方**：建议 `sessions_spawn` 增加 `maxTurns` 参数

---

## P1-1: Hook 标准化（fnmatch matcher）

### 目标
建立统一的 Hook 事件名、匹配器模式、模板变量约定。

### 现状分析
OpenClaw 当前的"Hook"机制：
- cron jobs（定时任务触发）
- channel plugins（消息事件触发）
- elevated permissions（审批触发）
- AGENTS.md 规则（prompt 层面的约束）

没有类似 OpenHarness 的 `PRE_TOOL_USE` / `POST_TOOL_USE` 标准化事件。

### 我们能做的
1. **在 AGENTS.md 中定义 Hook 约定**：虽然没有底层事件系统，但可以通过 prompt 规则模拟
   - "执行 exec 前必须检查是否涉及危险命令"
   - "写入文件前必须确认路径在 workspace 内"
2. **利用现有 AGENTS.md Red Lines**：已经有安全边界规则，可以更结构化
3. **提 Issue 给 OpenClaw 官方**：建议增加标准化 Hook 事件系统

---

## P1-2: 路径级别权限控制

### 目标
禁止访问敏感路径（`/etc`、`~/.ssh`、`~/.gnupg`），阻止危险命令模式（`rm -rf /*`、`sudo`）。

### 现状分析
OpenClaw 当前的权限机制：
- `elevated` 权限（系统级命令需要审批）
- `exec` security 模式（`deny`/`allowlist`/`full`）
- AGENTS.md 中的 Red Lines（软约束，prompt 层面）

没有路径级别的白名单/黑名单。

### 我们能做的
1. **在 AGENTS.md 中增加路径安全规则**：
   - 禁止路径列表：`/etc/*`、`/usr/*`（非读取）、`~/.ssh/*`、`~/.gnupg/*`
   - 允许路径：`~/.openclaw/workspace/*`、`/tmp/*`、`/mnt/*`
2. **在 exec security 配置中细化**：通过 openclaw.json 配置 `exec.security`
3. **提 Issue 给 OpenClaw 官方**：建议增加 `pathRules` 配置

---

## P1-3: LLM-as-Hook 语义安全验证（概念原型）

### 目标
在高危工具调用前，用轻量 LLM 验证行为意图是否安全。

### 现状分析
OpenClaw 没有类似机制。当前安全依赖：
- elevated 权限审批（人工介入）
- AGENTS.md 红线规则（prompt 约束）

### 我们能做的（原型验证）
写一个 **Skill** 来模拟 LLM-as-Hook：

```markdown
# SKILL.md: safety-verify
在使用 exec、write、gateway.config 等高危工具前，先自我验证：
1. 这个操作是否在已授权范围内？
2. 是否有更安全的替代方案？
3. 操作是否可逆？
如果答案都是"是"则继续，否则暂停并询问用户。
```

这是一个 **prompt 层面** 的模拟，不是底层 Hook。但可以在实践中验证效果。

---

## P2-1: Agent 定义精细化字段

### 目标
增强 subagent 的配置粒度：`effort`（思考强度）、`criticalReminder`（关键提醒）。

### 现状分析
- `sessions_spawn` 支持 `thinking` 参数（对应 reasoning mode）
- 没有显式的 `effort` 或 `criticalReminder`

### 我们能做的
1. **`effort` → 映射到 `thinking` 参数**：
   - `low` → `thinking: "off"`
   - `medium` → `thinking: "stream"`（或默认）
   - `high` → `thinking: "on"`
2. **`criticalReminder` → 在 task prompt 末尾注入**：
   - 在 AGENTS.md 任务模板中增加 `Critical Reminder` 字段
   - 派发时自动追加到 task 末尾
3. **提 Issue 给 OpenClaw 官方**：建议 sessions_spawn 增加 `effort`/`criticalReminder` 参数

---

## P2-2: 成本可观测性增强

### 目标
独立追踪每个工具调用的 token 消耗，提供工具级别成本分析。

### 现状分析
OpenClaw 有 `/status` 命令显示 session 级别的 token 用量，但没有工具级别的细粒度追踪。

### 我们能做的
1. **利用 session_status 工具**：定期检查 token 用量
2. **在 daily notes 中记录**：每日统计 token 消耗趋势
3. **提 Issue 给 OpenClaw 官方**：建议增加 per-tool token 追踪

---

## 行动时间线

| 阶段 | 任务 | 形式 | 预计时间 |
|------|------|------|---------|
| **立即** | P0-1 验证 + AGENTS.md 更新 | Harness 改进 | 30min |
| **立即** | P0-2 Subagent 模板更新 | Harness 改进 | 20min |
| **今晚** | P1-1 Hook 约定 + P1-2 路径规则 | Harness 改进 | 1h |
| **今晚** | P1-3 LLM-as-Hook Skill | Skill 创建 | 1h |
| **本周** | P2-1 Agent 定义字段映射 | Harness 改进 | 1h |
| **本周** | 整理 OpenClaw Issue 列表 | 社区贡献 | 1h |
| **下周** | P2-2 成本追踪方案设计 | 设计文档 | 1h |

---

## 关键发现：OpenClaw 已有的能力

在分析过程中发现，OpenClaw 在某些方面**已经实现**了 OpenHarness 的设计：

1. ✅ **工具失败隔离**：`Promise.allSettled` 确保单个工具失败不阻塞其他
2. ✅ **流式输出**：比 OpenHarness 的非流式更优
3. ✅ **compaction + memoryFlush**：比 OpenHarness 的惰性压缩更成熟
4. ✅ **多 Provider**：比 OpenHarness 的 Anthropic 硬耦合更灵活
5. ✅ **重试机制**：指数退避重试是 OpenHarness 缺失的

这意味着我们的重点不是"补缺失"，而是"用好已有能力" + "在 Harness 层面弥补规范空白"。
