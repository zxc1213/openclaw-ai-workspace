# 🤖 OpenClaw AI Agent Workspace

> 基于 [OpenClaw](https://github.com/openclaw/openclaw) 构建的 AI Agent 生产力系统，集成飞书生态，实现日程管理、智能早报、代码审查、知识库同步等 30+ 自动化场景。

## 🎯 项目解决的核心痛点

1. **信息碎片化**：日程、待办、安全情报、技术热榜分散在多个平台，每天需要手动逐一查看
2. **重复性事务耗时**：日报/周报编写、代码规范检查、服务器监控等重复性工作占用大量时间
3. **知识难以沉淀**：跨会话的上下文和经验教训容易丢失，新会话缺乏历史记忆
4. **多工具协作成本高**：飞书、GitHub、本地开发环境之间缺乏统一入口

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────┐
│ Feishu (飞书)                                   │
│ 统一交互入口 · 消息卡片                          │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│ OpenClaw Gateway                                │
│ 主 Agent · 长上下文对话                   │
│ ┌─────────────────────────────────────┐         │
│ │ Cron 调度引擎                       │         │
│ │ 每日早报 · 周报 · 健康检查 · 监控    │         │
│ └──────────┬──────────────────────────┘         │
│            │ Sub-Agent 派发                      │
│ ┌──────────▼──────────────────────────┐         │
│ │ Isolated Sessions                    │         │
│ │ 代码审查 · 网页爬取 · 数据处理       │         │
│ └─────────────────────────────────────┘         │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│ OpenViking 记忆引擎                              │
│ 向量记忆 · 跨会话持久化 · 语义检索                │
└─────────────────────────────────────────────────┘
```

## 🤖 核心能力

### 1. 多 Agent 协作架构
- **主 Agent**：负责意图识别、任务调度、上下文管理
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
| 📦 GitHub 同步 | 每天 22:00 | 自动脱敏同步到公开仓库 |

### 3. Skill 插件体系（87 个技能）

涵盖多个领域：

| 类别 | 数量 | 代表技能 |
|------|------|----------|
| **飞书集成** | 22 | 日历、任务、多维表格、文档、知识库、云盘、审批、视频会议 |
| **网页爬取** | 8 | Firecrawl 爬取/搜索/下载/地图/指令 |
| **开发工具** | 15 | GitHub、PR Review、代码审计（Java/Vue）、TDD、Git Worktrees |
| **Agent 架构** | 12 | 任务派发、并行调度、子Agent驱动开发、会话管理 |
| **安全审计** | 6 | Skill 审计、MCP 审计、Java/Vue 安全扫描、安全简报 |
| **写作与学习** | 8 | 计划编写、技能创建、学习工作流、研究方法论 |
| **信息获取** | 4 | arXiv 论文、HuggingFace 论文、Tavily 搜索、热点新闻 |
| **浏览器** | 4 | Agent Browser、Browser Use、BrowserWing、网站审计 |
| **自动化** | 5 | 工作流运行器、每日摘要、每日热点、Token 统计 |
| **其他** | 3 | 头脑风暴、本体论、Web 访问 |

### 4. 智能记忆系统
- **分层记忆**：L1 核心事实（compaction 后始终重注入）+ L2 详细内容（按需搜索）
- **向量检索**：OpenViking 语义记忆，embedding-3 2048 维
- **自动沉淀**：心跳任务定期将高频短期记忆提升为长期记忆
- **跨会话连续性**：新会话自动加载 MEMORY.md + 当日笔记

### 5. 飞书深度集成
- 日程创建/查询/忙闲分析
- 任务管理（创建/分配/子任务/评论）
- 多维表格 CRUD
- 知识库文档读写
- 云空间文件管理
- 消息检索与回复
- 审批流程、视频会议

## 📁 项目结构

```
workspace/
├── AGENTS.md          # Agent 行为规范与目录约定
├── SOUL.md            # 人格定义
├── USER.md            # 用户画像
├── MEMORY.md          # 长期记忆索引（分层 L1/L2）
├── HEARTBEAT.md       # 心跳任务定义
├── TOOLS.md           # 工具与环境配置
├── IDENTITY.md        # Agent 身份
├── SAFETY.md          # 安全操作规范
├── skills/            # 87 个 Skill 插件
│   ├── lark-*/        # 飞书系列（22个）
│   ├── firecrawl-*/   # 网页爬取系列（8个）
│   ├── *-audit/       # 安全审计系列
│   └── ...
├── docs/              # 正式文档（19+ 文件）
│   ├── sanitization-rules.md     # 敏感数据脱敏规则（176条）
│   ├── openclaw-vs-openharness.md
│   ├── teach-claude-code-tier2/  # Claude Code 教程 Tier 2
│   └── teach-claude-code-tier3/  # Claude Code 教程 Tier 3
├── scripts/           # 自动化脚本（5个）
│   ├── github-sync.sh           # GitHub 自动同步（含脱敏）
│   ├── cdp-control.py           # Chrome CDP 控制
│   ├── chrome-remote.sh         # Chrome 远程管理
│   ├── daily-papers-push.sh     # 每日论文推送
│   └── subagent-stats.sh        # SubAgent 统计
└── rules/             # 编码规范
```

## 🔧 技术栈

| 组件 | 技术 |
|------|------|
| Agent 框架 | [OpenClaw](https://github.com/openclaw/openclaw) |
| 主模型 | GLM-5-Turbo (智谱, 204K context) |
| 辅助模型 | GLM-5 / GLM-5.1 / GLM-4.7-Flash / GLM-5V-Turbo |
| 记忆引擎 | OpenViking v0.3.2, embedding-3 |
| 通信渠道 | 飞书 |
| 运行环境 | WSL2 (Ubuntu) + Windows |
## 📸 实际运行截图

### 系统状态
```
OpenClaw (latest)
87 Skills loaded
7 Cron Jobs active
Model: GLM-5-Turbo
Channel: Feishu ✅
```

### 每日早报示例
```
🌅 早安 | 2026-05-03 周六

🔐 安全简报
今日无高危安全通告

📅 今日日程
（无）

📋 待办提醒
- GitHub 仓库脱敏规则完善

🔥 热榜速览
- [1] anthropic/claude-code · Claude Code 新增 Agent SDK
- [2] openclaw/openclaw · OpenClaw 最新版本发布
- [3] vercel/ai · AI SDK v4 正式发布

🌤 天气
28°C 多云 · 短袖即可
```

### Sub-Agent 任务派发
```markdown
## 任务：代码审查

### Goal
审查目标仓库的代码质量，输出修复建议

### Context
- 目标: GitHub 开源项目
- 关注: 安全漏洞、代码规范、性能问题

### Constraints
1. 仅扫描核心业务模块
2. 输出 Markdown 格式报告
3. max_turns: 10

### Done 标准
1. 所有目标文件已审查
2. 问题按严重程度分级
3. 修复建议包含代码示例
```

## 📈 运行数据

- **Skill 插件**: 87 个
- **定时任务**: 7 个（覆盖日常、监控、知识管理）
- **文档**: 19+ 篇正式文档
- **自动化脚本**: 5 个
- **记忆条目**: 200+ 条（OpenViking 向量记忆）
- **每日早报**: 自动生成并归档到飞书知识库

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

# 克隆本仓库
git clone https://github.com/zxc1213/openclaw-ai-workspace.git
cd openclaw-ai-workspace

# 复制到 OpenClaw workspace
cp -r AGENTS.md SOUL.md USER.md MEMORY.md HEARTBEAT.md TOOLS.md IDENTITY.md SAFETY.md ~/.openclaw/workspace/
cp -r skills/ ~/.openclaw/workspace/
cp -r scripts/ ~/.openclaw/workspace/
cp -r docs/ ~/.openclaw/workspace/

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

> 基于 OpenClaw 构建了一套完整的 AI Agent 生产力系统。通过飞书作为统一交互入口，实现了日程管理、消息检索、文档协作、每日安全情报早报、开源项目版本监控等 30+ 自动化场景。
>
> 系统采用多 Agent 协作架构——主 Agent 负责意图识别和任务调度，专职 Sub-Agent 在隔离会话中执行编码审查、网页爬取等任务。配合 OpenViking 向量记忆库实现跨会话知识持久化，通过 Skill 机制将 87 个工作流沉淀为可复用插件。
>
> 安全方面，建立了 176 条敏感数据脱敏规则，配合自动化同步脚本，确保公开仓库零泄露风险。日常运行 7 个定时任务，覆盖智能早报、周报生成、服务器健康检查等场景，显著降低了重复性事务处理成本。

## 📄 文档索引

| 文档 | 说明 |
|------|------|
| [AGENTS.md](./AGENTS.md) | Agent 行为规范、目录约定、Sub-Agent 派发规范 |
| [SOUL.md](./SOUL.md) | 人格定义、价值观、自我进化机制 |
| [MEMORY.md](./MEMORY.md) | 长期记忆索引（分层 L1 核心事实 + L2 详细内容） |
| [HEARTBEAT.md](./HEARTBEAT.md) | 心跳任务定义、Memory 管理流程 |
| [TOOLS.md](./TOOLS.md) | 工具配置（代理、API 等） |
| [USER.md](./USER.md) | 用户画像与偏好 |
| [SAFETY.md](./SAFETY.md) | 安全操作规范（操作分级与确认机制） |
| [脱敏规则](./docs/sanitization-rules.md) | 176 条敏感数据脱敏规则 |

## License

MIT

---

Built with ❤️ · Powered by [OpenClaw](https://github.com/openclaw/openclaw) + [智谱 GLM](https://bigmodel.cn)
