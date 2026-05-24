# OpenClaw FAQ 参考速查 (79 个常见问题)

> 来源：[OC-11 常见问题 FAQ](https://github.com/KimYx0207/Claude-Code-x-OpenClaw-Guide-Zh/blob/main/docs/openclaw/11-%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98FAQ.md)
> 版本基线：v2026.3.28 | Node.js 24.x 推荐
> 相关度标记：🔴=已遇到/高频关注 🟡=可能遇到 🟢=通用参考

---

## 一、安装和配置 (Q1–Q15)

### Q1: `openclaw` 命令找不到 🟡
**→** npm 全局 bin 目录未加入 PATH。用 `npm config get prefix` 找到路径后加入 PATH，或用 `npx openclaw` 临时替代。

### Q2: Node.js 版本不兼容 🔴
**→** OpenClaw 需要 Node.js 24.x（22.14+ 兼容）。用 nvm 升级：`nvm install 24 && nvm alias default 24`。

### Q3: npm install 报权限错误 EACCES 🟡
**→** 修改 npm 全局目录 `npm config set prefix '~/.npm-global'`，或用 nvm 管理 Node（推荐）。

### Q4: 中国网络安装慢或失败 🔴
**→** 切换 npm 镜像：`npm config set registry https://registry.npmmirror.com`。或用 Docker 安装。

### Q5: node-gyp 编译错误 🟢
**→** Linux 装 `build-essential python3`，macOS 装 Xcode command line tools (`xcode-select --install`)。

### Q6: `openclaw onboard` 引导向导报错 🟡
**→** 确保用交互式终端；或跳过引导手动设环境变量 + `openclaw config set`。

### Q7: 配置文件在哪里？ 🟡
**→** `~/.openclaw/openclaw.json`（主配置，JSON5 格式）。`~/.openclaw/workspace/`（工作空间）。用 `openclaw config get` 查看。

### Q8: 多个 API Key 怎么配置？ 🔴
**→** 通过环境变量分别设置：`export OPENAI_API_KEY=... ANTHROPIC_API_KEY=...`，OpenClaw 自动读取。

### Q9: 环境变量和配置文件哪个优先？ 🟡
**→** 优先级：命令行参数 > 环境变量 > `~/.openclaw/openclaw.json` > 默认值。

### Q10: 升级后配置丢失 🟢
**→** 正常升级不会丢。Docker 部署需确保挂载数据卷 `-v ./data:/root/.openclaw`。升级前备份：`cp -r ~/.openclaw ~/.openclaw.backup`。

### Q11: 升级后功能异常怎么回滚？ 🟢
**→** `npm install -g openclaw@2026.1.0` 指定版本回滚。Docker 改 image tag。

### Q12: Windows Gateway 启动失败 🟢
**→** 端口占用/防火墙/WSL 兼容问题。推荐 WSL2 运行。

### Q13: macOS 安装提示"无法验证开发者" 🟢
**→** `xattr -d com.apple.quarantine $(which openclaw)` 或在系统偏好设置中允许。

### Q14: 端口被占用 EADDRINUSE 🟡
**→** `lsof -i :18789` 找 PID kill，或 `openclaw config set gateway.port 18790` 换端口。

### Q15: 怎么完全卸载？ 🟢
**→** `openclaw gateway stop && npm uninstall -g openclaw && rm -rf ~/.openclaw`。

---

## 二、消息平台 (Q16–Q25)

### Q16: WhatsApp 扫码后频繁断开 🟢
**→** 手机端需保持在线，省电模式会杀后台。用 `openclaw daemon` 安装为系统服务。一个账号只能连一个 Web 客户端。

### Q17: Telegram Bot 不响应消息 🟢
**→** 检查 Bot Token 是否正确、Gateway 是否运行、隐私模式是否关闭（@BotFather → Group Privacy → Turn off）。

### Q18: Telegram Bot 群组中不回复 🟢
**→** 默认隐私模式只能收到 @提及和 /命令。关闭隐私模式（见 Q17），或用 `/activation mention/always`。

### Q19: Discord Bot 无法加入服务器 🟢
**→** OAuth2 权限不完整。需勾选 bot + applications.commands + Send Messages + Read Message History + Embed Links + Attach Files。注意 Discord 用 `channels.discord.token`。

### Q20: 消息延迟严重 🔴
**→** 排查环节：`openclaw logs --limit 20` 看时间戳、`openclaw health` 测 API 延迟。优化：换快模型、精简 SOUL.md/MEMORY.md、减少 Token。

### Q21: 消息发送失败提示 rate limited 🟡
**→** 平台侧频率限制，减少发送频率等待自动重试。API 429 限流参考 Q27 配置 fallback。

### Q22: 飞书接入后收不到消息 🔴
**→** 检查：Gateway 公网地址可达、事件订阅 URL 配置（`im.message.receive_v1`）、Bot 权限（获取/发送消息+读取用户信息）。`openclaw logs | grep feishu` 查日志。

### Q23: 控制面板打不开 🟢
**→** 确认 Gateway 运行 `openclaw status`，检查端口和防火墙。

### Q24: 同一个平台能接入多个账号吗？ 🟢
**→** 可以。`openclaw channels add whatsapp --name "work"` 添加多个实例，各自独立运行。

### Q25: 图片/文件 AI 能处理吗？ 🟡
**→** 取决于模型是否支持多模态（GPT-5.2、Claude Sonnet 4.6 可处理图片）。不支持多模态的模型会提示用户发文字。

---

## 三、模型和 AI (Q26–Q35)

### Q26: API 401 Unauthorized 🔴
**→** API Key 无效/过期/余额不足。用 `openclaw health` 测试 Key，去提供商后台确认。重新 export Key 后重启 Gateway。

### Q27: 429 Too Many Requests（API 限流）🟡
**→** 超过提供商 RPM/TPM 限制。解决方案：配置 fallback 链（primary + fallbacks）、用 OpenRouter 聚合、升级 API 账户等级。

### Q28: 模型回复很慢 🔴
**→** 换小模型（gpt-5.2-mini 快 3-5 倍）、精简系统提示词、用本地模型（零网络延迟）、检查网络 ping。

### Q29: Token 超限 context length exceeded 🔴
**→** 对话历史 + 系统提示 + 记忆文件总 Token 超限。方案：`/compact` 压缩上下文、用大窗口模型（Claude 200K、Gemini 1M）、`/new` 开新会话。可设 `reserveTokensFloor` 控制自动压缩。

### Q30: Ollama 本地模型连不上 🟢
**→** 确认 `ollama serve` 运行中，`curl http://127.0.0.1:11434/api/tags` 验证。跨机器需 `OLLAMA_HOST=0.0.0.0`。

### Q31: 本地模型回复质量差 🟢
**→** 小参数模型能力有限。换大模型（llama3.1:70b）、用中文能力更好的（qwen2.5:14b）、优化提示词、混合策略（简单用本地、复杂用云端）。

### Q32: 国产模型配置（通义千问/Kimi/智谱等）🔴
**→** 大多通过 OpenAI 兼容接口接入：DashScope `baseUrl` = `https://dashscope.aliyuncs.com/compatible-mode/v1`，DeepSeek `https://api.deepseek.com/v1`。或通过 OpenRouter 一站式接入。优势：不需代理、中文强、便宜。

### Q33: 模型故障转移 Fallback 🔴
**→** 配置 `agents.defaults.model` 的 primary + fallbacks 数组。主模型 5xx/超时/429 时自动按顺序切换。`openclaw models fallbacks list` 查看状态。

### Q34: API 费用太高 🟡
**→** 控制台设预算上限、用便宜模型（mini 差 10 倍价格）、精简记忆文件（MEMORY.md < 500 行）、用本地模型零成本。

### Q35: 不同对话用不同模型 🟡
**→** 为不同 Agent 配置不同 model，或用模型别名快速切换，或通过 bindings 路由不同 Channel 到不同 Agent。

---

## 四、技能和工具 (Q36–Q45)

### Q36: 技能不生效，AI 不执行 🟡
**→** `openclaw skills list` 确认技能 enabled，检查触发关键词是否匹配，`openclaw skills check` 手动测试。

### Q37: 自定义技能报错 🟡
**→** 格式不对或引用了不存在的工具。用 `openclaw skills check` 检查。技能文件需有 YAML frontmatter（name/description/triggers/tools）。

### Q38: 工具执行失败 🟡
**→** 权限或依赖问题。`openclaw doctor` 诊断。注意 shell_exec 默认禁用（安全考虑）。

### Q39: 怎么禁用某个工具？ 🟡
**→** 配置 `sandbox.mode`（off/non-main/all）限制工具执行。也可在 SOUL.md 中写明禁用规则。`openclaw doctor` 查看权限。

### Q40: 怎么添加新工具？ 🟢
**→** 通过 MCP 协议接入（`openclaw plugins`），或自己写 TypeScript 工具放在 `~/.openclaw/workspace/tools/`。

### Q41: 技能执行到一半中断 🔴
**→** Token 截断或中间步骤失败。前台 `--verbose` 查日志，发"继续"让 AI 接着执行。

### Q42: 查看 AI 调用了哪些工具 🟡
**→** `openclaw sessions list` 查调用记录，`openclaw logs --follow` 实时查看。

### Q43: 内置技能列表 🟢
**→** `openclaw skills list` 查所有技能，`openclaw skills info <name>` 查详情。

### Q44: 技能之间会冲突吗？ 🟢
**→** 触发条件重叠时可能冲突，OpenClaw 按优先级选择。用 `openclaw skills list/info` 排查。

### Q45: 分享自定义技能 🟢
**→** 直接复制 `~/.openclaw/workspace/skills/*.md` 文件。社区技能库：`github.com/openclaw/openclaw-skills`。

---

## 五、部署和运维 (Q46–Q55)

### Q46: Docker 容器启动后立即退出 🟢
**→** 查 `docker compose logs openclaw`。常见原因：配置文件缺失、端口冲突、环境变量没设。前台模式 `docker compose up`（不加 -d）调试。

### Q47: Docker 容器内存过高 🟢
**→** 限制内存 `deploy.resources.limits.memory: 1G`，清理会话 `sessions cleanup`，减少连接平台数，定期重启。

### Q48: Docker 数据卷备份 🟢
**→** `tar -czf backup.tar.gz ./data/` 或自动化 crontab 每日备份。

### Q49: Gateway 崩溃后自动重启 🟡
**→** 推荐 `openclaw daemon`（systemd 服务自动重启）。Docker 设 `restart: unless-stopped`。PM2 也可。

### Q50: 日志怎么看？怎么排查？ 🔴
**→** 前台 `openclaw gateway --verbose` 实时查看。Docker: `docker compose logs -f openclaw`。设 `logging.level: debug` 排查，完事改回 info。

### Q51: 监控运行状态 🟡
**→** `curl localhost:18789/health` 健康检查，`openclaw status` 查详情（uptime/channels/sessions/memory/CPU）。

### Q52: 磁盘空间清理 🟢
**→** `openclaw sessions cleanup` 清会话日志，`find memory/ -mtime +60 -delete` 清旧日志，`docker system prune` 清 Docker。

### Q53: 多服务器部署 🟢
**→** 单实例架构。方案：各服务器接不同平台、反向代理负载均衡（实验性）、NFS 共享配置。

### Q54: 设置 HTTPS 🟢
**→** 推荐反向代理 Nginx + Let's Encrypt。也可内置 TLS：`gateway.tls.certPath/keyPath` 配置证书路径。

### Q55: 自动更新 🟢
**→** npm: crontab 定期 `npm update -g openclaw`。Docker: Watchtower 自动更新镜像。

---

## 六、记忆系统 (Q56–Q58)

### Q56: AI 不记得之前说的话 🔴
**→** 记忆基于 Markdown 文件，信息需写入才会持久化。检查 `MEMORY.md` 是否存在，`compaction.memoryFlush.enabled` 是否为 true。主动让 AI 记住或手动编辑。

### Q57: 记忆文件太大导致 Token 超限 🔴
**→** MEMORY.md 建议控制在 500 行 / 3000 tokens 内。精简过时信息、归档旧日志到 `memory/archive/`。每次会话都加载 MEMORY.md，太大会挤占对话空间。

### Q58: 多 Agent 共享记忆 🟡
**→** 默认共享同一 workspace。隔离：为 Agent 配置独立 `workspace` 路径。部分共享：用符号链接。

---

## 七、安全和隐私 (Q59–Q64)

### Q59: API Key 泄露风险 🟡
**→** Key 存本地配置，不上传服务器。确保文件权限 600。更安全用环境变量。不要写入 git 追踪的文件。

### Q60: 聊天记录存储和隐私 🟡
**→** 存本地 `~/.openclaw/`。消息内容只发到模型提供商。本地模型数据完全不出本机。

### Q61: Gateway Token 必须设置吗？ 🟡
**→** 必须！不设则任何人可连接。`openclaw config set gateway.auth.token "$(openssl rand -hex 32)"`。

### Q62: 限制谁能跟 AI 对话 🟢
**→** 配对系统（默认开启，陌生人需批准）、白名单 `allowFrom`、`openclaw pairing list` 管理。

### Q63: 防止 AI 执行危险操作 🟡
**→** 启用沙箱 `sandbox.mode: all`、SOUL.md 写安全规则、Git 管理 workspace 追踪改动、查看会话日志。

### Q64: 已知安全漏洞 🟢
**→** 2026 年初有 CVE 已修复。保持最新版本，关注 `github.com/openclaw/openclaw/security/advisories`。

---

## 八、中国用户特别提示 (Q65–Q67)

### Q65: API 访问不了 🔴
**→** OpenAI/Anthropic/Google API 需代理。替代方案：OpenRouter 聚合、国产模型（DeepSeek/Moonshot 免代理）、本地模型（Ollama 零网络）。

### Q66: WhatsApp 在中国能用吗？ 🟢
**→** 需代理。替代：飞书（国内原生支持，推荐）、Telegram（需代理）。钉钉/微信不受官方支持。

### Q67: npm 镜像配置后还是装不上 🟡
**→** `npm cache clean --force` 清缓存，确认 registry 生效。备选：GitHub Releases 下载预编译包或 Docker。

---

## 九、社区和贡献 (Q68–Q72)

### Q68: 报告 Bug 🟢
**→** GitHub Issues，附上版本/Node/OS/复现步骤/日志。

### Q69: 贡献代码 🟢
**→** Fork → clone → feature 分支 → 开发测试 → PR。`npm run dev && npm test`。

### Q70: 创建和分享自定义技能 🟢
**→** `workspace/skills/*.md` 创建，`openclaw skills check` 测试，提交到 `openclaw-skills` 社区。

### Q71: 中文社区 🟢
**→** GitHub Discussions、Discord 中文频道、微信公众号。

### Q72: 文档错误反馈 🟢
**→** GitHub Issue 标注 `docs` 标签或直接 PR。

---

## 十、其他 (Q73–Q79)

### Q73: OpenClaw 和 ChatGPT 的区别 🟢
**→** ChatGPT 是 AI 聊天产品（只用 OpenAI 模型、网页/App、数据在云端）。OpenClaw 是 AI Agent 框架（29+ 提供商、多平台、本地数据、开源免费）。

### Q74: 支持哪些语言？ 🟢
**→** AI 回复语言取决于模型和系统提示词。SOUL.md 指定中文即可。中文推荐 Qwen 系列。

### Q75: 多实例运行 🟢
**→** 可以。用 `OPENCLAW_HOME` 环境变量指定不同数据目录 + 不同端口。

### Q76: 是否收费？ 🟢
**→** 开源 MIT 协议永久免费。仅 API 调用费（云端模型），本地模型零成本。

### Q77: 查看所有配置 🟡
**→** `openclaw config get` 查全部，`openclaw config get <key>` 查特定项。备份：`cp openclaw.json backup.json`。

### Q78: Gateway 和 Agent 的关系 🟡
**→** Gateway = 消息网关（连接平台，收发消息）。Agent = AI 智能体（理解/工具/回复）。流程：用户→平台→Gateway→Agent→模型→Agent→Gateway→平台→用户。

### Q79: 获取帮助的渠道 🟢
**→** 优先级：本 FAQ → 官方文档 → GitHub Issues 搜索 → GitHub Discussions → Discord。附上版本/Node/OS/日志。

---

## 与我们环境高度相关的 FAQ 速查索引 🔴

| # | 问题 | 快速解法 |
|---|------|----------|
| Q2 | Node.js 版本不兼容 | nvm install 24 |
| Q4 | 中国网络安装慢 | npm registry=npmmirror |
| Q8 | 多 API Key 配置 | 环境变量分别 export |
| Q20 | 消息延迟严重 | openclaw health + 精简提示词 |
| Q22 | 飞书收不到消息 | 检查事件订阅 URL + Bot 权限 |
| Q26 | API 401 报错 | 检查 Key + openclaw health |
| Q28 | 模型回复慢 | 换小模型/精简提示/本地模型 |
| Q29 | Token 超限 | /compact + 大窗口模型 |
| Q32 | 国产模型配置 | OpenAI 兼容接口 baseUrl |
| Q33 | 模型 Fallback | primary + fallbacks 配置 |
| Q41 | 技能中断 | 发"继续" + --verbose 查日志 |
| Q50 | 日志排查 | openclaw gateway --verbose |
| Q56 | AI 不记得 | 检查 MEMORY.md + memoryFlush |
| Q57 | 记忆文件过大 | <500 行，归档旧日志 |
| Q65 | API 访问不了 | 代理/OpenRouter/国产模型/本地模型 |
