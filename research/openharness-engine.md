# OpenHarness 核心引擎层 (engine/) 技术分析

> 分析日期: 2026-04-05 | 仓库: [HKUDS/OpenHarness](https://github.com/HKUDS/OpenHarness)

## 1. 架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                      QueryEngine (门面层)                     │
│  管理会话状态、成本追踪、消息历史；对外暴露 submit_message()    │
│  和 continue_pending() 两个入口                               │
├─────────────────────────────────────────────────────────────┤
│                       run_query() (Agent Loop)               │
│  for 循环驱动的 tool-use 循环，每轮：                         │
│  auto-compact → stream LLM → 解析 tool_uses                 │
│  → 执行工具 → 追加结果 → 回到循环顶部                         │
├──────────┬──────────┬──────────┬────────────────────────────┤
│ messages │ stream_  │   cost_  │ PermissionChecker / Hooks  │
│   .py    │ events.py│ tracker  │ (外部注入的横切关注点)       │
│ 消息模型  │ 流式事件  │   .py    │                            │
│          │ 类型定义  │ 用量累加  │                            │
└──────────┴──────────┴──────────┴────────────────────────────┘
```

架构分层清晰：**query_engine.py** 是有状态的门面（Facade），**query.py** 是无状态的纯循环逻辑，**messages.py / stream_events.py** 定义数据契约，**cost_tracker.py** 是最轻量的累加器。横切关注点（权限、Hook）通过依赖注入接入，核心循环不耦合任何具体实现。

---

## 2. 文件逐一分析

### 2.1 messages.py — 消息类型定义

采用 Pydantic v2 建模，定义了三层内容块：

| 类 | 职责 | 关键设计 |
|---|---|---|
| `TextBlock` | 纯文本 | `type: Literal["text"]` 字段鉴别器 |
| `ToolUseBlock` | 模型发起的工具调用 | 自动生成 `toolu_` 前缀 ID |
| `ToolResultBlock` | 工具执行结果回传模型 | `is_error` 标志位 |
| `ConversationMessage` | 对话消息（user/assistant） | `content` 是 `ContentBlock` 联合类型列表 |

**亮点**：`ContentBlock = Annotated[TextBlock | ToolUseBlock | ToolResultBlock, Field(discriminator="type")]` 使用 Pydantic 的 discriminated union，序列化/反序列化时根据 `type` 字段自动路由，避免手写 `if-else`。

**Anthropic 偏向**：`assistant_message_from_api()` 直接消费 Anthropic SDK 对象属性（`raw_block.text`、`raw_block.type`），`to_api_param()` 输出格式也是 Anthropic wire format。说明当前对 Anthropic API 有一层硬耦合，切换 provider 需要额外适配层。

**`ConversationMessage` 上的便利方法**：
- `text` property：拼接所有 TextBlock，用于日志/展示
- `tool_uses` property：过滤 ToolUseBlock，是 Agent Loop 判断"是否需要继续循环"的关键
- `from_user_text()` 工厂方法：快速构造用户消息

### 2.2 stream_events.py — 流式事件定义

5 种不可变事件类型（`frozen=True` dataclass），通过 `StreamEvent` 类型别名组成联合类型：

```
AssistantTextDelta       → 增量文本片段（实时流式）
AssistantTurnComplete    → 单轮 LLM 调用结束（附带完整消息 + usage）
ToolExecutionStarted     → 工具开始执行（用于 UI 展示 loading）
ToolExecutionCompleted   → 工具执行结束（附带输出 + 错误标志）
ErrorEvent               → 错误通知（附带 recoverable 标志）
```

设计简洁，每个事件只携带该阶段的最小必要信息。`recoverable` 字段在 `ErrorEvent` 上暗示上层可以做重试决策，但当前 `run_query()` 里遇到错误直接 `return`，没有消费这个字段。

### 2.3 query.py — Agent Loop 核心实现

这是整个引擎最关键的文件，约 180 行。

#### 2.3.1 主循环 `run_query()`

```python
for _ in range(context.max_turns):
    # 1. Auto-compact（上下文压缩）
    # 2. 流式调用 LLM（stream_message）
    # 3. 收集完整消息，yield AssistantTurnComplete
    # 4. 判断 tool_uses：
    #    - 无工具调用 → return（正常结束）
    #    - 单工具 → 顺序执行，实时 yield 事件
    #    - 多工具 → asyncio.gather 并发执行，批量 yield 事件
    # 5. 追加工具结果到 messages，回到循环顶部
```

**关键设计决策**：

1. **无重试机制**：API 调用失败时区分网络错误和其他错误，但都直接 yield `ErrorEvent` 后 return，没有指数退避或重试。这是一个有意的设计选择——将重试策略上移到调用方（如 CLI 层或 `QueryEngine`）。

2. **并发工具执行**：多工具调用使用 `asyncio.gather` 并发执行，但单工具是顺序执行且实时流式输出。这区分了用户体验：单工具时用户能看到即时的工具执行进度，多工具时先统一开始再统一结束。

3. **Auto-compact 前置**：每轮循环开始时先检查 token 数是否超阈值，超了就压缩。这是一种"惰性压缩"策略，比在上下文窗口快满时才压缩更安全。

4. **MaxTurnsExceeded 异常**：超出最大轮次时抛异常而非 yield 错误事件，这是唯一一个会中断生成器正常流程的错误路径。

#### 2.3.2 工具执行 `_execute_tool_call()`

执行链路：**Hook 前置拦截 → 工具查找 → 输入校验 → 权限检查 → 工具执行 → Hook 后置通知**

```python
PRE_TOOL_USE hook → registry.get() → input_model.validate()
→ permission_checker.evaluate() → tool.execute() → POST_TOOL_USE hook
```

每一步失败都会返回 `ToolResultBlock(is_error=True)`，不会中断循环。这意味着**单个工具失败不影响整体流程**，模型在下一轮会看到错误信息并自行决定如何处理。

**权限检查的细微之处**：
- `evaluate()` 返回 `decision`，包含 `allowed`、`requires_confirmation`、`reason`
- 如果需要确认且提供了 `permission_prompt` 回调，会异步等待用户确认
- 没有确认回调时直接拒绝——这是一种"安全优先"的设计

### 2.4 cost_tracker.py — 成本追踪

极简实现，约 30 行：

```python
class CostTracker:
    def __init__(self): self._usage = UsageSnapshot()
    def add(self, usage): self._usage += usage  # 逐字段累加
    @property
    def total(self): return self._usage
```

只追踪 `input_tokens` 和 `output_tokens` 两个维度，不涉及金钱成本换算。`UsageSnapshot` 是一个简单的命名对象，语义清晰。

**局限**：没有持久化、没有按时间窗口聚合、没有成本估算（tokens → $）。这符合 OpenHarness "简洁优先" 的哲学，复杂的使用量分析留给上层应用。

### 2.5 query_engine.py — 高级会话引擎

`QueryEngine` 是面向使用者的门面类，管理以下状态：

| 状态 | 类型 | 说明 |
|---|---|---|
| `_messages` | `list[ConversationMessage]` | 完整对话历史 |
| `_cost_tracker` | `CostTracker` | 累计使用量 |
| `_system_prompt` | `str` | 系统提示词（可动态更新） |
| `_model` | `str` | 当前模型（可动态切换） |

**两个核心方法**：

1. **`submit_message(prompt)`**：追加用户消息 → 构建 `QueryContext` → 调用 `run_query()` → 累加 usage → yield 事件
2. **`continue_pending(max_turns)`**：不追加新用户消息，直接继续工具循环。用于"中断恢复"场景——例如工具执行超时后重新进入循环。

**`has_pending_continuation()`**：判断是否需要继续执行。逻辑是：最后一条消息是 user 角色（工具结果伪装成 user message），且之前的 assistant 消息包含 tool_uses。这个检查让调用方可以安全地恢复中断的循环。

**动态配置能力**：`set_system_prompt()`、`set_model()`、`set_max_turns()`、`set_permission_checker()` 都允许在会话中途修改配置，下一轮调用生效。这在多轮对话中非常实用——比如根据上下文动态调整 system prompt。

---

## 3. 与 OpenClaw Agent Loop 的对比

| 维度 | OpenHarness | OpenClaw |
|---|---|---|
| **语言** | Python (async/await) | TypeScript (Node.js) |
| **循环结构** | 显式 `for _ in range(max_turns)` + `yield` 生成器 | 事件驱动 + Provider 抽象层 |
| **流式事件** | 5 种 dataclass，类型别名联合 | 事件总线 / Channel 插件，事件类型更丰富 |
| **工具执行** | 单工具顺序 / 多工具 `asyncio.gather` 并发 | 单工具默认，无显式并发工具调用 |
| **错误处理** | 区分网络/非网络错误，yield 后 return；无重试 | 内置重试策略（指数退避），Provider 层统一错误处理 |
| **上下文压缩** | `auto_compact_if_needed()` 每轮前置调用，先 micro-compact 再 LLM 摘要 | Safeguard 模式 compaction，配置保留轮数 + memoryFlush |
| **权限模型** | `PermissionChecker` 依赖注入，`requires_confirmation` 回调 | 策略引擎 + `/approve` 命令 + allow-once/allow-always/deny |
| **成本追踪** | 纯 token 累加，无成本换算 | 类似 token 追踪，有更丰富的使用量分析 |
| **会话恢复** | `continue_pending()` 机制，检查中断状态 | subagent 隔离运行，主会话靠 compaction 管理 |
| **Hook 系统** | `PRE_TOOL_USE` / `POST_TOOL_USE` 两种 Hook | 事件订阅 + 插件扩展，Hook 点更多 |
| **Provider 抽象** | `SupportsStreamingMessages` Protocol，Anthropic 硬耦合 | 多 Provider 适配（Anthropic / OpenAI / Google / 本地） |
| **消息模型** | Pydantic discriminated union | TypeScript 类型系统 |

### 关键差异总结

1. **OpenHarness 更简洁**：代码量小（engine/ 总计约 500 行），API 设计干净，适合作为 SDK 或被其他项目嵌入。但缺少重试、多 Provider 适配等生产级特性。

2. **OpenClaw 更厚重**：作为完整的 agent 框架，内置了会话管理、多渠道、compaction、权限策略等生产级能力。代价是复杂度更高。

3. **OpenHarness 的并发工具执行**是一个 OpenClaw 没有的亮点——当模型同时调用多个工具时，`asyncio.gather` 能显著减少延迟。

4. **OpenClaw 的 compaction 策略更成熟**：Safeguard 模式 + memoryFlush + postCompactionSections 是多层防护；OpenHarness 的 auto-compact 是单一策略。

5. **Provider 适配**是 OpenHarness 的明显短板：当前硬耦合 Anthropic，而 OpenClaw 通过抽象层支持多 Provider。

---

## 4. 设计亮点与不足

### 亮点
- **生成器模式** (`AsyncIterator`) 实现流式输出，调用方可逐步消费事件，适合实时 UI 展示
- **工具失败的优雅降级**：单个工具失败返回错误块，不中断整体循环，让模型自行决策
- **`continue_pending()` 机制**：为中断恢复提供了干净的状态检查
- **依赖注入**：PermissionChecker、HookExecutor、permission_prompt 全部通过构造参数注入，核心循环零耦合

### 不足
- **无重试机制**：网络抖动直接失败，生产环境需要上层包装
- **Anthropic 硬耦合**：消息序列化/反序列化直接操作 Anthropic SDK 对象
- **CostTracker 过于简单**：无持久化、无成本换算、无按调用维度分析
- **ErrorEvent.recoverable 未被消费**：定义了但 `run_query()` 没用到
- **无超时控制**：工具执行没有整体超时，单个工具卡住会阻塞整个循环
