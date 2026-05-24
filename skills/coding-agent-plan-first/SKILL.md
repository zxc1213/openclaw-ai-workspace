---
name: coding-agent-plan-first
description: 'Plan-first 模式的 coding agent 扩展。三步流程：brainstorm（需求对齐）→ plan（施工图）→ execute（TDD 循环 + 质量门禁）。内置 Config Protection（禁止修改 lint 配置来让代码通过）和质量门禁（lint/typecheck/test）。适用于中大型任务（涉及多文件、架构变更、非显而易见的实现方案）。触发条件：先计划再动手、plan first、先出方案、brainstorm、质量门禁、config protection。不适用于单文件简单修改（直接编码即可）、需求明确的任务（直接用 coding-agent）。'
---

# Coding Agent — 三步流程（Brainstorm → Plan → Execute）

## 什么时候用

| 任务复杂度 | 模式 | 说明 |
|-----------|------|------|
| 简单（单文件、明确改动） | 直接做 | 不需要走流程，直接 coding-agent |
| 中等（多文件、方案不唯一） | **三步流程** ✅ | brainstorm → plan → execute |
| 复杂（架构变更、大型重构） | **三步流程** ✅ | 必须走完整流程，可能多轮迭代 |

## 三步流程

### Phase 1: Brainstorm（需求对齐）

目的：确保理解正确，暴露歧义，探索可选方案。

```prompt
BRAINSTORM MODE:
1. 阅读任务描述和相关代码，确认理解
2. 列出 2-3 个可选实现方案，简述各自优劣
3. 标注你的推荐方案及理由
4. 列出需要澄清的问题（如有）
5. 输出后 STOP，不要修改任何文件

任务：[Goal]
上下文：[Context]
约束：[Constraints]
```

主 agent 检查 brainstorm 输出，向用户确认方案选择。

### Phase 2: Plan（施工图）

目的：将选定方案转化为可执行步骤。

**Boil the Lake 原则**：AI 编码成本极低（人类几分钟的代码 AI 几秒完成），因此优先选择**完整方案**而非捷径。70 行代码的差异不值得为"少写"而牺牲完整性、可维护性或安全性。每个 scope decision 主动量化："这 N 行额外代码对 AI 来说只需几秒。"

```prompt
PLAN MODE:
基于 brainstorm 阶段选定的方案，输出施工图：

### 影响范围
- 要修改的文件列表及改动类型
- 要新建的文件列表

### 实施步骤
1. [第一步：一句话]
2. [第二步：一句话]
...

### 测试策略
- 需要哪些测试
- 测试顺序

### 风险点
- 可能的坑和应对

输出后 STOP，不要修改任何文件。
```

主 agent 审查 plan，确认后进入 execute。

### Phase 3: Execute（TDD 循环 + 质量门禁）

目的：按计划实施，写测试驱动代码质量。

```prompt
EXECUTE MODE — TDD 循环 + 质量门禁:
按 plan 的步骤顺序执行，每个功能点走 TDD：

1. **Red**: 先写测试（测试应该失败）
2. **Green**: 写最小实现让测试通过
3. **Refactor**: 清理代码，保持测试通过
4. **Quality Gate**: 质量门禁检查

### Quality Gate 检查项
- Config Protection: 确保未修改 lint/formatter/tsconfig/CI 配置
- Lint: `npm run lint` 或等效命令
- Type Check: `npx tsc --noEmit`（TS 项目）
- Test: `npm test` 或等效命令
- Security: 无硬编码 secrets、无 console.log/debugger 残留

### Config Protection 规则
禁止修改以下文件来让代码通过检查：
- `.eslintrc*`, `.prettierrc*`, `tsconfig.json`, `biome.json`
- `eslint.config.*`, `.stylelintrc*`, `jest.config.*`
- CI 配置中的 coverage 阈值、lint 级别

正确做法：修改代码来满足规则，而非弱化规则。

规则：
- 每完成一个步骤简短汇报
- 遇到计划外问题先说明再调整
- 不要跳过测试直接写实现
- 所有测试通过后再进入下一步
- Quality Gate 未通过 → 修复后重新检查
```

## 编码任务完成后的质量门禁

主 agent 在编码 agent 完成任务后，执行以下检查：

1. **Config Protection 审计**: `git diff --stat` 检查受保护文件是否被修改
2. **质量检查**: 运行项目可用的 lint/test/typecheck 命令
3. **安全扫描**: `git diff` 中无 secrets、无 console.log 残留
4. **违规处理**: 通知用户 + 要求撤回配置修改，改为修改代码

## 一句话 Prompt（快速启动完整流程）

```prompt
MODE: BRAINSTORM → PLAN → EXECUTE (TDD + Quality Gate)

请按三步流程处理此任务：
1. Brainstorm: 列出 2-3 个方案并推荐
2. Plan: 输出施工图（影响范围 + 步骤 + 测试策略）
3. Execute: TDD 循环（Red → Green → Refactor）+ 质量门禁检查

每个阶段完成后 STOP 等待确认。

## Quality Constraints
- 禁止修改 lint/formatter/类型检查配置文件来让代码通过
- 禁止降低覆盖率阈值或关闭 TypeScript strict 模式
- 遇到 lint 错误时修改代码，而非修改规则
- 完成后确保 lint 和 test 通过（如有）

任务：[Goal]
上下文：[Context]
约束：[Constraints]
完成标准：[Done]
```

## 与 coding-agent skill 的关系

本 skill 是 `coding-agent` 的**扩展**，不替代它。

- 使用时仍需读取 `coding-agent` skill（`~/.nvm/versions/node/v25.6.0/lib/node_modules/openclaw/skills/coding-agent/SKILL.md`）获取具体的 agent 启动方式
- 本 skill 提供额外的流程控制 prompt 模板 + **质量门禁**
- 简单任务直接用 coding-agent（仍遵守 Config Protection 和质量门禁规则）
- 中大型任务走三步流程，在 Execute 阶段自动集成质量门禁

## 反模式

❌ 简单任务也走三步流程（浪费时间）
❌ Brainstorm/Plan 阶段顺手改了代码（违背分阶段初衷）
❌ 跳过 TDD 直接写实现（失去质量保障）
❌ Plan 写得太细（变成伪代码）或太粗（无法判断可行性）
❌ Execute 阶段偏离 Plan 不汇报
❌ 修改 lint/formatter 配置来让代码通过（Config Protection 违规）
❌ 质量门禁失败后不修复就报告完成
