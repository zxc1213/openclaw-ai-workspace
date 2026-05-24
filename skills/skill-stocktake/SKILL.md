---
name: skill-stocktake
description: 对所有 skills 做质量评估，判断每个 skill 的处置（Keep/Improve/Update/Retire/Merge），支持全量和增量扫描。
origin: 改编-ECC
version: 0.1.0
tags: [skill-management, quality-assessment, audit, maintenance]
---

# Skill Stocktake — 技能盘点

系统性评估所有 skill 的质量与有效性，为每个 skill 做出处置决策。

## When to Activate

- 定期盘点（建议每季度一次全量，每月一次增量）
- skill 数量大幅增加后（如新增 >10 个）
- 发现 skill 质量参差不齐时
- 与 context-budget 配合使用，先审计开销再评估质量

## 评估维度

每个 skill 从以下 4 个维度评分（1-5 分）：

| 维度 | 权重 | 评估标准 |
|------|------|----------|
| **可操作性** | 30% | 是否有明确的执行步骤？AI 能否直接遵循？还是纯理论描述？ |
| **范围适配** | 25% | 范围是否恰当？太宽泛（什么都做）还是太狭窄（场景极罕见）？ |
| **独特性** | 25% | 与其他 skill 是否有明显区分？功能是否重叠？ |
| **时效性** | 20% | 内容是否过时？引用的 API/工具是否仍然有效？ |

## 处置决策

| 决策 | 条件 | 行动 |
|------|------|------|
| **Keep** | 4 分以上，无重大问题 | 无需改动 |
| **Improve** | 有价值但存在具体可改进点 | 明确改进方向，标记待优化 |
| **Update** | 内容过时但功能仍需要 | 更新内容以适配当前环境 |
| **Retire** | 低价值、过时、或已被其他 skill 覆盖 | 移入归档目录 |
| **Merge** | 与其他 skill 高度重叠 | 合并为一个更完善的 skill |

## 执行步骤

### Phase 1: 准备数据

```bash
# 获取所有 skill 列表
echo "=== Workspace Skills ==="
ls -d ~/.openclaw/workspace/skills/*/SKILL.md | sed 's|/SKILL.md||' | sort

echo "=== Agents Skills ==="
ls -d ~/.agents/skills/*/SKILL.md | sed 's|/SKILL.md||' | sort
```

### Phase 2: 评估（推荐用 subagent 批量处理）

**增量扫描**（推荐日常使用）：
- 对比上次盘点时间，只评估新增或修改的 skill
- 检查方式：`find ~/.openclaw/workspace/skills -name "SKILL.md" -newer memory/last-stocktake-date`

**全量扫描**（季度执行）：
- 评估所有 skill，每批 15-20 个
- 使用 subagent 并行评估，每批一个 subagent

**Subagent 评估模板**：

```markdown
## 任务：评估 skill 批次 [编号/总数]

### Goal
对以下 skill 列表进行质量评估，输出处置决策。

### 待评估 Skills
1. `skills/xxx/SKILL.md`
2. `skills/yyy/SKILL.md`
...

### 评估维度
- 可操作性（1-5）
- 范围适配（1-5）
- 独特性（1-5）
- 时效性（1-5）

### 输出格式
对每个 skill：
| Skill | 可操作性 | 范围适配 | 独特性 | 时效性 | 加权总分 | 决策 | 理由 |
```

### Phase 3: 结果汇总

将所有批次结果汇总为报告：

```markdown
# Skill Stocktake Report — YYYY-MM-DD

## 总览
- 总 skill 数: N
- Keep: N (X%)
- Improve: N (X%)
- Update: N (X%)
- Retire: N (X%)
- Merge: N (X%)

## 详细结果

### Keep（无需改动）
| Skill | 总分 | 备注 |
|-------|------|------|

### Improve（需要改进）
| Skill | 总分 | 改进方向 |
|-------|------|----------|
| xxx | 3.2 | 缺少具体执行步骤，建议增加代码示例 |

### Update（需要更新）
| Skill | 总分 | 过时内容 |
|-------|------|----------|

### Retire（建议归档）
| Skill | 总分 | 原因 |
|-------|------|------|

### Merge（建议合并）
| Skill A | Skill B | 重叠点 | 建议合并后名称 |
|---------|---------|--------|----------------|
```

### Phase 4: 执行处置

⚠️ **所有处置操作需人工确认后再执行。**

- **Retire**: 移动到 `skills/_archived/` 目录（不用 `rm`）
- **Merge**: 创建合并后的 skill，原 skill 移入 `_archived/`
- **Improve**: 在 daily notes 记录改进计划
- **Update**: 直接修改 SKILL.md

```bash
# 归档操作示例
mkdir -p ~/.openclaw/workspace/skills/_archived
mv ~/.openclaw/workspace/skills/retired-skill ~/.openclaw/workspace/skills/_archived/
```

## 质量标准

### 好的 Skill（Keep/Improve）
- ✅ 有明确的 "When to Activate" 或触发条件
- ✅ 有具体的执行步骤（不是纯描述）
- ✅ 与其他 skill 有清晰边界
- ✅ 适配当前 OpenClaw 环境（不依赖 Claude Code hooks）
- ✅ frontmatter 完整（name, description, version, origin, tags）

### 差的 Skill（Retire/Merge 候选）
- ❌ 纯理论描述，无可执行步骤
- ❌ 与其他 skill 功能高度重叠
- ❌ 依赖 Claude Code 专有 API（如 PreToolUse hook）
- ❌ 描述模糊，无法判断何时使用
- ❌ 缺少 frontmatter 或格式不规范

## 与其他 Skill 的关系

- **context-budget**: 先用 context-budget 审计 token 开销，再用本 skill 评估质量
- **skill-vetter**: skill-vetter 做安全审计，本 skill 做质量评估，互补
- **find-skills**: 发现和查找 skill，本 skill 评估已有 skill

## 注意事项

- 评估结果需要 AI 判断，不同模型可能给出不同评分
- 建议缓存结果到 `memory/skill-stocktake/YYYY-MM-DD.md`，便于对比趋势
- 合并操作需特别谨慎，确保不丢失任何有价值的内容
- Retire 前确认没有其他 skill 或 AGENTS.md 引用该 skill
