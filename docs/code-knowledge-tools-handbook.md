# 代码知识工具使用手册

> Zread + Code-Review-Graph + OpenViking  
> 2026-04-15 | Ray & 念念

---

## 目录

1. [总览：三者关系](#一总览三者关系)
2. [Zread：代码 → Wiki 文档](#二zread代码--wiki-文档)
3. [Code-Review-Graph：代码 → 依赖图谱](#三code-review-graph代码--依赖图谱)
4. [OpenViking：任意文本 → 语义记忆](#四openviking任意文本--语义记忆)
5. [结合使用：场景手册](#五结合使用场景手册)
6. [在 AI 编码工具中的接入](#六在-ai-编码工具中的接入)
7. [速查表](#七速查表)

---

## 一、总览：三者关系

### 一句话理解

> **CRG 画地图，Zread 写导游词，OpenViking 记日记。**

| 维度 | Zread | Code-Review-Graph (CRG) | OpenViking |
|------|-------|-------------------------|------------|
| **解决什么问题** | 这个项目是什么？ | 谁依赖谁？ | 之前讨论过什么？ |
| **分析方式** | LLM 理解代码 → 生成自然语言 | AST/静态分析 → 构建依赖图 | Embedding → 语义相似度搜索 |
| **输出形态** | `.zread/wiki/` Markdown 页面 | `.code-review-graph/` 图数据库 | 嵌入向量 + 键值对 |
| **运行成本** | 高（LLM token） | 低（纯本地计算） | 中（embedding API） |
| **数据来源** | 本地代码仓库 | 本地代码仓库 | 任意文本 |
| **擅长** | 业务理解、架构文档、新人 onboarding | 依赖分析、变更影响、模块发现 | 长期记忆、跨会话知识、踩坑记录 |

### 互补关系

```
代码仓库
    │
    ├──→ CRG: 改了 A 会影响谁？（精确结构）
    │
    ├──→ Zread: 这个模块干嘛的？（自然语言理解）
    │
    └──→ OpenViking: 之前为什么这么设计？（历史记忆）
```

**三者不冲突，解决不同问题。可以单独用，也可以组合用。**

---

## 二、Zread：代码 → Wiki 文档

### 2.1 是什么

Zread 是一个 CLI 工具，用 LLM 读懂你的代码，自动生成 Wiki 风格的文档。生成的文档是自然语言的，人能读、AI 也能读。

### 2.2 安装

```bash
npm install -g zread_cli
# 或
pip install zread-cli
# 验证
zread version --stdio
```

### 2.3 配置

```bash
# 登录获取 API Key（会打开浏览器 OAuth）
zread login --stdio

# 或手动配置 ~/.zread/config.yaml
# 支持多种 LLM 提供商
zread config --stdio
```

配置文件位置：`~/.zread/config.yaml`

### 2.4 核心命令

| 命令 | 用途 | 常用参数 |
|------|------|----------|
| `zread generate` | 生成 Wiki 文档 | `-y`（跳过确认）、`--skip-failed`（跳过失败页）、`--draft resume\|clear` |
| `zread browse` | 本地预览文档（http://localhost:9681） | `--generate`（自动先生成）、`--version <id>` |
| `zread update` | 更新 CLI 本身 | — |
| `zread version` | 查看版本 | — |

### 2.5 使用流程

```bash
# 1. 进入项目目录
cd /path/to/your/project

# 2. 确认已登录
zread version --stdio

# 3. 生成 Wiki（首次建议在项目根目录执行）
zread generate -y
# ⚠️ 耗时较长，消耗 LLM token，大项目可能要几十分钟

# 4. 浏览生成的文档
zread browse

# 5. 如果上次中断了，继续
zread generate --draft resume -y

# 6. 重新生成
zread generate --draft clear -y
```

### 2.6 输出结构

```
./.zread/
└── wiki/
    ├── current                    # 当前版本 ID（如 2026-04-15-091234）
    ├── versions/
    │   └── 2026-04-15-091234/
    │       ├── wiki.json          # 目录索引（TOC）
    │       ├── overview.md        # 项目概览
    │       ├── modules/
    │       │   ├── auth.md        # 模块文档
    │       │   └── api.md
    │       └── ...                # 更多页面
    └── drafts/                    # 生成中的草稿（可清理）
```

### 2.7 读取已有 Wiki（AI 场景）

如果项目已有 `.zread/wiki/current`，直接读文件即可，无需重新生成：

```bash
# 读取当前版本 ID
cat .zread/wiki/current

# 读取目录索引
cat .zread/wiki/current/../versions/<id>/wiki.json

# 读取具体页面
cat .zread/wiki/current/../versions/<id>/overview.md
```

### 2.8 注意事项

- **成本**：每次 generate 消耗 LLM token，大项目成本可能较高
- **时效性**：代码变更后需要重新 generate，否则文档可能过时
- **安全**：只写 `.zread/` 目录，不修改代码，不提交 git
- **恢复**：卡住了删 `drafts/` 即可：`rm -rf .zread/wiki/drafts/`

---

## 三、Code-Review-Graph：代码 → 依赖图谱

### 3.1 是什么

CRG 通过 AST 解析和静态分析，把代码结构映射成数学图（节点 = 文件/函数，边 = import/调用关系），支持依赖分析、变更影响评估和可视化。

### 3.2 安装

```bash
pip3 install --user code-review-graph

# 可选：加速社区检测算法
pip3 install --user python-igraph

# 验证
code-review-graph -v
```

### 3.3 核心命令

| 命令 | 用途 | 常用参数 |
|------|------|----------|
| `build` | 全量构建图 | `--skip-flows`（跳过社区检测）、`--skip-postprocess` |
| `update` | 增量更新（只扫变更文件） | `--base <ref>`（对比基准，默认 HEAD~1） |
| `detect-changes` | 分析变更影响 | `--base <ref>`、`--brief`（简要模式） |
| `visualize` | 生成交互式可视化 | `--mode auto\|full\|community\|file`、`--serve` |
| `status` | 查看图统计信息 | — |
| `wiki` | 从社区结构生成 Markdown Wiki | `--force` |
| `watch` | 监听文件变更自动更新 | — |
| `serve` | 启动 MCP Server | — |

### 3.4 使用流程

```bash
# 1. 进入项目目录
cd /path/to/your/project

# 2. 首次全量构建
code-review-graph build
# 输出：.code-review-graph/ 目录

# 3. 查看构建统计
code-review-graph status

# 4. 可视化
code-review-graph visualize --serve
# 打开 http://localhost:8765

# 5. 代码变更后增量更新（比 build 快得多）
code-review-graph update
# 或指定对比基准
code-review-graph update --base main

# 6. 分析变更影响
code-review-graph detect-changes --base main --brief

# 7. 从社区结构自动生成 Wiki
code-review-graph wiki

# 8. 持续监听变更（开发时用）
code-review-graph watch
```

### 3.5 输出结构

```
./.code-review-graph/
├── graph.db              # 图数据库
├── fts_index/            # 全文搜索索引
├── communities.json      # 社区（模块）检测结果
└── ...
```

### 3.6 MCP Server 接入（Claude Code / Cursor 等）

CRG 可以作为 MCP Server 运行，AI 编码工具能直接查询依赖关系：

```bash
# 启动 MCP Server（stdio 模式）
code-review-graph serve

# 一键注册到 Claude Code
code-review-graph install
```

注册后 Claude Code 就能调用 CRG 的工具来查询代码依赖和变更影响。

### 3.7 注意事项

- **速度快**：纯本地计算，比 Zread 快得多
- **精确**：基于 AST，不会误判 import 关系
- **增量**：`update` 只扫变更文件，适合日常开发
- **局限**：输出是结构化数据，不是自然语言描述；不理解业务语义

---

## 四、OpenViking：任意文本 → 语义记忆

### 4.1 是什么

OpenViking 是一个语义记忆系统，把任意文本嵌入向量空间，支持语义相似度检索。它不限于代码——对话、笔记、文档、决策记录都能存。

### 4.2 安装与运行

OpenClaw 已内置集成，无需额外安装：

```bash
# 确认运行状态
openclaw status
# OpenViking 默认运行在 :1933 端口
```

当前配置：v0.3.2，embedding-3 2048 维。

### 4.3 核心操作（OpenClaw 内置工具）

| 工具 | 用途 | 关键参数 |
|------|------|----------|
| `memory_store` | 存储记忆 | `text`（要记忆的内容）、`sessionId`（可选） |
| `memory_recall` | 检索记忆 | `query`（搜索查询）、`limit`、`scoreThreshold` |
| `memory_forget` | 删除记忆 | `query`（搜索后删除）或 `uri`（精确删除） |
| `memory_search` | 搜索 MEMORY.md + memory/*.md | `query`、`corpus`（memory/wiki/all） |

### 4.4 存什么？不存什么？

✅ **应该存：**
- 用户偏好和习惯
- 踩坑经验和教训
- 环境配置变更
- 项目关键决策（为什么选 X 不选 Y）
- 架构设计思路
- 跨会话需要记住的上下文

❌ **不需要存：**
- 显而易见的事实（"今天是周三"）
- 已有记忆的内容（先搜再存）
- 一次性调试上下文
- 临时性的对话内容

### 4.5 使用示例

**存储记忆（在 OpenClaw 对话中）：**

```
用户：我们决定认证模块用 JWT 而不是 Session，因为需要支持微服务间调用
→ 念念自动调用 memory_store 存入
```

**检索记忆：**
```
用户：认证模块之前为什么选 JWT？
→ 调用 memory_recall("认证模块 JWT 决策")
→ 返回：认证模块用 JWT 而不是 Session，因为需要支持微服务间调用
```

**删除记忆：**
```
用户：忘掉之前关于那个实验性数据库的记录
→ 调用 memory_forget("实验性数据库")
```

### 4.6 注意事项

- **语义搜索**：比关键词搜索更智能，但仍是近似匹配
- **不关心代码结构**：不知道谁 import 谁（这是 CRG 的活）
- **跨会话**：记忆在会话之间持久存在
- **跨项目**：不限于特定项目

---

## 五、结合使用：场景手册

### 场景 1：接手一个陌生项目

```bash
# Step 1: CRG 先建图 → 了解代码结构
cd /path/to/project
code-review-graph build
code-review-graph status
code-review-graph visualize --serve    # 看看依赖图

# Step 2: Zread 生成 Wiki → 理解业务
zread generate -y
zread browse                          # 读 Wiki

# Step 3: OpenViking 记录发现
# 在对话中自然记录关键发现
# 念念自动调用 memory_store 沉淀
```

### 场景 2：日常开发中的增量维护

```bash
# 代码改了，CRG 增量更新（秒级）
code-review-graph update --base main

# 看看影响了哪些模块
code-review-graph detect-changes --base main --brief

# 重要决策记到 OpenViking
# 在对话中说"记住：xxx模块改了yyy因为zzz"
```

### 场景 3：PR Review

```bash
# CRG 检测变更影响
code-review-graph detect-changes --base main

# Zread 查看相关模块文档（已有 wiki 的话直接读文件）
cat .zread/wiki/versions/$(cat .zread/wiki/current)/wiki.json

# OpenViking 检索相关历史决策
# 念念调用 memory_recall("相关主题")
```

### 场景 4：新人 Onboarding

```bash
# 1. Zread Wiki 是最好的入口
zread browse    # 阅读 Wiki 文档

# 2. CRG 可视化帮助理解模块关系
code-review-graph visualize --mode community --serve

# 3. OpenViking 存新人常见问题
# "记住：新人经常问的 xxx，答案是 yyy"
```

### 场景 5：让 AI（Claude Code / OpenClaw）理解你的项目

- **Zread Wiki**：项目里有 `.zread/wiki/current` → AI 先读 Wiki，不用逐文件扫描
- **CRG MCP**：注册了 MCP Server → AI 能精确查询依赖关系
- **OpenViking**：存了项目上下文 → AI 能回忆之前的决策

三者全配 → AI 对你项目的理解深度 ×3

---

## 六、在 AI 编码工具中的接入

### 6.1 Claude Code

| 工具 | 接入方式 | 用途 |
|------|----------|------|
| Zread | 读取 `.zread/wiki/` 文件 | 理解项目上下文 |
| CRG | `code-review-graph install`（MCP） | 依赖查询、变更分析 |
| OpenViking | 通过 OpenClaw 间接使用 | 跨会话记忆检索 |

### 6.2 OpenClaw

| 工具 | 接入方式 | 用途 |
|------|----------|------|
| Zread | Skill（`zread-skill`） | subagent 理解陌生项目 |
| CRG | CLI 调用（exec） | 代码结构分析 |
| OpenViking | 原生集成 | `memory_search` / `memory_store` |

### 6.3 OpenClaw Subagent 接手项目模板

```
## 任务：分析 XXX 项目

### Goal
分析 XXX 项目结构并输出概要

### Context
- 项目路径：/path/to/project
- 已有 Zread Wiki：.zread/wiki/current
- 已有 CRG 图：.code-review-graph/

### 执行步骤
1. 读取 .zread/wiki/current → wiki.json → 核心页面
2. 运行 code-review-graph status 查看图统计
3. 按需读取关键源文件
4. 输出项目概要
```

---

## 七、速查表

### 我该用哪个？

| 你的需求 | 用这个 |
|----------|--------|
| 「这个项目是干嘛的？」 | **Zread** |
| 「改了 A 会影响谁？」 | **CRG** |
| 「之前讨论过什么？」 | **OpenViking** |
| 「给新人准备文档」 | **Zread** |
| 「分析代码架构」 | **CRG** + **Zread** |
| 「记录踩坑经验」 | **OpenViking** |
| 「AI 理解我的项目」 | **三个一起** |

### 常用命令速查

```bash
# === Zread ===
zread generate -y                          # 生成 Wiki
zread generate --draft resume -y           # 续跑中断的生成
zread browse                               # 浏览文档
cat .zread/wiki/current                    # 查看当前版本

# === CRG ===
code-review-graph build                    # 全量构建
code-review-graph update --base main       # 增量更新
code-review-graph detect-changes --brief   # 变更影响分析
code-review-graph visualize --serve        # 可视化
code-review-graph status                   # 统计信息
code-review-graph serve                    # MCP Server

# === OpenViking（OpenClaw 内置） ===
memory_store("要记住的内容")               # 存
memory_recall("搜索查询")                  # 检索
memory_forget("要删除的记忆")              # 删
memory_search("搜索 MEMORY.md")            # 搜本地文件
```

### 性能对比

| 维度 | Zread | CRG | OpenViking |
|------|-------|-----|------------|
| 首次运行 | 慢（5-30 min） | 快（10s-5min） | 实时 |
| 增量更新 | 慢（需重新生成） | 快（秒级） | 实时 |
| 准确性 | 高（LLM 理解语义） | 很高（AST 精确分析） | 中（语义近似匹配） |
| Token 成本 | 高 | 无 | 低（embedding） |
| 磁盘占用 | 中（Markdown 文件） | 中（图数据库） | 中（向量索引） |

---

*最后更新：2026-04-15*
