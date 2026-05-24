# gstack + Ruflo 学习总结

> 学习周期: 2026-05-14
> 研究文件:
> - `research/gstack-skills-deep.md` (17,612 bytes, gstack 12 个核心 skill 深度分析)
> - `research/ruflo-architecture-deep.md` (8,554 bytes, Ruflo 架构深度分析)
> - `research/gstack-ruflo-analysis.md` (2,880 bytes, A/B/C 分类)

---

## 学习概况

| 项目 | 总条目 | A (已掌握) | B (可落地) | C (新领域) | 深入学习 |
|------|--------|-----------|-----------|-----------|---------|
| gstack | 23 个 slash commands | 3 | 11 | 10 | 12 个 (核心 skill 全覆盖) |
| Ruflo | 32 个插件 + 核心架构 | 4 | 10 | 6 | 核心架构全覆盖 |

---

## 能力变化

### 学习前已有
- [x] 基础代码审查 (review skill)
- [x] 浏览器自动化 (agent-browser)
- [x] Subagent 编排 (sessions_spawn)
- [x] 向量记忆 (OpenViking)
- [x] MCP Server 配置
- [x] Skill Markdown 体系

### 学习后新增
- [x] **认知模式注入设计** — 从顶级从业者提取"思维本能"而非 checklist (来源: gstack)
- [x] **Boil the Lake 完整性原则** — AI 编码成本优势显式化 (来源: gstack)
- [x] **决策分类三档** — Mechanical/Taste/User Challenge 精确定义 AI 自主决策边界 (来源: gstack)
- [x] **AskUserQuestion 决策框架** — 标准化决策呈现格式，支持 AUTO_DECIDE (来源: gstack)
- [x] **Pipeline 衔接设计** — skill 间数据流自动发现与消费 (来源: gstack)
- [x] **Scope Drift Detection** — 审查前先检查"是不是造了要求的东西" (来源: gstack)
- [x] **渐进信任模型** — 五级信任阶梯 (UNTRUSTED→PRIVILEGED) (来源: Ruflo)
- [x] **断路器机制** — Per-peer 预算 + 自动 SUSPEND/EVICT (来源: Ruflo)
- [x] **联邦通信概念** — 零信任跨组织 Agent 协作 (来源: Ruflo)
- [x] **自适应 Swarm 拓扑** — 层级/网状/自适应动态选择 (来源: Ruflo)
- [x] **Plugin Marketplace 生态设计** — 社区贡献 + namespace 隔离 (来源: Ruflo)

---

## 关键发现

### 1. gstack 的核心创新不是工具，是"认知框架"
23 个 slash commands 本质是 23 套**认知模式**——不是告诉 AI "检查这些项"，而是教 AI "像顶级从业者那样思考"。Bezos 的可逆性分类、Munger 的逆向思维、Altman 的杠杆执念——这些被注入为"思维本能"而非 checklist。

### 2. AI 自主决策边界的三档分类是最重要的设计
- **Mechanical**: 自动决定（如"用 TypeScript"不用问）
- **Taste**: 自动决定 + 最终门呈现（如"REST 还是 GraphQL"）
- **User Challenge**: 绝不自动，用户原始方向是默认值（如"删掉这个功能"）

这解决了 AI coding agent 最难的问题：**什么时候该自作主张，什么时候该问**。

### 3. Pipeline 衔接是 gstack 的隐藏杀手锏
每个 skill 不是孤岛——office-hours 输出 design doc → ceo-review 消费 → eng-review 消费 → qa 消费 test plan → ship 检查 review readiness。数据流自动发现、自动衔接。

### 4. Ruflo 的联邦通信是 Agent 间协作的终极形态
Ed25519 身份、五级信任、per-peer 预算、PII 检测、审计跟踪——这是一个企业级的多 Agent 安全通信协议。OpenClaw 的 node + gateway 架构天然支持类似能力，但缺少信任梯度。

### 5. 两个项目代表了两种哲学
- **gstack**: "教 AI 像人一样思考"（认知注入）
- **Ruflo**: "让 AI 自己学习"（自学习系统）
- **最佳实践**: 两者结合——注入顶级认知模式 + 自学习复利

---

## 落地计划

### P0 — 立即可做

| 增益项 | 落地方式 | 状态 |
|--------|----------|------|
| 决策分类三档引入 skill 设计 | 更新 AGENTS.md subagent 规范 | ⬜ |
| Boil the Lake 原则引入 coding tasks | 更新 coding-agent-plan-first skill | ⬜ |
| Pipeline 衔接模式引入审查流程 | 更新 pr-review / receiving-code-review skill | ⬜ |
| 断路器概念引入 subagent 管理 | sessions_spawn 增加超时/预算控制意识 | ⬜ |

### P1 — 短期可做

| 增益项 | 落地方式 | 状态 |
|--------|----------|------|
| 认知模式注入模板 | 创建新 skill 或更新现有 skill | ⬜ |
| AskUserQuestion 决策框架 | 标准化 skill 中的用户决策格式 | ⬜ |
| 渐进信任模型参考 | Node 权限增强时参考 | ⬜ |
| Background Workers 概念 | HEARTBEAT 增强 | ⬜ |

### P2 — 长期参考

| 增益项 | 落地方式 | 状态 |
|--------|----------|------|
| Scope Drift Detection | 代码审查增强 | ⬜ |
| 自学习记忆架构 | OpenViking 增强参考 | ⬜ |
| Plugin Marketplace | ClawHub 生态参考 | ⬜ |
| 联邦通信 | 跨节点协作参考 | ⬜ |
| Goal Planner | 任务分解增强参考 | ⬜ |
