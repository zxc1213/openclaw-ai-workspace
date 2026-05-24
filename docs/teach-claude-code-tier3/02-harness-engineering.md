# T3-02: Harness Engineering——同一模型，不同 Harness，天差地别

> 这是 GLM Coding 学习中最大的收获，也是我对 AI Agent 能力差异的根本理解。

## 核心论点

**Agent = Model × Harness**

同一个 GLM-5 模型：
- 在 OpenClaw 里，有 52 个 skill + 记忆系统 + subagent 编排 → 能管理日程、写文档、操作飞书、跑定时任务
- 在裸 API 里，只是一个补全器 → 只能聊天
- 在 Claude Code 里，有 shell access + git + 文件编辑 → 是个编程助手

**模型是引擎，Harness 是方向盘和仪表盘。** 没有好 Harness，再强的模型也跑不起来。

## 一、Harness 的三支柱

### 1. System Prompt（行为规范）

定义 agent "是谁"、"能做什么"、"不能做什么"。

**OpenClaw 的做法**：
- SOUL.md → 人格和语气（温暖、有主见、不说废话）
- AGENTS.md → 行为规范（归位规则、命名规范、安全红线）
- SAFETY.md → 安全边界（危险操作先确认）

**Claude Code 的等价物**：
- CLAUDE.md → 项目级 system prompt
- System prompt 本身 → Anthropic 预设的行为规范

**关键认知**：System prompt 不是"越长越好"。我们的 AGENTS.md 从最初的 200 行精简到 ~120 行，反而效果更好——因为噪声少了，关键规则更突出。

### 2. Tools（工具集）

定义 agent "能接触什么"。

**OpenClaw 的做法**：
- 内置工具：exec、read、write、web_search、browser...
- Skill 系统：50+ 个 skill 按需加载（firecrawl、feishu、github...）
- MCP：外部工具协议扩展

**Claude Code 的等价物**：
- Shell access（最核心的能力——能执行命令、读写文件、操作 git）
- 内置编辑器（直接修改代码）
- MCP 扩展（连接外部服务）

**关键认知**：工具的能力边界 = agent 的能力边界。给 agent shell access 后，它就变成了一个"有手"的存在。但不给安全约束，它也变成了一个"有手且有炸弹"的存在。

### 3. Memory（记忆系统）

定义 agent "记得什么"。

**OpenClaw 的做法**：
- 三层记忆（工作记忆/短期/长期），见 T3-01
- OpenViking 向量数据库 + 自动提取
- 文件系统作为冷存储

**Claude Code 的等价物**：
- session 内的对话历史
- CLAUDE.md 和项目文件（被动记忆，需 agent 主动读取）
- git history（被动记忆）

**关键认知**：没有持久记忆的 agent，每次都是"失忆"重启。OpenClaw 投入了大量精力在记忆架构上，这是它和裸 Claude Code 最大的差异之一。

## 二、Harness 质量决定 Agent 质量

### 实战对比

| 维度 | 裸 API | Claude Code | OpenClaw |
|------|--------|-------------|----------|
| 工具 | 无 | shell + editor | shell + editor + 50 skills + MCP |
| 记忆 | 无 | session 内 | 三层 + OpenViking |
| 行为规范 | system prompt | CLAUDE.md | AGENTS.md + SOUL.md + SAFETY.md |
| 多 agent | 无 | 无 | subagent 编排 |
| 定时任务 | 无 | 无 | cron 系统 |
| 上下文管理 | 手动 | /compact | 自动 compaction + memoryFlush |

### 关键洞察

1. **文档是最好的 Harness**——AGENTS.md 的质量直接决定 agent 行为质量。花时间打磨规范文档，比换更强的模型性价比高得多。

2. **限制解空间反而提升效率**——给 agent 明确的约束（"不要做 X"、"必须用 Y 格式"），反而比自由发挥效果更好。约束减少了探索空间，降低了出错概率。

3. **Skill 的菜单式设计**——每个 skill 有清晰的触发条件（"当用户说 X 时使用"）和边界（"不适用于 Y"），让 agent 能精确匹配工具，减少误用。

4. **Subagent 编排是乘法效应**——单 agent 能力有上限，但多 agent 协作能突破单点瓶颈。关键是要有好的任务模板（Goal + Context + Constraints + Done），否则 subagent 会在噪声中迷失。

## 三、对 Claude Code 用户的具体建议

### 1. 写好 CLAUDE.md

这是你能做的最有价值的投入。好的 CLAUDE.md 应该包含：

```markdown
# 项目概述
一句话说清楚这是什么项目

# 技术栈
具体版本，不要模糊

# 目录结构
关键目录的用途

# 常用命令
build、test、deploy、lint

# 编码规范
命名、格式、必须遵守的约定

# 红线
绝对不能做的事
```

### 2. 利用 MCP 扩展能力

Claude Code 支持 MCP，你可以连接：
- 数据库（查表结构、执行查询）
- 内部 API（调用公司服务）
- 外部工具（Jira、GitHub、飞书等）

这相当于给 Claude Code 安装"skill"。

### 3. 建立 .claude/ 目录

```
.claude/
├── CLAUDE.md          # 项目级 system prompt
├── conventions.md     # 编码约定
├── architecture.md    # 架构决策记录
└── decisions/         # ADR（Architecture Decision Records）
```

每次新 session 自动加载，相当于 OpenClaw 的 Session Startup。

### 4. 主动管理上下文

- 大任务拆成小 session，用 `--resume` 恢复
- 善用 `/compact` 压缩上下文
- 关键状态写到文件，不靠"脑子记"

## 四、思维模型

```
Agent 能力 = Model 基础能力 × Harness 放大系数

放大系数 = Tools × Memory × Prompt × Workflow

Tools:  能接触什么（工具集）
Memory: 记得什么（记忆系统）
Prompt: 知道什么（行为规范）
Workflow: 怎么协作（多 agent 编排）
```

**投资 Harness 的 ROI 远高于投资 Model。** 智谱 GLM-5 + 好的 Harness，能在很多场景下匹敌甚至超越 GPT-4 + 裸 API。反过来，GPT-4 没有好的 Harness，也只是个聊天机器人。
