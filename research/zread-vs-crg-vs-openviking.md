# Zread CLI vs Code-Review-Graph vs OpenViking — 对比分析

> 2026-04-15 | Ray

## 一、三款工具定位

| 维度 | Zread CLI | Code-Review-Graph (CRG) | OpenViking |
|------|-----------|-------------------------|------------|
| **核心能力** | LLM 生成 Wiki 文档 | 代码依赖图谱 | 语义记忆检索 |
| **输出形态** | `.zread/wiki/` Markdown 页面 | `.code-review-graph/` 图数据库 | 嵌入向量 + 键值对 |
| **分析方式** | LLM 理解代码后生成自然语言文档 | AST/静态分析构建依赖图 | Embedding 向量相似度搜索 |
| **运行成本** | 高（消耗 LLM token） | 低（纯本地计算） | 中（embedding API 调用） |
| **适用场景** | 项目文档、团队 onboarding、给 AI 喂上下文 | 依赖分析、变更影响、模块发现 | 长期记忆、跨会话知识检索 |
| **数据来源** | 本地代码仓库 | 本地代码仓库 | 任意文本（对话、文档、笔记） |

## 二、核心差异

### Zread：读懂代码 → 写文档
- **本质**：把代码「翻译」成人能读 / AI 能懂的 Wiki
- **优势**：生成的文档自然语言化，新人友好；有版本管理（每次 generate 保留历史）
- **劣势**：每次生成消耗 LLM token、耗时较长；文档可能过时（需要重新 generate）
- **存储**：`.zread/wiki/current` → 版本化 Markdown 页面

### CRG：扫描代码 → 建图
- **本质**：把代码结构映射成数学图（节点=文件/符号，边=依赖关系）
- **优势**：精确的依赖关系、变更影响分析、增量更新（只扫变更文件）、可视化
- **劣势**：输出是结构化数据不是自然语言；大项目图会很密集
- **存储**：`.code-review-graph/`（图数据库 + FTS 索引）

### OpenViking：任意文本 → 语义记忆
- **本质**：把文本嵌入向量空间，支持语义相似度检索
- **优势**：跨会话、跨项目；不限于代码（对话、笔记、文档都能记）；语义搜索比关键词准
- **劣势**：不关心代码结构（不知道谁 import 谁）；检索是近似匹配不是精确查询
- **存储**：嵌入向量 + 原始文本，服务端 :1933

## 三、互补关系

```
代码仓库
    │
    ├──→ CRG: 谁依赖谁？改了 A 会影响谁？（精确结构）
    │
    ├──→ Zread: 这个模块干嘛的？整体架构是什么？（自然语言理解）
    │
    └──→ OpenViking: 之前讨论过什么？踩过什么坑？（长期记忆）
```

**三者不冲突，解决不同问题：**
- CRG 回答 **「怎么连的」** — 结构关系
- Zread 回答 **「是什么/为什么」** — 语义理解
- OpenViking 回答 **「之前怎样」** — 历史记忆

## 四、在 AI 编码工具中的用法

### Claude Code

| 工具 | 接入方式 | 用途 |
|------|----------|------|
| Zread | Skill（~/.claude/skills/zread/） | 理解陌生项目时先读 `.zread/wiki/current` |
| CRG | MCP Server（`code-review-graph serve`） | PR review 时查变更影响、理解依赖 |
| OpenViking | OpenClaw 集成（Claude Code 通过 OpenClaw 间接使用） | 跨会话记忆检索 |

### OpenClaw

| 工具 | 接入方式 | 用途 |
|------|----------|------|
| Zread | Skill（~/.openclaw/workspace/skills/zread-skill/） | subagent 接手陌生项目前先读 wiki |
| CRG | CLI 调用（exec） | 代码结构分析、依赖变更检测 |
| OpenViking | 原生集成（memory_search/memory_store） | 长期记忆的存取 |

## 五、结合使用的最佳实践

### 场景 1：接手陌生项目
```bash
# 1. CRG 先建图，了解结构
code-review-graph build

# 2. Zread 生成 Wiki，理解业务
zread generate -y

# 3. OpenViking 记录关键发现
# （在对话中通过 memory_store 沉淀）
```

### 场景 2：PR Review
```bash
# 1. CRG 检测变更影响
code-review-graph detect-changes --base main

# 2. Zread 查看相关模块文档
cat .zread/wiki/current && cat .zread/wiki/versions/*/wiki.json

# 3. OpenViking 检索相关历史决策
# memory_search("认证模块 之前为什么选 JWT")
```

### 场景 3：AI Coding（Claude Code / OpenClaw subagent）
- 项目里有 `.zread/wiki/current` → AI 先读 Wiki，不用逐文件扫描
- 有 CRG MCP → AI 能精确查询依赖关系和变更影响
- 有 OpenViking → AI 能回忆之前的决策和经验

## 六、安装与配置

### Zread
```bash
npm install -g zread_cli
# 或
brew tap ZreadAI/homebrew-tap && brew install zread

# AI 工具的 Skill 已就位
# ~/.openclaw/workspace/skills/zread-skill/SKILL.md
```

### CRG
```bash
pip3 install --user code-review-graph
# 可选：pip3 install --user python-igraph（加速 community detection）
```

### OpenViking
- 已集成在 OpenClaw 中，无需额外安装
- v0.3.2, embedding-3 2048维, 端口 1933

## 七、总结

| 需求 | 该用谁 |
|------|--------|
| 新人 onboarding / 给 AI 喂项目上下文 | **Zread** |
| 代码依赖分析 / 变更影响评估 | **CRG** |
| 长期记忆 / 跨会话知识 / 踩坑记录 | **OpenViking** |
| 全面理解一个项目 | **三个一起用** |

**一句话**：CRG 画地图，Zread 写导游词，OpenViking 记日记。
