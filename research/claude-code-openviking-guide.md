# Claude Code 接入 OpenViking 完整指南

> 日期: 2026-04-13
> 标签: #claude-code #openviking #mcp #memory
> 环境: WSL2 Ubuntu, OpenViking v0.3.2, Claude Code (Windows)

## 概述

OpenViking 是一个长期语义记忆系统（向量 DB + AI 抽取），可以让 Claude Code 获得跨项目、跨会话的持久记忆能力。接入后：

- **Auto-Recall**: 每次提问自动搜索相关记忆，注入上下文
- **Auto-Capture**: 每轮对话结束自动抽取记忆存储
- **手动工具**: `memory_recall` / `memory_store` / `memory_forget`

---

## 方案对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| **Plugin 完整版** | auto-recall/capture 全自动，零配置 | 安装步骤多，依赖 marketplace |
| **自定义 MCP 精简版** | 简单可控，3 分钟搞定 | 无 auto-recall/capture，需手动调用工具 |

---

## 前置条件

OpenViking 需要先安装并运行（你已有）：

```bash
# 检查状态
curl http://127.0.0.1:1933/health
# 应返回 {"status":"ok","healthy":true,"version":"0.3.2"}
```

当前配置文件 `~/.openviking/ov.conf`：
- 服务端口: 1933
- API Key: 已配置
- Embedding: BAAI/bge-m3 (SiliconFlow)
- VLM: zai/glm-4.6v (智谱)

---

## 方案 A：自定义 MCP Server（推荐先试这个）

### 1. 创建项目目录

```bash
mkdir -p ~/openviking-memory-mcp
cd ~/openviking-memory-mcp
```

### 2. 初始化项目

```bash
cat > package.json << 'EOF'
{
  "name": "openviking-memory-mcp",
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.12.1",
    "zod": "^3.24.0"
  }
}
EOF

npm install
```

### 3. 创建 MCP Server

```bash
cat > server.mjs << 'SERVER_EOF'
#!/usr/bin/env node
/**
 * OpenViking Memory MCP Server
 * Standalone, no marketplace plugin needed.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

function loadConfig() {
  const configPath = join(homedir(), ".openviking", "ov.conf");
  let raw;
  try { raw = readFileSync(configPath, "utf-8"); }
  catch { return { baseUrl: "http://localhost:1933", apiKey: "", agentId: "claude-code" }; }
  const file = JSON.parse(raw);
  const server = file.server || {};
  const cc = file.claude_code || {};
  const host = (server.host || "127.0.0.1").replace("0.0.0.0", "127.0.0.1");
  const port = server.port || 1933;
  return {
    baseUrl: `http://${host}:${port}`,
    apiKey: server.root_api_key || "",
    agentId: cc.agentId || "claude-code",
    timeoutMs: cc.timeoutMs || 15000,
  };
}

const config = loadConfig();

async function ovFetch(path, options = {}) {
  const url = `${config.baseUrl}${path}`;
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (config.apiKey) headers["X-API-Key"] = config.apiKey;
  headers["X-OpenViking-Account"] = "default";
  headers["X-OpenViking-User"] = "default";
  if (config.agentId) headers["X-OpenViking-Agent"] = config.agentId;
  const res = await fetch(url, {
    ...options, headers,
    signal: AbortSignal.timeout(config.timeoutMs)
  });
  const body = await res.json();
  if (body.status === "error") throw new Error(body.error?.message || "OpenViking API error");
  return body.result ?? body;
}

async function searchAll(query, limit = 10) {
  const scopes = ["viking://user/memories", "viking://agent/memories", "viking://resources"];
  const results = await Promise.allSettled(scopes.map(async (scope) => {
    const data = await ovFetch("/api/v1/search/find", {
      method: "POST",
      body: JSON.stringify({ query, target_uri: scope, limit, score_threshold: 0 }),
    });
    return data.memories || [];
  }));
  const all = [];
  const seen = new Set();
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    for (const m of r.value) {
      if (!seen.has(m.uri)) { seen.add(m.uri); all.push(m); }
    }
  }
  return all.filter((m) => m.level === 2);
}

async function readContent(uri) {
  try { return await ovFetch(`/api/v1/content/read?uri=${encodeURIComponent(uri)}`); }
  catch { return null; }
}

const server = new McpServer({ name: "openviking-memory", version: "1.0.0" });

server.tool("memory_recall",
  "Search long-term memories from OpenViking.",
  { query: z.string().describe("Search query"), limit: z.number().optional().describe("Max results (default 6)") },
  async ({ query, limit = 6 }) => {
    const memories = await searchAll(query, limit);
    if (memories.length === 0) return { content: [{ type: "text", text: "No memories found." }] };
    const lines = await Promise.all(memories.map(async (m) => {
      const content = await readContent(m.uri);
      const text = content && typeof content === "string" && content.trim()
        ? content.trim().slice(0, 2000)
        : (m.abstract || m.overview || m.uri);
      const score = m.score ? ` (score: ${m.score.toFixed(3)})` : "";
      const category = m.category || "memory";
      return `[${category}]${score} ${text}`;
    }));
    return { content: [{ type: "text", text: lines.join("\n\n---\n\n") }] };
  }
);

server.tool("memory_store",
  "Store information into OpenViking long-term memory.",
  { text: z.string().describe("Text to store as memory"), role: z.string().optional().describe("Speaker role (default: user)") },
  async ({ text, role = "user" }) => {
    const session = await ovFetch("/api/v1/sessions", {
      method: "POST",
      body: JSON.stringify({ agent_id: config.agentId }),
    });
    if (!session?.session_id) return { content: [{ type: "text", text: "Failed to create session." }] };
    await ovFetch(`/api/v1/sessions/${encodeURIComponent(session.session_id)}/messages`, {
      method: "POST",
      body: JSON.stringify({ role, content: text }),
    });
    await ovFetch(`/api/v1/sessions/${encodeURIComponent(session.session_id)}/extract`, { method: "POST" });
    return { content: [{ type: "text", text: `Memory stored successfully.` }] };
  }
);

server.tool("memory_forget",
  "Delete a memory from OpenViking by URI, or search then delete matching memories.",
  { uri: z.string().optional().describe("Exact URI to delete"), query: z.string().optional().describe("Search query to find and delete") },
  async ({ uri, query }) => {
    if (!uri && !query) return { content: [{ type: "text", text: "Provide either uri or query." }] };
    const toDelete = [];
    if (uri) toDelete.push(uri);
    else {
      const memories = await searchAll(query, 5);
      toDelete.push(...memories.map((m) => m.uri));
    }
    if (toDelete.length === 0) return { content: [{ type: "text", text: "No matching memories found." }] };
    const results = await Promise.allSettled(toDelete.map(async (u) => {
      await ovFetch(`/api/v1/fs/rm?uri=${encodeURIComponent(u)}`, { method: "POST" });
      return u;
    }));
    const deleted = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
    return { content: [{ type: "text", text: `Deleted ${deleted.length} memories:\n${deleted.join("\n")}` }] };
  }
);

server.tool("memory_health", "Check OpenViking server health and connection status.", {},
  async () => {
    try {
      const health = await ovFetch("/health");
      return { content: [{ type: "text", text: `OpenViking: ✅ Healthy\nVersion: ${health.version}\nURL: ${config.baseUrl}` }] };
    } catch (e) {
      return { content: [{ type: "text", text: `❌ Cannot reach OpenViking at ${config.baseUrl}\n${e.message}` }] };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
SERVER_EOF
```

### 4. 配置 Claude Code

在 Windows 的 Claude Code 配置中添加 MCP server。

**文件位置**: `%APPDATA%\Claude\settings.json`（全局）或项目目录 `.claude/settings.json`

```json
{
  "mcpServers": {
    "openviking-memory": {
      "command": "wsl",
      "args": ["node", "/home/rays/openviking-memory-mcp/server.mjs"]
    }
  }
}
```

> **原理**: Claude Code (Windows) 通过 `wsl node` 跨系统调用 WSL2 中的 Node.js 启动 MCP server，server 通过 stdio 与 Claude Code 通信，通过 HTTP 访问 WSL2 中运行的 OpenViking。

### 5. 验证

1. 新开一个 Claude Code session
2. 输入 `/mcp` 查看 `openviking-memory` 是否显示 ✔
3. 测试：`用 memory_recall 搜索关于 nian-desktop 的记忆`
4. 健康检查：`用 memory_health 检查 OpenViking 连接`

### 4 个可用工具

| 工具 | 用途 | 示例 |
|------|------|------|
| `memory_recall` | 语义搜索记忆 | `memory_recall("项目技术栈")` |
| `memory_store` | 手动存储记忆 | `memory_store("这个项目用 Rust")` |
| `memory_forget` | 删除记忆 | `memory_forget(query="过时的配置")` |
| `memory_health` | 检查连接 | `memory_health()` |

---

## 方案 B：Plugin 完整版（含 Auto-Recall + Auto-Capture）

### 架构

```
Claude Code
├── Hooks（透明）
│   ├── SessionStart → 安装运行时依赖
│   ├── UserPromptSubmit → 自动搜索记忆 → 注入上下文
│   └── Stop → 自动抽取记忆 → 存储
└── MCP Server（手动调用）
    ├── memory_recall
    ├── memory_store
    ├── memory_forget
    └── memory_health
```

### 安装步骤

```bash
# 在 Claude Code 中执行
/plugin marketplace add Castor6/openviking-plugins
/plugin install claude-code-memory-plugin@openviking-plugin
```

### 配置

在 `~/.openviking/ov.conf` 中添加 `claude_code` 段：

```json
{
  "claude_code": {
    "agentId": "claude-code",
    "recallLimit": 6,
    "captureMode": "semantic",
    "captureTimeoutMs": 30000,
    "captureAssistantTurns": false,
    "logRankingDetails": false
  }
}
```

### WSL2 特殊处理

Plugin 默认安装在 Windows 侧，但 OpenViking 运行在 WSL2。需要确保：
- OpenViking 监听 `0.0.0.0`（已配置 ✅）
- Windows 可通过 `localhost:1933` 访问 WSL2 服务（WSL2 默认端口转发 ✅）

### Hook 超时设置

| Hook | 默认 | 说明 |
|------|------|------|
| SessionStart | 120s | 首次安装依赖 |
| UserPromptSubmit | 8s | auto-recall 要快 |
| Stop | 45s | auto-capture 有足够时间 |

---

## 与 Claude Code 内置 MEMORY.md 的关系

| 特性 | 内置 MEMORY.md | OpenViking |
|------|---------------|-----------|
| 存储 | Markdown 文件 | 向量 DB + 结构化抽取 |
| 搜索 | 全量加载上下文 | 语义相似度搜索 |
| 范围 | 单项目 | 跨项目、跨会话 |
| 容量 | ~200 行（受上下文限制） | 无限（服务端存储） |
| 抽取 | 手动规则 | AI 驱动实体抽取 |

**建议**: 两者互补使用。MEMORY.md 存项目级核心配置/规范，OpenViking 存跨项目经验/偏好/长期知识。

---

## 故障排查

| 症状 | 原因 | 解决 |
|------|------|------|
| MCP server 启动失败 | WSL node_modules 不兼容 Windows | 用 `wsl node` 启动而非直接 Windows node |
| 搜索返回空 | OpenViking 未运行 | `curl http://127.0.0.1:1933/health` 检查 |
| auto-recall 超时 | 8s 内搜索完不成 | 调大 `claude_code.timeoutMs` |
| auto-capture 重复存储 | Hook 超时导致增量状态未保存 | 确认 `captureAssistantTurns=false` |
| Plugin marketplace 404 | 仓库地址变更 | 改用方案 A 自定义 MCP |

---

## 参考链接

- OpenViking GitHub: https://github.com/volcengine/OpenViking
- Plugin 源码: `~/.openclaw/workspace/_inbox/claude-code-backup-20260406/wsl/plugins/cache/openviking-plugin/claude-code-memory-plugin/0.1.0/`
- 精简 MCP Server 源码: `~/.openclaw/workspace/_inbox/claude-code-backup-20260406/wsl/openviking-memory-mcp/server.mjs`
- OpenViking 配置: `~/.openviking/ov.conf`
