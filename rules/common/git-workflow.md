# Git Workflow

## Commit 格式

```
<type>: <description>

<optional body>
```

**类型**: feat, fix, refactor, docs, test, chore, perf, ci

## PR 规范

1. 分析完整 commit history（不只是最新一次）
2. `git diff [base-branch]...HEAD` 查看所有变更
3. 写全面的 PR 描述
4. 包含测试计划
5. 新分支用 `push -u`

## 保护规则

- **禁止** `git commit --no-verify`（跳过 hooks）
- **禁止** `git push --force` 到共享分支（需用户明确确认）
- push 前回顾 diff
