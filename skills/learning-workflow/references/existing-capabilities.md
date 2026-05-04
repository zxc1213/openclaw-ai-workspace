# 已有能力对照清单

> 学习工作流 Phase 1 评估时参考此清单。定期更新。

## 飞书任务中心

| 项目 | 详情 |
|------|------|
| 任务清单 | 💡 成长学习 (tasklist_guid: aabbccdd-eeee-ffff-gggg-hhhhiiiiiiii)
| 知识空间 | 念念的 AI Agent 实践笔记 (space_id: 7600000000000000000) |
| 多维表格 | 配置速查手册 (5表49记录) |

## 通讯与协作

| 能力 | 说明 | 覆盖范围 |
|------|------|----------|
| 飞书 IM | 发消息、搜索消息、下载附件 | DM + 群聊 |
| 飞书日历 | 日程 CRUD、参会人管理、忙闲查询 | 主日历 |
| 飞书文档 | 创建/编辑/获取云文档、评论管理 | doc/docx |
| 飞书多维表格 | 表/字段/记录/视图管理 | bitable |
| 飞书电子表格 | 读写/查找/导出 | spreadsheet |
| 飞书知识库 | 空间/节点管理 | wiki |
| 飞书任务 | 任务/清单/评论/子任务 | task |
| 飞书云空间 | 文件上传/下载/管理 | drive |
| 飞书妙记 | 会议录音信息获取 | minutes |
| lark-cli | 200+ 命令覆盖 11 个领域 | 全套 |

## 自动化与定时

| 能力 | 说明 | 详情 |
|------|------|------|
| 每日早报 | 安全+日程+待办+热榜+天气 | cron 72d10a6c, 08:00 |
| 周报 | 本周完成+subagent统计+决策+计划 | cron 27581440, 周日20:00 |
| 团队增强跟进 | 版本更新 vs backlog | cron 19fab771, 周一/四10:00 |
| Cron 管理 | 系统事件 + isolated session + agentTurn | 完整 |
| 心跳 | 依赖检查+memory整理+workspace卫生 | HEARTBEAT.md |

## 编码与开发

| 能力 | 说明 | 详情 |
|------|------|------|
| Subagent 编排 | isolated/session, 任务派发模板 | AGENTS.md |
| Coding Agent | Codex/Claude Code 后台编码 | skill |
| Code Review | PR 审查清单 | skill |
| GitHub | issue/PR/CI 管理 | gh CLI |

## 数据与知识

| 能力 | 说明 | 详情 |
|------|------|------|
| OpenViking 记忆 | 语义记忆搜索/存储/遗忘 | v0.3.2, :9333 |
| Daily Notes | 每日笔记 + 归档 + 心跳沉淀 | memory/ |
| MEMORY.md | 长期记忆索引 | 手动维护 |
| 热榜 API | 54 平台热榜数据 | :6688 |

## 搜索与采集

| 能力 | 说明 | 详情 |
|------|------|------|
| Firecrawl | 网页爬取/搜索/批量 | API key 已配置 |
| Tavily | AI 搜索引擎 | API key 已配置 |
| web_search | Brave Search | 内置 |
| web_fetch | URL 内容提取 | 内置 |
| 浏览器自动化 | agent-browser + Chrome CDP | 192.168.1.100:9222 |

## 监控与展示

| 能力 | 说明 | 详情 |
|------|------|------|
| Team Dashboard | 5-tab 监控面板 | :18788, systemd |
| 安全简报 | CVE + 安全资讯聚合 | P0-P3 |

## 模型

| 模型 | 用途 |
|------|------|
| GLM-5 / 5.1 / 5-Turbo / 4.7 / 4.7-Flash / 4.7-FlashX | 主力模型 (智谱) |
| GLM-5V-Turbo | 多模态 |

## 尚未具备的常见能力

- 钉钉/企业微信集成
- 小红书/抖音内容自动化
- 股票/金融数据 (AKShare)
- 播客制作
- 电商自动化
- 预测市场
- n8n 工作流
- LaTeX 编译
