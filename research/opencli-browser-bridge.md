# OpenCLI Browser Bridge 架构分析

> 版本 v1.6.8 | 分析日期 2026-04-07 | 源码位置 `/tmp/opencli-src/`

## 1. 整体架构

OpenCLI Browser Bridge 采用 **CLI → Daemon → Chrome Extension → CDP** 四层架构，通过本地 HTTP+WebSocket 桥接实现 Node.js CLI 对真实 Chrome 浏览器的控制。

```
┌──────────┐   HTTP POST   ┌──────────────┐   WebSocket   ┌──────────────────┐   chrome.debugger API   ┌────────────┐
│  CLI /   │ ────────────→ │   Daemon     │ ────────────→ │  Chrome Extension │ ────────────────────→ │  Chrome    │
│  Node.js │ ←──────────── │ (micro-http) │ ←──────────── │  (MV3 SW)        │ ←──────────────────── │  Tab/CDP   │
└──────────┘   JSON resp   └──────────────┘   JSON msg    └──────────────────┘   CDP events          └────────────┘
     │                        ↑ port 19825                    │ localhost only
     │                        │ auto-spawn, 4h idle           │ ~24s keepalive alarm
     └── X-OpenCLI header ────┘                               │ workspace-based session isolation
```

### 关键组件

| 组件 | 文件 | 职责 |
|------|------|------|
| **Daemon** | `src/daemon.ts` | 微型 HTTP+WS 服务，loopback-only，请求桥接 |
| **BrowserBridge** | `src/browser/bridge.ts` | Daemon 生命周期管理（自动启动/探活） |
| **Page** | `src/browser/page.ts` | IPage 抽象实现，通过 daemon-client 发命令 |
| **DaemonClient** | `src/browser/daemon-client.ts` | HTTP 客户端，4 次重试，瞬态错误识别 |
| **CDPBridge** | `src/browser/cdp.ts` | 直连 CDP WebSocket（Electron 应用专用） |
| **Extension SW** | `extension/src/background.ts` | 命令分发、自动化窗口管理、会话隔离 |
| **Extension CDP** | `extension/src/cdp.ts` | chrome.debugger attach/evaluate/screenshot |
| **Stealth** | `src/browser/stealth.ts` | 13 项反检测补丁 |

## 2. 通信协议

### CLI → Daemon（HTTP）

```
POST http://127.0.0.1:19825/command
Header: X-OpenCLI: 1, Content-Type: application/json
Body: { id: "cmd_...", action: "exec|navigate|tabs|...", workspace?: "default" }
Response: { id, ok, data?, error? }
```

CLI 端 `sendCommand()` 实现 **4 次自动重试**：网络错误 500ms 间隔，瞬态扩展错误 1500ms 间隔（应对 Service Worker 重启）。

### Daemon ↔ Extension（WebSocket）

路径 `ws://localhost:19825/ext`，JSON 帧通信：

```typescript
// CLI → Extension（通过 daemon 转发）
{ id: "cmd_...", action: "exec", code: "document.title", tabId: 42 }

// Extension → Daemon（结果回传）
{ id: "cmd_...", ok: true, data: "Page Title" }

// Extension → Daemon（日志转发）
{ type: "log", level: "error", msg: "...", ts: 1712000000000 }

// 握手
{ type: "hello", version: "1.6.8" }
```

**心跳机制**：daemon 每 15s ping 扩展，连续 2 次无 pong 则断开。

### Extension → Chrome（CDP）

通过 `chrome.debugger` API，支持 12 个 CDP 方法的白名单：

```
Accessibility.getFullAXTree | DOM.* | Input.dispatchMouseEvent |
Input.dispatchKeyEvent | Input.insertText | Page.* | Runtime.enable | Emulation.*
```

## 3. 安全模型

Daemon 实现了 **5 层纵深防御**：

1. **Origin 检查** — 仅接受 `chrome-extension://` 来源或无 Origin（curl/Node.js）
2. **自定义 Header** — 要求 `X-OpenCLI: 1`，浏览器无法在简单请求中附加自定义 header
3. **无 CORS 头** — 响应不含 `Access-Control-Allow-Origin`，preflight 返回 204 空
4. **Body 大小限制** — 1MB 上限防止 OOM
5. **WS verifyClient** — WebSocket 升级前拒绝非扩展来源

关键设计：**Node.js fetch 不发送 Origin header**，而浏览器 fetch 始终发送，这是区分合法 CLI 请求与网页 CSRF 的基础。

## 4. 会话隔离

扩展采用 **workspace 隔离模型**：

```typescript
// 每个 workspace 维护独立的自动化窗口
const automationSessions = new Map<string, AutomationSession>();

// 会话结构
type AutomationSession = {
  windowId: number;          // 专属 Chrome 窗口
  idleTimer: number | null;  // 30s 空闲超时
  owned: boolean;            // true=自创窗口, false=借用的用户标签页
  preferredTabId: number | null;
};
```

- **默认 workspace**：自动创建 1280×900 后台窗口
- **`operate:` 前缀**：启用激进重试（5 次 attach，1500ms 间隔）
- **`bind-current`**：将用户当前标签页绑定到 workspace（只读借用，不拥有窗口）
- 窗口 30s 无命令自动关闭，tab 漂移检测与自动恢复

## 5. 反检测机制

`stealth.ts` 实现 **13 项补丁**，注入时机为 `Page.addScriptToEvaluateOnNewDocument`（在页面脚本之前执行）：

| # | 补丁 | 目标检测 |
|---|------|----------|
| 1 | `navigator.webdriver = false` | 最常见的自动化检测 |
| 2 | `window.chrome` stub | headless 缺少 chrome 对象 |
| 3 | 伪造 plugins 列表 | 空 plugins = 自动化特征 |
| 4 | `navigator.languages` 兜底 | 空 languages = 异常 |
| 5 | Permissions.query 兼容 | headless throws on notifications |
| 6 | 清除 `__playwright`/`__puppeteer`/`cdc_*` | 框架遗留物 |
| 7 | Error.stack CDP 痕迹过滤 | 堆栈中的 pptr:/debugger:// |
| 8 | Function/eval debugger 语句剥离 | 反调试定时检测 |
| 9 | Console 方法 toString 修复 | CDP Runtime.enable 改变 console |
| 10 | outerWidth/outerHeight 修正 | DevTools 改变窗口尺寸 |
| 11 | Performance API 清理 | debugger/devtools 资源条目 |
| 12 | document.$cdc_ 属性清除 | ChromeDriver 特征 |
| 13 | iframe chrome 一致性 | 跨 iframe chrome 对象检查 |

**toString 防护**：通过 `Function.prototype.toString` 全局 WeakMap 拦截，使所有猴子补丁函数在被 `toString()` 或 `Function.prototype.toString.call()` 检查时返回 `function xxx() { [native code] }`。

**injector.ts** 的 XHR/fetch 拦截器也使用相同的 toString 伪装机制。

## 6. 认证策略级联（Cascade）

`cascade.ts` 实现自动降级探测：

```
PUBLIC（裸 fetch）→ COOKIE（with credentials）→ HEADER（+ CSRF token）→ INTERCEPT → UI
```

每个策略通过 `page.evaluate()` 注入 fetch 探针，检查 HTTP 状态码和响应体是否为有效 JSON，自动选择最小权限策略。

## 7. Node 侧网络层

`node-network.ts` 基于 `undici` 实现代理感知的 fetch 替换：

- 自动读取 `http_proxy`/`https_proxy`/`all_proxy` 环境变量
- `no_proxy` 支持（通配符、域名后缀、端口匹配）
- loopback 地址（127.0.0.1, localhost, ::1）强制直连
- `installNodeNetwork()` 全局替换 `globalThis.fetch`

## 8. 双 CDP 路径

系统提供两种 CDP 连接方式：

| 路径 | 实现 | 适用场景 |
|------|------|----------|
| **BrowserBridge** | CLI → Daemon → Extension → chrome.debugger | 常规 Chrome 浏览器操作 |
| **CDPBridge** | CLI → 直连 CDP WebSocket | Electron 应用（VS Code, Slack 等） |

CDPBridge 自动发现策略：通过 `/json` 列表按类型评分（page > iframe, localhost 加分, devtools 排除），支持 `OPENCLI_CDP_TARGET` 环境变量指定偏好。

## 9. 与 OpenClaw 浏览器方案对比

| 维度 | OpenCLI | OpenClaw |
|------|---------|----------|
| **浏览器控制** | Chrome Extension + chrome.debugger | 内置 Chromium (OpenClaw-managed) |
| **安装依赖** | 需安装 Chrome 扩展 | 零安装，自动管理 |
| **用户登录态** | 利用用户已有 Chrome session | 需 profile="user" 使用用户浏览器 |
| **隔离性** | 独立自动化窗口 + workspace 隔离 | 完全隔离的浏览器实例 |
| **反检测** | 13 项 stealth 补丁 + toString 伪装 | 依赖 Playwright 内置 stealth |
| **通信协议** | HTTP+WS 自定义协议 | OpenClaw 内置协议 |
| **CDP 直连** | 支持（Electron 应用） | 通过 browser 工具 |
| **扩展共存** | 需处理与其他扩展的 debugger 冲突 | 无此问题 |

**关键差异**：OpenCLI 的核心价值在于**复用用户已登录的 Chrome session**，避免重复登录。OpenClaw 则更注重**隔离性**，适合自动化测试场景。两者互补——OpenCLI 更适合需要用户登录态的爬取/操作场景。

## 10. 关键发现

1. **安全设计精良**：5 层纵深防御、自定义 header 区分 CLI 与浏览器请求、WS origin 验证
2. **容错性强**：4 次重试、瞬态错误识别、扩展冲突自动恢复（detach+reattach）、tab 漂移检测
3. **反检测全面**：13 项补丁覆盖主流检测向量，toString 伪装防止间接检测
4. **会话模型灵活**：workspace 隔离 + bind-current 借用模式 + operate 激进模式
5. **架构简洁**：daemon 仅 ~300 行，职责单一（HTTP↔WS 桥接），无状态
6. **Electron 支持**：CDP 直连 + 目标自动发现，适合桌面应用自动化
