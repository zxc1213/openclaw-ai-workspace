# GLM Coding 开发者社区 — 深度学习笔记

> 学习来源：https://zhipu-ai.feishu.cn/wiki/TrlMwahsfihLrKkZsy0cpuTenCz
> 学习日期：2026-04-05
> 学习者：念念 🌙

---

## 一、知识库总览

GLM Coding 开发者社区是智谱官方搭建的知识库，围绕 GLM 模型 + Coding Agent 生态展开。分四大板块：

| 板块 | 内容 | 文章数 |
|------|------|--------|
| 新手修炼手册 | Coding Plan、模型指南、MCP、Agent 通用指南 | 5+ |
| 官方最佳实践 | 企业转型、研发流程、Harness 工程 | 8+ |
| 开发者精选 | 社区投稿：实战案例、工具技巧、创新应用 | 30+ |
| 编程工具技巧 | Claude Code、Kilo Code、OpenCode | 3+ |

---

## 二、核心文章深度笔记

### 2.1 Coding Agent 最佳实践 ⭐⭐⭐

**来源**：https://zhipu-ai.feishu.cn/wiki/FbOpwv5dfi6s9GkPjLFcVrN3nWd

十大原则：

1. **Agent 是协作者** — 持续配置优化，不是一次性问答
2. **任务结构化** — Goal + Context + Constraints + Done
3. **先规划再执行** — 分析需求 → 查找代码 → 拆分步骤 → 实现顺序
4. **规则沉淀为项目配置** — 临时指令写 prompt，长期规则写配置文件
5. **环境决定能力边界** — 三层上下文：任务 / 项目 / 环境
6. **参与完整开发闭环** — 改码 → 测试 → lint → 审查 → 迭代
7. **MCP 扩展上下文** — 从\"人工描述\"转向\"工具直接查询\"
8. **沉淀为 Skills** — 反复使用的流程就该做 Skill
9. **稳定流程自动化** — Skill 定义\"怎么做\"，Automation 决定\"何时做\"
10. **合理管理会话** — 独立线程、定期压缩、分支新建

**成熟度路线**：任务输入 → 规划 → 规则 → 环境配置 → 执行验证 → 工具接入 → 工作流沉淀 → 自动化

### 2.2 Coding Agent 工作原理 ⭐⭐

**来源**：https://zhipu-ai.feishu.cn/wiki/U0KnwnzjMinEz7k4ehKcoIJNnlf

- **Agentic Loop**：获取上下文 → 执行操作 → 验证结果（循环迭代）
- **驱动**：模型（推理决策）+ 工具（执行操作）
- **工具体系**：文件操作 / 搜索 / 命令执行 / Web / 代码分析
- **扩展组件**：Skills / MCP / Hooks / Subagents
- **配置文件对比**：Claude Code→CLAUDE.md, Cursor→.cursor/rules, Cline→.cline/rules, Codex→AGENTS.md

### 2.3 Harness 工程 ⭐⭐⭐（最震撼）

**来源**：https://zhipu-ai.feishu.cn/wiki/ZM7owzXtZiIWvBkFLnscQi5Jn5c

OpenAI 2026.2 官方提出：**Agent = Model + Harness**

**验证数据**：
- OpenAI：100w+ 行代码，零人工编写，时间约 1/10
- LangChain：同一模型仅改 Harness，52.8% → 66.5%
- Stripe：Minions 每周 1000+ PR，Slack 发任务 → AI 全流程 → 人工审核

**三大支柱**：

1. **上下文工程** — 静态（文档/规则）+ 动态（日志/CI），代码仓库是唯一\"事实来源\"
2. **架构约束** — 依赖分层、Linter、LLM 审计、结构化测试。**限制解空间反而提升效率**
3. **熵管理** — 文档一致性 Agent、约束扫描器、模式规范 Agent、依赖审计 Agent

**成熟度模型**：L1(1-2h) → L2(1-2d) → L3(1-2w)

**五大错误**：过度设计 / 视为静态 / 忽略文档 / 无反馈回路 / Human-Only 文档

### 2.4 Agentic 生态五层模型 ⭐⭐

**来源**：https://zhipu-ai.feishu.cn/wiki/OumbwSQgdiKnZjkrNSMcsQs7nue

| 组件 | 定位 | 持久性 |
|------|------|--------|
| Prompts | 当下指令 | 即时 |
| Skills | 可复用操作手册 | 跨会话 |
| Projects | 长期工作空间 | 持续积累 |
| Subagents | 独立执行单元 | 任务级 |
| MCP | 连接层协议 | 基础设施 |

**Skills 渐进式加载**：元信息(~100tok) → 完整说明(≤5k) → 资源文件。先定位→再深入→最后动用资源。

**关键区分**：Skills 教\"怎么做\"（跨 agent），Subagents 解决\"谁来做\"（隔离执行）

### 2.5 Claude Skill 创建终极指南 ⭐⭐

**来源**：https://zhipu-ai.feishu.cn/wiki/Q4FcwYirZiwiPikdseccUVtBneI

- **三组件**：名称 + 描述（决定触发率）+ 指令\n- **描述四要素**：能力 + 触发条件 + 上下文 + 边界\n- **\"菜单式\"设计**：主文件=菜单，子文件=菜谱，按需加载避免臃肿\n- **测试三场景**：常规 → 边界 → 超出范围\n- **黄金法则**：做过 5 次 + 未来 10 次 → 值得做 Skill；把\"好\"的标准写进指令

### 2.6 Superpowers 工程化编程 ⭐

**来源**：https://zhipu-ai.feishu.cn/wiki/U2l7wd0Egi1hBnkUemQc8kign5b

核心：剥夺 AI \"直接写代码\"权力，强制三步：
```
/brainstorm（需求对齐）→ /write-plan（施工图）→ /execute-plan（TDD 循环）
```
TDD：Red（先写测试报错）→ Green（写实现通过）→ Refactor（优化重构）

**核心观点**：AI 编程下半场拼的是\"控制力\"，不是模型能力。

---

## 三、开发者精选亮点

### 3.1 认证授权服务（实战案例）
- GLM + Claude Code 从零搭建：28 HTTP 接口 + 10 RPC 接口
- 关键做法：AI 先检索开源项目 → 制定方案 → 人工审核 → 编码 → 测试修复
- 一周工作量压缩到一天

### 3.2 OpenClaw 本地部署与飞书接入
- 社区有用户写了 OpenClaw + 飞书部署教程
- 说明 OpenClaw 在 GLM 社区已有影响力

### 3.3 自动化周报生成器
- QClaw + GLM，Skill 驱动，支持定时 + 邮件分发
- 思路可借鉴到 lark-workflow-standup-report

---

## 四、对 OpenClaw 的借鉴与行动计划

### 当前状态评估

| 维度 | 我们的现状 | 理想状态 | 差距 |
|------|-----------|---------|------|
| 项目配置 | ✅ AGENTS.md/SOUL.md/USER.md | 完善 | 小 |
| 任务结构化 | ⚠️ 自由格式为主 | Goal+Context+Constraint+Done | 中 |
| Harness 层 | ⚠️ 有 cron/heartbeat 但不系统 | 三支柱完整 | 大 |
| Skills 设计 | ⚠️ 部分较臃肿 | 菜单式、按需加载 | 中 |
| 开发闭环 | ⚠️ 无强制测试流程 | 改码→测试→审查→迭代 | 大 |
| 熵管理 | ⚠️ 心跳整理但无代码级管理 | 文档一致性+模式扫描 | 中 |
| 会话管理 | ⚠️ 60min 自动归档 | 智能压缩+分支策略 | 小 |

### 分阶段行动计划

#### Phase 1：快速见效（本周内）

**P1.1 优化任务输入结构**
- 给 subagent 派任务时使用 Goal+Context+Constraints+Done 模板
- 修改 coding-agent skill，增加 plan-first 模式
- 预计工作量：2h

**P1.2 Skills 菜单式瘦身**
- 审查现有 SKILL.md，拆分臃肿的主文件
- 主文件只保留概述+路由，详细步骤放 references/
- 预计工作量：3h

**P1.3 描述字段优化**
- 重新审视所有 skill 的 description，补齐能力+触发条件+上下文+边界
- 参考终极指南中的低效 vs 高效描述对比
- 预计工作量：1h

#### Phase 2：系统升级（1-2 周内）

**P2.1 Harness 基础建设（L1→L2）**
- 上下文工程：确保 AGENTS.md 精确、机器可读，作为唯一事实来源
- 架构约束：为 workspace 建立目录规范（参考 Harness 的依赖分层思想）
- 熵管理：在 heartbeat 中加入文档一致性检查（MEMORY.md vs daily notes）
- 预计工作量：4h

**P2.2 开发闭环强化**
- coding-agent skill 加入 Superpowers 式三步流程（brainstorm → plan → TDD execute）
- 新增 reviewer subagent 的 PR 审查清单功能
- 预计工作量：3h

**P2.3 上下文管理优化**
- 为复杂任务建立会话管理策略：独立线程、分支新建
- 长任务定期压缩上下文，保留关键决策
- 预计工作量：2h

#### Phase 3：高级能力（1 个月内）

**P3.1 熵管理 Agent**
- 创建专门的 entropy-checker subagent
- 周期性检查：daily notes 清理、MEMORY.md 精炼、LEARNINGS.md 去重
- 预计工作量：4h

**P3.2 Harness 反馈回路**
- 为 subagent 任务建立成功率跟踪（按任务类型统计）
- 定期输出 Agent 性能报告
- 预计工作量：3h

**P3.3 进阶 Automation**
- 将更多稳定 Skill 自动化：日报/周报生成、代码审查、安全扫描
- cron job 从 systemEvent 升级为更复杂的 agentTurn 工作流
- 预计工作量：持续

---

## 五、关键洞察

1. **\"相同模型，不同 Harness，结果天差地别\"** — 我们已经有不错的模型配置，提升空间在 Harness 层
2. **文档是最好的 Harness** — AGENTS.md / SOUL.md 的质量直接决定 Agent 行为质量
3. **限制解空间反而提升效率** — 给 Agent 越清晰的约束，它越快收敛
4. **菜单式 Skill 设计** — 省上下文、提精准度，这个设计模式应该全面推广
5. **Agent 看不到的信息等于不存在** — 一切重要知识必须存在于 workspace 内
6. **Vibe Coding 的解药是控制力** — 不是更强的模型，而是更好的流程约束

---

*文档版本 v1.0 | 最后更新 2026-04-05 01:00*
