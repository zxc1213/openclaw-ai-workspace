#!/usr/bin/env node
/**
 * OpenViking Memory MCP Server
 * Standalone, no marketplace plugin needed.
 * Connects to OpenViking server via HTTP API.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

// --- Config ---
function loadConfig() {
  const configPath = join(homedir(), ".openviking", "ov.conf");
  let raw;
  try {
    raw = readFileSync(configPath, "utf-8");
  } catch {
    return { baseUrl: "http://localhost:1933", apiKey: "", agentId: "claude-code" };
  }
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

// --- HTTP helper ---
async function ovFetch(path, options = {}) {
  const url = `${config.baseUrl}${path}`;
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (config.apiKey) headers["X-API-Key"] = config.apiKey;
  headers["X-OpenViking-Account"] = "default";
  headers["X-OpenViking-User"] = "default";
  if (config.agentId) headers["X-OpenViking-Agent"] = config.agentId;
  const res = await fetch(url, { ...options, headers, signal: AbortSignal.timeout(config.timeoutMs) });
  const body = await res.json();
  if (body.status === "error") throw new Error(body.error?.message || "OpenViking API error");
  return body.result ?? body;
}

// --- Search across all scopes ---
async function searchAll(query, limit = 10) {
  // Global search (no target_uri) — works across all accounts and scopes
  const data = await ovFetch("/api/v1/search/find", {
    method: "POST",
    body: JSON.stringify({ query, limit, score_threshold: 0 }),
  });
  const memories = data.memories || [];
  // Deduplicate by URI
  const seen = new Set();
  const unique = [];
  for (const m of memories) {
    if (!seen.has(m.uri)) {
      seen.add(m.uri);
      unique.push(m);
    }
  }
  return unique.filter((m) => m.level === 2);
}

// --- Read content ---
async function readContent(uri) {
  try {
    return await ovFetch(`/api/v1/content/read?uri=${encodeURIComponent(uri)}`);
  } catch {
    return null;
  }
}

// --- MCP Server ---
const server = new McpServer({
  name: "openviking-memory",
  version: "1.0.0",
});

server.tool(
  "memory_recall",
  "Search long-term memories from OpenViking. Returns relevant memories from all scopes (user, agent, resources).",
  { query: z.string().describe("Search query"), limit: z.number().optional().describe("Max results (default 6)") },
  async ({ query, limit = 6 }) => {
    const memories = await searchAll(query, limit);
    if (memories.length === 0) return { content: [{ type: "text", text: "No memories found." }] };

    const lines = await Promise.all(
      memories.map(async (m) => {
        const content = await readContent(m.uri);
        const text = content && typeof content === "string" && content.trim()
          ? content.trim().slice(0, 2000)
          : (m.abstract || m.overview || m.uri);
        const score = m.score ? ` (score: ${m.score.toFixed(3)})` : "";
        const category = m.category || "memory";
        return `[${category}]${score} ${text}`;
      })
    );
    return { content: [{ type: "text", text: lines.join("\n\n---\n\n") }] };
  }
);

server.tool(
  "memory_store",
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

    return { content: [{ type: "text", text: `Memory stored successfully (session: ${session.session_id.slice(0, 8)}).` }] };
  }
);

server.tool(
  "memory_forget",
  "Delete a memory from OpenViking by URI, or search then delete matching memories.",
  {
    uri: z.string().optional().describe("Exact URI to delete"),
    query: z.string().optional().describe("Search query to find and delete matching memories"),
  },
  async ({ uri, query }) => {
    if (!uri && !query) return { content: [{ type: "text", text: "Provide either uri or query." }] };

    const toDelete = [];
    if (uri) {
      toDelete.push(uri);
    } else {
      const memories = await searchAll(query, 5);
      toDelete.push(...memories.map((m) => m.uri));
    }
    if (toDelete.length === 0) return { content: [{ type: "text", text: "No matching memories found." }] };

    const results = await Promise.allSettled(
      toDelete.map(async (u) => {
        await ovFetch(`/api/v1/fs/rm?uri=${encodeURIComponent(u)}`, { method: "POST" });
        return u;
      })
    );
    const deleted = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
    return { content: [{ type: "text", text: `Deleted ${deleted.length} memories:\n${deleted.join("\n")}` }] };
  }
);

server.tool(
  "memory_health",
  "Check OpenViking server health and connection status.",
  {},
  async () => {
    try {
      const health = await ovFetch("/health");
      return {
        content: [{
          type: "text",
          text: `OpenViking: ${health.status === "ok" ? "✅ Healthy" : "❌ Unhealthy"}\nVersion: ${health.version}\nURL: ${config.baseUrl}`,
        }],
      };
    } catch (e) {
      return { content: [{ type: "text", text: `❌ Cannot reach OpenViking at ${config.baseUrl}\n${e.message}` }] };
    }
  }
);

// --- Start ---
const transport = new StdioServerTransport();
await server.connect(transport);
