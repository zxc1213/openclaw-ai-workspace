# 🌙 OpenClaw AI Agent Workspace

> 基于 OpenClaw 构建的个人 AI Agent 生产力系统，集成飞书生态，实现日程管理、智能早报、代码审查、知识库同步等 30+ 自动化场景。

## 🎯 项目解决的核心痛点

1. **信息碎片化**：日程、待办、安全情报、技术热榜分散在多个平台，每天需要手动逐一查看
2. **重复性事务耗时**：日报/周报编写、代码规范检查、服务器监控等重复性工作占用大量时间
3. **知识难以沉淀**：跨会话的上下文和经验教训容易丢失，新会话缺乏历史记忆
4. **多工具协作成本高**：飞书、GitHub、本地开发环境之间缺乏统一入口

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────┐
│                   Feishu (飞书)                   │
│              统一交互入口 · 消息卡片                │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│              OpenClaw Gateway                    │
│         主 Agent（念念） · 长上下文对话            │
│    ┌─────────────────────────────────────┐      │
│    │         Cron 调度引擎               │      │
│    │  每日早报 · 周报 · 健康检查 · 监控   │      │
│    └──────────┬──────────────────────────┘      │
│               │ Sub-Agent 派发                   │
│    ┌──────────▼──────────────────────────┐      │
│    │      Isolated Sessions              │      │
│    │  代码审查 · 网页爬取 · 数据处理      │      │
│    └─────────────────────────────────────┘      │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│            OpenViking 记忆引擎                    │
│     向量记忆 · 跨会话持久化 · 语义检索            │
└─────────────────────────────────────────────────┘
```

## 🤖 核心能力

### 1. 多 Agent 协作架构
- **主 Agent（念念）**：负责意图识别、任务调度、上下文管理
- **专职 Sub-Agent**：隔离执行编码、审查、爬取等任务，结果自动回收
- **任务派发模板**：四要素标准化（Goal / Context / Constraints / Done 标准）

### 2. 定时任务系统（7 个 Cron Job）

| 任务 | 频率 | 说明 |
|------|------|------|
| 🌅 每日早报 | 每天 09:00 | 安全简报 + 日程 + 待办 + 热榜 + 天气 |
| 📊 周报生成 | 每周日 20:00 | 本周完成 + Subagent 统计 + 下周计划 |
| 🔄 团队增强跟进 | 周一/四 10:00 | OpenClaw 版本更新检查 |
| 🔍 开源项目监控 | 周一/四 10:00 | 技术博客更新追踪 |
| 💚 服务器告警 | 每 15 分钟 | 异常检测 + 飞书即时告警 |
| 🔧 服务器自动修复 | 每天 03:00 | 磁盘清理 + 服务重启 + 网络刷新 |
| 💭 记忆梦境 | 每天 03:00 | 短期记忆 → 长期记忆自动沉淀 |

### 3. Skill 插件体系（68+ 技能）

涵盖多个领域：
- **飞书集成**：日历、任务、多维表格、文档、知识库、云盘
- **开发工具**：GitHub、PR Review、代码审计（Java/Vue）
- **信息获取**：网页爬取（Firecrawl）、论文检索（arXiv/HuggingFace）
- **自动化**：浏览器控制、定时任务、工作流编排
- **AI 辅助**：Claude Code 联动、MCP 构建器

### 4. 智能记忆系统
- **分层记忆**：L1 核心事实（compaction 后始终重注入）+ L2 详细内容（按需搜索）
- **向量检索**：OpenViking 语义记忆，embedding-3 2048 维
- **自动沉淀**：记忆梦境任务定期将高频短期记忆提升为长期记忆
- **跨会话连续性**：新会话自动加载 MEMORY.md + 当日笔记

### 5. 飞书深度集成
- 日程创建/查询/忙闲分析
- 任务管理（创建/分配/子任务/评论）
- 多维表格 CRUD
- 知识库文档读写
- 云空间文件管理
- 消息检索与回复

## 📁 项目结构

```
workspace/
├── AGENTS.md          # Agent 行为规范
├── SOUL.md            # 人格定义
├── USER.md            # 用户画像
├── MEMORY.md          # 长期记忆索引
├── HEARTBEAT.md       # 心跳任务定义
├── TOOLS.md           # 工具配置
├── IDENTITY.md        # Agent 身份
├── skills/            # 68+ Skill 插件
│   ├── lark-*/        # 飞书系列技能
│   ├── firecrawl-*/   # 网页爬取系列
│   ├── coding-agent/  # 编码 Agent
│   └── ...
├── memory/            # 记忆系统
│   ├── daily-notes/   # 每日笔记
│   ├── heartbeat-reflections/  # 心跳反思
│   └── archive/       # 归档
├── docs/              # 正式文档
├── research/          # 研究笔记
├── projects/          # 项目代码
│   └── team-dashboard/
├── scripts/           # 自动化脚本
└── rules/             # 编码规范
```

## 🔧 技术栈

| 组件 | 技术 |
|------|------|
| Agent 框架 | [OpenClaw](https://github.com/openclaw/openclaw) v2026.4.21 |
| 主模型 | GLM-5-Turbo (智谱, 204K context) |
| 辅助模型 | GLM-5 / GLM-5.1 / GLM-4.7-Flash |
| 记忆引擎 | [OpenViking](https://openviking.ai) v0.3.2, embedding-3 |
| 通信渠道 | 飞书 / QQ / Telegram |
| 运行环境 | WSL2 (Ubuntu) + Windows |
| 前端 | React (Team Dashboard) |
| 后端 | Java SpringCloud (集团平台) |

## 📸 实际运行截图

### 系统状态
```
OpenClaw 2026.4.21 (f788c88)
68 Skills loaded
7 Cron Jobs active
Model: GLM-5-Turbo
Channel: Feishu ✅
```

### 每日早报示例
```
🌅 早安 Ray | 2026-04-28 周一

🔐 安全简报
今日无高危安全通告

📅 今日日程
14:00 技术方案评审

📋 待办提醒
- 完成 Token Plan 申请材料

🔥 热榜速览
- [1] anthropic/claude-code · Claude Code 新增 Agent SDK
- [2] openclaw/openclaw · OpenClaw v2026.4.21 发布
- [3] vercel/ai · AI SDK v4 正式发布

🌤 广州天气
28°C 多云 · 短袖即可，带伞防阵雨
```

### Sub-Agent 任务派发
```
## 任务：集团平台安全审计

### Goal
扫描 MyBatis XML 中的 SQL 注入风险，输出修复建议

### Context
- 项目路径: /mnt/e/todo/集团平台
- 4 个同构版本, 169 张表

### Constraints
1. 仅扫描 ${} 非预编译参数
2. 输出 CSV 格式报告
3. max_turns: 15

### Done 标准
1. 所有 Mapper XML 已扫描
2. 风险点按 P0/P1/P2 分级
3. 修复建议包含代码示例
```

## 📈 运行数据

- **Skill 插件**: 68+ 个
- **定时任务**: 7 个（覆盖日常、监控、知识管理）
- **记忆条目**: 200+ 条（OpenViking 向量记忆）
- **每日早报**: 自动生成并归档到飞书知识库
- **模型调用**: GLM 系列主力，日均数千次 API 调用

## 🚀 快速开始

### 环境要求
- Node.js >= 20
- OpenClaw >= 2026.4
- 智谱 API Key（GLM 系列模型）
- 飞书应用（可选，用于深度集成）

### 安装

```bash
# 安装 OpenClaw
npm install -g openclaw

# 克隆配置
git clone https://github.com/<your-username>/openclaw-ai-workspace.git
cd openclaw-ai-workspace
cp -r . ~/.openclaw/workspace/

# 配置环境变量
openclaw config edit
```

### 启动

```bash
# 启动 Gateway
openclaw gateway start

# 查看状态
openclaw status
```

## 📝 成果描述

> 我基于 OpenClaw 构建了一套完整的个人 AI Agent 生产力系统。通过飞书作为统一交互入口，实现了日程管理、消息检索、文档协作、每日安全情报早报、开源项目版本监控等 30+ 自动化场景。系统采用多 Agent 协作架构——主 Agent 负责意图识别和任务调度，专职 Sub-Agent 在隔离会话中执行编码审查、网页爬取等任务。配合 OpenViking 向量记忆库实现跨会话知识持久化，通过自研 Skill 机制将 68+ 个工作流沉淀为可复用插件。日常运行 7 个定时任务，覆盖智能早报、周报生成、服务器健康检查等场景，显著降低了重复性事务处理成本。

## License

MIT

---

Built with 🌙 by 念念 · Powered by [OpenClaw](https://github.com/openclaw/openclaw) + [智谱 GLM](https://bigmodel.cn)
