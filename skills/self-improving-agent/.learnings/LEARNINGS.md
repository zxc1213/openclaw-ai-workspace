# Learnings Log

Captured learnings, corrections, and discoveries. Review before major tasks.

---

## systemd Environment for OpenClaw services

**Pattern-Key:** openclaw-service-env-dropin  
**Category:** best_practice

OpenClaw gateway 的 systemd service 文件是自动生成的，直接编辑 `Environment=` 会被覆盖。用 drop-in 目录：
```bash
mkdir -p ~/.config/systemd/user/<service>.service.d
cat > ~/.config/systemd/user/<service>.service.d/custom.conf << 'EOF'
[Service]
Environment=KEY=value
EOF
systemctl --user daemon-reload && systemctl --user restart <service>
```
注意：`gateway restart`（SIGUSR1）不会重载 systemd Environment，需要 `systemctl --user restart`。

---

## Dashboard 空数据 — 启动顺序问题

**Pattern-Key:** dashboard-empty-after-wsl-reboot  
**Category:** best_practice

WSL 重启后，依赖 gateway CLI 的服务需配置 `After=openclaw-gateway.service` 和 `Wants=openclaw-gateway.service`。密钥等敏感信息用 `EnvironmentFile`（chmod 600）替代明文 `Environment=`。

---

## 多 Agent 协作 — allowAgents 配置

**Pattern-Key:** openclaw-subagent-allowAgents  
**Category:** knowledge_gap

main agent 默认只能 spawn 自身，需显式配置 `subagents.allowAgents` 才能派发给其他 agent。这是安全默认行为：
```json
{ "agents": { "list": [{ "id": "main", "subagents": { "allowAgents": ["coder", "reviewer", ...] } }] } }
```

---

## Dashboard 常见坑（2026-03-17）

**Pattern-Key:** dashboard-common-pitfalls  
**Category:** best_practice

- SSE/EventSource 相关变量必须在 IIFE 调用前声明（JS TDZ）
- SSE heartbeat catch 中必须清理 `sseClients`，否则内存泄漏
- `fs.watch` 不处理 `rename` 事件，日志轮转后需重置 offset
- `Number()` 转换 base36 字符串 id 会返回 NaN，用 `String()` 比较
- `openclaw sessions --all-agents` 只返回活跃 session，归档的 `.deleted.*` 需单独扫描
- systemd user service 优于 system service（不需要 sudo，且 gateway 自动管理 system 级文件）

---
