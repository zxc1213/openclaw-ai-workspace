# Quality Gate Rules

## 编码任务完成后强制检查

每个编码任务（通过 coding-agent/subagent 执行的）完成后，主 agent 必须执行以下质量门禁：

### 1. Config Protection 检查

检查编码 agent 是否修改了以下受保护配置文件：
- `.eslintrc*`, `.prettierrc*`, `tsconfig.json`
- `biome.json`, `eslint.config.*`, `.stylelintrc*`
- `.editorconfig`, `jest.config.*`, `vitest.config.*`
- 任何 CI 配置中的质量门禁设置（coverage 阈值、lint 级别等）

**判断标准**：`git diff` 中是否包含对上述文件的修改
**违规处理**：通知用户 + 要求编码 agent 撤回配置修改、改为修改代码

### 2. 代码质量检查

根据项目可用工具执行（无则跳过）：
- [ ] **Lint**: `npm run lint` / `biome check` / `eslint .`
- [ ] **Type Check**: `npx tsc --noEmit`（TS 项目）
- [ ] **Format Check**: `npm run format:check` / `prettier --check .`
- [ ] **Test**: `npm test` / `vitest run`

**跳过条件**：项目无对应配置文件时自动跳过

### 3. 安全扫描

- [ ] 无硬编码 secrets（`git diff` 中不包含 API key、密码、token）
- [ ] 无 `console.log` / `debugger` 残留（排除 test 文件）
- [ ] 无 `TODO` / `FIXME` / `HACK` 未处理（或已加 issue 链接）

### 4. 质量门禁 Prompt 模板

在向编码 agent 发送任务时，追加以下约束：

```
## Quality Constraints
1. 禁止修改 lint/formatter/类型检查配置文件来让代码通过
2. 禁止降低覆盖率阈值
3. 禁止禁用 TypeScript strict 模式
4. 遇到 lint 错误时修改代码，而非修改规则
5. 完成后确保 `npm run lint` 和 `npm test` 通过（如有）
```

## 编码任务结束检查流程

1. Agent 完成任务后，主 agent 检查 `git diff --stat`
2. 扫描是否有受保护文件被修改
3. 如有受保护文件修改 → 撤回 + 要求修改代码
4. 运行可用的质量检查命令
5. 检查失败 → 要求修复直到通过
6. 全部通过 → 向用户报告完成

## 与 coding-agent-plan-first 的集成

在 Execute 阶段，每个 TDD 循环的 Refactor 步骤后增加质量门禁检查：

```
REFACTOR 后 → Config Protection 检查 → Lint → Type Check → Test → 通过 → 下一步
```
