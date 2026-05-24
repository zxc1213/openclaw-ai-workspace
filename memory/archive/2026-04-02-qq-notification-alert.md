# Session: 2026-04-02 06:47:12 UTC

- **Session Key**: agent:main:main
- **Session ID**: 7d3e1cbd-1c97-43c9-86c7-50a51c22ad54
- **Source**: webchat

## Conversation Summary

assistant: 现在在 `addAlert` 函数里加上 QQ 通知：
assistant: 现在需要设置环境变量。找到 dashboard 的 systemd service 配置：
assistant: 把 QQ 配置加上：
assistant: 重启 dashboard：
assistant: 没看到 `[QQ Notify]` 的启动日志，让我检查下：
assistant: QQ 通知已启用。现在发个测试通知验证一下：
assistant: 日志里没看到 QQ 发送结果，可能测试通知走的是不同路径。让我直接看测试通知代码：
assistant: 测试通知没加 QQ。补上：
assistant: 没日志。可能是 access token 获取失败（网络问题）。让我查下详细日志：
assistant: QQ API 返回 40011000 — 请求体格式不对。让我看看 QQ bot 主动消息的正确格式：
assistant: 明白了！正确格式是 `{ content, msg_type: 0 }` 或者 markdown 格式 `{ markdown: { content }, msg_type: 2 }`。我写的 `msg_type: 'text'` 是错的。修正：
assistant: QQ 通知发送成功！你 QQ 上应该收到测试消息了。

现在把改动记到今天的 daily notes：
assistant: 搞定。现在告警覆盖了所有渠道：

| 渠道 | 状态 |
|------|------|
| Dashboard toast | ✅ 实时弹出 |
| 告警面板 | ✅ 自动刷新 |
| Server酱 | ✅ |
| Telegram | ✅ |
| **QQ Bot C2C** | ✅ **新增** |
| Gateway Webhook | ✅ |

下次再模型全挂，QQ 上会直接收到告警消息。你看看 QQ 上有没有收到刚才的测试通知？
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Thu 2026-04-02 14:45 GMT+8] 收到通知了
assistant: 👍 以后模型超时、Gateway 挂掉这些事，Dashboard、QQ、Telegram、Server酱都会第一时间告诉你，不用自己盯着了。
