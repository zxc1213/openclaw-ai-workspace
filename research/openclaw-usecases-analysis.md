# OpenClaw 中文用例大全分析报告

> **分析对象**: [awesome-openclaw-usecases-zh](https://github.com/AlexAnys/awesome-openclaw-usecases-zh) 仓库全量 46 个用例
> **分析日期**: 2026-04-05
> **分析目的**: 评估我们已有能力覆盖度，发现高价值可落地用例，识别新能力缺口

---

## 一、总览统计

| 维度 | 数量 |
|------|------|
| 总用例数 | 46 个 |
| 中国特色用例 | 19 个（含适配） |
| 国际原引用例 | 27 个 |
| 覆盖 8 大类 | 中国特色(19)、社交媒体(4)、创意构建(3)、基础设施(4)、生产力(15)、研究学习(8)、金融交易(1)、跨类共用(部分重叠) |

### 分类汇总

| 分类 | A 已具备 | B 可落地 | C 新领域 | 合计 |
|------|---------|---------|---------|------|
| 🇨🇳 中国特色 | 6 | 7 | 6 | 19 |
| 📱 社交媒体 | 0 | 1 | 3 | 4 |
| 🎨 创意与构建 | 1 | 1 | 1 | 3 |
| 🏗️ 基础设施与 DevOps | 0 | 1 | 3 | 4 |
| ⚡ 生产力 | 4 | 5 | 6 | 15 |
| 🔬 研究与学习 | 1 | 3 | 4 | 8 |
| 💰 金融与交易 | 0 | 1 | 0 | 1 |
| **合计** | **12** | **19** | **23** | **46**（含重复归类） |

> 注：部分用例跨分类出现（如 custom-morning-brief 同时在"中国特色"和"生产力"中），以上按首次出现归类。

---

## 二、逐用例分析

### 分类说明

- **A = 已具备能力**: 我们已有类似配置或 skill，可直接使用或微调即可
- **B = 有参考价值可直接落地**: 需要少量适配（安装 skill / 写脚本 / 调配置），但技术路径清晰
- **C = 新领域需深入学习**: 全新场景，需要投入较多精力学习和搭建

---

### 🇨🇳 中国特色用例（19 个）

| # | 用例 | 分类 | 理由 |
|---|------|------|------|
| 1 | **飞书 AI 助手** | **A** | 我们已完整部署飞书渠道，对话式 AI、富媒体、流式输出均已在用 |
| 2 | **飞书全能操作台（Lark CLI）** | **A** | 我们已有 lark-cli 全套安装，且 200+ 命令已覆盖 IM/文档/日历/妙记/搜索等 11 个领域 |
| 3 | **早间简报（适配）** | **A** | 我们已有完整的 daily-digest 技能（安全简报+日程+待办+热榜+天气），飞书推送已跑通 |
| 4 | **办公自动化套件** | **B** | 周报生成我们已有；邮件管理（163/QQ/Outlook）需要安装 imap-smtp-email skill；文件整理可落地 |
| 5 | **会议纪要与待办自动化（适配）** | **A** | 飞书妙记+任务创建我们已有 lark-vc + lark-task，待办自动创建可现成使用 |
| 6 | **Agent Swarm 一人开发团队（适配）** | **A** | 我们已有 coding-agent skill，可编排 Codex/Claude Code，飞书通知已配置 |
| 7 | **多智能体协作操作系统** | **C** | OpenCrew 框架概念新颖（A2A 协议、知识三层压缩、自主决策分级），但依赖 Slack 且复杂度高 |
| 8 | **钉钉 AI 助手** | **C** | 全新渠道，需创建钉钉应用、配置 Stream 模式。如需钉钉可落地，否则暂无需求 |
| 9 | **企业微信 AI 助手** | **C** | 全新渠道，需企业微信管理员权限+回调 URL。如有需求可参考搭建 |
| 10 | **小红书内容自动化** | **C** | 全新领域，依赖 Windows+Chrome，风控风险高。如要做内容运营可参考其热点检测+文案生成思路 |
| 11 | **播客制作流水线（适配）** | **C** | 全新领域，涉及录音/剪辑/转写/发布全链路。国内有小宇宙/喜马拉雅适配方案，但需音频处理工具链 |
| 12 | **AI 财报追踪器（适配）** | **B** | 有 cron + web_search 基础，AKShare 数据源免费。A股财报需适配数据源（巨潮资讯），飞书推送现成 |
| 13 | **开发前创意验证器（适配）** | **B** | 我们有 web_search + Firecrawl，可爬取百度指数/微信指数/V2EX。需安装 idea-reality-mcp 或写脚本 |
| 14 | **电商多 Agent 架构** | **C** | 全新领域，需自建 4 个 Skill（销售/库存/客户/营销），需对接电商平台 API。架构设计有参考价值 |
| 15 | **A 股每日行情监控** | **B** | 有 cron + 飞书推送基础。需安装 AKShare 或 mcp-cn-a-stock MCP，写盘前/盘后/板块追踪脚本 |
| 16 | **竞争对手分析与价格监控（适配）** | **B** | 我们有 Firecrawl API 可爬取竞品页面，Perplexity 可替代为 Tavily/web_search。百度指数/微信指数可抓取 |
| 17 | **HuggingFace 论文发现（适配）** | **B** | 需安装 hf-papers + arxiv-source skill，公开 API 无需认证。飞书推送现成。适合 AI 领域研究者 |
| 18 | **arXiv 论文阅读与 LaTeX 写作（适配）** | **C** | 论文阅读可落地（arxiv-source skill），但 LaTeX 写作需 Docker + TeX 环境，复杂度高 |
| 19 | **多渠道 AI 客户服务（适配）** | **C** | 企业微信客服 API 为核心渠道，但抖音/小红书私信尚不可行。如无客服需求暂不需要 |

---

### 📱 社交媒体（4 个）

| # | 用例 | 分类 | 理由 |
|---|------|------|------|
| 20 | **每日 Reddit 摘要** | **C** | 全新渠道，需安装 reddit-readonly skill。对中文用户价值有限，除非关注英文社区 |
| 21 | **每日 YouTube 摘要** | **B** | 需安装 youtube-full skill + TranscriptAPI.com。YouTube 内容创作者有价值，普通人可选 |
| 22 | **X 账号分析** | **C** | 需 X/Twitter API 访问。我们无 Twitter 集成，需从零搭建 |
| 23 | **多源科技新闻摘要** | **B** | 我们已有 daily-hot-news（热榜）+ web_search。需安装 tech-news-digest skill 聚合 109+ 来源，可增强现有早报 |

---

### 🎨 创意与构建（3 个）

| # | 用例 | 分类 | 理由 |
|---|------|------|------|
| 24 | **目标驱动的自主任务** | **B** | 我们有 subagent 编排 + cron + ClawFlow。目标拆解+每日执行可基于现有能力扩展 |
| 25 | **YouTube 内容流水线** | **C** | 专为 YouTube 创作者设计，涉及创意发掘/竞品分析/趋势追踪。非 YouTube 创作者暂无需求 |
| 26 | **多智能体内容工厂** | **B** | 研究→写作→设计三阶段流水线，我们有多 agent 编排能力。可适配为"技术文档工厂"或"研究报告工厂" |

---

### 🏗️ 基础设施与 DevOps（4 个）

| # | 用例 | 分类 | 理由 |
|---|------|------|------|
| 27 | **n8n 工作流编排** | **B** | n8n 作为中间层可解决"凭证不接触智能体"问题。我们可参考 webhook 模式，但需部署 n8n 实例 |
| 28 | **Opik 可观测性追踪** | **C** | 全新工具（Opik），用于追踪 LLM 调用链路/子 agent/token 成本。适合生产级部署，个人使用优先级低 |
| 29 | **自愈家庭服务器** | **B** | 我们有 SSH 访问 + cron + 健康检查能力。核心思路（自动发现故障→诊断→修复→晨报）可直接落地 |
| 30 | **Agent Swarm 开发团队** | **A** | (已在中国特色中分析，同一用例) |

---

### ⚡ 生产力（15 个，去重后 13 个独立用例）

| # | 用例 | 分类 | 理由 |
|---|------|------|------|
| 31 | **自定义早间简报** | **A** | (已在中国特色中分析) 完整的 daily-digest 已在运行 |
| 32 | **收件箱整理** | **C** | 需 Gmail OAuth 或国内邮箱 IMAP 集成。我们没有邮件自动化 skill |
| 33 | **第二大脑** | **A** | 我们有 OpenViking 语义记忆 + MEMORY.md + daily notes，核心"随手记+语义搜索"已具备 |
| 34 | **个人 CRM** | **C** | 从邮件/日历自动发现联系人并构建关系图谱。我们没有邮件集成，且飞书通讯录已有部分 CRM 能力 |
| 35 | **健康与症状追踪器** | **B** | 基础框架简单（cron 提醒 + Telegram 记录 + markdown 日志）。我们有 cron + 飞书，可快速搭建 |
| 36 | **基于电话的个人助手** | **C** | 需 SuperCall skill + 电话服务。我们无电话集成能力 |
| 37 | **多渠道个人助理** | **C** | 统一 Telegram/Slack/邮件/日历。我们已有飞书渠道，其他渠道需逐一接入 |
| 38 | **家庭日历与家务助理** | **B** | 日历聚合我们有飞书日历；消息监控/库存管理是新增场景，但实现简单（markdown + cron） |
| 39 | **Todoist 任务管理器** | **C** | 需 Todoist API 集成。我们用飞书任务替代，功能类似但生态不同 |
| 40 | **多渠道 AI 客户服务** | **C** | (已在中国特色中分析) |
| 41 | **活动嘉宾确认** | **C** | 需 SuperCall 电话 skill。国内可用飞书消息/邮件替代，但非刚需 |
| 42 | **项目状态管理** | **B** | 事件驱动替代静态看板的思路好。我们有 GitHub + 飞书，可用 SQLite/文件存储状态，subagent 并行分析 |
| 43 | **动态仪表板** | **B** | 子 agent 并行抓取 API 数据 + Canvas 渲染。我们有 subagent + web_fetch，可搭建轻量版仪表板 |
| 44 | **自主项目管理（STATE.yaml）** | **B** | STATE.yaml 模式 + PM 委派，我们用 ClawFlow 类似模式。可参考其 PM 委派思路优化现有工作流 |
| 45 | **多智能体专业团队** | **C** | 4 个独立智能体（战略/开发/营销/商务）+ 共享记忆 + Telegram 路由。概念参考价值高，实现复杂 |

---

### 🔬 研究与学习（8 个）

| # | 用例 | 分类 | 理由 |
|---|------|------|------|
| 46 | **个人知识库 (RAG)** | **B** | 需安装 knowledge-base skill 或自建 embedding。我们有飞书文档+搜索，可增强为 RAG 知识库 |
| 47 | **AI 财报追踪器** | **B** | (已在中国特色中分析) |
| 48 | **语义记忆搜索** | **A** | 我们已有 OpenViking 语义记忆（memory_recall/memory_store），功能等价 |
| 49 | **市场调研与产品工厂** | **B** | 从 Reddit/X 挖掘痛点→构建 MVP。我们可用 Firecrawl + web_search 替代，飞书文档输出 |
| 50 | **开发前创意验证器** | **B** | (已在中国特色中分析) |
| 51 | **竞争对手分析与价格监控** | **B** | (已在中国特色中分析) |
| 52 | **HuggingFace 论文发现** | **B** | (已在中国特色中分析) |
| 53 | **arXiv 论文阅读与 LaTeX 写作** | **C** | (已在中国特色中分析) |

---

### 💰 金融与交易（1 个）

| # | 用例 | 分类 | 理由 |
|---|------|------|------|
| 54 | **Polymarket 自动驾驶** | **C** | 预测市场模拟交易，依赖 Polymarket API。与国内用户需求不匹配，且涉及金融风险 |

---

## 三、A/B/C 分类汇总

### A 类：已具备能力（12 个，26%）

这些用例我们**现在就能用**，无需额外安装：

| 用例 | 已有能力对应 |
|------|------------|
| 飞书 AI 助手 | openclaw-lark 飞书渠道插件 ✅ |
| 飞书全能操作台 | lark-cli 全套 200+ 命令 ✅ |
| 早间简报 | daily-digest（安全+日程+待办+热榜+天气）✅ |
| 会议纪要与待办自动化 | lark-vc + lark-task ✅ |
| Agent Swarm 开发团队 | coding-agent + subagent 编排 ✅ |
| 第二大脑 | OpenViking 记忆 + MEMORY.md + daily notes ✅ |
| 语义记忆搜索 | OpenViking memory_recall 语义搜索 ✅ |

### B 类：有参考价值可直接落地（19 个，41%）

这些用例**安装 1-2 个 skill 或写少量脚本**即可运行：

| 用例 | 落地步骤 | 预估工作量 |
|------|---------|-----------|
| **A 股每日行情监控** | 安装 AKShare + mcp-cn-a-stock，写 cron 脚本 | 2-3 小时 |
| **竞品分析与价格监控** | 用现有 Firecrawl + web_search，写监控脚本 | 2-3 小时 |
| **HuggingFace 论文发现** | 安装 hf-papers skill，配 cron + 飞书推送 | 1 小时 |
| **开发前创意验证器** | 安装 idea-reality-mcp 或写爬虫脚本 | 2 小时 |
| **财报追踪器（A股）** | cron + AKShare + web_search 组合 | 2 小时 |
| **多源科技新闻摘要** | 安装 tech-news-digest skill 增强早报 | 1 小时 |
| **自愈家庭服务器** | 基于现有 SSH + cron 写健康检查脚本 | 3-4 小时 |
| **项目状态管理** | 用 SQLite/文件 + subagent 搭建事件驱动系统 | 3-4 小时 |
| **动态仪表板** | subagent 并行抓取 + Canvas 渲染 | 3-4 小时 |
| **自主项目管理** | 参考 STATE.yaml 模式优化 ClawFlow | 2 小时 |
| **目标驱动自主任务** | 基于现有 subagent + cron 扩展 | 1-2 小时 |
| **多智能体内容工厂** | 适配为"研究→写作→发布"三阶段 | 3-4 小时 |
| **个人知识库 (RAG)** | 安装 knowledge-base skill | 2 小时 |
| **市场调研与产品工厂** | Firecrawl + web_search + 飞书文档 | 2-3 小时 |
| **n8n 工作流编排** | 部署 n8n + 配 webhook | 4-5 小时 |
| **健康与症状追踪器** | cron + 飞书消息 + markdown 日志 | 1 小时 |
| **家庭日历与家务助理** | 飞书日历 + cron + markdown | 2 小时 |
| **办公自动化套件** | 安装 imap-smtp-email skill | 2 小时 |
| **YouTube 每日摘要** | 安装 youtube-full skill | 1 小时 |

### C 类：新领域需深入学习（23 个，50%）

这些用例涉及全新场景或依赖我们没有的平台：

| 用例 | 原因 | 如需落地 |
|------|------|---------|
| 多智能体协作操作系统 | 依赖 Slack + OpenCrew 框架，复杂度高 | 概念参考，暂不落地 |
| 钉钉 AI 助手 | 全新渠道 | 如有钉钉需求可搭建 |
| 企业微信 AI 助手 | 全新渠道 | 如有企微需求可搭建 |
| 小红书内容自动化 | 全新领域 + 风控风险 | 仅参考文案生成思路 |
| 播客制作流水线 | 全新领域，需音频工具链 | 暂无需求 |
| 电商多 Agent 架构 | 全新领域，需自建 4 个 Skill | 如有电商需求可参考 |
| arXiv + LaTeX 写作 | 需 Docker + TeX 环境 | 论文阅读部分可落地 |
| 多渠道 AI 客户服务 | 需企微客服 API | 暂无需求 |
| Reddit 摘要 | 英文社区为主 | 价值有限 |
| X 账号分析 | 需 Twitter API | 我们无 Twitter 集成 |
| YouTube 内容流水线 | 专为 YouTube 创作者 | 非 YouTube 创作者暂无需求 |
| Opik 可观测性 | 全新工具 | 生产级部署再考虑 |
| 收件箱整理 | 需 Gmail OAuth / IMAP | 可后续安装 email skill |
| 个人 CRM | 需邮件集成 | 飞书通讯录部分替代 |
| 基于电话的个人助手 | 需电话服务 | 国内不便使用 |
| 多渠道个人助理 | 需多平台接入 | 飞书渠道已够用 |
| Todoist 任务管理器 | 需 Todoist API | 飞书任务替代 |
| 活动嘉宾确认 | 需电话 skill | 可用飞书消息替代 |
| 多智能体专业团队 | 4 个独立 agent 复杂度高 | 概念参考 |
| Polymarket 自动驾驶 | 国外平台 | 不适用 |

---

## 四、高价值用例 TOP 10（含可落地建议）

### 🥇 TOP 1: A 股每日行情监控

**价值**: 对 A 股投资者实用性强，盘前简报+盘后复盘+板块追踪+资金流向
**落地难度**: ⭐⭐（2-3 小时）
**落地步骤**:
1. `pip install akshare` 或部署 mcp-cn-a-stock MCP 服务
2. 编写 Python 脚本：`盘前简报(9:00)` + `盘后复盘(15:30)` 两个 cron 任务
3. 输出格式化为飞书消息卡片，通过飞书 webhook 推送
4. 注意：海外服务器部分接口受限，建议用 `stock_zh_a_hist` 等替代接口

### 🥈 TOP 2: 竞争对手分析与价格监控

**价值**: 替代 $150/月的 Semrush/SimilarWeb，自动生成竞品周报
**落地难度**: ⭐⭐（2-3 小时）
**落地步骤**:
1. 用现有 Firecrawl API 定期抓取竞品定价页/博客/更新日志
2. 用 Tavily API 替代 Perplexity 做多源聚合搜索
3. cron 每周一生成 JSON 格式竞品报告
4. 推送到飞书群或写入飞书多维表格
5. **关键建议**: 先窄后宽，先监控 3-5 个直接竞品

### 🥉 TOP 3: 自愈家庭服务器

**价值**: 自动健康检查+故障诊断+修复+晨报，解放运维精力
**落地难度**: ⭐⭐（3-4 小时）
**落地步骤**:
1. 编写基础健康检查脚本（磁盘/CPU/内存/网络/Docker）
2. cron 每 5 分钟运行，异常时写入飞书多维表格
3. 常见故障自动修复（磁盘清理、Docker 重启、服务重启）
4. 每日晨报合并到现有 daily-digest
5. **关键建议**: 安全边界！慎用自动修复，建议"检测+通知"优先，"修复"需确认

### TOP 4: HuggingFace 论文发现与研究

**价值**: 每日自动筛选 ML 热门论文 + arXiv 深读，AI 从业者刚需
**落地难度**: ⭐（1 小时）
**落地步骤**:
1. 安装 hf-papers + arxiv-source skill
2. cron 每天 8:00 运行，筛选点赞数 > 50 的论文
3. 摘要推送到飞书，带论文链接和社区评论
4. 可配置关键词过滤（如 "agent", "reasoning", "multimodal"）

### TOP 5: 项目状态管理（事件驱动看板）

**价值**: 替代静态看板，自动捕获 git commit + issue + PR 关联项目进展
**落地难度**: ⭐⭐（3-4 小时）
**落地步骤**:
1. 用 SQLite/文件存储 STATE.yaml，记录项目/里程碑/任务状态
2. subagent 并行分析多个项目的 GitHub activity
3. cron 每日生成项目进展摘要
4. 飞书消息查询（"XX 项目这周进展如何？"）
5. **关键洞察**: 事件驱动 > 手动更新看板

### TOP 6: 多源科技新闻摘要

**价值**: 聚合 109+ 来源的科技新闻，增强现有早报的"科技动态"板块
**落地难度**: ⭐（1 小时）
**落地步骤**:
1. 安装 tech-news-digest skill
2. 集成到现有 daily-digest 流水线，作为"科技新闻"模块
3. 质量评分过滤低质量内容
4. 按偏好排序（AI/开源/前端/安全等）

### TOP 7: 开发前创意验证器

**价值**: 编码前自动扫描竞品，返回竞争度评分，避免重复造轮子
**落地难度**: ⭐⭐（2 小时）
**落地步骤**:
1. 安装 idea-reality-mcp（已支持中文）
2. 补充国内数据源：百度指数、微信指数、V2EX 搜索
3. 输出标准化报告（市场大小、竞品数量、差异化建议）
4. 可与 coding agent 联动："先验证再编码"

### TOP 8: 动态仪表板

**价值**: 子 agent 并行抓取多个数据源，实时渲染仪表板
**落地难度**: ⭐⭐（3-4 小时）
**落地步骤**:
1. 定义数据源列表（GitHub stats、飞书多维表格、热榜 API 等）
2. subagent 并行抓取，写入统一数据文件
3. 用 Canvas 或生成 HTML 仪表板
4. cron 定时刷新
5. **与现有 Team Dashboard 互补**

### TOP 9: 多智能体内容工厂

**价值**: 研究→写作→设计三阶段流水线，可适配为"技术文档工厂"
**落地难度**: ⭐⭐（3-4 小时）
**落地步骤**:
1. 定义三个 subagent：研究 agent（Firecrawl 搜索）→写作 agent（生成文档）→审核 agent（质量检查）
2. 用 ClawFlow 编排流水线
3. 输出到飞书文档
4. 适配场景：技术周报、研究报告、竞品分析

### TOP 10: n8n 工作流编排

**价值**: 解决"凭证不接触智能体"的安全问题，复杂工作流可视化编排
**落地难度**: ⭐⭐（4-5 小时）
**落地步骤**:
1. Docker 部署 n8n
2. 在 n8n 中创建敏感操作工作流（发邮件、调 API 等）
3. OpenClaw 通过 webhook 触发 n8n 工作流
4. **关键洞察**: 智能体从不知道凭证，n8n 管理所有敏感信息

---

## 五、新能力发现

### 5.1 我们已有但可能未充分利用的能力

| 能力 | 现状 | 可挖掘的方向 |
|------|------|------------|
| **OpenViking 语义记忆** | 已部署，日常使用 | 可构建个人知识图谱（RAG），支持"我以前怎么说的"类查询 |
| **subagent 编排** | coding agent 已用 | 可扩展到非编码场景：研究、监控、内容生产 |
| **ClawFlow** | 已安装 | 可用于复杂多步工作流（如竞品周报生成） |
| **Firecrawl 网页爬取** | 已有 API key | 可用于竞品监控、价格追踪、新闻聚合 |
| **飞书多维表格** | 已有 skill | 可用作简易数据库（项目状态、竞品列表、论文追踪） |

### 5.2 从用例中发现的新能力方向

| 新能力 | 来源用例 | 实现路径 | 优先级 |
|--------|---------|---------|--------|
| **AKShare 金融数据** | A 股监控、财报追踪 | pip install akshare + Python 脚本 | 🔴 高 |
| **竞品监控系统** | 竞争对手分析 | Firecrawl + cron + 飞书多维表格 | 🔴 高 |
| **论文发现流水线** | HF 论文发现 | hf-papers skill + arxiv-source skill | 🟡 中 |
| **服务器自愈** | 自愈家庭服务器 | SSH + cron + 健康检查脚本 | 🟡 中 |
| **n8n 工作流** | n8n 编排 | Docker 部署 n8n + webhook | 🟡 中 |
| **邮件自动化** | 收件箱整理、办公自动化 | 安装 imap-smtp-email skill | 🟢 低 |
| **LaTeX 写作** | arXiv 写作 | Docker + TeX 环境 | 🟢 低 |
| **电话集成** | 电话助手、嘉宾确认 | SuperCall skill（国内不便） | ⚪ 暂不需要 |
| **小红书自动化** | 小红书内容 | XiaohongshuSkills（风控风险） | ⚪ 暂不需要 |

### 5.3 架构灵感

| 灵感 | 来源 | 可借鉴的点 |
|------|------|-----------|
| **STATE.yaml 模式** | 自主项目管理 | 用文件定义项目状态，agent 读写而非人更新看板 |
| **PM 委派模式** | 自主项目管理 | 生成专门的项目经理 agent，自主协调子任务 |
| **A2A 协议** | 多智能体操作系统 | agent 间结构化通信，替代自由文本
| **Ralph Loop 自改进** | Agent Swarm | Agent 自动改进自己的 prompt，形成进化循环
| **凭证隔离（n8n）** | n8n 编排 | 敏感操作由 n8n 处理，agent 从不接触凭证
| **定价页=金矿** | 竞品分析 | 竞品定价变动比功能更新更能反映战略方向
| **先窄后宽** | 竞品分析 | 先监控 3-5 个直接竞品，跑顺再扩展

## 子任务3: 论文发现流水线 — HF论文 + arXiv + 创意验证

> 学习来源: awesome-openclaw-usecases-zh 仓库三个用例
> 分析日期: 2026-04-05

---

### 一、HuggingFace 论文发现与研究

#### 痛点

每日刷 HF Papers 页面、手动扫几十篇标题、逐个点开看摘要、交叉检索 GitHub 仓库——纯手工流程，效率极低。

#### 方案架构

两个 Skill 组合构成完整流水线：

| Skill | 工具数 | 职责 |
|-------|--------|------|
| **hf-papers** | 4 个: `hf_daily_papers`, `hf_search_papers`, `hf_paper_detail`, `hf_paper_comments` | 发现层：浏览热门、关键词搜索、获取元数据、社区评论 |
| **arxiv-source** | 3 个: `arxiv_fetch`, `arxiv_sections`, `arxiv_abstract` | 深读层：获取全文、章节浏览、摘要提取 |

两个 Skill 均使用公开 API，无需 Docker 或认证，支持本地缓存。

#### 关键 Prompt（核心工作流）

```text
1. 每早 9 点: HF 热门 Top 10 (按点赞排序), 附 paper ID/标题/点赞/GitHub/AI摘要
2. 输入数字查看详情, "search [keyword]" 搜索
3. 详情含: 摘要/作者/GitHub链接/社区评论
4. "deep read": arxiv-source 获取全文 → 总结贡献/方法/结论/局限
5. 会话结束: 汇总今日已读论文 + 一句话要点
```

#### 关键词过滤策略

- **点赞数 + 评论数** = 快速过滤器，社区点赞是最有效的热度信号
- **GitHub 仓库关联** = 可复现信号，有代码的论文优先关注
- **搜索关键词** 用不同粒度: "vision transformer" vs "ViT efficient inference"，窄关键词减少噪音
- **社区评论** 是隐藏金矿: 作者常在评论中补充方法局限性

#### 国内适配要点

| 问题 | 方案 |
|------|------|
| HF 访问受限 | 设置 `HF_ENDPOINT=https://hf-mirror.com`，或手动改 skill 源码中的 Base URL |
| 补充信息源 | PaperWeekly (知乎专栏)、机器之心、智源社区 (hub.baai.ac.cn)、huggingface.ac.cn |
| 推送渠道 | 飞书机器人 (富文本卡片)、钉钉 Webhook、企微应用 |

#### 落地评估

| 项 | 我们现有能力 | 差距 |
|----|------------|------|
| HF 热门论文浏览 | ❌ 需要安装 hf-papers skill | 核心缺口 |
| arXiv 深读 | ❌ 需要安装 arxiv-source skill | 核心缺口 |
| 关键词搜索 | ✅ web_search / firecrawl-search 可替代部分 | 但不如专用 API 精准 |
| 定时推送 | ✅ cron + 飞书消息 | 已具备 |
| 论文笔记持久化 | ✅ OpenViking memory / 飞书文档 | 已具备 |

**安装命令**: `clawhub install hf-papers` && `clawhub install arxiv-source`

---

### 二、arXiv 论文阅读与 LaTeX 写作

#### 痛点

1. **阅读**: PDF 难快速定位关键章节，多篇论文间上下文频繁丢失
2. **写作**: TeX Live 数 GB、编译报错晦涩、编辑器/PDF/命令行工具切换频繁

#### 方案架构

| Skill | 工具数 | 职责 |
|-------|--------|------|
| **arxiv-reader** | 3 个: `arxiv_fetch`, `arxiv_sections`, `arxiv_abstract` | 论文阅读：下载 LaTeX 源码 → 展平 `\input` 嵌套 → 可读文本 |
| **latex-compiler** | 4 个: `latex_compile`, `latex_preview`, `latex_templates`, `latex_get_template` | LaTeX 写作：对话生成源码 → 即时编译 → PDF 预览 |

**注意**: arxiv-reader 和 hf-papers 中的 arxiv-source 是不同项目（Prismer vs willamhou），工具同名但来源不同。arxiv-reader 来自 Prismer (Prismer-AI)，功能更完善（自动展平 LaTeX）。

#### LaTeX 写作依赖

- 需要 Docker 部署 Prismer 工作区容器（端口 8080，含完整 TeX Live 环境）
- 支持 pdflatex / xelatex / lualatex
- 内置 article / IEEE / beamer / 中文文章模板

#### 关键 Prompt（论文阅读）

```text
1. 给 arXiv ID → 先获取摘要判断相关性
2. "read it" → 获取全文(默认移除 appendix) → 总结贡献/方法/结果
3. 多个 ID → 批量摘要对比表格 + 按研究相关性排序
4. 指定章节 → 先列章节结构 → 再展平解读
5. 维护已读论文列表 + 一句话要点
```

#### 关键 Prompt（LaTeX 写作）

```text
1. 从 IEEE 模板开始(或 article/beamer)
2. 描述段落内容 → 生成 LaTeX 源码
3. 每次大改后编译 + 预览
4. 编译错误自动读日志修复
5. BibTeX 粘贴即集成, 交叉引用跑两次编译
6. 中文论文: xelatex + ctex 宏包
```

#### 国内适配

| 项 | 方案 |
|----|------|
| 中文 LaTeX | xelatex + `\usepackage[UTF8]{ctex}`, fontset=auto |
| 高校模板 | ThuThesis(清华)、ucasthesis(中科院)、zjuthesis(浙大) 等, 见 hantang/latex-templates |
| Docker 镜像 | 配置国内 registry-mirrors, tlmgr 换清华源 |
| 在线替代 | TeXPage(国内,付费)、LoongTeX(国产,AI辅助) |
| 中文数据库 | arXiv/Semantic Scholar 可用; 知网/万方/维普无公开 API |

#### 落地评估

| 项 | 我们现有能力 | 差距 |
|----|------------|------|
| arXiv 论文获取 | ❌ 需安装 arxiv-reader (Prismer) | 核心缺口 |
| LaTeX 编译 | ❌ 需 Docker + Prismer 容器 | 重依赖, 视需求决定 |
| 论文总结分析 | ✅ PDF tool + LLM | arXiv ID 直达更好, 但 PDF 分析可兜底 |
| 国内论文 | ❌ 无公开 API | 暂无自动化方案, 手动下载+PDF分析 |

**安装**: `git clone Prismer-AI/Prismer` → 复制 skills 目录; LaTeX 写作需额外 `docker compose up`

---

### 三、开发前创意验证器

#### 痛点

智能体拿到需求就开干，从不检查竞品。投入大量时间后才发现领域已饱和。核心问题: **解决了一个已经被解决的问题**。

#### 方案

MCP 服务器 `idea-reality-mcp` 扫描 5 大数据源: GitHub / Hacker News / npm / PyPI / Product Hunt

返回 `reality_signal` 竞争度评分 (0-100):
- **>70**: 红区 — 停下来讨论, 报告 Top 3 竞品 + Star 数
- **30-70**: 黄区 — 展示结果 + 差异化建议 (pivot_hints)
- **<30**: 绿区 — 蓝海, 直接开干

#### 所需依赖

```bash
uvx idea-reality-mcp  # 一次性运行
```

OpenClaw MCP 配置:
```json
{"mcpServers": {"idea-reality": {"command": "uvx", "args": ["idea-reality-mcp"]}}}
```

#### 关键 Prompt

```text
Before starting any new project, feature, or tool, always run idea_check first.
- reality_signal > 70: STOP, report top 3 competitors with stars, ask user
- 30-70: show results + pivot_hints, suggest niche angle
- <30: proceed, space is open
Always show score and top competitors before writing code.
```

#### 国内数据源补充方案

idea-reality-mcp 本身已支持中文输入 (v0.3.0+，150+ 中英术语映射)。但扫描的 5 个数据源均为国际平台，需要补充国内验证:

| 国际源 | 国内对应 | 接入方式 |
|--------|---------|---------|
| Product Hunt | V2EX [创意]板块、少数派 | Firecrawl 爬取搜索结果 |
| Hacker News | V2EX、掘金、CSDN | Firecrawl 爬取 |
| GitHub | Gitee | `web_search` 搜索 gitee.com |
| npm/PyPI | npm(通用) | 已覆盖 |

**国内市场热度数据** (需手动或爬取):

| 平台 | 用途 | 接入难度 |
|------|------|---------|
| 百度指数 (index.baidu.com) | 关键词搜索趋势 | 需登录, Firecrawl 可尝试 |
| 微信指数 | 微信生态热度 | 需微信客户端, 无法自动化 |
| 巨量算数 (trendinsight.oceanengine.com) | 抖音/头条趋势 | 部分页面可爬取 |
| 36氪/IT桔子 | 融资项目检索 | Firecrawl 可爬取 |

**补充 Prompt**:
```text
After idea_check, research Chinese market:
- Search V2EX, 少数派, 36氪 for similar products (use firecrawl)
- Check Baidu Index trends (use firecrawl)
- Search Gitee for competing projects (use web_search)
- Compare competition level: China vs international
```

#### 落地评估

| 项 | 我们现有能力 | 差距 |
|----|------------|------|
| 国际竞品扫描 | ❌ 需安装 idea-reality-mcp | 核心缺口, 但可用 Web 版先试用 |
| 国内竞品搜索 | ✅ web_search + firecrawl-search | 可替代大部分 |
| 热度趋势 | ⚠️ firecrawl 可爬百度指数页面 | 有限自动化 |
| 评分决策 | ✅ LLM 可基于搜索结果做评分 | 不如 MCP 精准但可用 |

**替代方案 (不装 MCP)**: 用 `web_search` + `firecrawl-search` 手动执行 5 步搜索流程，LLM 综合评分。不如 MCP 自动化但零依赖。

---

### 四、落地路线图

#### Phase 1: 论文发现 (优先级高, 投入小)

```
1. clawhub install hf-papers          # HF 论文浏览 + 搜索
2. clawhub install arxiv-source        # arXiv 全文深读
3. 配置 HF_ENDPOINT=hf-mirror.com      # 国内镜像
4. 写 cron prompt: 每早 9 点推送 Top 10 到飞书群
5. 用 OpenViking memory 记录已读论文和要点
```

**cron 配置参考**: `0 9 * * *` → 调用 hf_daily_papers → 格式化 → 飞书消息推送

#### Phase 2: 论文深读 (按需)

```
1. git clone Prismer-AI/Prismer
2. cp -r Prismer/skills/arxiv-reader/ ~/.openclaw/skills/
3. 验证: 发送 arXiv ID 测试 arxiv_fetch
4. 可选: Docker 部署 LaTeX 编译环境
```

#### Phase 3: 创意验证 (按需)

```
1. 先用 Web 版试用: https://mnemox.ai/check
2. 确认价值后安装: uvx idea-reality-mcp
3. 配置 OpenClaw MCP server
4. 补充国内数据源: 写 firecrawl 爬取脚本 (V2EX/少数派/百度指数)
5. 添加到 SOUL.md: 新项目前必须先跑 idea_check
```

#### 现有工具替代矩阵

| 需求 | 原版 Skill | 我们的替代 | 替代质量 |
|------|-----------|-----------|---------|
| HF 热门论文 | hf-papers | web_search "huggingface daily papers" + firecrawl | ⚠️ 不够精准, 缺结构化数据 |
| arXiv 全文 | arxiv-reader / arxiv-source | PDF tool 分析下载的 PDF | ⚠️ 缺 LaTeX 源码展平, 公式解析弱 |
| 论文搜索 | hf_search_papers | web_search / firecrawl-search | ✅ 基本可用 |
| 竞品扫描 | idea-reality-mcp | web_search × 5 个平台 + LLM 评分 | ⚠️ 可用但不自动, 需手动编排 |
| 国内热度 | 无内置 | firecrawl 爬取百度指数等 | ⚠️ 受反爬限制 |
| 定时推送 | 无 (人工) | ✅ cron + 飞书消息 | ✅ 完全满足 |
| 笔记沉淀 | 无 | ✅ OpenViking memory + 飞书文档 | ✅ 完全满足 |

#### 核心洞察

1. **论文发现 = 发现层 + 深读层**: HF 论文浏览解决"找什么读"，arXiv 全文解决"怎么读"。两个层独立安装、按需组合
2. **创意验证的本质是"避免重复造轮子"**: reality_signal 基于真实数据 (Star/HN 讨论/包下载数), 不是 LLM 猜测
3. **国内适配的核心思路**: 国际工具 + 国内镜像 + 补充爬取。Firecrawl 是打通国内数据源的关键桥梁
4. **三个用例的共性**: 都是"信息获取 → 结构化处理 → 决策辅助"流水线, cron 负责定时触发, LLM 负责分析总结, 飞书负责推送展示
---

## 子任务1: 金融数据能力 — A股行情监控 + 财报追踪

> 来源：awesome-openclaw-usecases-zh 仓库
> - cn-a-share-monitor.md（A股每日行情监控）
> - earnings-tracker.md（AI 驱动的财报追踪器）

### 一、A股每日行情监控

#### 痛点
- 个人投资者每天花大量时间翻研报、盯行情、复盘，信息收集时间远超决策时间
- 盘前（外盘走势、事件日历）、盘中（板块异动、资金流向）、盘后（涨跌统计、技术指标）都需要关注

#### 方案架构

```
数据层 → 处理层 → 推送层
AKShare/MCP → OpenClaw Agent → 飞书/钉钉/企微
```

**两个可选方案：**

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| **MCP 服务** (mcp-cn-a-stock) | 无需写代码，自然语言查询个股 | 仅支持个股查询，无大盘/板块/资金流向；公共服务不稳定 | 快速验证，个股深度分析 |
| **AKShare + Python** | 接口全面（大盘/板块/资金/港股），灵活可控 | 需要写 Python 脚本 | 生产级监控，完整行情简报 |

#### 能力边界（社区实测）

| 场景 | 可靠性 | 说明 |
|------|--------|------|
| 行情数据采集 | ✅ 可靠 | AKShare 接口稳定，数据覆盖全面 |
| 数据整理推送 | ✅ 可靠 | 结构化输出 + 定时 cron 推送 |
| 技术指标计算 | ✅ 可靠 | MA/MACD/RSI 等基于公式计算，结果确定 |
| 舆情/新闻聚合 | ⚠️ 基本可用 | 依赖浏览器自动化，偶尔有反爬限制 |
| AI 买卖建议 | ❌ 不推荐 | LLM 延迟 2-5s，决策黑箱，不可解释 |

#### 所需依赖

```bash
# 核心数据源
pip install akshare

# MCP 方案（可选，替代 AKShare）
# 需 Python ≥ 3.12 + ta-lib C 库
# git clone https://github.com/elsejj/mcp-cn-a-stock.git
# python main.py --transport=http
```

#### 关键 AKShare 接口速查

| 接口 | 用途 | 备注 |
|------|------|------|
| `ak.stock_zh_a_spot_em()` | 全部 A 股实时行情 | ⚠️ 海外 IP 可能被拒 |
| `ak.stock_zh_a_hist()` | 个股历史日线 | 可取当日数据替代实时 |
| `ak.stock_zh_index_daily_em()` | 主要指数日线 | 可替代实时指数 |
| `ak.stock_hk_hist()` | 港股个股历史 | 港股覆盖 |
| `ak.stock_board_industry_name_em()` | 行业板块列表 | ⚠️ 海外 IP 可能被拒 |
| `ak.stock_hsgt_fund_flow_summary_em()` | 沪深港通资金流向 | |
| `ak.stock_market_activity_legu()` | 涨跌家数/涨停跌停 | |

#### Cron 配置建议

```
盘前简报：每个工作日 8:30（Asia/Shanghai）
- 隔夜美股三大指数涨跌
- A50 期货走势
- 今日重要事件日历（LPR 调整、IPO 申购等）

盘后复盘：每个工作日 15:30（Asia/Shanghai）
- 大盘指数涨跌 + 成交量变化
- 板块涨跌幅 TOP5
- 北向资金流向
- 自选股表现
```

#### 推送输出格式建议

```
📊 A股盘后复盘 | 2026-04-05（周五）

🔥 大盘指数
上证指数  3,258.67  +0.82%  成交额 4,523亿
深证成指  10,856.3  +1.15%  成交额 5,891亿
创业板指  2,156.89  +1.43%  成交额 2,345亿

📈 板块 TOP5
1. 半导体   +3.25%  北方华创/中芯国际领涨
2. 新能源   +2.87%  宁德时代/比亚迪活跃
3. 医药生物 +2.15%  ...
4. 计算机   +1.98%  ...
5. 电子     +1.76%  ...

💰 资金流向
北向资金：净流入 +56.3亿（沪股通 +28.1亿 / 深股通 +28.2亿）
主力净流入 TOP：贵州茅台 +12.3亿、宁德时代 +8.7亿

📋 自选股
600519 贵州茅台  +1.25%  1,856.00  成交量↑15%
300750 宁德时代  +2.30%  198.50    突破 MA20
000858 五粮液    +0.85%  156.30    RSI: 62
```

---

### 二、AI 驱动的财报追踪器

#### 痛点
- 财报季需要跟踪数十家公司的报告日期
- 多信息来源分散（公司公告、交易所、新闻解读）
- 容易错过关键发布时间

#### A股 vs 美股财报机制差异

| 维度 | 美股 | A股（更规范） |
|------|------|-------------|
| 财报日历 | 公司自行公布 | 交易所要求提前公布预约披露时间表 |
| 发布节奏 | 季报一次性 | **业绩预告 → 业绩快报 → 正式报告** 三阶段 |
| 数据获取 | 需付费 API | 免费开源（AKShare） |

> 关键洞察：A股的"业绩预告"阶段是美股没有的，可以提前获取信号。

#### 方案架构

```
定时扫描 → 筛选关注公司 → 用户确认 → 安排一次性 cron → 报告发布后搜索摘要 → 推送
```

#### 所需依赖

```bash
# 数据源（与行情监控共用）
pip install akshare

# 搜索能力（我们已有）
# web_search / Firecrawl
```

#### 关键 AKShare 财报接口

| 接口 | 用途 | 优势 |
|------|------|------|
| `ak.stock_yysj_em(date)` | 预约披露时间表 | **核心**，类似 earnings calendar |
| `ak.stock_yjyg_em()` | 业绩预告数据 | **提前信号**，美股无对应 |
| `ak.stock_yjkb_em()` | 业绩快报 | 快速业绩概览 |
| `ak.stock_yjbb_em()` | 正式业绩报表 | 完整财报数据 |

#### Cron 工作流

```
每周日 20:00 → 扫描下周预约披露时间表
            → 筛选关注公司 → 推送列表
            → 等用户确认

用户确认后  → 为每个披露日期安排一次性定时任务
            → 报告发布后自动搜索 + 摘要
            → 推送详细分析

额外：监控业绩预告 → 有预告即时通知（增量价值）
```

#### 输出格式建议

```
📅 财报追踪 | 下周预约披露（4.7 - 4.11）

| 公司 | 代码 | 预约时间 | 报告类型 | 上次业绩预告 |
|------|------|---------|---------|------------|
| 贵州茅台 | 600519 | 4/8 周二 | 一季报 | 净利润同比+15%~20% |
| 五粮液   | 000858 | 4/9 周三 | 一季报 | 暂无预告 |
| 中国平安 | 601318 | 4/10 周四 | 一季报 | 暂无预告 |

回复确认要跟踪的公司，我会自动安排提醒。
```

---

### 三、与我们现有能力的结合点

| 我们已有能力 | 结合方式 | 优先级 |
|------------|---------|--------|
| **cron 定时任务** | 直接用于盘前/盘后/周日扫描的自动化调度 | ⭐⭐⭐ 核心 |
| **飞书推送（message 工具）** | 替代 Telegram/钉钉作为推送渠道，支持富文本卡片 | ⭐⭐⭐ 核心 |
| **Firecrawl** | 抓取东方财富/巨潮资讯的财报详情页 | ⭐⭐ 可选 |
| **web_search** | 搜索财报解读、机构点评、市场反应 | ⭐⭐⭐ 核心 |
| **飞书任务（guid 已有）** | 将财报日历条目自动创建为飞书任务，跟踪进度 | ⭐⭐ 可选 |
| **daily-digest 技能** | 将盘前简报集成到每日早报中 | ⭐⭐⭐ 高优 |
| **exec + Python** | 运行 AKShare 脚本采集数据 | ⭐⭐⭐ 核心 |

#### 集成到 daily-digest 的方案

当前 daily-digest 已有安全简报 + 热榜 + 日程摘要，可以新增金融模块：

```
每日早报新增模块：
┌─────────────────────────────────┐
│ 💰 A股盘前简报                   │
│ 美股隔夜：道琼斯 +0.5% 纳斯达克 +0.8% │
│ A50期货：夜盘跌0.2%              │
│ 今日关注：LPR 公布、IPO 申购      │
│ 财报提醒：贵州茅台明日披露一季报    │
└─────────────────────────────────┘
```

---

### 四、具体落地步骤

#### Step 1：安装 AKShare

```bash
pip install akshare
```

#### Step 2：验证数据可用性

```python
# 快速测试脚本 scripts/test-akshare.py
import akshare as ak

# 测试 A 股实时行情
df = ak.stock_zh_a_spot_em()
print(f"A股总数: {len(df)}")
print(df.head(3)[["代码", "名称", "最新价", "涨跌幅"]])

# 测试指数数据
idx = ak.stock_zh_index_daily_em(symbol="sh000001")
print(f"上证指数最新: {idx.iloc[-1]}")

# 测试财报预约披露
yj = ak.stock_yysj_em(date="20260430")
print(f"预约披露: {len(yj)} 家公司")
```

#### Step 3：创建 A 股简报脚本框架

```python
#!/usr/bin/env python3
# scripts/a-share-daily.py
"""A股每日简报生成脚本"""
import akshare as ak
import json
import sys
from datetime import datetime

def get_market_overview():
    """大盘指数概览"""
    indices = {
        "上证指数": "sh000001",
        "深证成指": "sz399001",
        "创业板指": "sz399006",
    }
    result = {}
    for name, symbol in indices.items():
        df = ak.stock_zh_index_daily_em(symbol=symbol)
        latest = df.iloc[-1]
        prev = df.iloc[-2]
        change_pct = (latest["close"] - prev["close"]) / prev["close"] * 100
        result[name] = {
            "close": round(latest["close"], 2),
            "change_pct": round(change_pct, 2),
            "volume": latest.get("volume", 0),
        }
    return result

def get_board_ranking(top_n=5):
    """板块涨跌幅排行"""
    df = ak.stock_board_industry_name_em()
    df_sorted = df.sort_values(by="涨跌幅", ascending=False)
    return df_sorted.head(top_n)[["板块名称", "涨跌幅"]].to_dict("records")

def get_watchlist(stock_codes):
    """自选股行情"""
    all_stocks = ak.stock_zh_a_spot_em()
    watch = all_stocks[all_stocks["代码"].isin(stock_codes)]
    return watch[["代码", "名称", "最新价", "涨跌幅", "成交量", "换手率"]].to_dict("records")

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "overview"
    
    if mode == "overview":
        data = get_market_overview()
    elif mode == "board":
        data = get_board_ranking()
    elif mode == "watchlist":
        codes = sys.argv[2].split(",") if len(sys.argv) > 2 else ["600519", "300750", "000858"]
        data = get_watchlist(codes)
    
    print(json.dumps(data, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
```

#### Step 4：创建财报扫描脚本框架

```python
#!/usr/bin/env python3
# scripts/earnings-scan.py
"""A股财报预约披露扫描"""
import akshare as ak
import json
import sys
from datetime import datetime, timedelta

def scan_next_week():
    """扫描下周预约披露"""
    today = datetime.now()
    # 找到下周一到周五的日期
    next_monday = today + timedelta(days=(7 - today.weekday()))
    dates = [next_monday + timedelta(days=i) for i in range(5)]
    
    watchlist = ["600519", "000858", "601318", "000001"]  # 自定义
    
    results = []
    for date in dates:
        date_str = date.strftime("%Y%m%d")
        try:
            df = ak.stock_yysj_em(date=date_str)
            if not df.empty:
                matched = df[df["股票代码"].isin(watchlist)]
                for _, row in matched.iterrows():
                    results.append({
                        "code": row.get("股票代码", ""),
                        "name": row.get("股票简称", ""),
                        "date": row.get("首次预约时间", ""),
                        "report_type": row.get("报告类型", ""),
                    })
        except Exception as e:
            print(f"Error scanning {date_str}: {e}", file=sys.stderr)
    
    return results

def check_earnings_preview():
    """检查最新的业绩预告"""
    df = ak.stock_yjyg_em()
    watchlist = ["600519", "000858", "601318", "000001"]
    if not df.empty and "股票代码" in df.columns:
        matched = df[df["股票代码"].isin(watchlist)]
        return matched.head(10).to_dict("records")
    return []

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "scan"
    if mode == "scan":
        results = scan_next_week()
    elif mode == "preview":
        results = check_earnings_preview()
    print(json.dumps(results, ensure_ascii=False, indent=2))
```

#### Step 5：配置 OpenClaw Cron 任务

```
# 盘前简报（工作日 8:30）
cron: 30 8 * * 1-5
task: 运行 python scripts/a-share-daily.py overview，整理为飞书消息推送

# 盘后复盘（工作日 15:30）
cron: 30 15 * * 1-5
task: 运行大盘+板块+自选股数据采集，整理结构化简报推送飞书

# 财报周报（每周日 20:00）
cron: 0 20 * * 0
task: 运行 python scripts/earnings-scan.py，推送下周财报日历

# 业绩预告监控（每日 10:00）
cron: 0 10 * * 1-5
task: 运行 python scripts/earnings-scan.py preview，有新预告时推送
```

#### Step 6：与飞书推送集成

由于我们已有飞书 channel 推送能力，可以直接使用 message 工具发送到指定群聊/个人。关键要点：

1. **推送目标**：Ray 的飞书私聊，或创建专门的"投资简报"群
2. **消息格式**：使用飞书消息卡片的富文本格式，更易读
3. **任务跟踪**：财报日历条目可自动创建为飞书任务（已有 guid）

---

### 五、注意事项

1. **海外服务器限制**：部分 AKShare 接口（依赖东方财富）从海外 IP 调用可能被拒。我们的 WSL 环境在国内网络下应该没问题
2. **接口频率**：AKShare 底层依赖公开网站，高频调用可能被限速。每天几次完全没问题
3. **不要依赖 AI 做交易决策**：把 OpenClaw 当信息收集工具，决策留给人
4. **合规**：数据仅供个人学习研究，不构成投资建议
5. **AKShare 版本更新**：接口可能因上游变更而需更新，关注其 GitHub Issues

---

### 六、优先级与下一步

| 步骤 | 工作量 | 价值 | 建议 |
|------|--------|------|------|
| 安装 AKShare + 验证数据 | 10min | ⭐⭐⭐ | **立即做** |
| 盘后复盘脚本 | 30min | ⭐⭐⭐ | **本周完成** |
| 集成到 daily-digest | 20min | ⭐⭐⭐ | **本周完成** |
| 财报周报扫描 | 30min | ⭐⭐ | 下周 |
| 盘前简报 | 30min | ⭐⭐ | 下周 |
| 自选股技术指标 | 1h | ⭐ | 按需 |
| MCP 服务接入 | 30min | ⭐ | 按需（个股深度分析场景） |

---

## 子任务2: 竞品监控系统 — 竞争对手分析 + 价格监控

> 来源：[awesome-openclaw-usecases-zh/competitive-intelligence](https://github.com/AlexAnys/awesome-openclaw-usecases-zh/blob/main/usecases/competitive-intelligence.md)
> 学习日期：2026-04-05

### 2.1 核心价值主张

**一句话**：用 Firecrawl + Tavily 替代 $150/月的竞品分析 SaaS 订阅，将每周 10 小时人工调研压缩到 6 分钟自动化。

**两种运行模式**：
- **周报模式**：每周自动扫描竞品列表，输出定价变动、功能更新、内容策略
- **专题模式**：针对特定话题（如"竞品 AI 功能上线"）即时深度分析

### 2.2 痛点分析

| 痛点 | 表现 | 本方案解决方式 |
|------|------|---------------|
| **SaaS 订阅贵** | Semrush/SimilarWeb/Crayon $150+/月，大部分功能用不到 | Firecrawl + Tavily 免费层基本够用，月成本约 $1.2 |
| **人工调研累** | 手动浏览竞品博客、定价页、更新日志，耗时 10h/周 | 自动化爬取 + AI 分析，6 分钟出报告 |
| **监控容易断** | 忙起来就忘了看竞品，重要功能上线一个月后才知道 | cron 定时执行，每周自动推送 |
| **情报非结构化** | 看到的信息散落在浏览器标签页里，没法沉淀 | JSON 结构化输出 → 飞书多维表格持久存储 |

### 2.3 方案架构（适配我们工具栈）

原文方案用 Perplexity MCP + Firecrawl MCP。**我们的适配**：

| 原文组件 | 我们的替代 | 说明 |
|----------|-----------|------|
| Perplexity MCP | **Tavily API** | AI 优化搜索，国内稳定，结果质量高 |
| Firecrawl MCP | **Firecrawl API** | 网页抓取与结构化提取 |
| OpenClaw cron | **openclaw cron** | 每周一 9:00 自动触发 |
| 飞书 Webhook | **飞书多维表格 + message 推送** | 报告存多维表格，关键变动推飞书群 |

**数据流**：
```
cron 触发 → Tavily 搜索竞品近 7 天动态 → Firecrawl 抓取定价页/changelog
  → AI 分析对比 → 结构化数据写入飞书多维表格 → 关键变动推飞书群
```

### 2.4 具体落地步骤

#### Step 1: 创建竞品监控列表

文件：`~/.openclaw/workspace/research/competitor-watchlist.md`

```markdown
# 竞品监控列表

## 直接竞品
- 竞品A — https://example-a.com — pricing: /pricing, changelog: /changelog
- 竞品B — https://example-b.com — pricing: /pricing, changelog: /blog

## 间接竞品
- 竞品C — https://example-c.com — pricing: /pricing

## 监控重点
- 定价页变动（/pricing）
- 产品更新日志（/changelog, /blog）
- 新功能公告
- 招聘动态（反映战略方向）
```

#### Step 2: 创建飞书多维表格

表名：`竞品监控周报`

| 字段名 | 类型 | 说明 |
|--------|------|------|
| 竞品名称 | 文本 | CompanyA |
| 监控日期 | 日期 | 2026-04-05 |
| 变动类型 | 单选 | 定价变动 / 新功能 / 内容策略 / 招聘动态 / 其他 |
| 变动摘要 | 文本 | 专业版从 $49 降至 $39 (-20%) |
| 来源 URL | 超链接 | https://... |
| 优先级 | 单选 | HIGH / MEDIUM / LOW |
| 建议行动 | 文本 | 评估是否跟进降价 |

#### Step 3: Firecrawl 爬取策略

```bash
# 抓取定价页（提取价格信息）
curl -X POST "https://api.firecrawl.dev/v1/scrape" \
  -H "Authorization: Bearer $FIRECRAWL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://competitor.com/pricing",
    "formats": ["markdown", "html"],
    "onlyMainContent": true
  }'

# 批量抓取多个竞品（用 batch/scrape）
curl -X POST "https://api.firecrawl.dev/v1/batch/scrape" \
  -H "Authorization: Bearer $FIRECRAWL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://competitor-a.com/pricing",
      "https://competitor-a.com/changelog",
      "https://competitor-b.com/pricing"
    ]
  }'
```

#### Step 4: Tavily 搜索策略

```bash
# 搜索竞品近 7 天动态
curl -X POST "https://api.tavily.com/search" \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "$TAVILY_API_KEY",
    "query": "CompanyA 产品更新 功能发布 pricing 2026",
    "search_depth": "advanced",
    "include_answer": true,
    "max_results": 5,
    "days": 7
  }'
```

#### Step 5: 定时任务设置

```bash
openclaw cron add \
  --name "competitive-weekly" \
  --cron "0 9 * * 1" \
  --tz "Asia/Shanghai" \
  --session isolated \
  --message "执行竞品周报：读取 competitor-watchlist.md，用 Tavily 搜索 + Firecrawl 抓取各竞品动态，分析后写入飞书多维表格，关键变动推飞书群"
```

### 2.5 OpenClaw Agent 脚本框架

```python
#!/usr/bin/env python3
"""
竞品监控 Agent — 每周自动执行

流程：
1. 读取竞品列表 (competitor-watchlist.md)
2. Tavily 搜索每个竞品近 7 天动态
3. Firecrawl 抓取定价页 + changelog
4. AI 对比分析，识别变动和差距
5. 结构化数据写入飞书多维表格
6. 关键变动推飞书群
"""
import json, os, requests
from datetime import datetime, timedelta

TAVILY_KEY = os.environ["TAVILY_API_KEY"]
FIRECRAWL_KEY = os.environ["FIRECRAWL_API_KEY"]
WATCHLIST_PATH = os.path.expanduser(
    "~/.openclaw/workspace/research/competitor-watchlist.md"
)

def tavily_search(company_name: str, days: int = 7) -> dict:
    """搜索竞品近期动态"""
    resp = requests.post("https://api.tavily.com/search", json={
        "api_key": TAVILY_KEY,
        "query": f"{company_name} 产品更新 新功能 定价 pricing",
        "search_depth": "advanced",
        "include_answer": True,
        "max_results": 5,
        "days": days,
    })
    return resp.json()

def firecrawl_scrape(url: str) -> str:
    """抓取网页内容"""
    resp = requests.post("https://api.firecrawl.dev/v1/scrape", headers={
        "Authorization": f"Bearer {FIRECRAWL_KEY}",
        "Content-Type": "application/json",
    }, json={
        "url": url,
        "formats": ["markdown"],
        "onlyMainContent": True,
    })
    return resp.json().get("data", {}).get("markdown", "")

def parse_watchlist(path: str) -> list[dict]:
    """解析竞品监控列表"""
    competitors = []
    with open(path) as f:
        lines = f.readlines()
    current_section = "direct"
    for line in lines:
        if "直接竞品" in line: current_section = "direct"
        elif "间接竞品" in line: current_section = "indirect"
        elif line.strip().startswith("- "):
            parts = [p.strip() for p in line.split("—")]
            if len(parts) >= 2:
                competitors.append({
                    "name": parts[0].replace("- ", ""),
                    "url": parts[1],
                    "category": current_section,
                })
    return competitors

if __name__ == "__main__":
    competitors = parse_watchlist(WATCHLIST_PATH)
    report_date = datetime.now().strftime("%Y-%m-%d")
    all_findings = []

    for comp in competitors:
        search = tavily_search(comp["name"])
        pricing = firecrawl_scrape(comp["url"] + "/pricing")
        changelog = firecrawl_scrape(comp["url"] + "/changelog")
        # AI 分析部分交给 OpenClaw Agent 内置 LLM 处理
        all_findings.append({
            "competitor": comp["name"],
            "search_result": search,
            "pricing_content": pricing[:2000],
            "changelog_content": changelog[:2000],
        })

    # 写入飞书多维表格 + 推送飞书群（通过 OpenClaw 工具）
    print(json.dumps(all_findings, ensure_ascii=False, indent=2))
```

### 2.6 竞品周报输出格式

**飞书群推送卡片格式**：

```
📋 竞品周报 — 2026-04-07

⚠️ HIGH PRIORITY
├─ CompanyA: 专业版 $49→$39 (-20%)，评估跟进降价
└─ CompanyB: 上线 AI 自动摘要，我们开发中考虑提前发布

📝 常规动态
├─ CompanyA: 发布 3 篇企业安全博客
├─ CompanyB: 招聘 3 名 Go 工程师，疑似基础设施重构
└─ CompanyC: 新增 SOC 2 合规认证页

🔍 内容差距
├─ "SOC 2 合规" — 2 个竞品覆盖，我们未涉及
└─ "数据驻留" — 1 个竞品覆盖，我们未涉及

💡 本周建议
1. 跟进 CompanyA 降价策略，评估影响
2. 加速 AI 摘要功能开发
3. 产出企业安全方向内容
```

**飞书多维表格记录示例**：

| 竞品名称 | 监控日期 | 变动类型 | 变动摘要 | 优先级 | 建议行动 |
|----------|----------|----------|----------|--------|----------|
| CompanyA | 2026-04-07 | 定价变动 | 专业版 $49→$39 (-20%) | HIGH | 评估跟进降价 |
| CompanyA | 2026-04-07 | 新功能 | 上线 AI 自动摘要 | MEDIUM | 考虑提前发布 |
| CompanyB | 2026-04-07 | 内容策略 | 发布 3 篇企业安全博客 | LOW | 产出对标内容 |
| CompanyB | 2026-04-07 | 招聘动态 | 招 3 名 Go 工程师 | LOW | 持续关注 |
| CompanyC | 2026-04-07 | 合规认证 | 新增 SOC 2 页面 | LOW | 评估合规需求 |

### 2.7 "先窄后宽"实施路径评估

| 阶段 | 时间 | 范围 | 目标 |
|------|------|------|------|
| **MVP** | 第 1 周 | 2-3 个直接竞品 | 跑通全流程：搜索→抓取→分析→推送 |
| **扩展** | 第 2-3 周 | 5 个竞品（含 1-2 个间接）| 加入多维表格存储、历史对比 |
| **成熟** | 第 4 周+ | 8-10 个竞品 + 专题模式 | 加入招聘监控、内容差距自动识别 |

**MVP 阶段具体任务**：
1. 确认 2-3 个直接竞品 + 对应监控 URL
2. 创建 competitor-watchlist.md
3. 创建飞书多维表格（字段定义见 2.4）
4. 手动跑一次 Tavily + Firecrawl 流程验证
5. 设置 cron 定时任务
6. 验证飞书推送效果

**成本评估**：
- Tavily：每次搜索约 $0.01，5 个竞品 × 2 次 = $0.10/周
- Firecrawl：每次抓取 $0.01，5 个竞品 × 2 页 = $0.10/周
- 月成本：约 $0.80，远低于 $150+ 的 SaaS 订阅

### 2.8 关键设计决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 搜索工具 | Tavily（非 Perplexity）| 国内稳定，API 设计对 AI 友好 |
| 爬取工具 | Firecrawl API | 支持 JS 渲染页面，批量抓取 |
| 存储方案 | 飞书多维表格 | 团队可协作，支持筛选/视图/历史 |
| 推送渠道 | 飞书群 + 多维表格 | 高优推群即时通知，全量存表备查 |
| 分析方式 | OpenClaw Agent 内置 LLM | 无需额外 API 调用，分析深度可控 |
| 触发方式 | openclaw cron | 原生集成，独立会话防上下文污染 |

### 2.9 原文的实用建议（值得记住）

1. **定价页是金矿** — 竞品定价变动比功能更新更能反映战略方向
2. **招聘信息是情报** — 招什么人暗示未来 3-6 个月的产品方向
3. **内容差距 = 机会** — 竞品覆盖了我们没涉及的 topic，就是内容策略的机会窗口
4. **降价 >10% 标记为 HIGH PRIORITY** — 这类变动需要立即评估和响应
5. **输出必须可行动** — 每个发现都要有建议行动，不能只是信息堆砌

### 2.10 与国内数据源的扩展可能

原文提到的国内补充数据源：
- **百度指数**（index.baidu.com）：品牌词搜索趋势
- **微信指数**：微信生态声量
- **巨量算数**（trendinsight.oceanengine.com）：抖音/头条数据
- **天眼查/企查查**：融资、人员变动、专利申请
- **36氪/IT桔子**：行业新闻和融资

> 扩展建议：MVP 阶段先不加这些，等基础流程跑顺后再考虑接入。

### 2.11 小结

这个用例的价值在于：**用 $1.2/月替代 $150+/月**，核心工具链 Tavily + Firecrawl 我们已经具备。实施路径清晰（先窄后宽），MVP 一周可完成。飞书多维表格 + 群推送的存储与通知方案与我们现有工具栈高度匹配。

---

## 子任务4: 基础设施增强 — 服务器自愈 + n8n编排

> **分析日期**: 2026-04-05 | **相关任务 GUID**: `99bd4c71-e756-44ac-bacf-d05a63470b83`
> **已有基础设施**: WSL2 Linux (systemd) + SSH + cron + 心跳机制 + OpenClaw subagent + 飞书推送

---

### 4.1 自愈式家庭服务器

#### 4.1.1 用例核心思路

将 OpenClaw 变成持久运行的基础设施智能体，拥有 SSH 访问权限、自动化定时任务，能在人发现之前就检测、诊断和修复问题。原文基于 Nathan 的"Reef"智能体实践：15 个活跃定时任务、24 个自定义脚本、K3s 集群管理、1Password 集成。

#### 4.1.2 健康检查项（从用例提取 + 我们的适配）

| 检查项 | 原文提及 | 我们 WSL2 环境实现方式 | 阈值建议 |
|--------|---------|---------------------|---------|
| **磁盘空间** | ✅ 晨间简报中检查 | `df -h` + cron | 根分区 > 85% 告警，> 90% 自动清理 |
| **CPU 使用率** | ✅ 晨间简报中检查 | `top -bn1` 或 `/proc/loadavg` | load average > CPU 核数 × 2 告警 |
| **内存使用率** | ✅ 晨间简报中检查 | `free -m` | 可用 < 500MB 告警 |
| **网络连通性** | ✅ 监控服务端点 | ping 网关 + curl 检测 | 连续 3 次失败告警 |
| **Docker 容器** | ✅ Pod 崩溃循环 | `docker ps -a` + 健康检查 | 非运行容器告警 |
| **systemd 服务** | ⚠️ 未提及（原用 Kubernetes） | `systemctl is-active` | 关键服务异常告警 |
| **OpenClaw 自身** | ✅ `openclaw doctor` | 心跳机制已覆盖 | 心跳连续 2 次失败告警 |
| **安全审计** | ✅ 每日自动扫描 | TruffleHog/gitleaks | 硬编码密钥检测 |

#### 4.1.3 故障诊断逻辑

```
健康检查失败
  ├─ 第 1 次：记录日志，等待复检
  ├─ 第 2 次（15分钟后）：触发飞书告警
  ├─ 第 3 次：启动自动修复流程
  │    ├─ 磁盘满 → 清理 docker 镜像/日志/apt 缓存
  │    ├─ 服务挂 → systemctl restart
  │    ├─ 网络断 → 重启 systemd-networkd / resolvectl flush
  │    └─ 内存溢 → 检查 OOM 日志，尝试重启最大内存进程
  └─ 修复失败 → 升级告警 + 记录详细诊断信息
```

#### 4.1.4 安全边界（原文重点强调）

1. **密钥硬编码是头号风险** — 原作者第一天就遭遇 API 密钥泄露
2. **Pre-push hooks** — 所有仓库安装 TruffleHog 或 gitleaks
3. **凭证隔离** — 专用 vault（如 1Password AI vault），只读访问
4. **最小权限** — 能读不写，能用 sudo 就不用 root
5. **变更审计** — 所有基础设施变更记录到日志文件
6. **本地优先 Git** — 不让 agent 直接推公共仓库

#### 4.1.5 WSL2 适配评估

| 原文能力 | WSL2 可行性 | 备注 |
|---------|------------|------|
| SSH 远程管理 | ✅ 可用（sshd 可在 WSL2 启动） | 主要用于管理 WSL2 内部，跨机器较少 |
| Kubernetes (k3s) | ⚠️ 可装但意义不大 | WSL2 单机环境，Docker Compose 更合适 |
| Terraform/Ansible | ⚠️ 过重 | 单机不需要 IaC，直接脚本管理 |
| systemd 服务管理 | ✅ 完美匹配 | WSL2 已启用 systemd |
| Docker 容器管理 | ✅ 完美匹配 | Docker Desktop 集成 WSL2 |
| 定时任务 (cron) | ✅ 完美匹配 | systemd timer 或 cron 都可用 |
| 晨间简报 | ✅ 已有心跳机制 | 扩展心跳内容即可 |

**结论**: WSL2 + systemd 环境下，建议跳过 K8s/IaC 层，直接用 Docker Compose + systemd + bash 脚本组合，轻量高效。

#### 4.1.6 健康检查脚本框架

> 完整脚本保存至 `~/scripts/server-health-check.sh`。包含磁盘/CPU/内存/网络/Docker/systemd 服务六项检查，支持 `--fix` 模式自动修复（清理磁盘、重启服务），支持飞书 webhook 告警。

#### 4.1.7 cron 配置

```cron
# 每 15 分钟健康检查（仅检查+告警）
*/15 * * * * rays /home/rays/scripts/server-health-check.sh

# 每天凌晨 3 点健康检查 + 自动修复
0 3 * * * rays /home/rays/scripts/server-health-check.sh --fix

# 每周一凌晨 4 点深度清理
0 4 * * 1 rays docker system prune -af && journalctl --vacuum-size=200M
```

---

### 4.2 n8n 工作流编排

#### 4.2.1 用例核心思路

OpenClaw 不直接持有 API 凭证，而是通过 webhook 调用 n8n 工作流，n8n 再调用外部服务。三重收益：可观测性（可视化 UI）、安全性（凭据隔离）、性能（确定性工作流不消耗 LLM token）。

#### 4.2.2 架构模式

```
OpenClaw (智能体)
    │  HTTP POST (JSON payload, 无凭证)
    ▼
n8n 工作流 (webhook 触发, 已锁定)
    │  API 调用 (凭证存在 n8n 凭证库中)
    ▼
外部服务 (Slack / GitHub / 邮件 / 飞书 / ...)
```

#### 4.2.3 Webhook 触发模式

| 模式 | 触发方式 | 适用场景 | 示例 |
|------|---------|---------|------|
| **Agent → n8n** | OpenClaw 主动 POST webhook | 需要调用外部 API 时 | 发飞书消息、创建 GitHub issue |
| **外部 → n8n → Agent** | n8n 收到外部 webhook 后回调 OpenClaw | 需要监听外部事件时 | GitHub PR 触发通知 |
| **定时触发** | n8n 内置 cron 节点 | 定期执行的确定性任务 | 每日数据汇总 |

#### 4.2.4 凭证隔离方案

- n8n 凭证库（加密存储，UI 管理）存放所有第三方 API 密钥
- OpenClaw 环境变量仅存 n8n 地址，无任何第三方凭证
- 智能体永远看不到 API 密钥

#### 4.2.5 与 OpenClaw 的集成方式

1. **Agent 设计工作流** → 自然语言描述，OpenClaw 调用 n8n API 创建工作流
2. **用户添加凭证** → 在 n8n UI 手动添加 API 密钥
3. **锁定工作流** → 防止 agent 修改
4. **Agent 调用 webhook** → `curl -X POST http://n8n:5678/webhook/{name}`

#### 4.2.6 WSL2 + Docker 部署方案

```yaml
# docker-compose.yml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER:-admin}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASS:-changeme}
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
      - GENERIC_TIMEZONE=Asia/Shanghai
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - openclaw-net
volumes:
  n8n_data:
networks:
  openclaw-net:
    driver: bridge
```

启动: `mkdir -p ~/projects/n8n-stack && cd ~/projects/n8n-stack && docker-compose up -d`

#### 4.2.7 与我们现有架构的集成点

| 现有能力 | n8n 可增强的方向 | 优先级 |
|---------|----------------|-------|
| 飞书推送（webhook URL） | 将飞书凭证移入 n8n，统一管理 | ⚪ 可选（当前方式已够用） |
| 心跳机制 | 心跳异常时触发 n8n 告警工作流 | ⚪ 可选 |
| cron 定时任务 | 用 n8n 替代部分 cron，可视化 + 可审计 | 🟡 中期考虑 |
| 无外部 API 凭证管理 | 新增外部集成时通过 n8n 隔离凭证 | 🟢 **推荐** |
| OpenClaw subagent | subagent 调用 n8n webhook 完成确定性任务 | 🟢 **推荐** |

#### 4.2.8 关键洞察总结

- **测试后锁定是关键** — 不锁定工作流，agent 可能悄悄修改 API 交互方式
- **n8n 有 400+ 集成节点** — 大多数外部服务不需要写自定义 API 调用
- **确定性任务不该消耗 LLM token** — 发邮件、更新表格这类任务用 n8n 工作流更高效
- **免费审计追踪** — n8n 记录每次执行的输入/输出，天然可审计

---

### 4.3 综合落地路线图

#### 第一阶段：轻量自愈（1-2 天）

1. 部署 `server-health-check.sh` 到 `~/scripts/`
2. 配置 cron 每 15 分钟检查
3. 集成飞书告警（使用现有 webhook 机制）
4. 扩展心跳简报，增加系统健康信息

#### 第二阶段：凭证隔离（按需）

1. Docker Compose 部署 n8n
2. 设计第一个工作流（如飞书消息发送）
3. 遵循「设计 → 添加凭证 → 锁定 → 调用」四步流程
4. 将凭证从 OpenClaw 环境变量迁移到 n8n 凭证库

#### 第三阶段：工作流编排（渐进）

1. 将 cron 中确定性任务迁移到 n8n
2. 建立 subagent → n8n webhook 的调用模式
3. 添加外部事件监听（GitHub webhook → n8n → OpenClaw）

---

### 4.4 安全边界和最佳实践

| 类别 | 建议 | 优先级 |
|------|------|-------|
| **密钥管理** | 安装 gitleaks，配置 pre-commit hook | 🔴 必须 |
| **凭证隔离** | 第三方 API 密钥走 n8n，不放 OpenClaw 环境 | 🟡 推荐 |
| **最小权限** | 健康检查脚本不使用 root，需要时用 sudo 具名命令 | 🟡 推荐 |
| **变更审计** | 所有基础设施变更写入 `~/logs/infra-changes.md` | 🟡 推荐 |
| **工作流锁定** | n8n 工作流构建完成后立即锁定 | 🔴 必须 |
| **修复边界** | 自动修复仅限: 清理磁盘、重启服务、刷新网络 | 🔴 必须 |
| **升级告警** | 修复失败后不重试，立即通知人工 | 🔴 必须 |
| **定期审查** | 每周检查 cron 日志和 n8n 执行记录 | ⚪ 建议 |

---

## 子任务5: 多智能体内容工厂 + 个人知识库(RAG) + 市场调研与产品工厂

> **分析日期**: 2026-04-05
> **原文来源**: awesome-openclaw-usecases-zh/usecases/
> - content-factory.md（多智能体内容工厂）
> - knowledge-base-rag.md（个人知识库 RAG）
> - market-research-product-factory.md（市场调研与产品工厂）

---

### 一、多智能体内容工厂

#### 1.1 痛点分析

| 痛点 | 表现 | 原文解决方式 |
|------|------|------------|
| **三阶段手动操作** | 调研→写作→设计，每步需数小时，逐一提示 AI 工具 | 三个专用 Agent 链式流水线，前一步输出自动作为后一步输入 |
| **内容选题焦虑** | 每天不知道写什么，手动刷热搜/竞品 | 调研 Agent 每天自动扫描热点 + 竞品内容 + 社交媒体表现 |
| **产出不稳定** | 依赖个人状态，忙起来断更 | cron 定时触发，醒来就有草稿 |
| **多平台适配难** | YouTube/Twitter/LinkedIn/博客格式各不同 | 写作 Agent 按平台格式输出，一键切换 |

#### 1.2 方案架构

原文基于 Discord 频道隔离各 Agent 的工作空间：

```
cron 每天 8:00
  ├─ 调研 Agent (#research)
  │    → 扫描热门故事 + 竞品内容 + 社交媒体趋势
  │    → 输出 Top 5 内容机会（含来源）
  ├─ 写作 Agent (#scripts)
  │    → 选取最佳创意，撰写完整草稿
  │    → 格式按平台适配（推文串/视频脚本/新闻简报）
  └─ 缩略图 Agent (#thumbnails)
       → AI 生成封面图/缩略图
       → 本地模型（Nano Banana）或 API
```

**核心设计：链式 Agent** — 调研驱动写作，写作驱动设计，无需人工串联。

#### 1.3 所需依赖

| 依赖项 | 用途 | 我们现有对应 |
|--------|------|------------|
| Discord 集成 + 多频道 | Agent 工作空间隔离 | ✅ **飞书群 + 多话题** 可完全替代 |
| `sessions_spawn` / subagent | 多 Agent 编排 | ✅ **已有 subagent 编排能力** |
| x-research-v2 或社交媒体调研 | 热点扫描 | ✅ **firecrawl-search + daily-hot-news + web_search** |
| 图像生成 API / 本地模型 | 缩略图生成 | ⚠️ 需额外配置图像生成能力 |
| knowledge-base 技能（可选） | RAG 驱动调研 | ✅ **OpenViking 语义记忆可替代** |
| cron 定时触发 | 自动化运行 | ✅ **openclaw cron 已有** |

#### 1.4 适配我们的工具栈

| 原文组件 | 我们的替代方案 | 优势 |
|----------|------------|------|
| Discord 频道 | 飞书群 + 话题(thread) | 更符合国内使用习惯，支持富文本 |
| 调研 Agent | subagent + firecrawl-search + daily-hot-news | 热榜数据更丰富（54 个平台） |
| 写作 Agent | subagent + 飞书文档输出 | 写完直接存飞书文档，方便审阅 |
| 缩略图 Agent | 需补充图像生成能力 | 可先用飞书图片占位，后续接入 DALL-E/MidJourney |
| 链式编排 | ClawFlow 或 subagent 顺序调用 | ClawFlow 支持流身份 + 等待 + 输出 |

#### 1.5 落地步骤

```
Phase 1 — 研究报告工厂（1 天）
1. 定义 subagent 任务模板：研究 Agent 扫描热点→写作 Agent 产出报告
2. 用 ClawFlow 编排两个 subagent 的串联流水线
3. cron 每早 8:00 触发
4. 输出到飞书文档

Phase 2 — 技术内容适配（2-3 天）
1. 调研 Agent 加入 firecrawl 深度爬取（竞品博客、GitHub trending）
2. 写作 Agent 输出格式适配（技术周报/研究报告/竞品分析）
3. 加入 OpenViking 记忆：历史产出索引，避免重复选题

Phase 3 — 视觉素材（按需）
1. 接入图像生成 API（OpenAI DALL-E 或本地 Stable Diffusion）
2. 封面图自动生成 + 飞书文档插入
```

#### 1.6 关键洞察

1. **链式 Agent > 单 Agent** — 拆分调研/写作/设计让每个 Agent 专注一件事，质量更高
2. **频道隔离 = 可审阅** — 每个 Agent 产出在独立空间，方便审阅和反馈
3. **cron + 链式 = 零干预** — 定时触发 + Agent 串联 = 醒来就有半成品
4. **平台适配是配置问题不是能力问题** — 写作 Agent 的输出格式是 prompt 层面的切换

---

### 二、个人知识库（RAG）

#### 2.1 痛点分析

| 痛点 | 表现 |
|------|------|
| **信息碎片化** | 文章/推文/视频散落在浏览器书签、微信收藏、笔记应用中，无法统一搜索 |
| **书签坟墓** | 收藏了上千条链接但从不回顾，找东西全靠记忆 |
| **语义搜索缺失** | 传统书签只能按标题/标签搜索，无法按"我上次看到关于 agent memory 的内容"这种语义查询 |
| **跨工作流联动** | 其他工作流（内容创作/会议准备）无法自动利用已保存的知识 |

#### 2.2 方案架构

原文基于 knowledge-base skill 构建 RAG 系统：

```
URL 输入 → 内容抓取 (web_fetch) → 分块 (chunking) → 向量化 (embedding)
  → 向量存储 → 语义搜索 → 排序结果 + 来源引用
```

**两种实现路径**：
1. **knowledge-base skill**（开箱即用，ClawdHub 安装）
2. **自建 RAG**（embedding + 向量数据库，完全可控）

#### 2.3 OpenViking vs knowledge-base skill 对比分析

| 维度 | OpenViking（我们已有） | knowledge-base skill | 自建 RAG |
|------|---------------------|---------------------|----------|
| **安装成本** | ✅ 已内置，零配置 | 需从 ClawdHub 安装 | 需搭建 embedding + 向量数据库 |
| **语义搜索** | ✅ memory_recall 支持语义搜索 | ✅ 内置向量搜索 | ✅ 取决于 embedding 模型 |
| **内容摄入** | ⚠️ memory_store 文本输入，无自动 URL 抓取 | ✅ URL → 自动抓取→分块→向量化 | ✅ 完全自定义 |
| **存储粒度** | ⚠️ 以"记忆"为单位，非文档片段 | ✅ 文档级分块 (chunking) | ✅ 完全可控 |
| **来源追溯** | ✅ URI + score | ✅ 返回 URL + 片段 | ✅ 完全可控 |
| **记忆管理** | ✅ memory_forget 支持删除 | ⚠️ 未知 | ✅ 完全可控 |
| **与 LLM 集成** | ✅ 无缝集成（OpenClaw 原生） | ✅ OpenClaw skill 集成 | ⚠️ 需自定义集成 |
| **跨工作流联动** | ✅ 任何 Agent 都可调用 memory_recall | ✅ 任何 Agent 都可查询 | ⚠️ 需 API 封装 |
| **数据持久性** | ✅ OpenViking 后端持久化 | ⚠️ 取决于 skill 实现 | ✅ 完全可控 |
| **内容类型支持** | ⚠️ 文本为主，PDF/图片需预处理 | ✅ URL 自动识别（文章/推文/YouTube/PDF） | ✅ 完全自定义 |
| **批量导入** | ⚠️ 逐条 memory_store | ✅ 批量 URL 摄入 | ✅ 完全自定义 |

**结论**：

- **OpenViking 的优势**：已内置、语义搜索质量好、与 OpenClaw 深度集成、记忆管理完善
- **OpenViking 的差距**：缺少自动 URL 摄入（需手动 memory_store）、非文档级分块存储
- **knowledge-base skill 的优势**：URL → 自动抓取→分块→向量化的完整 RAG 管线
- **推荐策略**：**OpenViking 为主 + 补充自动摄入脚本**。用 OpenViking 做语义搜索和记忆管理，写一个轻量脚本自动抓取 URL 并调用 memory_store 摄入

#### 2.4 增强方案：OpenViking + 自动摄入

```
"收藏"工作流：
1. 用户在飞书发送 URL → Agent 自动 web_fetch 抓取内容
2. 提取标题 + 正文摘要 + 关键信息
3. 调用 memory_store(text=...) 摄入
4. 回复确认：已摄入 XX 篇内容，包含关键词 YY

"查询"工作流：
1. 用户提问 → memory_recall 语义搜索
2. 返回相关记忆 + 来源
3. 如需深度阅读，从 memory 中提取原始 URL 再抓取完整内容
```

#### 2.5 与现有能力的结合点

| 现有能力 | 结合方式 |
|---------|---------|
| **OpenViking 语义记忆** | 作为 RAG 核心存储和搜索引擎 |
| **web_fetch / firecrawl** | URL 内容抓取，补充自动摄入能力 |
| **飞书文档** | 知识沉淀输出，研究报告存储 |
| **memory_search** | 本地 MEMORY.md + memory/*.md 补充搜索 |
| **lark-knowledge-sync** | 飞书知识库双向同步，知识归档 |

#### 2.6 落地步骤

```
Phase 1 — 利用已有能力（立即）
1. 建立飞书"知识收藏"话题或群
2. 发送 URL → Agent 自动抓取 + memory_store
3. memory_recall 查询已保存知识

Phase 2 — 结构化增强（1-2 天）
1. 摄入时自动提取：标题、来源、类型、日期、标签
2. 定期（每周）整理 memory，归档到飞书知识库
3. 建立分类索引（技术/AI/产品/行业）

Phase 3 — 跨工作流联动（按需）
1. 内容工厂调研时自动查询知识库
2. 会议准备前自动搜索相关知识
3. 学习笔记自动归档到知识库
```

---

### 三、市场调研与产品工厂

#### 3.1 痛点分析

| 痛点 | 表现 | 原文解决方式 |
|------|------|------------|
| **不知道做什么产品** | 创业最大难题：在"做什么"上纠结数月 | 自动挖掘用户真实痛点，从痛点中发现机会 |
| **市场调研耗时** | 手动浏览论坛/社交媒体/评论网站，数小时起步 | Last 30 Days skill 自动扫描 Reddit/X 过去 30 天讨论 |
| **需求验证难** | 调查问卷数据经过美化，不反映真实情绪 | 直接从用户吐槽/抱怨中挖掘，数据真实未过滤 |
| **从调研到产品断裂** | 调研完不知道下一步，执行力跟不上 | 调研→选痛点→构建 MVP，一条龙完成 |

#### 3.2 方案架构

```
阶段 1: 痛点挖掘
  Last 30 Days skill → 扫描 Reddit/X 过去 30 天讨论
  → 提取：Top 痛点（按频次排序）、具体抱怨、功能请求、解决方案缺口
  → 输出：结构化调研报告

阶段 2: 机会评估
  → 痛点频次 + 市场规模 + 现有方案差距
  → 选择最有价值的痛点

阶段 3: MVP 构建
  → 选定痛点 → OpenClaw coding agent 构建 MVP
  → 部署为可分享的 Web 应用
```

**核心价值：创业自动驾驶** — 发现问题→验证需求→构建解决方案，全部通过发消息完成。

#### 3.3 所需依赖

| 依赖项 | 用途 | 我们现有对应 |
|--------|------|------------|
| Last 30 Days skill | Reddit/X 近 30 天讨论扫描 | ⚠️ **需安装**，或用 firecrawl + web_search 替代 |
| Telegram/Discord | 接收调研报告 | ✅ **飞书可替代** |
| coding agent | 构建 MVP | ✅ **已有 coding-agent skill** |
| web_fetch | 内容抓取 | ✅ **已有** |

#### 3.4 国内适配方案

| 原文数据源 | 国内替代 | 接入方式 |
|-----------|---------|---------|
| Reddit | V2EX、知乎、掘金、CSDN | firecrawl-search / web_search |
| X/Twitter | 微博、即刻、少数派 | firecrawl 爬取 + web_search |
| Last 30 Days skill | 自建脚本或手动流程 | firecrawl 批量爬取 + AI 分析 |

#### 3.5 落地步骤

```
Phase 1 — 国内痛点挖掘（2-3 小时）
1. 定义调研话题
2. 用 firecrawl-search 搜索 V2EX/知乎/掘金相关讨论
3. 用 web_search 补充微博/即刻信息
4. AI 分析：提取痛点、频次排序、机会评估
5. 输出到飞书文档

Phase 2 — 定期调研自动化（1-2 天）
1. 编写调研 subagent 模板
2. cron 每周一 9:00 触发
3. 调研结果推送到飞书群
4. 积累历史数据到飞书多维表格

Phase 3 — MVP 构建联动（按需）
1. 从调研报告中选择痛点
2. 调用 coding-agent 构建 MVP
3. 部署到可访问的 URL
```

#### 3.6 关键洞察

1. **真实情绪 > 调查问卷** — Reddit/X 上的用户抱怨比问卷更真实、更具体
2. **30 天窗口是甜点** — 太短没足够数据，太长信号过时，30 天正好
3. **Last 30 Days skill 是核心差异化** — 但国内 Reddit/X 不可用，需要替代方案
4. **调研→构建的闭环** — 这个用例最独特的地方是从调研到 MVP 的一站式流水线

---

### 四、三个用例的横向对比

| 维度 | 多智能体内容工厂 | 个人知识库(RAG) | 市场调研产品工厂 |
|------|----------------|----------------|----------------|
| **核心价值** | 自动化内容生产流水线 | 个人知识管理和语义搜索 | 从痛点挖掘到 MVP 构建 |
| **Agent 模式** | 多 Agent 链式流水线 | 单 Agent + 存储 | 单/双 Agent 串联 |
| **所需新依赖** | 图像生成能力（可选） | 无（OpenViking 已有） | Last 30 Days skill（可用替代） |
| **落地难度** | ⭐⭐（2-3 小时 MVP） | ⭐（1-2 小时） | ⭐⭐（2-3 小时） |
| **与现有能力匹配度** | 85%（缺图像生成） | 90%（OpenViking 强匹配） | 80%（需替代 Reddit/X） |
| **推荐优先级** | 🟡 中（技术文档场景先做） | 🟢 高（已有能力直接用） | 🟡 中（有创业需求时做） |

---

### 五、综合落地路线图

```
Week 1: 知识库先行（已有能力）
├─ 建立"知识收藏"工作流：URL → 自动抓取 → memory_store
├─ 测试 memory_recall 查询效果
└─ 确认 OpenViking 作为 RAG 核心的可行性

Week 2: 内容工厂 MVP
├─ 研究 Agent：daily-hot-news + firecrawl-search 扫描热点
├─ 写作 Agent：产出技术周报/研究报告
├─ ClawFlow 编排 + cron 定时触发
└─ 输出飞书文档

Week 3: 市场调研（按需）
├─ 编写国内数据源爬取脚本（V2EX/知乎/掘金）
├─ subagent 调研模板 + cron 每周触发
├─ 结果存飞书多维表格
└─ 评估是否需要 coding-agent 联动构建 MVP
```

### 六、核心发现总结

1. **三个用例的共性模式**：都是"信息采集 → 结构化处理 → 智能输出"流水线，区别在于信息源和输出格式
2. **OpenViking 是被低估的资产** — 作为 RAG 核心，它的语义搜索 + 记忆管理能力已经覆盖了 knowledge-base skill 的 80% 功能，只需补充自动 URL 摄入
3. **国内数据源替代是关键挑战** — Reddit/X 不可用，但 firecrawl + web_search 可以覆盖 V2EX/知乎/掘金/微博等国内平台
4. **链式 Agent 编排已有基础** — ClawFlow + subagent 编排已具备内容工厂所需的多 Agent 协调能力
5. **最低成本落地路径**：知识库（0 额外依赖）→ 内容工厂（2-3 小时）→ 市场调研（2-3 小时）

---

## 5. B 类用例深度学习（第二批）

### 5.1 多源科技新闻摘要（multi-source-tech-news-digest）

#### 5.1.1 用例核心思路

四层数据管道（data pipeline）自动聚合 109+ 来源的科技新闻，合并去重、质量评分后推送摘要。来源覆盖 RSS（46 个）、Twitter/X KOL（44 个）、GitHub Releases（19 个）、网页搜索（4 个主题）。完全通过自然语言管理，30 秒内可添加自定义来源。

#### 5.1.2 痛点分析

| 痛点 | 严重程度 | 说明 |
|------|---------|------|
| **信息分散** | 🔴 高 | AI/开源动态散布在数十个 RSS、Twitter、GitHub、新闻网站 |
| **手动策划耗时** | 🔴 高 | 每天花 30-60 分钟浏览多个平台 |
| **质量过滤缺失** | 🟡 中 | 大多数聚合工具缺乏智能质量评分 |
| **配置复杂** | 🟡 中 | 现有 RSS 阅读器/API 方案需要复杂配置 |
| **重复内容** | 🟢 低 | 同一新闻在多个平台重复出现 |

#### 5.1.3 方案架构

```
┌─────────────┐  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐
│  RSS (46)   │  │ Twitter (44) │  │ GitHub (19)   │  │ Brave (4)    │
│  OpenAI,HN  │  │ @karpathy    │  │ vLLM,Ollama   │  │ AI/开源搜索  │
│  MIT Tech.. │  │ @sama..      │  │ LangChain..   │  │              │
└──────┬──────┘  └──────┬───────┘  └──────┬────────┘  └──────┬───────┘
       │                │                 │                  │
       └────────────────┴────────┬────────┴──────────────────┘
                                  │
                           ┌──────▼──────┐
                           │  合并去重    │  标题相似度去重
                           │  质量评分    │  来源+3, 多源+5, 时效+2, 互动+1
                           └──────┬──────┘
                                  │
                           ┌──────▼──────┐
                           │  摘要生成    │  LLM 生成可读摘要
                           └──────┬──────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
               Discord       Email        Telegram
```

#### 5.1.4 所需依赖

| 依赖 | 用途 | 我们现状 |
|------|------|---------|
| `tech-news-digest` skill | ClawHub 安装的完整管道 | ❌ 未安装，需评估 |
| `X_BEARER_TOKEN` | Twitter/X API 访问 | ❌ 无（成本高，$100/月起） |
| `BRAVE_API_KEY` | Brave Search API | ✅ 已有（TOOLS.md） |
| `GITHUB_TOKEN` | GitHub API 速率限制 | ✅ 已有（gh CLI 已认证） |
| `gog` skill | Gmail 发送邮件 | ⚠️ 未安装 |
| RSS 解析能力 | 46 个 RSS 源抓取 | ⚠️ 需要评估实现方式 |

#### 5.1.5 质量评分机制（值得借鉴）

| 因素 | 分值 | 说明 |
|------|------|------|
| 来源可信度 | +3 | 优先来源（如 OpenAI 官方博客）加分 |
| 多来源出现 | +5 | 同一话题在多个来源出现，说明热度高 |
| 时效性 | +2 | 24 小时内的新闻加分 |
| 互动量 | +1 | Twitter likes/retweets 等社交指标 |

> 💡 **洞察**: 这个评分逻辑可以泛化 — 热榜聚合（daily-hot-news）也可以借鉴类似的多维度评分机制。

#### 5.1.6 与我们现有能力的结合点

| 现有能力 | 结合方式 | 优先级 |
|---------|---------|-------|
| **daily-digest 技能** | tech-news 作为新的子模块集成到每日推送 | 🟢 **推荐** |
| **daily-hot-news** | 热榜 + 科技新闻合并为「信息聚合」模块 | 🟡 中期 |
| **firecrawl** | 替代部分 RSS 抓取，直接抓取网页内容 | ✅ 已有 |
| **Brave Search** | 已有 API Key，可直接用 | ✅ 已有 |
| **GitHub CLI** | 已认证，可拉 GitHub Releases | ✅ 已有 |
| **飞书推送** | 推送到飞书群替代 Discord | ✅ 已有 |
| **Tavily Search** | 可替代 Brave Search 进行主题搜索 | ✅ 已有 |

#### 5.1.7 落地步骤

**Phase 1: 最小可行版本（1-2 小时）**
1. 用 `web_search` + `tavily` 实现主题搜索层（AI/开源/前端/安全 4 个主题）
2. 用 `gh CLI` 拉取关注仓库的最新 releases（`gh release list --repo xxx`）
3. 集成到 daily-digest 技能作为新模块
4. 推送到飞书群

**Phase 2: RSS 集成（按需）**
1. 评估 tech-news-digest skill 是否可直接安装
2. 或者用 cron + curl + firecrawl 实现轻量 RSS 抓取
3. 添加标题去重逻辑（LLM 摘要时自然完成）

**Phase 3: Twitter 集成（可选，成本高）**
1. 评估 Twitter API 免费额度（只读有限制）
2. 或用 web_fetch + firecrawl 定期抓取 KOL 主页
3. 添加到数据管道

#### 5.1.8 WSL2 适配评估

| 组件 | WSL2 可行性 | 备注 |
|------|------------|------|
| tech-news-digest skill | ✅ Node.js 运行 | 无 GUI 依赖 |
| RSS 抓取 | ✅ cron + curl/firecrawl | 定时任务完美匹配 |
| Brave/Tavily API | ✅ 纯 HTTP | 无障碍 |
| GitHub API | ✅ gh CLI | 已配置 |
| 数据库（如需） | ⚠️ SQLite 足够 | 不建议为这个用例引入 PostgreSQL |
| 推送（飞书） | ✅ webhook/API | 已有通道 |

**结论**: WSL2 完全适配。建议从 Phase 1 开始，用已有工具（tavily + gh + firecrawl + 飞书）快速跑通 MVP，再按需扩展。

#### 5.1.9 关键洞察

1. **质量评分是多源聚合的核心** — 没有评分，109 个来源只会变成信息洪水
2. **自然语言管理是差异化** — 30 秒添加来源 vs 传统 RSS 阅读器的复杂配置
3. **我们的优势在通道层** — 飞书推送比 Discord/Email 更适合国内场景
4. **Twitter 层可跳过** — 成本高且国内访问困难，用主题搜索 + GitHub 替代

---

### 5.2 项目状态管理（project-state-management）

#### 5.2.1 用例核心思路

用事件驱动（event-driven）系统替代传统看板（Kanban）。项目状态存储在数据库中，保留完整历史记录；通过自然语言对话捕获进展、决策、阻塞项；支持 Git 集成自动关联提交记录；每日自动生成站会摘要。

#### 5.2.2 痛点分析

| 痛点 | 严重程度 | 说明 |
|------|---------|------|
| **看板过时** | 🔴 高 | 忘记移动卡片，状态不准确 |
| **上下文丢失** | 🔴 高 | 三个月后想不起当初为什么做某个决策 |
| **代码-项目脱节** | 🟡 中 | Git 提交和项目进展之间没有自动关联 |
| **站会成本** | 🟡 中 | 每天花时间整理昨天做了什么 |
| **多项目状态不透明** | 🟡 中 | 同时推进多个项目时容易失控 |

#### 5.2.3 方案架构

```
┌─────────────────────────────────────────────────────────┐
│                    自然语言输入                            │
│  "完成了认证流程"  "被 API 限流阻塞"  "决定换方案"     │
└──────────────────────┬──────────────────────────────────┘
                       │
              ┌────────▼────────┐
              │   事件解析器     │  LLM 理解意图，分类事件类型
              └────────┬────────┘
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
  ┌─────────┐   ┌──────────┐   ┌──────────┐
  │ progress│   │ blocker  │   │ decision │
  │  事件   │   │  阻塞项  │   │  决策    │
  └────┬────┘   └────┬─────┘   └────┬─────┘
       │              │              │
       └──────────────┴──────────────┘
                      │
              ┌───────▼────────┐
              │   SQLite DB    │  projects + events + blockers
              └───────┬────────┘
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
  状态查询      每日站会摘要     Git 集成
  「X 项目进展?」  cron 9AM      gh CLI
```

#### 5.2.4 数据模型（从用例提取）

```sql
-- 项目表
CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE,
  status TEXT,           -- active / blocked / completed
  current_phase TEXT,
  last_update TIMESTAMP DEFAULT NOW()
);

-- 事件表（事件溯源核心）
CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  event_type TEXT,       -- progress / blocker / decision / pivot
  description TEXT,
  context TEXT,          -- 保留决策背后的原因
  timestamp TIMESTAMP DEFAULT NOW()
);

-- 阻塞项表
CREATE TABLE blockers (
  id INTEGER PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  blocker_text TEXT,
  status TEXT DEFAULT 'open',  -- open / resolved
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);
```

#### 5.2.5 事件类型与触发规则

| 自然语言模式 | 事件类型 | 系统动作 |
|-------------|---------|---------|
| "完成了 X" / "Finished X" | progress | 更新项目状态，记录事件 |
| "被 X 阻塞" / "Blocked on X" | blocker | 创建阻塞项，状态→blocked |
| "开始做 X" / "Starting X" | progress | 更新 current_phase |
| "决定 X" / "Decided to X" | decision | 记录决策及完整上下文 |
| "转向 X" / "Pivoting to X" | pivot | 记录转向原因和新方向 |

#### 5.2.6 所需依赖

| 依赖 | 用途 | 我们现状 |
|------|------|---------|
| SQLite | 项目状态持久化 | ✅ 系统自带 |
| `gh` CLI | Git 提交记录关联 | ✅ 已认证 |
| cron | 每日站会摘要 | ✅ 已有 |
| subagent | 并行项目分析 | ✅ ClawFlow 已就绪 |
| 飞书/IM | 状态查询和推送 | ✅ 已有通道 |

#### 5.2.7 与我们现有能力的结合点

| 现有能力 | 结合方式 | 优先级 |
|---------|---------|-------|
| **daily notes（memory/）** | 事件记录可直接写入每日笔记，不需要额外数据库 | 🟢 **推荐起步** |
| **飞书任务（task）** | 阻塞项同步到飞书任务，利用飞书的任务管理 UI | 🟡 中期 |
| **飞书多维表格（bitable）** | 用 bitable 替代 SQLite，状态可视化 + 多人协作 | 🟡 中期 |
| **ClawFlow** | 用 flow identity 跟踪项目生命周期 | 🟢 **推荐** |
| **subagent 编排** | 每日站会时并行分析多个项目状态 | 🟢 **推荐** |
| **ontology skill** | 项目/任务/事件作为实体建模，支持关联查询 | 🟡 中期 |
| **GitHub skill** | PR/commit 自动关联到项目事件 | 🟢 **推荐** |
| **lark-workflow-standup-report** | 复用已有站会摘要框架，增强项目状态维度 | 🟢 **推荐** |

#### 5.2.8 落地步骤

**Phase 1: 轻量版本 — 基于文件系统（1-2 小时）**
1. 在 `memory/` 下创建 `projects/` 目录，每个项目一个 YAML/Markdown 文件
2. 事件记录追加到当日 daily notes，用标签 `#project:xxx` 和 `#event:progress/blocker/decision`
3. 查询时用 `memory_search` 语义检索项目历史
4. 复用 `lark-workflow-standup-report` 框架生成站会摘要

**Phase 2: SQLite 持久化（半天）**
1. 创建 `~/scripts/project-state.sql` 建表脚本
2. 编写 CLI 工具 `project-state.sh`，支持 `log`/`query`/`standup` 子命令
3. 集成到 cron，每天 9:00 生成站会摘要并推送飞书
4. 添加 gh CLI 集成，自动关联最近 24h 的 commit

**Phase 3: 多维表格可视化（按需）**
1. 用飞书 bitable 创建项目状态表、事件表、阻塞项表
2. 配置看板视图（kanban view）— 享受看板的视觉优势，但数据由事件驱动维护
3. 多人协作时共享 bitable

#### 5.2.9 WSL2 适配评估

| 组件 | WSL2 可行性 | 备注 |
|------|------------|------|
| SQLite | ✅ 完美匹配 | 单文件数据库，无服务依赖 |
| cron + bash | ✅ 完美匹配 | 站会摘要定时任务 |
| gh CLI | ✅ 完美匹配 | 已配置 |
| 飞书 API | ✅ 完美匹配 | 网络通过代理正常 |
| 文件系统方案 | ✅ 完美匹配 | Phase 1 零依赖 |

**结论**: WSL2 完全适配，且该用例天然适合我们的环境。建议从 Phase 1（文件系统 + memory_search）快速验证价值。

#### 5.2.10 关键洞察

1. **事件溯源 > 状态快照** — 记录「发生了什么」比记录「当前是什么」更有价值，三个月后可以回溯任何决策的原因
2. **自然语言输入是杀手锏** — 不需要额外打开看板工具，在日常对话中就完成状态更新
3. **Git 集成弥合代码-项目鸿沟** — commit message 自动关联项目事件，形成完整时间线
4. **与我们的 memory 体系天然契合** — daily notes + memory_search 已经构成了轻量级事件溯源系统
5. **bitable 是最佳可视化层** — 事件驱动维护数据，bitable 只负责展示，两全其美

---

### 5.3 两个用例的交叉分析

| 维度 | 多源科技新闻摘要 | 项目状态管理 |
|------|----------------|-------------|
| **核心模式** | 数据管道（crawl → score → summarize） | 事件溯源（capture → store → query） |
| **触发方式** | 定时（cron）+ 按需 | 对话驱动 + 定时摘要 |
| **存储需求** | 轻量（可无状态） | 持久化（SQLite/bitable） |
| **与 daily-digest 关系** | 可作为子模块直接集成 | 站会摘要可合并到每日推送 |
| **落地优先级** | 🟡 中期（增强现有 daily-digest） | 🟢 短期（基于 memory 体系快速实现） |
| **实施难度** | 中（需评估 RSS 方案） | 低（memory_search 已就绪） |
| **WSL2 适配** | ✅ 完全适配 | ✅ 完全适配 |

---

# 第三批：B类高价值用例深度分析（7个）

> 分析日期：2026-04-05
> 来源：awesome-openclaw-usecases-zh 仓库

---

## B-1. 办公自动化套件 (cn-office-automation)

### 痛点
知识工作者每天花 2-3 小时在重复性办公任务上：筛选邮件、整理文件、写会议纪要、编周报。每项单独不难，但加起来消耗大量时间和精力。

### 方案架构
5 个子模块可独立/组合部署：
1. **邮件管理**：IMAP/SMTP 协议连接邮箱，定时检查、分类、摘要
2. **文件整理**：基于规则（类型/日期/项目）自动归档下载文件夹
3. **会议纪要**：结合飞书妙记/腾讯会议转录，自动生成结构化纪要
4. **周报生成**：汇总本周工作邮件+任务进展，格式化输出
5. **日程同步**：从截图/消息中提取时间信息，自动创建日历事件

### 与我们现有能力结合
| 能力 | 现状 | 差距 |
|------|------|------|
| 邮件管理 | ✅ 飞书邮箱 API（lark-mail skill） | 163/QQ 邮箱需 IMAP 配置 |
| 文件整理 | ✅ exec + shell 原生支持 | 无差距 |
| 会议纪要 | ✅ 飞书妙记 API（lark-minutes） | 已具备 |
| 周报生成 | ✅ feishu_im_user_search_messages 可汇总本周消息 | 需要构建 prompt 模板 |
| 日程同步 | ✅ 飞书日历 API | OCR 截图提取需额外能力 |

**评估：我们 80% 能力已就绪，最大的增量价值在周报自动化。**

### 落地步骤
1. **P0 - 周报自动化**（1天）：用 `feishu_im_user_search_messages` + `feishu_task_task` 汇总本周群聊消息和任务状态，生成飞书文档周报
2. **P1 - 会议纪要**（0.5天）：对接 `lark-minutes`，cron 定时检查新妙记
3. **P2 - 邮件摘要**（1天）：配置 IMAP 或使用飞书邮箱 API
4. **P3 - 文件整理**（0.5天）：shell 脚本 + 定时执行

### WSL2 适配
✅ 完全适配。所有操作基于 CLI API，无 GUI 依赖。

| 维度 | 评分 |
|------|------|
| 落地优先级 | 🟢 高（周报 P0，直接解决日常痛点） |
| 实施难度 | 低-中 |
| ROI | 高（每天节省 30-60 分钟） |

---

## B-2. 自主项目管理 STATE.yaml (autonomous-project-management)

### 痛点
传统调度器模式中主智能体成为"交通警察"瓶颈。复杂项目（多仓库重构、研究冲刺、内容管道）需要能并行工作且无需持续监督的智能体。

### 方案架构
核心模式：**STATE.yaml 作为共享事实来源**
- 主智能体 = CEO（仅策略，0-2 次工具调用）
- 子智能体 = PM（自治执行，维护 STATE.yaml）
- 协调机制 = 文件读写（非消息传递）
- Git = 审计日志（版本控制状态变更）

```
用户 → 主智能体(spawn) → PM子智能体(自治) → STATE.yaml(协调)
                          ↕                        ↕
                        子子智能体              其他PM智能体
```

STATE.yaml 包含：任务列表（id/status/owner/notes）、阻塞关系、下一步行动建议。

### 与我们现有能力结合
| 能力 | 现状 | 差距 |
|------|------|------|
| 子智能体管理 | ✅ sessions_spawn 支持 | 无 |
| 文件系统 | ✅ 原生支持 | 无 |
| Git 版本控制 | ✅ exec + git CLI | 无 |
| STATE.yaml 模式 | ⚠️ 未实施 | 需要建立规范和模板 |
| 项目注册表 | ⚠️ AGENTS.md 有 PM 委派规范框架 | 需要具体化 |

**评估：架构理念与我们的 AGENTS.md Subagent 规范高度契合，但 STATE.yaml 模式是新的增量价值。**

### 落地步骤
1. **建立 STATE.yaml 模板**：在 `docs/` 创建标准模板，定义字段规范
2. **实现 PM subagent prompt**：在 `agents/` 创建 PM 角色配置
3. **在 AGENTS.md 补充 STATE.yaml 工作流**：与现有 subagent 规范整合
4. **试点项目**：选一个小项目（如 team-dashboard）用 STATE.yaml 管理

### WSL2 适配
✅ 完全适配。纯文件 + CLI 操作。

| 维度 | 评分 |
|------|------|
| 落地优先级 | 🟡 中期（理念好，需试点验证） |
| 实施难度 | 中 |
| ROI | 高（大型项目场景） |

---

## B-3. 目标驱动自主任务 (overnight-mini-app-builder)

### 痛点
大多数人难以将远大目标分解为每日可执行步骤。即使做到了，执行也耗尽所有时间。AI 智能体本质是被动的——只有下达指令时才工作。

### 方案架构
三步流程：
1. **目标倾倒**：一次性告知所有目标（职业/个人/商业），存入 memory
2. **自主每日任务**：每天早上自动生成 4-5 个可执行任务，自主执行
3. **看板追踪**：Kanban board 实时展示进度（可选）
4. **惊喜夜构建**：每晚构建一个小 MVP 应用

关键差异：智能体自行建立目标间的联系，发现人想不到的任务机会。

### 与我们现有能力结合
| 能力 | 现状 | 差距 |
|------|------|------|
| 目标存储 | ✅ memory_store / MEMORY.md | 无 |
| 定时任务 | ✅ cron job | 无 |
| 子智能体执行 | ✅ sessions_spawn | 无 |
| 每日任务生成 | ⚠️ 需要构建 prompt | 需要开发 |
| 看板可视化 | ⚠️ Canvas 可用但非 Kanban | 需要适配或简化 |
| 夜间构建 | ✅ coding-agent skill | 无 |

**评估：核心能力全部具备，关键在于构建"目标→每日任务"的 prompt 逻辑。**

### 落地步骤
1. **定义目标结构**：在 USER.md 或专门的 goals.md 中记录目标
2. **构建每日任务生成 prompt**：结合 memory 中的目标 + daily notes + 飞书日程
3. **配置 cron**：每天 8:00 触发任务生成和执行
4. **用飞书多维表格替代 Kanban**：作为任务看板（bitable 已有 skill）
5. **可选：夜间 mini-app**：coding-agent + clawflow 实现自主构建

### WSL2 适配
✅ 完全适配。夜间构建任务在 WSL2 中完美运行。

| 维度 | 评分 |
|------|------|
| 落地优先级 | 🟡 中期（理念强但需要持续调优） |
| 实施难度 | 中（prompt 工程为主） |
| ROI | 高（长期复利效应） |

---

## B-4. 动态仪表板 (dynamic-dashboard)

### 痛点
静态仪表板显示过时数据，需要持续手动更新。构建自定义仪表盘需数周，顺序轮询多 API 慢且容易触及速率限制。

### 方案架构
- 每个数据源 = 一个子智能体（并行抓取）
- 结果聚合到统一仪表板（Discord/HTML/Canvas）
- 定时更新（cron 每 N 分钟）
- 阈值告警（指标超限自动通知）
- 历史数据存数据库（SQLite/Postgres）

数据源示例：GitHub stars、Twitter mentions、系统健康、市场数据。

### 与我们现有能力结合
| 能力 | 现状 | 差距 |
|------|------|------|
| 子智能体并行 | ✅ sessions_spawn | 无 |
| GitHub 数据 | ✅ gh CLI | 无 |
| 系统健康 | ✅ exec + shell 命令 | 无 |
| 飞书数据 | ✅ 全套 API | 无 |
| Web 数据源 | ✅ web_search / firecrawl | 无 |
| 渲染 | ✅ Canvas / 飞书多维表格 | 无 |
| 历史存储 | ⚠️ 无持久化数据库 | 需要 SQLite 或 bitable |
| 阈值告警 | ⚠️ 需要构建逻辑 | 需要开发 |

**评估：我们有能力做一个轻量级仪表板，但全功能版需要数据持久化层。**

### 落地步骤
1. **轻量版**：用 Canvas 或飞书文档渲染实时快照（无历史数据），覆盖 GitHub + 系统健康 + 飞书任务统计
2. **数据层**：SQLite 存历史指标，exec + sqlite3 CLI 操作
3. **告警逻辑**：在 cron 任务中检查阈值，超过则飞书通知
4. **进阶版**：接入更多数据源（A 股行情、竞品数据等）

### WSL2 适配
✅ 完全适配。SQLite + CLI 全部原生支持。

| 维度 | 评分 |
|------|------|
| 落地优先级 | 🟡 中期（可从轻量版开始，渐进增强） |
| 实施难度 | 中 |
| ROI | 中-高（信息聚合价值大，但需要持续维护） |

---

## B-5. 健康与症状追踪器 (health-symptom-tracker)

### 痛点
识别食物敏感性需要长期持续记录，但记录过程繁琐难以维持。需要提醒来记录，也需要分析来发现模式。

### 方案架构
- 输入通道：飞书/Telegram 消息（发送饮食和症状信息）
- 存储：markdown 日志文件（带时间戳）
- 提醒：每天 3 次 cron 提醒（早/中/晚）
- 分析：每周自动分析模式，识别潜在触发因素

### 与我们现有能力结合
| 能力 | 现状 | 差距 |
|------|------|------|
| 消息输入 | ✅ 飞书群聊/私聊 | 无 |
| 日志存储 | ✅ memory/*.md | 无 |
| 定时提醒 | ✅ cron + qqbot_remind | 无 |
| 模式分析 | ✅ LLM 分析文本 | 无 |
| 飞书消息解析 | ✅ 上下文自动获取 | 无 |

**评估：100% 能力已就绪，是最简单的用例之一。**

### 落地步骤
1. **创建日志文件**：`memory/health-log.md`
2. **配置提醒**：3 次 cron 提醒到飞书
3. **构建解析 prompt**：从用户消息中提取食物+症状，结构化写入日志
4. **周报分析**：周日 cron 触发，分析一周数据输出模式报告
5. **进阶**：用飞书多维表格做结构化存储，支持统计图表

### WSL2 适配
✅ 完全适配。纯文本处理。

| 维度 | 评分 |
|------|------|
| 落地优先级 | 🟢 高（简单可快速落地） |
| 实施难度 | 低 |
| ROI | 中（取决于个人需求） |

---

## B-6. 家庭日历与家务助理 (family-calendar-household-assistant)

### 痛点
- 日历碎片化：工作/个人/家庭/孩子学校日历分布在多个平台
- 家务协调开销：库存管理、购物清单通过零散短信进行
- 错过预约：预约确认短信无人处理

### 方案架构
3 个核心模块：
1. **日历聚合+早间简报**：多源日历拉取 → 统一简报 → 飞书/Slack 推送
2. **环境消息监控**：被动监听消息 → 检测预约模式 → 自动创建日历事件 + 路程缓冲
3. **家庭库存管理**：维护 inventory.json → 照片/文字/收据更新 → 购物清单生成

关键洞察：**被动优于主动**——智能体无需被要求就能行动（检测短信中的预约并自动创建事件）。

### 与我们现有能力结合
| 能力 | 现状 | 差距 |
|------|------|------|
| 日历聚合 | ✅ 飞书日历 API（多日历） | 其他日历源需适配 |
| 早间简报 | ✅ daily-digest skill 可复用 | 需扩展日历源 |
| 消息监控 | ⚠️ iMessage 仅限 macOS | **WSL2 不支持 iMessage** |
| 日历自动创建 | ✅ feishu_calendar_event | 无 |
| 库存管理 | ✅ 飞书多维表格或 JSON 文件 | 无 |
| 照片 OCR | ✅ image 工具 | 无 |

**评估：日历聚合和库存管理可落地，但 iMessage 消息监控在 WSL2 环境不可用。**

### 落地步骤
1. **P0 - 日历聚合简报**：复用 daily-digest，增加飞书日历事件聚合
2. **P1 - 库存管理**：飞书多维表格做库存，支持文字更新
3. **P2 - 飞书消息预约检测**：监听飞书群消息中的预约信息（替代 iMessage）
4. **P3 - 照片输入**：拍照→vision 模型→更新库存/日历

### WSL2 适配
⚠️ 部分适配。iMessage 集成是核心差异化功能但不可用。可用飞书消息替代，但体验打折。日历聚合和库存管理完全适配。

| 维度 | 评分 |
|------|------|
| 落地优先级 | 🟡 中期（日历聚合有价值，库存看需求） |
| 实施难度 | 中（iMessage 替代方案需设计） |
| ROI | 中（单身用户价值有限，家庭场景价值高） |

---

## B-7. YouTube 每日摘要 (daily-youtube-digest)

### 痛点
YouTube 通知不可靠，订阅频道的新视频不出现在首页动态中。每天漫无目的刷推荐不如获取精心策划的内容摘要。

### 方案架构
两种模式：
1. **基于频道**：维护频道列表 → 定时检查最新视频 → 获取字幕（transcript）→ 生成摘要
2. **基于关键词**：搜索关键词 → 去重（seen-videos.txt）→ 获取字幕 → 摘要

技术方案：youtube-full skill → TranscriptAPI.com（非 yt-dlp，避免 CLI 冗长日志和 YouTube 封锁）

### 与我们现有能力结合
| 能力 | 现状 | 差距 |
|------|------|------|
| YouTube 频道列表 | ⚠️ 需要维护 | 需要 youtube-full skill |
| 字幕获取 | ⚠️ TranscriptAPI 或 yt-dlp | 需要安装配置 |
| 内容摘要 | ✅ LLM 能力 | 无 |
| 去重逻辑 | ✅ 文件系统 | 无 |
| 定时推送 | ✅ cron + 飞书消息 | 无 |
| 中文频道适配 | ✅ transcript 支持中文 | 无 |

**评估：需要安装 youtube-full skill（或 yt-dlp），其余能力全部就绪。**

### 落地步骤
1. **安装依赖**：youtube-full skill 或 yt-dlp + transcript 方案
2. **定义频道列表**：在 memory 中维护关注的 YouTube 频道
3. **构建摘要 prompt**：针对中文内容优化摘要格式
4. **配置 cron**：每天早上推送飞书
5. **去重机制**：seen-videos.txt 或飞书多维表格
6. **可选**：集成到 daily-digest 作为子模块

### WSL2 适配
✅ 完全适配。yt-dlp 和 TranscriptAPI 都是 HTTP/CLI 工具。

| 维度 | 评分 |
|------|------|
| 落地优先级 | 🟢 高（信息获取类，与 daily-digest 协同） |
| 实施难度 | 低（youtube-full 一键安装） |
| ROI | 高（每天节省浏览时间，获取高质量信息） |

---

## 第三批用例总结对比

| 用例 | 落地优先级 | 实施难度 | ROI | 能力就绪度 | WSL2 适配 |
|------|-----------|---------|-----|-----------|----------|
| B-1 办公自动化套件 | 🟢 高 | 低-中 | 高 | 80% | ✅ 完全 |
| B-2 STATE.yaml 项目管理 | 🟡 中期 | 中 | 高 | 70% | ✅ 完全 |
| B-3 目标驱动自主任务 | 🟡 中期 | 中 | 高 | 85% | ✅ 完全 |
| B-4 动态仪表板 | 🟡 中期 | 中 | 中-高 | 70% | ✅ 完全 |
| B-5 健康症状追踪 | 🟢 高 | 低 | 中 | 100% | ✅ 完全 |
| B-6 家庭日历家务 | 🟡 中期 | 中 | 中 | 60% | ⚠️ 部分 |
| B-7 YouTube 每日摘要 | 🟢 高 | 低 | 高 | 75% | ✅ 完全 |

### 推荐落地顺序
1. **即刻可做**：B-5 健康追踪（最简单）、B-1 周报自动化（最高 ROI）
2. **本周完成**：B-7 YouTube 摘要（与 daily-digest 协同）、B-2 STATE.yaml 模式试点
3. **下周规划**：B-3 目标驱动系统、B-4 轻量仪表板、B-6 日历聚合（看需求）
