# everything-claude-code Rules & Hooks 调研

> 调研日期: 2026-04-05
> 仓库: [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) (138k⭐)
> 辅助参考: [disler/claude-code-hooks-mastery](https://github.com/disler/claude-code-hooks-mastery) (3.5k⭐)

## 1. 项目定位

Claude Code 的生产级插件集，包含：
- **agents/** — 专用子 agent（planner, code-reviewer, tdd-guide, security-reviewer 等 10 个）
- **skills/** — 工作流定义和领域知识
- **commands/** — 用户斜杠命令（/tdd, /plan, /e2e）
- **hooks/** — 生命周期触发自动化（hooks.json + scripts/）
- **rules/** — 始终遵循的准则（common + 语言特定）
- **mcp-configs/** — MCP server 配置

## 2. Rules 体系

### 目录结构
```
rules/
├── common/          # 通用规则（始终安装）
│   ├── coding-style.md    # 不可变性、文件组织、错误处理
│   ├── git-workflow.md    # commit 格式、PR 流程
│   ├── testing.md         # 80%覆盖率、TDD 强制
│   ├── performance.md     # 模型选择、上下文管理
│   ├── patterns.md        # Repository 模式、API 响应格式
│   ├── hooks.md           # Hook 类型和最佳实践
│   ├── agents.md          # Agent 编排策略
│   └── security.md        # 安全检查清单
├── typescript/      # TS/JS 特定
├── python/
├── golang/
├── web/
├── swift/
└── php/
```

### Rules 核心原则

| 文件 | 关键规则 |
|------|----------|
| coding-style | **不可变性优先**（不修改原对象，返回新副本）；文件 <800 行；函数 <50 行；错误必须显式处理 |
| testing | 80% 覆盖率强制；TDD RED→GREEN→REFACTOR；用 tdd-guide agent |
| security | 提交前 checklist（secrets/注入/XSS/CSRF/认证/限流）；发现问题→STOP→security-reviewer→轮换密钥→全库排查 |
| performance | Haiku 做轻量 worker，Sonnet 做主开发，Opus 做架构决策；避免用到上下文窗口最后 20% |
| agents | 10 个专用 agent；独立任务并行执行；复杂问题用多角色子 agent（事实审查、资深工程师、安全专家） |
| git-workflow | `type: description` 格式；PR 要分析完整 commit history |

## 3. Hooks 体系（核心亮点）

### 生命周期阶段

```
SessionStart → PreToolUse → PostToolUse → PreCompact → Stop
                                ↓
                       PostToolUseFailure
```

### SessionStart
- 加载上次上下文 + 检测包管理器

### PreToolUse（12 个 hook）

| ID | Matcher | 功能 | 设计模式 |
|----|---------|------|----------|
| `block-no-verify` | Bash | 阻止 `git commit --no-verify` | **护栏** |
| `auto-tmux-dev` | Bash | 自动在 tmux 启动 dev server | 便利自动化 |
| `tmux-reminder` | Bash | 长命令提醒用 tmux | 提醒 |
| `git-push-reminder` | Bash | push 前提醒 review | 提醒 |
| `commit-quality` | Bash | lint staged + 校验 commit msg + 检测 console.log/debugger/secrets | **质量门禁** |
| `doc-file-warning` | Write | 非标准文档文件警告 | 引导 |
| `suggest-compact` | Edit/Write | 逻辑间隔提醒手动 compact | 上下文管理 |
| `observe` (async) | * | 捕获工具使用（持续学习） | 可观测性 |
| `insaits-security` | Bash/Write/Edit | AI 安全监控（可选） | 安全 |
| `governance-capture` | Bash/Write/Edit | 捕获治理事件（secrets泄露、策略违规） | **治理** |
| `config-protection` | Write/Edit | **阻止修改 linter/formatter 配置** | ⭐ **核心创新** |
| `mcp-health-check` | * | MCP 健康检查 | 弹性 |

### PostToolUse（10 个 hook）

| ID | Matcher | 功能 | 设计模式 |
|----|---------|------|----------|
| `command-log-audit` | Bash | 审计日志 → `~/.claude/bash-commands.log` | 可观测性 |
| `command-log-cost` | Bash | 成本追踪 | 可观测性 |
| `pr-created` | Bash | PR 创建后记录 URL | 工作流集成 |
| `build-complete` (async) | Bash | 异步构建分析 | 便利自动化 |
| `quality-gate` (async) | Edit/Write | 编辑后质量门禁 | **质量门禁** |
| `design-quality-check` | Edit/Write | 前端设计质量检查 | 质量保障 |
| `edit-accumulator` | Edit/Write | 累积编辑的文件路径 | ⭐ **延迟批处理** |
| `console-warn` | Edit | 检测 console.log | 代码质量 |
| `governance-capture` | Bash/Write/Edit | 治理事件捕获（后置） | 治理 |
| `observe` (async) | * | 捕获工具结果（持续学习） | 可观测性 |

### PreCompact
- 压缩前保存状态

### Stop
- `stop:format-typecheck` — **批量** format (Biome/Prettier) + typecheck (tsc)

### PostToolUseFailure
- 跟踪失败 MCP 调用，标记不健康服务器

## 4. 三大创新模式

### ⭐ 模式 1: Config Protection（配置保护）
**问题**：AI 为了让代码"通过检查"，会主动弱化 lint/formatter 规则
**方案**：`config-protection` hook 拦截对配置文件的 Write/Edit，引导 AI 修代码而非改规则
**价值**：从机制上防止"规则退化"，这比靠 prompt 约束可靠得多

### ⭐ 模式 2: Deferred Batch Processing（延迟批处理）
**问题**：每次 Edit 都跑 format + typecheck 太慢
**方案**：
1. `edit-accumulator` 在 PostToolUse 只记录修改的文件路径
2. `stop:format-typecheck` 在会话结束时统一批量处理
**价值**：性能优化 + 不打断开发心流

### ⭐ 模式 3: Governance Capture（治理事件捕获）
**问题**：AI 操作中的安全隐患（secrets 泄露、权限违规）难以追溯
**方案**：`governance-capture` 在 Pre/PostToolUse 捕获异常事件
**启用**：环境变量开关 `ECC_GOVERNANCE_CAPTURE=1`（不强制）
**价值**：可审计的操作日志 + 按需启用

### 其他模式
- **分层启用**：治理和安全功能用环境变量开关，核心功能始终开启
- **async hooks**：observe、build-complete 等不阻塞主流程
- **护栏式阻断**：block-no-verify、config-protection 用 exit code 阻断危险操作

## 5. ECC Agent 体系

| Agent | 用途 | 触发时机 |
|-------|------|----------|
| planner | 实现规划 | 复杂功能、重构 |
| architect | 系统设计 | 架构决策 |
| tdd-guide | 测试驱动开发 | 新功能、Bug 修复 |
| code-reviewer | 代码审查 | 写完代码后 |
| security-reviewer | 安全分析 | 提交前 |
| build-error-resolver | 修复构建错误 | 构建失败 |
| e2e-runner | E2E 测试 | 关键用户流程 |
| refactor-cleaner | 死代码清理 | 代码维护 |
| doc-updater | 文档更新 | 更新文档 |
| rust-reviewer | Rust 代码审查 | Rust 项目 |

**编排策略**：
- 独立任务并行执行
- 复杂问题用多角色子 agent
- 无需用户提示，自动触发

---

## 6. OpenClaw 映射方案

### 概念对照

| ECC 概念 | OpenClaw 对应 | 差距分析 |
|----------|---------------|----------|
| Rules (.md) | SOUL.md + AGENTS.md + Skills | ✅ 已有，但散落在多个文件 |
| Hooks (hooks.json) | OpenClaw 无原生 hook 机制 | ❌ 需要通过 Skill/Cron/Heartbeat 模拟 |
| Agents (subagent) | sessions_spawn | ✅ 已有 subagent |
| Commands (/tdd) | 无等价物（靠自然语言） | ⚠️ 可用 skill 描述替代 |
| Skills | Skills (SKILL.md) | ✅ 已有 |
| PreToolUse | 无 | ❌ 需要新增机制或 skill 内前置检查 |
| PostToolUse | 无 | ❌ 同上 |
| Stop | Heartbeat / cron | ⚠️ 部分可模拟 |
| Config Protection | SAFETY.md / AGENTS.md Red Lines | ⚠️ prompt 级约束，不如 hook 可靠 |
| Edit Accumulator | 无 | ❌ 需要新增 |
| Governance Capture | 无 | ❌ 需要新增 |

### 可立即借鉴的模式（不需要 OpenClaw 改代码）

| 模式 | 实现方式 | 优先级 |
|------|----------|--------|
| **Rules 体系化** | 整理 common rules 到 `workspace/rules/`，按 SOUL.md → common → 语言特定 分层 | P0 |
| **Config Protection** | 写入 AGENTS.md Red Lines，作为 skill 执行前强制检查 | P1 |
| **质量门禁** | coding-agent skill 增加 post-edit quality gate 步骤 | P1 |
| **Agent 分类** | 明确定义 main 的 subagent 角色（已有 agents/） | P2 |
| **治理事件捕获** | 在 SAFETY.md 定义治理规则 + 心跳时检查 | P2 |
| **延迟批处理** | 编码任务结束后统一跑 lint/format | P2 |

### 需要 OpenClaw 原生支持才能实现

| 模式 | 说明 |
|------|------|
| PreToolUse Hook | 工具执行前的拦截/修改 |
| PostToolUse Hook | 工具执行后的自动检查 |
| Edit Accumulator | 累积编辑文件路径，session 结束时批量处理 |
| exit code 阻断 | hook 返回非 0 阻止工具执行 |

### 建议行动路线

**Phase 1（本周）— Rule 体系化**
1. 创建 `workspace/rules/` 目录
2. 提炼 ECC common rules 适配 OpenClaw 场景
3. 在 AGENTS.md 增加 rules 加载规则

**Phase 2（下周）— 高价值模式移植**
4. Config Protection → AGENTS.md Red Lines + 编码 skill 增强
5. 质量门禁 → coding-agent skill 后置检查
6. Agent 分类 → 完善 agents/ 下的 subagent 定义

**Phase 3（待定）— Hook 机制探索**
7. 向 OpenClaw 提 feature request：PreToolUse/PostToolUse hook
8. 或用 OpenClaw plugin 机制实现轻量 hook
