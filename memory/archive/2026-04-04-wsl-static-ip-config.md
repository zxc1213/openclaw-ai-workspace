# Session: 2026-04-04 15:05:41 UTC

- **Session Key**: agent:main:feishu:direct:ou_dfe4cec8ab70368885235d951a935ccd
- **Session ID**: d22b9e19-156b-468b-85d4-986e02e60424
- **Source**: webchat

## Conversation Summary

assistant: 当前网络情况：
- IP：`172.25.206.118/20`
- 网关：`172.25.192.1`
- 网段范围：`172.25.192.0 - 172.25.207.255`

你想把 WSL 固定到哪个 IP？几个建议：
- **`172.25.192.2`** — 好记，网段起始附近
- **`172.25.206.2`** — 接近当前 IP，变动最小
- 或者你自己指定一个范围内的 IP

选一个我帮你配？
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Sat 2026-04-04 22:28 GMT+8] 172.25.192.2
assistant: 好，开始配置。思路是：WSL 启动时自动设置静态 IP，同时在 Windows 端添加路由确保可达。
assistant: 需要密码。不过没关系，我们可以用另一种方式 — 通过 systemd service 来做，开机自动执行不需要交互密码。或者用 sudoers NOPASSWD。

你先帮我跑一下这个命令，确认当前用户可以 sudo：

```bash
sudo echo ok
```

然后我继续。或者你也可以直接告诉我你 WSL 的用户名，我写好所有配置，你一次性执行。
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Sat 2026-04-04 22:33 GMT+8] 可以了，wsl 用户名rays
assistant: 好，那我把脚本装到系统里，用 systemd service 自动执行。
assistant: 我这边 sudo 没有免密。你帮我执行以下几步就行，我帮你准备好所有命令：

### 第一步：安装脚本

```bash
sudo tee /usr/local/bin/wsl-static-ip.sh << 'EOF'
#!/bin/bash
FIXED_IP="172.25.192.2"
GATEWAY="172.25.192.1"
ip addr flush dev eth0 scope global 2>/dev/null
ip addr add ${FIXED_IP}/20 dev eth0
ip route replace default via ${GATEWAY} dev eth0 2>/dev/null
EOF
sudo chmod +x /usr/local/bin/wsl-static-ip.sh
```

### 第二步：创建 systemd service

```bash
sudo tee /etc/systemd/system/wsl-static-ip.service << 'EOF'
[Unit]
Description=Set WSL2 static IP
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/wsl-static-ip.sh
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl enable wsl-static-ip.service
```

### 第三步：立即执行 + 验证

```bash
sudo bash /usr/local/bin/wsl-static-ip.sh
ip addr show eth0 | grep inet
```

看到 `172.25.192.2/20` 就说明成功了。

### 第四步：Windows 端设置 hosts

以管理员身份打开 PowerShell：
```powershell
Add-Content -Path "C:\Windows\System32\drivers\etc\hosts" -Value "`n172.25.192.2    wsl.local"
```

这样 Windows 里可以直接用 `wsl.local` 访问 WSL 服务。

---

跑完告诉我结果，我帮你验证连通性。
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Sat 2026-04-04 22:42 GMT+8] 配置好了，你检查下
assistant: 一切正常 ✅

| 检查项 | 结果 |
|---|---|
| 静态 IP | `172.25.192.2/20` ✅ |
| 默认路由 | `172.25.192.1` ✅ |
| 网关连通 | 可达 ✅ |
| systemd service | 已启用（开机自动跑） ✅ |
| 外网 | 通 ✅ |

现在 Windows 端可以用 `172.25.192.2` 连 WSL 的所有服务了。hosts 文件如果也加好了，直接用 `wsl.local` 也行。

下次 WSL 重启 IP 也不会变了 🎉
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Sat 2026-04-04 22:43 GMT+8] wsl.local怎么用
assistant: 就是替代 IP 地址用的。比如你 Tauri 连 OpenClaw Gateway，原本要填：

```
http://172.25.192.2:3456
```

加了 hosts 之后可以直接写：

```
http://wsl.local:3456
```

DNS 会自动解析到 `172.25.192.2`，效果完全一样，但好记。

你 hosts 加了吗？没加的话 Windows 管理员 PowerShell 跑一下：

```powershell
Add-Content -Path "C:\Windows\System32\drivers\etc\hosts" -Value "`n172.25.192.2    wsl.local"
```
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Sat 2026-04-04 23:01 GMT+8] 现在访问不了windows的代理了好像
assistant: 可能是因为 `ip addr flush` 把路由清掉重建后，DNS 也受影响了。查一下：
assistant: 找到问题了：

- **通过 IP 访问代理**（`172.25.192.1:7890`）→ ✅ 正常
- **直连外网**（不走代理）→ ❌ 不通

这说明你的外网是靠代理走的，现在 WSL 内的代理配置可能是用的 `localhost`，但 flush 之后有些链路断了。

你 WSL 内代理是怎么配的？环境变量还是 `.bashrc` 里？我帮你看下：
assistant: WSL 内没配代理环境变量。那你是哪个服务连不上代理？是 Tauri（Windows 端）连不上，还是 WSL 内的程序连不上？

如果是 **Windows 端的 Tauri** 连不上代理，那跟 WSL 改 IP 无关，Tauri 跑在 Windows 上不受影响。

如果是 **WSL 内**的程序需要走代理，那确认下：用 `http://172.25.192.1:7890` 是通的，要不要我帮你配一下环境变量？
