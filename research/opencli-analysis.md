# OpenCLI vs OpenClaw 对比分析报告

> 分析日期: 2026-04-07 | 基于源码研读和研究笔记
> OpenCLI: [jackwener/opencli](https://github.com/jackwener/opencli) v1.6.8
> OpenClaw: [openclaw](https://github.com/nicepkg/openclaw) — 当前运行版本

---

## 1. 产品定位差异（先说清楚）

| 维度 | OpenCLI | OpenClaw |
|------|---------|----------|
| **核心身份** | 终端用户的 CLI 工具 | AI Agent 基础设施框架 |
| **目标用户** | 开发者/Power User（个人使用） | 需要构建 Agent 系统的开发者/团队 |
| **核心价值** | 「用自然语言操作网站」 | 「让 AI Agent 持久化运行」 |
| **运行模式** | 一次性命令执行 | 常驻守护进程 + 多通道 |
| **扩展方式** | 79+ 网站适配器 | 63+ Skills + 通道插件 |
| **AI 集成** | LLM 作为可选增强 | LLM 是核心引擎 |

一句话：**OpenCLI 是「人的浏览器遥控器」，OpenClaw 是「AI 代理的操作系统」。** 两者不是竞品，但设计思路上有很多值得互相借鉴的点。

---

## 2. 浏览器自动化方案

### 架构对比

```
OpenCLI:  CLI → Daemon(HTTP) → Chrome Extension → chrome.debugger → CDP
OpenClaw: Agent → browser tool → OpenClaw-managed Chromium (Playwright)
                      ↘ profile="user" → 用户已运行的 Chrome (CDP)
```

| 维度 | OpenCLI Browser Bridge | OpenClaw Browser Tool |
|------|----------------------|----------------------|
| **浏览器来源** | 用户已安装的 Chrome | OpenClaw 自管理 Chromium |
| **安装要求** | 需安装 Chrome 扩展 | 零安装，开箱即用 |
| **用户登录态** | ✅ 天然复用（核心卖点） | ❌ 默认隔离；需 profile="user" |
| **通信链路** | HTTP + WebSocket + CDP（4层） | 内置协议（Playwright） |
| **隔离性** | workspace 级窗口隔离 | 完全独立实例 |
| **反检测** | 13项 stealth 补丁 + toString 伪装 | 依赖 Playwright stealth 插件 |
| **Electron 支持** | ✅ CDP 直连 + 自动发现 | 通过 profile 连接 |
| **容错** | 4次重试 + 瞬态错误识别 + tab漂移恢复 | 内置容错 |
| **安全模型** | 5层纵深防御（origin/header/CORS/size/WS） | 沙箱隔离 |

### 各自优势

**OpenCLI:**
- **复用用户登录态**是杀手级特性——不需要重新登录就能操作已认证的网站
- 安全模型经过精心设计，5层防御值得学习
- stealth 补丁覆盖面广，toString 伪装防止间接检测
- workspace 隔离 + bind-current 借用模式灵活

**OpenClaw:**
- **零配置**开箱即用，不需要用户安装任何东西
- 完全隔离的浏览器实例，适合自动化测试和批量操作
- 支持多种 profile（isolated / user），按需切换
- 内置在 Agent 框架中，可被 subagent 编排

### 适用场景

| 场景 | 推荐 | 原因 |
|------|------|------|
| 需要用户已登录态的操作（点赞、评论、发布） | OpenCLI | 天然复用 Chrome session |
| 批量无状态爬取 | OpenClaw | 隔离性好，可并行 |
| 自动化测试 | OpenClaw | 干净环境 |
| Electron 应用自动化 | OpenCLI | CDP 直连 + 自动发现 |
| 日常 Agent 任务中的网页交互 | OpenClaw | 无需额外安装 |

### 可借鉴点

1. **OpenClaw → 借鉴 OpenCLI**: stealth 补丁体系更全面（13项 vs Playwright 默认），特别是 toString 伪装和 Error.stack 过滤，可以集成到 OpenClaw 的浏览器方案中
2. **OpenClaw → 借鉴 OpenCLI**: `bind-current` 模式——将用户当前标签页以只读方式借用给 Agent，是「复用登录态」和「保持隔离」的优雅折中
3. **OpenCLI → 借鉴 OpenClaw**: 5层安全模型过于复杂，OpenClaw 的沙箱隔离方案更简洁有效

---

## 3. 适配器/插件扩展机制

### 架构对比

```
OpenCLI 适配器:
  ~/.opencli/clis/<site>/*.yaml    ← 声明式 pipeline
  ~/.opencli/clis/<site>/*.ts      ← 代码式适配器
  ~/.opencli/plugins/<name>/       ← 插件包
  cli-manifest.json                ← 生产预编译
  globalThis.__opencli_registry__  ← 全局命令注册表

OpenClaw Skills:
  ~/.openclaw/workspace/skills/<name>/SKILL.md  ← 技能定义（Markdown）
  ~/.openclaw/workspace/skills/<name>/references/ ← 参考文档
  ~/.openclaw/workspace/skills/<name>/scripts/    ← 辅助脚本
  SKILL.md → description → 匹配触发 → Agent 读取执行
```

| 维度 | OpenCLI 适配器 | OpenClaw Skills |
|------|--------------|----------------|
| **定义格式** | YAML pipeline + TypeScript | Markdown（SKILL.md） |
| **学习门槛** | YAML 低，TS 中等 | 极低（写文档即可） |
| **执行模型** | Pipeline 步骤链 / 自定义函数 | Agent 读取后自由发挥 |
| **类型安全** | TypeScript 有类型约束 | 无约束，靠 prompt 兜底 |
| **共享代码** | `_shared/` 目录 + import | references/ + scripts/ |
| **发现机制** | 文件系统扫描 / manifest | description 关键词匹配 |
| **预编译优化** | ✅ manifest 内联 YAML 为 JSON | ❌ 无需编译 |
| **monorepo 支持** | ✅ symlink 子插件 | ❌ 无此概念 |
| **社区贡献** | 简单场景 YAML 即可，门槛极低 | 写 SKILL.md 即可 |

### 各自优势

**OpenCLI:**
- **YAML + TS 双引擎**设计精妙——简单用 YAML，复杂用 TS，80/20 法则
- Manifest 预编译消除运行时 YAML 解析开销
- Pipeline Step Registry 允许插件注册自定义 YAML 操作，扩展性极强
- `_shared/` 跨站点共享工具，`opencli-plugin.json` 标准化插件元数据
- **录制回放 + 自动探索**自动生成适配器，大幅降低新站点适配成本

**OpenClaw:**
- **Markdown 即技能**——最低的抽象层，人人能写，AI 能读
- SKILL.md 由 Agent 动态读取，天然支持上下文注入
- 不需要编译/转译，即时生效
- 灵活度极高——Skill 可以指导任何工具组合

### 适用场景

| 场景 | 推荐 | 原因 |
|------|------|------|
| 定义网站操作流程 | OpenCLI | Pipeline 步骤链精确控制 |
| 定义 AI 工作流 | OpenClaw | Agent 可自由组合工具 |
| 社区快速贡献 | 相当 | YAML ≈ SKILL.md，都极低门槛 |
| 需要共享业务逻辑 | OpenCLI | TS + import + _shared |
| 需要类型安全 | OpenCLI | TypeScript 编译期检查 |

### 可借鉴点

1. **OpenClaw → 借鉴 OpenCLI**: 引入「轻量 pipeline 模式」——对于高频重复的操作（如热榜查询），可以支持简化的 YAML/JSON 流程定义，减少每次都让 Agent 读取 SKILL.md 再自由发挥的不确定性
2. **OpenClaw → 借鉴 OpenCLI**: `_shared/` 共享模块的概念——当前 OpenClaw Skills 之间主要通过 Agent prompt 传递信息，缺少代码级复用
3. **OpenCLI → 借鉴 OpenClaw**: 自动探索（explore → synthesize → generate）的理念——OpenClaw 可以引入类似的「自动生成 Skill」能力，让 Agent 根据用户操作自动生成 SKILL.md
4. **OpenClaw → 借鉴 OpenCLI**: 插件 monorepo 支持——当 Skills 变多时，需要更好的组织和分发机制

---

## 4. AI Agent 集成模式

| 维度 | OpenCLI | OpenClaw |
|------|---------|----------|
| **AI 角色** | 可选增强（辅助生成适配器、自然语言→命令） | 核心引擎（一切由 Agent 驱动） |
| **指令文件** | AGENT.md / .cursorrules | AGENTS.md / SOUL.md / USER.md |
| **上下文管理** | 单次命令，无持久上下文 | 多轮会话 + compaction + memory |
| **记忆系统** | 无内置 | OpenViking 语义记忆 + 文件记忆 |
| **多通道** | 纯 CLI | 飞书/Telegram/QQ/WebChat + CLI |
| **Agent 团队** | 无 | main/coder/reviewer/research 等 subagent |
| **调度能力** | 无 | cron job / heartbeat / proactive agent |
| **工具系统** | IPage（浏览器操作） | 50+ 工具（浏览器/飞书/日历/文件/搜索…） |

### 各自优势

**OpenCLI:**
- LLM 是「锦上添花」——即使没有 AI，所有适配器也能正常工作
- 自然语言→命令的翻译层（如 `synthesize`）设计精巧
- `AGENT.md` / `.cursorrules` 让 Cursor 等 AI IDE 直接理解适配器开发约定

**OpenClaw:**
- AI Native 设计——Agent 有记忆、有身份、有调度、有多通道
- 完整的 Agent 生命周期管理（session/compaction/memory/cron）
- 丰富的工具生态让 Agent 能处理几乎任何任务
- Subagent 编排能力（并行任务派发、结果聚合）

### 可借鉴点

1. **OpenCLI → 借鉴 OpenClaw**: 引入基础记忆——用户的使用习惯、偏好配置（如常用网站、默认参数）可以持久化，不必每次重新指定
2. **OpenClaw → 借鉴 OpenCLI**: `AGENT.md` / `.cursorrules` 的约定——OpenClaw 可以在 Skills 目录中推广类似的约定文件，让外部 AI 工具也能理解 Skill 的开发规范
3. **OpenCLI → 借鉴 OpenClaw**: AI 增强「不是必需品而是增强层」的设计哲学——即使 AI 不可用，核心功能（适配器/Skills）仍应能被直接调用

---

## 5. 反检测/安全策略

| 维度 | OpenCLI | OpenClaw |
|------|---------|----------|
| **stealth 补丁** | 13项，覆盖全面 | Playwright stealth 插件（较基础） |
| **toString 伪装** | ✅ WeakMap 全局拦截 | ❌ 无 |
| **Error.stack 清理** | ✅ CDP 痕迹过滤 | ❌ 无 |
| **Function.prototype 拦截** | ✅ 调试语句剥离 | ❌ 无 |
| **iframe 一致性** | ✅ 跨 iframe chrome 对象 | ❌ 无 |
| **认证策略级联** | PUBLIC→COOKIE→HEADER→INTERCEPT→UI | 无此概念 |
| **安全隔离** | loopback-only daemon + 5层防御 | 完全隔离的浏览器实例 |
| **权限模型** | 无 elevated 概念 | elevated + allowlist + sandbox |

### 各自优势

**OpenCLI:**
- **stealth 覆盖面远超 Playwright 默认**——13项补丁 + toString 伪装是生产级反检测
- 认证策略级联设计精巧——自动探测最优认证方式，无需人工配置
- 5层纵深防御保护 daemon 不被恶意网页利用

**OpenClaw:**
- **沙箱隔离是更根本的安全策略**——不需要反检测，因为浏览器本身就是干净的
- elevated + allowlist 权限模型系统化
- systemd + WSL2 隔离提供了额外的安全层

### 适用场景

| 场景 | 推荐 | 原因 |
|------|------|------|
| 需要通过反爬检测 | OpenCLI | stealth 补丁全面 |
| 自动化测试 | OpenClaw | 干净环境，无需反检测 |
| 安全敏感操作 | OpenClaw | 沙箱隔离 |
| 复用用户 session | OpenCLI | 在用户浏览器中运行 |

### 可借鉴点

1. **OpenClaw → 借鉴 OpenCLI**: **stealth 补丁体系**——当 OpenClaw 需要 profile="user" 模式操作用户浏览器时，应集成 OpenCLI 的 stealth 补丁（特别是 toString 伪装）
2. **OpenClaw → 借鉴 OpenCLI**: **认证策略级联**——在 browser tool 中引入自动认证探测，无需用户手动指定 cookie/header/intercept
3. **OpenCLI → 借鉴 OpenClaw**: **沙箱隔离优先**——反检测是「打补丁」，隔离才是「根治」。OpenCLI 可以引入无头隔离模式作为默认，反检测作为 opt-in

---

## 6. CLI 设计理念

| 维度 | OpenCLI | OpenClaw |
|------|---------|----------|
| **核心命令** | `opencli <site> <command> [args]` | `openclaw <subcommand>` |
| **设计哲学** | 用户友好，命令即文档 | 运维友好，基础设施 |
| **交互模式** | 单次执行 + 流式输出 | 常驻守护进程 + 多通道 |
| **配置管理** | `~/.opencli/` | `~/.openclaw/` |
| **插件/扩展** | 适配器 + 插件系统 | Skills + 通道插件 |
| **日志/调试** | 开发者友好（verbose） | systemd journal + structured logging |
| **更新策略** | npm update | openclaw self-update |
| **适用人群** | 开发者/Power User | 构建 Agent 系统的开发者 |
| **学习曲线** | 低（安装即用） | 中（需要理解框架概念） |

### 各自优势

**OpenCLI:**
- **命令直觉性强**：`opencli juejin hot` 一看就懂
- 约定优于配置：79+ 适配器即装即用
- 流式输出 + 结果格式化，终端体验好
- 录制回放模式降低学习成本

**OpenClaw:**
- **守护进程模式**：一次启动，多通道响应
- 系统化设计：session/memory/cron/heartbeat/proactive 完整生命周期
- 适合长期运行和无人值守场景
- Subagent 编排 + 并行任务，能处理复杂工作流

### 可借鉴点

1. **OpenClaw → 借鉴 OpenCLI**: **命令直觉性**——OpenClaw 的 CLI 可以学习 OpenCLI 的「动词+名词」命令模式，让常用操作更直觉
2. **OpenCLI → 借鉴 OpenClaw**: **守护进程 + 多通道**——OpenCLI 如果未来想支持定时任务、多平台通知，需要引入类似 OpenClaw 的守护进程架构
3. **OpenClaw → 借鉴 OpenCLI**: **录制回放**——在 Agent 工作流中引入「录制用户操作 → 自动生成 Skill」的能力

---

## 7. 总体评价

### 一句话总结

> **OpenCLI 是精心打磨的「浏览器自动化瑞士军刀」，OpenClaw 是野心勃勃的「AI Agent 操作系统」。** 它们解决的是不同层面的问题，但各自的设计中都有值得对方学习的闪光点。

### 评分对比（5分制）

| 维度 | OpenCLI | OpenClaw |
|------|---------|----------|
| 浏览器自动化深度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 反检测能力 | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 适配器扩展性 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| AI 集成深度 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 安全隔离 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 易用性（新手） | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 生态丰富度 | ⭐⭐⭐⭐（79 适配器） | ⭐⭐⭐⭐（63 Skills + 多通道） |
| 长期运行能力 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 代码质量 | ⭐⭐⭐⭐（架构清晰） | ⭐⭐⭐⭐ |

### 核心差异

| | OpenCLI | OpenClaw |
|--|---------|----------|
| 做得最好的 | 浏览器控制 + 反检测 + 适配器生态 | AI Agent 生命周期 + 工具生态 + 记忆系统 |
| 最需要补强的 | AI 集成（无记忆、无调度、无多通道） | 浏览器反检测（stealth 补丁不够全面） |
| 设计哲学 | 「让命令行成为万能浏览器」 | 「让 AI Agent 拥有持久生命力」 |

---

## 8. 借鉴建议

### OpenClaw 可以从 OpenCLI 学到的（优先级排序）

| 优先级 | 借鉴项 | 具体行动 |
|--------|--------|----------|
| **P0** | stealth 补丁体系 | 集成 OpenCLI 的 13 项反检测补丁（特别是 toString 伪装）到 browser tool 的 profile="user" 模式 |
| **P1** | 认证策略级联 | browser tool 引入自动认证探测（PUBLIC→COOKIE→HEADER→INTERCEPT），减少手动配置 |
| **P1** | bind-current 模式 | 允许 Agent 以只读方式借用用户当前浏览器标签页，获取登录态但不干扰用户 |
| **P2** | 轻量 pipeline 模式 | 对高频重复的网页操作（热榜、搜索），支持简化的 YAML/JSON 流程定义 |
| **P2** | 自动 Skill 生成 | 录制用户操作 → 自动生成 SKILL.md |
| **P3** | _shared/ 共享模块 | Skills 之间引入代码级复用机制 |

### OpenCLI 可以从 OpenClaw 学到的（如果未来演进）

| 借鉴项 | 具体行动 |
|--------|----------|
| 沙箱隔离优先 | 引入无头隔离模式作为默认运行方式 |
| 记忆系统 | 用户偏好、使用习惯的持久化 |
| 多通道 | 不限于 CLI，支持飞书/Telegram 等消息通道 |
| 守护进程 | 支持后台常驻 + 定时任务 + heartbeat |
| Agent 编排 | 并行任务派发 + 结果聚合 |

---

## 附录：关键源文件参考

### OpenCLI
- 浏览器核心: `src/daemon.ts`, `src/browser/bridge.ts`, `src/browser/stealth.ts`
- 适配器系统: `src/cli-loader.ts`, `src/cli-registry.ts`
- 扩展: `extension/src/background.ts`, `extension/src/cdp.ts`

### OpenClaw
- Agent 配置: `~/.openclaw/workspace/AGENTS.md`
- 技能体系: `~/.openclaw/workspace/skills/*/SKILL.md`
- 浏览器 Skill: `~/.openclaw/workspace/skills/agent-browser/`
- 架构规范: `~/.openclaw/workspace/AGENTS.md`

### 相关研究笔记
- [Browser Bridge 架构分析](./opencli-browser-bridge.md)
- [适配器系统分析](./opencli-adapter-system.md)
- [掘金适配器实战](./opencli-adapter-juejin/README.md)
