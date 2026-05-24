---
name: lark-event
version: 1.0.0
description: "飞书事件订阅：WebSocket 长连接实时监听飞书事件（消息、通讯录变更、日历变更等），输出 NDJSON，支持正则路由和文件输出。触发：监听事件, event订阅, WebSocket, 事件驱动. 需要 lark-cli 认证。 不适用于：一次性 API 调用（用 lark-openapi-explorer）、读取历史事件。"
metadata:
  requires:
    bins: ["lark-cli"]
  cliHelp: "lark-cli event --help"
---

# event (v1)

> **前置条件：** 先阅读 [`../lark-shared/SKILL.md`](../lark-shared/SKILL.md) 了解认证、权限处理和安全规则。

## Shortcuts（推荐优先使用）

Shortcut 是对常用操作的高级封装（`lark-cli event +<verb> [flags]`）。有 Shortcut 的操作优先使用。

| Shortcut | 说明 |
|----------|------|
| [`+subscribe`](references/lark-event-subscribe.md) | Subscribe to Lark events via WebSocket long connection (read-only, NDJSON output); bot-only; supports compact agent-friendly format, regex routing, file output |
