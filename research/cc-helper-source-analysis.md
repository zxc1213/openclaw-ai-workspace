# cc-helper 源码分析

> 分析版本: 1.3.1 | 分析日期: 2026-04-06 | 仓库: https://github.com/next-bin/cc-helper

## 1. 项目概述

cc-helper 是一个 **Claude Code 增强工具**，npm 包名为 `@unitsvc/cc-helper`。它通过修改 Claude Code 的 `~/.claude/settings.json` 配置文件，解锁 Claude Code 中被限制或隐藏的功能。

### 关键事实

- **语言**: 核心逻辑用 Go 编写，编译为静态链接二进制（12MB+），stripped
- **安装方式**: npm 包只是安装引导器（JS），运行时自动下载平台对应的 Go 二进制到 `~/.claude/bin/`
- **源码状态**: GitHub 仓库只有 README 和 LICENSE，**源码未开源**（AGPL-3.0 许可证但无实际源码）
- **集成方式**: 纯配置注入 — 修改 `~/.claude/settings.json`，不 hook 或 monkey-patch Claude Code

## 2. 仓库结构

```
GitHub 仓库 (main 分支):
├── README.md           # 英文文档
├── README-zh.md        # 中文文档
├── LICENSE             # AGPL-3.0
├── docs/images/        # 功能截图
├── version.txt         # 版本号: 1.3.1
└── .gitignore

npm 包 (@unitsvc/cc-helper):
├── dist/
│   ├── cli.js          # CLI 入口 (安装引导器, ~10KB)
│   └── index.js        # 二进制下载/管理 (~9KB)
├── package.json
└── README.md

运行时安装:
└── ~/.claude/bin/cc-helper   # Go 静态编译二进制 (12MB, linux-amd64)
```

## 3. 核心模块分析

### 3.1 安装引导器 (dist/cli.js, dist/index.js)

npm 包中的 JS 代码仅负责：

1. **平台检测**: 识别 OS (darwin/linux/windows) 和架构 (amd64/arm64)
2. **版本查询**: 通过 GitHub API 获取最新 release
3. **二进制下载**: 下载对应平台的 tar.gz/zip
4. **解压安装**: 解压到 `~/.claude/bin/` 并设置执行权限
5. **代理支持**: 支持 `--proxy` 参数通过 HTTP 代理下载

关键代码路径:
```
getBinaryPath() → ~/.claude/bin/cc-helper
install() → 下载 + 解压 + 安装
main() → 解析命令行 → spawn 二进制
```

### 3.2 功能启用机制 (enable/disable)

cc-helper 的核心集成方式是**修改 Claude Code 配置文件**：

```go
// 从二进制字符串提取的 Go 模块路径
github.com/next-bin/cc-helper/internal/cmd/enable
github.com/next-bin/cc-helper/internal/cmd/disable
```

**启用流程**:
1. 备份当前 `~/.claude/settings.json`
2. 注入 feature flags 和环境变量
3. 配置 MCP servers（如 toolsearch）
4. 修改 `hasCompletedOnboarding` 等 Claude Code 内部状态

**关键配置注入**:
```json
{
  "env": {
    "DISABLE_INSTALLATION_CHECKS": "1",
    "DISABLE_AUTOUPDATER": "1",
    "DISABLE_BUG_COMMAND": "1",
    "DISABLE_ERROR_REPORTING": "1",
    "DISABLE_TELEMETRY": "1",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
    "CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY": "1",
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1",
    "CLAUDE_CODE_HIDE_ACCOUNT_INFO": "1",
    "CLAUDE_CODE_NEW_INIT": "1",
    "CLAUDE_CODE_ATTRIBUTION_HEADER": "0",
    "API_TIMEOUT_MS": "3000000"
  }
}
```

### 3.3 /loop — 定时循环任务

**实现原理**: `/loop` 是作为自定义 slash command 注入到 Claude Code 的。从字符串分析发现：

- 内部代号: `tengu_kairos_cron`
- 通过 `settings.json` 中的 `commands` 配置注入
- 检测环境变量 `CLAUDE_CODE_DISABLE_CRON` 来决定是否启用
- 实现了 session-scoped 的定时任务，自动过期（3天）
- 有 jitter 保护防止 API 雷群效应
- 在用户回合间低优先级触发

关键字符串证据:
```
tengu_kairos_cron
CLAUDE_CODE_DISABLE_CRON
/loop [interval] <prompt>
```

### 3.4 /btw — 旁支问题（扩展思维）

**实现原理**: `/btw` 也是通过配置注入的 slash command：

```
Enable /btw command for extended thinking (extract thinking blocks from API responses)
/btw <question>
```

从字符串中可以看到思维块提取逻辑：
```javascript
// 多个版本的思维块提取函数
let _th = q.filter((z) => z.type === "thinking").map((z) => z.thinking).join("\n"),
    _tx = q.filter((z) => z.type === "text").map((z) => ("text" in z) ? z.text : "").join("\n"),
    _ = [_th, _tx].filter(Boolean).join("\n---\n").trim();
```

这说明 /btw 通过解析 API 响应中的 `thinking` 类型块，提取模型的推理过程。

### 3.5 automode — 自动模式全模型解锁

这是最复杂的模块，从 Go 符号可以看到完整的功能链：

```
github.com/next-bin/cc-helper/internal/feature/automode.applyGenericPatches
github.com/next-bin/cc-helper/internal/feature/automode.patchAvailabilityCheck
github.com/next-bin/cc-helper/internal/feature/automode.patchClassifierModel
github.com/next-bin/cc-helper/internal/feature/automode.patchConfigEnabled
github.com/next-bin/cc-helper/internal/feature/automode.patchGateAsync
github.com/next-bin/cc-helper/internal/feature/automode.patchIronGate
github.com/next-bin/cc-helper/internal/feature/automode.patchUnavailableReason
```

**核心机制**: automode 通过**正则匹配和函数替换**来修改 Claude Code 的运行时代码：

```javascript
// automode 配置管理
function $1() {
  let config = getConfig("tengu_auto_mode_config", {});
  return config?.enabled;
}

// 分类器模型替换
function $1() {
  let config = getConfig("tengu_auto_mode_config", {});
  if (config?.model) return config.model;
  return getDefaultModel();
}

// iron gate（铁门）控制 — fail closed 策略
if(!1) return V("Auto mode classifier unavailable, denying with retry guidance (fail closed)")

// circuit breaker（熔断器）
function $1() {
  if (getSetting()) return "settings";
  if (isAutoModeCircuitBroken() ?? !false) return "circuit-breaker";
  if (!checkModelCompatibility(getCurrentModel())) return "model";
  return null;
}
```

**关键设计模式**:
- **Gate pattern**: 使用多层门控（iron gate, gate async）来控制 automode 的启用
- **Circuit breaker**: 熔断机制防止异常情况
- **Version-specific patches**: 针对不同 Claude Code 版本的适配补丁
- **Fail closed**: 分类器不可用时默认拒绝而非允许

### 3.6 plan — 多 Provider 配置管理

**支持的 Provider**:

| Provider | API Base URL |
|----------|-------------|
| bailian (阿里) | `https://dashscope.aliyuncs.com/apps/anthropic` |
| minimaxi | `https://api.minimaxi.com/anthropic` |
| glm (智谱CN) | `https://open.bigmodel.cn/api/anthropic` |
| zai (智谱EN) | `https://z.ai/...` |

**Model Profiles**: 每个 provider 支持多个模型 profile，映射 Claude Code 的 5 个模型层级：
- `ANTHROPIC_MODEL` (默认)
- `ANTHROPIC_DEFAULT_HAIKU_MODEL` (快速)
- `ANTHROPIC_DEFAULT_SONNET_MODEL` (平衡)
- `ANTHROPIC_DEFAULT_OPUS_MODEL` (强力)
- `ANTHROPIC_REASONING_MODEL` (推理)

**配置存储**: `~/.cc-helper/cc-helper.json`

### 3.7 vault — 加密密钥管理

**加密方案**: 使用 **JWE (JSON Web Encryption)** 和 **ECDSA-P256-AES256GCM** 加密。

关键字符串证据:
```
ECDSA-P256-AES256GCM
vault secret for %s/%s is JWE-encrypted with a different key and cannot be decrypted
failed to derive key pair: %w
failed to decrypt API key: %w
vault://%s#%s
```

- 支持密码派生密钥对（PBKDF2）— 可恢复
- 支持随机生成密钥对（ECDSA P-256）
- 每个环境独立加密
- Secret 格式: `vault://provider#environment`

**密钥存储位置**:
- 默认: `~/.cc-helper/cc-helper.json`
- Workspace 隔离: `~/.cc-helper/workspaces/<name>/`

### 3.8 sync — Git 同步

**实现**: 使用 Go 的 git 库进行 Git 操作，支持：
- GitHub 认证（token 或 SSH）
- 分支管理（可指定 branch）
- 加密导出/导入（整个环境配置）
- 凭证存储（`~/.cc-helper/.env`）

关键 Go 依赖:
```
go-jose/go-jose          # JWE/JWK 加密
go-git/go-git            # Git 操作
github.com/mark3labs/mcp-go  # MCP SDK
```

### 3.9 toolsearch — 动态工具搜索

**目的**: 减少 token 消耗，按需加载 MCP 工具。

```
ENABLE_TOOL_SEARCH=auto:5  # 工具占 context 5% 以上时激活
```

**工作原理**:
- 拦截 Claude Code 的 `tools/list` 请求
- 当工具定义超过阈值时，返回精简列表
- Claude Code 通过 `tools/call` 时按需搜索加载

Go 模块路径:
```
github.com/next-bin/cc-helper/internal/feature/toolsearch
github.com/next-bin/cc-helper/internal/feature/toolsearch/feature.go
```

### 3.10 keybindings — 自定义快捷键

**实现**: 写入 `~/.claude/keybindings.json`。

内部代号: `tengu_keybinding_customization_release`

```json
{
  "submit": ["ctrl+s"],
  "interrupt": ["ctrl+c"],
  "custom_commands": { "ctrl+shift+l": "/loop 5m check status" }
}
```

### 3.11 weixin channel — 微信通道（隐藏功能）

从字符串分析发现一个**完整的微信通道模块**，支持：
- 微信二维码登录
- 消息收发（文本/图片/视频/语音）
- 长轮询消息监听
- 权限请求/回复
- CDN 上传下载

```
weixin channel: long-poll started (%s)
weixin channel: permission reply parsed: %s -> %s for request %s
notifications/claude/channel/permission_request
notifications/claude/channel/permission
Scan this QR code with WeChat to connect
```

## 4. 与 Claude Code 的集成机制

### 4.1 主要集成方式: 配置注入

cc-helper **不 monkey-patch 或 hook Claude Code 的运行时代码**。它通过以下方式集成：

1. **settings.json 修改**: 修改 `~/.claude/settings.json` 中的：
   - `env` — 环境变量（禁用遥测、启用实验功能等）
   - `commands` — 自定义 slash commands（/loop, /btw）
   - `mcpServers` — MCP 服务器配置（toolsearch, weixin 等）
   - `permissions` — 权限配置
   - `hasCompletedOnboarding` — 跳过新手引导

2. **CLAUDE.md 注入**: 在项目根目录的 CLAUDE.md 中注入指令

3. **automode 的特殊处理**: 对于 automode，使用正则匹配替换 Claude Code 的内部 JS 函数，这是唯一需要修改运行时代码的功能

### 4.2 automode 的代码修改策略

automode 模块使用**版本化的正则替换**来修改 Claude Code 内部函数：

```javascript
// 命名约定: tengu_ 前缀
"tengu_harbor"
"tengu_harbor_permissions"
"tengu_iron_gate_closed"
"tengu_auto_mode_config"
"tengu_keybinding_customization_release"
"tengu_marble_whisper"
"tengu_cobalt_compass"
"tengu_kairos_cron"
```

**多版本兼容策略**:
- 维护多个版本的 regex patterns
- 有通用 fallback pattern: `Generic pattern for older versions`
- 通过版本检测选择对应的 patch set
- Gate pattern 命名如 `Gate (A,q,K), uses Mq marketplace, uses i7 auth`

### 4.3 MCP Server

cc-helper 还内置了 **MCP Server** 功能（使用 `github.com/mark3labs/mcp-go` SDK）：

```
github.com/mark3labs/mcp-go@v0.46.0/mcp/tools.go
github.com/mark3labs/mcp-go@v0.46.0/server/hooks.go
github.com/mark3labs/mcp-go@v0.46.0/server/task_hooks.go
```

提供 MCP 工具注册和通知功能。

## 5. 安全分析

### 5.1 ⚠️ 重大安全风险

1. **源码未开源**: 声称 AGPL-3.0 许可但实际不提供源码（仓库只有 README），存在**许可证合规问题**
2. **闭源二进制**: 用户无法审计实际代码行为，AGPL 要求开源
3. **API Key 处理**: 加密存储在本地 `cc-helper.json` 中，虽然使用 JWE 加密，但密钥管理方案的安全性取决于用户密码强度
4. **automode 代码修改**: 通过正则替换修改 Claude Code 内部函数，可能引入不稳定性和安全风险
5. **tengu_* 命名空间污染**: 大量使用 `tengu_` 前缀变量注入到 Claude Code 运行时

### 5.2 ⚡ 潜在风险

1. **远程配置**: 字符串中有 `remote config: empty URL` 和 `module config: empty URL`，暗示可能存在远程配置拉取功能
2. **Channels marketplace**: 微信通道有 marketplace 白名单 `@next-bin`，可能扩展第三方通道
3. **认证 token**: `CC_HELPER_AUTH_TOKEN` 环境变量用于保护功能，但存储在 `~/.cc-helper/.env` 明文中
4. **网络请求**: 二进制包含 HTTP/HTTPS 客户端，有 GitHub API 调用、CDN 下载等网络活动

### 5.3 ✓ 正面设计

1. **Fail closed**: automode 分类器不可用时默认拒绝
2. **Circuit breaker**: 有熔断机制
3. **备份恢复**: enable 前自动备份 settings.json
4. **零运行时依赖**: Go 静态编译，不需要额外安装
5. **Workspace 隔离**: 支持 `--workspace` 参数隔离不同项目的配置

## 6. 值得借鉴的设计模式

1. **版本化 Patch 系统**: 针对不同 Claude Code 版本维护不同的正则替换规则，优雅处理版本兼容
2. **Gate Pattern**: 多层门控 + fail closed 策略确保安全性
3. **JWE 加密方案**: 使用标准 JWE 加密 API Key，支持密码恢复
4. **配置注入而非运行时修改**: 大部分功能通过配置文件实现，最小化侵入性
5. **二进制分发模式**: npm 包作为安装引导器，实际功能在原生二进制中，避免 Node.js 环境依赖

## 7. Go 依赖分析

从二进制中提取的主要 Go 依赖：

| 依赖 | 用途 |
|------|------|
| `github.com/mark3labs/mcp-go@v0.46.0` | MCP 协议 SDK |
| `github.com/go-jose/go-jose` | JWE/JWK 加密 |
| `go-git/go-git` | Git 操作 |
| `github.com/spf13/cobra` | CLI 框架 |
| `github.com/resty/resty` | HTTP 客户端 |
| 标准库 `crypto/*`, `x509`, `ssh` | 加密和认证 |

## 8. 总结

cc-helper 是一个设计精巧但**源码闭源**的 Claude Code 增强工具。它主要通过配置文件注入来扩展 Claude Code 功能，仅 automode 功能需要修改 Claude Code 的运行时代码。

其核心竞争力在于：
- 简化 Claude Code 与国产大模型 API 的对接
- 解锁被 Anthropic 限制的功能（/loop, automode 等）
- 提供加密的 API Key 管理和跨设备同步

但从安全角度，**闭源二进制 + 修改 Claude Code 运行时**的组合需要用户权衡信任风险。特别是 AGPL-3.0 许可证下不提供源码本身就违反了许可证要求。
