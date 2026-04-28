# Skill 分配策略

> 当新增 skill 时，必须同步分配给相关 subagent，不能只装 main workspace。

## 通用原则
1. 新 skill 装到 `~/.openclaw/workspace/skills/` 后，评估哪些 subagent 需要
2. 用 symlink（`ln -sfn`），不复制
3. 按角色职责分配，不是越多越好（减少 token 消耗）

## 分配矩阵

### 全员通用（所有 agent 都给）
- self-improving-agent — 自我改进
- ontology — 知识图谱

### 按角色分配

| Skill 类型 | 💻 码农 | 🔍 评审 | 🔬 调研 | 📝 文案 | 📊 分析 | ⏰ 定时 | 🎨 设计 |
|-----------|---------|---------|---------|---------|---------|---------|---------|
| **网页抓取** (firecrawl/scrape) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **网页搜索** (firecrawl/search, tavily) | - | - | ✅ | ✅ | ✅ | ✅ | - |
| **整站爬取** (firecrawl/crawl,map,agent) | - | - | ✅ | - | - | - | - |
| **代码相关** (github, vibe-coding) | ✅ | ✅ | - | - | - | - | - |
| **安全相关** (security-briefing) | - | ✅ | - | - | ✅ | - | - |
| **飞书文档** (lark-doc,wiki,sheets) | - | - | - | ✅ | - | - | - |
| **飞书IM** (lark-im) | - | - | - | - | - | ✅ | - |
| **飞书日历** (lark-calendar) | - | - | - | - | - | ✅ | - |
| **浏览器自动化** (agent-browser) | - | - | - | - | - | - | ✅ |
| **摘要** (summarize) | - | - | ✅ | ✅ | ✅ | - | - |
| **任务分发** (agent-task-dispatch) | - | - | - | - | - | - | - |
| **知识同步** (lark-knowledge-sync) | - | - | - | ✅ | - | ✅ | - |
| **每日推送** (daily-digest) | - | - | - | - | - | ✅ | - |
| **知识库管理** (lark-wiki-curator) | - | - | - | ✅ | - | ✅ | - |

> agent-task-dispatch 仅供 main 使用（调度角色），不分发

## 新增 Skill 检查清单
- [ ] symlink 到 main workspace
- [ ] 评估需要该 skill 的 subagent
- [ ] symlink 到对应 subagent workspace
- [ ] 更新本矩阵
