# HarnessKit 跨Agent部署与管理 — 深度分析

> 来源: https://github.com/649875367zh-ship-it/harnesskit-zh (v1.3.1 中文版)
> 分析日期: 2026-05-03
> 关键文件: `crates/hk-core/src/adapter/mod.rs`, `deployer.rs`, `crates/hk-web/src/handlers/install.rs`, `agents.rs`
> 前置阅读: research/harnesskit-zh-analysis.md, research/harnesskit-security-audit.md

---

## 一、跨Agent部署架构

### 1.1 Adapter 模式 — 统一抽象层

HarnessKit 通过 `AgentAdapter` trait 为每种 Agent 定义统一的接口。当前支持 8 个 Agent：

```
claude → ClaudeAdapter      (Claude Code)
codex  → CodexAdapter       (OpenAI Codex CLI)
hermes → HermesAdapter
openclaw → OpenClawAdapter  (OpenClaw)
gemini → GeminiAdapter      (Gemini CLI)
cursor → CursorAdapter
antigravity → AntigravityAdapter
copilot → CopilotAdapter
```

**Trait 核心方法**（`adapter/mod.rs`）：

| 方法 | 用途 | 各 Agent 差异 |
|------|------|-------------|
| `name()` | Agent 标识符 | 固定字符串如 "claude", "openclaw" |
| `base_dir()` | Agent 主目录 | `~/.claude`, `~/.openclaw`, `~/.codex` 等 |
| `detect()` | 检测 Agent 是否已安装 | 检查 `base_dir()` 是否存在 |
| `skill_dirs()` | Skills 目录列表 | 各 Agent 不同路径约定 |
| `mcp_config_path()` | MCP 配置文件路径 | JSON/TOML 路径差异 |
| `hook_config_path()` | Hook 配置文件路径 | JSON 格式但结构不同 |
| `mcp_format()` | MCP 配置格式枚举 | McpServers / Servers / Toml |
| `hook_format()` | Hook 配置格式枚举 | ClaudeLike / Cursor / Copilot / None |
| `translate_hook_event()` | Hook 事件名翻译 | 跨 Agent 事件名映射 |
| `read_mcp_servers()` | 读取 MCP 配置 | 解析各自格式 |
| `read_hooks()` | 读取 Hook 配置 | 解析各自格式 |
| `plugin_dirs()` / `read_plugins()` | 插件管理 | Claude/Codex/Gemini/Copilot 支持 |
| `global_rules_files()` / `global_memory_files()` / `global_settings_files()` | 配置文件发现 | 用于 Agent 详情页 |

### 1.2 格式适配层

跨 Agent 部署的核心难点是**各 Agent 配置格式不同**。HarnessKit 通过枚举+适配器模式解决：

**MCP 配置格式** (`McpFormat`):
- `McpServers` — JSON `{"mcpServers": {"name": {"command":..., "args":..., "env":...}}}`  → Claude, Gemini, Cursor, Antigravity
- `Servers` — JSON `{"servers": {"name": ...}}` → Copilot (VS Code 系)
- `Toml` — TOML `[mcp_servers.name]` → Codex

**Hook 配置格式** (`HookFormat`):
- `ClaudeLike` — `{"hooks": {"Event": [{"matcher":"...", "hooks": [{"type":"command","command":"..."}]}]}}` → Claude, Codex, Gemini
- `Cursor` — `{"version": 1, "hooks": {"event": [{"command": "..."}]}}` → Cursor
- `Copilot` — `{"version": 1, "hooks": {"event": [{"type":"command","bash":"..."}]}}` → Copilot
- `None` — 不支持 Hook → Antigravity, OpenClaw

### 1.3 部署流程（`deployer.rs` + `install.rs`）

#### Skill 部署
```
源 Agent skill_dirs/ → 复制到目标 Agent skill_dirs/
- 目录: copy_dir_recursive() (跳过 .git, 跳过 symlink)
- 文件: 直接 fs::copy
- 目标目录不存在则 create_dir_all
```

#### MCP Server 跨 Agent 部署
```
源 Agent read_mcp_servers() → McpServerEntry
  → deploy_mcp_server(target_config_path, entry, target_format)
    → JSON: locked_modify_json() + 文件锁 (fs2::FileExt)
    → TOML: 读取→解析→插入→原子写入
```

**特殊处理**:
- **Codex TOML**: 名称需 `sanitize_mcp_name()` (只保留 `[a-zA-Z0-9_-]`)，原始名存为 `_hk_name`
- **Antigravity**: GUI Agent 无 shell PATH，需 `resolve_command_path()` 解析命令绝对路径 + `build_path_for_command()` 注入 PATH
- **原子写入**: JSON 用 `locked_modify_json`（文件锁保护），TOML 用 `atomic_write`

#### Hook 跨 Agent 部署
```
源 Agent read_hooks() → HookEntry {event, matcher, command}
  → translate_hook_event(target_adapter, event) → 翻译事件名
  → deploy_hook(target_config_path, entry, target_format)
```

#### Plugin 跨 Agent 部署
- 仅支持 Claude (`settings.json`)、Codex (目录复制+TOML条目)、Gemini (目录复制+extensions条目)、Copilot (目录+VS Code state.vscdb清理)
- 其他 Agent 返回 `Cross-agent deploy not supported`

### 1.4 冲突处理机制

| 场景 | 处理方式 |
|------|---------|
| Skill 已存在 | `deploy_skill()` 直接覆盖（copy_dir_recursive 逐文件覆盖） |
| MCP Server 已存在 | JSON 模式直接 `insert` 覆盖同名条目；TOML 同理 |
| Hook 已存在 | 检查 matcher 分组，同 matcher 下检查命令去重，不重复添加 |
| Plugin | 仅 Claude 有明确的启用/禁用条目管理 |
| 文件锁 | `locked_modify_json` 使用 `fs2::FileExt` 文件锁防并发写入 |
| 路径安全 | `sanitize::validate_git_url`、`..` 路径检查、`is_path_allowed` 白名单 |

### 1.5 安装来源

| 来源 | 描述 | 跨 Agent 支持 |
|------|------|:---:|
| Git URL | `install_from_git` — clone + 复制到目标 skill_dirs | 指定单个 Agent |
| Marketplace | `install_from_marketplace` — 从 skills.sh/Smithery 安装 | 指定单个 Agent |
| 本地目录 | `install_from_local` — 从本地 SKILL.md 目录安装 | ✅ 支持多 Agent 同时部署 |
| 跨 Agent 复制 | `install_to_agent` — 从一个 Agent 复制到另一个 | ✅ 核心"一键部署"功能 |
| Git 仓库扫描 | `scan_git_repo` — 扫描仓库内所有 skills | ✅ 多 Agent 批量安装 |

---

## 二、配置文件追踪

### 2.1 发现机制（`AgentAdapter` 配置方法）

每个 Adapter 通过以下方法声明其配置文件位置：

```rust
// 全局级（绝对路径）
fn global_rules_files()     → Vec<PathBuf>    // 规则文件
fn global_memory_files()    → Vec<PathBuf>    // 记忆文件
fn global_settings_files()  → Vec<PathBuf>    // 设置文件

// 项目级（相对路径/glob）
fn project_rules_patterns()     → Vec<String>
fn project_memory_patterns()    → Vec<String>
fn project_settings_patterns()  → Vec<String>
fn project_ignore_patterns()    → Vec<String>
```

### 2.2 OpenClaw Adapter 的配置追踪

```rust
// OpenClaw 特定的配置发现
base_dir:       ~/.openclaw
skill_dirs:     ~/.openclaw/workspace/skills
mcp_config:     ~/.openclaw/workspace/openclaw.json
hook_config:    ~/.openclaw/workspace/openclaw.json

// 全局规则: SOUL.md, IDENTITY.md
// 全局记忆: MEMORY.md, memory/ 目录
// 全局设置: openclaw.json, AGENTS.md, USER.md, TOOLS.md
// 项目规则: CLAUDE.md, AGENTS.md, SOUL.md
// 项目记忆: MEMORY.md
// 项目忽略: .clawignore
```

### 2.3 项目管理

Web UI 支持**项目目录**管理（`projects.rs`）：
- 添加/删除项目路径
- 自动发现（`discover_projects`）— 扫描常见开发目录
- 配置文件扫描时同时扫描项目级配置
- 自定义路径（`add_custom_config_path`）— 为任意 Agent 添加任意文件/目录追踪

### 2.4 配置文件扫描流程

```
list_agent_configs()
  → 对每个已检测的 Agent:
    → scanner::scan_agent_configs(adapter, projects)
      → 扫描全局配置 (global_*_files)
      → 扫描项目配置 (project_*_patterns × projects)
      → 获取自定义路径 (custom_config_paths)
  → 返回 AgentDetail { config_files, extension_counts }
```

每个配置文件记录：
- `path`, `agent`, `category` (rules/memory/settings/ignore)
- `scope` (global/project), `file_name`, `size_bytes`, `modified_at`, `is_dir`, `exists`

---

## 三、Web UI 功能边界

### 3.1 技术架构

```
┌─────────────────────────────────────────────┐
│  前端 (React + Vite, 嵌入 Rust 二进制)      │
│  rust_embed::RustEmbed #[folder = "dist/"]  │
├─────────────────────────────────────────────┤
│  Axum Web Server (hk-web crate)             │
│  /api/* 路由 → handlers (blocking thread)   │
│  CORS (tower_http, Any origin)              │
│  Auth: Bearer token (可选)                  │
├─────────────────────────────────────────────┤
│  hk-core (共享业务逻辑)                      │
│  adapter/ scanner/ deployer/ auditor/ store │
├─────────────────────────────────────────────┤
│  SQLite (store.rs) — 扩展元数据持久化       │
└─────────────────────────────────────────────┘
```

### 3.2 API 端点清单

| 类别 | 端点 | 功能 |
|------|------|------|
| **扩展管理** | `list_extensions`, `toggle_extension`, `delete_extension`, `get_extension_content`, `scan_and_sync`, `list_skill_files` | CRUD + 启用禁用 + 内容预览 |
| **安装部署** | `install_from_git`, `install_from_marketplace`, `install_from_local`, `install_to_agent`, `scan_git_repo`, `install_scanned_skills`, `install_new_repo_skills`, `update_extension`, `check_updates`, `get_cached_update_statuses`, `get_skill_locations`, `get_cli_with_children` | 全部安装方式 + 跨Agent部署 + 更新检查 |
| **Agent 管理** | `list_agents`, `set_agent_enabled`, `update_agent_order`, `update_agent_path`, `list_agent_configs`, `add_custom_config_path`, `update_custom_config_path`, `remove_custom_config_path` | Agent 启用/排序/路径/配置追踪 |
| **审计** | `list_audit_results`, `run_audit` | 安全审计 |
| **市场** | `search_marketplace`, `trending_marketplace`, `list_cli_marketplace`, `fetch_skill_preview`, `fetch_cli_readme`, `fetch_skill_audit` | 浏览搜索安装 |
| **项目** | `list_projects`, `add_project`, `remove_project`, `discover_projects` | 项目管理 |
| **设置** | `get_dashboard_stats`, `update_tags`, `batch_update_tags`, `get_all_tags`, `update_pack`, `batch_update_pack`, `get_all_packs`, `toggle_by_pack`, `read_config_file_preview` | 标签/包管理 + 仪表盘 |

### 3.3 安全模型

- **认证**: 可选 Bearer token，`/api/` 路由生效，静态资源跳过
- **非 localhost 自动生成 token**: `hk serve --host 0.0.0.0` 时自动生成随机 token
- **CORS**: `Any` — 允许任何来源（适合本地/内网使用）
- **路径安全**: `is_path_allowed` 检查路径是否在 Agent 目录或已注册项目内，禁止 `..` 穿越
- **无 RBAC/用户系统**: 单用户设计，适合个人开发者

### 3.4 功能边界总结

| 能力 | 边界 |
|------|------|
| 可视化管理 | ✅ 完整（扩展/Agent/配置/审计/市场） |
| 跨 Agent 部署 | ✅ Skill/MCP/Hook/CLI 四种类型 |
| 配置追踪 | ✅ 全局+项目级，支持自定义路径 |
| 安全审计 | ✅ 18 条规则 + 信任评分 |
| 远程访问 | ⚠️ 无加密，依赖 SSH 隧道或局域网 |
| 多用户 | ❌ 单用户设计 |
| 实时推送 | ❌ 无 WebSocket，需手动刷新 |
| Agent 运行时控制 | ❌ 只管理文件，不控制 Agent 进程 |
| OpenClaw 深度集成 | ⚠️ 适配器存在但功能有限（无 MCP/Hook 读取实现） |

---

## 四、与 OpenClaw 的对比和集成建议

### 4.1 能力对比

| 维度 | HarnessKit | OpenClaw |
|------|-----------|----------|
| **扩展管理** | 统一管理 8 个 Agent 的扩展 | 仅管理自身 Skill 体系 |
| **配置追踪** | 自动发现所有 Agent 配置文件 | 仅管理自身 workspace |
| **跨 Agent 部署** | ✅ 一键复制扩展到多个 Agent | ❌ 无此能力 |
| **安全审计** | 18 条静态规则 + 信任评分 | skill-vetter + security-briefing（侧重不同） |
| **Web UI** | 独立管理界面 | Canvas（Agent 内部 UI） |
| **Agent 控制** | 文件级管理 | 运行时控制（gateway, sessions） |
| **消息通道** | 无 | 飞书/微信等多通道 |
| **记忆体系** | 文件发现 | MEMORY.md + daily notes + L1/L2 分层 |
| **定时任务** | 无 | cron heartbeat |

### 4.2 集成价值评估

| 方案 | 价值 | 复杂度 | 推荐度 |
|------|------|:------:|:------:|
| **A. 直接使用 hk** | 作为 OpenClaw 的补充工具管理其他 Agent | 低 | ⭐⭐⭐⭐ |
| **B. 参考 Adapter 模式** | 为 OpenClaw 构建类似的多 Agent 管理能力 | 高 | ⭐⭐ |
| **C. 借鉴 deployer 逻辑** | 将 Skill/MCP 部署能力集成到 OpenClaw Skill 中 | 中 | ⭐⭐⭐ |
| **D. Web UI 作为 OpenClaw Canvas 替代** | 不推荐 — Canvas 定位不同 | — | ⭐ |

### 4.3 具体集成方案

#### 方案 A: 保留 hk 作为补充工具（推荐）

**适用场景**: Ray 同时使用 Claude Code + OpenClaw 等多个 Agent

```bash
# 日常使用
hk serve --host 0.0.0.0 --port 7070
# 浏览器访问 http://172.25.192.2:7070

# 跨 Agent 部署 Skill
# 1. 在 Web UI 找到已安装的 Skill
# 2. 点击"部署到其他 Agent"
# 3. 选择目标 Agent
```

**注意事项**:
- OpenClaw 的 Adapter 实现较浅（`read_mcp_servers` 和 `read_hooks` 返回空），说明中文版对 OpenClaw 的 MCP/Hook 支持不完整
- hk 无法读取 OpenClaw 的运行时状态（gateway sessions、channel 等）
- 配置追踪只覆盖文件层面，不覆盖 OpenClaw 的 gateway config

#### 方案 C: 借鉴 deployer 构建部署 Skill

如果需要 OpenClaw 自身具备跨 Agent 部署能力，可创建一个 Skill：

```markdown
# Skill: cross-agent-deploy
## 触发条件
用户说"把这个 skill 部署到 Claude Code"等

## 实现步骤
1. 读取源 Skill 目录 (workspace/skills/<name>/)
2. 检测目标 Agent 是否已安装 (检查 ~/.claude/ 等)
3. 复制到目标 Agent 的 skill 目录
4. 如有 MCP 需求，参考 deployer.rs 的格式适配逻辑
```

**可借鉴的代码模式**:
- `deploy_skill()` — 目录递归复制 + symlink 跳过
- `sanitize_mcp_name()` — MCP 名称清洗
- `resolve_command_path()` — 命令路径解析
- `locked_modify_json()` — 原子 JSON 修改

### 4.4 不建议集成的部分

1. **Web UI 整体** — OpenClaw 的 Canvas + 飞书交互已形成完整闭环，独立 Web UI 是冗余的
2. **Agent Adapter 框架** — OpenClaw 自身不需要管理其他 Agent 的运行时
3. **市场集成** — OpenClaw 有自己的 Skill 发现机制，Smithery 注册表价值有限
4. **OpenClaw Adapter 的配置追踪** — 当前实现不完整（MCP/Hook 为空），不如直接读写文件

---

## 五、总结

### HarnessKit 跨 Agent 管理的核心价值

1. **统一的 Adapter 抽象** — `AgentAdapter` trait 是优秀的设计模式，将 8 个 Agent 的差异封装在适配器中，上层逻辑（deployer、scanner、auditor）完全与 Agent 无关
2. **格式自动转换** — 部署时自动处理 JSON/TOML 格式差异、Hook 事件名翻译、命令路径解析
3. **安全的文件操作** — 文件锁、原子写入、路径白名单、symlink 跳过
4. **配置文件全景视图** — 一站式查看所有 Agent 的配置/记忆/规则文件

### 对 OpenClaw 的实际增量价值

- **当前阶段**: 保留 `hk` 安装，作为多 Agent 扩展管理和 Web UI 的补充
- **中期**: 参考 `deployer.rs` 的格式适配逻辑，为 OpenClaw 构建跨 Agent 部署 Skill
- **长期**: 如 Ray 的多 Agent 使用场景增多，可考虑将 Adapter 模式的思路融入 OpenClaw 的 Skill 体系

### 关键技术债务

- OpenClaw Adapter 的 `read_mcp_servers()` 和 `read_hooks()` 返回空 — 意味着从 hk 的 Web UI 无法看到 OpenClaw 的 MCP 和 Hook 配置
- 无 WebSocket/实时推送 — 配置变更需手动刷新
- CORS 设为 `Any` — 仅适合本地/内网使用

---

*Report generated by subagent harnesskit-cross-agent-learning*
