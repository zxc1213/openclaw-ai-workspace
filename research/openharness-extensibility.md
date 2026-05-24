# OpenHarness 可扩展性系统深入分析

> 仓库: https://github.com/HKUDS/OpenHarness (Python)
> 分析日期: 2026-04-05
> 分析范围: Hooks / Permissions / Skills / Plugins 四大子系统

---

## 目录

1. [系统总览](#1-系统总览)
2. [Hooks 系统](#2-hooks-系统)
3. [Permissions 系统](#3-permissions-系统)
4. [Skills 系统](#4-skills-系统)
5. [Plugins 系统](#5-plugins-系统)
6. [系统协作流程](#6-系统协作流程)
7. [与 OpenClaw 对比](#7-与-openclaw-对比)
8. [设计亮点与不足](#8-设计亮点与不足)

---

## 1. 系统总览

OpenHarness 是港大 HKUDS 开发的开源 AI Agent 编排框架，兼容 Claude Code 生态。其可扩展性由四个协作子系统构成：

```
┌─────────────────────────────────────────────────────────┐
│                    OpenHarness Core                       │
│                                                          │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Settings │──│   Hooks      │──│ HookExecutor      │  │
│  │ (JSON)   │  │   Registry   │  │ (event dispatch)  │  │
│  └────┬─────┘  └──────┬───────┘  └────────┬──────────┘  │
│       │               │                    │             │
│       │  ┌────────────┴────────────────┐    │             │
│       │  │        Plugins              │    │             │
│       │  │  (manifest: skills/hooks/mcp)│   │             │
│       │  └────────────┬────────────────┘    │             │
│       │               │                    │             │
│  ┌────┴─────┐  ┌──────┴───────┐  ┌────────┴──────────┐  │
│  │Permission│  │   Skills     │  │ HotReloader       │  │
│  │ Checker  │  │   Registry   │  │ (file mtime watch) │  │
│  └──────────┘  └──────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 关键设计原则

- **配置即代码**: 所有行为通过 `~/.openharness/settings.json` 声明式配置
- **Claude Code 兼容**: 目录结构 `.claude/skills/` 与 Claude Code 一致
- **Pydantic 驱动**: 所有 schema 使用 Pydantic BaseModel，强类型验证
- **Plugin 作为一等公民**: Plugin 可同时贡献 Skills、Hooks、MCP Servers

---

## 2. Hooks 系统

### 2.1 架构概览

```
settings.json ──┐
                ├── load_hook_registry() ──→ HookRegistry
plugin hooks ───┘                              │
                                               │
                                        HookExecutor.execute(event, payload)
                                               │
                              ┌────────────────┼────────────────┐
                              │                │                │
                        CommandHook      PromptHook       HttpHook / AgentHook
                        (subprocess)     (LLM validate)  (HTTP POST / deeper LLM)
```

### 2.2 事件类型 (`events.py`)

```python
class HookEvent(str, Enum):
    SESSION_START = "session_start"    # 会话开始时
    SESSION_END   = "session_end"      # 会话结束时
    PRE_TOOL_USE  = "pre_tool_use"     # 工具调用前（可阻断）
    POST_TOOL_USE = "post_tool_use"    # 工具调用后（只通知）
```

四种事件覆盖了 Agent 生命周期的关键节点。`PRE_TOOL_USE` 是安全控制的核心——所有工具调用前都会经过 hook 检查。

### 2.3 Hook 类型 (`schemas.py`)

| 类型 | 说明 | 执行方式 | 默认阻断 |
|------|------|----------|----------|
| `command` | Shell 命令 | `asyncio.create_subprocess` | ❌ |
| `prompt` | LLM 快速验证 | 调用 LLM API, max_tokens=512 | ✅ |
| `http` | HTTP POST 通知 | `httpx.AsyncClient` | ❌ |
| `agent` | LLM 深度验证 | 调用 LLM API, 更严谨的 system prompt | ✅ |

**Prompt vs Agent 的区别**:
- `prompt`: 简单的二元验证，system prompt 为基础模板
- `agent`: 更深入的推理验证，system prompt 额外包含 "Be more thorough and reason over the payload before deciding"，默认超时更长（60s vs 30s）

**每个 Hook 的通用字段**:
```python
timeout_seconds: int = 30     # 超时时间 (1-600/1200)
matcher: str | None = None    # glob 匹配器（匹配 tool_name/prompt/event）
block_on_failure: bool        # 失败时是否阻断后续执行
```

### 2.4 匹配器机制 (`executor.py`)

```python
def _matches_hook(hook, payload):
    matcher = getattr(hook, "matcher", None)
    if not matcher:
        return True  # 无 matcher = 匹配所有
    subject = payload.get("tool_name") or payload.get("prompt") or payload.get("event") or ""
    return fnmatch.fnmatch(subject, matcher)
```

- 使用 `fnmatch` glob 模式匹配
- 匹配对象优先级: `tool_name` > `prompt` > `event`
- 无 matcher 时匹配所有事件（全量拦截）

### 2.5 执行引擎 (`executor.py`)

`HookExecutor` 是核心执行引擎：

```python
async def execute(event, payload) -> AggregatedHookResult:
    for hook in registry.get(event):
        if not _matches_hook(hook, payload):
            continue
        # 按类型分派到不同的执行器
        if isinstance(hook, CommandHookDefinition):  → _run_command_hook()
        elif isinstance(hook, HttpHookDefinition):   → _run_http_hook()
        elif isinstance(hook, PromptHookDefinition): → _run_prompt_like_hook(agent_mode=False)
        elif isinstance(hook, AgentHookDefinition):  → _run_prompt_like_hook(agent_mode=True)
    return AggregatedHookResult(results)
```

**关键特性**:
1. **顺序执行**: 同一事件的多个 hook 按注册顺序依次执行
2. **环境变量注入**: Command hook 自动注入 `OPENHARNESS_HOOK_EVENT` 和 `OPENHARNESS_HOOK_PAYLOAD`
3. **模板变量替换**: `$ARGUMENTS` 会被替换为 JSON 序列化的 payload
4. **JSON 容错解析**: LLM 返回的内容支持 JSON 和自然语言（"ok"/"true"/"yes" → 允许）
5. **超时控制**: 所有 hook 类型都有超时机制，超时后进程被 kill

### 2.6 热重载 (`hot_reload.py`)

```python
class HookReloader:
    def current_registry(self) -> HookRegistry:
        stat = self._settings_path.stat()
        if stat.st_mtime_ns != self._last_mtime_ns:
            self._last_mtime_ns = stat.st_mtime_ns
            self._registry = load_hook_registry(load_settings(self._settings_path))
        return self._registry
```

- **基于文件 mtime 的轮询检测**: 比较 `st_mtime_ns` 纳秒级时间戳
- **懒加载**: 只在调用 `current_registry()` 时检查
- **不监听 Plugin hooks 的变化**: 仅对 settings.json 生效
- **优雅降级**: settings 文件不存在时返回空 Registry

### 2.7 结果聚合 (`types.py`)

```python
@dataclass(frozen=True)
class HookResult:
    hook_type: str
    success: bool
    output: str = ""
    blocked: bool = False
    reason: str = ""
    metadata: dict[str, Any] = {}

@dataclass(frozen=True)
class AggregatedHookResult:
    results: list[HookResult]
    
    @property
    def blocked(self) -> bool:
        return any(result.blocked for result in self.results)
```

- 只要有一个 hook 的 `blocked=True`，整体就被阻断
- `blocked` 属性会返回第一个阻断原因

### 2.8 加载流程 (`loader.py`)

```python
def load_hook_registry(settings, plugins=None) -> HookRegistry:
    registry = HookRegistry()
    # 1. 从 settings.json 加载
    for raw_event, hooks in settings.hooks.items():
        registry.register(HookEvent(raw_event), hook)
    # 2. 从已启用的 plugins 加载
    for plugin in (plugins or []):
        if plugin.enabled:
            for raw_event, hooks in plugin.hooks.items():
                registry.register(HookEvent(raw_event), hook)
    return registry
```

Hook 来源有两个：**settings 全局配置** 和 **plugin 贡献**。两者合并到同一个 Registry 中。

---

## 3. Permissions 系统

### 3.1 权限模式 (`modes.py`)

```python
class PermissionMode(str, Enum):
    DEFAULT   = "default"      # 变更操作需确认
    PLAN      = "plan"          # 阻断所有变更操作
    FULL_AUTO = "full_auto"     # 全自动放行
```

| 模式 | 只读工具 | 变更工具 | 说明 |
|------|----------|----------|------|
| `default` | ✅ 自动放行 | ⚠️ 需用户确认 | 默认安全模式 |
| `plan` | ✅ 自动放行 | ❌ 阻断 | 纯规划模式 |
| `full_auto` | ✅ 自动放行 | ✅ 自动放行 | 全自动（危险） |

### 3.2 检查流程 (`checker.py`)

```
evaluate(tool_name, is_read_only, file_path, command)
    │
    ├─ 1. denied_tools 检查 → 命中则直接拒绝
    ├─ 2. allowed_tools 检查 → 命中则直接放行
    ├─ 3. path_rules 检查 → 文件路径匹配 deny rule 则拒绝
    ├─ 4. denied_commands 检查 → 命令匹配 deny pattern 则拒绝
    ├─ 5. FULL_AUTO 模式 → 放行
    ├─ 6. 只读工具 → 放行
    ├─ 7. PLAN 模式 → 阻断
    └─ 8. DEFAULT 模式 → requires_confirmation=True
```

**返回值**:
```python
@dataclass(frozen=True)
class PermissionDecision:
    allowed: bool                  # 是否允许
    requires_confirmation: bool     # 是否需要用户确认
    reason: str                    # 原因说明
```

### 3.3 路径规则

```python
class PathRule:
    pattern: str    # glob 模式
    allow: bool     # True=允许, False=拒绝
```

配置示例（settings.json）:
```json
{
  "permission": {
    "path_rules": [
      {"pattern": "/etc/**", "allow": false},
      {"pattern": "/home/user/project/**", "allow": true}
    ],
    "denied_commands": ["rm -rf /*", "sudo *"],
    "denied_tools": ["dangerous_tool"],
    "allowed_tools": ["read_file", "grep"]
  }
}
```

### 3.4 检查优先级

检查链有明确的优先级顺序：
1. **Tool 黑名单** → 最高优先级，直接拒绝
2. **Tool 白名单** → 第二优先级，直接放行
3. **Path 规则** → 文件级粒度控制
4. **Command 黑名单** → 命令模式匹配
5. **Mode 决策** → 最终根据模式决定

这个设计保证了无论 mode 是什么，显式的黑名单始终生效。

---

## 4. Skills 系统

### 4.1 数据模型 (`types.py`)

```python
@dataclass(frozen=True)
class SkillDefinition:
    name: str           # 技能名称
    description: str    # 描述（用于匹配）
    content: str        # Markdown 完整内容
    source: str         # 来源: "user" | "plugin" | "bundled"
    path: str | None    # 文件路径
```

### 4.2 发现机制 (`loader.py`)

Skills 从三个来源加载，优先级从低到高：

```
1. Bundled Skills（内置技能）
   └─ get_bundled_skills() → 编译时嵌入的技能

2. User Skills（用户技能）
   └─ ~/.openharness/skills/*.md → 用户自定义 Markdown 文件

3. Plugin Skills（插件技能）
   └─ plugin_dir/{skills_dir}/*.md → 插件提供的技能
   └─ plugin_dir/commands/*.md → 插件命令（也视为技能）
   └─ plugin_dir/agents/*.md → 插件 agent 定义（也视为技能）
```

### 4.3 加载流程

```python
def load_skill_registry(cwd) -> SkillRegistry:
    registry = SkillRegistry()
    # 1. 加载内置技能
    for skill in get_bundled_skills():
        registry.register(skill)
    # 2. 加载用户技能
    for skill in load_user_skills():
        registry.register(skill)
    # 3. 加载插件技能（需要 cwd 上下文）
    if cwd is not None:
        for plugin in load_plugins(settings, cwd):
            if plugin.enabled:
                for skill in plugin.skills:
                    registry.register(skill)
    return registry
```

### 4.4 Markdown 解析

支持两种元数据格式：

**YAML Frontmatter（推荐）**:
```markdown
---
name: harness-eval
description: Test the harness with real API calls
version: 0.2.0
---
# Harness Eval
...
```

**Heading 回退**:
- 无 frontmatter 时，从 `# 标题` 提取 name
- 从第一个非空、非 `---`、非 `#` 的行提取 description（截取前 200 字符）

### 4.5 Registry

```python
class SkillRegistry:
    def register(skill)     # 注册（同名覆盖）
    def get(name)           # 按名称查找
    def list_skills()       # 返回所有（按名称排序）
```

- **同名覆盖**: 后加载的 skill 会覆盖先加载的（Plugin > User > Bundled）
- **按名索引**: 只支持精确名称匹配，无模糊搜索

### 4.6 Claude Code 兼容性

项目同时维护了两个技能目录：

| 路径 | 用途 |
|------|------|
| `.claude/skills/` | Claude Code 原生格式（含 references/ 子目录） |
| `.agents/skills` | 符号链接，指向 `.claude/skills` |

```bash
# .agents/skills 是一个 symlink
.agents/skills → ../.claude/skills
```

示例 Skill（harness-eval）的结构：
```
.claude/skills/harness-eval/
├── SKILL.md                          # 主文件（YAML frontmatter + Markdown）
└── references/
    ├── feature-matrix.md             # 引用材料
    └── test-patterns.md              # 引用材料
```

OpenHarness 自身的 Skills 同时服务于 Claude Code 和 OpenHarness 运行时——这是一个双兼容设计。

---

## 5. Plugins 系统

### 5.1 目录结构

Plugin 采用 Claude Code Plugin 兼容的目录布局：

```
plugin-name/
├── plugin.json                    # 清单文件（必需）
├── skills/                        # 技能目录
│   └── *.md
├── commands/                      # 命令目录
│   └── *.md
├── agents/                        # Agent 定义目录
│   └── *.md
├── hooks.json                     # Hook 定义（或 hooks/hooks.json）
├── hooks/
│   └── hooks.json                 # 结构化 Hook 格式
└── mcp.json                       # MCP Server 配置（或 .mcp.json）
```

### 5.2 Manifest (`schemas.py`)

```python
class PluginManifest(BaseModel):
    name: str                       # 插件名称
    version: str = "0.0.0"         # 版本
    description: str = ""           # 描述
    enabled_by_default: bool = True # 默认启用
    skills_dir: str = "skills"      # 技能目录
    hooks_file: str = "hooks.json"  # Hook 文件
    mcp_file: str = "mcp.json"      # MCP 配置文件
    # 扩展字段（兼容 Claude Code）
    author: dict | None = None
    commands: str | list | dict | None = None
    agents: str | list | None = None
    skills: str | list | None = None
    hooks: str | dict | list | None = None
```

### 5.3 发现路径

```python
def discover_plugin_paths(cwd) -> list[Path]:
    roots = [
        get_user_plugins_dir(),       # ~/.openharness/plugins/
        get_project_plugins_dir(cwd), # .openharness/plugins/
    ]
    # 查找包含 plugin.json 的子目录
```

两级发现：
1. **用户级**: `~/.openharness/plugins/{plugin-name}/`
2. **项目级**: `{project}/.openharness/plugins/{plugin-name}/`

### 5.4 Manifest 发现兼容性

```python
def _find_manifest(plugin_dir) -> Path | None:
    # 优先查找 OpenHarness 格式
    plugin_dir / "plugin.json"
    # 兼容 Claude Code 格式
    plugin_dir / ".claude-plugin" / "plugin.json"
```

同时支持 `plugin.json` 和 `.claude-plugin/plugin.json` 两种 manifest 位置。

### 5.5 加载流程 (`loader.py`)

```python
def load_plugin(path, enabled_plugins) -> LoadedPlugin:
    manifest = PluginManifest.model_validate_json(manifest_path.read_text())
    enabled = enabled_plugins.get(manifest.name, manifest.enabled_by_default)
    
    skills = _load_plugin_skills(path / manifest.skills_dir)
    skills += _load_plugin_skills(path / "commands")    # 命令也视为技能
    skills += _load_plugin_skills(path / "agents")      # Agent 定义也视为技能
    
    hooks = _load_plugin_hooks(path / manifest.hooks_file)
    # 回退: hooks/hooks.json（结构化格式）
    hooks = _load_plugin_hooks_structured(hooks_dir_file, plugin_root)
    
    mcp = _load_plugin_mcp(path / manifest.mcp_file)
    # 回退: .mcp.json
    
    return LoadedPlugin(manifest, path, enabled, skills, hooks, mcp_servers, commands)
```

### 5.6 Claude Code Hooks 兼容

`_load_plugin_hooks_structured` 处理 Claude Code 的结构化 hooks 格式：

```python
# Claude Code hooks.json 结构
{
  "hooks": {
    "pre_tool_use": [
      {
        "matcher": "Bash",
        "hooks": [
          {"type": "command", "command": "...", "timeout": 30}
        ]
      }
    ]
  }
}
```

关键兼容处理：
- `${CLAUDE_PLUGIN_ROOT}` 变量替换为实际的插件路径
- matcher 从结构化层级提取并注入到每个 hook

### 5.7 安装/卸载 (`installer.py`)

```python
def install_plugin_from_path(source) -> Path:
    # 从本地路径复制到 ~/.openharness/plugins/
    shutil.copytree(src, dest)

def uninstall_plugin(name) -> bool:
    # 删除 ~/.openharness/plugins/{name}
    shutil.rmtree(path)
```

- 仅支持本地路径安装（无 npm/registry 远程安装）
- 安装时覆盖同名插件
- 无版本管理（简单复制）

### 5.8 LoadedPlugin 类型

```python
@dataclass(frozen=True)
class LoadedPlugin:
    manifest: PluginManifest
    path: Path
    enabled: bool
    skills: list[SkillDefinition]        # 技能列表
    hooks: dict[str, list]               # {event_name: [hook_defs]}
    mcp_servers: dict[str, McpServerConfig]  # MCP 服务器配置
    commands: list[SkillDefinition]      # 命令列表（skills 的子集）
```

一个 Plugin 可以同时贡献四类资源：Skills、Hooks、Commands、MCP Servers。

---

## 6. 系统协作流程

### 6.1 初始化流程

```
启动 OpenHarness
    │
    ├─ load_settings()
    │   └─ settings.json + env vars + defaults
    │
    ├─ load_plugins(settings, cwd)
    │   ├─ discover_plugin_paths() → [user_plugins, project_plugins]
    │   └─ for each plugin → load_plugin() → LoadedPlugin
    │       ├─ parse PluginManifest (plugin.json)
    │       ├─ load skills from {skills_dir, commands, agents}
    │       ├─ load hooks from hooks.json
    │       └─ load MCP servers from mcp.json
    │
    ├─ load_skill_registry(cwd)
    │   ├─ bundled skills
    │   ├─ user skills (~/.openharness/skills/*.md)
    │   └─ plugin skills (plugin.enabled = true)
    │
    ├─ load_hook_registry(settings, plugins)
    │   ├─ hooks from settings.json
    │   └─ hooks from enabled plugins
    │
    └─ PermissionChecker(settings.permission)
```

### 6.2 工具调用执行流程

```
Agent 想调用 tool_name(file_path, command)
    │
    ├─ 1. PermissionChecker.evaluate(tool_name, is_read_only, file_path, command)
    │   └─→ PermissionDecision (allowed / requires_confirmation / denied)
    │
    ├─ 2. (如果需要确认) → 等待用户确认
    │
    ├─ 3. HookExecutor.execute(PRE_TOOL_USE, {tool_name, ...})
    │   ├─ _matches_hook(hook, payload) → 过滤不匹配的
    │   ├─ 执行匹配的 hooks（顺序执行）
    │   │   ├─ command → subprocess + timeout
    │   │   ├─ prompt/agent → LLM API → JSON 解析
    │   │   └─ http → httpx POST
    │   └─→ AggregatedHookResult (blocked / allowed)
    │
    ├─ 4. (如果 blocked) → 返回阻断原因，不执行工具
    │
    ├─ 5. 执行工具调用
    │
    └─ 6. HookExecutor.execute(POST_TOOL_USE, {tool_name, result, ...})
        └─ 通知类 hooks（不阻断）
```

### 6.3 数据流向图

```
settings.json
    │
    ├──→ PermissionChecker ──────→ 工具调用前的权限决策
    │
    ├──→ HookRegistry ───────────→ HookExecutor ─────→ 工具调用前/后拦截
    │         ↑
    │    plugins[].hooks
    │
    ├──→ SkillRegistry ──────────→ Agent System Prompt 注入
    │         ↑
    │    plugins[].skills
    │    user skills/*.md
    │    bundled skills
    │
    └──→ enabled_plugins ────────→ Plugin Loader
              │
              ├──→ Skills → SkillRegistry
              ├──→ Hooks → HookRegistry
              └──→ MCP → MCP Client
```

### 6.4 热重载影响范围

```
settings.json 文件变更 (mtime 检测)
    │
    └──→ HookReloader.current_registry()
            │
            ├──→ 重新加载 settings.hooks
            └──→ 生成新 HookRegistry
                 │
                 └──→ HookExecutor.update_registry(new_registry)
```

**注意**: 热重载仅影响 settings.json 中的 hooks，不影响：
- Plugin hooks（需要重启）
- Permission settings（需要重启）
- Skill registry（需要重启）

---

## 7. 与 OpenClaw 对比

### 7.1 对比总表

| 维度 | OpenHarness | OpenClaw |
|------|------------|----------|
| **语言** | Python (Pydantic) | TypeScript (Node.js) |
| **Hook 事件** | 4 种 (session_start/end, pre/post_tool_use) | 类似事件模型，通过 channel plugins 扩展 |
| **Hook 类型** | command / prompt / http / agent | 主要是 command + script |
| **Hook 匹配** | fnmatch glob matcher | 基于 channel/trigger 配置 |
| **热重载** | 文件 mtime 检测 | 自动热重载配置变更 |
| **权限模式** | 3 级 (default/plan/full_auto) | allowlist/denylist + approval 机制 |
| **权限粒度** | tool + path + command | tool + elevated permissions |
| **Skill 格式** | Markdown + YAML frontmatter | Markdown + YAML frontmatter (兼容) |
| **Skill 发现** | bundled + user + plugin | 系统安装 + workspace + 通道级 |
| **Plugin 格式** | plugin.json manifest | channel plugins 配置 |
| **Plugin 兼容** | Claude Code plugin.json | 自有扩展格式 |
| **Plugin 安装** | 本地复制 (shutil) | 内置 skillhub/clawhub |
| **Claude Code 兼容** | 高（.claude/skills + .claude-plugin） | 部分（skill 格式兼容） |

### 7.2 Hooks 对比

**OpenHarness**:
- 4 种 Hook 类型，包括 LLM-based 验证（prompt/agent）
- 纯同步顺序执行
- matcher 使用 fnmatch
- 结果聚合模型清晰

**OpenClaw**:
- Hook 通过 channel plugins 和 cron 系统间接实现
- 更侧重外部事件（消息、定时任务）
- 没有内置的 LLM-based hook 验证
- 更灵活的异步事件总线

### 7.3 Permissions 对比

**OpenHarness**:
- 三级模式模型简洁明了
- 路径级别的 glob 规则
- 命令级别的黑名单
- 与 Hook 系统独立（互补关系）

**OpenClaw**:
- 基于权限列表的工具过滤
- `elevated` 权限需要用户审批
- 没有 path-level 规则
- 权限与 channel policy 结合

### 7.4 Skills 对比

**OpenHarness**:
- 三层加载：bundled → user → plugin
- 同名覆盖策略
- 纯 Markdown + frontmatter
- references/ 子目录支持

**OpenClaw**:
- 多层加载：系统 → workspace → 通道级
- description 匹配选择
- 同样支持 SKILL.md + references/
- 内置 skill 发现（skillhub/clawhub）

### 7.5 Plugins 对比

**OpenHarness**:
- Claude Code plugin.json 兼容
- 一个 plugin 贡献 skills + hooks + MCP
- 简单的文件复制安装
- 支持 `${CLAUDE_PLUGIN_ROOT}` 变量替换

**OpenClaw**:
- 通过 channel plugins 配置
- 扩展系统更侧重通信渠道（飞书/Telegram/QQ）
- 内置安装市场（skillhub）
- 更成熟的生命周期管理

---

## 8. 设计亮点与不足

### 8.1 设计亮点

1. **LLM-as-Hook**: `prompt` 和 `agent` 类型的 hook 是独特创新——用 LLM 验证 LLM 的行为，实现语义级别的安全控制
2. **Plugin 作为一等容器**: Plugin 可以同时贡献 Skills、Hooks、MCP Servers，形成完整的扩展包
3. **Claude Code 双兼容**: 同时兼容 `.claude/skills/` 和 `plugin.json`，可以直接复用 Claude Code 生态
4. **Pydantic 强类型**: 所有配置都有严格的 schema 验证，减少运行时错误
5. **权限优先级链**: denied_tools > allowed_tools > path_rules > denied_commands > mode，逻辑清晰
6. **热重载**: settings.json 变更无需重启即可生效

### 8.2 不足

1. **Hook 无异步并发**: 所有 hook 顺序执行，无并行和优先级概念
2. **热重载范围有限**: 仅 settings hooks 热重载，plugin 变更需要重启
3. **Skill 无模糊搜索**: 只支持精确名称匹配
4. **Plugin 无版本管理**: 安装只是简单的文件复制，无版本锁定
5. **无远程 Plugin 安装**: 不支持 npm registry 或类似的市场
6. **Path 规则只支持 glob**: 不支持正则表达式
7. **无 Hook 结果缓存**: 每次 tool 调用都重新执行所有 hook
8. **Plugin 启用状态仅在 settings**: 无法在运行时动态 toggle
9. **bundled.py 文件缺失**: `skills/bundled.py` 在仓库中不存在（404），可能仍在开发中

---

*本文档基于 OpenHarness main 分支 (commit e07d21d) 源码分析生成。*
