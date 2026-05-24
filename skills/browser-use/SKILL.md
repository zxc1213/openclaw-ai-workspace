---
name: browser-use
description: "自动化浏览器交互：网页测试、表单填写、截图、数据提取。触发：需要导航网站、与网页交互、填写表单、截图、提取信息。需要浏览器工具可用。不适用于简单 URL 抓取（用 web_fetch）、需要完整渲染的 JS 重度站点（用 firecrawl）、批量无头自动化（用 agent-browser）。"
allowed-tools: Bash(browser-use:*)
---

# Browser Automation with browser-use CLI

Fast, persistent browser automation via CLI. Browser sessions stay open across commands.

## Prerequisites

```bash
browser-use doctor
```

## Core Workflow

1. **Navigate**: `browser-use open <url>`
2. **Inspect**: `browser-use state` (clickable elements with indices)
3. **Interact**: `browser-use click 5`, `browser-use input 3 "text"`
4. **Verify**: `browser-use state` or `browser-use screenshot`
5. **Repeat**: Browser stays open between commands

## Tips

1. **Always run `browser-use state` first** to see available elements
2. **Use `--headed` for debugging** to see the browser window
3. **Sessions persist** — the browser stays open between commands
4. **Python variables persist** across `browser-use python` commands
5. **CLI aliases**: `bu`, `browser`, `browseruse` all work identically

## Route Table

| Topic | Reference |
|-------|-----------|
| All commands (navigation, interaction, JS, cookies, wait, Python, sessions) | [`commands-reference.md`](references/commands-reference.md) |
| Cloud browser, agent tasks, sessions, tunnels, profile management | [`cloud-and-profiles.md`](references/cloud-and-profiles.md) |
| Authenticated browsing, dev server tunneling, subagents, troubleshooting | [`workflows.md`](references/workflows.md) |
