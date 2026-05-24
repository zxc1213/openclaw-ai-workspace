# 重大决策

### 2026-03-16
- **Team Dashboard 定位**：决定自建 5-tab 监控面板（概览/任务/统计/日志/Cron），端口 18788，由 Node.js 提供 API + 前端 SSE 实时推送
- **Agent 团队架构**：7 个 agent（main/coder/reviewer/cron-worker/research/writer/analyst），main 用 GLM-5-Turbo，coder/reviewer 用 GLM-5
- **Telegram 通道**：通过 Clash 代理（172.25.192.1:7890）连接 Telegram API，Windows 防火墙放行 WSL 网段
- **Control UI 汉化方案**：选择在 index.html 注入 MutationObserver 补丁脚本（约 350 条翻译），而非修改源码，但每次更新后需重新部署

### 2026-03-17
- **Dashboard 迁移 systemd**：密钥从 systemd service 迁到 `.env` 文件（EnvironmentFile + chmod 600），端口从 18880 迁到 18788
- **多 Agent 协作**：配置 `subagents.allowAgents` 显式允许派发任务给其他 agent，首次成功派发任务给 analyst
- **Tavily 搜索**：配置 TAVILY_API_KEY，用 systemd drop-in 目录加载环境变量（`openclaw-gateway.service.d/tavily.conf`）
- **PDM 反向工程**：决定用 LLM 从 Mapper XML + Domain 类反向生成 PDM 和数据字典，并行双 subagent 补空表+注释

### 2026-03-19
- **nian-desktop 签名方案**：确定使用 Ed25519（非 secp256k1），device identity 完整方案确定
- **nian-desktop 定位**：Ray 提醒要充分利用团队——nian-desktop 应展示和调度整个 agent 团队

### 2026-03-30
- **Claude Code 更新策略**：从独立二进制切换到 npm 安装（`npm install -g @anthropic-ai/claude-code`），更新更方便且走代理

### 2026-03-31
- **安全简报系统**：创建安全简报技能 + cron 每天 09:00 自动生成，数据源为阿里云 AVD/OSCS/安全客/NVD/GitHub Security Advisories
- **KCZX 环境变量整合**：统一开发/Docker/k8s/Rancher 四套配置的环境变量来源（envFrom），7 个旧 k8s 配置文件合并为 configmap + secret
- **fastjson → hutool 迁移**：在 science-innovation-parent 中将 fastjson 替换为 hutool JSONUtil（27 个 Java 文件 + 1 个 pom.xml）
- **K8s 配置统一**：4 个 Java 项目（hl/js/lq/gdcg）k8s 目录全部统一为 configmap.yaml + secret.yaml + 3 个 deployment

### 2026-04-01
- **n8n + OpenClaw 协作**：安全简报从纯 OpenClaw cron 改为 n8n Schedule + 5 数据源并行抓取 + OpenClaw AI 分析的协作模式
- **Agent 团队完善**：为 6 个 subagent 完善了 SOUL/USER/AGENTS 三件套，加入项目上下文和协作规则
- **exec 审批策略**：全局 defaults 设为 `security: full` + `ask: off`，subagent 和 main 全部放权（系统红线仍由 AGENTS.md 约束）
- **QQ Bot 接入**：OpenClaw 2026.3.31 原生支持 QQ Bot（不需要第三方插件），安装 silk-wasm 依赖
- **模型升级**：coder 切换到 GLM-5.1，新增 designer agent 使用 GLM-4.6V，全局 imageModel 设为 GLM-4.6V

### 2026-04-02
- **QQ Bot 多账号方案**：不用 `accounts.default`，改用有意义的 accountId（nianian/shijie/research），并显式绑定 agent
- **Dashboard 告警升级**：新增 LLM 超时检测（journalctl 日志分析）+ QQ Bot C2C 主动消息通知渠道
- **OpenViking 接入**：配置 embedding-3 + glm-4.6v，所有历史 memory 批量导入（2748 条向量），contextEngine 插槽 = openviking

### 2026-04-05
- **WSL2 静态 IP 方案**：配置 `172.25.192.2/20`，用 systemd service 开机自动设置，Windows hosts 添加 `wsl.local` 映射
- **飞书知识库 + 任务管理**：创建「念念的 AI Agent 实践笔记」知识空间 + 配置速查多维表格 + 「念念待办」任务清单，所有待办迁移到飞书任务管理
- **GLM Coding 学习路线**：决定深入 Harness Engineering 概念，分三阶段（本周/1-2周/1个月）提升 AGENTS.md 质量和 Skill 设计
- **Windows Chrome 远程控制架构**：WSL → portproxy → Chrome CDP IPv6，配合 chrome-remote.sh + cdp-control.py 工具链

### 2026-04-05
- **飞书知识库建设**：创建私有知识空间「念念的 AI Agent 实践笔记」，作为学习笔记和配置文档的集中管理平台
- **飞书任务管理**：所有待办迁移到飞书任务清单「念念待办」，Ray 要求从飞书看进度、逐项执行
- **配置速查多维表格**：创建 5 表 49 记录的配置速查手册（服务端口/账号密钥/项目路径/模型配置/环境信息），密钥脱敏存储
- **Config Protection + 质量门禁**：禁止修改 lint/config 让代码通过，通过 rules/common/quality-gate.md + coding-agent-plan-first skill 双防线实现；质量门禁流程：Config Protection → Lint → TypeCheck → Test → Security

### 2026-04-08
- **MEMORY.md 分 L1/L2**：借鉴 MemPalace，L1 核心事实（compaction 重注入），L2 详细内容（按需搜索）；判断标准"没这条新会话会不会做错事？"
- **Daily Notes 标签化**：重要条目加 `#tag`，跨项目同一标签记录到 `tunnels.md`
- **Subagent 记忆隔离**：任务模板新增 `memory_scope` 字段，搜索时按 URI 前缀过滤
