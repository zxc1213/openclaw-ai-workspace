# gstack + Ruflo 学习 — Phase 1 分析

> 日期: 2026-05-14
> 状态: Phase 2 进行中（子任务已确认，subagent 深度研究进行中）

---

## A/B/C 分类结果

### gstack — 23 个 slash commands

| 分类 | 条目 | 标记 | 理由 |
|------|------|------|------|
| 🟢 A | `/browse` 浏览器自动化 | 已掌握 | 有 agent-browser skill |
| 🟢 A | `/freeze`/`/guard`/`/unfreeze` 编辑锁 | 已掌握 | 概念简单，已理解 |
| 🟢 A | `/ship` 发布流程 | 已掌握 | 已有 dev-workflow skill |
| 🟡 B | `/office-hours` 产品挑战 | 可落地 | 6 个强制问题方法论 |
| 🟡 B | `/autoplan` 自动 pipeline | 可落地 | CEO→Design→Eng 自动串联 |
| 🟡 B | `/plan-ceo-review` CEO 审查 | 可落地 | 10 星产品思维 |
| 🟡 B | `/plan-eng-review` 工程审查 | 可落地 | 架构锁定方法论 |
| 🟡 B | `/review` 代码审查 | 可落地 | Staff 级审查标准 |
| 🟡 B | `/cso` 安全审计 | 可落地 | OWASP + STRIDE |
| 🟡 B | `/investigate` 根因分析 | 可落地 | "无调查不修复"原则 |
| 🟡 B | `/learn` 跨 session 学习 | 可落地 | 类似 OpenViking |
| 🟡 B | `/codex` 跨模型审查 | 可落地 | 多模型交叉验证 |
| 🟡 B | `/retro` 周回顾 | 可落地 | 周报增强参考 |
| 🟡 B | `/careful` 安全警告 | 可落地 | 简单但实用 |
| 🔵 C | `/plan-design-review` 设计审查 | 新领域 | 设计评审方法论 |
| 🔵 C | `/design-shotgun` 设计探索 | 新领域 | 多变体 mockup |
| 🔵 C | `/design-html` 设计转代码 | 新领域 | 30KB 零依赖 HTML |
| 🔵 C | `/design-consultation` 设计系统 | 新领域 | 从零构建 |
| 🔵 C | `/plan-devex-review` DX 审查 | 新领域 | TTHW 基准 |
| 🔵 C | `/qa` 浏览器 QA | 新领域 | 真实浏览器测试 |
| 🔵 C | `/benchmark` 性能基准 | 新领域 | Core Web Vitals |
| 🔵 C | `/canary` SRE 监控 | 新领域 | 部署后验证 |
| 🔵 C | `/design-review` 设计审计 | 新领域 | 设计+修复 |
| 🔵 C | `/document-release` 文档 | 新领域 | 自动更新文档 |

**统计**: A: 3 / B: 11 / C: 10

### Ruflo — 32 个插件 + 核心架构

| 分类 | 条目 | 标记 | 理由 |
|------|------|------|------|
| 🟢 A | Swarm 基础编排 | 已掌握 | OpenClaw subagent 体系 |
| 🟢 A | 基础记忆 | 已掌握 | OpenViking |
| 🟢 A | MCP Server | 已掌握 | 已有 MCP 配置 |
| 🟢 A | CLI 安装/Init | 已掌握 | npm/CLI 基础 |
| 🟡 B | Swarm 拓扑设计 | 可落地 | 分层/网状/自适应 |
| 🟡 B | 自学习循环 | 可落地 | SONEA + trajectory |
| 🟡 B | 联邦通信概念 | 可落地 | 零信任跨组织 |
| 🟡 B | Plugin Marketplace | 可落地 | 生态设计 |
| 🟡 B | Background Workers | 可落地 | 12 个自动触发 |
| 🟡 B | Goal Planner | 可落地 | 自然语言→计划 |
| 🟡 B | Multi-Provider 路由 | 可落地 | 多模型智能选路 |
| 🟡 B | Security (AIDefense) | 可落地 | CVE/path traversal |
| 🟡 B | Cost Tracker | 可落地 | 成本监控 |
| 🔵 C | AgentDB 向量数据库 | 新领域 | HNSW 索引 |
| 🔵 C | RuVector 知识图谱 | 新领域 | GPU 加速 |
| 🔵 C | SONEA 神经模式 | 新领域 | 高级学习 |
| 🔵 C | Rust AI 引擎 | 新领域 | Cognitum.One |
| 🔵 C | Web UI (Beta) | 新领域 | 多模型聊天 |
| 🔵 C | DDD/ADR 方法论 | 新领域 | 领域驱动 |
| 🔵 C | SPARC 开发方法论 | 新领域 | 5 阶段开发 |

**统计**: A: 4 / B: 10 / C: 6

---

## Phase 2 子任务分解

| # | 子任务 | 优先级 | 包含内容 | 状态 |
|---|--------|--------|----------|------|
| 1 | gstack 核心理念 + 角色式 Slash Command 设计 | P0 | `/office-hours`、`/autoplan`、pipeline 衔接 | 🔄 研究中 |
| 2 | gstack 审查体系 + 安全审计 | P0 | `/review`、`/cso`、`/investigate`、`/codex` | 🔄 研究中 |
| 3 | gstack 设计 + QA 体系 | P1 | `/design-review`、`/qa`、`/benchmark`、`/canary` | ⬜ |
| 4 | Ruflo Swarm 编排 + 自学习架构 | P0 | Swarm 拓扑、联邦通信、自学习循环 | 🔄 研究中 |
| 5 | Ruflo 生态 + 最终总结 | P1 | Plugin Marketplace、Goal Planner、三方增益 | ⬜ |
