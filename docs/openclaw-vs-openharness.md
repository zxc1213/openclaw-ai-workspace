# OpenClaw vs OpenHarness 对比分析

> 生成日期: 2026-04-05 | 分析基于 OpenHarness main 分支 (commit e07d21d) 源码

## 一、概览

### 项目定位

| 维度 | OpenClaw | OpenHarness |
|------|----------|-------------|
| **定位** | 生产级 Agent 平台 | 学术参考实现 / SDK |
| **核心理念** | 多通道路由、daemon 化、长期运行 | Agent = Model × Harness，精简可嵌入 |
| **语言** | TypeScript (Node.js v25) | Python (async/await) |
| **运行模式** | systemd daemon + Gateway 路由 | CLI 单命令 + 事件总线 |
| **配置** | openclaw.json + 环境变量 | settings.json + 环境变量 |
| **Provider** | 多 Provider 适配 (Anthropic/OpenAI/Google/本地) | Anthropic 硬耦合 |
| **社区** | 私有项目，生产使用中 | 港大 HKUDS，4.6k stars，MIT |
| **生态兼容** | 自有 Skill/Plugin 格式 | Claude Code 双兼容 (.claude/skills + plugin.json) |

### 技术栈对比

```
OpenClaw                          OpenHarness
┌──────────────────────┐         ┌──────────────────────┐
│ Gateway (daemon)      │         │ CLI + Event Bus       │
│ ├─ Channel Plugins    │         │ ├─ MessageBus (Queue)  │
│ ├─ Session Manager    │         │ ├─ ChannelBridge       │
│ └─ Config Hot-Reload  │         │ └─ ChannelManager     │
├──────────────────────┤         ├──────────────────────┤
│ Agent Loop (Provider) │         │ QueryEngine → run_query│
│ ├─ Multi-Provider     │         │ ├─ Anthropic SDK       │
│ ├─ Compaction         │         │ └─ Auto-compact        │
│ └─ Retry (exponential)│         │ └─ No retry            │
├──────────────────────┤         ├──────────────────────┤
│ Tool System           │         │ ToolRegistry          │
│ ├─ Native Tools       │         │ ├─ 39 内置 + MCP       │
│ ├─ MCP Adapters       │         │ ├─ McpToolAdapter      │
│ └─ Channel Tools      │         │ └─ Pydantic Schema     │
├──────────────────────┤         ├──────────────────────┤
│ Memory                │         │ Memory (文件系统)      │
│ ├─ File + OpenViking  │         │ ├─ Markdown + frontmatter│
│ └─ Semantic Search    │         │ └─ 词频匹配            │
├──────────────────────┤         ├──────────────────────┤
│ Extensibility         │         │ Hooks + Permissions   │
│ ├─ Skills (SKILL.md)  │         │ ├─ 4 Hook 类型         │
│ ├─ Plugins (channel)  │         │ ├─ 3 Permission 模式   │
│ └─ Skillhub/Clawhub   │         │ └─ Plugin (plugin.json)│
└──────────────────────┘         └──────────────────────┘
```

---

## 二、架构对比

### 2.1 Engine — Agent Loop

| 维度 | OpenClaw | OpenHarness |
|------|----------|-------------|
| **循环结构** | 事件驱动 + Provider 抽象层 | 显式 `for _ in range(max_turns)` + `yield` 生成器 |
| **流式事件** | 事件总线 / Channel 插件，类型丰富 | 5 种 dataclass (TextDelta/TurnComplete/ToolStart/ToolEnd/Error) |
| **工具执行** | 单工具顺序执行，无显式并发 | 单工具顺序 / 多工具 `asyncio.gather` 并发 |
| **错误处理** | 内置指数退避重试，Provider 统一错误 | 区分网络/非网络错误，yield 后 return，无重试 |
| **上下文压缩** | Safeguard 模式 + memoryFlush + postCompactionSections | `auto_compact_if_needed()` 每轮前置，惰性压缩 |
| **会话恢复** | subagent 隔离运行，主会话靠 compaction | `continue_pending()` 机制，检查中断状态 |
| **成本追踪** | token 追踪 + 使用量分析 | 纯 token 累加（~30 行），无成本换算 |
| **Provider 抽象** | 多 Provider 适配层 | `SupportsStreamingMessages` Protocol，Anthropic 硬耦合 |
| **消息模型** | TypeScript 类型系统 | Pydantic v2 discriminated union |

**关键差异**:

- **OpenHarness 的并发工具执行**是 OpenClaw 不具备的——当模型同时调用多个工具时，`asyncio.gather` 能显著减少延迟
- **OpenClaw 的 compaction 更成熟**：多层防护 vs 单一策略
- **OpenHarness 的 `continue_pending()`** 为中断恢复提供干净的状态检查，概念简洁

### 2.2 Memory

| 维度 | OpenClaw | OpenHarness |
|------|----------|-------------|
| **存储** | 文件系统 + OpenViking 语义记忆 | 纯文件系统，per-project 隔离目录 |
| **格式** | Markdown + MEMORY.md 索引 | Markdown + YAML frontmatter + MEMORY.md |
| **搜索** | `memory_search` 语义搜索 + `memory_recall` OpenViking 向量嵌入 | 纯启发式词频匹配，中文逐字拆分（无分词器） |
| **熵管理** | Compaction + memoryFlush + identifierPolicy | 无显式熵管理（纯追加） |
| **注入方式** | system prompt + 工具调用 | system prompt 段落（`memdir.py`） |
| **项目隔离** | 无显式隔离 | SHA1 哈希隔离目录 |
| **中文支持** | OpenViking 后端处理（嵌入向量） | CJK 逐字 token，无法匹配多字词组 |

**关键差异**: OpenClaw 的语义搜索质量远高于 OpenHarness 的词频匹配。OpenHarness 的 per-project 隔离是一个好概念，但搜索质量是致命短板。

### 2.3 Coordinator / 多 Agent

| 维度 | OpenClaw | OpenHarness |
|------|----------|-------------|
| **模式** | 原生 subagent spawn | 环境变量 `COORDINATOR_MODE` 切换 |
| **Agent 定义** | JSON 配置（较简洁） | Pydantic 模型，~25 个字段 |
| **内置 Agent** | 依赖 skill 系统 | 6 个预定义 (Explore/Plan/Verify/Guide/Statusline/General) |
| **通知协议** | push-based 自动回调 | XML `<task-notification>` 格式 |
| **工具限制** | tool policy 过滤 | 显式白名单 + 黑名单 |
| **权限模式** | approve/allow-once/allow-always/deny | 5 种 (default/acceptEdits/bypassPermissions/plan/dontAsk) |
| **隔离** | isolated session | worktree / remote |
| **Worker 通信** | sessions_yield + 自动回调 | send_message 工具 |
| **Agent 元数据** | session label | effort/isolation/hooks/max_turns/scratchpad/color |
| **团队** | 无显式概念 | TeamRegistry 内存注册 |

**关键差异**: OpenHarness 的 Agent 定义更精细（`effort` 思考强度、`isolation` 隔离模式、`max_turns` 上限），内置的 Verification Agent (VERDICT: PASS/FAIL) 是实用的质量门禁模板。OpenClaw 的 push-based 通信更优雅。

### 2.4 Channels

| 维度 | OpenClaw | OpenHarness |
|------|----------|-------------|
| **架构** | 插件系统 + Gateway 内部路由 | 适配器模式 + asyncio.Queue 事件总线 |
| **支持通道** | 飞书 / Telegram / QQ / 等 | 10 个 (Telegram/Discord/Slack/飞书/QQ/钉钉/WhatsApp/Matrix/Email/Mochat) |
| **消息总线** | Gateway 内部路由 | 双队列 (inbound/outbound) |
| **流式输出** | 支持 | 不支持（拼接后发送） |
| **飞书实现** | 独立插件 `openclaw-lark` (~深度集成) | ~700 行，WebSocket 长连接，Markdown→卡片转换 |
| **格式智能** | 类似的格式适配 | 自动检测 text/post/interactive + 多表格拆分 |
| **权限** | 内置权限系统 | `allow_from` 配置 |

**关键差异**: OpenHarness 的通道架构更「学术化」（四层分离、松耦合），OpenClaw 更「工程化」（流式输出、深度集成）。OpenHarness 的飞书卡片 Markdown 转换（自动选择格式 + 多表格拆分）是值得参考的用户体验优化。

### 2.5 Tools

| 维度 | OpenClaw | OpenHarness |
|------|----------|-------------|
| **架构** | 工具函数 + Channel Tools | ABC + Pydantic + Registry |
| **内置工具** | ~50+ (含通道专用工具) | 39 + N 个动态 MCP |
| **Schema 生成** | 手动 JSON Schema | Pydantic `model_json_schema()` 自动生成 |
| **输入验证** | Provider 层验证 | Pydantic v2 声明式验证（ge/le/Literal/validator） |
| **MCP 适配** | 内置 MCP tools 配置 | `McpToolAdapter` 零代码适配 + `pydantic.create_model()` 动态生成 |
| **读写分离** | 配置控制 | `is_read_only()` 方法钩子 |
| **双引擎** | 无 | ripgrep → Python fallback |
| **代码智能** | 无内置 | LspTool (Python LSP) |

**关键差异**: OpenHarness 的 Pydantic 驱动自描述 Schema 是设计亮点——零手工维护，自动生成 API Schema。MCP 适配的 `pydantic.create_model()` 动态生成也是干净的设计。

### 2.6 Hooks

| 维度 | OpenClaw | OpenHarness |
|------|----------|-------------|
| **事件类型** | 通过 channel plugins 和 cron 间接实现 | 4 种 (session_start/end, pre/post_tool_use) |
| **Hook 类型** | command + script | command / prompt / http / agent |
| **LLM-as-Hook** | 无 | ✅ prompt (快速 LLM 验证) + agent (深度 LLM 推理) |
| **匹配器** | channel/trigger 配置 | fnmatch glob matcher |
| **热重载** | 自动热重载配置变更 | 文件 mtime 检测（仅 settings hooks） |
| **结果聚合** | 无显式模型 | `AggregatedHookResult`（任一 blocked 则整体阻断） |
| **环境变量注入** | 无 | `$ARGUMENTS` + `$OPENHARNESS_HOOK_EVENT` |

**关键差异**: **LLM-as-Hook 是 OpenHarness 最独特的创新**——用 LLM 验证 LLM 的行为，实现语义级别的安全控制。OpenClaw 没有类似能力。

### 2.7 Permissions

| 维度 | OpenClaw | OpenHarness |
|------|----------|-------------|
| **模式** | allowlist/denylist + approval 机制 | 3 级 (default/plan/full_auto) |
| **粒度** | tool + elevated permissions | tool + path + command |
| **路径控制** | 无 | glob path_rules (allow/deny) |
| **命令控制** | 无 | denied_commands pattern 匹配 |
| **优先级链** | 简单 deny 优先 | denied_tools > allowed_tools > path_rules > denied_commands > mode |
| **动态切换** | 无 | enter_plan_mode / exit_plan_mode 工具 |

**关键差异**: OpenHarness 的路径级别权限控制和命令级别黑名单是 OpenClaw 缺失的安全层。多级优先级链保证了无论 mode 如何，显式黑名单始终生效。

### 2.8 Skills & Plugins

| 维度 | OpenClaw | OpenHarness |
|------|----------|-------------|
| **Skill 格式** | SKILL.md + YAML frontmatter + references/ | 同上（兼容） |
| **发现路径** | 系统安装 → workspace → 通道级 | bundled → user → plugin |
| **覆盖策略** | description 匹配选择 | 同名覆盖 (Plugin > User > Bundled) |
| **搜索** | 模糊搜索 | 精确名称匹配（无模糊） |
| **安装** | Skillhub/Clawhub 内置市场 | 本地复制 (shutil)，无远程安装 |
| **Plugin 格式** | channel plugins 配置 | plugin.json manifest（Claude Code 兼容） |
| **Plugin 能力** | 通信渠道扩展 | 同时贡献 Skills + Hooks + MCP Servers |
| **Claude Code 兼容** | 部分（skill 格式兼容） | 高（.claude/skills + .claude-plugin 双兼容） |

**关键差异**: OpenHarness 的 Plugin 是一等容器——一个 plugin 可以同时贡献 skills、hooks 和 MCP servers，形成完整的扩展包。Claude Code 双兼容降低了生态迁移门槛。

---

## 三、可借鉴设计

按 ROI（投入产出比）从高到低排序。

### 3.1 🔴 并发工具执行（ROI: ★★★★★）

**是什么**: OpenHarness 在 `run_query()` 中检测到多工具调用时，使用 `asyncio.gather` 并发执行；单工具时保持顺序执行以保证流式体验。

**怎么借鉴**: 在 OpenClaw 的 Agent Loop 中，当 Provider 返回多个 tool_use 时，用 `Promise.all` 并行执行独立的工具调用。需要：①识别无依赖的工具调用组 ②并行执行 ③按顺序或批量返回结果。

**预期收益**: 当模型需要同时读文件、搜索、查日历等操作时，延迟从串行累加降为最慢单次调用的耗时。典型场景下减少 40-70% 等待时间。

### 3.2 🔴 LLM-as-Hook 语义验证（ROI: ★★★★☆）

**是什么**: OpenHarness 支持在工具调用前用 LLM 验证行为意图——`prompt` 类型快速二元判断（512 tokens），`agent` 类型深度推理（含 "Be more thorough" 的 system prompt）。

**怎么借鉴**: 在 OpenClaw 的工具执行链路中，新增可选的 `preToolUseLLMVerify` 阶段。对高风险工具（exec、write、message send）启用轻量 LLM 验证，prompt 模板类似 "Review this tool call for safety violations. Reply with ALLOW or DENY and reason."

**预期收益**: 在全自动模式下增加语义级安全网，捕获规则引擎无法覆盖的风险（如"删除生产数据库"的变体表达）。代价是每次高风险调用增加 ~1s 延迟和 ~500 tokens 成本。

### 3.3 🟡 路径级别权限控制（ROI: ★★★★☆）

**是什么**: OpenHarness 的 `PermissionChecker` 支持基于 glob 模式的路径规则（`/etc/**` deny, `/home/user/project/**` allow），以及命令级别黑名单（`rm -rf /*`, `sudo *`）。

**怎么借鉴**: 在 OpenClaw 的权限系统中增加 `pathRules` 和 `deniedCommands` 配置。在 exec 和文件工具中注入路径检查逻辑。

**预期收益**: 弥补 OpenClaw 当前只有 tool-level 和 elevated 级权限的空白。实现真正的"项目沙箱"——禁止访问 `/etc`、`~/.ssh` 等敏感路径，阻止 `rm -rf`、`sudo` 等危险命令模式。

### 3.4 🟡 Agent 定义的精细化字段（ROI: ★★★★☆）

**是什么**: OpenHarness 的 `AgentDefinition` 包含 25+ 字段，其中几个对 OpenClaw subagent 有直接价值：
- `effort`: 思考强度 (low/medium/high) → 对应 reasoning mode
- `max_turns`: Agent 循环上限 → 防止无限循环
- `isolation`: worktree/remote → 比 isolated session 更精细
- `scratchpad`: 跨 Worker 共享临时目录
- `critical_system_reminder`: 每轮重注入的关键提醒

**怎么借鉴**: 扩展 OpenClaw subagent 的 spawn 配置，增加 `maxTurns`（硬上限）和 `criticalReminder`（每轮注入的上下文）。scratchpad 概念可以通过共享 workspace 目录实现。

**预期收益**: `max_turns` 直接解决 subagent 无限循环问题；`criticalReminder` 确保 subagent 在长运行任务中不偏离目标。

### 3.5 🟡 Verification Agent 结构化输出（ROI: ★★★☆☆）

**是什么**: OpenHarness 内置的 Verification Agent 强制对抗性测试，输出 `VERDICT: PASS/FAIL/PARTIAL` 格式，必须包含命令运行证据。

**怎么借鉴**: 在 OpenClaw 的 coding-agent skill 中增加 verification 模式。PR review subagent 输出结构化的 VERDICT + evidence。集成到 CI 流程中。

**预期收益**: 代码审查结果可机器解析，直接用于质量门禁。降低 "AI 审查流于形式" 的风险。

### 3.6 🟢 Pydantic 式自描述 Tool Schema（ROI: ★★★☆☆）

**是什么**: OpenHarness 每个工具的 `input_model` 是 Pydantic BaseModel，调用 `model_json_schema()` 自动生成 API Schema，零手工维护。

**怎么借鉴**: OpenClaw 已是 TypeScript，可以用 Zod schema 替代手写 JSON Schema。定义 `z.object({command: z.string().describe("..."), timeout: z.number().min(1).max(600)})` 后自动生成工具定义。

**预期收益**: 消除手写 Schema 与实现不一致的 bug。新增工具时少写 ~30 行模板代码。TypeScript + Zod 是天然搭配。

### 3.7 🟢 飞书卡片 Markdown 智能转换（ROI: ★★★☆☆）

**是什么**: OpenHarness 的 FeishuChannel 根据内容特征自动选择 text/post/interactive 格式：短文本用 text、含链接用 post、含代码块/表格用 interactive，多表格自动拆分为多张卡片。

**怎么借鉴**: 在 OpenClaw 的飞书通道插件中实现类似的格式检测逻辑。检查回复内容是否包含 Markdown 表格、代码块、标题、链接等特征，选择最优格式。

**预期收益**: 飞书用户看到更好的排版效果，减少"一坨纯文本"的体验问题。

### 3.8 🟢 Plan Mode 动态切换（ROI: ★★☆☆☆）

**是什么**: OpenHarness 提供 `enter_plan_mode` / `exit_plan_mode` 工具，运行时切换权限模式。Plan 模式下所有写操作被阻断。

**怎么借鉴**: 在 OpenClaw 中增加 "plan mode" 切换命令。进入后 exec/write 等变更操作自动标记为需要确认。

**预期收益**: 在架构讨论、方案评审等场景下，防止 Agent 意外修改文件。实现成本低。

---

## 四、不适合借鉴的设计

### 4.1 Anthropic 硬耦合

OpenHarness 的消息模型、API 调用、Schema 生成全部绑定 Anthropic SDK。切换 Provider 需要重写大量代码。**OpenClaw 的多 Provider 抽象是正确方向**，不应回退。

### 4.2 纯词频 Memory 搜索

OpenHarness 的 Memory 搜索使用纯启发式词频匹配，中文只能逐字拆分，无法匹配"机器学习"这类多字词。**OpenViking 的语义向量搜索质量远高于此**，没有任何理由退化。

### 4.3 XML 通知协议

Coordinator 使用 XML `<task-notification>` 封装 Worker 结果，需要手动解析。**OpenClaw 的 push-based 自动回调更现代**，结构化数据传递比 XML 解析更可靠。

### 4.4 无重试机制

OpenHarness 的 Agent Loop 遇到 API 错误直接 yield ErrorEvent 后 return。生产环境中网络抖动是常态，**OpenClaw 的指数退避重试是必需品**。

### 4.5 事件总线非流式

ChannelBridge 收集完整文本后才发送到通道，不支持流式输出。在 IM 场景下，用户需要等待完整生成才能看到回复。**OpenClaw 的流式输出是核心体验**，不能退化。

### 4.6 无显式熵管理

OpenHarness 的 Memory 系统采用"纯追加"模式，无自动淘汰、压缩或重要性衰减。长期运行必然膨胀。**OpenClaw 的 compaction + memoryFlush 是长期运行的必需品**。

### 4.7 Base64URL 无加密认证

Bridge 的 WorkSecret 仅做 Base64URL 编码，无加密、无签名。**OpenClaw 的 Gateway token + TLS 是生产级安全**。

---

## 五、总结与行动建议

### 核心判断

OpenHarness 是一个优秀的学术参考实现——代码清晰、模块化强、设计决策有明确的取舍理由。它的核心价值不在于"可以直接用"，而在于**展示了 Harness Engineering 理论的可行实现路径**。

两者的关系不是竞争，而是**互补**：
- OpenHarness 提供**干净的设计模式**（并发工具、LLM-Hook、路径权限、精细 Agent 定义）
- OpenClaw 提供**生产级工程能力**（多 Provider、流式输出、compaction、daemon 化、语义记忆）

### 优先行动建议

| 优先级 | 行动项 | 预计工作量 | 依赖 |
|--------|--------|-----------|------|
| **P0** | 并发工具执行（Promise.all 独立工具调用） | 2-3 天 | Agent Loop 改造 |
| **P0** | Subagent maxTurns 硬上限 | 0.5 天 | sessions_spawn 参数扩展 |
| **P1** | 路径级别权限 + 命令黑名单 | 1-2 天 | 权限系统扩展 |
| **P1** | 高危工具 LLM 验证 hook | 2-3 天 | 新增 hook 阶段 |
| **P2** | 飞书格式智能检测 | 1 天 | openclaw-lark 插件 |
| **P2** | Verification Agent 结构化输出 | 1-2 天 | coding-agent skill |
| **P3** | Plan Mode 动态切换 | 0.5 天 | 权限模式扩展 |
| **P3** | Zod Tool Schema 自动生成 | 3-5 天 | 工具系统重构 |

### 长期观察

1. **OpenHarness 的 Claude Code 兼容策略**值得关注——如果 Claude Code 生态持续增长，双兼容能力会成为重要的差异化优势
2. **MCP 生态**正在快速发展，OpenHarness 的 `McpToolAdapter` 模式（零代码适配 + 命名空间隔离）是好的参考
3. **LLM-as-Hook** 的成本效益需要实测——如果 512 tokens 的快速验证能捕获 80% 的高风险操作，性价比很高

---

*本报告基于四篇子模块分析的合成，不是简单拼接。对比视角按子系统组织，可借鉴项按 ROI 排序。*
