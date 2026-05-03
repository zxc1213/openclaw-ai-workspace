#!/bin/bash
# chrome-remote.sh — 从 WSL 启动 Windows Chrome 并开启远程调试端口
# 用法: chrome-remote.sh [URL]
# 默认 URL: about:blank

set -euo pipefail

CHROME_EXE='C:\Program Files\Google\Chrome\Application\chrome.exe'
PROFILE_DIR='D:\Temp\chrome-profile-debug'
CDP_PORT=9222
WIN_HOST="192.168.1.100"
URL="${1:-about:blank}"

check_cdp() {
    curl -s --connect-timeout 2 "http://${WIN_HOST}:${CDP_PORT}/json/version" > /dev/null 2>&1
}

# 如果已经在运行，直接导航
if check_cdp; then
    echo "Chrome CDP already running on port ${CDP_PORT}"
    if [ "$URL" != "about:blank" ]; then
        python3 - "$WIN_HOST" "$CDP_PORT" "$URL" << 'PYEOF'
import asyncio, json, websockets, urllib.request, sys
async def nav(host, port, url):
    version = json.loads(urllib.request.urlopen(f'http://{host}:{port}/json/version').read())
    ws_url = version['webSocketDebuggerUrl']
    async with websockets.connect(ws_url, max_size=50*1024*1024) as ws:
        await ws.send(json.dumps({'id':1,'method':'Target.createTarget','params':{'url':url}}))
        resp = json.loads(await ws.recv())
        tid = resp.get('result',{}).get('targetId','')
        if tid:
            print(f'Opened in new tab: {tid}')
        else:
            print('Failed to open tab')
asyncio.run(nav(sys.argv[1], sys.argv[2], sys.argv[3]))
PYEOF
    fi
    exit 0
fi

# 启动 Chrome
echo "Starting Chrome with CDP on port ${CDP_PORT}..."
/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe -Command \
    "Start-Process '${CHROME_EXE}' -ArgumentList '--remote-debugging-port=${CDP_PORT}','--remote-allow-origins=*','--user-data-dir=${PROFILE_DIR}','${URL}'" \
    > /dev/null 2>&1

# 等待 CDP 就绪
echo -n "Waiting for Chrome CDP"
for i in $(seq 1 20); do
    if check_cdp; then
        echo ""
        echo "✅ Chrome CDP ready at http://${WIN_HOST}:${CDP_PORT}"
        exit 0
    fi
    echo -n "."
    sleep 1
done
echo ""
echo "❌ Chrome CDP failed to start within 20s"
exit 1
