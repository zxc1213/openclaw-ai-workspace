# DeerFlow 核心模块深度学习笔记

> 基于 https://github.com/bytedance/deer-flow 源码分析
> 生成时间: 2026-04-06
> 源码路径: `backend/packages/harness/deerflow/`

---

## 模块 1: 沙箱隔离 (Sandbox)

### 1.1 架构设计

```
┌─────────────────────────────────────────────────────┐
│                   Tool Layer                         │
│  (tools.py: bash/read_file/write_file/glob/grep)    │
├─────────────────────────────────────────────────────┤
│              SandboxMiddleware                        │
│  (sandbox/middleware.py: 生命周期管理)                │
│  - lazy_init=True: 首次工具调用时获取沙箱              │
│  - lazy_init=False: before_agent 时获取               │
├─────────────────────────────────────────────────────┤
│            SandboxProvider (ABC)                      │
│  (sandbox_provider.py: acquire/get/release)          │
├──────────────┬──────────────────────────────────────┤
│ Local        │  AioSandboxProvider                   │
│ Sandbox      │  (community/aio_sandbox/)              │
│ Provider     │  ├── LocalContainerBackend (Docker)   │
│              │  └── RemoteSandboxBackend (K8s)        │
├──────────────┴──────────────────────────────────────┤
│            Sandbox (ABC)                              │
│  (sandbox.py: execute_command/read_file/write_file   │
│   /list_dir/glob/grep/update_file)                   │
└─────────────────────────────────────────────────────┘
```

**核心抽象层**:
- **`Sandbox` (ABC)** — 沙箱环境接口，定义 7 个操作方法
- **`SandboxProvider` (ABC)** — 沙箱生命周期管理（acquire/get/release/shutdown）
- **`SandboxMiddleware`** — LangChain AgentMiddleware，将沙箱注入 Agent 运行时

### 1.2 SandboxProvider 协议设计

```python
# sandbox_provider.py
class SandboxProvider(ABC):
    @abstractmethod
    def acquire(self, thread_id: str | None = None) -> str:
        """获取沙箱环境，返回 sandbox_id"""
        pass

    @abstractmethod
    def get(self, sandbox_id: str) -> Sandbox | None:
        """通过 ID 获取沙箱实例"""
        pass

    @abstractmethod
    def release(self, sandbox_id: str) -> None:
        """释放沙箱（销毁容器）"""
        pass
```

**单例管理**：
- 使用模块级 `_default_sandbox_provider` 全局变量
- `get_sandbox_provider()` — 懒加载创建，类路径通过 `config.sandbox.use` 配置（如 `deerflow.sandbox.local:LocalSandboxProvider`）
- `shutdown_sandbox_provider()` — 优雅关闭，调用 provider.shutdown()
- `set_sandbox_provider()` — 注入自定义 provider（测试用）

### 1.3 虚拟路径系统

DeerFlow 的虚拟路径映射是整个沙箱系统的核心设计亮点：

**三个保留路径前缀**:
```python
_RESERVED_CONTAINER_PREFIXES = [container_path, "/mnt/acp-workspace", "/mnt/user-data"]
# 其中 container_path 默认为 "/mnt/skills"
```

| 虚拟路径 | 用途 | 权限 |
|----------|------|------|
| `/mnt/skills/` | Skills 目录 | 只读 |
| `/mnt/acp-workspace/` | ACP 工作区 | 读写，按 thread 隔离 |
| `/mnt/user-data/` | 用户数据 | 读写，按 thread 隔离 |
| 自定义 mounts | config.yaml 配置 | 可配置只读/读写 |

**路径解析机制** (`local_sandbox.py`)：

```python
class LocalSandbox(Sandbox):
    def _resolve_path(self, path: str) -> str:
        """容器路径 → 宿主机路径，最长前缀优先匹配"""
        for mapping in sorted(self.path_mappings, key=lambda m: len(m.container_path), reverse=True):
            if path_str == container_path or path_str.startswith(container_path + "/"):
                relative = path_str[len(container_path):].lstrip("/")
                return str(Path(local_path) / relative)
        return path_str  # 无映射则返回原路径

    def _is_read_only_path(self, resolved_path: str) -> bool:
        """检查路径是否为只读挂载，最长前缀匹配"""
        # ... 最具体映射（local_path 最长前缀）优先
```

**PathMapping 数据结构**：
```python
@dataclass(frozen=True)
class PathMapping:
    container_path: str  # 容器内路径
    local_path: str      # 宿主机路径
    read_only: bool      # 是否只读
```

### 1.4 Docker/K8s 隔离模式对比

**LocalSandboxProvider**（无容器隔离）:
- **单例模式**：`acquire()` 返回同一个 `"local"` 实例
- **路径映射**：通过 PathMapping 做虚拟路径 → 宿主机路径的转换
- **安全警告**：`security.py` 明确禁止 host bash（`is_host_bash_allowed()` 默认 False）
- **适用场景**：完全可信的本地开发环境

**AioSandboxProvider**（容器隔离）:
```python
# 社区扩展，位于 community/aio_sandbox/
class AioSandboxProvider(SandboxProvider):
    """
    - _backend: SandboxBackend (LocalContainerBackend / RemoteSandboxBackend)
    - _sandboxes: dict[str, AioSandbox]  # 活跃沙箱
    - _warm_pool: dict[str, (SandboxInfo, float)]  # 温池复用
    - _thread_sandboxes: dict[str, str]  # thread → sandbox 映射
    """
```

**关键设计**：
1. **Backend 抽象**：`provisioner_url` 存在 → `RemoteSandboxBackend`（K8s 动态创建 Pod+Service）；否则 → `LocalContainerBackend`（Docker）
2. **LRU 池化**：`replicas=3` 最大并发，超限时 evict LRU
3. **温池复用**：`_warm_pool` 缓存已释放但容器仍在运行的沙箱，避免冷启动
4. **Idle 超时**：默认 600s，后台线程 `IDLE_CHECK_INTERVAL=60s` 定期检查
5. **确定性 ID**：基于 thread_id 的 hash 生成 sandbox_id，保证同一线程复用同一沙箱

**配置参数**：
```yaml
sandbox:
  use: deerflow.community.aio_sandbox:AioSandboxProvider
  image: all-in-one-sandbox:latest
  port: 8080
  replicas: 3
  container_prefix: deer-flow-sandbox
  idle_timeout: 600
  mounts:
    - host_path: /data
      container_path: /mnt/user-data
      read_only: false
  environment:
    API_KEY: $MY_API_KEY  # $ 开头的值从宿主机环境变量解析
  bash_output_max_chars: 20000  # 输出截断
  read_file_output_max_chars: 50000
```

### 1.5 搜索工具内置优化

`sandbox/search.py` 实现了高效的文件搜索：

- **IGNORE_PATTERNS**：预定义 42 个忽略模式（node_modules, .git, __pycache__ 等）
- **GrepMatch**：结构化匹配结果（path + line_number + line）
- **max_results + truncated 标志**：结果数量可控，`(matches, truncated)` 元组
- **二进制检测**：`is_binary_file()` 检查 NUL 字节（8KB 采样）
- **行截断**：`DEFAULT_LINE_SUMMARY_LENGTH = 200`

### 1.6 SandboxAuditMiddleware（命令审计）

```python
# sandbox_audit_middleware.py
_HIGH_RISK_PATTERNS = [
    re.compile(r"rm\s+-[^\s]*r[^\s]*\s+(/\*?|~/?\*?|/home\b|/root\b)"),
    re.compile(r"(curl|wget).+\|\s*(ba)?sh"),  # curl|sh 管道注入
    re.compile(r"dd\s+if="),                   # dd 磁盘操作
    re.compile(r"cat\s+/etc/shadow"),          # 读敏感文件
    re.compile(r">\s*/etc/"),                  # 写 /etc
]
_MEDIUM_RISK_PATTERNS = [
    re.compile(r"chmod\s+777"),
    re.compile(r"pip\s+install"),
    re.compile(r"apt(-get)?\s+install"),
]
```

**三级判定**：block（拦截+错误消息）→ warn（执行+附加警告）→ pass（正常执行）

### 1.7 与 OpenClaw 对比

| 维度 | DeerFlow Sandbox | OpenClaw exec |
|------|-----------------|---------------|
| 隔离级别 | 本地路径映射 / Docker 容器 / K8s Pod | 宿主机直接执行（WSL） |
| 虚拟路径 | 有（/mnt/skills, /mnt/acp-workspace） | 无 |
| 命令审计 | SandboxAuditMiddleware（正则分级） | AGENTS.md 红线规则（文本） |
| 文件保护 | 只读挂载 + 路径映射隔离 | 安全路径约定（/etc, /usr 禁写） |
| 工具粒度 | 7 个专用沙箱方法 | 通用 exec 工具 |
| 生命周期 | acquire/release/shutdown | 无管理 |
| 池化 | 温池 + LRU + 并发限制 | 无 |

### 1.8 OpenClaw 集成建议

**优先级 P0 — 命令审计中间件**（可立即实现）:
1. 创建 `exec-audit` skill，在 exec 调用前执行正则检查
2. 复用 DeerFlow 的 `_HIGH_RISK_PATTERNS` 和 `_MEDIUM_RISK_PATTERNS`
3. 在 AGENTS.md 中增加 "高危操作前自检" 的调用规范

**优先级 P1 — 虚拟路径映射**:
1. 在 TOOLS.md 中定义常用路径别名（如 `/skills/` → `~/.openclaw/workspace/skills/`）
2. 利用 exec 的 env 注入机制，设置环境变量如 `SANDBOX_SKILLS=/mnt/skills`

**优先级 P2 — 读写保护**:
1. 在 shell 层面实现只读目录保护（`chattr +i` 或 `bind mount --ro`）
2. 对 `_inbox/` 实现自动清理的 cron 任务（已有的 workspace 卫生机制）

---

## 模块 2: 中间件链 + Guardrail (Middleware + Guardrail)

### 2.1 架构设计

```
┌─────────────────────────────────────────────────────┐
│                  LLM Response                         │
├─────────────────────────────────────────────────────┤
│         after_model Hooks (按注册顺序)                 │
│  [TokenUsage] → [SubagentLimit] → [LoopDetection]    │
├─────────────────────────────────────────────────────┤
│            Tool Call Pipeline                         │
│  ┌─────────────────────────────────────────────┐     │
│  │ wrap_tool_call Chain (洋葱模型):              │     │
│  │  Guardrail → SandboxAudit → ToolErrorHandling │     │
│  └─────────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────┤
│         before_agent Hooks                            │
│  [ThreadData] → [Uploads] → [Sandbox] (lazy_init)    │
├─────────────────────────────────────────────────────┤
│                  Agent Input                          │
└─────────────────────────────────────────────────────┘
```

### 2.2 中间件组装逻辑

核心函数在 `tool_error_handling_middleware.py` 的 `_build_runtime_middlewares()`:

```python
def _build_runtime_middlewares(*, include_uploads, include_dangling_tool_call_patch, lazy_init=True):
    middlewares = [
        ThreadDataMiddleware(lazy_init=lazy_init),    # 1. 线程数据初始化
    ]
    if include_uploads:
        middlewares.insert(1, UploadsMiddleware())    # 2. 上传文件处理(仅 lead)
    middlewares += [
        SandboxMiddleware(lazy_init=lazy_init),       # 3. 沙箱生命周期
    ]
    if include_dangling_tool_call_patch:
        middlewares.append(DanglingToolCallMiddleware()) # 4. 悬空工具调用修复
    middlewares += [
        LLMErrorHandlingMiddleware(),                  # 5. LLM 错误处理
    ]
    # Guardrail (条件加载)
    if guardrails_config.enabled and guardrails_config.provider:
        provider = resolve_variable(guardrails_config.provider.use)(**kwargs)
        middlewares.append(GuardrailMiddleware(provider, fail_closed=...))  # 6
    middlewares += [
        SandboxAuditMiddleware(),                      # 7. 命令安全审计
        ToolErrorHandlingMiddleware(),                  # 8. 工具异常兜底
    ]
    return middlewares
```

**Lead vs Subagent 差异**:
- Lead: `include_uploads=True`（有上传中间件）
- Subagent: `include_uploads=False`（无上传中间件）
- 共享: Sandbox、Guardrail、SandboxAudit、ToolError、LoopDetection

### 2.3 完整中间件清单（12 个）

| # | 中间件 | 钩子 | 职责 |
|---|--------|------|------|
| 1 | `ThreadDataMiddleware` | before_agent | 初始化线程数据（workspace_path 等） |
| 2 | `UploadsMiddleware` | before_agent | 将上传文件信息注入 human message |
| 3 | `SandboxMiddleware` | before_agent / after_agent | 沙箱生命周期管理 |
| 4 | `DanglingToolCallMiddleware` | wrap_tool_call | 修复缺少 tool_call_id 的调用 |
| 5 | `LLMErrorHandlingMiddleware` | after_model | LLM 错误恢复（rate limit、context overflow） |
| 6 | `GuardrailMiddleware` | wrap_tool_call | 工具调用前置鉴权 |
| 7 | `SandboxAuditMiddleware` | wrap_tool_call | bash 命令安全审计 |
| 8 | `ToolErrorHandlingMiddleware` | wrap_tool_call | 工具异常兜底（异常→ToolMessage） |
| 9 | `SubagentLimitMiddleware` | after_model | 截断过多的并行 task 调用（max 2-4） |
| 10 | `LoopDetectionMiddleware` | after_model | 检测重复工具调用循环 |
| 11 | `TokenUsageMiddleware` | after_model | 记录 LLM token 使用量 |
| 12 | `MemoryMiddleware` | after_agent | 检测用户纠正/强化信号，入队记忆更新 |
| 13 | `TitleMiddleware` | after_agent | 生成/更新对话标题 |
| 14 | `TodoMiddleware` | after_agent | 提取待办事项 |
| 15 | `ClarificationMiddleware` | after_model | 检测需要澄清的场景 |
| 16 | `DeferredToolFilterMiddleware` | after_model | 过滤延迟执行的工具调用 |
| 17 | `ViewImageMiddleware` | before_agent | 图片查看上下文注入 |

### 2.4 Guardrail Provider 协议

```python
# guardrails/provider.py
@runtime_checkable
class GuardrailProvider(Protocol):
    """任何实现了 evaluate/aevaluate 的类都可以作为 provider"""
    name: str

    def evaluate(self, request: GuardrailRequest) -> GuardrailDecision: ...
    async def aevaluate(self, request: GuardrailRequest) -> GuardrailDecision: ...
```

**数据结构**:
```python
@dataclass
class GuardrailRequest:
    tool_name: str
    tool_input: dict[str, Any]
    agent_id: str | None
    thread_id: str | None
    is_subagent: bool
    timestamp: str

@dataclass
class GuardrailDecision:
    allow: bool
    reasons: list[GuardrailReason]  # 结构化原因（code + message）
    policy_id: str | None
    metadata: dict[str, Any]
```

**GuardrailMiddleware 执行流程**:
```python
# guardrails/middleware.py
def wrap_tool_call(self, request, handler):
    decision = self.provider.evaluate(request)
    if not decision.allow:
        return ToolMessage(content=f"Guardrail denied: tool '{tool_name}' blocked ({reason_code})...")
    return handler(request)
```

- **fail_closed=True（默认）**：provider 异常时阻止调用
- **fail_closed=False**：provider 异常时放行（带 warning 日志）
- **GraphBubbleUp 透传**：LangGraph 中断/暂停信号不被吞掉

### 2.5 AllowlistProvider 实现

```python
# guardrails/builtin.py
class AllowlistProvider:
    name = "allowlist"

    def __init__(self, *, allowed_tools=None, denied_tools=None):
        self._allowed = set(allowed_tools)  # None = 不过滤
        self._denied = set(denied_tools)    # 空集 = 不拒绝

    def evaluate(self, request):
        if self._allowed is not None and request.tool_name not in self._allowed:
            return GuardrailDecision(allow=False, reasons=[...])
        if request.tool_name in self._denied:
            return GuardrailDecision(allow=False, reasons=[...])
        return GuardrailDecision(allow=True)
```

**三种模式**：
1. **Allowlist 模式**：`allowed_tools` 非空 → 白名单，未列出的全部拒绝
2. **Denylist 模式**：`allowed_tools=None, denied_tools=[...]` → 黑名单
3. **全放行**：`allowed_tools=None, denied_tools=[]` → 全部通过（guardrail 仅做审计日志）

### 2.6 配置格式

```yaml
guardrails:
  enabled: true
  fail_closed: true
  passport: "my-agent-id"  # OAP 护照
  provider:
    use: deerflow.guardrails.builtin:AllowlistProvider
    config:
      allowed_tools: [read_file, write_file, glob, grep, list_dir]
      denied_tools: [bash]
```

### 2.7 LoopDetectionMiddleware（循环检测）

```python
# loop_detection_middleware.py
# 原理：对每次 model 响应的 tool_calls 做 hash
def _hash_tool_calls(tool_calls):
    # 归一化 → 排序 → JSON → MD5[:12]，顺序无关
    normalized = [{"name": tc["name"], "args": tc["args"]} for tc in tool_calls]
    normalized.sort(key=...)
    return hashlib.md5(blob.encode()).hexdigest()[:12]

# 分级响应：
# warn_threshold=3: 注入警告消息 "[LOOP DETECTED]..."
# hard_limit=5: 强制剥离 tool_calls，迫使产生最终回答
```

### 2.8 与 OpenClaw 对比

| 维度 | DeerFlow Middleware | OpenClaw |
|------|-------------------|----------|
| 架构 | 洋葱模型 wrap_tool_call | 无显式中间件链 |
| 命令审计 | SandboxAuditMiddleware（代码级） | AGENTS.md 规则（prompt 级） |
| 工具鉴权 | GuardrailMiddleware + Protocol | 无（工具可用性由模型 prompt 控制） |
| 循环检测 | hash + 滑动窗口 + 强制停止 | 无内置机制 |
| 错误兜底 | ToolErrorHandlingMiddleware（异常→ToolMessage） | 依赖 OpenClaw 内置错误处理 |
| 工具调用限制 | SubagentLimitMiddleware（max 2-4 并行 task） | 无限制 |
| 组装方式 | `_build_runtime_middlewares()` 代码组装 | 无（固定行为） |
| 配置化 | guardrails_config.yaml | gateway.config.yaml |

### 2.9 OpenClaw 集成建议

**P0 — exec 命令审计 Hook**:
1. 创建 `scripts/exec-audit.sh`，在执行前检查命令
2. 在 AGENTS.md 中规定 "所有 exec 调用前必须先运行 audit 脚本"
3. 或者更好的方案：利用 OpenClaw 的 `approval` 机制，高危命令需要人工审批

**P1 — Guardrail 机制**:
1. 创建 `exec-guardrail` skill，在 exec 前调用
2. 配置文件 `~/.openclaw/guardrails.yaml` 定义 allowed/denied 模式
3. 通过 AGENTS.md 红线规则强制执行："调用 exec 前必须先调用 guardrail 检查"

**P2 — 循环检测**:
1. 在心跳日志中检查是否有重复工具调用模式
2. 通过 `postCompactionSections` 在压缩后注入提醒

**P3 — SubagentLimit 等价物**:
1. 在 sessions_spawn 的 prompt 中明确限制并行度
2. 在 coding-agent skill 中增加 `max_concurrent` 配置

---

## 模块 3: 上下文渐进压缩 (Context Summarization)

### 3.1 架构设计

```
┌─────────────────────────────────────────────────┐
│           对话历史 (messages[])                   │
│  [Human1, AI1+tools, Tool1, AI2, ..., HumanN]    │
├─────────────────────────────────────────────────┤
│         SummarizationConfig 触发检查              │
│  trigger: messages >= 50                         │
│  OR     tokens >= 4000                           │
│  OR     fraction >= 0.8 (模型最大 token 的 80%)  │
├─────────────────────────────────────────────────┤
│           压缩执行                                │
│  trim_tokens_to_summarize: 4000                  │
│  → 取出较早的消息，截断到 4000 tokens             │
│  → 用轻量模型生成摘要                             │
│  → 替换: [Summary, keep_last_N_messages]         │
├─────────────────────────────────────────────────┤
│  keep: messages=20 (保留最近 20 条不压缩)         │
│  OR keep: tokens=3000                            │
│  OR keep: fraction=0.3                          │
└─────────────────────────────────────────────────┘
```

### 3.2 配置详解

```python
# config/summarization_config.py
class SummarizationConfig(BaseModel):
    enabled: bool = False                      # 默认关闭
    model_name: str | None = None               # None = 轻量模型
    trigger: ContextSize | list[ContextSize]    # 触发条件（任一满足即触发）
    keep: ContextSize = ContextSize(type="messages", value=20)  # 保留策略
    trim_tokens_to_summarize: int | None = 4000  # 被压缩消息的最大 token
    summary_prompt: str | None = None           # 自定义摘要 prompt
```

**三种触发/保留模式**:

| type | 含义 | 示例 |
|------|------|------|
| `messages` | 消息条数 | `{type: "messages", value: 50}` → 50 条消息触发 |
| `tokens` | Token 数量 | `{type: "tokens", value: 4000}` → 4000 token 触发 |
| `fraction` | 模型最大输入的比例 | `{type: "fraction", value: 0.8}` → 模型最大输入的 80% |

**多条件触发**：`trigger` 可以是数组，任一满足即触发：
```yaml
summarization:
  enabled: true
  trigger:
    - type: messages
      value: 50
    - type: fraction
      value: 0.8
  keep:
    type: messages
    value: 20
```

### 3.3 MemoryMiddleware（长期记忆提取）

DeerFlow 的记忆系统与压缩系统是独立的但互补的：

```python
# memory_middleware.py
class MemoryMiddleware(AgentMiddleware):
    """在 after_agent 时提取记忆信号"""
    def after_agent(self, state, runtime):
        # 1. 检测用户纠正信号
        _CORRECTION_PATTERNS = (
            re.compile(r"\bthat's (?:wrong|incorrect)\b"),
            re.compile(r"\byou misunderstood\b"),
            re.compile(r"不对"), re.compile(r"你理解错了"), re.compile(r"重试"),
        )
        # 2. 检测用户强化信号
        _REINFORCEMENT_PATTERNS = (
            re.compile(r"\byes,?\s+(?:exactly|perfect)"),
            re.compile(r"对[，,]?\s*就是这样"),
            re.compile(r"完全正确"),
        )
        # 3. 过滤消息（去除 tool_calls 中间步骤）
        # 4. 入队 MemoryQueue
```

**消息过滤策略**（`_filter_messages_for_memory`）：
- **保留**：Human 消息（去除 `<uploaded_files>` 块）、无 tool_calls 的 AI 消息（最终回答）
- **丢弃**：Tool 消息、带 tool_calls 的 AI 消息（中间步骤）、纯上传消息

### 3.4 与 OpenClaw Compaction 对比

| 维度 | DeerFlow Summarization | OpenClaw Compaction |
|------|----------------------|-------------------|
| 触发方式 | messages/tokens/fraction 多条件 | 内置算法（模型输出长度占比） |
| 保留策略 | 最近 N 条消息 / N tokens / 比例 | 最近 4 轮（原文 2 轮） |
| 压缩方法 | LLM 摘要（轻量模型） | 系统级摘要（保留关键信息） |
| 记忆保护 | MemoryMiddleware 事前刷入 | memoryFlush（压缩前自动刷入） |
| 可配置性 | 高（trigger/keep/model/prompt） | 低（safeguard 模式固定参数） |
| 长期记忆 | 独立 Memory Queue + Storage | OpenViking memory pipeline |
| 压缩后重注入 | 无特殊处理 | postCompactionSections 重注入核心规则 |
| identifierPolicy | 无 | strict（保留 ID、URL、端口） |

### 3.5 可借鉴的优化点

**1. 多维度触发条件**
DeerFlow 的 trigger 支持三种单位混合，比 OpenClaw 的单一模型输出占比更灵活：
```yaml
# 可在 OpenClaw gateway config 中增加类似配置
compaction:
  trigger:
    - type: messages
      value: 80
    - type: tokens
      value: 80000
```

**2. trim_tokens_to_summarize**
限制送入摘要模型的 token 数量（默认 4000），防止摘要本身消耗过多资源。

**3. Memory 信号检测**
DeerFlow 的 MemoryMiddleware 检测用户纠正/强化信号，类似 OpenClaw 的 self-improvement skill，但 DeerFlow 是内建在中间件链中的。

### 3.6 OpenClaw 集成建议

**P0 — 记忆信号检测强化**:
1. 在 self-improvement skill 中增加中文纠正/强化模式检测（参考 DeerFlow 的 `_CORRECTION_PATTERNS`）
2. 心跳时检查当天 daily notes 中的纠正信号，自动触发 MEMORY.md 更新

**P1 — 压缩触发优化**:
1. 利用 OpenClaw 的 `identifierPolicy: strict` 配置确保压缩时保留关键标识符
2. 在 `postCompactionSections` 中增加 "待完成任务" 重注入（从飞书 task 同步）

**P2 — 摘要质量改进**:
1. 在 memoryFlush 的文本中结构化标记优先级（`[P0]`、`[P1]`），帮助后续恢复时识别重要性
2. 参考 DeerFlow 的消息过滤策略，在 memoryFlush 前过滤掉工具调用中间步骤

---

## 模块 4: 子 Agent 并行委派 (Subagent)

### 4.1 架构设计

```
┌─────────────────────────────────────────────────────┐
│              Lead Agent (主 Agent)                     │
│  LLM 生成多个并行 tool_call:                         │
│  [task(desc="调研X", type="general-purpose"),       │
│   task(desc="调研Y", type="general-purpose"),       │
│   task(desc="执行Z", type="bash")]                   │
├─────────────────────────────────────────────────────┤
│         SubagentLimitMiddleware                      │
│  after_model: 截断到 max_concurrent (2-4 个 task)     │
├─────────────────────────────────────────────────────┤
│              task_tool (工具实现)                      │
│  ┌─────────────────────────────────────────┐         │
│  │ 对每个 task call:                         │         │
│  │ 1. get_subagent_config(type) → config    │ │
│  │ 2. 创建 SubagentExecutor(config, tools)  │ │
│  │ 3. executor.execute_async(task) → 后台    │ │
│  │ 4. 轮询 get_background_task_result()     │ │
│  │ 5. stream_writer 发送进度事件             │ │
│  └─────────────────────────────────────────┘         │
├─────────────────────────────────────────────────────┤
│         SubagentExecutor                             │
│  ┌─────────────────────────────────────────┐         │
│  │ ThreadPoolExecutor(max_workers=3)         │ │
│  │ _scheduler_pool: 调度提交                  │ │
│  │ _execution_pool: 实际执行（含超时支持）     │ │
│  │                                           │ │
│  │ _create_agent():                          │ │
│  │   - model: config.model (或 inherit)      │ │
│  │   - tools: _filter_tools(allowed/disallowed)│ │
│  │   - middlewares: build_subagent_runtime   │ │
│  │   - system_prompt: config.system_prompt   │ │
│  │   - max_turns: config.max_turns           │ │
│  └─────────────────────────────────────────┘         │
├─────────────────────────────────────────────────────┤
│              SubagentResult                           │
│  task_id / trace_id / status / result / error         │
│  ai_messages[] / started_at / completed_at            │
└─────────────────────────────────────────────────────┘
```

### 4.2 Registry（注册表）

```python
# subagents/registry.py
BUILTIN_SUBAGENTS = {
    "general-purpose": GENERAL_PURPOSE_CONFIG,
    "bash": BASH_AGENT_CONFIG,
}

def get_subagent_config(name) -> SubagentConfig | None:
    """获取配置 + 应用 config.yaml 覆盖"""
    config = BUILTIN_SUBAGENTS.get(name)
    if config:
        effective_timeout = get_subagents_app_config().get_timeout_for(name)
        effective_max_turns = get_subagents_app_config().get_max_turns_for(name, config.max_turns)
        # dataclasses.replace 创建新实例
        config = replace(config, timeout_seconds=..., max_turns=...)
    return config

def get_available_subagent_names():
    """根据安全配置过滤可见子 agent（如 LocalSandbox 下隐藏 bash）"""
```

### 4.3 SubagentConfig

```python
@dataclass
class SubagentConfig:
    name: str                         # 唯一标识
    description: str                  # LLM 判断何时委派的描述
    system_prompt: str                # 子 agent 的系统提示词
    tools: list[str] | None = None    # 允许的工具列表（None=全部继承）
    disallowed_tools: list[str] = ["task"]  # 禁止递归嵌套
    model: str = "inherit"            # 模型选择（inherit=继承父 agent）
    max_turns: int = 50               # 最大轮次
    timeout_seconds: int = 900        # 超时（15 分钟）
```

**关键设计**：
- `disallowed_tools` 默认包含 `"task"`，**防止子 agent 递归嵌套**
- `model: "inherit"` 允许子 agent 继承父 agent 的模型
- `tools: None` 继承全部工具，可配置白名单限制

### 4.4 并行委派调度逻辑

**task_tool.py** 核心流程：
```python
@tool("task")
async def task_tool(description, prompt, subagent_type, max_turns=None):
    # 1. 获取配置（registry + config.yaml 覆盖）
    config = get_subagent_config(subagent_type)
    config = replace(config, system_prompt=config.system_prompt + skills_section)

    # 2. 获取可用工具（排除 task 工具防止递归）
    tools = get_available_tools(model_name=parent_model, subagent_enabled=False)

    # 3. 创建 executor（继承 sandbox/thread_data/trace_id）
    executor = SubagentExecutor(config, tools, parent_model, sandbox_state, thread_data)

    # 4. 后台执行
    task_id = executor.execute_async(prompt, task_id=tool_call_id)

    # 5. 轮询进度（后端轮询，不依赖 LLM）
    writer = get_stream_writer()
    writer({"type": "task_started", "task_id": task_id, "description": description})

    while True:
        result = get_background_task_result(task_id)
        # 发送 task_running 事件（每个新 AI message）
        # 发送 task_completed/task_failed 事件
        if result.status in (COMPLETED, FAILED, TIMED_OUT):
            break
        await asyncio.sleep(5)

    return result.result or result.error
```

**关键特性**：
1. **后端轮询**：task_tool 内部完成轮询，LLM 不需要自己轮询
2. **流式进度**：通过 `stream_writer` 实时推送 task_started/task_running/task_completed
3. **trace_id 链路**：parent trace_id → subagent trace_id，支持分布式追踪
4. **工具隔离**：`subagent_enabled=False` 确保子 agent 没有 task 工具

### 4.5 SubagentExecutor 并发控制

```python
# executor.py
_scheduler_pool = ThreadPoolExecutor(max_workers=3, thread_name_prefix="subagent-scheduler-")
_execution_pool = ThreadPoolExecutor(max_workers=3, thread_name_prefix="subagent-exec-")

# 全局结果存储
_background_tasks: dict[str, SubagentResult] = {}
_background_tasks_lock = threading.Lock()

MAX_CONCURRENT_SUBAGENTS = 3  # SubagentLimitMiddleware 使用此常量
```

**线程池分层**：
- `_scheduler_pool`：调度提交（快速，提交到 execution pool 后立即返回）
- `_execution_pool`：实际 agent 执行（慢，有 LLM 调用）

**SubagentResult 结构**：
```python
@dataclass
class SubagentResult:
    task_id: str
    trace_id: str
    status: SubagentStatus  # PENDING / RUNNING / COMPLETED / FAILED / TIMED_OUT
    result: str | None
    error: str | None
    started_at: datetime | None
    completed_at: datetime | None
    ai_messages: list[dict[str, Any]]  # 完整 AI 消息历史
```

### 4.6 两个内置子 Agent

| 子 Agent | 用途 | 工具策略 | 特点 |
|----------|------|---------|------|
| `general-purpose` | 复杂多步任务 | 继承全部（排除 task） | 通用，需要复杂推理+多步执行 |
| `bash` | 命令执行专家 | 仅 bash 工具 | 仅在允许 bash 时可用 |

### 4.7 SubagentLimitMiddleware（并行限制）

```python
# subagent_limit_middleware.py
class SubagentLimitMiddleware(AgentMiddleware):
    """after_model 时截断多余的 task tool_calls"""

    MIN_SUBAGENT_LIMIT = 2
    MAX_SUBAGENT_LIMIT = 4

    def _truncate_task_calls(self, state):
        # 1. 找到最后一条 AI 消息的 tool_calls
        # 2. 统计 name="task" 的调用
        # 3. 如果超过 max_concurrent，保留前 N 个，删除多余的
        # 4. 用 model_copy(update={"tool_calls": truncated}) 替换
```

**设计亮点**：这不是 prompt 级别的限制，而是代码级别的硬截断，更可靠。

### 4.8 与 OpenClaw sessions_spawn 对比

| 维度 | DeerFlow Subagent | OpenClaw sessions_spawn |
|------|-------------------|------------------------|
| 注册机制 | BUILTIN_SUBAGENTS 字典 | agents/ 目录配置 |
| 配置覆盖 | config.yaml 覆盖内置默认值 | 无 |
| 调度方式 | LLM 自主选择 task tool + 参数 | 主 agent 决定 spawn |
| 并行控制 | SubagentLimitMiddleware 硬截断 | 无限制 |
| 工具隔离 | disallowed_tools=["task"] 防递归 | 无内置防递归 |
| 沙箱共享 | 继承父 agent 的 sandbox_state | 无共享 |
| 进度推送 | stream_writer (task_started/running/completed) | 自动完成通知 |
| 结果结构 | SubagentResult (status/result/error/ai_messages) | 纯文本返回 |
| 超时控制 | timeout_seconds + FuturesTimeoutError | gateway timeout |
| 模型选择 | inherit 或独立 | 继承父 session 模型 |
| 任务模板 | prompt + subagent_type + description | Goal + Context + Constraints + Done |
| 链路追踪 | trace_id 贯穿 | 无内置 trace |

### 4.9 增强建议

**对 OpenClaw 的增强建议**：

**P0 — Subagent 并行限制**:
1. 在 AGENTS.md 的 subagent 规范中增加 `max_concurrent_spawn: 3` 约束
2. 创建 `subagent-limiter` skill，在 spawn 前检查当前活跃 subagent 数量

**P1 — 结构化结果模板**:
1. 扩展四要素模板，增加 `Result` 字段定义：
   ```
   ## Meta
   - **result_format**: "summary: str, files: list[str], status: success|failed"
   - **max_concurrent**: 3
   ```
2. 这样 subagent 返回的结果可以更结构化，便于主 agent 汇总

**P2 — 防递归嵌套**:
1. 在 subagent 的 context 中标记 `parent_depth`，深度 >= 2 时禁止 spawn
2. 或在 sessions_spawn 的 agent 定义中默认不包含 spawn 能力

**P3 — 链路追踪**:
1. 利用 OpenClaw 的 session ID 作为 trace_id
2. 在 subagent-log.md 中记录完整的 parent → child 链路

**P4 — 子 Agent 类型化**:
1. 参考 DeerFlow 的 registry 模式，在 `agents/` 目录下预定义几种常用类型：
   - `coding-agent` — 已有
   - `research-agent` — 仅 web_search + web_fetch
   - `data-agent` — 仅文件读写 + 数据分析工具
2. 主 agent 在 spawn 时选择类型，自动限制可用工具

---

## 总结：最值得借鉴的 5 个设计

| # | 设计模式 | 来源模块 | 借鉴价值 |
|---|---------|---------|---------|
| 1 | **Protocol-based Provider** | GuardrailProvider | 任何实现了 evaluate 方法的类都可以作为 provider，无需继承基类 |
| 2 | **虚拟路径映射 + 最长前缀优先** | Sandbox | 统一抽象不同隔离模式（本地/容器/K8s），对上层透明 |
| 3 | **代码级硬截断** | SubagentLimitMiddleware | 比 prompt 约束更可靠的资源限制方式 |
| 4 | **温池复用 + LRU** | AioSandboxProvider | 减少容器冷启动，同时控制资源上限 |
| 5 | **多维度触发条件** | SummarizationConfig | messages/tokens/fraction 混合触发，比单一阈值更灵活 |
