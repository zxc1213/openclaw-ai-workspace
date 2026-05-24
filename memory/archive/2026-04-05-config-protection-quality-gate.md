# Session: 2026-04-05 14:34:21 UTC

- **Session Key**: agent:main:feishu:direct:ou_dfe4cec8ab70368885235d951a935ccd
- **Session ID**: be5a0925-416e-4b07-a65a-dd1ceec45ad7
- **Source**: feishu

## Conversation Summary

assistant: 让我看看完整的 GLM Coding 学习笔记，理解 Config Protection 和质量门禁的具体概念。
assistant: 好，现在让我看看之前 archive 里的对话，理解你说的 "Config Protection + 质量门禁" 的具体来源和定义。
assistant: 好，上下文全了。现在来做 Phase 2：**Config Protection + 质量门禁落地到 coding-agent skill**。

这个改动涉及两个核心概念：
1. **Config Protection** — 不让 AI 为了"让代码通过"而修改 lint/formatter/CI 配置，从机制上防止规则退化
2. **质量门禁** — 编码任务结束后自动检查代码质量

让我先看一下现有 coding-agent skill 的完整结构，然后设计改动方案。
assistant: 现在看看 coding-agent skill 的 Rules 部分，确认当前有没有质量门禁相关内容：
assistant: 现在我有完整的上下文了。coding-agent 是 OpenClaw 内置 skill（在全局安装目录），我不能直接改它。但可以通过 workspace 自定义 skill 来**覆盖/扩展**它。

最佳方案：创建 `workspace/skills/coding-agent/SKILL.md` 作为本地覆盖，加入 Config Protection + 质量门禁。OpenClaw 的 skill 加载机制会让 workspace skill 优先于全局 skill。
assistant: 好，思路清晰了。我的方案：

1. **创建 `workspace/skills/coding-agent/SKILL.md`** — 不重复原有内容，而是作为**补充规则层**，包含 Config Protection + 质量门禁
2. OpenClaw 的 workspace skill 会覆盖全局同名 skill 的 description（从而在 skill matcher 中优先匹配），但实际使用时主 agent 仍会读取全局 skill 的具体内容

实际上，更好的方式是直接增强现有内容。让我确认一下 OpenClaw 的 skill 优先级机制：
assistant: 让我直接看 OpenClaw 文档确认 skill 优先级：
assistant: 没有找到明确的优先级文档。根据我对 OpenClaw skill 系统的了解，workspace 下的同名 skill **不会覆盖**全局 skill，而是独立的。但 skill matcher 会根据 description 匹配。

更好的方案：**不创建同名 skill 覆盖，而是创建一个新的 skill `coding-gates`**，专门负责 Config Protection + 质量门禁，然后在需要时被主 agent 加载。但这样会增加 skill 碎片化。

最实用的方案：**直接改 coding-agent skill 的 Rules 部分，注入 Config Protection + 质量门禁规则**。虽然 coding-agent 是全局安装的，但我可以写入 workspace skills 目录下的同名文件——OpenClaw 会加载它。让我验证一下：
assistant: workspace 下没有 `coding-agent` 目录。现在我明白了最佳策略：

**不创建新的同名 skill**（这会造成混乱），而是**将 Config Protection + 质量门禁规则注入到现有的 `coding-agent-plan-first` skill 中**，因为它本身就是 coding-agent 的扩展。同时更新 `rules/common/security.md` 中的 Config Protection 部分，让它更具体地面向编码 agent 场景。

最终方案：
1. 更新 `rules/common/security.md` — Config Protection 规则细化
2. 创建 `rules/common/quality-gate.md` — 质量门禁规则
3. 增强 `coding-agent-plan-first` skill — 在 Execute 阶段集成 Config Protection + 质量门禁
4. 更新 `AGENTS.md` — Session Startup 中加载 quality-gate.md
assistant: 现在增强 `coding-agent-plan-first` skill，在 Execute 阶段集成 Config Protection + 质量门禁：
assistant: 现在更新 AGENTS.md，让 Session Startup 也加载 quality-gate.md：
assistant: 现在更新 `coding-agent-plan-first` 的 description，加入质量门禁关键词以便 skill matcher 更好地匹配：
assistant: 最后验证一下所有改动：
assistant: 记录到今天的 daily notes：
assistant: ---

**Phase 2 ✅ Config Protection + 质量门禁 — 已落地**

改了 3 个文件，新增 1 个：

| 文件 | 改动 | 内容 |
|------|------|------|
| `rules/common/quality-gate.md` | **新增** | 质量门禁规则：Config Protection 检查、lint/typecheck/test 流程、安全扫描、Prompt 模板 |
| `skills/coding-agent-plan-first/SKILL.md` | **增强** | Execute 阶段集成质量门禁、Config Protection 内嵌 prompt、反模式新增 2 条 |
| `AGENTS.md` | **更新** | Session Startup 加载 `quality-gate.md` |

**两道防线**：
1. **Prompt 约束** — 编码 agent 收到任务时自带 Config Protection + Quality Constraints
2. **事后审计** — 主 agent 在编码任务完成后检查 `git diff --stat` + 运行质量检查命令

不修改配置来让代码通过，这个规矩现在写进 harness 里了。
