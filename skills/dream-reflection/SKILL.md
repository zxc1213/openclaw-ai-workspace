---
name: dream-reflection
description: 轻量版 Dream Module，在 heartbeat/cron 中定期回顾近期 daily notes 和会话记录，提取模式，输出反思报告。
origin: 改编-EO
version: 0.1.0
tags: [reflection, self-improvement, heartbeat, pattern-extraction]
---

# Dream Reflection — 定期反思

轻量版 EO Dream Module。在 heartbeat 或 cron 中定期执行，回顾近期活动，提取模式，生成进化洞察。

## When to Activate

- 在 heartbeat cron 中定期执行（建议每周 1-2 次）
- 手动触发：需要回顾近期模式时
- 与 daily-digest 配合，digest 做信息汇总，本 skill 做深度反思

## 与 EO Dream Module 的区别

| 维度 | EO Dream | 本 Skill |
|------|----------|----------|
| 触发方式 | TypeScript 引擎，持续运行 | OpenClaw heartbeat/cron |
| 存储 | LanceDB 向量数据库 | 纯 Markdown 文件 |
| 回顾范围 | 全部历史会话 | 近期 daily notes + 心跳记录 |
| 输出 | 向量化的 pattern | 结构化反思报告 |
| 依赖 | TypeScript, LanceDB, Claude Code | 无外部依赖，纯 shell + AI |

## 执行步骤

### Phase 1: 数据收集

```bash
# 回顾最近 14 天的 daily notes
for f in $(seq 0 13); do
  date=$(date -d "$f days ago" +%Y-%m-%d)
  file="$HOME/.openclaw/workspace/memory/$date.md"
  [ -f "$file" ] && echo "=== $date ===" && cat "$file"
done

# 回顾已有的 heartbeat reflections
cat $HOME/.openclaw/workspace/memory/heartbeat-reflections/*.md 2>/dev/null

# 检查最近的 subagent 日志
tail -50 $HOME/.openclaw/workspace/memory/subagent-log.md 2>/dev/null
```

### Phase 2: 模式提取

从收集的数据中提取以下模式：

#### 2.1 重复行为模式
- 频繁执行的任务类型（coding/research/doc/admin）
- 经常遇到的问题类别
- 常用的工具组合

#### 2.2 效率信号
- 哪些 subagent 任务经常成功/失败？
- 是否有重复的修正循环（同一类问题反复出现）？
- 哪些 skill 被频繁触发？

#### 2.3 改进机会
- `[self-reflection]` 标记的内容
- `[skill-candidate]` 标记但尚未创建的 skill
- 反复出现的痛点或摩擦点

#### 2.4 知识积累
- 新学到的技术/工具/模式
- 项目状态变化
- 环境变更记录

### Phase 3: 生成反思报告

输出到 `memory/heartbeat-reflections/dream-YYYY-MM-DD.md`：

```markdown
# Dream Reflection — YYYY-MM-DD

## 回顾范围
- 时间跨度: YYYY-MM-DD ~ YYYY-MM-DD（14 天）
- Daily notes: N 份
- Subagent 任务: N 个（✅ N / ⚠️ N / ❌ N）

## 提取的模式

### 行为模式
1. **[模式名]**: [描述] — 出现 N 次
   - 示例: "经常在深夜处理 coding 任务，但凌晨的 subagent 成功率较低"

### 效率观察
1. **[观察]**: [描述]
   - 数据: [支撑数据]
   - 建议: [改进建议]

### 改进机会
1. **[机会]**: [描述]
   - 优先级: high/medium/low
   - 行动: [具体行动]

## 知识更新
- [新学到的内容]

## 下一步行动
1. [ ] [具体可执行的行动项]
2. [ ] ...

## 趋势对比（如历史报告存在）
- 与上次反思相比的变化...
```

### Phase 4: 更新长期记忆

根据反思结果，考虑更新：

- **MEMORY.md**: 新的核心事实加入 L1
- **Daily notes**: 当天记录本次反思的关键发现
- **Subagent 任务模板**: 如果发现重复的修正模式，更新 AGENTS.md 模板

## 在 Heartbeat 中集成

在 `HEARTBEAT.md` 中添加定期反思的 cron 配置：

```markdown
### 定期反思（Dream Reflection）
- 频率: 每周日 10:00
- 执行: 读取 skill dream-reflection，执行反思流程
- 产出: memory/heartbeat-reflections/dream-YYYY-MM-DD.md
- 检查: 如果连续 2 周无新产出，在下次 heartbeat 报告
```

或在 AGENTS.md 的周期检查中引用本 skill。

## 反思质量标准

### 好的反思
- ✅ 有具体数据支撑（不是模糊的"应该改进"）
- ✅ 提出了可执行的行动项
- ✅ 发现了至少一个之前未注意到的模式
- ✅ 与历史报告有对比和趋势分析

### 差的反思
- ❌ 纯粹罗列 daily notes 内容，无提炼
- ❌ 所有模式都是显而易见的
- ❌ 没有可执行的行动项
- ❌ 与上次报告完全相同

## 独立运行模式

如果不想依赖 heartbeat，也可以手动触发：

```bash
# 在 OpenClaw 中执行
# "执行一次 dream reflection，回顾过去 14 天"
```

agent 会自动读取本 skill，按步骤执行。

## 与其他 Skill 的关系

- **daily-digest**: digest 做信息汇总（发生了什么），本 skill 做深度反思（意味着什么）
- **self-improvement**: self-improvement 是持续的单次学习，本 skill 是定期的批量回顾
- **skill-stocktake**: 如果反思发现 skill 问题，可以触发 skill-stocktake 做正式评估
- **context-budget**: 如果反思发现上下文压力，可以触发 context-budget 做审计

## 注意事项

- 反思报告保存到 `memory/heartbeat-reflections/`，不要覆盖已有文件
- 保留历史报告用于趋势对比
- 如果 14 天内数据太少（<3 份 daily notes），降低预期，简要记录即可
- 不要在反思中重复记录已有 MEMORY.md 中的核心事实
