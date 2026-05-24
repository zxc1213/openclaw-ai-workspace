# OpenHarness 基础设施深度分析

> 仓库: https://github.com/HKUDS/OpenHarness (Python)
> 分析日期: 2026-04-05
> 聚焦子系统: Memory / Coordinator / Channels / Bridge

---

## 1. Memory 系统

### 1.1 架构概览

```
openharness/memory/
├── paths.py       # 路径计算（项目隔离）
├── types.py       # MemoryHeader 数据模型
├── scan.py        # 文件扫描 + YAML frontmatter 解析
├── search.py      # 启发式搜索（含中文支持）
├── manager.py     # CRUD 操作
└── memdir.py      # 系统提示词构建
```

存储模型：**纯 Markdown 文件**，使用文件系统做持久化，无数据库依赖。

### 1.2 存储格式

**路径隔离**：每个项目通过 `sha1(project_path)[:12]` 生成唯一哈希，存储在 `{data_dir}/memory/{project_name}-{hash}/` 下。

```python
# paths.py
def get_project_memory_dir(cwd):
    digest = sha1(str(path).encode()).hexdigest()[:12]
    return get_data_dir() / "memory" / f"{path.name}-{digest}"
```

**文件格式**：Markdown + 可选 YAML frontmatter

```markdown
---
name: 项目偏好
description: 用户的编码风格偏好
type: preference
---
正文内容...
```

**索引文件**：`MEMORY.md` 作为入口，包含指向各记忆文件的链接列表：
```markdown
# Memory Index
- [项目偏好](preferences.md)
- [架构决策](arch-decisions.md)
```

### 1.3 搜索算法与中文支持

搜索采用**纯启发式词频匹配**（无向量数据库/嵌入），核心在 `search.py`：

```python
def _tokenize(text: str) -> set[str]:
    # ASCII 词元（≥3字符）
    ascii_tokens = {t for t in re.findall(r"[A-Za-z0-9_]+", text.lower()) if len(t) >= 3}
    # 汉字：每个字符独立作为 token
    han_chars = set(re.findall(r"[\u4e00-\u9fff\u3400-\u4dbf]", text))
    return ascii_tokens | han_chars
```

**中文处理机制**：
- CJK 基本区 (`\u4e00-\u9fff`) + 扩展A区 (`\u3400-\u4dbf`) 的每个汉字被视为独立 token
- 这是因为中文没有空格分词，且 OpenHarness 没有集成 jieba 等分词器
- **优势**：无需外部依赖，简单直接
- **劣势**：无法匹配多字词组（如「机器学习」会被拆成「机」「器」「学」「习」四个独立 token，搜索「机器学习」时需要全部匹配才得分）

**评分权重**：
- 元数据匹配（title + description）× 2.0
- 正文匹配（body_preview）× 1.0
- 按时间降序排同分项（`modified_at`）

**性能参数**：默认最多扫描 100 个文件，返回 top 5。

### 1.4 熵管理

OpenHarness **没有显式的熵管理机制**。记忆文件采用"追加为主"模式：
- `scan_memory_files()` 跳过 `MEMORY.md` 本身，仅扫描个体记忆文件
- `body_preview` 截取 300 字符，`description` 截取 200 字符
- 无自动淘汰、压缩、或重要性评分衰减

### 1.5 系统提示词注入

`memdir.py` 的 `load_memory_prompt()` 在启动时构建记忆上下文段落，包含：
- 持久化目录路径提示
- MEMORY.md 索引内容（最多 200 行）

这段文本被注入到 system prompt 中，作为 Agent 的"长期记忆"入口。

---

## 2. Coordinator 系统

### 2.1 架构概览

```
openharness/coordinator/
├── coordinator_mode.py   # 模式检测 + 编排逻辑 + XML 通知协议
└── agent_definitions.py  # Agent 定义模型 + 内置 Agent 库
```

### 2.2 多 Agent 协调流程

**模式切换**：通过环境变量 `CLAUDE_CODE_COORDINATOR_MODE` 控制，非配置文件。

```python
def is_coordinator_mode() -> bool:
    return os.environ.get("CLAUDE_CODE_COORDINATOR_MODE", "").lower() in {"1", "true", "yes"}
```

**编排工具**：
| 工具名 | 作用 |
|--------|------|
| `agent` | 派生新 Worker Agent |
| `send_message` | 向已有 Worker 追加消息 |
| `task_stop` | 终止运行中的 Worker |

**Worker 工具白名单**（默认模式）：
```
bash, file_read, file_edit, file_write, glob, grep,
web_fetch, web_search, task_create, task_get, task_list,
task_output, skill
```

Simple 模式下仅 `bash, file_read, file_edit`。

### 2.3 Agent 定义系统

`AgentDefinition` 是 Pydantic 模型，支持的字段远超 OpenClaw 的 subagent 配置：

| 字段 | 说明 | OpenClaw 对应 |
|------|------|--------------|
| `name` | Agent 类型标识 | session label |
| `system_prompt` | 完整系统提示词 | system prompt |
| `tools` / `disallowed_tools` | 工具白/黑名单 | tool policy |
| `model` | 模型覆盖 | model override |
| `effort` | 思考强度 (low/medium/high) | reasoning mode |
| `permission_mode` | 权限模式 (5种) | approval policy |
| `max_turns` | 最大 agentic turns | 无直接对应 |
| `memory` | 记忆范围 (user/project/local) | memory scope |
| `isolation` | 隔离模式 (worktree/remote) | 无 |
| `skills` | 可用 skills 列表 | skill filter |
| `mcp_servers` | MCP 服务器配置 | MCP tools |
| `hooks` | 会话级钩子 | 无 |
| `background` | 是否后台运行 | `background: true` |
| `initial_prompt` | 首轮前置消息 | initial prompt |
| `omit_claude_md` | 跳过 CLAUDE.md 注入 | 无 |
| `color` | UI 颜色标识 | emoji/icon |
| `critical_system_reminder` | 每轮重注入提醒 | 无 |

**内置 Agent 库**（6个）：

1. **general-purpose** — 全能型，所有工具，通用系统提示词
2. **Explore** — 只读探索型，禁止文件修改，使用 haiku 模型，跳过 CLAUDE.md
3. **Plan** — 架构师型，只读规划，要求输出关键文件列表
4. **Verification** — 验证专家型，强制对抗性测试，输出 VERDICT: PASS/FAIL/PARTIAL
5. **claude-code-guide** — 文档查询型，使用 haiku 模型，dontAsk 权限
6. **statusline-setup** — 状态栏配置型，使用 sonnet 模型，仅 Read/Edit

### 2.4 团队注册与通知协议

**TeamRegistry** 是轻量级内存数据结构：

```python
@dataclass
class TeamRecord:
    name: str
    description: str = ""
    agents: list[str] = field(default_factory=list)
    messages: list[str] = field(default_factory=list)
```

**任务通知协议**：使用 XML 格式封装 Worker 完成结果：

```xml
<task-notification>
  <task-id>xxx</task-id>
  <status>completed</status>
  <summary>实现了用户认证模块</summary>
  <result>具体输出内容...</result>
  <usage>
    <total_tokens>12345</total_tokens>
    <tool_uses>8</tool_uses>
    <duration_ms>3200</duration_ms>
  </usage>
</task-notification>
```

### 2.5 锁机制与权限同步

- **无显式锁机制**：协调器通过环境变量标记模式，无文件锁或分布式锁
- **权限同步**：Worker 的 `permission_mode` 由 `WorkerConfig` 传递，支持 `default/acceptEdits/bypassPermissions/plan/dontAsk` 五种模式
- **工具限制**：Worker 通过 `disallowed_tools` 黑名单实现能力收窄（如 Explore Agent 禁止 `file_edit, file_write`）
- **Scratchpad 目录**：协调器可分配一个跨 Worker 共享的临时目录，Worker 可在其中读写无需权限确认

### 2.6 会话模式恢复

`match_session_mode()` 处理会话恢复时的模式不匹配问题——如果恢复的会话记录了 coordinator 模式但当前进程不是，自动切换环境变量并返回警告消息。

---

## 3. Channels 系统

### 3.1 架构概览

```
openharness/channels/
├── adapter.py           # ChannelBridge（连接 Bus → QueryEngine）
├── bus/
│   ├── events.py        # InboundMessage / OutboundMessage 数据类
│   └── queue.py         # MessageBus（async 双队列）
└── impl/
    ├── base.py          # BaseChannel 抽象基类
    ├── manager.py       # ChannelManager（多通道编排）
    ├── feishu.py        # 飞书实现
    ├── telegram.py      # Telegram 实现
    ├── discord.py       # Discord 实现
    ├── whatsapp.py      # WhatsApp 实现
    ├── slack.py         # Slack 实现
    ├── qq.py            # QQ 实现
    ├── mochat.py        # Mochat 实现
    ├── dingtalk.py      # 钉钉实现
    ├── email.py         # Email 实现
    └── matrix.py        # Matrix 实现
```

**设计模式**：经典的**适配器模式 + 事件总线**。

### 3.2 事件总线（MessageBus）

基于 Python 原生 `asyncio.Queue` 的极简实现：

```python
class MessageBus:
    def __init__(self):
        self.inbound: asyncio.Queue[InboundMessage] = asyncio.Queue()
        self.outbound: asyncio.Queue[OutboundMessage] = asyncio.Queue()
```

**数据流**：
```
[Channel] → publish_inbound() → [inbound Queue]
                                         ↓
                              ChannelBridge._loop()
                                         ↓
                              QueryEngine.submit_message()
                                         ↓
                              publish_outbound() → [outbound Queue]
                                                           ↓
                                                   ChannelManager._dispatch_outbound()
                                                           ↓
                                                   [Channel].send()
```

**事件类型**：

```python
@dataclass
class InboundMessage:
    channel: str            # telegram, discord, slack, feishu...
    sender_id: str          # 用户 ID
    chat_id: str            # 会话 ID
    content: str            # 消息文本
    timestamp: datetime
    media: list[str]        # 媒体文件路径
    metadata: dict          # 通道特定数据
    session_key_override    # 线程级会话覆盖

    @property
    def session_key(self) -> str:
        return self.session_key_override or f"{self.channel}:{self.chat_id}"
```

### 3.3 ChannelBridge

ChannelBridge 是**事件总线和 QueryEngine 之间的桥梁**，职责：

1. 持续消费 inbound 队列
2. 将消息提交给 QueryEngine
3. 收集流式响应（`AssistantTextDelta`）
4. 拼接完整回复后发布到 outbound 队列

```python
async def _handle(self, msg: InboundMessage):
    reply_parts = []
    async for event in self._engine.submit_message(msg.content):
        if isinstance(event, AssistantTextDelta):
            reply_parts.append(event.text)
        elif isinstance(event, AssistantTurnComplete):
            pass  # turn done
    reply_text = "".join(reply_parts).strip()
    outbound = OutboundMessage(
        channel=msg.channel,
        chat_id=msg.chat_id,
        content=reply_text,
        metadata={"_session_key": msg.session_key},
    )
    await self._bus.publish_outbound(outbound)
```

**注意**：当前实现收集完整文本后才发送，**不支持流式输出到通道**。

### 3.4 飞书实现细节

`FeishuChannel` 是最复杂的通道实现（~700行），关键特性：

**连接方式**：WebSocket 长连接，无需公网 IP 或 webhook。

```python
self._ws_client = lark.ws.Client(
    self.config.app_id,
    self.config.app_secret,
    event_handler=event_handler,
)
```

**线程模型**：WebSocket 客户端运行在独立线程（`daemon=True`），创建独立事件循环避免与主循环冲突。通过 `asyncio.run_coroutine_threadsafe()` 将消息调度到主循环。

**消息去重**：使用 `OrderedDict` 维护最近 1000 条已处理消息 ID。

**权限控制**：`BaseChannel.is_allowed()` 检查 `allow_from` 配置。空列表 = 拒绝所有，`"*"` = 允许所有。

**入站消息解析**：
- `text` → 直接提取
- `post`（富文本）→ 解析 title + content 行，支持 `text/a/at/img` 标签，下载图片
- `image/audio/file/media` → 下载到本地 `~/.nanobot/media/`
- `interactive`（卡片）→ 递归提取标题、markdown 内容、链接
- `share_chat/share_user/merge_forward` → 提取文本摘要

**出站消息智能格式选择**：

| 条件 | 格式 | 原因 |
|------|------|------|
| 短纯文本 (≤200字) | `text` | 最简单 |
| 含链接 | `post`（富文本） | 支持 `<a>` 标签 |
| 含代码块/表格/标题/长文本/粗体/列表 | `interactive`（卡片） | 完整 Markdown 渲染 |
| 多表格 | 拆分为多张卡片 | 飞书 API 限制每张卡片仅 1 个表格 |

**Markdown → 飞书卡片转换**：
- 代码块 → `markdown` 元素（直接支持）
- 标题 → `div` + `lark_md` **粗体** 渲染
- 表格 → 飞书原生 `table` 元素（列宽 auto）
- 保护代码块不被标题正则误匹配

**Reaction 支持**：收到消息后自动添加 emoji reaction（可配置 `react_emoji`），使用 `run_in_executor` 避免阻塞。

### 3.5 ChannelManager 多通道编排

- 支持 10 个通道：Telegram、WhatsApp、Discord、Feishu、Mochat、钉钉、Email、Slack、QQ、Matrix
- 启动时懒加载（try/import），缺 SDK 不崩溃
- **出站调度**：独立任务 `_dispatch_outbound()` 消费 outbound 队列，按 `msg.channel` 路由到对应通道实例
- **进度消息过滤**：可配置是否发送 `_progress` 和 `_tool_hint` 类型消息

---

## 4. Bridge 系统

### 4.1 架构概览

```
openharness/bridge/
├── types.py         # WorkData, WorkSecret, BridgeConfig
├── work_secret.py   # Base64URL 编解码 + WebSocket URL 构建
├── session_runner.py # SessionHandle + spawn_session()
└── manager.py       # BridgeSessionManager（会话生命周期管理）
```

### 4.2 WorkSecret 认证

Bridge 使用 **Base64URL 编码的 JSON** 作为工作密钥：

```python
@dataclass(frozen=True)
class WorkSecret:
    version: int                    # 当前仅支持 v1
    session_ingress_token: str      # 会话入站令牌
    api_base_url: str              # API 基础 URL
```

编解码：`base64.urlsafe_b64encode` / `base64.urlsafe_b64decode`，无加密（仅编码）。

**WebSocket URL 构建**：
```python
def build_sdk_url(api_base_url, session_id):
    is_local = "localhost" in api_base_url or "127.0.0.1" in api_base_url
    protocol = "ws" if is_local else "wss"
    version = "v2" if is_local else "v1"
    return f"{protocol}://{host}/{version}/session_ingress/ws/{session_id}"
```

本地用 `ws://.../v2/`，远程用 `wss://.../v1/`。

### 4.3 会话运行器

`SessionHandle` 封装一个 `asyncio.subprocess.Process`：

```python
@dataclass
class SessionHandle:
    session_id: str
    process: asyncio.subprocess.Process
    cwd: Path
    started_at: float

    async def kill(self):
        self.process.terminate()     # 先 SIGTERM
        await asyncio.wait_for(self.process.wait(), timeout=3)
        # 超时则 SIGKILL
```

`spawn_session()` 通过 `create_shell_subprocess()` 创建子进程，stdout/stderr 均 PIPE。

### 4.4 会话管理器

`BridgeSessionManager` 是单例，管理多个 bridge 会话：

- **spawn**：创建会话 + 开启后台任务持续将 stdout 写入 `{data_dir}/bridge/{session_id}.log`
- **list_sessions**：返回按时间倒序排列的 `BridgeSessionRecord`（含状态：running/completed/failed）
- **read_output**：读取日志文件尾部（最多 12KB）
- **stop**：通过 handle.kill() 终止进程

**会话超时**：默认 24 小时（`DEFAULT_SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000`）。

**日志收集**：异步任务 `_copy_output()` 持续读取 stdout 并追加写入日志文件，确保进程输出不丢失。

---

## 5. 与 OpenClaw 的对比分析

### 5.1 Memory 系统

| 维度 | OpenHarness | OpenClaw |
|------|------------|----------|
| **存储** | 文件系统，per-project 隔离目录 | 文件系统 + OpenViking 语义记忆 |
| **格式** | Markdown + YAML frontmatter | Markdown + MEMORY.md 索引 |
| **搜索** | 词频匹配，中文逐字拆分 | `memory_search` 语义搜索 + `memory_recall` OpenViking |
| **中文** | 每个汉字独立 token，无分词器 | OpenViking 后端处理（嵌入向量） |
| **熵管理** | 无（纯追加） | Compaction + memoryFlush + identifierPolicy |
| **注入方式** | system prompt 段落 | system prompt + 工具调用 |
| **持久化** | 自动（文件系统） | 自动（文件 + OpenViking pipeline） |

**关键差异**：OpenClaw 使用语义搜索（OpenViking 向量嵌入），搜索质量远高于 OpenHarness 的词频匹配。OpenClaw 有 compaction 防上下文溢出，OpenHarness 没有。

### 5.2 Coordinator / 多 Agent

| 维度 | OpenHarness | OpenClaw |
|------|------------|----------|
| **模式** | 环境变量切换 `COORDINATOR_MODE` | 原生 subagent spawn |
| **Agent 定义** | Pydantic 模型，~25 个字段 | JSON 配置，较简洁 |
| **内置 Agent** | 6 个（Explore/Plan/Verify/Guide 等） | 依赖 skill 系统 |
| **通知协议** | XML `<task-notification>` | push-based 自动回调 |
| **工具限制** | 显式白名单 + 黑名单 | tool policy 过滤 |
| **权限模式** | 5 种细粒度模式 | approve/allow-once/allow-always/deny |
| **隔离** | worktree / remote | isolated session |
| **团队** | TeamRegistry 内存注册 | 无显式团队概念 |
| **Worker 通信** | send_message 工具 | sessions_yield + 自动回调 |

**关键差异**：OpenHarness 的 Agent 定义更精细（effort/isolation/hooks/max_turns/scratchpad），但 OpenClaw 的 subagent 通信更优雅（push-based 而非 XML 解析）。

### 5.3 Channels 通道

| 维度 | OpenHarness | OpenClaw |
|------|------------|----------|
| **架构** | 事件总线 + 适配器模式 | 插件系统 + channel 工具 |
| **支持通道** | 10 个（含钉钉/Matrix） | 2+ 个（飞书/Telegram/QQ 等） |
| **消息总线** | asyncio.Queue 双队列 | Gateway 内部路由 |
| **流式输出** | 不支持（拼接后发送） | 支持 |
| **飞书实现** | ~700行，WebSocket 长连接 | 独立插件 `openclaw-lark` |
| **格式智能** | 自动检测 text/post/interactive | 类似的格式适配 |
| **权限** | `allow_from` 配置 | 内置权限系统 |

**关键差异**：OpenHarness 的通道系统更「学术化」——清晰的事件总线架构、抽象基类、松耦合。OpenClaw 更「工程化」——插件式、流式输出、与 core 深度集成。

### 5.4 Bridge 桥接

| 维度 | OpenHarness | OpenClaw |
|------|------------|----------|
| **定位** | 远程会话桥接（WebSocket ingress） | Gateway 节点连接 |
| **认证** | Base64URL WorkSecret（无加密） | Gateway token + TLS |
| **会话管理** | BridgeSessionManager 单例 | Gateway daemon |
| **输出收集** | 后台任务写日志 | process tool |
| **超时** | 24h 默认 | 可配置 |

**关键差异**：OpenHarness 的 Bridge 面向「远程 worker 入口」场景（类似 Claude Code 的远程开发），OpenClaw 的 Gateway 面向「多节点连接」场景。

---

## 6. 总结

### OpenHarness 的设计哲学

1. **学术原型风格**：代码清晰、模块化强、文档充分，但生产细节（如流式输出、错误恢复）有待完善
2. **Claude Code 的 Python 复刻**：从 `CLAUDE_CODE_COORDINATOR_MODE` 环境变量到 `omit_claude_md` 字段，明显对标 Anthropic 的 Claude Code
3. **极简依赖**：核心系统仅依赖 Python 标准库 + PyYAML + Pydantic，通道实现按需引入 SDK
4. **中文友好**：搜索的汉字拆分、飞书的深度实现（消息卡片/表格/富文本），体现了面向中文用户的定位

### 架构亮点

- **事件总线解耦**：Channel → Bus → Bridge → Engine 的四层分离非常干净
- **Agent 定义系统**：25+ 字段的 Pydantic 模型提供了精细的 Agent 配置能力
- **内置 Verification Agent**：强制对抗性测试 + VERDICT 输出格式，是工程实践的好模板
- **飞书通道的格式智能**：自动选择 text/post/interactive + 多表格拆分，用户体验好

### 可借鉴之处

1. **Agent Definition 的 `max_turns` + `effort` + `isolation`** — 比 OpenClaw 的 subagent 配置更精细
2. **Verification Agent 的结构化输出** — `VERDICT: PASS/FAIL/PARTIAL` + 必须包含命令运行证据
3. **飞书卡片的 Markdown 表格转换** — OpenClaw 的飞书插件可以参考其表格渲染逻辑
4. **Scratchpad 目录** — 跨 Worker 的共享临时空间概念
5. **消息格式自动检测** — 根据内容特征选择最优消息类型
