# Claw Code 学习笔记

> 日期: 2026-04-12
> 仓库: https://github.com/ultraworkers/claw-code
> 标签: #rust #coding-agent #multi-agent #claw

## 一句话概述

Claw Code 是一个用 Rust 编写的 CLI coding agent harness（类似 Claude Code），核心特点是**多 Agent 自主协调开发**——人类给方向，多个 coding agent 并行协作，通过 Discord 等聊天接口驱动，而非终端微操。

## 项目定位

- **不是** 一个代码编辑器或 IDE 插件
- **是** 一个 agent harness——提供 CLI REPL、工具系统、权限管理、会话持久化、MCP 生命周期、子 Agent 编排等能力
- 真正的产品是**协调系统**，不是代码本身

## 架构组成

### 核心 CLI (rust/)
- 入口 binary: `claw`（debug build 在 `rust/target/debug/claw`）
- 9 个 Rust crates，48,599 LOC（截至 2026-04-03 checkpoint）
- 关键 crate:
  - `rusty-claude-cli` — CLI 入口、REPL、权限系统
  - `runtime` — bash 执行、文件操作、沙箱、任务注册、team/cron、MCP bridge、LSP client、权限执行
  - `tools` — 工具实现层（bash/read/write/edit/grep/glob）
  - `mock-anthropic-service` — 确定性 Anthropic 兼容 mock 服务

### 三层协调系统（PHILOSOPHY.md）
1. **oh-my-codex** — 工作流层：将短指令转化为结构化执行（规划关键词、执行模式、验证循环、并行多 Agent）
2. **clawhip** — 事件/通知路由：监听 git commits、tmux sessions、GitHub issues、agent 生命周期，把监控和通知推到 agent 上下文窗口外
3. **oh-my-openagent** — 多 Agent 协调：Architect/Executor/Reviewer 三角色，规划→交接→分歧解决→验证循环

## 核心能力（✅ 已实现）

| 能力 | 说明 |
|------|------|
| 多 Provider | Anthropic / OpenAI-compatible / xAI / DashScope，按 model 前缀自动路由 |
| 权限系统 | read-only / workspace-write / danger-full-access 三级 |
| 会话持久化 | JSONL 格式，支持 `--resume` |
| 工具系统 | bash, read, write, edit, grep, glob, search, fetch |
| 子 Agent | /subagent 命令，支持并行 Agent 编排 |
| MCP 生命周期 | MCP server 管理 + inspection |
| Git 集成 | /diff, /commit, /pr, /issue |
| Skills 系统 | /skills 安装和管理 |
| Hooks | 配置驱动的生命周期钩子 |
| Plugin 管理 | /plugin 命令 |
| Notebook 编辑 | Jupyter notebook 支持 |
| CLAUDE.md | 项目记忆（类比 OpenClaw 的 AGENTS.md/SOUL.md） |
| Mock 测试 | 确定性 mock 服务 + 10 个脚本化场景 |

## Provider 路由机制（值得学习）

```
模型名前缀 → 自动选择 Provider，不受环境变量干扰
- openai/*, gpt-* → OpenAI-compatible
- qwen/*, qwen-* → DashScope（自动推到 compatible-mode endpoint）
- grok* → xAI
- 其他 → 按环境变量兜底
```

模型别名可自定义在 `~/.claw/settings.json`：
```json
{ "aliases": { "fast": "claude-haiku-4-5", "smart": "claude-opus-4-6" } }
```

## CLI 命令体系

顶层命令: `prompt`, `help`, `version`, `status`, `sandbox`, `agents`, `mcp`, `skills`, `system-prompt`, `init`

REPL 斜杠命令分类:
- 会话: /status, /compact, /cost, /resume, /clear, /session, /version, /usage, /stats
- 工作区: /config, /memory, /init, /diff, /commit, /pr, /issue, /export, /hooks, /files
- 发现: /mcp, /agents, /skills, /doctor, /tasks, /context, /desktop
- 自动化: /review, /advisor, /subagent, /team, /providers

## Roadmap 核心方向

把 harness 变得 **"clawable"**——让其他 Agent（而非人类）来操作：

1. **状态机优先** — 每个 worker 有明确的生命周期状态（spawning → trust_required → ready → running → finished/failed）
2. **事件优于日志** — 从结构化事件派生输出，而非从终端文本推断
3. **自愈优先于升级** — 已知失败模式先自动恢复一次再求助
4. **分支新鲜度优先于归咎** — 测红前先检查是否缺 main 的已合并修复
5. **终端是传输层** — 编排状态必须在 tmux/TUI 之上

## 与 OpenClaw 的对比

| 维度 | Claw Code | OpenClaw |
|------|-----------|----------|
| 语言 | Rust | Node.js |
| 定位 | Coding agent harness | 通用 agent 框架 |
| 多 Agent | oh-my-openagent (Architect/Executor/Reviewer) | subagent spawn + session |
| 消息通道 | Discord (clawhip) | 飞书/Telegram/Signal 等 |
| 工具系统 | 内置 (bash/read/write/grep) | 插件式 + MCP |
| 项目记忆 | CLAUDE.md | AGENTS.md/SOUL.md/MEMORY.md |
| 权限 | 3 级 (read-only/write/full) | 策略式 (allowlist/deny) |
| Provider | 4 后端 + 前缀路由 | 统一 provider 抽象 |

## 可借鉴的点

1. **Provider 前缀路由** — model 名前缀自动选 provider，避免环境变量混乱
2. **Mock Parity Harness** — 确定性 mock + 脚本化场景，做 CI 验证
3. **事件优先** — clawhip 把通知推到 agent 上下文外，保持 agent 专注编码
4. **状态机生命期** — 明确的状态转换而非隐式推断
5. **9-lane 并行开发** — 功能按 lane 独立开发合并，PARITY.md 跟踪进度
