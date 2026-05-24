# MemPalace 学习笔记

> 来源: https://github.com/milla-jovovich/mempalace
> 学习日期: 2026-04-08
> 状态: v3.0.0, 2026-04-07 发布（当天被社区扒皮后紧急写了诚实声明）

## 一句话总结

MemPalace 是一个**本地优先的 AI 记忆系统**，用 ChromaDB 做语义搜索，核心卖点是"存原文不摘要"，在 LongMemEval benchmark 上达到 96.6% R@5。

## 核心架构：记忆宫殿

借鉴古希腊"记忆宫殿"术，把信息组织成层级结构：

```
Wing（人/项目）
  ├── Hall（记忆类型）: facts/events/discoveries/preferences/advice
  │     ├── Room（主题）: auth-migration, graphql-switch, ci-pipeline
  │     │     ├── Closet（摘要）→ 指向原始内容
  │     │     └── Drawer（原文）→ verbatim 逐字存储
  │     └── Room...
  └── Tunnel（跨 Wing 连接）→ 同一 Room 出现在不同 Wing 时自动建立
```

- **Wing**: 按"人"或"项目"分
- **Hall**: 5 种固定类型（decisions/sessions/breakthroughs/habits/recommendations）
- **Room**: 按主题名，跨 Wing 同名 Room 自动建 Tunnel
- **Closet**: 摘要指针
- **Drawer**: 原始对话，逐字存储

### 分层加载（L0-L3）

| Layer | 内容 | 大小 | 加载时机 |
|-------|------|------|----------|
| L0 | AI 身份 | ~50 tokens | 始终 |
| L1 | 关键事实（团队/项目/偏好） | ~120 tokens (AAAK) | 始终 |
| L2 | Room 回忆（近期会话/当前项目） | 按需 | 主题相关时 |
| L3 | 深度搜索（全量语义检索） | 按需 | 明确要求时 |

## 96.6% Benchmark 的真相

**96.6% 是 raw verbatim 模式的成绩**，不是 AAAK 模式：

| 模式 | R@5 | 说明 |
|------|-----|------|
| Raw verbatim | 96.6% | 原文存 ChromaDB，零 API 调用 |
| Rooms (wing+room filter) | 94.8% | +34% 是 vs 无过滤搜索，本质是 ChromaDB metadata filter |
| AAAK | 84.2% | lossy 压缩反而下降 12.4% |
| Haiku rerank | 100% | 管道代码未公开 |

**社区扒出来的问题**（48h 内被锤）：
1. AAAK token 计数用了 `len(text)//3` 吹比，实际 tokenizer 算 AAAK 反而更多 token
2. "30x lossless compression" — 实际是 lossy
3. "+34% palace boost" — 只是 ChromaDB metadata filtering，不是新检索方法
4. "contradiction detection" — 有独立工具但没接入 KG
5. "100% with Haiku rerank" — 有结果但管道没公开

**作者的态度倒是挺好的**，48h 内写了诚实声明承认所有问题。

## AAAK 压缩方言

实验性功能，**不是默认存储格式**：
- Lossy 缩写系统（实体编码 + 结构标记 + 句子截断）
- 任何 LLM 都能读（Claude/GPT/Gemini/Llama/Mistral），无需解码器
- 设计用于大规模重复实体场景，短文本反而更费 token
- 目前不如 raw 模式，还在迭代

## 知识图谱

SQLite 实现（对标 Zep Graphiti 的 Neo4j），支持：
- 时序三元组 `entity → relation → entity`，带 `valid_from/ended`
- 时间点查询 `kg.query_entity("Kai", as_of="2026-01-20")`
- 失效机制 `kg.invalidate("Kai", "works_on", "Orion", ended="...")`
- 事实检查器 `fact_checker.py`（独立工具，未接入 KG ops）

## Agent 系统

每个 Agent 一个 wing + diary：
```bash
mempalace_diary_write("reviewer", "PR#42|auth.bypass.found|pattern:3rd.time|★★★★")
mempalace_diary_read("reviewer", last_n=10)
```

- Agent 在运行时从 palace 发现，不需要在 CLAUDE.md 里声明
- 每个 Agent 维护独立的领域记忆（reviewer 记 bug 模式，architect 记设计决策）

## MCP 集成

19 个工具，分两类：

**读操作（Palace）**: status, list_wings, list_rooms, get_taxonomy, search, read_memory, get_wing_summary, get_room_summary, timeline, query_entity, diary_read, list_agents, wake_up

**写操作（Actions）**: save_memory, save_from_clipboard, split, diary_write, invalidate

集成方式：
```bash
claude mcp add mempalace -- python -m mempalace.mcp_server
```

## 数据挖掘

三种模式：
- `--mode projects`: 代码和文档
- `--mode convos`: 对话导出（Claude/ChatGPT/Slack）
- `--extract general`: 自动分类为 decisions/milestones/problems/preferences

## 与我们现有方案（OpenViking）的对比

| 维度 | MemPalace | OpenViking |
|------|-----------|------------|
| 存储 | ChromaDB | 自建（embedding-3 2048维） |
| Embedding | 默认 ChromaDB 模型 | 智谱 embedding-3 |
| 压缩 | AAAK（实验性） | 无（直接存原文） |
| 结构 | Wing/Room/Hall/Tunnel | URI 层级 + tag |
| 知识图谱 | SQLite 时序三元组 | 无 |
| Agent 记忆 | 独立 diary + wing | 无（共享记忆空间） |
| 集成 | MCP (Claude/Gemini CLI) | OpenClaw 原生插件 |
| Benchmark | LongMemEval 96.6% R@5 | 未跑 benchmark |
| 成本 | 免费，本地 | 免费，本地 |
| 成熟度 | v3.0.0，刚发布 48h 就被社区锤 | v0.3.2，生产使用中 |

## 值得借鉴的点

1. **记忆宫殿的层级组织思路** — Wing/Room/Hall 的分类方式比 flat URI 更直觉，跨 Wing 的 Tunnel 概念（同一主题在不同项目间的关联）有意思
2. **分层加载 L0-L3** — 只在启动时加载 ~170 tokens 关键事实，深度搜索按需触发，这个设计对 token 效率很好
3. **Agent 独立 diary** — 每个 Agent 维护自己领域的记忆，不污染全局，这个思路适用于 subagent 场景
4. **时序知识图谱** — 实体关系的有效时间窗口，查询时可以指定时间点看"当时"的状态
5. **存原文不摘要** — 我们已经在用这个策略，MemPalace 的 benchmark 结果进一步验证了这比 LLM 摘要好
6. **作者的诚实态度** — 被锤后 48h 内公开承认所有问题，这种态度值得学习

## 不值得照搬的

1. **AAAK 压缩** — 目前是负优化，短文本更费 token
2. **96.6% 数字本身** — 本质是 ChromaDB + raw text，没有魔法
3. **"+34% boost"** — 只是 metadata filter，标准功能

## 已知安全/质量问题

- **Shell 注入** (#110): hooks 中存在命令注入漏洞
- **ChromaDB 版本未锁定** (#100): 需要固定版本范围
- **macOS ARM64 段错误** (#74): 未修复

## 结论

MemPalace 的核心价值不在算法创新，而在**产品思路**：如何组织记忆让检索更高效。它的"宫殿结构"和"分层加载"设计有参考价值。技术上本质上就是 ChromaDB + metadata filtering + raw text storage，96.6% 的成绩验证了"存原文 > LLM 摘要"这个判断。对我们来说，OpenViking 已经在走类似的路线（存原文 + 语义检索），可以借鉴其层级组织和分层加载的设计，但不需要迁移。
