# T3-03: Memory 设计模式——如何让 Agent 记住东西

> 基于 OpenClaw 生产环境的记忆架构实战经验。核心原则：**重要的事写文件，不靠"脑子记"。**

## 一、为什么 Memory 是 Agent 的生死线

LLM 没有真正的"记忆"——它只是在当前上下文窗口内工作。一旦 session 结束或上下文压缩，之前的信息就可能丢失。

**没有记忆的 agent**：每次重启都是"失忆"状态，重复问同样的问题，犯同样的错误，无法积累经验。

**有记忆的 agent**：能跨 session 保持连续性，从历史中学习，越用越强。

## 二、三层记忆模型（详细版）

### L1：工作记忆（Context Window）

```
容量：~200K tokens（GLM-5）或 ~200K tokens（Claude）
特性：读写快、容量有限、session 结束就丢
管理：compaction 自动压缩、postCompactionSections 重注关键规范
```

**关键原则**：
- 不要把所有东西都塞进工作记忆
- 注入的东西必须是"此刻需要知道的"
- 关键决策和状态要同步写入 L2/L3，不要只存在于 L1

### L2：短期记忆（Daily Notes）

```
格式：memory/YYYY-MM-DD.md
保留：7 天，之后归档到 memory/archive/
写入时机：当天事件、临时决策、调试记录、用户反馈
读取时机：每次 session startup 读今天 + 昨天
```

**Daily Notes 写什么**：
- ✅ 今天完成了什么、做了什么决策
- ✅ 踩了什么坑、怎么修的
- ✅ 用户的新需求或偏好变化
- ✅ 临时发现（比如"某个 API 有限流"）
- ❌ 不要写流水账（"14:00 回复了消息"）
- ❌ 不要写 agent 自言自语的中间状态

**实战格式**：
```markdown
# 2026-04-05

## 完成事项
- Chrome CDP IPv6 问题修复：netsh portproxy v4tov6 转发
- Memory 熵清理：72 个文件 → 6 个

## 决策
- 停掉 BGE-M3 本地 embedding，走纯智谱远程（省 1.8G 内存）

## 踩坑
- isolated session 开 lightContext 后拿不到 TOOLS.md 的 API key
```

### L3：长期记忆（Structured Index + 向量检索）

#### 文件索引（MEMORY.md）

```markdown
# MEMORY.md - 长期记忆索引

## 项目
| 项目 | 说明 | 详情 |

## 基础设施
- OpenClaw: systemd service, SIGUSR1 热重启
- 模型: GLM-5/5.1/5-Turbo

## 关键教训
- cron isolated session 要开 light-context 防 overflow
- systemd 改环境变量用 drop-in
```

**设计哲学**：
- 是索引，不是详情——记"去哪找"，不记"全部内容"
- 表格格式 > 段落——信息密度高，扫一眼就知道
- 关键教训放最前面——高频引用，减少搜索成本

#### 结构化沉淀（heartbeat-reflections/）

```
memory/heartbeat-reflections/
├── decisions.md    # 关键决策（做了什么选择、为什么）
├── lessons.md      # 经验教训（踩坑记录、修复方法）
├── people.md       # 人物信息（用户偏好、团队习惯）
└── reflections.md  # 反思总结（周度回顾、趋势观察）
```

**为什么需要结构化沉淀**：
- Daily Notes 是时间线视角，不利于按主题检索
- 结构化沉淀是主题视角，同一主题的多个事件聚合在一起
- Heartbeat 定期扫描 Daily Notes，提取有价值信息追加到对应文件
- 去重：与已有内容高度相似则跳过

#### 向量检索（OpenViking）

```
写入：对话自动写入 session → 达到 token 阈值 → 触发记忆提取 → 存入向量库
读取：memory_recall(query) → 语义搜索 → 返回相关记忆片段
特点：即使文件里没明确记下来的东西，也能通过语义搜索召回
```

**配置要点**：
- `autoCapture`: true（自动捕获对话）
- `commitTokenThreshold`: 20000（积累 20K tokens 才触发提取）
- `captureMaxLength`: 24000（单轮最大捕获字符数）

## 三、记忆生命周期管理（熵管理）

### 问题：记忆会自然膨胀

随着时间推移：
- Daily Notes 越积越多
- heartbeat-reflections 可能重复
- memory/ 根目录散落临时文件
- MEMORY.md 变得越来越长

### 解决方案：定期熵管理

#### 1. 碎片清理
- 扫描 memory/ 根目录
- 删除 ≤5 行的空 session 文件（纯元数据、greeting、HEARTBEAT_OK）
- 频率：每周一次

#### 2. 旧文件归档
- >7 天的 Daily Notes → `memory/archive/`
- >7 天的 session 记录 → `memory/archive/`
- 频率：每周一次

#### 3. 散落文件归位
- memory/ 根目录的非日期 .md 文件 → `docs/` 或 `research/`
- 频率：每周一次

#### 4. MEMORY.md 精简
- 过时的条目移到 archive
- 合并重复条目
- 保持 MEMORY.md 在 100 行以内
- 频率：每月一次

### 实战数据

清理前后对比（2026-04-05）：
```
memory/ 根目录文件数：72 → 6
memory/ 根目录总行数：6469 → ~743
archive/ 文件数：1 → 59
```

## 四、对 Claude Code 用户的具体建议

### 方案 A：纯文件方案（轻量）

```
project/
├── CLAUDE.md              # = SOUL.md + AGENTS.md
├── docs/
│   ├── decisions.md       # = MEMORY.md decisions 部分
│   ├── lessons-learned.md # = heartbeat-reflections/lessons.md
│   └── architecture.md    # = 项目架构记录
└── .claude/
    └── context/           # Claude Code 自动管理的上下文
```

每次新 session：
1. Claude Code 自动读 CLAUDE.md
2. 你可以说"读一下 docs/lessons-learned.md"让它加载历史教训
3. 新的教训用 `追加到 docs/lessons-learned.md` 的方式记录

### 方案 B：git 增强方案（推荐）

git 本身就是最好的记忆系统：

```bash
# 回顾最近做了什么
git log --oneline -20

# 查看某次改动的上下文
git show <commit> --stat

# 查看某个文件的历史
git log --follow -- path/to/file
```

**建议**：
- 重要决策用 git commit message 记录（`git commit -m "feat: 决定用 X 方案而非 Y，因为..."`）
- 小的教训直接写在代码注释里（`// NOTE: 不要用 fastjson 的 XX 方法，有安全风险`）
- 架构变更写 ADR（Architecture Decision Record），放在 docs/decisions/ 下

### 方案 C：MCP + 向量数据库（重量）

如果你想达到 OpenClaw 级别的记忆能力：
- 接一个向量数据库（ChromaDB、Pinecone、或 OpenViking）
- 通过 MCP 让 Claude Code 能语义搜索历史记忆
- 对话结束后自动提取关键信息存入向量库

这需要开发投入，但一旦建成，agent 就有了真正的"长期记忆"。

## 五、核心原则总结

1. **写文件 > 靠记忆**——LLM 没有跨 session 持久记忆，一切靠文件
2. **索引 > 详文**——MEMORY.md 是导航目录，不是百科全书
3. **结构化 > 自由文本**——表格、分类目录比大段文字好检索
4. **定期清理 > 放任膨胀**——熵增是自然规律，必须主动管理
5. **去重 > 累积**——重复的信息只有一份的价值
