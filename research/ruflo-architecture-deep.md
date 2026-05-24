# Ruflo 架构深度分析

> 基于 GitHub README + docs/federation/README.md + API 文件结构分析
> 分析日期: 2026-05-14
> 仓库: https://github.com/ruvnet/ruflo（原名 claude-flow）

---

## 1. 仓库结构概览

```
ruflo/
├── ruflo-plugins/          # Claude Code 原生插件（32个）
├── docs/
│   ├── federation/         # 联邦通信文档（核心）
│   ├── USERGUIDE.md        # 用户指南（290KB，超大型）
│   ├── STATUS.md           # 项目状态
│   └── validation/         # 验证测试
├── v3/docs/
│   ├── CLAUDE-FLOW-VS-TEAMMATE-TOOL-COMPARISON.md
│   ├── adr/                # 架构决策记录
│   ├── ddd/                # 领域驱动设计
│   ├── benchmarks/         # 性能基准
│   └── examples/           # 示例
├── openclaw/               # OpenClaw 集成
└── CLAUDE.md               # 项目配置
```

## 2. 核心架构

### 2.1 底层引擎: Cognitum.One

- **语言**: Rust-based AI engine
- **组成**: AI engine + embeddings + memory + plugin system
- **特性**: 超级充能，不是简单的 prompt 编排
- **架构**: `User → Ruflo (CLI/MCP) → Router → Swarm → Agents → Memory → LLM Providers`

### 2.2 核心数据流

```
Self-Learning / Self-Optimizing Agent Architecture

User → Ruflo (CLI/MCP) → Router → Swarm → Agents → Memory → LLM Providers
                                    ↑
                            +── Learning Loop ──+
```

关键特点：**一个 `npx ruflo init` 就赋予 Claude Code 一个神经系统**：
- Agent 自组织为 Swarm
- 从每个任务中学习
- 跨 session 记忆
- 联邦通信（安全地与其它机器上的 Agent 对话）

### 2.3 安装方式

两种路径：

| 方式 | 适合 | 提供能力 |
|------|------|----------|
| **Claude Code Plugin** (轻量) | 尝试单个命令 | Slash commands + agent 定义 + skill |
| **CLI 安装** (完整) | 生产使用 | 完整 Ruflo loop: 98 agents, 60+ commands, 30 skills, MCP server, hooks, daemon |

```bash
# CLI 完整安装
npx ruflo@latest init wizard

# Plugin 轻量安装
/plugin marketplace add ruvnet/ruflo
/plugin install ruflo-core@ruflo
/plugin install ruflo-swarm@ruflo
```

---

## 3. Swarm 编排设计

### 3.1 核心概念

Ruflo 的 Swarm 不是简单的并行 subagent，而是**层级化、自适应的多 Agent 协作系统**：

- **Router**: 接收任务，根据类型路由到合适的 Swarm 或 Agent
- **Swarm**: 一组协作的 Agent，有内部协调逻辑
- **Agents**: 专业化执行单元（编码、测试、安全、文档等）

### 3.2 拓扑类型

| 拓扑 | 描述 | 适用场景 |
|------|------|----------|
| **Hierarchical** | 层级结构，Manager → Workers | 标准开发流程 |
| **Mesh** | 网状结构，Agent 间直接通信 | 需要紧密协作的复杂任务 |
| **Adaptive** | 根据任务动态调整拓扑 | 未知复杂度的任务 |

### 3.3 协调机制

- **Hooks 系统**: 12 个自动触发 worker（audit、optimize、testgap 等）
- **Autopilot**: Agent 在 loop 中自动运行，无需人工干预
- **Loop Workers**: 后台持续运行的 worker（scheduled, background tasks）
- **Workflows**: 可复用的多步骤任务模板

### 3.4 与 OpenClaw Subagent 的对比

| 维度 | OpenClaw Subagent | Ruflo Swarm |
|------|-------------------|-------------|
| 调度 | 主 agent 手动 spawn | Router 自动路由 |
| 拓扑 | 扁平（parent-child） | 层级/网状/自适应 |
| 通信 | sessions_send | Federation (零信任) |
| 记忆 | OpenViking (独立) | AgentDB + RAG + 向量 |
| 自学习 | 无 | SONEA + trajectory learning |

---

## 4. 自学习记忆系统

### 4.1 多层记忆架构

| 层 | 技术 | 用途 |
|----|------|------|
| **Session Memory** | context-restore | 单 session 内的记忆保存/恢复 |
| **Vector Memory** | AgentDB (HNSW) | 跨 session 语义搜索，150× 加速 |
| **RAG Memory** | ruflo-rag-memory | 混合搜索（hybrid search） |
| **Knowledge Graph** | RuVector | GPU 加速知识图谱 |
| **Learning Loop** | SONEA | 神经模式识别 + trajectory learning |

### 4.2 AgentDB

- **底层**: HNSW 索引向量数据库
- **性能**: 150×-12,500× 搜索加速
- **用途**: Fast vector storage for agent memory
- **格式**: 类似 JSON 的 agent 数据存储

### 4.3 SONEA 自学习

- **S**: Self-Optimizing Neural Architecture
- **O**: (模式识别)
- **N**: Neural patterns
- **E**: (经验积累)
- **A**: Adaptive learning

核心思想：从成功中学习模式，用 ReasoingBank 做类比推理，用 trajectory learning 记录任务执行路径，未来类似任务可以复用。

### 4.4 与 OpenViking 的对比

| 维度 | OpenViking | Ruflo AgentDB |
|------|-----------|---------------|
| 引擎 | 自研 | HNSW |
| 搜索 | 语义 | 语义 + 混合 + 图谱 |
| 学习 | 无自学习 | SONEA 神经模式 |
| 索引 | embedding-3 | 2048维 |
| 性能 | 基准 | 150× 加速 |

---

## 5. 联邦通信（Federation）

### 5.1 核心概念

联邦通信让两个或更多 Ruflo 安装（你的 Mac、服务器、队友的笔记本）发现彼此、交换签名 manifest、发送消息——**有界成本 + per-peer 信任门控**。

### 5.2 关键属性

- **Ed25519 身份** — 每个节点持有私钥；peers 交换 Ed25519 签名的 manifest。无中央目录
- **五级信任阶梯** — `UNTRUSTED → VERIFIED → ATTESTED → TRUSTED → PRIVILEGED`
- **Per-peer 预算 + 断路器** — 有界 token/USD per peer。持续失败自动 SUSPEND；进一步失败 EVICT
- **PII 管道 + 审计跟踪** — 每个 cross-peer envelope 通过 PII 检测。每个状态转换可审计
- **真实 Wire 传输** — WSS with permission-deflate 压缩，可选 cert pinning，stream multiplexing

### 5.3 信任等级与权限

| 等级 | 联邦能力 | 可达性 |
|------|----------|--------|
| `UNTRUSTED` | `discoverys` | 排除于 mesh — drop all |
| `VERIFIED` | `+ status, ping` | 发现端口 (9100) only |
| `ATTESTED` | `+ send, receive, query-reacted` | + 联邦消息 (9101-9199) |
| `TRUSTED` | `+ share-context, collaborative-task` | + ssh (22), services (80/443) |
| `PRIVILEGED` | `+ full-memory, remote-spawn` | 完整 mesh |

信任通过**重复成功交互**获得（TrustEvaluator 跟踪 score + interaction count）。

### 5.4 断路器机制

- **SUSPEND**: peer 的 outbound 发送 short-circuit。现有 session 继续；新 send 被拒绝。连续失败自动 EVICT
- **EVICT**: peer 的 outbound 发送 short-circuit。session 终止。需要 operator 显式 `federation_reactivate`
- **Breaker 不会 auto-reactivate** — integrator 负责确认 peer 健康

### 5.5 ADR-111: WireGuard Mesh (opt-in, since alpha.14)

解决 NAT/LAN 问题：
- WG keypair 与联邦密钥一同生成
- Mesh IP 从 nodeId 确定性派生（sha256 → /10.50.0.0/16）
- 联邦 breaker SUSPEND → `wg set ... allowed-ips ""`（soft-block at L3）
- 联邦 breaker EVICT → `wg set ... removed`（terminal）
- 每个 mutation 进入 append-only Ed25519-signed witness chain

### 5.6 与 OpenClaw Node 架构的对比

| 维度 | OpenClaw Node | Ruflo Federation |
|------|---------------|------------------|
| 发现 | 手动配置 | 自动发现 (manifest 交换) |
| 信任 | 二元（配置/不配置） | 五级渐进信任 |
| 通信 | Gateway 路由 | Ed25519 + WSS + WG mesh |
| 安全 | Token auth | 零信任 + PII 检测 + 审计 |
| 断路 | 无 | Per-peer 预算 + 断路器 |

---

## 6. Plugin 体系

### 6.1 Claude Code 原生插件（32 个）

#### 核心 & 编排
| 插件 | 功能 |
|------|------|
| ruflo-core | 基础 — server、health checks、plugin 发现 |
| ruflo-swarm | 协调多个 Agent 作为一个团队 |
| ruflo-autopilot | 让 Agent 在 loop 中自动运行 |
| ruflo-loop-workers | 调度后台任务（timer） |
| ruflo-workflows | 可复用多步骤任务模板 |
| ruflo-federation | 跨安装 Agent 安全协作 |

#### 记忆 & 知识
| 插件 | 功能 |
|------|------|
| ruflo-agentdb | 快速向量数据库 for Agent memory |
| ruflo-rag-memory | 混合搜索（hybrid search） |
| ruflo-rvf | Session 间记忆保存 |
| ruflo-ruvector | GPU 加速搜索 |
| ruflo-knowledge-graph | 知识图谱 |

#### 智能 & 学习
| 插件 | 功能 |
|------|------|
| ruflo-intelligence | 智能增强 |
| ruflo-daa | DAA (Decision/Action/Assessment) |
| ruflo-rvllm | 本地 LLM 集成 |
| ruflo-goals | 目标管理 |

#### 代码质量
| 插件 | 功能 |
|------|------|
| ruflo-testgen | 自动测试生成 |
| ruflo-browser | Playwright 浏览器自动化 |
| ruflo-jujutsu | Git diff 分析 |
| ruflo-docs | 文档生成 |

#### 安全
| 插件 | 功能 |
|------|------|
| ruflo-security-audit | 安全审计 |
| ruflo-aidefense | AI 防御 |

#### 架构
| 插件 | 功能 |
|------|------|
| ruflo-adr | 架构决策记录 |
| ruflo-ddd | 领域驱动设计 |
| ruflo-sparc | 5 阶段开发方法论 |

#### DevOps
| 插件 | 功能 |
|------|------|
| ruflo-migrations | 数据库迁移 |
| ruflo-observability | 可观测性 |
| ruflo-cost-tracker | 成本追踪 |

### 6.2 npm 插件（21 个）

通过 `npm install @claude-flow/*` 安装的独立包，功能与 Claude Code 插件重叠但可独立使用。

### 6.3 Marketplace 机制

```bash
# 添加 marketplace
/plugin marketplace add ruvnet/ruflo

# 安装插件
/plugin install ruflo-core@ruflo
/plugin install ruflo-swarm@ruflo
```

设计理念：社区贡献插件，通过 namespace 隔离（`@ruflo`），版本管理。

---

## 7. 与 OpenClaw 对比与可借鉴点

### 7.1 架构对比

| 维度 | OpenClaw | Ruflo |
|------|----------|-------|
| **定位** | 个人 AI Agent 运行时 | 多 Agent 编排平台 |
| **核心引擎** | Node.js + TypeScript | Rust (Cognitum.One) |
| **Agent 调度** | sessions_spawn (subagent) | Router → Swarm → Agents |
| **记忆** | OpenViking (向量搜索) | AgentDB + RAG + 知识图谱 |
| **通信** | Gateway + channels | Federation (零信任) |
| **Skill 系统** | Markdown SKILL.md | Plugin (Markdown + TypeScript) |
| **安全** | Token auth + sandbox | Ed25519 + PII + 审计 |
| **生态** | ClawHub | Marketplace (32+21 插件) |

### 7.2 可借鉴点（按优先级）

#### P0 — 直接可借鉴
1. **渐进信任模型**: Ruflo 的五级信任（UNTRUSTED→PRIVILEGED）比 OpenClaw 的二元信任更精细
2. **断路器机制**: Per-peer 预算 + 自动 SUSPEND/EVICT，防止失控 agent
3. **PII 检测管道**: Cross-peer 消息自动 PII 检测

#### P1 — 设计参考
4. **自适应 Swarm 拓扑**: 根据任务复杂度动态选择层级/网状/自适应
5. **Background Workers**: 12 个自动触发 worker（audit、optimize、testgap）
6. **Goal Planner**: 自然语言目标 → 可执行 agent 计划
7. **Cost Tracker**: 内置成本追踪和预算控制

#### P2 — 长期参考
8. **SONEA 自学习**: 从成功中学习的神经模式
9. **WireGuard Mesh**: 解决 NAT/内网穿透的 agent 通信
10. **ADR/DDD 方法论插件**: 架构决策记录 + 领域驱动设计

### 7.3 OpenClaw 的优势
- **更轻量**: 不需要 Rust 引擎，纯 Node.js
- **更灵活**: 通用 Agent 运行时，不绑定 Claude Code
- **已有生态**: ClawHub + 飞书/微信/QQ 等多渠道
- **中文友好**: 原生中文支持

---

## 8. 总结

Ruflo 是一个**雄心勃勃的多 Agent 编排平台**，核心创新在于：

1. **零信任联邦通信** — 解决了多机器 Agent 协作的安全问题
2. **自学习记忆** — Agent 从经验中学习，越用越聪明
3. **Plugin 生态** — 32 个专业插件，Marketplace 模式

但它的复杂度也更高，依赖 Claude Code 生态，且 Rust 引擎增加了部署门槛。对于 OpenClaw 来说，最有价值的是**联邦通信的信任模型**和**断路器机制**——这些可以以更轻量的方式集成到 OpenClaw 的 node + gateway 架构中。
