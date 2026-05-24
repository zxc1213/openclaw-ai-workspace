# Code Review Graph — 深度学习笔记

> 日期: 2026-04-14
> 标签: #ai-tooling #code-review #mcp #tree-sitter #token-optimization #sqlite

## 项目概况

**code-review-graph v2.1.0** — 用 Tree-sitter 解析代码库生成结构化依赖图，AI 通过 MCP 查询精准上下文，5-10x 减少 token 消耗。MIT 开源，9.5k stars。

## 架构分析

### 包结构
```
code_review_graph/
├── __init__.py, __main__.py, cli.py, main.py
├── parser.py          # Tree-sitter 多语言 AST 解析
├── graph.py           # SQLite + NetworkX 图存储与查询
├── changes.py         # Git diff → 变更映射 → 风险评分
├── incremental.py     # 增量更新（git diff + SHA-256）
├── flows.py           # 执行流检测（入口点 → 调用链）
├── communities.py     # Leiden 算法社区检测
├── search.py          # FTS5 BM25 + 向量混合搜索
├── embeddings.py      # sentence-transformers/Gemini/MiniMax
├── visualization.py   # D3.js 力导向图 HTML
├── wiki.py            # 自动 Wiki 生成
├── refactor.py        # 重构工具（重命名预览、死代码检测）
├── registry.py        # 多仓库注册管理
├── hints.py           # 平台规则注入
├── skills.py          # Slash 命令
├── prompts.py         # 5 个 MCP prompt 模板
├── constants.py       # 配置常量
├── migrations.py      # DB schema 迁移
├── tsconfig_resolver.py
├── tools/             # 22 个 MCP tool 实现
│   ├── _common.py     # 共享工具函数
│   ├── build.py       # build_or_update_graph
│   ├── query.py       # impact_radius, query_graph, search, stats
│   ├── context.py     # get_minimal_context
│   ├── review.py      # detect_changes, review_context, affected_flows
│   ├── community_tools.py
│   ├── flows_tools.py
│   ├── refactor_tools.py
│   ├── docs.py        # embed, wiki, docs_section
│   └── registry_tools.py
└── eval/              # 评估基准
```

### 核心数据模型

**SQLite Schema**:
- `nodes`: id, kind(File/Class/Function/Type/Test), name, qualified_name, file_path, line_start/end, language, parent_name, params, return_type, is_test, file_hash, extra
- `edges`: id, kind(CALLS/IMPORTS_FROM/INHERITS/IMPLEMENTS/CONTAINS/TESTED_BY/DEPENDS_ON/REFERENCES), source_qualified, target_qualified, file_path, line, extra
- `metadata`: key-value 配置

**GraphStore 类**: SQLite-backed，支持 WAL 模式，NetworkX 缓存，线程安全。

### 关键算法详解

#### 1. 爆炸半径 (Blast Radius)
```
输入: changed_files[]
输出: { changed_nodes, impacted_nodes, impacted_files, edges }
方法: BFS 从变更文件出发，沿 edges 遍历，深度限制 MAX_IMPACT_DEPTH
引擎: SQLite 递归 CTE（默认，大图快） 或 NetworkX（CRG_BFS_ENGINE=networkx）
```

#### 2. 风险评分 (Risk Score 0.0-1.0)
```
总分 = 流参与度(0.25) + 跨社区调用(0.15) + 测试覆盖(0.30) + 安全敏感(0.20) + 调用者数(0.10)
- 流参与度: 每个流 0.05，上限 0.25
- 跨社区: 每个不同社区的调用者 0.05，上限 0.15
- 测试覆盖: 无测试 +0.30，有测试 +0.05
- 安全敏感: 名字含 auth/password/token/secret 等关键词 +0.20
- 调用者数: callers/20，上限 0.10
```

#### 3. 变更分析 (detect_changes)
```
流程: git diff --unified=0 → 解析 @@hunk@@ → 行号范围 → 与图节点行号重叠匹配
     → 每个受影响节点计算风险评分 → 汇总: summary/risk_score/test_gaps/review_priorities
```

#### 4. 增量更新
```
触发: git commit hook / 文件保存 (300ms 防抖)
逻辑: git diff → SHA-256 哈希对比 → 只重解析变更文件 → 删除旧节点/边 → 写入新节点/边
性能: 2900 文件项目 < 2秒
```

#### 5. 社区检测
```
算法: Leiden (需 pip install [communities] → igraph)
输入: NetworkX 图 → Leiden 聚类
输出: 社区 ID → 节点列表 → 架构概览 + 耦合告警
```

## CLI 命令速查

```bash
# 安装配置
pip install code-review-graph
code-review-graph install                    # 自动检测所有平台
code-review-graph install --platform codex  # 指定平台

# 图操作
code-review-graph build                     # 全量构建
code-review-graph update                    # 增量更新
code-review-graph status                    # 图统计
code-review-graph watch                     # 监听文件变更自动更新

# 分析
code-review-graph detect-changes            # 风险评分变更分析
code-review-graph visualize                 # 生成 HTML 可视化
code-review-graph wiki                      # 生成 Markdown Wiki

# 多仓库
code-review-graph register <path>           # 注册仓库
code-review-graph repos                     # 列出已注册仓库
code-review-graph unregister <id>           # 取消注册

# MCP
code-review-graph serve                     # 启动 MCP server

# 可选依赖
pip install code-review-graph[embeddings]   # sentence-transformers
pip install code-review-graph[google-embeddings]  # Gemini
pip install code-review-graph[communities]  # igraph Leiden
pip install code-review-graph[all]          # 全部
```

## 22 个 MCP Tool 分类

### 图构建 (1个)
| Tool | 说明 |
|------|------|
| build_or_update_graph_tool | 全量/增量构建图 |

### 查询 (5个)
| Tool | 说明 |
|------|------|
| get_impact_radius_tool | 变更爆炸半径 |
| query_graph_tool | 调用者/被调用者/测试/导入/继承查询 |
| semantic_search_nodes_tool | 关键词+向量搜索代码实体 |
| list_graph_stats_tool | 图大小与健康度 |
| get_docs_section_tool | 文档章节检索 |

### Review (3个)
| Tool | 说明 |
|------|------|
| get_review_context_tool | Token 优化的 review 上下文 |
| detect_changes_tool | 风险评分变更分析 |
| get_affected_flows_tool | 受影响执行流 |

### 流 (2个)
| Tool | 说明 |
|------|------|
| list_flows_tool | 执行流列表（按临界性排序） |
| get_flow_tool | 单个执行流详情 |

### 社区 (3个)
| Tool | 说明 |
|------|------|
| list_communities_tool | 代码社区列表 |
| get_community_tool | 单个社区详情 |
| get_architecture_overview_tool | 架构概览 |

### 重构 (2个)
| Tool | 说明 |
|------|------|
| refactor_tool | 重命名预览/死代码检测/建议 |
| apply_refactor_tool | 执行预览的重构 |

### Wiki (2个)
| Tool | 说明 |
|------|------|
| generate_wiki_tool | 从社区结构生成 Wiki |
| get_wiki_page_tool | 获取 Wiki 页面 |

### 搜索增强 (1个)
| Tool | 说明 |
|------|------|
| embed_graph_tool | 计算向量嵌入 |
| find_large_functions_tool | 查找超大函数/类 |

### 多仓库 (2个)
| Tool | 说明 |
|------|------|
| list_repos_tool | 列出已注册仓库 |
| cross_repo_search_tool | 跨仓库搜索 |

## 5 个 Prompt 模板
1. **review_changes** — 变更审查
2. **architecture_map** — 架构图生成
3. **debug_issue** — 问题调试
4. **onboard_developer** — 新人引导
5. **pre_merge_check** — 合并前检查

## 适用性评估

### ✅ 高价值场景
- **集团平台** (169表 Java SpringCloud): 大量 Service/Controller/DAO 依赖链，blast radius 分析价值极高
- **nian-desktop** (Tauri Rust+TS): 前后端调用链追踪
- **Team Dashboard** (React): 组件依赖分析

### ⚠️ 注意事项
- 小项目（<50文件）token 节省不明显
- 执行流检测对 JS/Go 可靠性有限
- 搜索排名有待改进（MRR 0.35）

### 🔌 OpenClaw 整合可能
- `code-review-graph serve` 启动 MCP server → OpenClaw 如支持 MCP client 可直接调用
- 当前可通过 CLI 命令 `detect-changes` + `status` 在 subagent 中使用
- 可整合到 `pr-review` skill 作为前置分析步骤
