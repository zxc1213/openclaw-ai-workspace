# Session: 2026-04-03 16:20:14 UTC

- **Session Key**: agent:main:feishu:direct:ou_dfe4cec8ab70368885235d951a935ccd
- **Session ID**: b62a02c3-5d21-410a-a3ad-d00a21619a91
- **Source**: webchat

## Conversation Summary

user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Fri 2026-04-03 22:52 GMT+8] OpenViking 是不是挂了，没有随wsl启动？我看好像没有新的记忆
assistant: openviking.service 刚启动了（22:52:18），说明之前确实挂了。看看能不能连上：
assistant: PID 349 占着数据目录。看看是什么进程：
assistant: PID 349 是个 `http-server.mjs`（OpenViking console 启动的），它锁住了数据目录。实际上是 openviking-server 一直启动失败，console 倒在运行。
assistant: OpenViking 服务已恢复，而且 API 能连上。root key 用来管理，用户 key 用来搜索——插件配置的 apiKey 就是 root key，它会自动处理租户路由。

问题是 PID 349（openviking console 的 http-server）之前锁住了数据目录，导致 openviking-server 一直重启失败（restart counter 到了 1807 次！）。已经杀掉并恢复了。
assistant: OpenViking 已恢复。

**问题原因**：PID 349（openviking-console 启动的 http-server）一直占着数据目录锁，导致 openviking-server 反复重启失败（重启了 1807 次！）。WSL 重启后进程残留了。

**已修复**：杀掉了残留进程，openviking-server 重新启动成功，health check 返回 `healthy: true`。Gateway 插件之前的连接失败是因为服务没起来，下次对话触发时会自动恢复。

这个问题可能会复现——WSL 意外关机后进程残留。要不要我加一个心跳检查项，发现 OpenViking 挂了自动清理残留进程并重启？
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Fri 2026-04-03 22:58 GMT+8] 要，我觉得你得加个机制，每次重启gateway都检查一遍这些外部依赖正不正常，不正常要恢复正常才行。
assistant: 好思路。我来写一个健康检查脚本，加到 Gateway 启动流程里。
assistant: 好思路。我来写一个健康检查脚本，加到 Gateway 启动流程里。
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Fri 2026-04-03 22:59 GMT+8] 记得你加到启动流程不要把自己卡死，优先保障gateway可用。
assistant: 对，刚才看到 401 了——health 端点需要 auth。修一下脚本，同时加到 systemd ExecStartPre（异步不阻塞 Gateway 启动）。
assistant: 现在把它加到 systemd，用 `ExecStartPre` 不阻塞（加 `-` 前缀表示失败不阻止启动）：
assistant: 好，`ignore_errors=yes` 确认了不会阻塞 Gateway。但有个问题——ExecStartPre 会等脚本执行完才启动 Gateway，如果 OpenViking 重启慢会拖延。改成后台执行：
assistant: 现在更新 HEARTBEAT.md，让心跳也定期跑这个检查：
assistant: 搞定。机制设计：

1. **Gateway 启动时** — systemd `ExecStartPre` 后台运行健康检查脚本，**不阻塞** Gateway 启动（`-` 前缀 + `&` 后台）
2. **每次心跳** — 心跳也会跑同一个脚本，定期巡检
3. **自动恢复** — 脚本会清理 OpenViking 残留锁文件/进程，自动重启挂掉的服务
4. **不卡死** — 脚本内部有超时（curl `--max-time`），即使卡住也不影响 Gateway

已验证：OpenViking ✅、Dashboard ✅ 都正常。
