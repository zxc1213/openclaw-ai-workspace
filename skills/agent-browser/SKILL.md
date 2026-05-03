---
name: Agent Browser
description: "Fast headless browser automation for AI agents (Rust-based with Node.js fallback). Navigate, click, type, and snapshot pages via structured commands. Triggers on browser automation, headless browsing, page snapshot. NOT for: websites needing login/cookies (use bb-browser or browser profile), or simple URL content extraction (use web_fetch/firecrawl)."
read_when:
  - Automating web interactions
  - Extracting structured data from pages
  - Filling forms programmatically
  - Testing web UIs
metadata: {"clawdbot":{"emoji":"🌐","requires":{"bins":["node","npm"]}}}
allowed-tools: Bash(agent-browser:*)
---

# Browser Automation with agent-browser

Fast headless browser automation (Rust-based). Navigate, click, type, and snapshot pages.

## Quick Start

```bash
agent-browser open <url>        # Navigate to page
agent-browser snapshot -i       # Get interactive elements with refs
agent-browser click @e1         # Click element by ref
agent-browser fill @e2 "text"   # Fill input by ref
agent-browser close             # Close browser
```

## Core Workflow

1. **Navigate**: `agent-browser open <url>`
2. **Snapshot**: `agent-browser snapshot -i` (elements with refs like `@e1`, `@e2`)
3. **Interact** using refs from the snapshot
4. **Re-snapshot** after navigation or significant DOM changes

## Key Notes

- Refs (`@e1`, `@e2`) are stable per page load but change on navigation
- Always snapshot after navigation to get new refs
- Use `fill` instead of `type` for input fields (ensures text is cleared)
- On Linux ARM64, use the full path in the bin folder

## Route Table

| Topic | Reference |
|-------|-----------|
| Complete command reference (all commands, options, examples) | [`commands-reference.md`](references/commands-reference.md) |
