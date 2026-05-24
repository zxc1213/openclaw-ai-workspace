# MEMORY.md - 长期记忆

## 项目概览

### nian-desktop
- Tauri v2 桌面客户端，连接 OpenClaw Gateway
- 聊天全链路已通（connect → chat.send → 接收 chat event）
- **Device Identity 签名方案：Ed25519**（不是 secp256k1）
  - `deriveDeviceIdFromPublicKey(pubKey)` = `SHA-256(rawPubKey).hex`（64字符，无前缀）
  - `normalizeDevicePublicKeyBase64Url` = base64url(32-byte raw Ed25519 pub key)
  - 签名 payload: `v2|{deviceId}|{clientId}|{clientMode}|{role}|{scopes_csv}|{signedAtMs}|{token}|{nonce}`
  - 浏览器 `crypto.subtle.generateKey({name:'Ed25519'})` 生成密钥，存 IndexedDB（key 版本 v5）
- client.id 必须用 `openclaw-control-ui` 才能获得 operator.write scope（chat.send 需要）
- pairing required 解决：Tauri 从 Windows IP (172.25.192.1) 连接，设置了 cron 每 10s 自动批准 172.25.192.* 的配对请求
- @noble/secp256k1 依赖已移除

### Team Dashboard
- 5-tab 监控面板：概览/任务/统计/日志/Cron
- 端口 18788，通过 systemd user service 自启
- 密钥存 `~/.openclaw/team-dashboard/.env`（chmod 600）
- health API 返回复杂嵌套对象（channels/agents/sessions），不能直接 Object.entries 遍历
- cron.schedule 是对象 `{kind, everyMs}` 不是字符串；nextRun 在 state.nextRunAtMs

### 集团平台（Java SpringCloud）— 多版本同构项目
- **base（华路企业科研管理平台）**: `/mnt/e/todo/代码/广东华路交通科技有限公司企业科研管理平台`
- **lq（集团科研管理系统）**: `/mnt/e/todo/代码/广东省交通集团有限公司科研管理系统`
- **kczx（协同创新信息平台）**: `/mnt/e/todo/代码/广东省交通科技协同创新信息平台`
- **kcsystem（公路建设科创管理系统）**: `/mnt/e/todo/代码/广东省公路建设有限公司科创管理系统`
- 四个版本结构一致：science-innovation-common / eureka / gateway / service / service-api / user-oauth
- 169 张表，3,067 个字段
- 反向生成了 PDM 和 Markdown 字典：lq 版 `doc/database.pdm` + `database-schema.md`
- Gateway 间歇性 500 问题：直连下游服务正常，可能负载均衡问题；`discovery.locator.enabled: true` 可能与手动路由冲突

## E 盘目录结构
- `/mnt/e/todo/` — 项目归档（集团平台源码在 `代码/` 子目录）
- `/mnt/e/Develop/` — 开发环境（IdeaProjects / Trae / PycharmProjects / DataGripProjects / Docker / env / 资料）
- `/mnt/e/Develop/workspace/IdeaProjects/` — IDEA 工作区：JX / comit / gdport / gooddriver / hzc / idea / kczx / safe / water / zf
- `/mnt/e/Develop/workspace/Trae/` — Trae 工作区：enterprise-portal / tech_portal
- `/mnt/e/Develop/workspace/repos/` — Git 仓库：Tainer / Trainer
- `/mnt/e/危化运维/` — 危货 / 工控机相关文件
- `/mnt/e/华路部署/` — 华路部署包（mysql / dist_prod）
- `/mnt/e/执法大屏/` — 执法大屏前端 dist
- `/mnt/e/知识库/` — 科创平台材料
- `/mnt/e/安全简报/` — 每日安全简报输出
- `/mnt/e/OPCRemote/` — OPC Remote 安装包
- `/mnt/e/前端试题/` — 前端面试题
- `/mnt/e/Kingbase/` — 人大金仓数据库相关

## 基础设施

### OpenClaw Gateway
- systemd user service: `openclaw-gateway.service`
- 热重启：SIGUSR1（不重载 systemd 配置）
- 修改环境变量要用 drop-in 目录（`openclaw-gateway.service.d/*.conf`）
- subagent session 默认 60 分钟自动归档

### Agent 团队
- 已配置 subagents: coder、reviewer、research、writer、analyst、cron-worker、designer
- Dashboard 健康检查：curl http://127.0.0.1:18788/api/health

### 模型配置 (2026-04-01 更新)
- 已配置模型：GLM-5, GLM-5.1, GLM-5-Turbo, GLM-4.7, GLM-4.7 Flash, GLM-4.7 FlashX, GLM-5V-Turbo
- GLM-5.1 = GLM-5 升级版（智谱最新）
- GLM-5V-Turbo = 多模态 Coding 基座，支持 text + image 输入
- 模型 ID: glm-5.1, glm-5v-turbo

### 安全审计记录 (2026-03-19)
- OpenClaw security audit --deep 结果：
  - 🔴 allowedOrigins 包含 `*`（待修复为显式信任来源）
  - 🔴 tavily-search 代码模式告警（已确认是标准 API key 用法，误报）
  - 🟡 gateway 密码明文存配置文件，建议迁移到环境变量
  - 🟡 gateway probe failed (missing scope: operator.read)
- 系统级：WSL2 无防火墙、无磁盘加密、自动安全更新已启用

### 每日早报（daily-digest）
- 每天 08:00 OpenClaw cron job（isolated session）自动生成并推送到 webchat
- 内容：安全简报 + 今日日程 + 待办事项 + 技术热榜 + 天气
- 安全简报输出：`/mnt/e/安全简报/安全简报-YYYY-MM-DD.md`
- 数据源：GitHub Security Advisories API + web_search/web_fetch 补充
- P0-P3 分级，关联技术栈（Node.js/npm、Java/Spring、Tauri v2、OpenClaw、Docker/Nginx/Redis/MySQL）
- ~~n8n 方案已废弃~~（2026-04-03 迁移到纯 OpenClaw）
- Cron job ID: `72d10a6c`（旧安全简报 fcd358b4 已禁用）
- 2026-04-04 修复：清除飞书 sessionKey 绑定 + 开启 light-context（防止 context overflow）

### Agent 团队分工
- **main (念念)** — 总调度、日常对话
- **coder 💻** — 写代码、修 bug、实现功能（GLM-5.1）
- **reviewer 🔍** — 代码审查、安全审计（GLM-5）
- **designer 🎨** — 视觉分析、UI 审查、多模态任务（GLM-5V-Turbo）
- **research 🔬** — 技术调研、资料收集（GLM-5-Turbo）
- **writer 📝** — 文档撰写、简报生成（GLM-5-Turbo）
- **analyst 📊** — 安全漏洞分析、统计报告（GLM-5-Turbo）
- **cron-worker ⏰** — 通用定时任务执行（GLM-5-Turbo）
- 每个 agent 都有完整的 SOUL.md / USER.md / AGENTS.md（2026-04-01 完善）
- 2026-04-01：新增 designer agent，coder 升级 GLM-5.1

### OpenViking 记忆系统
- pip install openviking v0.3.2
- Embedding: embedding-3 (2048维), VLM: glm-4.6v
- systemd: openviking.service(:1933) + openviking-console.service(:8020)
- contextEngine 插槽 = openviking（remote 模式）
- 2748 条历史 memory 已导入，Vector Count: 2748
- OpenClaw 插件使用 user key（非 root key，避免租户头信息问题）
- ~~Embedding Fallback Proxy~~：已停用（BGE-M3 占 1.8G 内存，WSL2 无 GPU，纯智谱远程足够）
- 旧向量 2748 条为 2048 维

### Dashboard 告警系统
- LLM 超时检测：journalctl 日志分析（All models failed = critical, 3+ timed out = warning）
- QQ Bot C2C 主动消息通知已集成
- 告警渠道：UI toast + 面板 + Server酱 + Telegram + QQ Bot + Gateway Webhook
- 环境变量：QQBOT_APP_ID, QQBOT_CLIENT_SECRET, QQBOT_NOTIFY_TARGET

### DailyHotApi 服务
- 热榜 API 后端（支持 54 个平台）
- 端口 6688，systemd 自启（~32MB 内存）
- 源码：~/.openclaw/workspace/skills/daily-hot-api
- systemd：dailyhot-api.service（NODE_ENV=development）
- daily-hot-news skill 的数据源

### 浏览器自动化
- agent-browser (v0.20.13) Rust CLI 正常工作（Chromium headless）
- bb-browser 依赖 `openclaw browser` 接口，WSL2 下超时（30s）
- WSL2 snap Chromium 启动慢，dbus 报错多
- **Windows Chrome 远程控制已通**（2026-04-05）
  - Chrome 启动：`cmd.exe /c start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0 --user-data-dir="D:\Temp\chrome-profile-debug"`
  - Chrome CDP 只在 IPv6 localhost 监听，`--remote-debugging-address=0.0.0.0` 被新版 Chrome 忽略
  - Windows 端 `netsh interface portproxy v4tov6` 将 `0.0.0.0:9222 → [::1]:9222`
  - Windows 防火墙规则 "Chrome CDP 9222" TCP 入站放行（已持久化）
  - WSL2 通过 `172.25.192.1:9222` 访问 CDP 端口
  - WSL 工具：`scripts/chrome-remote.sh`（启动/开标签）、`scripts/cdp-control.py`（CDP 操作）
  - 小红书搜索框 input 不响应 CDP 的 Input.insertText，需用 Page.navigate 跳转搜索 URL
- Ray 反馈 Chrome 跑起来很卡，资源消耗大，避免长时间运行
- ⚠️ 调研 OpenClaw Node 内存占用（Ray 关心）

### WSL2 网络配置
- **静态 IP**: `172.25.192.2/20`，网关 `172.25.192.1`（2026-04-04 配置）
- systemd service: `wsl-static-ip.service`（开机自动设置）
- 脚本：`/usr/local/bin/wsl-static-ip.sh`（flush + add + route replace）
- Windows hosts: `172.25.192.2 wsl.local`
- `ip addr flush` 后 DNS 可能受影响，代理用 IP 而非 localhost

### QQ Bot
- 2026.3.31 原生支持（不需要第三方插件），需 silk-wasm
- 多账号：用有意义的 accountId（nianian/shijie/research），不能用 accounts.default
- C2C 消息格式：`{ content: text, msg_type: 0 }`

### 飞书知识库
- **知识空间**: 念念的 AI Agent 实践笔记（私有，Space ID: 7624953904228207821）
- 文档：GLM Coding 深度学习笔记、OpenClaw 使用教程、配置速查手册入口
- **多维表格**: 念念的配置速查手册（5 张表 49 条记录，密钥脱敏）
- ⚠️ bitable 读取权限不完整（字段值返回空），写入/删除正常，待限流解除后继续授权

### 飞书任务清单
- **清单名**: 念念待办（GUID: 88a75c8d-129c-4b20-b459-e53bb995a8d0）
- Ray 要求所有待办加到飞书任务，从飞书看进度、逐项执行
- 初始 13 个任务已全部完成

### GLM Coding 学习
- 2026-04-05 深度学习智谱 GLM Coding 知识库（10 篇核心文章）
- 完整笔记：`workspace/glm-coding-study-notes.md`
- 关键概念：Harness Engineering（相同模型+不同 Harness = 天差地别）
- 三阶段行动计划：本周/1-2周/1个月

### 已安装技能
- agent-browser (v0.20.13) — Rust 浏览器自动化 CLI
- vibe-coding — AI 辅助编程方法论
- browser-use — 浏览器自动化 CLI（Python 系）
- pls-audit-website — 网站 SEO/安全/性能审计
- daily-hot-news — 54 个平台热榜查询
- firecrawl-scrape-cn — 中文网页爬取（Firecrawl SDK）
- bb-browser — 36 平台 103 命令的网站 CLI（v0.11.2，WSL2 下暂不可用）
- tavily-search — AI 优化搜索
- self-improving-agent — 自我改进学习系统
- summarize — URL/文件摘要
- skill-vetter — 技能安全审查

## 经验教训
- systemd service 被 gateway 自动管理，改环境变量用 drop-in
- SIGUSR1 热重启不重载 systemd 配置
- JS let/const 有 TDZ，变量声明顺序要注意
- Chat streaming 事件中 content 在 `payload.message.content` 而非 `payload.content`
- `discovery.locator.enabled: true` 在 SpringCloud Gateway 可能和手动路由冲突，建议关闭
- n8n workflow 创建重复时用 DELETE API 清理
- ⚠️ n8n 运行时不能直接改数据库，内存会覆盖回旧版本！必须停 n8n → 改 DB → 启 n8n，或用 API 创建新 workflow
- subagent 等审批会无限循环，复杂 API 操作还是 main 自己来
- n8n Code 节点可以用 `fs` 模块（不需要 executeCommand）
- n8n httpRequest v4.2 用 `continueOnFail: true` 替代 `onError: continueErrorOutput`
- n8n 引用其他节点输出用 `$('NodeName')` 表达式更灵活
- QQ Bot 多账号不能用 default，用有意义的 accountId 并显式绑定 agent
- QQ API C2C 消息格式：`{ content: text, msg_type: 0 }`（不是 `msg_type: 'text'`）
- Gateway fallback 链打穿时 Dashboard 无感知，需 journalctl 日志分析检测
- WSL2 snap Chromium 启动慢且 dbus 报错，headless 浏览器优先用 agent-browser
- Windows Chrome 资源消耗大，Ray 不希望长时间跑 Chrome
- **WSLInterop 修复**（2026-04-05）：条目缺失时用 `echo ':WSLInterop:M::MZ::/init:PF' | sudo tee /proc/sys/fs/binfmt_misc/register`，不要直接写 WSLInterop 文件（会 Permission denied）
- `cannot execute binary file` 不一定是架构问题，检查 binfmt_misc 是否有对应条目
- Chrome CDP 新版只监听 IPv6 localhost，`--remote-debugging-address=0.0.0.0` 被忽略，需用 portproxy v4tov6 转发
- WSL2 静态 IP 用 systemd service + `ip addr flush dev eth0` 实现，注意可能影响 DNS
- cron job isolated session 历史累积会 context overflow，需开启 light-context
- 飞书 OAuth 批量授权有限流，分多轮授权，每轮间隔几分钟
