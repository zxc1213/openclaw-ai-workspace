#!/usr/bin/env python3
"""
cdp-control.py — CDP (Chrome DevTools Protocol) 远程控制工具
用法:
  cdp-control.py screenshot [output.jpg]       截图
  cdp-control.py tabs                          列出标签页
  cdp-control.py navigate <url>                导航到 URL
  cdp-control.py eval <js>                     执行 JS
  cdp-control.py click <css_selector>          点击元素
  cdp-control.py type <css_selector> <text>    输入文字
  cdp-control.py keys <key> [<key>...]         按键 (Enter, Tab, Escape 等)
  cdp-control.py scroll [pixels]               滚动 (默认 800px)
  cdp-control.py html [css_selector]           获取页面/元素 HTML
  cdp-control.py text [css_selector]           获取页面/元素文本
  cdp-control.py wait <css_selector> [timeout] 等待元素出现
"""

import asyncio
import json
import sys
import base64
import urllib.request
import websockets

WIN_HOST = "192.168.1.100"
CDP_PORT = 9222

def get_page_url(target_id=None):
    """获取页面 WebSocket URL"""
    if target_id:
        tabs = json.loads(urllib.request.urlopen(f'http://{WIN_HOST}:{CDP_PORT}/json').read())
        for t in tabs:
            if t.get('id') == target_id:
                return t['webSocketDebuggerUrl']
        return None
    # 默认取第一个普通页面
    tabs = json.loads(urllib.request.urlopen(f'http://{WIN_HOST}:{CDP_PORT}/json').read())
    for t in tabs:
        if t.get('type') == 'page':
            return t['webSocketDebuggerUrl']
    return None

def get_browser_ws():
    version = json.loads(urllib.request.urlopen(f'http://{WIN_HOST}:{CDP_PORT}/json/version').read())
    return version['webSocketDebuggerUrl']

async def send_and_recv(ws, method, params=None, timeout=10):
    """发送 CDP 命令并等待响应"""
    if not hasattr(send_and_recv, '_id'):
        send_and_recv._id = 0
    send_and_recv._id += 1
    msg = {'id': send_and_recv._id, 'method': method}
    if params:
        msg['params'] = params
    await ws.send(json.dumps(msg))
    try:
        resp = json.loads(await asyncio.wait_for(ws.recv(), timeout=timeout))
        return resp
    except asyncio.TimeoutError:
        return {'error': 'timeout'}

async def cmd_screenshot(output='screenshot.jpg', target_id=None):
    url = get_page_url(target_id)
    if not url:
        print("No page found"); return
    async with websockets.connect(url, max_size=50*1024*1024) as ws:
        resp = await send_and_recv(ws, 'Page.captureScreenshot', {'format': 'jpeg', 'quality': 70})
        if 'result' in resp and 'data' in resp['result']:
            with open(output, 'wb') as f:
                f.write(base64.b64decode(resp['result']['data']))
            print(f"Screenshot saved: {output}")
        else:
            print(f"Error: {resp}")

async def cmd_tabs():
    tabs = json.loads(urllib.request.urlopen(f'http://{WIN_HOST}:{CDP_PORT}/json').read())
    for i, t in enumerate(tabs):
        if t.get('type') == 'page':
            title = t.get('title', '')
            url = t.get('url', '')
            print(f"  [{i}] {t['id'][:12]} | {title[:60]}")
            print(f"       {url[:80]}")
    print(f"Total: {len([t for t in tabs if t.get('type')=='page'])} pages")

async def cmd_navigate(url, target_id=None):
    page_url = get_page_url(target_id)
    if not page_url:
        print("No page found"); return
    async with websockets.connect(page_url, max_size=50*1024*1024) as ws:
        resp = await send_and_recv(ws, 'Page.navigate', {'url': url}, timeout=15)
        frame = resp.get('result', {}).get('frameId', '')
        if frame:
            print(f"Navigated to {url}")
            # 等待加载
            await asyncio.sleep(2)
        else:
            print(f"Navigate error: {resp}")

async def cmd_eval(js_code, target_id=None):
    page_url = get_page_url(target_id)
    if not page_url:
        print("No page found"); return
    async with websockets.connect(page_url, max_size=50*1024*1024) as ws:
        resp = await send_and_recv(ws, 'Runtime.evaluate', {'expression': js_code, 'returnByValue': True})
        result = resp.get('result', {}).get('result', {})
        val = result.get('value', '')
        if result.get('type') == 'undefined' or val is None:
            print("undefined")
        elif isinstance(val, str) and len(val) > 2000:
            print(val[:2000] + '...')
        else:
            print(val)

async def cmd_click(selector, target_id=None):
    page_url = get_page_url(target_id)
    if not page_url:
        print("No page found"); return
    async with websockets.connect(page_url, max_size=50*1024*1024) as ws:
        js = f"document.querySelector('{selector}')?.click()?.toString() || 'NOT_FOUND'"
        await cmd_eval_js(ws, js)

async def cmd_type(selector, text, target_id=None):
    page_url = get_page_url(target_id)
    if not page_url:
        print("No page found"); return
    async with websockets.connect(page_url, max_size=50*1024*1024) as ws:
        # 聚焦元素
        await send_and_recv(ws, 'Runtime.evaluate', {'expression': f"document.querySelector('{selector}')?.focus()"})
        await asyncio.sleep(0.1)
        # 逐字符输入
        for char in text:
            await send_and_recv(ws, 'Input.dispatchKeyEvent', {
                'type': 'keyDown', 'text': char, 'key': char,
                'code': 'KeyA', 'windowsVirtualKeyCode': ord(char)
            })
            await send_and_recv(ws, 'Input.dispatchKeyEvent', {
                'type': 'keyUp', 'key': char,
                'code': 'KeyA', 'windowsVirtualKeyCode': ord(char)
            })
            await asyncio.sleep(0.03)
        print(f"Typed '{text}' into {selector}")

async def cmd_keys(*keys, target_id=None):
    page_url = get_page_url(target_id)
    if not page_url:
        print("No page found"); return
    key_map = {'Enter': 13, 'Tab': 9, 'Escape': 27, 'Backspace': 8, 'ArrowDown': 40, 'ArrowUp': 38}
    async with websockets.connect(page_url, max_size=50*1024*1024) as ws:
        for key in keys:
            vk = key_map.get(key, ord(key[0]) if key else 0)
            await send_and_recv(ws, 'Input.dispatchKeyEvent', {
                'type': 'keyDown', 'key': key, 'code': key, 'windowsVirtualKeyCode': vk
            })
            await send_and_recv(ws, 'Input.dispatchKeyEvent', {
                'type': 'keyUp', 'key': key, 'code': key, 'windowsVirtualKeyCode': vk
            })
        print(f"Keys: {', '.join(keys)}")

async def cmd_scroll(pixels=800, target_id=None):
    page_url = get_page_url(target_id)
    if not page_url:
        print("No page found"); return
    async with websockets.connect(page_url, max_size=50*1024*1024) as ws:
        await send_and_recv(ws, 'Runtime.evaluate', {
            'expression': f'window.scrollBy(0, {pixels})'
        })
        print(f"Scrolled {pixels}px")

async def cmd_text(selector=None, target_id=None):
    page_url = get_page_url(target_id)
    if not page_url:
        print("No page found"); return
    async with websockets.connect(page_url, max_size=50*1024*1024) as ws:
        if selector:
            js = f"document.querySelector('{selector}')?.textContent?.trim() || ''"
        else:
            js = "document.body?.innerText?.substring(0, 5000) || ''"
        resp = await send_and_recv(ws, 'Runtime.evaluate', {'expression': js, 'returnByValue': True})
        val = resp.get('result', {}).get('result', {}).get('value', '')
        print(val)

async def cmd_wait(selector, timeout_sec=10, target_id=None):
    page_url = get_page_url(target_id)
    if not page_url:
        print("No page found"); return
    async with websockets.connect(page_url, max_size=50*1024*1024) as ws:
        for i in range(int(timeout_sec) * 2):
            js = f"!!document.querySelector('{selector}')"
            resp = await send_and_recv(ws, 'Runtime.evaluate', {'expression': js, 'returnByValue': True})
            val = resp.get('result', {}).get('result', {}).get('value', False)
            if val:
                print(f"Element '{selector}' found after {i*0.5}s")
                return
            await asyncio.sleep(0.5)
        print(f"Timeout: '{selector}' not found within {timeout_sec}s")

def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)
    
    cmd = args[0]
    try:
        if cmd == 'screenshot':
            asyncio.run(cmd_screenshot(args[1] if len(args) > 1 else 'screenshot.jpg'))
        elif cmd == 'tabs':
            asyncio.run(cmd_tabs())
        elif cmd == 'navigate':
            asyncio.run(cmd_navigate(args[1] if len(args) > 1 else ''))
        elif cmd == 'eval':
            asyncio.run(cmd_eval(' '.join(args[1:])))
        elif cmd == 'click':
            asyncio.run(cmd_click(args[1] if len(args) > 1 else ''))
        elif cmd == 'type':
            asyncio.run(cmd_type(args[1] if len(args) > 1 else '', ' '.join(args[2:])))
        elif cmd == 'keys':
            asyncio.run(cmd_keys(*args[1:]))
        elif cmd == 'scroll':
            asyncio.run(cmd_scroll(int(args[1]) if len(args) > 1 else 800))
        elif cmd == 'text':
            asyncio.run(cmd_text(args[1] if len(args) > 1 else None))
        elif cmd == 'wait':
            asyncio.run(cmd_wait(args[1] if len(args) > 1 else '', int(args[2]) if len(args) > 2 else 10))
        else:
            print(f"Unknown command: {cmd}")
            print(__doc__)
            sys.exit(1)
    except KeyboardInterrupt:
        print("\nInterrupted")

if __name__ == '__main__':
    main()
