---
name: mcp-audit
description: "Use when auditing MCP server configurations for security risks, reviewing MCP command args for injection vulnerabilities, checking MCP permission scope, or evaluating MCP server supply chain safety. Covers command injection, broad permissions, typosquatting, and permission inference across 5 dimensions."
---

# MCP Server Security Audit 🔍

对 MCP 服务器配置执行专项安全审计。移植自 HarnessKit 审计引擎 MCP 相关规则。

## When to Use

- 审查新安装或更新的 MCP server 配置（`mcpServers` 中的条目）
- 检查 MCP 命令参数是否存在注入风险
- 评估 MCP server 的权限范围是否过宽
- 检查 MCP 运行方式的供应链安全性
- 为 MCP server 生成结构化权限报告

**不适用：** 通用 skill 审计（使用 `skill-vetter`）、CVE/漏洞情报（使用 `security-briefing`）

## 审计流程

### Step 1: 收集 MCP 配置

从 OpenClaw 配置中提取目标 MCP server 条目：

```jsonc
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@scope/package"],
      "env": { "API_KEY": "sk-..." }
    }
  }
}
```

**关键提取字段：** `command`、`args`、`env`

### Step 2: 去混淆

审查前先清洗文本，移除不可见 Unicode 字符（零宽空格 `\u200B-\u200F`、方向格式化 `\u202A-\u202E`、隐形运算符 `\u2060-\u2064`、BOM `\uFEFF` 等）。

### Step 3: 执行 3 条核心规则

#### 规则 1: MCP 命令注入 (High, -15 分)

**Rule ID:** `mcp-command-injection`

**检测目标：** MCP `args` 中的 shell 子执行模式

| 模式 | 示例 | 风险 |
|------|------|------|
| `$()` | `$(whoami)`、`$(cat /etc/passwd)` | 命令替换 |
| 反引号 | `` `rm -rf /` `` | 命令替换 |

**正则：**
```regex
\$\(.*?\)|`[^`]+`
```

**豁免（不触发）：**
- SQL 语句中的分号（`; SELECT ...`）
- grep/管道组合（`grep -r "pattern" \| wc -l`）

**判断依据：** 检查匹配上下文 — 如果 `$()` 或反引号出现在明显是 SQL 或 shell 管道文档示例中，跳过。

---

#### 规则 2: 过宽权限 (High, -15 分)

**Rule ID:** `broad-permissions`

**检测目标 A — 全接口绑定：**

MCP server 绑定 `0.0.0.0` 或 `*`（监听所有网络接口）

```jsonc
// ❌ 触发
{ "args": ["--host", "0.0.0.0"] }
{ "args": ["--host", "*"] }

// ✅ 安全
{ "args": ["--host", "127.0.0.1"] }
{ "args": ["--host", "localhost"] }
```

**检测目标 B — 文件系统越界：**

filesystem MCP 访问根路径以外且非 `/tmp` 的路径

```jsonc
// ❌ 触发 — 访问用户主目录敏感区域
{ "args": ["/home/user/.ssh"] }
{ "args": ["/etc"] }
{ "args": ["~/"] }

// ✅ 安全
{ "args": ["/tmp/mcp-workspace"] }
```

---

#### 规则 3: 供应链风险 (Medium, -8 分)

**Rule ID:** `supply-chain`

**检测目标：** MCP 使用 `npx` 运行非 scoped npm 包（无 `@` 前缀）

```jsonc
// ❌ 触发 — typosquatting 风险
{ "command": "npx", "args": ["-y", "mcp-filesystem"] }
{ "command": "npx", "args": ["some-mcp-server"] }

// ✅ 安全 — scoped 包有组织归属
{ "command": "npx", "args": ["-y", "@modelcontextprotocol/server-filesystem"] }
{ "command": "npx", "args": ["-y", "@anthropic/mcp-server"] }
```

**判断逻辑：** `command` 为 `npx`/`npx.cmd` 时，检查 `args` 中第一个非 `-` 开头的包名，若无 `@` 前缀则触发。

### Step 4: MCP 权限推断（5 维度）

对每个 MCP server，基于配置自动推断权限面：

#### 维度 1: FileSystem 📁

从 MCP `args` 中提取路径：

| 提取规则 | 示例 |
|----------|------|
| 绝对路径 | `/home/user/data`、`/tmp/workspace` |
| `~/` 路径 | `~/documents`、`~/.config` |

**排除：** `//` 开头（标志参数如 `--allow`）、`-` 开头（选项参数）

#### 维度 2: Network 🌐

| 运行方式 | 推断结果 |
|----------|----------|
| `npx`/`uvx` | `*`（全部网络，因为会下载包） |
| 其他命令 | 从 `args` 中提取域名（`https?://` 后的 host） |

#### 维度 3: Shell 💻

- **始终添加：** `command` 本身 + `basename(command)`
- 示例：`command: "npx"` → Shell: `["npx"]`

#### 维度 4: Database 🗄️

从 MCP 配置全文匹配数据库引擎关键词（不区分大小写）：

`postgres`、`mysql`、`mariadb`、`sqlite`、`mongodb`、`redis`

**仅在匹配到时添加。**

#### 维度 5: Env 🔑

**仅从 MCP 配置的 `env` 字段提取 key 列表。**

```jsonc
{ "env": { "API_KEY": "sk-...", "DATABASE_URL": "postgres://..." } }
// → Env: ["API_KEY", "DATABASE_URL"]
```

**不推断：** `$VAR` 形式的 shell 变量（通常是运行时展开而非凭证配置）。

### Step 5: 组合风险检测

检测权限维度之间的危险组合：

| 组合 | 风险 | 级别 |
|------|------|------|
| Network + Env | 凭证外泄（env 中的密钥可能被发送到网络） | High |
| Shell + Network | 远程代码执行（shell 命令可访问外部资源） | High |
| FileSystem + Network | 数据外泄（本地文件可被发送到外部） | Medium |

### Step 6: 量化评分

```
trust_score = max(0, 100 - total_deduction)
```

| 严重程度 | 扣分 |
|----------|------|
| Critical | 25 |
| High | 15 |
| Medium | 8 |
| Low | 3 |

**同规则去重：** 同一 `rule_id` 的多个 finding，首次扣全量，后续每个仅扣 1 分。

**分级：**

| 分数 | 等级 | 标识 |
|------|------|------|
| 80–100 | Safe | 🟢 |
| 60–79 | Low Risk | 🟡 |
| 0–59 | Needs Review | 🔴 |

## 审计输出格式

```markdown
## MCP Security Audit: {server-name}

### Trust Score: {score}/100 — {grade} {emoji}

### Findings

| # | Rule ID | Severity | Description | Evidence |
|---|---------|----------|-------------|----------|
| 1 | mcp-command-injection | High | Shell sub-execution in args | `$(cat /etc/passwd)` at args[2] |

### Permission Profile

| Dimension | Access |
|-----------|--------|
| 📁 FileSystem | `/home/user/data`, `/tmp/mcp` |
| 🌐 Network | `*` (npx) |
| 💻 Shell | `npx` |
| 🗄️ Database | — |
| 🔑 Env | `API_KEY`, `DATABASE_URL` |

### Combination Risks
- ⚠️ Network + Env → credential exfiltration risk

### Recommendations
1. Scope the npm package: use `@org/package` instead of `package`
2. Bind to `127.0.0.1` instead of `0.0.0.0`
3. Remove shell sub-execution patterns from args
```

## 与其他技能的关系

- **`skill-vetter`**: 通用技能审计（含去混淆、18 条规则、量化评分）。MCP 审计是 skill-vetter 的子集，当目标明确是 MCP server 时使用本技能获得更聚焦的审计。
- **`security-briefing`**: 外部 CVE/漏洞情报，与本技能互补（一个看内，一个看外）。

## 常见误报与处理

| 场景 | 判断 | 处理 |
|------|------|------|
| `$()` 出现在文档说明的 SQL 示例中 | 误报 | 跳过（SQL 分号豁免） |
| `grep "pattern" \| sort` | 误报 | 管道组合豁免 |
| scoped 包 `@modelcontextprotocol/server-xxx` | 安全 | 不触发供应链规则 |
| filesystem MCP 仅访问 `/tmp` | 安全 | 不触发过宽权限 |
| MCP env 中无密钥格式值 | 低风险 | 正常记录，不额外扣分 |

## 局限性

- 纯静态分析，无法检测运行时行为
- 正则匹配可被复杂编码/混淆绕过
- 不分析 npm 依赖树（仅包名 typosquatting 检测）
- 不验证 MCP server 的数字签名或 checksum
