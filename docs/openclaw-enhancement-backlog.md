# OpenClaw 团队增强备忘录

> 创建时间：2026-04-03
> 最后检查：2026-05-01
> 状态：**可推进** — 当前版本 2026.4.21（最新 2026.4.29），自 4.5 以来跨越 16 个版本
> 背景：要求在不升级 OpenClaw 2026.4.2 的前提下，分步增强团队能力

## ✅ 已完成 (2026-04-03)

### 1. Subagent Skills 分配
每个 subagent 通过 symlink 获得专属 skills：

| Agent | Skills |
|-------|--------|
| 💻 码农1号 | github, vibe-coding, self-improving-agent, ontology |
| 🔍 评审员 | github, security-briefing, self-improving-agent |
| 🔬 调研员 | tavily-search, summarize, self-improving-agent, ontology |
| 📝 文案 | lark-doc, lark-wiki, lark-sheets, summarize, self-improving-agent |
| 📊 分析师 | security-briefing, ontology, self-improving-agent, summarize |
| ⏰ 定时任务 | lark-im, lark-calendar, self-improving-agent |
| 🎨 设计师 | agent-browser, self-improving-agent, ontology |

### 2. 模型优化
- 🔍 评审员：GLM-5 (无reasoning) → GLM-5.1（代码审查需要深度推理）
- 📊 分析师：GLM-5-Turbo → GLM-5.1（分析任务需要推理能力）
- 💻 码农1号：保持 GLM-5.1（已经是最佳配置）
- 🎨 设计师：保持 GLM-4.6V（多模态专属模型）

## ✅ 已完成 (2026-04-09 更新)

### 3. OpenClaw 升级 → 2026.4.5 ✅
- **当前版本**: ~~2026.3.31~~ → **2026.4.5**
- **新版本已实现的预期收益**:
  - ✅ ACPX MCP Bridge — 已内嵌 acpx 插件，无需外部 ACP CLI
  - ✅ Background Tasks 统一控制面 — cron 中断重放、失败通知等
  - ✅ QQ Bot 增强 — slash commands、media、reminders skills 已安装
  - ✅ Agent imageModel — 自定义 GLM provider 的 image capability 自动注册已修复
  - ✅ Control UI 多语言 — 简体中文已内嵌
  - 🆕 Memory Dreaming（实验性）— 自动记忆巩固机制
  - 🆕 内置视频/音乐生成工具
  - 🆕 结构化进度展示

## ✅ 新版本已覆盖 (2026-05-01 更新，4.5→4.21)

### 平台侧自动完成的安全加固
- SSRF 策略大幅加强（browser、web_fetch、media、MCP loopback）
- Exec sandbox 加固（env injection block、host env denylist、approval lifecycle）
- Gateway auth token 轮换即时失效
- dotenv workspace env 注入 block（`OPENCLAW_*` keys）
- Config redaction 增强（`browser.cdpUrl` 等）

### 新能力降低待办难度
- **Cron Jobs**（待办 #4）：2026.4.20 大幅改进 cron isolated agent delivery、状态展示、`jobs-state.json` 分离
- **MCP Server**（待办 #6）：2026.4.7 新增 webhook ingress plugin + provider-auth runtime SDK；context engine plugin SDK
- **SkillHub**（待办 #7）：2026.4.12 Active Memory 插件、2026.4.10 `openclaw infer` hub、Dreaming 2.0
- **Subagent 协作**（待办 #8）：2026.4.20 subagent failure payload 含 role/timing；`lightContext` 改进

## 📋 待执行（可推进）

### 4. 增加 Cron Jobs
- [ ] **每日日程摘要** — 每天 08:30，利用 lark-workflow-standup-report
- [ ] **项目巡检** — 定期 git status + 检查关键服务健康
- [ ] **飞书消息摘要** — 每 2-4h 扫描重要未读消息

### 5. 安全加固
- [ ] **allowedOrigins `*` → 显式信任来源**（上次审计 🔴）
- [ ] **gateway 密码迁移到环境变量**（上次审计 🟡）

### 6. 自建 MCP Server
- [ ] 封装 Dashboard API
- [ ] 考虑接入 filesystem MCP、github MCP

### 7. 补充 SkillHub 技能
- [ ] agent-dashboard — Dashboard 管理增强
- [ ] mcp — MCP 管理（等升级后）
- [ ] openclaw-dashboard v1.7.3

### 8. 完善 Subagent SOUL.md
- [ ] 每个 agent 的 AGENTS.md 加入协作协议
- [ ] 明确"什么时候找 main 帮忙"
- [ ] 错误处理和自我改进流程标准化

## 备注
- Tavily 搜索已可用（替代 Brave Search），API key 已配置
- Web search (Brave) 缺少 API key，暂不修复，用 Tavily skill 替代
- ~~imageModel 只能在 agents.defaults 级别配置，agent list 级别不支持（2026.3.31 限制）~~ → 2026.4.5 已支持自定义 provider image capability 自动注册
- 2026.4.5 Breaking: 移除部分 legacy config alias（talk.voiceId、browser.ssrfPolicy 等），已通过 openclaw doctor --fix 兼容
- 2026.4.7 新增: `openclaw infer` hub、memory-wiki 恢复、webhook ingress plugin、compaction provider registry、Dreaming session corpus ingestion
- 2026.4.10 新增: Active Memory 插件、macOS MLX TTS、Seedance 2.0、Microsoft Teams 消息动作
- 2026.4.12 新增: Memory/Active Memory 正式发布、Dreaming/Memory Palace UI
- 2026.4.15 新增: Claude Opus 4.7 默认、Google TTS、Memory LanceDB cloud storage
- 2026.4.18 新增: Claude Opus 4.7 xhigh reasoning、macOS screen snapshot
- 2026.4.20 新增: Cron jobs-state.json 分离、Moonshot Kimi K2.6 默认、Session maintenance cap
- 2026.4.21 新增: OpenAI gpt-image-2 默认、plugin runtime dependency repair
- **当前版本 2026.4.21，最新 2026.4.29** — 落后 8 个小版本
