# OpenHarness 工具系统深度分析

> 仓库: https://github.com/HKUDS/OpenHarness (Python)
> 分析日期: 2026-04-05
> 源码路径: `src/openharness/tools/`

---

## 1. 架构概览

OpenHarness 的工具系统采用 **ABC + Pydantic + Registry** 三层架构：

```
BaseTool (ABC)          ← 抽象基类，定义接口契约
  ├── name              ← 工具标识符
  ├── description       ← LLM 可见的描述文本
  ├── input_model       ← Pydantic BaseModel 子类
  ├── execute()         ← 核心执行方法 (async)
  ├── is_read_only()    ← 权限判断钩子
  └── to_api_schema()   ← 自动生成 JSON Schema

ToolRegistry            ← 工具注册中心
  ├── register()        ← 注册工具实例
  ├── get()             ← 按名称查找
  ├── list_tools()      ← 列出所有工具
  └── to_api_schema()   ← 批量输出 API Schema

ToolExecutionContext    ← 执行上下文
  ├── cwd               ← 工作目录 (Path)
  └── metadata          ← 扩展元数据 (dict)

ToolResult              ← 统一返回值
  ├── output            ← 文本输出
  ├── is_error          ← 是否出错
  └── metadata          ← 附加元数据
```

### 设计亮点

1. **Pydantic 驱动的自描述 Schema**: 每个工具的 `input_model` 是 Pydantic BaseModel，调用 `model_json_schema()` 自动生成符合 Anthropic Messages API 的 JSON Schema，零手工维护
2. **读写分离钩子**: `is_read_only()` 方法为权限系统提供切入点，工具可覆盖此方法声明自身是否只读
3. **统一的 async 接口**: 所有 `execute()` 方法均为 async，支持高并发工具调用
4. **Metadata 扩展点**: `ToolExecutionContext.metadata` 是一个开放的 dict，允许外部注入 `tool_registry`、`mcp_manager`、`ask_user_prompt` 等运行时依赖

---

## 2. 工具注册机制

### 2.1 静态注册

`__init__.py` 中的 `create_default_tool_registry()` 工厂函数是核心入口：

```python
def create_default_tool_registry(mcp_manager=None) -> ToolRegistry:
    registry = ToolRegistry()
    for tool in (
        BashTool(),
        AskUserQuestionTool(),
        FileReadTool(),
        # ... 37 个内置工具
    ):
        registry.register(tool)
    if mcp_manager is not None:
        # 动态注册 MCP 资源工具
        registry.register(ListMcpResourcesTool(mcp_manager))
        registry.register(ReadMcpResourceTool(mcp_manager))
        # 动态注册所有 MCP 暴露的工具
        for tool_info in mcp_manager.list_tools():
            registry.register(McpToolAdapter(mcp_manager, tool_info))
    return registry
```

### 2.2 MCP 动态注册

`McpToolAdapter` 在运行时将 MCP 服务器暴露的工具自动适配为 OpenHarness 工具：

```python
class McpToolAdapter(BaseTool):
    def __init__(self, manager, tool_info):
        self.name = f"mcp__{server_segment}__{tool_segment}"
        self.description = tool_info.description
        self.input_model = _input_model_from_schema(self.name, tool_info.input_schema)
```

关键适配逻辑 `_input_model_from_schema()` 使用 `pydantic.create_model()` 动态生成 Pydantic 模型，将 MCP 的 JSON Schema 转换为可验证的 Python 对象：

```python
def _input_model_from_schema(tool_name, schema):
    fields = {}
    required = set(schema.get("required", []))
    for key in properties:
        default = ... if key in required else None
        fields[key] = (object | None, Field(default=default))
    return create_model(f"{tool_name.title()}Input", **fields)
```

### 2.3 注册流程图

```
应用启动
  │
  ├─→ new ToolRegistry()
  ├─→ 实例化 37 个内置 BaseTool 子类
  ├─→ registry.register(tool) × 37
  │
  ├─→ [可选] mcp_manager.list_tools()
  │     └─→ McpToolAdapter × N → registry.register()
  │
  └─→ registry.to_api_schema() → LLM 工具定义列表
```

---

## 3. 完整工具清单（39 个内置 + N 个动态 MCP）

### 3.1 文件操作 (6)

| # | 工具名 | 类 | 文件 | 只读 | 说明 |
|---|--------|-----|------|------|------|
| 1 | `bash` | BashTool | bash_tool.py | ✗ | Shell 命令执行，支持 cwd 覆盖和超时 |
| 2 | `read_file` | FileReadTool | file_read_tool.py | ✓ | 读文件，支持 offset/limit 分页 |
| 3 | `write_file` | FileWriteTool | file_write_tool.py | ✗ | 写文件，自动创建目录 |
| 4 | `edit_file` | FileEditTool | file_edit_tool.py | ✗ | 字符串替换编辑，支持 replace_all |
| 5 | `notebook_edit` | NotebookEditTool | notebook_edit_tool.py | ✗ | Jupyter notebook 单元格编辑 |
| 6 | `glob` | GlobTool | glob_tool.py | ✓ | 文件系统 glob 匹配，优先用 ripgrep |

### 3.2 代码智能 (2)

| # | 工具名 | 类 | 文件 | 只读 | 说明 |
|---|--------|-----|------|------|------|
| 7 | `grep` | GrepTool | grep_tool.py | ✓ | 正则搜索文件内容，ripgrep + Python fallback |
| 8 | `lsp` | LspTool | lsp_tool.py | ✓ | Python 代码智能（定义跳转、引用查找、符号搜索、hover） |

### 3.3 Web (2)

| # | 工具名 | 类 | 文件 | 只读 | 说明 |
|---|--------|-----|------|------|------|
| 9 | `web_fetch` | WebFetchTool | web_fetch_tool.py | ✓ | 获取网页内容，HTML→text 转换 |
| 10 | `web_search` | WebSearchTool | web_search_tool.py | ✓ | DuckDuckGo HTML 搜索，支持自定义后端 |

### 3.4 MCP 协议 (3 + N 动态)

| # | 工具名 | 类 | 文件 | 只读 | 说明 |
|---|--------|-----|------|------|------|
| 11 | `mcp_auth` | McpAuthTool | mcp_auth_tool.py | ✗ | 配置 MCP 服务器认证 |
| 12 | `list_mcp_resources` | ListMcpResourcesTool | list_mcp_resources_tool.py | ✓ | 列出 MCP 资源 |
| 13 | `read_mcp_resource` | ReadMcpResourceTool | read_mcp_resource_tool.py | ✓ | 读取 MCP 资源 |
| 14+ | `mcp__{server}__{tool}` | McpToolAdapter | mcp_tool.py | 取决于工具 | 动态适配的 MCP 工具 |

### 3.5 后台任务 (6)

| # | 工具名 | 类 | 文件 | 只读 | 说明 |
|---|--------|-----|------|------|------|
| 15 | `task_create` | TaskCreateTool | task_create_tool.py | ✗ | 创建后台任务 (bash/agent) |
| 16 | `task_list` | TaskListTool | task_list_tool.py | ✓ | 列出后台任务 |
| 17 | `task_get` | TaskGetTool | task_get_tool.py | ✓ | 获取任务详情 |
| 18 | `task_update` | TaskUpdateTool | task_update_tool.py | ✗ | 更新任务元数据 |
| 19 | `task_stop` | TaskStopTool | task_stop_tool.py | ✗ | 停止后台任务 |
| 20 | `task_output` | TaskOutputTool | task_output_tool.py | ✓ | 读取任务输出日志 |

### 3.6 Agent 协作 (4)

| # | 工具名 | 类 | 文件 | 只读 | 说明 |
|---|--------|-----|------|------|------|
| 21 | `agent` | AgentTool | agent_tool.py | ✗ | 派发子 Agent（local/remote/in-process） |
| 22 | `send_message` | SendMessageTool | send_message_tool.py | ✗ | 向运行中的 Agent 发送消息 |
| 23 | `team_create` | TeamCreateTool | team_create_tool.py | ✗ | 创建内存团队 |
| 24 | `team_delete` | TeamDeleteTool | team_delete_tool.py | ✗ | 删除内存团队 |

### 3.7 定时任务 (4)

| # | 工具名 | 类 | 文件 | 只读 | 说明 |
|---|--------|-----|------|------|------|
| 25 | `cron_create` | CronCreateTool | cron_create_tool.py | ✗ | 创建定时任务 |
| 26 | `cron_list` | CronListTool | cron_list_tool.py | ✓ | 列出定时任务 |
| 27 | `cron_delete` | CronDeleteTool | cron_delete_tool.py | ✗ | 删除定时任务 |
| 28 | `cron_toggle` | CronToggleTool | cron_toggle_tool.py | ✗ | 启用/禁用定时任务 |

### 3.8 工作流与模式 (4)

| # | 工具名 | 类 | 文件 | 只读 | 说明 |
|---|--------|-----|------|------|------|
| 29 | `enter_worktree` | EnterWorktreeTool | enter_worktree_tool.py | ✗ | 创建 git worktree |
| 30 | `exit_worktree` | ExitWorktreeTool | exit_worktree_tool.py | ✗ | 删除 git worktree |
| 31 | `enter_plan_mode` | EnterPlanModeTool | enter_plan_mode_tool.py | ✗ | 切换到计划模式 |
| 32 | `exit_plan_mode` | ExitPlanModeTool | exit_plan_mode_tool.py | ✗ | 退出计划模式 |

### 3.9 元数据与配置 (4)

| # | 工具名 | 类 | 文件 | 只读 | 说明 |
|---|--------|-----|------|------|------|
| 33 | `config` | ConfigTool | config_tool.py | ✗ | 读取/更新设置 |
| 34 | `skill` | SkillTool | skill_tool.py | ✓ | 读取技能内容 |
| 35 | `tool_search` | ToolSearchTool | tool_search_tool.py | ✓ | 搜索工具列表 |
| 36 | `todo_write` | TodoWriteTool | todo_write_tool.py | ✗ | 写入 TODO 清单 |

### 3.10 辅助工具 (3)

| # | 工具名 | 类 | 文件 | 只读 | 说明 |
|---|--------|-----|------|------|------|
| 37 | `ask_user_question` | AskUserQuestionTool | ask_user_question_tool.py | ✓ | 向用户提问并返回回答 |
| 38 | `brief` | BriefTool | brief_tool.py | ✓ | 文本截断缩短 |
| 39 | `sleep` | SleepTool | sleep_tool.py | ✓ | 暂停执行 |

### 3.11 外部触发 (1)

| # | 工具名 | 类 | 文件 | 只读 | 说明 |
|---|--------|-----|------|------|------|
| 40 | `remote_trigger` | RemoteTriggerTool | remote_trigger_tool.py | ✗ | 立即触发已注册的 cron 任务 |

> **注**: 加上动态注册的 MCP 工具，总工具数可达 43+。`__init__.py` 中显式注册了 37 个内置工具 + 3 个 MCP 基础工具 = 40 个，加上可选的 N 个 `McpToolAdapter`。

---

## 4. 核心工具深入分析

### 4.1 BashTool — Shell 命令执行

**文件**: `bash_tool.py`

```python
class BashToolInput(BaseModel):
    command: str = Field(description="Shell command to execute")
    cwd: str | None = Field(default=None, description="Working directory override")
    timeout_seconds: int = Field(default=120, ge=1, le=600)
```

**关键设计**:
- 使用 `create_shell_subprocess()` 工厂方法创建子进程，支持沙箱检测（`SandboxUnavailableError`）
- `asyncio.wait_for` 实现超时控制，超时后 `process.kill()`
- 输出截断在 12000 字符，防止上下文溢出
- `returncode != 0` 时标记 `is_error=True`
- 与权限系统集成：非只读工具，受 `PermissionMode` 控制

**输入验证**: Pydantic 约束 `timeout_seconds` 在 1-600 之间

### 4.2 FileReadTool — 文件读取

**文件**: `file_read_tool.py`

```python
class FileReadToolInput(BaseModel):
    path: str = Field(description="Path of the file to read")
    offset: int = Field(default=0, ge=0, description="Zero-based starting line")
    limit: int = Field(default=200, ge=1, le=2000, description="Number of lines to return")
```

**关键设计**:
- 路径解析支持绝对/相对路径 + `~` 展开
- 二进制文件检测（`\x00` 字节）防止乱码
- 输出带行号，默认读取 200 行，最大 2000 行
- 声明为 `is_read_only = True`，权限系统跳过确认

### 4.3 GrepTool — 内容搜索

**文件**: `grep_tool.py`

```python
class GrepToolInput(BaseModel):
    pattern: str = Field(description="Regular expression to search for")
    root: str | None = Field(default=None, description="Search root directory")
    file_glob: str = Field(default="**/*")
    case_sensitive: bool = Field(default=True)
    limit: int = Field(default=200, ge=1, le=2000)
```

**关键设计**:
- **双引擎架构**: 优先用 `ripgrep`（`shutil.which("rg")`），不存在时自动回退到纯 Python 实现
- ripgrep 的优势：尊重 `.gitignore`、速度极快、流式输出（逐行读取避免内存爆炸）
- 智能隐藏文件检测：当搜索目录有 `.git/` 或 `.gitignore` 时自动添加 `--hidden` 标志
- 输出格式兼容 `path:line:text`
- limit 控制匹配数量，防止上下文溢出

### 4.4 McpToolAdapter — MCP 协议适配

**文件**: `mcp_tool.py`

```python
class McpToolAdapter(BaseTool):
    def __init__(self, manager: McpClientManager, tool_info: McpToolInfo):
        self.name = f"mcp__{server_segment}__{tool_segment}"
        self.description = tool_info.description
        self.input_model = _input_model_from_schema(self.name, tool_info.input_schema)

    async def execute(self, arguments, context):
        output = await self._manager.call_tool(
            self._tool_info.server_name,
            self._tool_info.name,
            arguments.model_dump(mode="json"),
        )
        return ToolResult(output=output)
```

**关键设计**:
- **零代码适配**: 将任意 MCP 工具自动转换为 OpenHarness 工具，只需 `McpToolInfo`（name, description, input_schema）
- 名称命名空间隔离: `mcp__{server}__{tool}` 防止名称冲突
- `pydantic.create_model()` 动态生成输入验证模型，支持 required/optional 字段
- `_sanitize_tool_segment()` 确保工具名符合标识符规范
- 参数通过 `model_dump(mode="json")` 序列化为 JSON 传给 MCP 客户端

### 4.5 AgentTool — 子 Agent 派发

**文件**: `agent_tool.py`

```python
class AgentToolInput(BaseModel):
    description: str = Field(description="Short description of the delegated work")
    prompt: str = Field(description="Full prompt for the local agent")
    subagent_type: str | None = Field(...)
    model: str | None = Field(default=None)
    command: str | None = Field(default=None, description="Override spawn command")
    team: str | None = Field(default=None, description="Optional team to attach the agent to")
    mode: str = Field(default="local_agent", description="Agent mode: local_agent, remote_agent, or in_process_teammate")
```

**关键设计**:
- **三种执行模式**: `local_agent`（子进程）、`remote_agent`（远程）、`in_process_teammate`（进程内协程）
- 与 Agent 定义系统集成：通过 `get_agent_definition(subagent_type)` 查找预定义的 Agent 模板（model、system_prompt、permissions）
- 后端注册表动态选择：优先 `in_process` → `subprocess` → 默认后端
- 团队系统集成：可选将 Agent 注册到指定团队
- 返回 `agent_id` 和 `task_id`，供后续 `send_message` 工具使用

### 4.6 LspTool — 代码智能

**文件**: `lsp_tool.py`

**关键设计**:
- **多操作统一入口**: 一个工具支持 5 种操作（`document_symbol`, `workspace_symbol`, `go_to_definition`, `find_references`, `hover`），通过 Pydantic `Literal` 类型约束
- **model_validator** 交叉验证：不同操作要求不同的必填字段组合
- 目前仅支持 Python 文件（`.py` 后缀检测）
- 调用 `openharness.services.lsp` 模块提供代码智能能力

---

## 5. 输入验证体系 (Pydantic)

### 5.1 验证策略

所有工具使用 Pydantic v2 的声明式验证：

| 验证类型 | 示例 | 工具 |
|---------|------|------|
| `ge` / `le` | `timeout_seconds: int = Field(default=120, ge=1, le=600)` | BashTool |
| `Literal` | `operation: Literal["document_symbol", "workspace_symbol", ...]` | LspTool |
| `model_validator` | `validate_arguments()` 交叉验证操作和字段 | LspTool |
| `default=None` | 可选字段模式 | 大多数工具 |
| `Field(description=...)` | 每个字段都有 LLM 可见的描述 | 所有工具 |

### 5.2 Schema 自动生成

```python
def to_api_schema(self) -> dict[str, Any]:
    return {
        "name": self.name,
        "description": self.description,
        "input_schema": self.input_model.model_json_schema(),  # 自动生成
    }
```

Pydantic 的 `model_json_schema()` 生成标准 JSON Schema，包含：
- `type`、`properties`、`required`
- `description`、`default`、`minimum`、`maximum`、`enum`
- 完全兼容 Anthropic Messages API 的 tool_use schema

### 5.3 MCP Schema 适配

```python
def _input_model_from_schema(tool_name, schema):
    properties = schema.get("properties", {})
    required = set(schema.get("required", []))
    fields = {}
    for key in properties:
        default = ... if key in required else None
        fields[key] = (object | None, Field(default=default))
    return create_model(f"{tool_name.title()}Input", **fields)
```

注意：MCP 适配时使用了 `object | None` 作为字段类型，意味着**不做深度类型验证**——这是合理的折中，因为 MCP 工具的 schema 类型多样且不可控。

---

## 6. 工具与 Hook 系统的交互

### 6.1 Hook 事件定义

```python
class HookEvent(str, Enum):
    SESSION_START = "session_start"
    SESSION_END = "session_end"
    PRE_TOOL_USE = "pre_tool_use"    # ← 工具调用前
    POST_TOOL_USE = "post_tool_use"  # ← 工具调用后
```

### 6.2 Hook 执行流程

```
Agent 决定调用工具 → PRE_TOOL_USE hook
  │
  ├─→ HookExecutor.execute(HookEvent.PRE_TOOL_USE, payload)
  │     payload = {"tool_name": "bash", "arguments": {...}}
  │
  ├─→ 匹配 hook 的 matcher (fnmatch)
  │     ├─ CommandHookDefinition → 执行 shell 命令
  │     ├─ HttpHookDefinition    → 发送 HTTP POST
  │     ├─ PromptHookDefinition  → LLM 判断 (快速)
  │     └─ AgentHookDefinition   → LLM 判断 (深度推理)
  │
  ├─→ AggregatedHookResult
  │     ├─ blocked=True  → 工具调用被拦截
  │     └─ blocked=False → 继续执行
  │
  ├─→ [如果未拦截] tool.execute(arguments, context) → ToolResult
  │
  └─→ POST_TOOL_USE hook
        payload = {"tool_name": "bash", "arguments": {...}, "output": "...", "is_error": false}
```

### 6.3 四种 Hook 类型

| Hook 类型 | 执行方式 | 典型用途 |
|-----------|---------|---------|
| `CommandHookDefinition` | Shell 命令，注入 `$ARGUMENTS` 环境变量 | 预/后处理脚本 |
| `HttpHookDefinition` | HTTP POST，payload 为 JSON | Webhook 通知、审计日志 |
| `PromptHookDefinition` | 快速 LLM 判断，512 tokens | 简单规则验证 |
| `AgentHookDefinition` | 深度 LLM 推理，512 tokens | 复杂安全审计 |

### 6.4 Hook 匹配机制

```python
def _matches_hook(hook, payload):
    matcher = getattr(hook, "matcher", None)
    if not matcher:
        return True  # 无 matcher 匹配所有
    subject = str(payload.get("tool_name") or payload.get("prompt") or "")
    return fnmatch.fnmatch(subject, matcher)  # glob 模式匹配
```

可以针对特定工具名设置 hook，例如 `matcher="bash*"` 或 `matcher="*write*"`。

### 6.5 权限模式与工具的交互

```python
# enter_plan_mode_tool.py
class EnterPlanModeTool(BaseTool):
    async def execute(self, arguments, context):
        settings.permission.mode = PermissionMode.PLAN
        # PLAN 模式下，写操作工具需要用户确认
```

权限模式（`PermissionMode`）直接集成在工具执行流程中，`enter_plan_mode` / `exit_plan_mode` 工具通过修改全局设置来改变后续工具调用的权限检查行为。

---

## 7. 设计模式总结

### 7.1 采用的模式

| 模式 | 体现 |
|------|------|
| **策略模式** | `BaseTool.execute()` 由每个子类实现不同策略 |
| **适配器模式** | `McpToolAdapter` 将 MCP 工具适配为 OpenHarness 工具 |
| **工厂模式** | `create_default_tool_registry()` 工厂函数 |
| **注册表模式** | `ToolRegistry` 管理工具的注册与查找 |
| **模板方法** | `ToolResult` 统一返回格式 |
| **观察者模式** | Hook 系统的 pre/post 事件通知 |
| **管道模式** | ripgrep → Python fallback 的双引擎架构 |

### 7.2 扩展机制

添加新工具只需 3 步：
1. 创建 `XxxTool(BaseTool)` 子类，定义 `name`、`description`、`input_model`、`execute()`
2. 在 `create_default_tool_registry()` 中实例化并注册
3. 可选覆盖 `is_read_only()` 声明读写属性

添加 MCP 工具只需：
1. 配置 MCP 服务器
2. 工具自动发现并注册为 `McpToolAdapter`

---

## 8. 统计数据

| 指标 | 数值 |
|------|------|
| 内置工具总数 | 39 |
| MCP 基础工具 | 3 (mcp_auth, list_mcp_resources, read_mcp_resource) |
| 动态 MCP 适配器 | N (取决于已连接的 MCP 服务器) |
| 只读工具 | 15 |
| 写入工具 | 24 |
| 每工具平均源码行数 | ~80 行 |
| 总源码文件数 | 42 个 .py 文件 |
| 外部依赖 | pydantic, httpx, asyncio |
