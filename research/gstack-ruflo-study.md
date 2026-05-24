# gstack + Ruflo 学习笔记

> 日期: 2026-05-14
> 标签: #claude-code #agent-orchestration #slash-commands #swarm #multi-agent

---

## 1. garrytan/gstack — YC CEO 的 Claude Code 软件工厂

**仓库**: https://github.com/garrytan/gstack
**作者**: Garry Tan (Y Combinator President & CEO)
**许可**: MIT
**核心定位**: 把 Claude Code 变成一个虚拟工程团队的 23 个 slash 命令工具

### 1.1 核心理念

Garry Tan 用 gstack 实现了个人产出 ~810× 的提升（对比 2013 年），60 天内交付 3 个生产服务、40+ 特性。核心观点：
- **不是 copilot，是团队** — 每个 slash command 扮演一个专业角色
- **流程驱动** — Think → Plan → Build → Review → Test → Ship → Reflect，每步衔接上一步
- **全 Markdown，零依赖** — 所有 skill 都是 Markdown 文件

### 1.2 工具矩阵（按 Sprint 流程排列）

#### 思考阶段
| Skill | 角色 | 功能 |
|-------|------|------|
| `/office-hours` | YC Office Hours | 6 个强制问题，重塑产品定义，挑战前提假设 |
| `/plan-ceo-review` | CEO/Founder | 找到 10 星产品，4 模式：扩展/选择性扩展/保持/缩减 |
| `/plan-eng-review` | Eng Manager | 锁定架构、数据流、ASCII 图、边缘情况、测试矩阵 |
| `/plan-design-review` | Senior Designer | 0-10 评分，AI Slop 检测，交互式设计决策 |
| `/plan-devex-review` | DX Lead | 开发者体验评审，TTHW 基准，摩擦点追踪 |
| `/autoplan` | Review Pipeline | 一键运行 CEO → Design → Eng Review，自动编码决策原则 |

#### 构建阶段
| Skill | 角色 | 功能 |
|-------|------|------|
| `/design-consultation` | Design Partner | 从零构建设计系统，研究竞品，生成真实 mockup |
| `/design-shotgun` | Design Explorer | 4-6 个 AI mockup 变体，浏览器对比板，品味记忆 |
| `/design-html` | Design Engineer | Mockup → 生产 HTML，30KB 零依赖，自动检测框架 |

#### 审查阶段
| Skill | 角色 | 功能 |
|-------|------|------|
| `/review` | Staff Engineer | 找 CI 通过但线上爆炸的 bug，自动修复明显的 |
| `/investigate` | Debugger | 系统性根因分析，铁律：没有调查不修复 |
| `/design-review` | Designer Who Codes | 设计审计 + 修复，原子提交，前后截图 |
| `/devex-review` | DX Tester | 实际测试 onboarding，计时 TTHW，截图错误 |
| `/codex` | Second Opinion | OpenAI Codex 独立审查，跨模型分析 |

#### 测试 & 安全
| Skill | 角色 | 功能 |
|-------|------|------|
| `/qa` | QA Lead | 真实浏览器测试，找 bug → 修 → 原子提交 → 回归测试 |
| `/cso` | Chief Security Officer | OWASP Top 10 + STRIDE 威胁建模 |
| `/benchmark` | Performance Engineer | Core Web Vitals、页面加载基线对比 |

#### 发布 & 运维
| Skill | 角色 | 功能 |
|-------|------|------|
| `/ship` | Release Engineer | 同步 main、跑测试、审计覆盖率、push、开 PR |
| `/land-and-deploy` | Release Engineer | 合并 PR → 等 CI → 部署 → 验证生产健康 |
| `/canary` | SRE | 部署后监控：console 错误、性能回归、页面故障 |
| `/document-release` | Technical Writer | 自动更新文档匹配已交付内容 |
| `/retro` | Eng Manager | 周回顾，个人分解、交付连续性、测试健康趋势 |

#### 能力工具
| Skill | 功能 |
|-------|------|
| `/browse` | 真实 Chromium 浏览器，~100ms/命令 |
| `/pair-agent` | 多 Agent 共享浏览器，支持 OpenClaw/Hermes/Codex/Cursor |
| `/careful` | 破坏性命令前警告 |
| `/freeze`/`/guard`/`/unfreeze` | 编辑锁，限制修改范围 |
| `/learn` | 跨 session 学习记忆管理 |

### 1.3 安装 & 集成

```bash
# 安装到 Claude Code
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup

# 团队模式（共享仓库自动更新）
(cd ~/.claude/skills/gstack && ./setup --team) && \
  ~/.claude/skills/gstack/bin/gstack-team-init required && \
  git add .claude/ CLAUDE.md && git commit -m "require gstack for AI-assisted work"
```

**支持的 Agent**: Claude Code、OpenAI Codex CLI、OpenCode、Cursor、Factory Droid、Slate、Kiro、Hermes、GBrain（10 个）

**OpenClaw 集成**: 
- ACP spawn Claude Code session 自动继承 gstack
- 4 个原生 ClawHub skill（无需 Claude Code session）

### 1.4 架构亮点

- **全 Markdown skill 系统** — 每个 slash command 是一个 `.md` 文件，写 prompt 即可创建
- **Pipeline 衔接** — `/office-hours` 输出 design doc → `/plan-ceo-review` 读取 → `/plan-eng-review` 写 test plan → `/qa` 执行
- **跨 Agent** — `/codex` 让 OpenAI 模型做独立审查
- **品味记忆** — `/design-shotgun` 记住用户偏好
- **团队模式** — 零 vendored files，每小时静默自动更新

### 1.5 可借鉴的点

1. **角色扮演式 Slash Command** — 每个 command = 一个专家角色，比通用 prompt 更精准
2. **Pipeline 设计** — 前一步输出是后一步输入，防止信息断层
3. **跨模型交叉审查** — Claude review + Codex review 双重保障
4. **全 Markdown 技能系统** — 易创建、易修改、易分享
5. **LOC 争议的回应** — 关注 logical code change 而非 raw LOC

---

## 2. ruvnet/ruflo — 多 Agent 协作编排平台

**仓库**: https://github.com/ruvnet/ruflo（原名 claude-flow）
**作者**: rUv
**许可**: MIT
**核心定位**: 100+ 专业化 Agent 编排平台，Swarm 协作 + 自学习记忆 + 联邦通信

### 2.1 核心理念

- **从 Claude Flow 更名而来**（Rust + Flow 状态）
- **底层引擎**: Cognitum.One — Rust-based AI engine + embeddings + memory + plugin system
- **核心架构**: `User → Ruflo (CLI/MCP) → Router → Swarm → Agents → Memory → LLM Providers`
- **自学习循环**: Learning Loop 连接所有组件

### 2.2 核心能力

| 能力 | 描述 |
|------|------|
| 🕸️ **100+ Agents** | 专业化 agent：编码、测试、安全、文档、架构 |
| 🔗 **Comms Layer** | 零信任联邦 — 跨机器/组织安全通信 |
| 🕸️ **Swarm Coordination** | 分层、网状、自适应拓扑 |
| 🧠 **Self-Learning** | SONEA 神经模式、ReasoingBank、trajector 学习 |
| 💾 **Vector Memory** | HNSW 索引 AgentDB，150× 搜索加速 |
| ⚙️ **Background Workers** | 12 个自动触发 worker（审计、优化、测试等） |
| 🔌 **Plugin Marketplace** | 32 个原生 Claude Code 插件 + 21 个 npm 插件 |
| 🔄 **Multi-Provider** | Claude、GPT、Gemini、Cohere、Ollama 智能路由 |
| 🛡️ **Security** | AIDefense、输入验证、CVE 修复、path traversal 防护 |
| 🤝 **Agent Federation** | 跨安装 agent 协作，零信任安全 |
| 🌐 **Web UI (Beta)** | flo.ruv.io — 多模型聊天 + MCP 工具调用 + WASM 工具画廊 |
| 🎯 **Goal Planner** | goal.ruv.io — Plan-English 目标 → 可执行 agent 计划 |

### 2.3 安装

```bash
# 一键安装
curl -fsSL https://cdn.jsdelivr.net/gh/ruvnet/ruflo@main/scripts/install.sh | bash

# 或 npm
npx ruflo@latest init wizard

# Claude Code 插件模式（轻量，仅 slash 命令 + agent 定义）
/plugin marketplace add ruvnet/ruflo
/plugin install ruflo-core@ruflo
/plugin install ruflo-swarm@ruflo

# MCP Server 模式（完整功能）
claude mcp add ruflo -- npx ruflo@latest mcp start
```

### 2.4 插件体系（32 个 Claude Code 原生插件）

**核心 & 编排**: ruflo-core, ruflo-swarm, ruflo-autopilot, ruflo-loop-workers, ruflo-workflows, ruflo-federation

**记忆 & 知识**: ruflo-agentdb (向量数据库), ruflo-rag-memory (混合搜索), ruflo-rvf (session 间记忆保存), ruflo-ruvector (GPU 加速搜索), ruflo-knowledge-graph

**智能 & 学习**: ruflo-intelligence, ruflo-daa, ruflo-rvllm (本地 LLM), ruflo-goals

**代码质量**: ruflo-testgen, ruflo-browser (Playwright), ruflo-jujutsu (Git diff 分析), ruflo-docs

**安全**: ruflo-security-audit, ruflo-aidefense

**架构**: ruflo-adr (架构决策记录), ruflo-ddd (领域驱动设计), ruflo-sparc (5 阶段开发方法论)

**DevOps**: ruflo-migrations, ruflo-observability, ruflo-cost-tracker

### 2.5 架构亮点

- **Cognitum.One Rust 引擎** — 超级充能的 AI 引擎，不是简单的 prompt 编排
- **零信任联邦** — Agent 跨机器协作但不泄露数据
- **SONEA 神经模式** — 从成功中学习，ReasoingBank 类比推理
- **AgentDB** — HNSW 索引向量数据库，150× 加速
- **RuVector Graph AI** — 知识图谱 + 向量搜索
- **MCP Server** — 标准 Model Context Protocol 集成
- **Plugin Marketplace** — 可扩展的插件生态

### 2.6 可借鉴的点

1. **Swarm 拓扑** — 分层/网状/自适应，不是简单的 flat agent 列表
2. **联邦架构** — 零信任跨组织 agent 协作，企业级安全
3. **自学习记忆** — 跨 session 记忆 + 模式识别 + trajectory learning
4. **Plugin 生态** — Marketplace 模式，社区贡献插件
5. **Web UI** — flo.ruv.io 多模型聊天直接调用 MCP 工具
6. **Goal Planner** — 自然语言目标 → 可执行 agent 计划

---

## 3. 对比分析

| 维度 | gstack | Ruflo |
|------|--------|-------|
| **哲学** | 虚拟团队，角色扮演 | Swarm 编排，自学习系统 |
| **规模** | 23 个 slash commands | 100+ agents + 32 插件 |
| **实现** | 纯 Markdown prompt | Rust 引擎 + TypeScript |
| **记忆** | `/learn` 基础记忆 | AgentDB + RAG + 向量搜索 + 知识图谱 |
| **协作** | 跨模型审查 (Codex) | 零信任联邦通信 |
| **安装** | git clone + setup | npm / curl 一键 |
| **学习曲线** | 低（熟悉 slash command 即可） | 中高（概念多） |
| **适合场景** | 个人/小团队高质量交付 | 企业级多 agent 复杂系统 |
| **与 OpenClaw 关系** | 原生集成（ACP + ClawHub） | MCP Server 模式集成 |

## 4. 对我们的启示

### 可直接借鉴
1. **Slash Command 角色** — 在 OpenClaw skills 中引入角色扮演式 slash command 概念
2. **Pipeline 设计模式** — skill 间输出/输入衔接，防止信息断层
3. **跨模型审查** — 用 GLM 做 review，另一个模型做独立审查
4. **设计审查自动化** — gstack 的 AI Slop 检测 + 设计评分值得参考

### 需要思考
1. **Swarm 编排** — Ruflo 的分层 swarm 在 OpenClaw subagent 体系下如何映射？
2. **联邦通信** — OpenClaw 的 node + gateway 架构是否天然支持类似能力？
3. **自学习记忆** — OpenViking + Ruflo 的 AgentDB 哪种更适合我们的场景？
4. **Plugin Marketplace** — ClawHub vs Ruflo Marketplace 的生态差异

---

*研究完成于 2026-05-14 02:10*
