# OpenHarness 深度学习笔记

> 来源: https://github.com/HKUDS/OpenHarness (HKUDS, v0.1.0, 2026-04-01)
> 学习时间: 2026-04-05

## 一、项目定位

OpenHarness 是港大 HKUDS 团队开源的 **Agent Harness 参考实现**——用 Python 实现了完整的 Agent 基础设施：工具调用、技能加载、记忆管理、多 Agent 协调。

核心公式: **Agent = Model × Harness**（模型提供智能，Harness 提供双手、双眼、记忆和安全边界）

与我们之前在 GLM Coding 学到的 Harness Engineering 理论高度吻合：相同模型 + 不同 Harness = 天差地别的结果。

## 二、架构解析

### 2.1 核心循环（Agentic Loop）

```
while True:
    response = await api.stream(messages, tools)
    if response.stop_reason != "tool_use":
        break  # 模型完成
    for tool_call in response.tool_uses:
        # 权限检查 → Hook → 执行 → Hook → 结果
        result = await harness.execute_tool(tool_call)
    messages.append(tool_results)
```

模型决定做什么，Harness 决定怎么做——安全、高效、可观测。

### 2.2 源码结构（src/openharness/）

| 模块 | 功能 | 关键文件 |
|------|------|----------|
| `engine/` | 🧠 Agent Loop 核心 | `query_engine.py`, `query.py`, `cost_tracker.py` |
| `tools/` | 🔧 43 个工具 | File/Shell/Search/Web/MCP/Task/Agent |
| `skills/` | 📚 按需加载技能 | `.md` 文件，兼容 anthropics/skills |
| `plugins/` | 🔌 扩展系统 | Commands + Hooks + Agents，兼容 claude-code plugins |
| `permissions/` | 🛡️ 安全治理 | 3 级权限模式 + 路径/命令规则 |
| `hooks/` | ⚡ 生命周期 | PreToolUse / PostToolUse 事件钩子 |
| `commands/` | 💬 54 条命令 | /help, /commit, /plan, /resume... |
| `mcp/` | 🌐 MCP 协议 | Model Context Protocol 客户端 |
| `memory/` | 🧠 持久记忆 | MEMORY.md + memdir + 搜索 |
| `tasks/` | 📋 后台任务 | 创建/管理/生命周期 |
| `coordinator/` | 🤝 多 Agent | 子 Agent 派发、团队注册 |
| `prompts/` | 📝 上下文组装 | System prompt + CLAUDE.md + Environment |
| `config/` | ⚙️ 配置管理 | 多层配置 + 迁移 |
| `ui/` | 🖥️ React TUI | 后端协议 + 前端 (Ink/React) |
| `channels/` | 📡 IM 通道 | Slack/Telegram/Discord/飞书/QQ/钉钉/邮件... |
| `voice/` | 🎙️ 语音模式 | STT 流式识别 |
| `sandbox/` | 📦 沙箱执行 | Docker 沙箱适配 |
| `vim/` | ✏️ Vim 模式 | 状态转换 |
| `bridge/` | 🔗 桥接层 | 会话管理器、运行器 |
| `auth/` | 🔑 认证 | GitHub Copilot OAuth |

### 2.3 系统提示词设计

关键特征（对比 OpenClaw 的 SOUL.md）：
- **任务导向**: "You are an AI coding assistant CLI"，专注于软件工程任务
- **工具使用指导**: 明确告诉模型何时用哪个工具（read_file vs cat, edit_file vs sed）
- **安全意识**: 强调不可逆操作需要确认，列出具体的风险操作类别
- **代码风格约束**: 不添加未要求的功能、不过度抽象、信任内部代码
- **简洁风格**: "If you can say it in one sentence, don't use three"
- **环境注入**: 自动检测 OS、Shell、Git 分支、Python 版本等并注入 system prompt

**对比 OpenClaw**: OpenClaw 的 system prompt 更强调 persona（SOUL.md）、记忆体系（MEMORY.md）、飞书集成、多通道路由。OpenHarness 更偏学术参考实现，精简直接。

### 2.4 权限系统

3 级权限模式:
- `DEFAULT`: 默认，读写安全操作自动通过，危险操作需确认
- `PLAN`: 规划模式，只读操作，不做修改
- `FULL_AUTO`: 全自动，所有操作自动通过（CI/自动化场景）

### 2.5 多 Agent 协调

- 子 Agent 派发（Agent 工具）
- 团队注册表（TeamCreate/TeamDelete）
- 后台任务管理（TaskCreate/Get/List/Update/Stop/Output）
- ClawTeam 集成（Roadmap）

### 2.6 IM 通道支持

支持的通道: Slack, Telegram, Discord, 飞书 (Feishu), QQ, 钉钉 (DingTalk), WhatsApp, Matrix, Email, MoChat

通道架构: adapter → bus (事件队列) → impl (具体平台实现) → manager

## 三、与 OpenClaw 的对比

| 维度 | OpenClaw | OpenHarness |
|------|----------|-------------|
| **语言** | Node.js/TypeScript | Python |
| **定位** | 生产级 Agent 平台 | 学术参考实现 + 教学工具 |
| **通道** | 飞书/Telegram/QQ/Discord 等 | 更多（+钉钉/WhatsApp/Matrix/Email） |
| **Skill 系统** | 成熟的 SKILL.md 生态 | 兼容 anthropics/skills |
| **插件** | 有限 | 兼容 claude-code plugins |
| **记忆** | MEMORY.md + OpenViking + memoryFlush + compaction | MEMORY.md + memdir + 搜索 |
| **TUI** | 无（通过 IM 交互） | React TUI (Ink) |
| **安全** | SAFETY.md + 权限系统 | 3 级权限 + 路径规则 + Hooks |
| **MCP** | 完整支持 | 完整支持 |
| **多 Agent** | sessions_spawn + subagents | coordinator + swarm |
| **部署** | systemd daemon | CLI 单命令 |
| **Provider** | 智谱/Anthropic/OpenAI 等 | Anthropic/OpenAI/GitHub Copilot/任意兼容 |

## 四、值得学习的设计

### 4.1 ⭐ 对我们最有价值的

1. **System Prompt 工程化**: OpenHarness 把 system prompt 拆成 base + environment + CLAUDE.md，清晰分层。值得借鉴到我们的 SOUL.md + AGENTS.md + USER.md 体系。

2. **Tool 使用指导内化**: 直接在 system prompt 中告诉模型"用 read_file 而不是 cat"，减少模型犯错。OpenClaw 的 TOOLS.md 有类似思路但没这么显式。

3. **事件驱动 Hook 系统**: PreToolUse / PostToolUse 钩子模式，可以拦截、修改、审计工具调用。比 OpenClaw 的 hooks 更标准化。

4. **React TUI**: 用 Ink (React for CLI) 做终端 UI，包括对话视图、工具调用展示、Swarm 面板、Todo 面板。这是一个很好的交互方向。

5. **CLAUDE.md 兼容**: OpenHarness 直接兼容 Claude Code 的 CLAUDE.md 发现和注入机制，降低用户迁移成本。

### 4.2 ⚡ 可以直接借鉴的代码模式

1. **QueryEngine 的 submit/continue 分离**: `submit_message()` 新消息, `continue_pending()` 断点续跑。比单入口更灵活。

2. **CostTracker 独立模块**: token 用量和成本独立追踪，每次 query 回传 usage。

3. **Memory 的 YAML frontmatter 解析**: Skills 和记忆条目支持 name/description/type 元数据，比纯文本搜索更精确。

4. **Plugin 生命周期**: install → enable → disable → uninstall，有完整的状态管理。

## 五、对我们的启发

### 5.1 Harness 建设方向（按优先级）

1. **Hook 标准化** (P1): 借鉴 OpenHarness 的 PreToolUse/PostToolUse 模式，标准化 OpenClaw 的 hook 机制
2. **System Prompt 分层优化** (P1): 借鉴工具使用指导内化，优化 AGENTS.md 的工具使用章节
3. **成本追踪增强** (P2): 参考 CostTracker，增强 OpenClaw 的 token/cost 可观测性
4. **CLAUDE.md 兼容层** (P3): 为 OpenClaw 添加 CLAUDE.md 发现阶段，方便从 Claude Code 迁移的用户

### 5.2 研究价值

- OpenHarness 是 Harness Engineering 理论的**开源参考实现**
- 4.6k stars，5 天内，说明社区对 Harness 概念有强烈需求
- 可以作为我们理解 Agent 架构的"教科书"级别项目

## 六、关键链接

- GitHub: https://github.com/HKUDS/OpenHarness
- Star: 4.6k (截至 2026-04-05)
- License: (需确认)
- 版本: v0.1.0 (2026-04-01)
