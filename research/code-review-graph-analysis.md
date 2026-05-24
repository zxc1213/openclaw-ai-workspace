# Code Review Graph — 深度学习分析

> 日期: 2026-04-14
> 飞书任务: aa9702f0-3b6f-4294-9477-2728eb06f78d
> 标签: #ai-tooling #code-review #mcp #tree-sitter #token-optimization

---

## Phase 1: 全量扫描与 A/B/C 分类

### 功能模块清单

| # | 功能模块 | 一句话描述 | 难度 | 分类 | 理由 |
|---|----------|-----------|------|------|------|
| 1 | 安装配置 | pip install + code-review-graph install 自动检测平台 | 低 | 🟢 A | 标准包管理，已掌握 |
| 2 | 代码图构建 | Tree-sitter 解析 → AST → 节点/边 → SQLite | 中 | 🔵 C | Tree-sitter + 图数据库新领域 |
| 3 | 增量更新 | git diff + SHA-256 去重 + 300ms watch 模式 | 中 | 🟡 B | git 相关已熟悉，增量逻辑可借鉴 |
| 4 | MCP 工具集成 | 22 个 tool + 5 个 prompt 模板 | 中 | 🟡 B | MCP 协议概念已有，具体 tool 待学 |
| 5 | 爆炸半径分析 | 变更影响范围追踪 + 风险评分 | 高 | 🔵 C | 核心价值，需深入理解算法 |
| 6 | 执行流检测 | 入口点 → 调用链 → 临界性排序 | 高 | 🔵 C | Python 可靠，JS/Go 待改进 |
| 7 | 社区检测 | Leiden 算法聚类 + 架构概览 | 高 | 🔵 C | 图算法新领域 |
| 8 | 语义搜索 | FTS5 BM25 + 向量嵌入 + RRF | 中 | 🟡 B | FTS5 概念有，向量嵌入可落地 |
| 9 | 可视化 | D3.js 力导向图，交互式 HTML | 中 | 🟡 B | D3.js 基础有，可视化方案可复用 |
| 10 | Wiki 生成 | 社区结构 → Markdown 文档 + 依赖图 | 低 | 🟢 A | 模板化输出，已有类似能力 |
| 11 | 多仓库管理 | 注册/搜索/连接池 | 低 | 🟢 A | 简单注册机制 |
| 12 | 平台配置 | Claude Code/Cursor/VS Code/Copilot/Windsurf/Zed 等 | 中 | 🟡 B | Claude Code 已在用，可实测 |
| 13 | 忽略规则 | .code-review-graphignore | 低 | 🟢 A | 与 .gitignore 同理 |
| 14 | 可选依赖 | embeddings/communities/eval/wiki/all | 低 | 🟢 A | pip extra 语法已掌握 |
| 15 | CLI 命令 | build/update/status/watch/visualize/wiki/detect-changes | 低 | 🟢 A | 标准 CLI 工具 |
| 16 | Slash 命令 | build-graph/review-delta/review-pr | 中 | 🟡 B | 与现有 dev-workflow 可整合 |

### 分类统计
- 🟢 A (已掌握): 7 项 — 安装配置、忽略规则、可选依赖、CLI、Wiki生成、多仓库管理
- 🟡 B (可落地): 5 项 — 增量更新、MCP工具、语义搜索、可视化、平台配置、Slash命令
- 🔵 C (新领域): 4 项 — 图构建原理、爆炸半径算法、执行流检测、社区检测

### 学习重点（B + C）
核心价值在于 **B 类（能实际用起来）**，C 类（原理）理解到够用即可。
