# OpenClaw × HarnessKit × Pi 三方学习总结

> 生成日期: 2026-05-03
> 基于子任务: Pi 核心运行流程 / Pi 工具架构 / Pi 安全机制 / HarnessKit 安全审计 / HarnessKit 跨Agent 管理
> 源文件: research/openclaw-pi-architecture.md (2447行), research/harnesskit-zh-analysis.md, research/harnesskit-security-audit.md, research/harnesskit-cross-agent.md

---

## 一、三方架构对比总览

### 1.1 定位差异

| 维度 | OpenClaw | Pi (pi-coding-agent) | HarnessKit |
|------|----------|---------------------|------------|
| **核心定位** | AI Agent 运行时平台 | 编码 Agent SDK | 多 Agent 扩展管理中心 |
| **架构模式** | 嵌入式 SDK + Gateway RPC | 独立 Agent Loop + TUI | Tauri 桌面端 + CLI + Web |
| **语言** | TypeScript | TypeScript | Rust (核心) + TypeScript (前端) |
| **管理范围** | 单 Agent 全生命周期 | 单会话 Agent Loop | 8 个 Agent 的扩展/配置/安全 |
| **消息通道** | 飞书/微信/Discord/Telegram/Slack/WhatsApp | 无（终端为主） | 无 |
| **状态管理** | JSONL transcript + Gateway state | JSONL session file | SQLite |
| **安全模型** | 运行时守卫（净化管道+策略引擎） | SDK 内置安全 | 静态分析（18条规则+信任评分） |

### 1.2 能力矩阵

| 能力 | OpenClaw | Pi | HarnessKit |
|------|:--------:|:--:|:----------:|
| Agent Loop 执行 | ✅ 嵌入式 | ✅ 核心 | ❌ |
| 多通道消息 | ✅ | ❌ | ❌ |
| 工具策略管道 | ✅ 9步 | ⚠️ 基础 | ❌ |
| 会话压缩 | ✅ 自动+检查点 | ✅ 基础 | ❌ |
| 认证轮换/故障转移 | ✅ 多密钥+冷却 | ⚠️ 单密钥 | ❌ |
| 双车道串行化 | ✅ | ❌ | ❌ |
| Skill 管理 | ✅ 成熟 | ✅ 基础 | ✅ 8 Agent |
| MCP 管理 | ✅ gateway config | ⚠️ 基础 | ✅ 8 Agent |
| 静态安全审计 | ⚠️ skill-vetter | ❌ | ✅ 18条规则 |
| 信任评分 | ❌ | ❌ | ✅ 0-100 |
| 权限透明（5维度） | ❌ | ❌ | ✅ |
| 跨 Agent 部署 | ❌ | ❌ | ✅ |
| Web UI 管理 | ⚠️ canvas | ❌ | ✅ |
| 去混淆检测 | ❌ | ❌ | ✅ |
| 输入来源标注 | ✅ inter-session | ❌ | ❌ |
| 会话历史净化 | ✅ 11步管道 | ❌ | ❌ |
| 压缩后上下文注入 | ✅ postCompaction | ❌ | ❌ |
| 超时体系 | ✅ 6层 | ⚠️ 基础 | ❌ |

### 1.3 架构关系图

```
┌──────────────────────────────────────────────────────────────┐
│                        OpenClaw                              │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Gateway (RPC + 状态管理)                    │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │ │
│  │  │ Channel 插件 │  │ Cron 调度器   │  │ Session 管理  │ │ │
│  │  │ 飞书/微信... │  │              │  │ 双车道串行化  │ │ │
│  │  └──────────────┘  └──────────────┘  └───────────────┘ │ │
│  └────────────────────────┬────────────────────────────────┘ │
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────────┐ │
│  │           Pi 嵌入式运行器 (runEmbeddedPiAgent)          │ │
│  │                                                          │ │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────────────┐ │ │
│  │  │ 系统提示词  │  │ 工具管道    │  │ 事件桥接         │ │ │
│  │  │ 15+模块    │  │ 9步策略过滤  │  │ 流式分块+去重    │ │ │
│  │  │ 缓存边界   │  │ 签名适配    │  │ Thinking标签剥离  │ │ │
│  │  │ 覆盖机制   │  │ 6层超时     │  │ 压缩感知         │ │ │
│  │  └────────────┘  └────────────┘  └───────────────────┘ │ │
│  │                                                          │ │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────────────┐ │ │
│  │  │ 会话安全    │  │ 认证体系    │  │ 压缩生命周期     │ │ │
│  │  │ 11步净化   │  │ 多密钥轮换  │  │ 检查点≤25       │ │ │
│  │  │ 来源标注    │  │ 故障转移    │  │ 上下文重新注入   │ │ │
│  │  │ 守卫高阶函数│  │ 冷却跟踪    │  │ 记忆索引同步     │ │ │
│  │  └────────────┘  └────────────┘  └───────────────────┘ │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Skill 体系 (skill-vetter / security-briefing)││
│  │              ← HarnessKit 的审计引擎可增强此处          ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                      HarnessKit                              │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │ Agent Adapter  │  │ Deployer       │  │ Auditor        │ │
│  │ 8个Agent统一接口│  │ 跨Agent格式适配│  │ 18条静态规则   │ │
│  │ 配置文件发现   │  │ 原子写入+文件锁│  │ 信任评分0-100  │ │
│  └────────────────┘  └────────────────┘  └────────────────┘ │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐                      │
│  │ Scanner        │  │ Web UI         │                      │
│  │ 扩展发现+权限推│  │ React+Axum     │                      │
│  │ 5维度权限推断  │  │ Bearer token   │                      │
│  └────────────────┘  └────────────────┘                      │
│                                                              │
│  ※ 独立于 OpenClaw，通过 OpenClawAdapter 浅层集成            │
└──────────────────────────────────────────────────────────────┘
```

---

## 二、各自独特优势

### 2.1 OpenClaw 独特优势

1. **双车道串行化** — 会话级隔离 + 全局资源控制的进程内命令队列，Cron 自动映射避免死锁，Generation 机制支持热重启安全
2. **运行时安全守卫** — 11 步会话历史净化管道 + 输入来源标注（inter_session 消息自动标记）+ guardSessionManager 高阶守卫
3. **系统提示词缓存边界** — Stable/Dynamic 分区，频繁变化的 HEARTBEAT.md 放在缓存边界之后，优化 LLM API 缓存命中
4. **工具策略管道** — 9 步纯函数顺序过滤，7 层策略源（profile → global → agent → group → sandbox → subagent），每步不修改原始数组
5. **压缩后上下文注入** — 自动从 AGENTS.md 提取关键段落（Session Startup + Red Lines），压缩后重新注入，防止 LLM 依赖有损摘要
6. **6 层超时体系** — 从 Gateway 等待（30s）到 HTTP 流（30min）到运行时（48h），含压缩宽限、PID 回收检测等精细控制
7. **认证轮换 + 故障转移** — 多密钥配置 + 冷却跟踪 + FailoverError 类 + 按原因分类的自动恢复
8. **多通道消息** — 飞书/微信/Discord/Telegram/Slack/WhatsApp 统一消息接口 + 消息工具去重

### 2.2 Pi 独特优势

1. **嵌入式 SDK 模式** — 直接导入而非子进程/RPC，获得完全控制力，避免 IPC 开销
2. **builtInTools 留空策略** — 所有工具统一走 customTools，确保策略过滤跨提供商一致
3. **会后覆盖模式** — 系统提示词在会话创建后覆盖，允许运行时根据渠道/沙箱/钩子动态调整
4. **Agent Loop 事件流** — 完整的 agent_start → message_* → tool_execution_* → compaction_* → agent_end 事件体系
5. **Thinking 标签处理** — 跨 chunk 追踪未闭合标签，8 种标签名变体（含 antthinking、antml:think 等）
6. **代码块保护分块** — EmbeddedBlockChunker 在代码块边界保护 Markdown 完整性，强制分割时自动关闭+重新打开

### 2.3 HarnessKit 独特优势

1. **AgentAdapter 统一抽象** — `AgentAdapter` trait 封装 8 个 Agent 的差异，上层逻辑（deployer/scanner/auditor）完全与 Agent 无关
2. **18 条结构化审计规则** — 覆盖 Prompt 注入、RCE、凭证窃取、明文密钥、安全绕过、危险命令、权限组合等，正则 + 逻辑组合
3. **信任评分算法** — 0-100 量化评分 + 同规则去重（首次扣全量，后续仅扣 1 分）+ 三档分级（Safe/Low Risk/Needs Review）
4. **5 维度权限推断** — 文件系统/网络/Shell/数据库/环境变量，按扩展类型差异化推断（如 Skill 不推断 Env 避免误报）
5. **去混淆层** — 自动去除零宽字符、方向格式化字符、隐形运算符等 15+ 种 Unicode 不可见字符
6. **上下文感知审计** — `descriptive_line_mask()` 跳过代码块和引用块中的示例，`反引号检测`跳过文档引用的 `--force` 等
7. **跨 Agent 格式适配** — 自动处理 JSON/TOML MCP 格式差异、Hook 事件名翻译、Codex 名称清洗、Antigravity PATH 注入
8. **原子文件操作** — 文件锁（fs2::FileExt）、原子 JSON/TOML 写入、路径白名单、symlink 跳过

---

## 三、OpenClaw 可借鉴的改进点（按优先级）

### P0: 移植 HarnessKit 安全审计规则到 skill-vetter

**问题**: 当前 skill-vetter 是 15 条人工 checklist，无自动化扫描、无量化评分、无去混淆、无上下文感知。

**方案**: 将 18 条规则的核心正则 + 去混淆 + 上下文感知机制移植到 skill-vetter，升级为"自动化扫描 + 0-100 评分"。

**具体规则移植优先级**:

| 优先级 | 规则 | 原因 |
|--------|------|------|
| P0-a | `prompt-injection` (7个正则) | 最常见的 AI Agent 攻击向量 |
| P0-b | `rce` (5个正则) | `curl \| sh` 等模式在 skill 中完全可能存在 |
| P0-c | `plaintext-secrets` (7个前缀正则) | 直接检测硬编码 API key |
| P0-d | `credential-theft` (双重条件) | 读取敏感文件 + 发送到外部 |
| P0-e | `safety-bypass` (6个正则) | `--no-verify`、`--force` 等 |
| P1-a | `dangerous-commands` | `rm -rf /`、`sudo` 等 |
| P1-b | `mcp-command-injection` | MCP args 中的 shell 子执行 |
| P2-a | `broad-permissions` | MCP 全接口绑定 |
| P2-b | `supply-chain` | npx 非 scoped 包 |
| P3-a | `permission-combo-risk` | Network + Env 组合检测 |

**必带基础设施**:
- `deobfuscate()` — 审查前去除不可见 Unicode
- `descriptive_line_mask()` — 跳过代码块/引用块中的示例
- `compute_trust_score()` — 同规则去重计分
- 反引号检测 — 跳过文档引用的安全标志

**预期收益**: skill-vetter 从"人工 checklist" → "自动化扫描 + 量化评分 + 三档分级"

### P1: 权限透明机制

**问题**: OpenClaw 的 Skill 安全边界靠 AGENTS.md 约定（"禁止写入 /etc/*"等），无程序化权限扫描。

**方案**: 参考 HarnessKit 的 5 维度权限推断，为 OpenClaw 的 skill-vetter 和 security-briefing 增加自动权限展示。

**建议实现**:
- Skill 审计时自动展示：文件系统路径、访问的域名、执行的 shell 命令
- 作为 `openclaw skills check` 输出的一部分
- 安全通报（security-briefing）中纳入权限维度

### P2: MCP 专项安全审计

**问题**: OpenClaw 有 MCP 服务器管理能力但无安全审计。

**方案**: 移植 3 条 MCP 相关规则：
- `mcp-command-injection` — args 中的 `$()` 和反引号
- `broad-permissions` — `0.0.0.0`/`*` 绑定检测
- `supply-chain` — `npx` 非 scoped 包 typosquatting

### P3: 压缩后上下文注入的精细化

**问题**: 当前默认注入 "Session Startup" + "Red Lines" 两个段落，但不同场景可能需要不同段落。

**方案**（已有配置支持，需文档化）:
- 利用已有的 `agents.defaults.compaction.postCompactionSections` 配置
- 根据使用场景（编码 vs 日常对话 vs 研究任务）定制注入段落
- 将此配置纳入 HEARTBEAT.md 的定期检查项

---

## 四、HarnessKit 可借鉴的改进点

### P0: 运行时安全守卫

**问题**: HarnessKit 只有静态分析，无法检测运行时行为（如 Skill 执行期间的外部请求）。

**建议**: 参考 OpenClaw 的 guardSessionManager 模式：
- 消息写入前拦截钩子
- 敏感信息自动脱敏
- 工具名称白名单
- 工具结果大小限制

### P1: 会话历史净化

**问题**: HarnessKit 不审计会话历史，无法检测会话中的恶意注入积累。

**建议**: 参考 OpenClaw 的 11 步净化管道，至少实现：
- 工具调用 ID 标准化（防止幽灵工具调用）
- 跨会话消息来源标注
- 推理块按策略处理

### P2: 输入来源标注

**问题**: HarnessKit 的 Web UI 接收用户输入时无来源标记。

**建议**: 对跨 Agent 部署操作添加来源追踪，记录"谁在何时将哪个 Skill 部署到哪个 Agent"。

---

## 五、具体落地 Action Items

### 5.1 增强 skill-vetter（P0，预估 3-5 天）

| # | Action | 产出 | 时间 |
|---|--------|------|------|
| 1 | 提取 HarnessKit 正则模式库为独立 JS 模块 | `skills/skill-vetter/rules/patterns.mjs` | 0.5天 |
| 2 | 实现 `deobfuscate()` 和 `descriptive_line_mask()` | `skills/skill-vetter/rules/utils.mjs` | 0.5天 |
| 3 | 移植 5 条 P0 规则（prompt-injection/rce/plaintext-secrets/credential-theft/safety-bypass） | `skills/skill-vetter/rules/*.mjs` | 1天 |
| 4 | 实现 `compute_trust_score()` + 三档分级 | `skills/skill-vetter/scoring.mjs` | 0.5天 |
| 5 | 集成到 skill-vetter SKILL.md 的 Step 2（Code Review） | 更新 SKILL.md | 0.5天 |
| 6 | 测试 + 误报调优 | 测试用例 + 规则调整 | 1天 |

**负责人建议**: 主 agent 执行，需 Ray 评审最终规则集

### 5.2 MCP 安全审计（P2，预估 1-2 天）

| # | Action | 产出 | 时间 |
|---|--------|------|------|
| 1 | 移植 3 条 MCP 规则 | `skills/skill-vetter/rules/mcp-*.mjs` | 0.5天 |
| 2 | 集成到 `openclaw skills check` 或独立命令 | 更新 skill-vetter | 0.5天 |
| 3 | 测试（使用现有 MCP 配置） | 测试报告 | 0.5天 |

### 5.3 权限透明展示（P1，预估 1-2 天）

| # | Action | 产出 | 时间 |
|---|--------|------|------|
| 1 | 实现基础权限推断（文件系统/网络/Shell 3维度） | `skills/skill-vetter/permissions.mjs` | 1天 |
| 2 | 在 skill-vetter 输出中添加权限标签 | 更新 SKILL.md | 0.5天 |
| 3 | 可视化（飞书消息中展示权限雷达图或标签列表） | canvas 页面或纯文本 | 0.5天 |

### 5.4 利用已有配置优化（P3，预估 0.5 天）

| # | Action | 产出 | 时间 |
|---|--------|------|------|
| 1 | 配置 `postCompactionSections` 根据使用场景定制 | 更新 gateway config | 0.5天 |

### 5.5 HarnessKit 作为补充工具的配置优化（预估 0.5 天）

| # | Action | 产出 | 时间 |
|---|--------|------|------|
| 1 | 完善 OpenClaw Adapter（提交 PR 到 harnesskit-zh 补全 `read_mcp_servers` 和 `read_hooks`） | PR | 0.5天 |
| 2 | 创建 `cross-agent-deploy` Skill（参考 deployer.rs 的格式适配逻辑） | `skills/cross-agent-deploy/SKILL.md` | 0.5天 |

---

## 六、对现有 Skill 体系的增强建议

### 6.1 skill-vetter 增强

| 维度 | 当前状态 | 目标状态 |
|------|---------|---------|
| 扫描方式 | 人工 checklist 引导 | 自动正则扫描 |
| 评分机制 | 4 级主观分类 (LOW/MEDIUM/HIGH/EXTREME) | 0-100 量化 + 三档分级 |
| 上下文感知 | 无 | 跳过代码块/引用块中的示例 |
| 去混淆 | 无 | 自动去除不可见 Unicode |
| 组合风险 | 无 | Network+Env / Shell+Network 检测 |
| 覆盖范围 | 仅 Skill | Skill + MCP |
| 输出格式 | Markdown 报告 | 结构化 JSON + Markdown |

### 6.2 security-briefing 增强

| 维度 | 当前状态 | 建议增强 |
|------|---------|---------|
| 关注点 | 外部 CVE/漏洞情报 | 增加内部扩展安全（与 skill-vetter 联动） |
| 数据源 | web_search CVE 数据 | 增加 skill-vetter 的扫描结果汇总 |
| 触发方式 | 手动/定期 | skill 安装时自动触发快速审计 |

### 6.3 新 Skill 建议

| Skill 名称 | 描述 | 优先级 | 预估 |
|-----------|------|:------:|------|
| `cross-agent-deploy` | 将 OpenClaw Skill 部署到 Claude Code/Codex 等其他 Agent | P2 | 1天 |
| `skill-audit-auto` | 自动化 skill 安全审计（skill-vetter 的自动化版本） | P1 | 2天 |
| `mcp-audit` | MCP 服务器专项安全审计 | P2 | 1天 |

### 6.4 AGENTS.md 优化建议

基于 Pi 架构分析，当前 AGENTS.md 中的配置与 OpenClaw 内部实现高度对齐，无需大改。微调建议：

1. **TOOLS.md 的 CACHE_BOUNDARY 标记** — 确认系统识别此标记并正确分区（已确认 ✅）
2. **压缩后注入段落** — 确保 AGENTS.md 中 "Session Startup" 和 "Red Lines" 段落标题拼写与默认配置一致
3. **Memory 分层** — L1/L2 分层策略与 `postCompactionSections` 协同，确保压缩后 L1 核心事实被重新注入

---

## 七、跨项目设计模式提炼

从三方研究中提炼出的可复用设计模式：

### 7.1 双车道串行化（来自 OpenClaw）

**模式**: 进程内命令队列 + 嵌套车道 + Generation 机制
**适用**: 需要会话级隔离 + 全局资源控制的并发系统
**要点**: Session Lane 保证同一会话串行，Global Lane 限制全局并行度，Cron 自动映射到独立车道避免死锁

### 7.2 AgentAdapter 统一抽象（来自 HarnessKit）

**模式**: Trait/接口 + 每个实现封装差异 → 上层逻辑完全与具体 Agent 无关
**适用**: 需要管理多种同类型系统的统一管理平台
**要点**: deployer/scanner/auditor 不关心底层是哪个 Agent，格式转换由 adapter 负责

### 7.3 策略管道（来自 OpenClaw）

**模式**: 9 步纯函数顺序变换，每步输入上一步输出，不修改原始数据
**适用**: 需要多层策略叠加的权限/过滤系统
**要点**: 纯函数保证可测试性和可组合性，顺序从具体到通用确保优先级

### 7.4 上下文感知扫描（来自 HarnessKit）

**模式**: 审计前去除不可见字符 + 跳过代码块/引用块中的示例 + 反引号检测
**适用**: 任何需要对用户编写的内容进行模式匹配的系统
**要点**: 减少误报是安全工具可用性的关键

### 7.5 会后覆盖（来自 OpenClaw）

**模式**: 先用 SDK 默认值创建对象，创建后立即覆盖关键属性
**适用**: 嵌入式 SDK 集成场景，需要完全控制但保留 SDK 的创建流程
**要点**: 替换 `_rebuildSystemPrompt` 阻止后续重建，确保覆盖不被绕过

### 7.6 同规则去重计分（来自 HarnessKit）

**模式**: 同一 rule_id 的多个 finding，首次扣全量分，后续每个仅扣 1 分
**适用**: 基于规则的评分系统，需要区分"模式存在"和"模式广泛使用"
**要点**: 避免文档中多次提及同一安全模式导致评分暴跌

---

## 八、总结

### 核心发现

1. **OpenClaw 的运行时安全机制远超 HarnessKit 的静态分析** — 11 步净化管道、输入来源标注、guardSessionManager 等机制构成了深度防御体系，而 HarnessKit 的 18 条规则只覆盖安装时的静态扫描
2. **HarnessKit 的静态审计引擎是 OpenClaw 的短板** — OpenClaw 的 skill-vetter 停留在人工 checklist 阶段，缺乏自动化扫描和量化评分
3. **Pi 的嵌入式 SDK 模式是 OpenClaw 的核心竞争力** — 完全控制 Agent Loop、工具管道、事件流，比 HarnessKit 的"文件级管理"深入几个量级
4. **跨 Agent 管理是 HarnessKit 的独有能力** — OpenClaw 当前只管理自身，如果 Ray 的多 Agent 使用场景增多，HarnessKit 是唯一选择
5. **三方互补性极强** — OpenClaw（运行时）+ HarnessKit（静态审计）+ Pi（Agent SDK）覆盖了 AI Agent 生态的不同层面

### 最大 ROI 的行动

**将 HarnessKit 的审计规则移植到 OpenClaw 的 skill-vetter** — 预估 3-5 天，可将 skill-vetter 从人工 checklist 升级为自动化扫描 + 量化评分，直接提升 OpenClaw 的扩展安全性。这是整个学习工作流中价值最高的可落地改进。

---

*总结完成。基于 5 个子任务的 ~4000 行研究笔记综合产出。*
