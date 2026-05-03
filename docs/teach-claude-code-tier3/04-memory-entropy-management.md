# T3-04: 记忆熵管理自动化——让 Agent 自己维护记忆

> 这是 T3-03（Memory 设计模式）的进阶篇。T3-03 讲了"怎么设计记忆"，这篇讲"怎么让记忆自动保鲜"。

## 核心问题

记忆会自然膨胀。随着 agent 使用时间增长：
- Daily Notes 每天一篇，一周 7 篇、一个月 30 篇
- 心跳沉淀不断追加，重复信息逐渐出现
- MEMORY.md 越来越长，扫描成本越来越高
- memory/ 根目录散落各种临时文件

**不主动管理的记忆系统，最终会变成一个巨大的垃圾场，检索效率趋近于零。**

## 一、熵管理三步循环

```
定时触发 → 扫描变化 → 按规则处理
```

### 1. 定时触发

**实现方式**：cron job，每周跑一次，在 isolated session 中执行。

```
频率：每周一 00:00
方式：isolated session（不污染主会话）
要求：轻量，控制在 1-2 分钟内完成
```

为什么不用每次心跳都跑全部？因为熵管理是低频操作，daily notes 写入是高频操作，两者解耦更稳定。

### 2. 扫描变化

扫描 memory/ 目录，按规则分类：

```bash
# 伪代码
files = ls(memory/)
fragments = files.filter(f => f.lines <= 5 && is_metadata_only(f))
stale = files.filter(f => f.age > 7_days && f.is_daily_note)
misplaced = files.filter(f => !f.is_date_named && !f.is_in_subdir)
```

### 3. 按规则处理

| 文件类型 | 判断规则 | 处理方式 |
|----------|----------|----------|
| 碎片文件 | ≤5 行，纯元数据/greeting | 删除 |
| 过期 daily notes | >7 天 | 归档到 archive/ |
| 过期 session 记录 | >7 天 | 归档到 archive/ |
| 散落的非日期 .md | 在 memory/ 根目录 | 移到 docs/ 或 research/ |
| MEMORY.md 条目 | 过时或重复 | 移到 archive，保留索引 |

## 二、已实现的自动化（当前状态）

### 2.1 碎片清理

```markdown
## 扫描规则
- 目录：memory/ 根目录
- 条件：文件 ≤5 行，且内容仅包含元数据（session ID、时间戳、HEARTBEAT_OK）
- 动作：直接删除
```

**实际效果**（2026-04-05 首次执行）：
- 清理前：memory/ 根目录 72 个文件
- 清理后：6 个文件
- 主要是空 session 文件和重复的 greeting

### 2.2 旧文件归档

```markdown
## 归档规则
- 目录：memory/ 根目录
- 条件：文件修改时间 >7 天
- 目标：memory/archive/
- 保留：当天 + 昨天不归档
```

**实际效果**：
- 归档 58 个文件到 archive/
- archive/ 从 1 个文件增长到 59 个

### 2.3 散落文件归位

```markdown
## 归位规则
- 扫描 memory/ 根目录的非日期命名 .md 文件
- 按内容判断归属：
  - 正式文档（方案/规范）→ docs/
  - 研究笔记 → research/
  - 临时文件 → _inbox/
- 忽略：子目录内的文件不处理
```

**实际效果**：4 个文件归位到 docs/
- `openclaw-enhancement-backlog.md` → `docs/`
- `skill-distribution-policy.md` → `docs/`
- `spring-cloud-k8s-config-refactor-guide.md` → `docs/`
- `knowledge-sync-plan-2026-04-05.md` → `docs/`

### 2.4 MEMORY.md 同步

```markdown
## 同步规则
- 读取当天 daily notes
- 只同步：项目信息、基础设施变更、关键决策
- 跳过：日常琐碎、中间状态、重复信息
- 格式：表格或列表，简洁为主
```

**触发时机**：每次心跳都检查，但有变化才写入。

### 2.5 结构化沉淀

```markdown
## 沉淀规则
- 读取当天 daily notes
- 提取有长期价值的信息
- 追加到 heartbeat-reflections/ 对应文件：
  - decisions.md → 关键决策
  - lessons.md → 经验教训
  - people.md → 人物信息
  - reflections.md → 反思总结
- 去重：与已有内容高度相似则跳过
```

**去重实现**：让 LLM 判断新内容是否与已有条目高度相似。准确率不完美，但比不去重强。

## 三、尚未自动化的部分（改进方案）

### 3.1 MEMORY.md 自动精简（中等优先级）

**当前状态**：手动执行，每月一次
**目标**：自动检测 MEMORY.md 膨胀并精简

```markdown
## 自动精简规则
- 触发条件：MEMORY.md 超过 150 行
- 精简策略：
  1. 识别过时条目（项目已结束、基础设施已下线）
  2. 合并高度重复的条目
  3. 过时条目移到 archive/，保留一行索引
  4. 目标：精简到 100 行以内
- 安全措施：精简前先备份到 archive/
```

**实现方式**：在 cron job 中加一步，每周执行。

### 3.2 Daily Notes 归档时生成摘要（低优先级）

**当前状态**：直接移动文件到 archive/
**目标**：归档前生成一段摘要，方便后续语义搜索

```markdown
## 归档摘要规则
- 对即将归档的 daily note 生成 3-5 行摘要
- 摘要格式：
  ## YYYY-MM-DD 摘要
  - 完成了 X
  - 决定了 Y
  - 踩坑 Z
- 摘要追加到 memory/archive/SUMMARY.md
```

**好处**：archive/ 里有几十个文件，不生成摘要的话后续搜索成本高。

### 3.3 archive/ 二次清理（低优先级）

**当前状态**：只进不出
**目标**：定期清理 archive/ 中真正无价值的文件

```markdown
## 二次清理规则
- 触发条件：archive/ 超过 100 个文件
- 清理策略：
  1. 空 session 文件 → 删除
  2. 纯调试日志 → 删除
  3. >90 天且无引用 → 删除（谨慎）
- 保留：所有含决策、教训、人物信息的文件
```

### 3.4 heartbeat-reflections 去重精度提升（低优先级）

**当前状态**：LLM 判断"是否高度相似"，偶尔漏判
**目标**：提升去重准确率

**改进方案**：
- 使用 OpenViking 语义搜索做初步去重（向量相似度 >0.9 的跳过）
- 再用 LLM 做精确判断
- 两级去重，减少误判

## 四、对 Claude Code 用户的具体建议

### 轻量方案：git + 约定（零成本）

如果你不想搭建复杂系统，用 git 就能实现 80% 的效果：

```bash
# 1. 每周回顾（手动或 alias）
git log --oneline --since="1 week ago" -- docs/

# 2. 清理过时文件
# 先标记，再删除
find docs/ -name "*.md" -mtime +90 -ls

# 3. 整理 MEMORY.md（或 CLAUDE.md）
# 定期打开看看有没有过时内容
```

**约定**：
- 决策记录放 `docs/decisions/`，格式 `YYYY-MM-DD-decision-name.md`
- 每个决策文档头部写"状态：active/archived"
- 每月花 10 分钟 review 一次

### 中量方案：脚本 + cron（半自动）

```bash
#!/bin/bash
# memory-hygiene.sh — 每周一跑一次

MEMORY_DIR="$HOME/project/memory"
ARCHIVE_DIR="$MEMORY_DIR/archive"
SUMMARY_FILE="$MEMORY_DIR/archive/SUMMARY.md"

# 1. 归档 >7 天的 daily notes
find "$MEMORY_DIR" -name "202*-*.md" -mtime +7 -exec mv {} "$ARCHIVE_DIR/" \;

# 2. 清理碎片
find "$MEMORY_DIR" -maxdepth 1 -name "*.md" -size -200c -delete

# 3. 统计
echo "$(date): memory/ has $(ls "$MEMORY_DIR" | wc -l) files, archive/ has $(ls "$ARCHIVE_DIR" | wc -l)"
```

配合 cron：
```bash
# crontab -e
0 0 * * 1 /path/to/memory-hygiene.sh >> /tmp/memory-hygiene.log 2>&1
```

### 重量方案：让 Claude Code 自己做（全自动）

在 CLAUDE.md 中加入熵管理指令：

```markdown
## 记忆维护（每周一次）
当你检测到 docs/ 或 memory/ 目录有 >50 个文件时：
1. 列出所有文件，按修改时间排序
2. 识别 >7 天且无引用的文件，建议归档或删除
3. 检查 CLAUDE.md 是否有过时内容，建议精简
4. 不要自动删除，只提供建议让用户确认
```

**关键原则**：
- 自动化归档，半自动删除（让用户确认）
- 先备份再操作
- 每次操作记录到日志

## 五、核心原则总结

1. **熵增是自然规律，必须主动管理**——记忆系统不会自己保持整洁
2. **归档 > 删除**——先归档，给后悔的机会
3. **索引要精简，详情可以多**——MEMORY.md 是导航，archive/ 是仓库
4. **去重比累积重要**——10 条高质量记录 > 100 条重复记录
5. **自动化优先**——靠人记得维护记忆系统，本身就是反模式
