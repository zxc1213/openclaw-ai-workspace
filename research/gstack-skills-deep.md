# gstack Skills 深度分析

> 提取自 /tmp/gstack/ 仓库，分析日期 2026-05-14
> 聚焦 12 个核心 skill 的角色设定、prompt 结构和设计模式

---

## 架构概览

### 核心理念
gstack 给 Claude Code 装配了持久浏览器 + 一套固执己见的 workflow skills。关键洞察：AI agent 交互浏览器需要**亚秒延迟**和**持久状态**。所以 gstack 运行长驻 Chromium daemon，通过 localhost HTTP 通信。

```
Claude Code → CLI (compiled binary) → HTTP POST → Server (Bun.serve) → CDP → Chromium
```

### 技术选型
- **Bun**: 编译为单 ~58MB 可执行文件，原生 SQLite（cookie 解密），原生 TypeScript
- **Daemon 模型**: 首次启动 ~3s，后续 ~100-200ms/命令
- **安全**: localhost only, Bearer token auth, 6 层 prompt 注入防御（L1-L6）
- **Ref 系统**: 基于 ARIA tree 的元素引用（@e1, @e2），用 Playwright Locator 不修改 DOM

### SKILL.md 模板系统
```
SKILL.md.tmpl (人写散文 + 占位符) → gen-skill-docs.ts → SKILL.md (自动生成部分 + 提交到 git)
```
每个 skill 共享大量 preamble（~500 行）：update check、session tracking、telemetry、AskUserQuestion format、learnings search 等。

### 全生命周期 Pipeline
```
office-hours → plan-ceo-review → plan-eng-review → implement → review → qa → ship → retro
                                                    ↑
                                              autoplan (自动串联前三个)
```

---

## 通用设计模式

### 1. 角色扮演框架
每个 skill 都有鲜明的角色人格：
- **YC Office Hours** → YC 合伙人（逼问产品本质）
- **CEO Review** → Brian Chesky 模式（品味 + 野心）
- **Eng Manager** → 技术负责人（架构 + 防御性思考）
- **Staff Engineer (review)** → 找 CI 通过但生产爆炸的 bug
- **CSO** → 做过真实事件响应的安全官
- **Debugger (investigate)** → 铁律：没有根因分析不准修
- **QA Lead** → 测试 + 修 bug + 自动回归测试
- **Release Engineer (ship)** → 全自动，不问，干就完了

### 2. AskUserQuestion 决策框架
统一的交互决策格式，贯穿所有 skill：
```
D<N> — <标题>
ELI10: <16 岁能懂的英文解释>
Stakes if wrong: <选错的代价>
Recommendation: <推荐选项> because <理由>
Completeness: A=X/10, B=Y/10
Pros/cons with ✅❌ (≥40 chars per bullet)
Net: <一句话 tradeoff 总结>
```
- 每个选项必须有 `(recommended)` 标签供 AUTO_DECIDE 使用
- 决策分类：Mechanical（自动决定）、Taste（合理人可分歧）、User Challenge（双模型一致推荐不同方向）

### 3. 认知模式注入（Cognitive Patterns）
不是 checklist，而是"思维本能"：
- CEO review 注入 18 条：Bezos 可逆性分类、Munger 逆向思考、Altman 杠杆执念、Grove 偏执扫描...
- Eng review 注入 15 条：Larson 团队状态诊断、McKinley 选择无聊技术、Fowler 绞杀者模式...
- 设计 review 注入：用户行为基础（扫描模式、满意化决策、善意储备）

### 4. Boil the Lake 完整性原则
AI 编码让实现成本降低 10-100x，因此：
- " completeness is cheap" → 永远选完整版本而非捷径
- 70 行代码差异 = AI 几秒钟的成本，不值得为"少写"而牺牲完整性

### 5. 优先级层级（Priority Hierarchy）
每个 skill 都定义了上下文压力下的优先级排序：
```
Step 0 > 系统审计 > 错误/恢复映射 > 测试图 > 失败模式 > 意见建议 > 其余
```
关键：Step 0 和系统审计永不跳过。

### 6. Prior Learnings 复利系统
每个 skill 启动时搜索历史学习记录（JSONL 格式），匹配时显示：
```
Prior learning applied: [key] (confidence N/10, from [date])
```
让用户看到 gstack 在他们的代码库上越来越聪明。

### 7. 图表强制原则
- "No non-trivial flow goes undiagrammed"
- ASCII art 用于数据流、状态机、依赖图、决策树
- 图表维护是变更的一部分，过时图表比没有更糟

### 8. 交互 vs 自动决策分离
- **Interactive skills**（ceo-review, eng-review, office-hours）：每个关键决策都通过 AskUserQuestion
- **Auto skills**（autoplan, ship）：用 6 条决策原则自动回答中间问题，只把品味决策留给最终审批门
- **Spawned session 模式**：检测 `OPENCLAW_SESSION` 环境变量，自动选推荐选项，不问

### 9. 硬门（Hard Gates）
- office-hours: **不准写代码**，只输出设计文档
- investigate: **不准修 bug** 直到根因假设形成
- learn: **不准改代码**，只管学习记录
- ship: **不问确认**，全自动（除非遇到阻塞项）

### 10. 四种 Review 模式
CEO review 的四种模式贯穿所有 plan 类 skill：
- **SCOPE EXPANSION**: 大教堂模式，每个扩展用户 opt-in
- **SELECTIVE EXPANSION**: 持有当前 scope + 逐个呈现扩展机会
- **HOLD SCOPE**: 严格审查，不增不减
- **SCOPE REDUCTION**: 外科手术，找到 MVP

---

## Skill 详解

### /office-hours
- **角色**: YC 合伙人 — "确保问题被理解，而非方案被提出"
- **核心 Prompt**: 两种模式。Startup 模式用 6 个强迫性问题（需求真实性、现状替代方案、绝望具体性、最窄楔子、观察与惊喜、未来适配）；Builder 模式用设计思维头脑风暴。产出设计文档（design doc），不写代码
- **设计亮点**: 
  - "Hard gate" 禁止实现动作
  - 前提挑战（premise challenge）— 可证伪的产品声明
  - 实现替代方案（2-3 个，附 honest 工时估算）
  - 完成后反思用户"怎么思考的"并写入设计文档
  - Steelman prompt 用于生成独立第二意见
- **衔接**: 输出 design doc → /plan-ceo-review, /plan-eng-review 消费

### /plan-ceo-review
- **角色**: Brian Chesky / 创始人模式 — "让这个产品变得不可避免、令人愉悦、甚至有点神奇"
- **核心 Prompt**: 不是实现 ticket，而是重新思考问题。例："photo upload" 不是功能，"帮助创建真正能卖出去的 listing" 才是。18 条认知模式注入（Bezos、Munger、Altman、Grove 等人的思维本能）。9 条首要指令（零静默失败、每个错误有名字、数据流有阴影路径等）
- **设计亮点**:
  - 4 种 scope 模式，commit 后不漂移
  - Pre-review 系统审计（git log、TODO/FIXME、设计文档检查）
  - 可选 Codex 跨模型计划审查
- **衔接**: 输入 office-hours design doc → 输出 reviewed plan → /plan-eng-review

### /plan-eng-review
- **角色**: Eng Manager — "不是把想法变小，而是让想法可构建"
- **核心 Prompt**: 锁定架构、数据流、图表、边界情况、测试覆盖。强制图表（序列图、状态图、组件图）。15 条工程领导认知模式（状态诊断、无聊默认、增量优于革命、系统优于英雄等）。工程偏好：DRY、测试不可妥协、显式优于聪明、右大小 diff
- **设计亮点**:
  - Step 0 scope challenge（8+ 文件或 2+ 新类触发复杂度气味检查）
  - 自动搜索已有方案避免重复造轮子
  - 输出 test plan artifact → /qa 自动消费
  - 无 design doc 时主动建议先跑 /office-hours
- **衔接**: CEO plan → eng-reviewed plan → implementation

### /review
- **角色**: Staff Engineer — 找 CI 通过但生产爆炸的 bug
- **核心 Prompt**: 分析当前分支 diff vs base branch 的结构问题。Step 1.5 Scope Drift Detection（先检查"是不是造了要求的东西"）。自动发现 plan file 并提取 actionable items，对照 diff 检查完成度
- **设计亮点**:
  - Scope drift 检测（SCOPE CREEP / REQUIREMENTS MISSING）
  - Plan file 多路径发现（对话上下文 → 内容搜索 → 文件 glob）
  - 自动修复明显问题
- **衔接**: 代码完成 → /review → /ship

### /cso
- **角色**: Chief Security Officer — "做过真实事件响应、向董事会汇报过安全态势"
- **核心 Prompt**: "真正的攻击面不是你的代码，而是你的依赖"。Phase 0 先建架构心智模型和栈检测。多模式（daily 8/10 confidence gate, comprehensive 2/10 bar, --infra, --code, --skills, --supply-chain, --owasp, --diff）。输出 Security Posture Report
- **设计亮点**:
  - 14 个阶段的结构化审计
  - 互斥 scope flags + 可组合 --diff
  - 趋势追踪（跨审计运行）
  - 严格：scope flags 冲突时立即报错，不静默选择
- **衔接**: 独立审计，不直接衔接 pipeline

### /investigate
- **角色**: Debugger — 系统化根因调试
- **核心 Prompt**: 铁律"没有根因分析不准修"。4 阶段：根因调查 → 模式分析 → 假设验证 → 修复 + 验证。Scope Lock（freeze 目录防范围蔓延）。3 次修复失败后停止
- **设计亮点**:
  - 假设形成后锁定编辑范围（/freeze 集成）
  - 假设关键词驱动二次学习搜索
  - 修复后生成回归测试
- **衔接**: bug 发现 → /investigate → 修复 → /review

### /codex
- **角色**: Multi-AI Second Opinion — "200 IQ 自闭开发者"（OpenAI Codex CLI 包装）
- **核心 Prompt**: 3 种模式：Review（pass/fail gate）、Challenge（对抗性）、Consult（开放咨询）。文件系统边界指令前缀所有 prompt。Reasoning effort override (--xhigh)
- **设计亮点**:
  - 跨模型审查（Claude + Codex 双重意见）
  - 自动 diff 检测 + plan file 发现
  - Auth probe + 版本检查（known-bad list）
  - 可被 /autoplan 和 /plan-ceo-review 内部调用
- **衔接**: 被 autoplan 自动调用，也可独立使用

### /qa
- **角色**: QA Lead — "测试 + 修 bug + 自动回归测试"
- **核心 Prompt**: 测试 Web 应用像真实用户。找到 bug → 原子提交修复 → 重新验证。Tier 系统（quick/standard/exhaustive 决定修复范围）。Diff-aware 模式自动检测 feature branch
- **设计亮点**:
  - 测试框架自动引导（无框架时 bootstrap）
  - 工作树脏检查（必须 clean 才能跑）
  - CDP 模式检测（真实浏览器已登录时跳过 cookie 导入）
  - 消费 /plan-eng-review 的 test plan artifact
- **衔接**: 实现 → /qa → /ship

### /ship
- **角色**: Release Engineer — 全自动发布
- **核心 Prompt**: "用户说 /ship 意思是干。不问确认，直跑到最后输出 PR URL"。Review Readiness Dashboard（Eng Review 是唯一必需门）。幂等重跑。自动拆分 bisectable commits
- **设计亮点**:
  - "Never stop for" vs "Only stop for" 的明确清单
  - Review readiness dashboard（Eng/CEO/Design/Adversarial/Outside Voice）
  - 自动版本号管理（MICRO/PATCH）、CHANGELOG 生成
  - 预发布 review（Step 9）+ 文档发布
  - Staleness detection（review 后有多少新 commit）
- **衔接**: /review + /qa → /ship → PR

### /autoplan
- **角色**: Auto-Review Pipeline — "一条命令，粗糙计划进，完整审查计划出"
- **核心 Prompt**: 从磁盘读取完整的 CEO + Design + Eng + DX review skill 并按全深度执行。唯一区别：中间 AskUserQuestion 用 6 条决策原则自动回答。品味决策在最终审批门呈现
- **设计亮点**:
  - 6 条决策原则：completeness、boil lakes、pragmatic、DRY、explicit、bias toward action
  - 决策分类：Mechanical / Taste / User Challenge
  - 严格顺序执行（CEO → Design → Eng → DX），禁止并行
  - User Challenge 除非是安全/可行性风险，否则用户原始方向是默认值
- **衔接**: 输入 plan → 输出 fully-reviewed plan

### /learn
- **角色**: Staff Engineer 维护团队 wiki — 项目学习记录管理
- **核心 Prompt**: 6 个子命令（show/search/prune/export/stats/add）。Hard gate 不改代码。学习记录按类型分组（Patterns/Pitfalls/Preferences/Architecture），含置信度评分
- **设计亮点**:
  - Stale 检测（引用文件已删除）+ 矛盾检测（同 key 不同 insight）
  - JSONL append-only（最新条目胜出）
  - Export 为 markdown 可直接追加到 CLAUDE.md
- **衔接**: 所有 skill 的学习产出汇聚于此

### /retro
- **角色**: Eng Manager — 周度工程回顾
- **核心 Prompt**: 分析 commit 历史、工作模式、代码质量。团队感知（识别当前用户，分析每个贡献者的表扬和成长机会）。支持 compare 模式和 global 跨项目模式
- **设计亮点**:
  - 12 条并行 git 命令收集原始数据
  - Per-person breakdown、shipping streaks、test health trends
  - 午夜对齐的时间窗口
  - Non-git context 支持（retro-context.md）
- **衔接**: 周期性回顾，fed by /learn

---

## Pipeline 衔接机制

### 数据流
```
设计文档 (~/.gstack/projects/<slug>/*-design-*.md)
    ↓
CEO 审查计划 (~/.gstack/projects/<slug>/ceo-plans/*.md)
    ↓
Eng 审查计划（含 test plan artifact）
    ↓
实现 → diff
    ↓
/review（scope drift + plan completion 检查）
    ↓
/qa（消费 test plan，diff-aware）
    ↓
/ship（review readiness dashboard，预发布 review）
    ↓
PR + /retro（周期回顾）
    ↓
/learn（学习记录沉淀，跨 session 复利）
```

### 状态持久化
- `~/.gstack/projects/<slug>/` — 设计文档、CEO 计划、learnings.jsonl
- `~/.gstack/sessions/` — 活跃会话追踪
- `~/.gstack/analytics/` — 技能使用遥测
- Review Readiness Dashboard — JSON 格式的审查日志

### 自动发现与衔接
- 无 design doc 时自动建议 /office-hours
- Eng review 输出 test plan → /qa 自动消费
- /autoplan 内部自动调用 /codex
- /ship 内部自动运行预发布 review
- 所有 skill 自动搜索 prior learnings

---

## OpenClaw 集成方式

### 分层调度
OpenClaw 作为编排层，gstack 提供方法论：
```
Simple (无 gstack) → Medium (gstack-lite, ~15 行规划纪律) → 
Heavy (指定 skill) → Full (完整 pipeline) → Plan (只规划不实现)
```

### 判定启发式
- <10 行代码 → Simple
- 多文件但方案明确 → Medium
- 用户指定 skill → Heavy
- feature/project/objective → Full
- "帮我规划" → Plan

### Native 方法论 Skills
4 个 skill 被适配为 OpenClaw 原生 skill（无 gstack 基础设施）：
- gstack-openclaw-office-hours
- gstack-openclaw-ceo-review
- gstack-openclaw-investigate
- gstack-openclaw-retro

### Spawned Session 检测
`OPENCLAW_SESSION=1` → 自动选推荐选项、跳过交互提示、纯 prose 报告

---

## 可借鉴的设计模式（Top 10）

### 1. 认知模式注入（Cognitive Patterns）
不是 checklist，而是从顶级从业者身上提取的"思维本能"。让 AI 审查时真正用 Bezos 的可逆性分类、Munger 的逆向思维去思考，而不是跑一个静态检查清单。

### 2. Boil the Lake 完整性原则
明确量化 AI 编码的成本优势（10-100x），将"完整性便宜"作为第一原则。每次做 scope decision 时主动提醒：这 70 行代码差异对 AI 来说只需几秒。

### 3. AskUserQuestion 决策框架
标准化的决策呈现格式（ELI10 + Stakes + Recommendation + Completeness + Pros/Cons），支持 AUTO_DECIDE 自动选择。将所有交互决策统一为一个可审计的协议。

### 4. 4 种 Scope 模式
EXPANSION / SELECTIVE / HOLD / REDUCTION 四档，用户选一次后 skill commit 不漂移。避免了 AI "自作主张扩大或缩小范围"的经典问题。

### 5. Prior Learnings 复利系统
每个 skill 自动搜索历史学习记录，匹配时显式标注"Prior learning applied"。让用户感知到系统在变聪明，而非每次从零开始。

### 6. 图表强制原则
"No non-trivial flow goes undiagrammed" + "图表维护是变更的一部分"。用 ASCII art 而非外部工具，确保可版本控制。

### 7. Scope Drift Detection
/review 的 Step 1.5：在审查代码质量之前先检查"是不是造了要求的东西"。分离 SCOPE CREEP 和 REQUIREMENTS MISSING 两种漂移。

### 8. 决策分类三档
Mechanical（自动）→ Taste（自动+最终门呈现）→ User Challenge（绝不自动，用户原始方向是默认值）。这是对"AI 自主决策边界"的精确定义。

### 9. Hard Gate + Anti-Skip 规则
每个关键阶段都有明确的"不准跳过"和"不准静默做"规则。如 /investigate 的"没有根因不准修"、/review 的"有非平凡发现必须经过 AskUserQuestion"。

### 10. Review Readiness Dashboard
结构化的审查状态仪表板，Eng Review 是唯一必需门，其余信息性展示。Staleness detection 检测 review 后的新 commit。将"是否可以发布"从一个模糊判断变成一个可机器检查的状态。

---

## 附录：Skill 元数据速查

| Skill | 角色 | 交互性 | 核心产出 | Pipeline 位置 |
|-------|------|--------|---------|--------------|
| /office-hours | YC 合伙人 | 高 | 设计文档 | 起点 |
| /plan-ceo-review | CEO/创始人 | 高 | 审查后计划 | 规划 |
| /plan-eng-review | Eng Manager | 高 | 技术计划+测试计划 | 规划 |
| /autoplan | 审查流水线 | 低（自动决策） | 完整审查计划 | 规划（串联） |
| /review | Staff Engineer | 中 | 审查报告+自动修复 | 实现→发布 |
| /investigate | Debugger | 中 | 根因+修复 | 调试 |
| /cso | CSO | 低 | 安全态势报告 | 独立审计 |
| /codex | 第二意见 | 中 | 跨模型审查 | 辅助审查 |
| /qa | QA Lead | 低（全自动） | Bug 报告+修复 | 实现→发布 |
| /ship | Release Engineer | 极低（全自动） | PR | 发布 |
| /learn | Wiki 维护者 | 低 | 学习记录管理 | 贯穿全程 |
| /retro | Eng Manager | 低 | 回顾报告 | 周期回顾 |
