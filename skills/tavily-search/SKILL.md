---
name: tavily
description: "基于 Tavily API 的 AI 优化搜索引擎，返回简洁相关的结果。触发：web search、搜索、look up、查找文章。需要 Tavily API key。不适用于：飞书内搜索（用 feishu_search_doc_wiki）、文件搜索（用 exec/grep）、实时监控。"
homepage: https://tavily.com
metadata: {"clawdbot":{"emoji":"🔍","requires":{"bins":["node"],"env":["TAVILY_API_KEY"]},"primaryEnv":"TAVILY_API_KEY"}}
---

# Tavily Search

AI-optimized web search using Tavily API. Designed for AI agents - returns clean, relevant content.

## Search

```bash
node {baseDir}/scripts/search.mjs "query"
node {baseDir}/scripts/search.mjs "query" -n 10
node {baseDir}/scripts/search.mjs "query" --deep
node {baseDir}/scripts/search.mjs "query" --topic news
```

## Options

- `-n <count>`: Number of results (default: 5, max: 20)
- `--deep`: Use advanced search for deeper research (slower, more comprehensive)
- `--topic <topic>`: Search topic - `general` (default) or `news`
- `--days <n>`: For news topic, limit to last n days

## Extract content from URL

```bash
node {baseDir}/scripts/extract.mjs "https://example.com/article"
```

Notes:
- Needs `TAVILY_API_KEY` from https://tavily.com
- Tavily is optimized for AI - returns clean, relevant snippets
- Use `--deep` for complex research questions
- Use `--topic news` for current events
