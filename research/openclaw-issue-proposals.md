# OpenClaw Issue 提案列表

> 基于 OpenHarness 对比分析，筛选出值得向 OpenClaw 官方提交的功能建议

## Issue 1: sessions_spawn 增加 maxTurns 参数

**来源**: OpenHarness `QueryContext.max_turns`
**问题**: subagent 没有轮次上限，只能靠 `runTimeoutSeconds` 超时控制。超时不够精确——某些任务可能 5 分钟内完成 50 轮无效循环。
**建议**: 在 `sessions_spawn` 中增加 `maxTurns?: number` 参数，超过上限时终止并返回摘要。
**优先级**: P0
**复杂度**: 低（Agent Loop 中增加计数器即可）

## Issue 2: 工具并行执行优化

**来源**: OpenHarness `asyncio.gather` 并发工具执行
**现状**: OpenClaw 已有 `Promise.allSettled`，但不确定是否真正并行执行独立工具调用（需确认 Provider 层行为）。
**建议**: 确认并文档化并行工具执行行为。如果当前是串行，考虑对无依赖的工具调用启用并行。
**优先级**: P1
**复杂度**: 中（需要分析 Provider 适配层的调用链路）

## Issue 3: 路径级别权限控制（pathRules）

**来源**: OpenHarness `PermissionChecker.path_rules`
**问题**: 当前只有 tool-level 和 elevated-level 权限，没有路径级别控制。
**建议**: 在 exec 安全配置中增加 `pathRules: { allow: string[], deny: string[] }`，基于 glob 模式匹配。
**优先级**: P1
**复杂度**: 中（exec tool 中注入路径检查）

## Issue 4: 命令级别黑名单（deniedCommands）

**来源**: OpenHarness `denied_commands` pattern 匹配
**问题**: 当前只能通过 exec security=allowlist 控制命令，但 allowlist 管理成本高。
**建议**: 增加 `deniedCommands: string[]` 配置，支持 glob 模式（如 `rm -rf /*`、`sudo *`）。
**优先级**: P1
**复杂度**: 低

## Issue 5: 高危操作 LLM 验证 Hook

**来源**: OpenHarness LLM-as-Hook（prompt/agent 类型）
**问题**: 当前安全依赖 elevated 审批（人工）+ prompt 规则（软约束），没有自动化的语义验证。
**建议**: 增加可选的 `preToolUseLLMVerify` 配置，对指定工具执行前用轻量 LLM 调用验证安全。
**优先级**: P2
**复杂度**: 高（需要 Hook 事件系统支持）

## Issue 6: Subagent 任务定义增强（effort/criticalReminder）

**来源**: OpenHarness AgentDefinition 的 effort/isolation/hooks/max_turns/critical_system_reminder
**问题**: subagent spawn 只有 model/thinking/cwd 等参数，缺少思考深度和关键提醒配置。
**建议**: 增加 `effort?: "low"|"medium"|"high"` 和 `criticalReminder?: string` 参数。
**优先级**: P2
**复杂度**: 低

## Issue 7: Per-tool Token 追踪

**来源**: OpenHarness CostTracker 独立模块
**问题**: /status 只显示 session 级别 token 用量，无法看到哪个工具消耗最多。
**建议**: 增加工具级别的 token 追踪，在 /status 或 verbose 日志中输出。
**优先级**: P3
**复杂度**: 中

## Issue 8: Plan Mode 动态切换

**来源**: OpenHarness enter/exit_plan_mode
**问题**: 当前没有运行时权限模式切换机制。
**建议**: 增加 `/plan` 命令进入 plan mode（所有写操作需确认），`/unplan` 退出。
**优先级**: P3
**复杂度**: 低

---

**注**: 以上 Issue 是基于 OpenHarness 分析的提案，提交前需要：
1. 搜索 OpenClaw GitHub/Discord 确认是否已有类似 Issue
2. 补充具体的使用场景和复现步骤
3. 确认 OpenClaw 的代码贡献流程
