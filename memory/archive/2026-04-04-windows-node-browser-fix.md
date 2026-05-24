# Session: 2026-04-04 00:21:09 UTC

- **Session Key**: agent:main:feishu:direct:ou_dfe4cec8ab70368885235d951a935ccd
- **Session ID**: e2613ace-2ef8-4be5-a538-1de5cf0cbf46
- **Source**: webchat

## Conversation Summary

user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Sat 2026-04-04 01:20 GMT+8] 你调用浏览器试试
assistant: Node 连接是通的，但它没注册 browser 命令。让我查一下它的详细信息：
assistant: 问题找到了：Node 声明了 `caps: ["browser", "system"]` 能力，但 `commands` 是空的 `[]`。说明 node 端虽然声称支持浏览器，但没有实际注册可执行的命令。

这可能是 `openclaw node run` 的版本问题，或者 Windows 侧需要额外的配置才能启用浏览器代理。

你可以看看 Windows 端 `openclaw node run` 的终端输出有没有报什么错误或警告？另外确认一下 Windows 侧的 OpenClaw 版本是 `2026.3.31` 吗？
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Sat 2026-04-04 01:21 GMT+8] PS C:\Users\19944> openclaw -v
OpenClaw 2026.3.31 (213a704)
PS C:\Users\19944> $env:OPENCLAW_GATEWAY_PASSWORD="zxc121314"
PS C:\Users\19944> $env:OPENCLAW_ALLOW_INSECURE_PRIVATE_WS="1"
PS C:\Users\19944> openclaw node run --host localhost --port 18789 --display-name "Windows-Rays"

🦞 OpenClaw 2026.3.31 (213a704) — I'll butter your workflow like a lobster roll: messy, delicious, effective.

PS C:\Users\19944> Remove-Item "$env:USERPROFILE\.openclaw\node.json" -ErrorAction SilentlyContinue
PS C:\Users\19944> $env:OPENCLAW_GATEWAY_PASSWORD="zxc121314"
PS C:\Users\19944> $env:OPENCLAW_ALLOW_INSECURE_PRIVATE_WS="1"
PS C:\Users\19944> openclaw node run --host localhost --port 18789 --display-name "Windows-Rays"

🦞 OpenClaw 2026.3.31 (213a704) — If it works, it's automation; if it breaks, it's a "learning opportunity."
assistant: 看起来 node 启动后很快就退出了（输出了两次启动信息，说明第一次闪退了）。而且它只打印了 banner 就没后续了——没有显示连接 Gateway 成功的信息，也没有注册 browser 命令。

问题可能是 `--host localhost` 导致 node 连不上 Gateway。Windows 侧的 `localhost` 是 Windows 自己，不是 WSL2。需要改成 WSL2 的 IP 或者用 `--host` 指向 Gateway 所在地址。

试一下：

```powershell
$env:OPENCLAW_GATEWAY_PASSWORD="zxc121314"
$env:OPENCLAW_ALLOW_INSECURE_PRIVATE_WS="1"
openclaw node run --host 172.25.192.1 --port 18788 --display-name "Windows-Rays"
```

Gateway 监听在 18788（你的 webchat 连的就是这个端口），所以 `--port` 应该是 18788。`--host` 改成 WSL2 的 IP 172.25.192.1。
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Sat 2026-04-04 01:21 GMT+8] PS C:\Users\19944> Remove-Item "$env:USERPROFILE\.openclaw\node.json" -ErrorAction SilentlyContinue
PS C:\Users\19944> $env:OPENCLAW_GATEWAY_PASSWORD="zxc121314"
PS C:\Users\19944> $env:OPENCLAW_ALLOW_INSECURE_PRIVATE_WS="1"
PS C:\Users\19944> openclaw node run --host localhost --port 18789 --display-name "Windows-Rays"

🦞 OpenClaw 2026.3.31 (213a704) — If it works, it's automation; if it breaks, it's a "learning opportunity."

PS C:\Users\19944> openclaw node run --host localhost --port 18788 --display-name "Windows-Rays"

🦞 OpenClaw 2026.3.31 (213a704) — We ship features faster than Apple ships calculator updates.

node host gateway connect failed:
node host gateway closed (1006):
PS C:\Users\19944>
assistant: `localhost` 确实不行，因为 Gateway 跑在 WSL2 里。用 WSL2 的 IP：

```powershell
$env:OPENCLAW_GATEWAY_PASSWORD="zxc121314"
$env:OPENCLAW_ALLOW_INSECURE_PRIVATE_WS="1"
openclaw node run --host 172.25.192.1 --port 18788 --display-name "Windows-Rays"
```
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Sat 2026-04-04 01:22 GMT+8] PS C:\Users\19944> $env:OPENCLAW_GATEWAY_PASSWORD="zxc121314"
PS C:\Users\19944> $env:OPENCLAW_ALLOW_INSECURE_PRIVATE_WS="1"
PS C:\Users\19944> openclaw node run --host 172.25.192.1 --port 18788 --display-name "Windows-Rays"

🦞 OpenClaw 2026.3.31 (213a704) — I can grep it, git blame it, and gently roast it—pick your coping mechanism.

node host gateway connect failed: connect ECONNREFUSED 172.25.192.1:18788
node host gateway closed (1006):
PS C:\Users\19944>
assistant: Gateway 可能没监听在 172.25.192.1 上。让我查一下：
assistant: Gateway 监听在 `0.0.0.0:18788`，理论上应该可以从 Windows 访问。让我从 Windows 的角度测试一下连通性：

你在 Windows PowerShell 里试一下：

```powershell
Test-NetConnection 172.25.192.1 -Port 18788
```

这能确认是不是 WSL2 防火墙或网络的问题。
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Sat 2026-04-04 01:22 GMT+8] PS C:\Users\19944> Test-NetConnection 172.25.192.1 -Port 18788
警告: TCP connect to (172.25.192.1 : 18788) failed
assistant: WSL2 的 IP 可能变了。从 WSL 内确认一下当前 IP：
assistant: IP 变了！之前是 `172.25.192.1`，现在是 `172.25.206.118`。WSL2 重启后 IP 会变。

试一下：

```powershell
Test-NetConnection 172.25.206.118 -Port 18788
```

如果通了，再启动 node：

```powershell
$env:OPENCLAW_GATEWAY_PASSWORD="zxc121314"
$env:OPENCLAW_ALLOW_INSECURE_PRIVATE_WS="1"
openclaw node run --host 172.25.206.118 --port 18788 --display-name "Windows-Rays"
```

另外建议把 WSL2 固定 IP，这样就不会每次变了。要我帮你配置吗？
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Sat 2026-04-04 01:23 GMT+8] 怎么固定
assistant: WSL2 固定 IP 有几种方案，最简单实用的是在 Windows 侧设端口转发 + WSL 内固定 IP。我推荐两个方案：

## 方案一：Windows 端口转发（推荐，最简单）

每次 WSL2 IP 变了，Windows 侧的转发目标也要跟着变。但可以用一个脚本自动做。

在 Windows 侧以**管理员 PowerShell** 运行：

```powershell
# 先获取 WSL 当前 IP
$wslIp = (wsl hostname -I).Trim()

# 设置端口转发（WSL IP 作为目标）
netsh interface portproxy add v4tov4 listenport=18788 listenaddress=127.0.0.1 connectport=18788 connectaddress=$wslIp
```

然后 node 用 `localhost:18788` 连接就行。但 IP 变了要重新设置。

## 方案二：WSL 内固定 IP + 自动设置（更稳）

在 WSL 内写一个脚本，结合 `.wslconfig` 配置。

你想用哪种？还是说你更偏向于每次手动改 IP 也能接受？我可以帮你把方案二做成开机自动执行。
