# Claw Code vs OpenClaw 深度对比分析

> 生成日期: 2026-04-12 | 基于 Claw Code 研究笔记 + OpenClaw 实际运行经验
> 标签: #claw #openclaw #coding-agent #multi-agent #rust #comparison

## 一、项目定位对比

| 维度 | Claw Code | OpenClaw |
|------|-----------|----------|
| **定位** | Coding Agent Harness（编码 agent 骨架） | 通用 AI Agent 平台（多通道路由） |
| **核心理念** | 人类给方向，多 Agent 并行协作，聊天驱动 | 持久运行的 Agent 网关，长期陪伴 |
| **语言** | Rust (9 crates, ~49K LOC) | TypeScript (Node.js v25) |
| **运行模式** | CLI REPL + tmux | systemd daemon + Gateway |
| **主要通道** | Discord (clawhip) | 飞书 / Telegram / QQ / Signal 等 |
| **项目记忆** | CLAUDE.md | AGENTS.md / SOUL.md / MEMORY.md |
| **目标用户** | 开发者（编码场景） | 个人用户（全场景） |

**一句话差异**: Claw Code 专注"让 AI 写好代码"，OpenClaw 专注"让 AI 成为你生活的数字助手"。

---

## 二、十维度深度对比

### 2.1 架构哲学

**设计差异**:
- **Claw Code** 采**三层协调**架构——oh-my-codex（工作流层）→ clawhip（事件/通知路由）→ oh-my-openagent（多 Agent 协调）。三层各司其职，强调**分离关注点**。整体设计围绕"编码工作流"展开，终端是传输层，编排状态在 tmux/TUI 之上。
- **OpenClaw** 采**网关中心化**架构——Gateway daemon 扮演消息路由、会话管理、配置热重载的中枢。事件通过 Channel 插件分发，Agent Loop 在 Gateway 内部运行。整体设计围绕"多通道长期运行"展开，daemon 化是核心特征。

**可互鉴点**:
- Claw Code 的"三层分离"思想值得 OpenClaw 参考：将当前 Gateway 承担的职责（路由 + 编排 + 通知）拆分为独立模块，提升可维护性
- OpenClaw 的 daemon 化 + systemd 集成对 Claw Code 有参考价值：Rust 的进程管理虽强，但缺少声明式服务管理的便利

### 2.2 Provider 路由

**设计差异**:
- **Claw Code** 用**模型名前缀**自动路由——`openai/*` → OpenAI, `qwen/*` → DashScope, `grok*` → xAI。配置在 `~/.claw/settings.json` 的 `aliases` 字段中支持自定义别名（如 `"fast": "claude-haiku-4-5"`）。路由逻辑完全在本地，不依赖环境变量。
- **OpenClaw** 用**统一 Provider 抽象层**——配置在 `openclaw.json` 中声明式定义，支持 Anthropic/OpenAI/Google/智谱等多 Provider。通过 Gateway 统一管理 API Key 和路由。

**可互鉴点**:
- **Claw Code 的前缀路由**更直觉——用户只需改模型名就能切换 Provider，不需要去改配置文件。OpenClaw 可以借鉴：在模型名解析层增加前缀推断，作为配置的 fallback
- **OpenClaw 的声明式 Provider 配置**更规范——Key 管理、fallback 策略、token 限制等集中管理，适合多 Key 轮换场景。Claw Code 的 aliases 功能是很好的快捷方式补充

### 2.3 事件驱动架构

**设计差异**:
- **Claw Code** 的 **clawhip** 是独立的事件/通知路由层——监听 git commits、tmux sessions、GitHub issues、agent 生命周期事件，把**监控和通知推到 agent 上下文窗口外**。这解决了编码 agent 的核心痛点：agent 不应该被 git log 或 CI 状态塞满上下文。
- **OpenClaw** 的事件系统通过 Channel 插件和内部事件总线实现，更偏**消息路由**而非**状态监控**。事件主要服务于"用户 ↔ Agent"的通信，而非"Agent ↔ 外部系统"的状态监控。

**可互鉴点**:
- **Claw Code 的"上下文窗口外通知"**是高价值设计——OpenClaw 当前把所有通知塞在消息流中，长期运行的 subagent 任务状态、定时任务结果等都占上下文。可以借鉴：将非紧急事件推到独立的 event feed，agent 按需查询
- **OpenClaw 的 cron + isolated session** 模式可以补充 Claw Code——定时任务的生命周期管理比 clawhip 更成熟

### 2.4 多 Agent 协调

**设计差异**:
- **Claw Code** 的 oh-my-openagent 定义了 **Architect → Executor → Reviewer** 三角色流水线：Architect 拆任务、Executor 编码、Reviewer 验证，有明确的**分歧解决和验证循环**。Worker 有**状态机生命期**（spawning → trust_required → ready → running → finished/failed）。
- **OpenClaw** 的 subagent 是**任务派发模式**——主 Agent spawn 隔离 session，push-based 自动回调结果。通过 `sessions_yield` 交还控制权，结果自动汇报。AGENTS.md 中定义了四要素任务模板规范。

**可互鉴点**:
- **Claw Code 的角色分工流水线**更结构化——OpenClaw 的 subagent 当前是"单角色委派"，缺少 Architect/Reviewer 的结构化协作。可以在 coding 场景中引入 Plan→Execute→Review 的三角色模式
- **Claw Code 的状态机生命期**更可观测——OpenClaw 的 subagent 缺少中间状态查询能力（只能等完成或超时），可以借鉴状态机来暴露 subagent 进度
- **OpenClaw 的四要素模板**更通用——Claw Code 的协调主要面向编码，OpenClaw 的模板适用于任何类型任务
- **OpenClaw 的 push-based 回调**更简洁——无需轮询，自然集成到主会话上下文

### 2.5 权限模型

**设计差异**:
- **Claw Code** 采用**三级权限**（read-only / workspace-write / danger-full-access），简洁明确。权限通过内置的权限执行层控制，不依赖外部审批流。
- **OpenClaw** 采用**策略式权限**——allowlist/denylist + approval 机制 + elevated permissions。支持 tool 级别和通道级别的细粒度控制。exec 操作有安全路径白名单和审批流。

**可互鉴点**:
- **Claw Code 的三级模型**更易理解和使用——OpenClaw 的权限系统功能更强但复杂度更高，对普通用户不友好。可以提供"预设模式"作为简化的入口
- **OpenClaw 的审批流 + 安全路径白名单**更安全——Claw Code 缺少路径级别的控制（如禁止 `/etc/*`），高安全要求场景下不够精细
- 两者都**缺少命令模式匹配**——OpenHarness 的 `denied_commands`（如 `rm -rf /*`, `sudo *`）是两者共同缺失的安全层

### 2.6 会话与状态管理

**设计差异**:
- **Claw Code** 的会话用 **JSONL 格式持久化**，支持 `--resume` 恢复。会话管理围绕 REPL 展开，有 `/compact`, `/cost`, `/session` 等命令。tmux session 管理作为编排层的载体。
- **OpenClaw** 的会话是**Gateway 内部管理的 session**，支持 compaction（多策略压缩）、memoryFlush（压缩前记忆提取）、postCompactionSections（压缩后关键信息重注入）。会话可以跨消息通道持久存在。

**可互鉴点**:
- **OpenClaw 的 compaction 体系**更成熟——safeguard 模式、memoryFlush、postCompactionSections 三层防护是长期运行的必需品，Claw Code 的 JSONL 持续追加模式在长期使用中会膨胀
- **Claw Code 的 `--resume`** 更直觉——用户可以显式恢复之前的会话上下文，OpenClaw 当前依赖 compaction 而非显式恢复点
- **OpenClaw 的 daemon 化会话**更无缝——用户无需手动管理会话生命周期，Gateway 自动管理

### 2.7 工具系统

**设计差异**:
- **Claw Code** 的工具是**内置实现**（bash/read/write/edit/grep/glob/search/fetch），全部在 Rust crate 中。工具数量较少但**类型安全**（Rust 编译期检查）。还集成了 LSP Client 用于代码智能。
- **OpenClaw** 的工具是**插件式 + 通道专用**——native tools + MCP adapters + channel tools（飞书日历、任务、多维表格等）。工具数量 50+，通过 SKILL.md 描述驱动的 skill 系统发现和使用。

**可互鉴点**:
- **Claw Code 的 LSP Client** 是 OpenClaw 缺失的编码能力——直接对接语言服务器提供代码导航、重构、诊断能力，比 grep/glob 更智能
- **OpenClaw 的通道专用工具**是核心差异化——飞书日历、任务、多维表格等工具让 Agent 能深度操作业务系统，Claw Code 没有类似能力
- **OpenClaw 的 MCP 支持**更开放——可以动态接入任何 MCP Server 的工具，Claw Code 的 MCP bridge 功能较基础
- **Claw Code 的 Rust 类型安全**是天然优势——编译期就能发现工具参数错误，OpenClaw 的 TypeScript + JSON Schema 需要 Zod 等辅助

### 2.8 配置体系

**设计差异**:
- **Claw Code** 的配置在 `~/.claw/settings.json`，相对扁平。支持 aliases、hooks、skills 等。配置方式偏**开发者友好**（JSON + CLI 命令）。
- **OpenClaw** 的配置在 `openclaw.json`，层次较深（gateway、channel、agent、plugin 各层）。支持环境变量覆盖、配置热重载、drop-in 覆盖。配置方式偏**运维友好**（声明式 + systemd）。

**可互鉴点**:
- **Claw Code 的配置扁平度**更易上手——新用户不需要理解复杂的配置层级。OpenClaw 可以提供 "quick-start preset" 来降低初始配置门槛
- **OpenClaw 的热重载 + drop-in** 更适合生产——不中断服务即可修改配置，Claw Code 需要重启 REPL

### 2.9 生态与扩展性

**设计差异**:
- **Claw Code** 的扩展通过 **Skills + Plugins + Hooks** 实现。Skills 通过 `/skills` 命令安装管理，Plugin 通过 `/plugin` 命令加载。支持 Hooks 做生命周期钩子。整体偏**编码生态**（git、notebook、LSP）。
- **OpenClaw** 的扩展通过 **Skills + Channel Plugins + Cron** 实现。Skills 有 SKILL.md 标准格式 + Skillhub/Clawhub 市场。Channel Plugins 提供通信通道扩展。整体偏**全场景生态**（飞书、日历、知识库、网页爬取）。

**可互鉴点**:
- **Claw Code 的 Mock Parity Harness** 是独特优势——确定性 mock 服务 + 脚本化场景测试，可以做 CI 级别的 agent 行为验证。OpenClaw 完全缺失这类测试基础设施
- **OpenClaw 的 Skillhub/Clawhub** 更成熟——有集中的 skill 市场和分发机制，Claw Code 的 skill 安装更像本地文件操作

### 2.10 适用场景

**设计差异**:
- **Claw Code** 最适合：**多人并行编码**——团队中多个 AI Agent 同时开发不同模块，人类给方向做 Review。Roadmap 明确指出目标是让 harness "clawable"（让其他 Agent 来操作）。
- **OpenClaw** 最适合：**个人全场景 Agent**——飞书沟通、日程管理、知识库操作、定时任务、网页爬取、编码辅助等全场景覆盖，7×24 daemon 化运行。

**可互鉴点**:
- 两者并非竞争关系，而是**互补定位**。Claw Code 的多 Agent 编码编排是 OpenClaw 可以增强的方向；OpenClaw 的通道深度集成是 Claw Code 不需要的
- 混合使用场景：用 OpenClaw 作为"调度大脑"，spawn Claw Code subagent 处理重型编码任务

---

## 三、综合评估

### Claw Code 的独特优势

1. **三层协调架构**——工作流层、事件层、协调层分离，模块化程度高
2. **状态机 Agent 生命期**——可观测、可调试、可自愈
3. **Mock 测试基础设施**——CI 级别的 agent 行为验证，生产级质量保障
4. **LSP 集成**——真正的代码智能，不是文本搜索
5. **Rust 类型安全**——编译期保证工具参数正确
6. **"Clawable" 愿景**——让 Agent 操作 Agent，而非让人类操作 Agent

### OpenClaw 的独特优势

1. **daemon 化长期运行**——systemd 集成、热重载、不中断服务
2. **多通道深度集成**——飞书日历/任务/知识库等通道专用工具
3. **compaction 体系**——三层防护解决长期运行的上下文膨胀
4. **语义记忆**——OpenViking 向量搜索，远超词频匹配
5. **push-based subagent**——简洁的任务派发和结果回报
6. **完善的定时任务**——cron + isolated session + light-context

---

## 四、可落地方案建议

### 建议 1：引入 Subagent 状态机 + maxTurns 硬上限 ⭐⭐⭐

**问题**: OpenClaw subagent 缺少中间状态可视化和硬上限保护，出现过 subagent 无限循环的案例。

**方案**: 
- 为 subagent 定义状态机：`pending → running → completed / failed / timeout`
- 在 `sessions_spawn` 参数中增加 `maxTurns`（默认 20）
- 暴露 `/agents status` 命令查看所有活跃 subagent 状态
- 超过 maxTurns 自动终止并返回当前产出

**工作量**: 2-3 天 | **依赖**: sessions_spawn 参数扩展

### 建议 2：实现事件 Feed（上下文窗口外通知） ⭐⭐⭐

**问题**: 定时任务结果、subagent 完成通知等事件全部塞在消息流中，占主会话上下文。

**方案**:
- 新增 `~/.openclaw/workspace/events/` 目录作为事件存储
- cron、subagent 完成、审批等事件写入事件 feed
- 提供 `/events` 命令按时间/类型查询
- 非紧急事件不再主动推入主会话，改为 agent 按需查询

**工作量**: 2-3 天 | **依赖**: 事件存储 + 查询工具

### 建议 3：Provider 前缀路由 + 别名系统 ⭐⭐

**问题**: 切换模型需要改配置文件，对频繁换模型的用户不友好。

**方案**:
- 在模型名解析层增加前缀推断：`openai:gpt-4o` → OpenAI provider, `anthropic:claude-3.5` → Anthropic provider
- 配置中支持 aliases：`{ "fast": "glm-4.7-flash", "smart": "glm-5-turbo" }`
- 前缀路由作为显式配置的 fallback，不改变现有配置优先级

**工作量**: 1-2 天 | **依赖**: 模型名解析层改造

### 建议 4：编码场景引入 Plan→Execute→Review 角色 ⭐⭐

**问题**: OpenClaw 的 subagent 在编码任务中缺少结构化的质量保障流程。

**方案**:
- 在 coding-agent skill 中定义三种角色模式
- Plan Agent: 分析需求，产出任务拆解和方案
- Execute Agent: 按方案编码，产出代码变更
- Review Agent: 验证代码，输出 VERDICT: PASS/FAIL + 证据
- 通过 subagent 串联三阶段，自动传递上下文

**工作量**: 3-5 天 | **依赖**: coding-agent skill 改造

### 建议 5：Mock 测试基础设施 ⭐

**问题**: OpenClaw 缺少 agent 行为级别的测试能力，无法做回归验证。

**方案**:
- 参考 Claw Code 的 mock-anthropic-service，开发 OpenClaw mock provider
- 用脚本化场景（JSON）定义期望的 agent 行为序列
- CI 中自动运行 mock 场景，验证核心流程不回归
- 优先覆盖：工具调用链、权限审批流、subagent 派发

**工作量**: 5-7 天 | **依赖**: mock provider + 场景定义格式

---

*本报告基于 Claw Code 研究笔记（2026-04-12）和 OpenClaw 运行经验综合分析。与已有的 OpenHarness 对比报告（`docs/openclaw-vs-openharness.md`）互补，不重叠。*
