---
name: browserwing
homepage: https://github.com/browserwing/browserwing
description: "通过 HTTP API 控制浏览器自动化：页面导航、元素交互（点击/输入/选择）、数据提取、无障碍快照、截图、JS 执行、批量操作。触发：需要通过 API 程序化控制浏览器。不适用于：一次性简单浏览器任务（用 agent-browser）、平台特定交互（用 bb-browser）。"
metadata: {"moltbot":{"emoji":"🌐","requires":{"bins":"env":["BROWSERWING_EXECUTOR_URL"]},"primaryEnv":"BROWSERWING_EXECUTOR_URL"}}
---

# BrowserWing Executor API

Browser automation through HTTP APIs — navigate, interact, extract, and analyze pages.

## Configuration

- **Environment Variable:** `BROWSERWING_EXECUTOR_URL`
- **Default:** `http://127.0.0.1:8080`
- **Auth:** `X-BrowserWing-Key: <api-key>` header or `Authorization: Bearer <token>` if required
- **Base URL:** `${BROWSERWING_EXECUTOR_URL}/api/v1/executor`

**In shell:** `EXECUTOR_URL="${BROWSERWING_EXECUTOR_URL:-http://127.0.0.1:8080}"`

## Step-by-Step Workflow

0. **Get API URL:** Read `$BROWSERWING_EXECUTOR_URL` (fallback: `http://127.0.0.1:8080`)
1. **Discover commands:** `GET /help` (do this first if unsure)
2. **Navigate:** `POST /navigate` to open target page
3. **Analyze page:** `GET /snapshot` to understand structure and get RefIDs
4. **Interact:** Use RefIDs (`@e1`, `@e2`) or CSS selectors for click/type/select/wait
5. **Extract data:** `POST /extract` for information
6. **Present results:** Format and show to user

## Element Identification

1. **RefID** (Recommended): `@e1`, `@e2` — stable across page changes, from `/snapshot`
2. **CSS Selector:** `#id`, `.class`, `button[type="submit"]`
3. **XPath:** `//button[@id='login']`
4. **Text Content:** `Login`, `Sign Up`
5. **ARIA Label:** Automatically searched

## Guidelines

- **Always call `/snapshot` after navigation** — get page structure and RefIDs
- **Prefer RefIDs** over CSS selectors for reliability
- **Re-snapshot after page changes** to refresh RefIDs
- **Use `/wait`** for dynamic/async content
- **Use `/batch`** for multiple sequential operations
- If operation fails, check identifier and try different format

## Route Table

| Topic | Reference |
|-------|-----------|
| All commands, curl examples, common scenarios, response format | [`commands-and-examples.md`](references/commands-and-examples.md) |
