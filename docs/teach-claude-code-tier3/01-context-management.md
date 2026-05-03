# T3-01: AI Agent 上下文管理实战

> 面向 Claude Code 的上下文管理方法论，基于 OpenClaw 生产环境验证。

## 核心问题

LLM 的上下文窗口是有限资源。Agent 越用越久，上下文越膨胀，质量越下降。**上下文管理的本质不是"清理"，而是"在有限窗口内保持最高的信息密度"。**

## 一、Compaction（上下文压缩）

### 什么是 Compaction

当上下文接近窗口上限时，系统自动触发压缩——把历史对话摘要化，释放空间给新内容。这就像给笔记本翻页，旧页的精华提炼成一行摘要写在扉页上。

### 实战配置（OpenClaw safeguard 模式）

| 参数 | 值 | 原因 |
|------|-----|------|
| 模式 | `safeguard` | 更保守，宁可多保留也不误删 |
| recentTurnsPreserve | 4 | 最近 4 轮完整保留，保证即时上下文不丢 |
| keepRecent | 8K tokens | 压缩后仍保留最近 8K 原文 |
| reserve | 16K tokens | 预留 16K 给后续对话，避免刚压缩又触发 |
| identifierPolicy | strict | 压缩时保留 ID、URL、端口等关键标识符 |

### 关键教训

1. **identifierPolicy 必须开 strict**——压缩后丢掉端口/路径/ID，agent 就会凭空捏造，产生幻觉
2. **postCompactionSections 要重注核心规范**——压缩后 agent "失忆"了，需要重新注入 Session Startup、Red Lines 等关键行为规范
3. **memoryFlush 配合 compaction**——压缩前自动把关键信息刷入持久记忆，防止摘要丢失的信息无法恢复

### 对 Claude Code 的启示

Claude Code 的 context window 有限，长时间 session 也会遇到类似问题。你可以：

- **主动整理**：定期让 Claude Code 用 `# Todo` / `# Context` 注释在代码或 markdown 中记录关键状态
- **拆 session**：复杂任务分阶段，每个阶段用独立的 `claude` session
- **写 CLAUDE.md**：类似 OpenClaw 的 AGENTS.md，在项目根放一个 CLAUDE.md 写明项目约定、架构、关键路径，每次新 session 自动加载

## 二、Memory 架构设计

### 三层记忆模型

```
┌─────────────────────────────────────┐
│  L1: 工作记忆（Context Window）      │  ← 当前会话，有限容量
│  最近 N 轮对话 + 注入的配置文件      │
├─────────────────────────────────────┤
│  L2: 短期记忆（Daily Notes）         │  ← memory/YYYY-MM-DD.md
│  当天事件、决策、临时笔记            │     7天后归档
├─────────────────────────────────────┤
│  L3: 长期记忆（Structured Index）    │  ← MEMORY.md + OpenViking
│  项目索引、基础设施、关键教训        │     永久保留
│  heartbeat-reflections/ 结构化沉淀  │     按类型分类
└─────────────────────────────────────┘
```

### 写入原则

1. **Daily Notes 写即时**——今天发生了什么、做了什么决策，先记下来，不要等整理
2. **MEMORY.md 写索引**——不是记细节，是记"去哪找细节"。格式：表格+关键词
3. **Heartbeat Reflections 写沉淀**——有长期价值的经验教训，按类型（decisions/lessons/people/reflections）分类存放
4. **重要的事写文件，不靠"脑子记"**——LLM 没有跨 session 的持久记忆，一切靠文件

### 读取原则（Session Startup）

每次新 session 启动时：

1. 读 SOUL.md / USER.md（知道我是谁、你是谁）
2. 读当天 + 昨天 Daily Notes（知道最近发生了什么）
3. 读 MEMORY.md（知道全局状态）
4. 读 HEARTBEAT.md（知道周期性任务）

### OpenViking 自动记忆（可选增强）

- OpenClaw 配置了 OpenViking 作为记忆后端
- 对话自动写入 session，达到 token 阈值（默认 20K）触发记忆提取
- 提取结果存入向量数据库，后续通过 `memory_recall` 语义搜索召回
- 好处：即使文件里没记的东西，也能通过语义搜索找回

### 对 Claude Code 的启示

Claude Code 没有内置持久记忆，但你可以模拟：

- **CLAUDE.md** = 我的 SOUL.md + AGENTS.md（项目约定 + 行为规范）
- **项目文档** = 我的 MEMORY.md（在 docs/ 下维护项目索引）
- **git log** = 天然的变更历史（`git log --oneline -50` 快速回顾）
- **`.claude/` 目录**：Claude Code 的记忆扩展点，可以放 markdown 文件作为持久上下文

## 三、会话路由决策

### 什么时候拆新会话

| 条件 | 策略 | 原因 |
|------|------|------|
| 任务 >10 轮且与当前无关 | 新 session | 避免上下文污染 |
| 长时间运行（>5min） | 后台 subagent | 主会话保持响应 |
| 不同项目/领域切换 | 看情况 | 可以靠 compaction 管住 |
| 需要干净环境测试 | 必须 new session | 避免 carry-over 干扰 |

### 什么时候留在当前会话

| 条件 | 原因 |
|------|------|
| 简单问答/快速查询 | 开新会话成本 > 收益 |
| 需要连续上下文（调试排错） | 拆了就断了线索 |
| 需要即时反馈的协作 | 拆 session 增加延迟 |

### 实战经验

1. **主会话是"大脑"，subagent 是"手脚"**——日常对话留在主会话（保持连续性），脏活累活派 subagent
2. **定时任务必须 isolated**——cron job 用独立 session，防止历史累积导致 overflow
3. **但 isolated 要注意上下文完整**——开了 lightContext（轻量上下文）后，agent 拿不到 TOOLS.md 里的 API key 配置，导致功能缺失。这是踩过的真实坑

### 对 Claude Code 的启示

- **`/compact`**：Claude Code 的压缩命令，等价于 OpenClaw 的 compaction
- **多 terminal**：复杂任务开多个 terminal 窗口跑不同 session，避免单窗口上下文爆炸
- **`claude --resume`**：恢复之前的 session，但注意长时间 session 质量下降
- **Headless mode**：`claude -p "task" --output-format json` 适合一次性子任务

## 四、上下文预算意识

### 概念

每次给 agent 下任务时，要有意识地控制注入的上下文量。不是"给的信息越多越好"，而是"给最关键的信息"。

### Subagent 任务模板（四要素）

```
Goal:     一句话说清楚要做什么、产出什么
Context:  关键背景，不超过 5 行，给文件路径不给全文
Constraints: 最多 5 条硬约束，多了说明任务太模糊
Done:     可验证的完成条件，不用形容词
```

### 为什么这很重要

- Context 塞太多 → agent 在噪声中迷失方向，输出质量下降
- Context 太少 → agent 缺少关键信息，需要反复追问
- 刚刚好 = 文件路径 + 关键约束 + 明确目标

### 对 Claude Code 的启示

当你给 Claude Code 一个复杂任务时：

1. **不要复制粘贴整个文件内容到 prompt**——给它文件路径，让它自己读
2. **先给目标，再给约束，最后给上下文**——符合 LLM 注意力机制
3. **分步骤给**——大任务拆成小步骤，每步给该步需要的上下文
4. **用 `@file` 引用**——Claude Code 支持在对话中引用文件，比粘贴更高效
