# HarnessKit 安全审计引擎 — 深度分析笔记

> 来源: https://github.com/RealZST/HarnessKit (原版) / https://github.com/649875367zh-ship-it/harnesskit-zh (中文版)
> 分析日期: 2026-05-03
> 核心文件: `crates/hk-core/src/auditor/` (Rust 后端) + `src/pages/audit-utils.ts` (前端规则定义)

---

## 一、架构概览

```
┌─────────────────────────────────────────────────────────┐
│                    HarnessKit UI                         │
│  audit.tsx (审计页面) ← audit-store.ts (Zustand)        │
│         ↕ Tauri IPC / Web API                          │
├─────────────────────────────────────────────────────────┤
│  hk-desktop/commands/audit.rs  (Tauri 命令层)           │
│  hk-web/handlers/audit.rs      (Web 命令层)             │
│         ↕                                               │
│  hk-core/service.rs            (业务逻辑层)             │
│    ├── audit_extensions() — 构造 AuditInput 并批量审计   │
│    └── run_full_audit()  — 扫描+审计+持久化              │
│         ↕                                               │
│  hk-core/auditor/                                        │
│    ├── mod.rs   — Auditor 引擎 + compute_trust_score()  │
│    └── rules.rs — 18 条审计规则实现                      │
│         ↕                                               │
│  hk-core/scanner.rs — 扩展发现 + 权限推断               │
└─────────────────────────────────────────────────────────┘
```

**关键设计**:
- 审计引擎是纯 Rust 实现（`hk-core`），前后端共享
- 采用 `AuditRule` trait，每条规则独立实现 `check()` 方法
- 审计前执行 `deobfuscate()` 去除零宽字符/不可见 Unicode
- 使用 `descriptive_line_mask()` 跳过代码块和引用块中的示例代码（减少误报）
- 支持批量审计 `audit_batch()`，逐 Agent 独立扫描

---

## 二、18 项静态分析规则

### Critical 级别（扣 25 分/条）

| # | Rule ID | 名称 | 适用类型 | 检查逻辑 |
|---|---------|------|----------|----------|
| 1 | `prompt-injection` | Prompt 注入 | skill, plugin | 7 个正则模式：`ignore previous instructions`、`you are now a`、`override system prompt`、`[SYSTEM]`、隐藏 Unicode 字符等。跳过代码块和引用块。 |
| 2 | `rce` | 远程代码执行 | skill, hook, plugin | 5 个正则模式：`curl … \| sh/bash`、`wget … \| sh`、`base64 -d \|`、`eval(`、`curl > /tmp/… && chmod`。 |
| 3 | `credential-theft` | 凭证窃取 | skill, hook, plugin | **双重条件检测**：同时匹配「读取敏感文件模式」(`~/.ssh/id_rsa`、`.env`、`.aws/credentials` 等) AND 「发送数据模式」(`curl/wget/nc` 到外部 URL) → Critical；仅读取 → 降级为 High。 |
| 4 | `plaintext-secrets` | 明文密钥 | skill, hook, mcp, plugin | 7 个前缀正则：`sk-*`(OpenAI)、`ghp_*`(GitHub PAT)、`gho_*`(GitHub OAuth)、`AKIA*`(AWS)、`xoxb-*`/`xoxp-*`(Slack)、`sk-ant-*`(Anthropic)。扫描 MCP env vars 和 skill 内容。 |
| 5 | `safety-bypass` | 安全绕过 | skill, hook | 6 个正则：`--no-verify`、`--yes`、`--force`、`allowedTools: '*'`、`bypass safety`、`disable confirm`。**智能过滤**：反引号包裹的标志（文档引用）不触发。 |

### High 级别（扣 15 分/条）

| # | Rule ID | 名称 | 适用类型 | 检查逻辑 |
|---|---------|------|----------|----------|
| 6 | `dangerous-commands` | 危险命令 | skill, hook, plugin | 6 个正则：`rm -rf /`、`chmod 777`、`sudo `、`mkfs`、`dd of=/dev/`、fork bomb `:(){ :\|:& };`。Hook 中保持 High，Skill/Plugin 中降级为 Medium。 |
| 7 | `broad-permissions` | 过宽权限 | mcp | 检查 MCP server 是否绑定 `0.0.0.0`/`*`（全接口），或 filesystem MCP 访问根路径以外的非 `/tmp` 路径。 |
| 10 | `permission-combo-risk` | 权限组合风险 | skill, mcp, hook, plugin | **组合检测**：Network + Env → 凭证外泄风险；Shell + Network → RCE 风险。用正则定位证据行号。 |
| 11 | `cli-credential-storage` | CLI 凭证存储 | cli | 检查凭证文件权限（Unix 下 `> 0o600` 触发）；有 API domains 但无 credentials_path 也触发。 |
| 13 | `cli-binary-source` | CLI 二进制来源 | cli | 安装方式分类：`curl|sh` / `wget|sh` → High；npm/pip/brew/cargo → 安全跳过；未知方法 → Medium。 |
| 16 | `mcp-command-injection` | MCP 命令注入 | mcp | 检测 MCP args 中的 shell 子执行模式：`$()` 和反引号。SQL 分号和 grep 管道不触发（精确过滤）。 |

### Medium 级别（扣 8 分/条）

| # | Rule ID | 名称 | 适用类型 | 检查逻辑 |
|---|---------|------|----------|----------|
| 8 | `supply-chain` | 供应链风险 | skill, mcp | MCP 使用 `npx` 运行非 scoped npm 包（无 `@` 前缀）→ typosquatting 风险。 |
| 12 | `cli-network-access` | CLI 网络访问 | cli | API domains > 3 个 → 标记为广泛网络攻击面。 |
| 14 | `cli-permission-scope` | CLI 权限范围 | cli | 子 skills 请求 > 3 种不同权限类型 → 广泛能力面。 |
| 15 | `cli-aggregate-risk` | CLI 聚合风险 | cli | 子 skills 同时有 Network + FileSystem + Shell。已知来源 → 降级为 Low。 |
| 17 | `plugin-source-trust` | 插件来源信任 | plugin | 检查是否有标准 manifest（`plugin.json`/`package.json`）；无 Git 来源 → Medium。 |
| 18 | `plugin-lifecycle-scripts` | 插件生命周期脚本 | plugin | 检测 `postinstall`/`preinstall` 等脚本。含 `curl/wget/sh/bash/eval/nc` → Medium；仅 benign 命令 → Low。 |

### Low 级别（扣 3 分/条）

| # | Rule ID | 名称 | 适用类型 | 检查逻辑 |
|---|---------|------|----------|----------|
| 9 | `unknown-source` | 未知来源 | skill, mcp, hook, plugin | 扩展来源为 `Local` 且无 URL → 无法追溯来源。CLI 总是跳过（本地发现的）。 |

---

## 三、信任评分算法

### 核心公式

```
trust_score = max(0, 100 - total_deduction)
```

### 扣分规则（同规则去重）

| 严重程度 | 首次命中扣分 | 重复命中扣分 |
|----------|-------------|-------------|
| Critical | 25 | 1 |
| High | 15 | 1 |
| Medium | 8 | 1 |
| Low | 3 | 1 |

**关键设计 — 同规则去重**：同一 `rule_id` 的多个 finding，首次扣全量，后续每个仅扣 1 分。这避免了文档中多次提及同一模式导致评分暴跌。

### 三档分级

| 分数范围 | 等级 | 显示 |
|----------|------|------|
| 80–100 | Safe | 🟢 绿色 |
| 60–79 | Low Risk | 🟡 黄色 |
| 0–59 | Needs Review | 🔴 红色 |

### 极端情况

- 无 finding → 100 分（Safe）
- 5 条不同 Critical → 100 - 125 = 0 分（Needs Review，下限为 0）
- 同一 Critical 3 次 → 100 - 25 - 1 - 1 = 73 分（Low Risk）

---

## 四、权限透明 — 五维度实现

### 数据模型

```rust
pub enum Permission {
    FileSystem { paths: Vec<String> },
    Network { domains: Vec<String> },
    Shell { commands: Vec<String> },
    Database { engines: Vec<String> },
    Env { keys: Vec<String> },
}
```

### 各维度推断逻辑

#### 1. 文件系统 (FileSystem)
- **Skill**: 用正则 `SKILL_SENSITIVE_PATHS` 扫描内容，匹配 `~/`、`/etc/`、`/home/`、`/tmp/`、`/var/`、`/opt/`、`/Library/`、Windows `C:\`、`%APPDATA%` 等路径。**Skill 总是至少有 FileSystem 权限**（空 paths），因为 skill 天生引导 agent 读写文件。
- **MCP**: 从 MCP args 中提取绝对路径和 `~/` 路径。排除 `//` 开头（标志参数）和 `-` 开头（选项）。
- **Hook**: 从命令字符串中提取路径。
- **Plugin**: 读取目录内 JS/TS/Python 文件，复用 skill 推断逻辑。
- **CLI**: 从 CliMeta.credentials_path 派生；如果子 skill 有 FileSystem 权限则合并。

#### 2. 网络 (Network)
- **Skill**: 用正则 `SKILL_URL_DOMAINS` 提取 `https?://domain` 中的域名。仅在检测到域名时才添加权限。
- **MCP**: npx/uvx 命令默认给 `*`（全部网络）；其他命令从 args 中提取域名。
- **Hook**: 从命令中提取 URL 域名。
- **Plugin**: 同 Skill。
- **CLI**: 从 CliMeta.api_domains 派生（预定义的已知 CLI 列表）。

#### 3. Shell (Shell)
- **Skill**: 从 ` ```bash ``` ` 代码块中提取命令首 token（basename）。仅在检测到命令时添加。
- **MCP**: 命令名 + basename 始终添加。
- **Hook**: 完整命令 + basename。
- **Plugin**: 从源文件 + package.json scripts 中提取。**总是至少有 Shell 权限**（空 commands）。
- **CLI**: 二进制名本身。

#### 4. 数据库 (Database)
- 用正则 `SKILL_DB_ENGINES` 匹配 `postgres`、`mysql`、`mariadb`、`sqlite`、`mongodb`、`redis`（不区分大小写）。
- **仅在检测到引擎名时添加**。

#### 5. 环境变量 (Env)
- **仅 MCP 服务器**：从 MCP 配置的 `env` 字段提取 key 列表。
- **Skill/Hook 不推断 Env 权限**：设计决策认为 skill 中的 `$VAR` 通常是本地 shell 变量而非凭证，显示为"权限"会误导用户。

### 权限合并策略

CLI 扩展的权限 = 自身 CliMeta 派生的权限 + 所有子 skill 权限的并集（按维度去重）。`merge_permissions()` 函数确保同一维度的值不重复。

---

## 五、去混淆与上下文感知

### Deobfuscation 层（灵感来自 AgentSeal）
审计前先去除以下 Unicode 不可见字符：
- 零宽空格（`\u200B`–`\u200F`）
- 方向格式化字符（`\u202A`–`\u202E`）
- 隐形运算符（`\u2060`–`\u2064`、`\u2066`–`\u2069`）
- BOM（`\uFEFF`）、软连字符（`\u00AD`）
- 变体选择器（`\uFE00`–`\uFE0F`、`\uE0100`–`\uE01EF`）

### Descriptive Context Mask
逐行标记代码块（` ``` ``` `）和引用块（`>`）中的内容为"描述性"（示例/文档），不触发规则匹配。正确处理嵌套 fence 的开关状态。

### Safety Bypass 的反引号检测
`--force`、`--no-verify` 等标志如果在反引号包裹中（如文档 `` `--force` ``），不触发安全绕过规则。

---

## 六、审计流程

```
1. store.list_extensions()  → 获取所有已扫描扩展
2. 对每个扩展构造 AuditInput:
   - Skill → 读取 SKILL.md 内容
   - MCP   → 提取 command/args/env
   - Hook  → 提取命令字符串
   - Plugin → 读取目录内 .js/.ts/.py/.sh (≤512KB)
   - CLI   → 使用 CliMeta 元数据
3. deobfuscate(content) → 去除不可见字符
4. 对每条规则调用 rule.check(input)
5. compute_trust_score(findings) → 同规则去重计分
6. 生成 AuditResult → 持久化到 SQLite
```

---

## 七、与 OpenClaw 现有能力对比

### skill-vetter 对比

| 维度 | HarnessKit 审计引擎 | OpenClaw skill-vetter |
|------|---------------------|----------------------|
| **自动化程度** | 全自动，一键扫描所有扩展 | 手动触发，需人工引导 |
| **规则数量** | 18 条结构化规则（正则+逻辑） | 15 条 checklist 条目 |
| **精确度** | 正则匹配 + 上下文感知（跳过代码块/引用） | 关键词扫描，无上下文过滤 |
| **评分机制** | 0-100 量化评分 + 三档分级 | 4 级主观分类 (LOW/MEDIUM/HIGH/EXTREME) |
| **权限透明** | 5 维度自动推断（文件/网络/Shell/DB/Env） | 手动 checklist |
| **去混淆** | ✅ 自动去除不可见 Unicode | ❌ |
| **组合风险** | ✅ 检测权限组合（Network+Env, Shell+Network） | ❌ |
| **凭证检测** | ✅ 7 种 API key 前缀正则 | ✅ 但无结构化模式 |
| **来源追溯** | ✅ Git/Registry/Agent/Local 四种来源 | ✅ GitHub stats 查询 |
| **持续监控** | ✅ 安装时自动审计 + 定期全量扫描 | ❌ 仅安装前一次性 |
| **覆盖范围** | Skill + MCP + Hook + Plugin + CLI（5 类） | 仅 Skill |
| **输出格式** | 结构化 JSON（rule_id/severity/location） | Markdown 报告 |

### security-briefing 对比

| 维度 | HarnessKit 审计引擎 | OpenClaw security-briefing |
|------|---------------------|---------------------------|
| **关注点** | 扩展/Skill 静态安全 | 外部 CVE/漏洞情报 |
| **互补性** | **高度互补** — 一个看内，一个看外 | 一个看外，一个看内 |

---

## 八、可集成建议

### 优先级 P0：规则移植到 skill-vetter（增强版）

**具体方案**：将 18 条规则的核心正则提取为独立检查函数，集成到 skill-vetter 的 Step 2（Code Review）中：

1. **提取正则模式库**：将 `PROMPT_INJECTION_PATTERNS`、`RCE_PATTERNS`、`CRED_READ_PATTERNS`、`SECRET_PREFIX_PATTERNS`、`BYPASS_PATTERNS`、`DANGER_CMD_PATTERNS` 移植为 skill-vetter 的结构化检查项
2. **上下文感知机制**：移植 `descriptive_line_mask()` — 跳过代码块和引用块中的示例
3. **去混淆层**：移植 `deobfuscate()` — 审查前先清洗不可见字符
4. **量化评分**：将 skill-vetter 的 4 级分类升级为 0-100 评分制，复用 `compute_trust_score` 的同规则去重逻辑

**预期收益**：skill-vetter 从"人工 checklist"升级为"自动化扫描 + 量化评分"

### 优先级 P1：MCP 审计能力

当前 OpenClaw 有 MCP 服务器管理能力，但无安全审计。可移植：
- `McpCommandInjection`（命令注入检测）
- `BroadPermissions`（MCP 全接口绑定检测）
- `SupplyChainRisk`（npx 非 scoped 包 typosquatting 检测）

### 优先级 P2：权限推断引擎

移植 5 维度权限推断逻辑，用于 OpenClaw 的扩展管理界面：
- 为每个已安装 skill/MCP 自动展示权限标签
- 作为 security-briefing 的补充数据源

### 优先级 P3：组合风险检测

移植 `PermissionCombinationRisk` 规则，作为 skill-vetter 的高级检查：
- 当一个 skill 同时请求 Network + Env 权限时，标记为凭证外泄风险
- 当同时请求 Shell + Network 时，标记为 RCE 风险

### 实现路径建议

```
Phase 1: 移植规则正则 + 去混淆 + 上下文感知 → 增强 skill-vetter
Phase 2: 添加量化评分（0-100）+ 三档分级显示
Phase 3: 扩展到 MCP 审计
Phase 4: 权限推断引擎 + 组合风险检测
```

**注意**：HarnessKit 是 Apache-2.0 许可，可以合法复用代码逻辑（正则模式、算法），但图标素材保留所有权利。

---

## 九、关键设计亮点（值得借鉴）

1. **同规则去重计分**：避免同一模式多次出现导致评分过低，区分"模式存在"和"模式广泛使用"
2. **descriptive_line_mask**：精确区分"文档示例"和"实际指令"，大幅减少误报
3. **双重条件凭证检测**：仅当"读取凭证文件" AND "发送到外部"同时出现才报 Critical，单一条件降级
4. **Env 权限的设计决策**：Skill 不推断 Env（避免误报），仅 MCP 的显式 env 配置才标记
5. **已知 CLI 注册表**：`KNOWN_CLIS` 预定义了 wecom-cli、lark-cli 等工具的 API domains 和凭证路径，实现精准审计
6. **per-Agent 独立审计**：同一扩展在不同 Agent 上的副本独立扫描，因为版本可能漂移

---

## 十、局限性

1. **纯静态分析**：无法检测动态加载的恶意代码、运行时行为
2. **正则局限**：复杂的混淆/编码绕过可能逃逸（但 deobfuscate 层缓解了常见情况）
3. **无依赖分析**：不扫描 npm/pip 依赖树（仅 MCP 的 npx 包名检测 typosquatting）
4. **无签名验证**：不验证扩展的数字签名或 checksum
5. **规则集固定**：18 条规则是硬编码的，无法动态添加自定义规则

---

*研究完成。HarnessKit 的安全审计引擎设计精良，18 条规则覆盖了 AI Agent 扩展的主要攻击面。最大价值在于：结构化规则 + 量化评分 + 上下文感知 + 去混淆 — 这些可以直接增强 OpenClaw 的 skill-vetter。*
