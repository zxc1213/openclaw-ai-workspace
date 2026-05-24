# Claude Code x OpenClaw 中文教程 学习笔记

> **仓库**: [KimYx0207/Claude-Code-x-OpenClaw-Guide-Zh](https://github.com/KimYx0207/Claude-Code-x-OpenClaw-Guide-Zh)
> **学习日期**: 2026-04-06
> **教程版本**: Claude Code 2.1.92 / OpenClaw v2026.3.28
> **教程规模**: 25 篇完整教程 + 1 速查卡, ~130,000 字, 70+ 代码示例, 170+ FAQ

---

## 📋 教程结构总览

### Claude Code 篇（13 篇 + 速查卡）

| # | 教程 | 核心主题 | 与我们现有实践的对比 |
|---|------|---------|-------------------|
| 01 | 完整安装指南 | 原生安装 vs npm 安装, API 配置 | ✅ 已掌握原生安装路径 |
| 02 | 基础使用 | 三种模式, 30+ Slash 命令, 快捷键 | ⭐ 有价值：`/compact`策略、模型选择策略 |
| 03 | Commands 系统 | Slash 命令 = Markdown 提示词文件 | ✅ 已理解 .claude/commands 机制 |
| 04 | MCP 集成 | 10+ 核心服务器, 三作用域配置 | ⭐ 值得深入：工具懒加载、远程MCP |
| 05 | Hooks 系统 | 15种 Hook 类型, 4 类处理器 | ⭐⭐ 高价值：自动化工作流 |
| 06 | Subagent 子代理 | 官方 Subagents + Agent Teams | ✅ 已熟练使用 OpenClaw subagent |
| 07 | Skills 定制 | SKILL.md = YAML + Markdown | ⭐⭐ 高价值：渐进式披露、Hot Reloading |
| 08 | Plugins 生态 | /plugin、Marketplace、manifest | 🆕 新知识：Plugin vs Skill 区分 |
| 09 | Agent-SDK | query()、Agent Loop、Task 编排 | 🆕 新知识：编程开发 Agent |
| 10 | 综合实战 | 团队协作、CLAUDE.md 规范、CI/CD | ⭐ 值得参考：CLAUDE.md 层级结构 |
| 11 | 企业实战 | 安全合规、API Key 管理、审计 | ⭐⭐ 高价值：密钥分级管理 |
| 13 | Remote Control | 跨设备继续本地会话 | 🆕 新知识：`/remote-control` 命令 |
| 14 | Channels 与计划任务 | --channels、/loop、/schedule | 🆕 新知识：Channels vs Remote Control |

### OpenClaw 篇（12 篇）

| # | 教程 | 核心主题 | 与我们现有实践的对比 |
|---|------|---------|-------------------|
| 00 | 阅读指南 | 术语表、4条阅读路线 | ℹ️ 参考用 |
| 01 | 项目介绍 | 架构(Gateway/Channel/Skills/Memory) | ✅ 已充分了解 |
| 02 | 安装部署 | 全平台安装、多环境管理 | ✅ 已掌握 |
| 03 | 快速开始 | 5分钟上手、Control UI、CLI 速查 | ✅ 已熟练使用 |
| 04 | 模型配置 | 29个提供商、故障转移、成本控制 | ⭐ 值得参考：模型路由、按场景选模型 |
| 05 | 消息平台接入 | 15+ 平台、飞书 Extension 接入 | ✅ 已掌握飞书接入 |
| 06 | 技能系统 | 50+ 内置技能、自定义开发 | ⭐⭐ 高价值：技能白名单配置 |
| 07 | 记忆系统 | 三层记忆、Compaction、RAG | ⭐⭐ 高价值：MEMORY.md 500行限制 |
| 08 | 多 Agent 协作 | 消息路由、SOUL.md、按职能分工 | ⭐⭐ 高价值：Agent 级技能白名单 |
| 09 | Docker 部署 | 容器化、docker-compose、云平台 | ℹ️ 参考用 |
| 10 | 安全配置 | 沙箱、DM Pairing、TLS 1.3、零信任 | ⭐⭐ 高价值：密钥轮换、安全清单 |
| 11 | 常见问题 FAQ | 79 个 FAQ（安装/平台/模型/技能/记忆） | ⭐ 排错参考 |

---

## 🔑 核心要点总结

### 一、Claude Code 核心要点

#### 1. 安装与启动（01）
- **原生安装已取代 npm 为推荐方式**，但 npm 路径仍受支持
- 原生安装通过 `claude install` 脚本执行，支持自动更新
- 迁移时保留 `~/.claude/` 下所有配置、命令、技能、信任目录
- **启动方式**：交互模式(`claude`)、单次模式(`claude -p "..."`)、管道模式(`cat file | claude -p`)
- 新增 `/powerup` 交互式功能教程（v2.1.90+）

#### 2. 基础使用与高效操作（02）
- **三种模式**：交互（主用）、单次（CI/CD）、打印（脚本）
- **Checkpoint/Rewind**：像游戏存档一样，可以回到任意对话节点
- **Extended Thinking**：Tab 键触发深度思考，复杂问题必备
- **/compact 策略**：Token 超 60% 时主动压缩，节省 40-60%
- **模型选择**：Haiku(简单/最便宜) → Sonnet(日常/性价比最高) → Opus(关键决策/最强)
- **快捷键**：Shift+Tab 切换权限模式, Option/Alt+P 切换模型, Esc+Esc Rewind 菜单
- **/btw**：提一个不污染主线程的 side question
- **/diff**：查看当前变更和逐轮 diff

**值得采纳的实践**：
```
# 每日流程
1. claude -c          # 恢复昨天会话
2. /status            # 检查状态
3. 工作...
4. /context           # 检查 Token 使用
5. /compact           # 超 60% 时压缩
6. /rename xxx        # 下班前重命名
```

#### 3. Commands 系统（03）
- **核心概念**：Slash 命令 = Markdown 提示词文件（.claude/commands/ 目录下）
- **自定义命令已并入 Skills 体系**，.claude/commands 主要作为兼容层
- 前置检查：Markdown 代码块 > 100 字符时命令不生效
- frontmatter 支持 `allowed-tools`、`description`、`arg-pattern` 等字段
- 支持 `$ARGUMENTS` 参数、工具调用语法（`<tool_name>...</tool_name>`）
- 优先级：项目级 > 用户级 > 内置（核心系统命令不可覆盖）

#### 4. MCP 集成（04）
- **MCP = AI 工具的 USB 接口标准**，即插即用
- **三作用域配置**：项目级 > 用户级 > 全局级，优先级合并
- **关键新特性**：
  - MCP Apps 交互式界面（GUI 管理 MCP 服务器）
  - 工具懒加载 ToolSearch（上下文减少 95%）
  - 远程 MCP 服务器（Streamable HTTP 传输）
  - MCP Elicitation（交互式信息请求，v2.1.69+）
- **常用服务器**：Filesystem、GitHub、SQLite、Brave Search、Context7
- ⚠️ `claude mcp test` 和 `claude mcp restart` 命令**不存在**
- 配置位置：`~/.claude.json`（全局）、`.claude/settings.json`（项目）

**值得采纳的实践**：
```json
// 项目级 MCP 配置示例
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./src"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }
    }
  }
}
```

#### 5. Hooks 系统（05）⭐⭐ 高价值
- **核心概念**：在特定事件发生时自动执行脚本，实现 100% 可靠自动化
- **15种 Hook 类型**（按事件族分类）：
  - **PreToolUse**：工具调用前 → 安检门，可拦截/修改/放行
  - **PostToolUse**：工具调用后 → 自动格式化、备份、通知
  - **UserPromptSubmit**：用户输入提交前 → 自动增强提示词
  - **Notification**：通知事件 → 桌面推送
  - **SessionStart/End**：会话开始/结束 → 环境检查、清理
  - **Stop**：AI 停止响应时
  - **WorktreeCreate/Remove**：Git Worktree 创建/删除时 🆕
- **处理器类型**：命令行脚本（Bash/Python）、Node.js 模块、内置操作
- 配置位置：`.claude/settings.json` 的 `hooks` 字段

**值得采纳的实践**：
```json
// PreToolUse 文件保护 Hook 示例
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "python3 ~/.claude/hooks/protect-files.py"
      }]
    }]
  }
}
```
- 安全警告：Hook 有完整文件系统访问权限，必须审查第三方 Hook
- --worktree（-w）支持 Git Worktree 并行任务隔离（v2.1.49+）

#### 6. Subagent 子代理（06）
- **官方三个入口**：Task tool（`/agent`）、Plan mode、Agent Teams（实验性）
- Claude Code 的 Subagent 与 OpenClaw 的 `sessions_spawn` 类似但定位不同
- 社区提供了 VoltAgent/awesome-claude-code-subagents，包含 40+ 专业角色
- ⚠️ 注意 Token 消耗：每个 Subagent 都是独立计费
- 官方最小示例：直接使用 Task 工具委托子任务

#### 7. Skills 定制（07）⭐⭐ 高价值
- **Skills vs Commands 区分**：
  - Commands = 一次性快捷方式（Markdown 提示词文件）
  - Skills = 可复用功能包（SKILL.md + 脚本 + 配置 + 文档）
- **渐进式披露原理（Progressive Disclosure）**：
  - 描述层（触发条件）→ 概念层（核心知识）→ 执行层（操作指南）→ 参考层（完整文档）
- **SKILL.md 结构**：YAML Frontmatter + Markdown Body
  - frontmatter：description（触发条件）、allowed-tools、triggers
  - body：角色定义、何时激活、注释原则、输出格式
- **Hot Reloading**：修改 SKILL.md 后自动生效，无需重启
- Sandbox 配置：可为不同安全级别设置不同的工具限制

**值得采纳的实践**：
```markdown
# SKILL.md 模板
---
description: 代码审查专家，确保代码质量和安全性
allowed-tools:
  - Read
  - Grep
  - Glob
---

# 代码审查助手

## 角色定义
你是一个严格的代码审查专家...

## 何时激活
当代码中包含 TODO、FIXME、HACK 注释时...

## 输出格式
按严重程度排序，每个问题包含：
- 位置、问题类型、描述、建议修复
```

#### 8. Plugins 生态（08）
- **Plugin vs Skill/MCP 区分**：
  - Plugin = 打包分发单元（包含 Skills + Commands + Hooks + MCP）
  - Skill = 单个功能模块
  - MCP = 外部工具接口
- 安装方式：`/plugin install <name>`、Marketplace、`--plugin-dir` 本地开发
- Plugin 结构：`.claude-plugin/manifest.json` + Skills + Commands
- 支持持久化数据目录、LSP 集成

#### 9. Agent-SDK（09）
- **定位**：把 Claude Code 能力封装为可编程接口
- **支持语言**：Python、TypeScript
- **核心 API**：`query()` 函数，返回流式消息
- **Agent Loop**：接收 → 思考 → 使用工具 → 检查 → 继续/结束
- **Task 工具**：内置子代理编排，支持 DAG 依赖
- 适用场景：CI/CD 集成、自动化流水线、批量处理

#### 10. 综合实战与企业实战（10-11）
- **CLAUDE.md 层级结构**：全局 ~/.claude/CLAUDE.md > 项目根目录 > 子目录
- **团队规范要点**：
  - 标准化项目结构（src/modules/模块名/）
  - 统一命名规范、Git 分支命名、提交信息格式
  - AI 辅助代码审查 Slash 命令
- **企业安全**：
  - API Key 分级管理（开发/测试/生产）
  - 密钥轮换自动化（建议 90 天）
  - Git Secrets 扫描、日志脱敏
  - GDPR/HIPAA/SOC 2 合规审计日志
  - `forceRemoteSettingsRefresh`（v2.1.92）托管策略

#### 11. Remote Control（13）
- **三种启动方式**：
  1. 独立服务器模式：`claude remote-control`
  2. 本地交互 + Remote：`claude --remote-control`
  3. 已运行会话临时开启：`/remote-control`
- ⚠️ 需要 claude.ai 登录，API key 登录不支持
- 并发模式：`same-dir`（同一目录）vs `worktree`（隔离工作树）
- 代码不上传云端，远端只是连接窗口

#### 12. Channels 与计划任务（14）
- **Channels vs Remote Control**：Channels = 外部系统推消息进来，RC = 你远程接管
- 入门方式：`/plugin install fakechat@claude-plugins-official`
- **`/loop`**：定时循环执行命令（支持 `5m`、`1h`、`30s`）
- **`/schedule`**：创建本地计划任务（session-scoped，不跨重启，7天自动过期）
- 可靠调度需要 Cloud/Desktop scheduled tasks

---

### 二、OpenClaw 核心要点

#### 1. 架构核心概念（01）
- **Gateway**：消息网关，连接各消息平台
- **Channel**：消息平台抽象层
- **Skills**：技能系统（50+ 内置技能）
- **Memory**：三层记忆（会话/短期/长期）
- **Tools**：工具系统（exec、web_search、browser 等）
- **Plugin**：插件系统
- 数据流：用户 → 消息平台 → Gateway → Agent → 模型 API → 回复

#### 2. 模型配置（04）
- **29 个 AI 模型提供商**，推荐配置：OpenAI + Claude + Ollama
- **模型路由与聚合**：OpenRouter（一个 Key 用所有模型）
- **故障转移**：主模型失败自动切换备用
- **按场景选模型**：简单问答用便宜模型，复杂任务用强模型
- **Token 限制与成本控制**：预算控制、maxTokens 限制、省钱技巧

**值得采纳的实践**：
```json5
// 模型故障转移配置
{
  "models": {
    "fallbacks": ["gpt-4o-mini", "claude-sonnet-4-20250514"]
  }
}
```

#### 3. 技能系统（06）⭐⭐ 高价值
- **Skills vs Tools 本质区别**：
  - Tool = 原子操作（exec、web_search）
  - Skill = 复合能力（封装 Tool 调用 + 领域知识 + 提示词）
- **技能白名单**：按 Agent 配置需要的技能，减少 token 浪费和安全风险
- **触发条件**：description 字段用于语义匹配自动激活
- **自定义开发**：`skill-creator` 技能或手动创建
- 技能太多不会影响性能（只加载相关技能），但 triggers 太宽泛会误触发

#### 4. 记忆系统（07）⭐⭐ 高价值
- **三层记忆架构**：
  1. 会话记忆（Session Memory）：当前对话上下文
  2. 短期记忆（Daily Logs）：`memory/YYYY-MM-DD.md`
  3. 长期记忆（MEMORY.md）：每次启动加载
- **Compaction 与记忆刷新**：对话过长时自动压缩，压缩前可自动保存关键信息
- **MEMORY.md 最佳实践**：
  - ⚠️ 控制在 **500 行**（约 3000 tokens）以内
  - 每周花 5 分钟整理，删除过时信息
  - 用清晰标题分类（技术栈/项目决策/团队信息/工作流程）
  - 不存敏感信息（密码、API Key）
  - 30 天以上日志手动归档到 `memory/archive/`
- **向量存储**：sqlite-vec 支持混合搜索（关键词 + 语义）
- **RAG 集成**：知识库与记忆分离，记忆是 AI 的"经验"，知识库是"参考资料"

**值得采纳的实践**：
```markdown
# MEMORY.md 分类结构
## 技术栈
## 项目决策
## 团队信息
## 工作流程
## 用户偏好
```

#### 5. 多 Agent 协作（08）⭐⭐ 高价值
- **核心架构**：一个 Gateway 跑多个独立 AI 助手
- **消息路由**：按绑定类型（channel/DM/mention）分配给不同 Agent
- **SOUL.md 人格设定**：定义 Agent 的性格、专长、规则、沟通风格
- **按 Agent 配置技能白名单**：
  - coding Agent: `["coding-agent", "github", "tmux"]`
  - social Agent: `["weather", "summarize"]`
  - 避免 social Agent 有 Shell 执行能力
- **四种协作策略**：按职能/按平台/按安全等级/流水线
- Agent 间通信：Sessions 工具（直接）或共享文件（间接）
- Agent 会话完全独立，互不干扰

**值得采纳的实践**：
```json5
// Agent 级技能白名单
{
  "id": "coding",
  "skills": ["coding-agent", "github", "gh-issues", "tmux"]
}
```

#### 6. 安全配置（10）⭐⭐ 高价值
- **零信任原则**：Never trust, always verify
- **API Key 安全**：
  - 永远不硬编码，用环境变量或密钥管理服务
  - 90 天轮换一次
  - 分级管理（开发/测试/生产）
  - 密钥泄露检测 + 应急处理
- **DM Pairing**：新用户首次私聊需手动批准
- **沙箱系统**：
  - 工具 Allow/Deny 白名单
  - 按 Agent 配置不同沙箱策略
  - Docker 沙箱逃逸防护
- **网络安全**：TLS 1.3（v2026.2.1 强制）、防火墙、IP 白名单、速率限制
- **审计日志**：记录所有操作，定期检查异常

---

## 🎯 值得立即采纳的最佳实践

### 高优先级（建议近期实施）

1. **MEMORY.md 精简**：控制在 500 行以内，每周整理一次
   - [ ] 审查当前 MEMORY.md 行数，清理过时内容
   - [ ] 建立日志归档机制（30天 → archive/）

2. **Agent 技能白名单**：为不同场景配置精确技能
   - [ ] 审查 `openclaw.json` 中 skills 配置
   - [ ] 为 coding agent 添加白名单

3. **Claude Code Hooks 探索**：用 Hook 实现文件保护/自动格式化
   - [ ] 试试 PreToolUse 文件保护 Hook
   - [ ] 试试 PostToolUse 自动格式化 Hook

4. ** Claude Code 模型选择策略**：
   - [ ] 建立快捷别名：Haiku/Sonnet/Opus 快速切换
   - [ ] 日常用 Sonnet，关键决策用 Opus

### 中优先级（后续优化）

5. **SKILL.md 渐进式披露优化**：重构现有 Skills 结构
6. **Claude Code MCP 工具懒加载**：减少上下文占用
7. **Claude Code Remote Control**：跨设备继续本地会话
8. **密钥轮换机制**：建立 90 天自动提醒

---

## 🆕 新知识点（之前未接触的）

1. **Claude Code Plugins 生态**：`/plugin install`、Marketplace、manifest 结构
2. **Claude Code Agent-SDK**：Python/TypeScript 编程开发 Agent
3. **Claude Code Remote Control**：`/remote-control` 跨设备会话
4. **Claude Code Channels**：外部系统消息推送（vs Remote Control 的区别）
5. **Claude Code `/loop` 和 `/schedule`**：本地定时任务
6. **MCP Apps 交互式界面**：GUI 管理 MCP 服务器
7. **MCP Elicitation**：交互式信息请求（v2.1.69+）
8. **Git Worktree 并行任务隔离**：`--worktree`（-w）参数
9. **OpenClaw RAG 知识库集成**：向量搜索 + 知识库
10. **OpenClaw 沙箱逃逸防护**：安全隔离机制

---

## 📊 与现有实践的对比分析

### 已做得好的
- ✅ OpenClaw 配置管理规范（AGENTS.md 结构清晰）
- ✅ 记忆系统使用（daily notes + MEMORY.md + OpenViking）
- ✅ Subagent 任务派发（四要素模板）
- ✅ 飞书平台深度集成
- ✅ 上下文管理策略（Compaction 配置已优化）
- ✅ 安全意识（Red Lines、高危操作前确认）

### 可以改进的
- ⚠️ MEMORY.md 可能超过 500 行建议限制，需要定期精简
- ⚠️ 技能白名单未按 Agent 精细配置
- ⚠️ 未充分利用 Claude Code Hooks 系统
- ⚠️ 未探索 Claude Code Agent-SDK 编程能力
- ⚠️ 日志归档机制不够自动化（30天归档）

---

## 🔗 参考资源

- **Claude Code 官方文档**: https://docs.anthropic.com/en/docs/claude-code
- **OpenClaw 官方文档**: https://docs.openclaw.ai
- **Anthropic 最佳实践**: https://www.anthropic.com/engineering/claude-code-best-practices
- **Claude Command Suite**: https://github.com/qdhenry/Claude-Command-Suite
- **VoltAgent Subagents**: https://github.com/VoltAgent/awesome-claude-code-subagents
- **OpenClaw Discord**: discord.gg/clawd
- **DeepWiki 代码文档**: https://deepwiki.com/openclaw/openclaw

---

# 🔬 深度学习：CC-05 Hooks + CC-04 MCP + CC-07 Skills

> **学习日期**: 2026-04-06
> **教程来源**: [Claude-Code-x-OpenClaw-Guide-Zh](https://github.com/KimYx0207/Claude-Code-x-OpenClaw-Guide-Zh)
> **对应教程**: 05-Hooks系统完整指南、04-MCP集成完整指南、07-Skills定制完整指南

---

## 一、CC-05 Hooks 系统完整指南 深度笔记

### 1. 核心概念

**Hooks = 自动化传感器**，在特定事件发生时**确定性地**执行脚本，不依赖 AI 记忆。

核心价值对比：

| 维度 | 提示词方式 | Hooks 方式 |
|------|-----------|-----------|
| 可靠性 | 不确定（AI 可能忘记） | 100% 执行 |
| 一致性 | 每次可能不同 | 每次完全相同 |
| 自动化 | 需 AI 主动执行 | 事件触发自动执行 |
| 团队协作 | 每人都要提醒 AI | 配置一次全员生效 |

### 2. 15 种 Hook 类型完整列表

> ⚠️ 教程强调：不要死记固定数字，官方仍在扩展。按「事件族 + 处理器类型 + 典型场景」理解。

#### 高频三剑客

| Hook 类型 | 触发时机 | 能否阻止 | 典型用途 |
|-----------|---------|---------|--------|
| **UserPromptSubmit** | 用户输入提交后 | ✅ 是 | 提示词增强、敏感词过滤 |
| **PreToolUse** | 工具调用前 | ✅ 是 | 权限校验、参数验证 |
| **PostToolUse** | 工具调用成功后 | ❌ 否 | 格式化、备份、测试 |

#### 工具失败族

| Hook 类型 | 触发时机 | 典型用途 |
|-----------|---------|--------|
| **PostToolUseFailure** | 工具调用失败后 | 失败告警、自动重试 |
| **PermissionDenied** | 权限被拒绝时 | 审计、自动补救提示 |

#### 会话/代理族

| Hook 类型 | 触发时机 | 典型用途 |
|-----------|---------|--------|
| **SessionStart** | 会话开始 | 环境检查、依赖验证 |
| **SessionEnd** | 会话结束 | 清理临时文件、保存状态 |
| **Stop** | AI 正常停止 | 状态保存 |
| **StopFailure** | AI 异常停止（API 错误） | 告警通知、错误记录 |
| **TaskCreated / TaskCompleted** | 子任务创建/完成 | 子代理日志、任务收集 |

#### 文件系统族

| Hook 类型 | 触发时机 | 典型用途 |
|-----------|---------|--------|
| **PreCompact / PostCompact** | 上下文压缩前/后 | 保存关键上下文、记录 token 变化 |
| **CwdChanged** | 工作目录切换 | 同步环境 |
| **FileChanged** | 文件变化时 | 触发检查 |

#### MCP 交互族

| Hook 类型 | 触发时机 | 典型用途 |
|-----------|---------|--------|
| **Elicitation** | MCP 请求额外输入时 | 记录交互日志 |
| **ElicitationResult** | 用户完成 MCP 输入后 | 验证输入、触发后续流程 |

#### 工作树族（v2.1.49+）

| Hook 类型 | 触发时机 | 典型用途 |
|-----------|---------|--------|
| **WorktreeCreate** | 工作树创建时 | 安装依赖、初始化配置 |
| **WorktreeRemove** | 工作树删除时 | 清理临时文件 |

#### 其他

| Hook 类型 | 触发时机 | 典型用途 |
|-----------|---------|--------|
| **Notification** | 通知发送时 | 桌面通知推送 |
| **SubagentStart / SubagentStop** | 子代理启动/停止 | 并发监控、日志收集 |
| **PermissionRequest** | 权限请求时 | 自动审批策略 |
| **ConfigChange** | 配置变更时 | 配置审计、同步通知 |
| **InstructionsLoaded** | 指令文件加载时 | 验证指令完整性 |

### 3. 四类处理器类型

| 处理器类型 | 说明 | 配置方式 |
|-----------|------|---------|
| **command** | 运行本地 Shell 脚本 | `"type": "command", "command": "python script.py"` |
| **http** | POST JSON 到远程 URL（v2.1+） | `"type": "http", "url": "https://..."` |
| **prompt** | 使用小快速模型处理 | `"type": "prompt"` |
| **agent** | 代理处理 | `"type": "agent"` |

### 4. PreToolUse 用法示例

**配置格式**（`.claude/settings.json`）：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "python .claude/hooks/pre-protect.py",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

**新版决策 API**（v2.1.49+ 推荐）：

```json
{
  "hookSpecificOutput": {
    "permissionDecision": "deny"  // allow | deny | ask
  },
  "message": "禁止修改受保护路径"
}
```

**PostToolUse 完整配置示例**（自动格式化 + 自动备份）：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          { "type": "command", "command": "python .claude/hooks/post-auto-format.py", "timeout": 30 }
        ]
      },
      {
        "matcher": "Edit",
        "hooks": [
          { "type": "command", "command": "python .claude/hooks/post-auto-backup.py", "timeout": 10 }
        ]
      }
    ]
  }
}
```

### 5. 与 OpenClaw 现有实践的对比

| 对比维度 | Claude Code Hooks | OpenClaw 现状 |
|---------|-----------------|-------------|
| 事件驱动 | ✅ 15+ 种 Hook 事件 | ❌ 无原生 Hook 机制 |
| 工具调用拦截 | ✅ PreToolUse/PostToolUse | ⚠️ 通过 AGENTS.md/Red Lines 约束 |
| 代码格式化 | ✅ PostToolUse 自动触发 | ❌ 无自动格式化 Hook |
| 文件保护 | ✅ PreToolUse deny 决策 | ⚠️ 通过提示词约束（不可靠） |
| 远程通知 | ✅ HTTP Hook / Notification | ✅ OpenClaw 有 message 工具 |
| 上下文压缩 | ✅ PreCompact/PostCompact | ✅ OpenClaw 有 compaction 配置 |
| 会话生命周期 | ✅ SessionStart/End | ⚠️ HEARTBEAT.md 部分覆盖 |

### 6. 落地建议

1. **在 Claude Code 项目中配置核心 Hooks**：
   - `PreToolUse` + `Bash` matcher → 拦截 `rm -rf` 等危险命令
   - `PostToolUse` + `Write` matcher → 自动运行 prettier/black
   - `SessionStart` → 检查 Python/Node 依赖

2. **HTTP Hook 用于远程通知**：
   - 将 StopFailure Hook 发送到飞书群 webhook，实现异常告警
   - 比 OpenClaw 心跳更即时，因为 Hooks 是确定性的

3. **PreCompact Hook 保存关键上下文**：
   - 在压缩前将重要对话写入 memory/ 文件
   - 配合 OpenClaw 的 `memoryFlush` 使用，形成双保险

---

## 二、CC-04 MCP 集成完整指南 深度笔记

### 1. 核心概念

**MCP = AI 工具的 USB 接口标准**（Model Context Protocol），让任何 AI 应用即插即用地连接外部服务。

- 2024.11 Anthropic 发布 v1.0
- 2025.12 捐赠给 Linux 基金会 AAIF，成为行业标准
- 当前规范版本：2025-11-25

### 2. 工具懒加载（ToolSearch）

> 这是当前版本的**默认行为**，不是可选功能。

**问题**：配置大量 MCP 服务器时，旧版一次性加载所有工具定义到上下文，浪费大量 token。

**方案**：ToolSearch 懒加载机制（v2.1.52+），只在需要时才加载对应工具定义。

```
用户: "帮我查一下 Slack 里的消息"
Claude Code:
1. [ToolSearch] 搜索 "slack" → 找到 mcp__slack__read_channel
2. [加载] 按需加载 slack 工具定义
3. [调用] mcp__slack__read_channel(...)
```

**效果**：上下文占用减少高达 95%。

### 3. 远程 MCP 服务器

```bash
# 添加远程 MCP 服务器（HTTP 传输）
claude mcp add --transport http my-remote-server https://your-server.com/mcp
```

适用于团队共享 MCP 服务（共享数据库、内部 API 网关等）。

### 4. MCP Apps（交互式界面）

MCP 服务器不再只返回文本，还可以返回可交互的 UI 组件——图表、表单、仪表盘等。在对话中直接操作第三方工具界面。

### 5. MCP Elicitation（交互式信息请求，v2.1.69+）

MCP 工具在执行中需要额外信息时，可主动向用户发起交互请求，而不是直接报错或猜测参数。

工作流：
1. Claude Code 调用 MCP 工具
2. MCP 服务器发现需要额外信息 → 发起 elicitation 请求
3. Claude Code 向用户显示交互对话框（表单/选择框）
4. 用户填写后结果返回 MCP 服务器
5. 继续执行

### 6. 三作用域配置体系

| 作用域 | 存储位置 | 优先级 | 适用场景 |
|--------|---------|--------|--------|
| **Local** | `~/.claude.json` 项目条目 | 最高 | 个人私有、含 API Key |
| **Project** | `.mcp.json` | 中等 | 团队共享、版本控制 |
| **User** | `~/.claude.json` 全局部分 | 最低 | 个人常用工具 |

优先级：`Local > Project > User`

### 7. 与 OpenClaw 现有实践的对比

| 对比维度 | Claude Code MCP | OpenClaw 现状 |
|---------|-----------------|-------------|
| MCP 支持 | ✅ 原生支持 | ❌ 无 MCP 协议支持 |
| 工具来源 | MCP 服务器 + 内置工具 | 内置工具 + 自定义 Skills |
| 远程工具 | ✅ HTTP 传输 | ✅ 内置 web_fetch/web_search |
| 作用域 | 三级（Local/Project/User） | ⚠️ 单一（workspace 全局） |
| 工具懒加载 | ✅ ToolSearch（上下文减少 95%） | ✅ 工具描述在 system prompt 中 |
| 开发者生态 | ✅ MCP SDK + npm 生态 | ✅ Skills + Extensions |

### 8. 落地建议

1. **在 Claude Code 中配置核心 MCP 服务器**：
   ```json
   {
     "mcpServers": {
       "context7": {
         "command": "npx",
         "args": ["-y", "@upstash/context7-mcp"],
         "env": {}
       },
       "brave-search": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-brave-search"],
         "env": { "BRAVE_API_KEY": "${BRAVE_API_KEY}" }
       }
     }
   }
   ```
   - Context7：获取 1000+ 框架最新文档，解决 AI 训练数据过时问题
   - API Key 使用 `${VAR}` 环境变量引用，不硬编码

2. **探索远程 MCP 服务器用于团队协作**：
   - 内部工具平台通过 HTTP 暴露 MCP 接口
   - 团队共享数据库查询、API 网关等

3. **理解 MCP 的局限性对 OpenClaw 的意义**：
   - OpenClaw 的内置工具（web_fetch、web_search、feishu_*等）已经覆盖了大部分 MCP 服务器的功能
   - OpenClaw 的优势在于消息平台集成（飞书、Telegram 等），这是 Claude Code MCP 不擅长的
   - 两者互补：Claude Code 管编程工作流，OpenClaw 管日常工作流

---

## 三、CC-07 Skills 定制完整指南 深度笔记

### 1. 核心概念

**Skills = Claude Code 的「能力 APP」**，封装领域知识、规则、工具为可复用模块。

与 Commands 的关系：
- **Commands**（`.claude/commands/*.md`）：触发器/入口点（「按钮」），用户显式 `/command` 调用
- **Skills**（`.claude/skills/*/SKILL.md`）：能力包/知识库（「APP」），可自动激活或显式调用

> 自定义 slash 工作流已并入 Skills 体系，`.claude/commands` 主要作为兼容层。

### 2. 渐进式披露原理（Progressive Disclosure）

**三层披露结构**：

```
第一层：元数据常驻（< 100 字节）
├─ YAML Frontmatter 的 name + description

第二层：指令按需加载（数千行）
├─ Markdown Body 在 Skill 激活时才加载

第三层：资源按需调用
├─ scripts/ 只在调用时执行
├─ templates/ 只在渲染时读取
└─ config/ 只在需要时加载
```

**生活类比**：微信——先看图标，点开看功能，用时加载详情。

**四层用户交互**：
1. 自动激活（用户无感）
2. 显式调用（`/skill-name`）
3. 深度定制（修改 SKILL.md 配置）
4. 完全控制（修改 scripts/ 代码）

### 3. Hot Reloading

**修改 SKILL.md 后无需重启 Claude Code**，下次对话时修改自动生效。

```
旧方式: 修改 skill.yaml → 退出 → 重启 claude → 测试
Hot Reloading: 修改 SKILL.md → 直接测试，立即生效 ✨
```

注意事项：
- YAML Frontmatter 修改立即生效
- Markdown Body 修改在下次对话时生效
- 如未生效，尝试 `/compact` 或开始新对话

### 4. SKILL.md 完整字段表

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 推荐 | Skill 名称（kebab-case，最多 64 字符） |
| `description` | string | 推荐 | 触发场景描述（最多 1024 字符） |
| `context` | string | 可选 | 设为 `fork` 时在独立子代理中运行 |
| `model` | string | 可选 | 指定模型（opus/sonnet/haiku） |
| `agent` | string | 可选 | 指定代理类型（如 Explore） |
| `allowed-tools` | string | 可选 | 限制工具列表（逗号分隔） |
| `user-invocable` | boolean | 可选 | 是否允许 `/` 命令手动调用（默认 true） |
| `disable-model-invocation` | boolean | 可选 | 禁止自动激活（默认 false） |
| `argument-hint` | string | 可选 | 参数提示 |

### 5. 目录结构

```
.claude/skills/[skill-name]/
├── SKILL.md          # [必需] 核心定义（YAML + Markdown）
├── scripts/          # [可选] 可执行脚本
├── templates/        # [可选] 输出模板
├── config/           # [可选] 运行时配置
├── docs/             # [可选] 内部文档
└── data/             # [可选] 数据文件
```

> ⚠️ **重大变化**：不再使用 `skill.yaml` 和 `prompts/` 文件夹，所有内容统一到 SKILL.md。

支持 `${CLAUDE_SKILL_DIR}` 内置变量，引用同目录下的文件。

### 6. 与 OpenClaw Skills 的详细对比

| 对比维度 | Claude Code Skills | OpenClaw Skills |
|---------|------------------|----------------|
| **文件格式** | YAML Frontmatter + Markdown Body | Markdown (SKILL.md) |
| **目录结构** | `.claude/skills/[name]/SKILL.md` | `~/.openclaw/workspace/skills/[name]/SKILL.md` 等 |
| **自动激活** | ✅ 基于 description 关键词匹配 | ✅ 基于 `<description>` 标签匹配 |
| **渐进式披露** | ✅ 三层（元数据→指令→资源） | ✅ 两层（描述→完整内容） |
| **Hot Reloading** | ✅ 修改后下次对话自动生效 | ✅ `openclaw skills check` 检测更新 |
| **脚本集成** | ✅ `scripts/*.py` 通过 Bash 调用 | ✅ 通过 `exec` 工具调用 |
| **Forked Context** | ✅ `context: fork` | ✅ `sessions_spawn` isolated run |
| **模型选择** | ✅ `model: opus/sonnet/haiku` | ✅ 通过 agent 配置指定 |
| **工具白名单** | ✅ `allowed-tools: Read, Grep` | ✅ agent 级 skills 配置 |
| **多 Agent 路由** | ❌ 单 Agent | ✅ 多 Agent + 消息路由 |
| **消息平台** | ❌ 终端 CLI | ✅ 飞书/Telegram/Discord 等 |
| **持久化记忆** | ❌ 需 MCP Memory 服务器 | ✅ OpenViking + MEMORY.md |
| **定时任务** | ❌ 需 `/schedule` 或 `/loop` | ✅ cron + qqbot_remind |

**核心异同**：
- **相同点**：都是 SKILL.md 格式、都支持渐进式披露、都支持 Hot Reloading
- **差异点**：OpenClaw Skills 更侧重消息平台集成和日常自动化；Claude Code Skills 更侧重编程工作流
- **互补性**：两者概念一致，可以相互借鉴设计模式

### 7. 企业级 Skill 架构参考（公众号写作助手 V9.0）

```
.claude/skills/gongzhonghao-writer/
├── SKILL.md              # 核心定义（V9.0 适配）
├── scripts/
│   ├── core/             # 核心脚本
│   │   ├── quality_detector.py   # 9 维度质量检测
│   │   ├── title_generator.py    # 5 大爆款公式
│   │   ├── title_scorer.py       # 标题评分
│   │   ├── topic_filter.py       # 三层选题过滤
│   │   └── pre_publish_checker.py # 发布前检查
│   ├── collectors/        # 数据收集
│   └── utils/             # 工具函数
├── config/               # 数据驱动配置
│   ├── formulas_config.json      # 爆款公式参数
│   ├── brands_config.json        # 品牌词库
│   └── quality_config.json       # 质检标准
└── instructions/         # 详细指令
    └── workflow.md
```

设计亮点：
1. **单文件入口**：SKILL.md 替代 skill.yaml + prompts/
2. **数据驱动**：所有可变参数放 config/，脚本从配置读取
3. **脚本分类**：core/collectors/utils 三层结构
4. **渐进式披露**：元数据常驻 → 指令按需 → 脚本按需

### 8. 落地建议

1. **将 Claude Code Skills 设计模式应用到 OpenClaw Skills**：
   - 为现有 OpenClaw Skills 添加 YAML Frontmatter（如果尚未有）
   - 借鉴 `data-driven` 模式：将可变参数抽取到 config/ 目录
   - 参考公众号写作助手的 `scripts/core/` 分类结构

2. **创建 Claude Code 编程 Skills（如已安装 Claude Code）**：
   - `code-reviewer` Skill：代码审查规范 + 自动评分脚本
   - `api-doc-generator` Skill：API 文档生成 + OpenAPI 验证
   - `git-workflow` Skill：分支策略 + 提交规范 + PR 模板

3. **利用 `${CLAUDE_SKILL_DIR}` 变量构建多文件 Skill**：
   - SKILL.md 只放核心指令
   - 详细模板和示例放 `templates/` 和 `docs/`
   - 通过 `${CLAUDE_SKILL_DIR}/templates/review.md` 引用

---

## 📋 深度学习总结

### 三篇教程核心收获

| 教程 | 核心收获 | 直接可操作性 |
|------|---------|------------|
| **Hooks** | 15+ 事件类型、4 类处理器、确定性自动化 | ⭐⭐⭐ 高（Claude Code 项目直接用） |
| **MCP** | 工具懒加载、远程 MCP、Elicitation、MCP Apps | ⭐⭐ 中（需安装 Claude Code） |
| **Skills** | 渐进式披露、Hot Reloading、SKILL.md 单文件 | ⭐⭐⭐ 高（可借鉴到 OpenClaw Skills） |

### 与 OpenClaw 的互补关系

```
Claude Code 擅长：                    OpenClaw 擅长：
├─ 编程工作流                      ├─ 消息平台集成
├─ MCP 工具生态                     ├─ 多 Agent 路由
├─ Hooks 自动化                     ├─ 持久化记忆
├─ Git Worktree 并行               ├─ 定时任务（cron）
└─ Skills 能力封装                 ├─ 飞书/Telegram 集成
                                   └─ 上下文管理（compaction）
```

### 下一步行动

1. **[Hooks]** 在 Claude Code 项目中配置 PreToolUse（危险命令拦截）+ PostToolUse（自动格式化）
2. **[Skills]** 将 Claude Code Skills 的数据驱动设计模式应用到 OpenClaw 自定义 Skills
3. **[MCP]** 配置 Context7 MCP 获取最新技术文档，减少 AI 知识过时问题
4. **[综合]** 在两个工具之间建立协作流程：Claude Code 编程 → OpenClaw 通知/自动化

---

# P0.2 深度学习：记忆系统(OC-07) + 安全配置(OC-10) + 技能系统(OC-06)

> **学习日期**: 2026-04-06
> **学习方法**: 教程精读 + 现有配置对照分析

---

## 一、OC-07 记忆系统 — 深度学习笔记

### 1.1 三层记忆架构（对照我们的实践）

| 层级 | 教程说明 | 我们的现状 | 差距/改进 |
|------|---------|-----------|----------|
| **会话记忆** | 当前对话上下文，compaction 时压缩 | ✅ 已配置 safeguard 模式，recentTurnsPreserve=4 | 已优化 |
| **短期记忆** | memory/YYYY-MM-DD.md，自动加载今天+昨天 | ✅ 已有 daily notes 机制 | 已实现 |
| **长期记忆** | MEMORY.md，建议 ≤500 行 / ≤3000 tokens | ✅ 当前 65 行，远低于限制 | ✅ 优秀 |

### 1.2 教程关键发现

1. **MEMORY.md 500 行限制**：教程建议控制在 500 行（~3000 tokens）以内，超出会挤占对话上下文
2. **归档机制**：超过 30 天的日志手动移到 `memory/archive/`，减少索引文件数量
3. **Compaction + memoryFlush**：上下文接近上限 → 触发 memoryFlush → AI 自动写日志 → 执行压缩
4. **向量存储 sqlite-vec**：默认启用，支持混合搜索（关键词+语义）+ MMR 去重 + 时间衰减
5. **记忆隐私**：密码/Key/Token 不应写入记忆文件，用 `[REDACTED]` 替代
6. **USER.md vs MEMORY.md 分工**：个人偏好→USER.md，项目/决策→MEMORY.md，临时笔记→daily logs
7. **记忆搜索优化**：定期 `openclaw memory index`，归档旧日志，给内容加标签

### 1.3 对照差距

| 维度 | 教程推荐 | 现状 | 优先级 |
|------|---------|------|--------|
| MEMORY.md 大小 | ≤500行 / ≤3000 tokens | 65 行 ✅ | 无需改进 |
| 日志归档 | >30天移到 archive/ | ⚠️ 依赖心跳手动整理，无自动化 | P2 |
| memoryFlush | softThresholdTokens 建议 4000 | 当前 20000（偏大）| P2 — 可降低到 4000-8000 |
| 敏感信息过滤 | SOUL.md 加安全规则 | ✅ AGENTS.md 已有 Red Lines | 已覆盖 |
| 记忆搜索 | `openclaw memory index` 定期重建 | ⚠️ 未定期执行 | P3 |
| Git 版本控制 | 追踪 MEMORY.md 变更 | ❌ workspace 未用 Git | P2 |
| extraPaths | 索引外部 Markdown 文件 | ❌ 未使用 | P3 — 可扩展 |

### 1.4 MEMORY.md 精简建议

**当前状态：65 行，非常精简，无需大幅调整。** 以下是长期维护建议：

#### 可以归档/删除的条目
1. **「GLM Coding 学习」** — 一次性学习笔记，不适合放 MEMORY.md，建议移到 `research/glm-coding-study-notes.md`
2. **「上下文管理」** — 已在 AGENTS.md 重复记录，MEMORY.md 可删除或极简化

#### 可以精简的条目
3. **「关键教训」** — 7 条高频教训，建议只保留 3-5 条最常见的（如 cron light-context、systemd drop-in、Chrome CDP IPv6），其余移到 `memory/heartbeat-reflections/lessons.md`
4. **「基础设施」** — OpenViking/DailyHotApi 等版本信息可精简，只保留端口和关键配置

#### 建议的精简目标
- 从 65 行精简到 40-50 行
- 长期信息 vs 临时信息明确分离
- 建议加 `## 用户偏好` 分类（当前只有项目/基础设施/教训）

---

## 二、OC-10 安全配置 — 深度学习笔记

### 2.1 安全分层模型

教程提出 5 层纵深防御：
1. **网络边界安全** — TLS 1.3 / 防火墙 / IP 白名单
2. **认证与授权** — Gateway Token / 配对系统 / 用户权限
3. **输入验证与过滤** — 提示词护栏 / 消息过滤 / 长度限制
4. **执行隔离** — Docker 沙箱 / 文件系统隔离 / 资源限制
5. **审计与监控** — 操作日志 / 异常检测 / 告警通知

### 2.2 对照现有安全配置

| 安全项 | 教程要求 | 现状 | 风险等级 | 改进建议 |
|--------|---------|------|---------|----------|
| Gateway 认证 | Token 或密码模式 | ✅ 已设置 password 模式 | 低 | 已覆盖 |
| Gateway 绑定 | `127.0.0.1`（loopback） | ❌ 当前 `lan`（0.0.0.0 绑定） | **高** | 改为 loopback + Tailscale/SSH 隧道 |
| TLS 1.3 | 强制启用 | ❌ 未配置 TLS | **高** | 至少配置自签名证书 |
| 沙箱 | `non-main` 或 `all` | ❌ 未配置（sandbox: {}） | **高** | 配置 `mode: "non-main"` |
| DM 配对 | `dmPolicy: "pairing"` | ⚠️ 使用 `allowlist` + 固定 ou_ | 低 | 可接受，但 pairing 更安全 |
| API Key 存储 | 环境变量 | ⚠️ openclaw.json 中有明文 appId/appSecret | **高** | 迁移到环境变量或 .env |
| 密钥轮换 | 每 90 天 | ❌ 无轮换机制 | 中 | 建立日历提醒 |
| 文件权限 | `chmod 600` 配置文件 | ⚠️ 未检查 | 中 | 执行权限检查 |
| 安全审计 | `openclaw doctor` | ❌ 未执行过 | 低 | 执行一次 |
| SOUL.md 安全规则 | 禁止危险命令 | ✅ AGENTS.md Red Lines | 低 | 已覆盖 |
| 日志脱敏 | `redactSensitive` | ❌ 未配置 logging | 中 | 配置日志级别和脱敏 |
| 密钥泄露检测 | `grep` 检查配置文件 | ❌ 未执行 | 中 | 执行一次检查 |

### 2.3 密钥轮换机制（重点）

教程推荐的轮换流程：
1. 在提供商后台生成新 Key
2. 更新环境变量
3. `openclaw gateway restart`
4. `openclaw health` 确认正常
5. 在提供商后台撤销旧 Key

**建议**：在飞书日历设置每 90 天一次的「API Key 轮换」提醒。

### 2.4 安全检查清单（可直接执行）

#### 立即执行（CRITICAL）
```bash
# 1. 检查 Gateway 绑定地址 — 当前 lan 需要改为 loopback
# 2. 配置沙箱
# 3. 密钥泄露检测
grep -rn "sk-proj-\|sk-ant-\|AIzaSy\|appSecret" ~/.openclaw/openclaw.json 2>/dev/null
# 4. 文件权限检查
ls -la ~/.openclaw/openclaw.json ~/.openclaw/credentials 2>/dev/null
# 5. 运行安全诊断
openclaw doctor
# 6. 运行安全审计
openclaw security audit
```

#### 配置改进建议
```json5
// 建议添加到 openclaw.json
{
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "non-main",  // 非主会话在沙箱中运行
        "docker": {
          "capDrop": ["ALL"],
          "readOnlyRoot": true,
          "tmpfs": ["/tmp", "/run"]
        }
      }
    }
  },
  "logging": {
    "level": "info",
    "file": "~/.openclaw/logs/openclaw.log",
    "redactSensitive": "tools",
    "redactPatterns": ["sk-proj-[A-Za-z0-9]+", "sk-ant-[A-Za-z0-9]+", "UY0al[A-Za-z0-9]+"]
  }
}
```

### 2.5 安全事件分级

| 级别 | 描述 | 响应时间 |
|------|------|----------|
| P0 | 系统被入侵，数据泄露 | 立即 |
| P1 | 安全漏洞被发现 | 4 小时内 |
| P2 | 可疑活动 | 24 小时内 |
| P3 | 安全配置问题 | 1 周内 |

**P0 应急流程**：`openclaw gateway stop` → 检查日志 → 撤销所有 Key → 更换 Token → 恢复服务

---

## 三、OC-06 技能系统 — 深度学习笔记

### 3.1 核心概念

| 维度 | 工具 (Tools) | 技能 (Skills) |
|------|-------------|---------------|
| 粒度 | 单个动作 | 多步骤流程 |
| 定义方式 | TypeScript/Python 函数 | Markdown 指令文档 |
| 开发难度 | 需要编程 | 写 Markdown 就行 |
| 状态 | 无状态 | 可维护上下文 |

**技能加载机制**：不是所有技能都加载（会撑爆上下文），只加载与当前任务相关的技能（通过 triggers 关键词匹配）。

### 3.2 技能类型与优先级

| 类型 | 说明 | 优先级 |
|------|------|--------|
| bundled | 随 OpenClaw 安装，不可修改 | 最低 |
| managed | 从 ClawHub 安装，可更新 | 中 |
| workspace | 用户自己创建 | **最高** |

### 3.3 Agent 级技能白名单（重点）

**这是最节省 token 的配置方式**：每个 Agent 只加载需要的技能，避免无关技能占用上下文。

```json5
// 教程推荐配置
{
  "agents": {
    "list": [
      {
        "id": "coding",
        "workspace": "~/.openclaw/workspace-coding",
        "skills": ["coding-agent", "github", "gh-issues", "tmux"]  // 只加载开发相关
      },
      {
        "id": "office",
        "workspace": "~/.openclaw/workspace-office",
        "skills": ["gog", "slack", "notion", "summarize"]  // 只加载办公相关
      }
    ]
  }
}
```

### 3.4 对照现有实践

| 维度 | 教程推荐 | 现状 | 改进建议 |
|------|---------|------|----------|
| Agent 级技能白名单 | 每个 Agent 配置 `skills: [...]` | ❌ 未配置 | **高优先级** — 为 coder/reviewer 等配置专属技能 |
| 全局技能配置 | `skills.entries` 控制启用/禁用 | ❌ 未配置 `skills` 字段 | 配置禁用不需要的技能 |
| triggers 精确匹配 | 每个技能设置精确触发词 | ✅ 由技能自身定义 | 已覆盖 |
| 自定义技能开发 | workspace/skills/ 下创建 | ✅ 已有多个自定义技能 | 已掌握 |
| 技能权限声明 | SKILL.md 中声明所需权限 | ⚠️ 未统一声明 | P2 — 统一添加权限声明 |
| 技能市场更新 | `openclaw skills update` | ⚠️ 未定期执行 | P3 — 加入周常维护 |

### 3.5 Token 节省策略

1. **Agent 级 skills 数组**（效果最大）— 每个 Agent 只加载 3-5 个相关技能
2. **禁用未使用的 bundled 技能** — 在 `skills.entries` 中设置 `enabled: false`
3. **精确 triggers** — 避免宽泛触发词导致无关技能被加载
4. **定期清理** — 删除 workspace/skills/ 下不用的技能

### 3.6 技能白名单配置建议

```json5
// 建议为 main Agent 添加 skills 白名单
// 当前 main Agent tools.alsoAllow 已配置，但 skills 未限制
{
  "agents": {
    "list": [
      {
        "id": "main",
        // ... 现有配置 ...
        "skills": [
          "weather", "healthcheck", "summarize", "coding-agent",
          "github", "tmux", "self-improvement",
          // 飞书相关
          "feishu-calendar", "feishu-task", "feishu-bitable",
          "feishu-create-doc", "feishu-update-doc", "feishu-fetch-doc",
          // lark 系列
          "lark-calendar", "lark-task", "lark-doc", "lark-im"
        ]
      },
      {
        "id": "coder",
        "skills": ["coding-agent", "github", "tmux", "pr-review"]
      },
      {
        "id": "cron-worker",
        "skills": ["weather", "daily-digest", "daily-hot-news", "summarize"]
      }
    ]
  }
}
```

---

## 四、综合改进方案

### 4.1 按优先级排序的行动项

| 优先级 | 改进项 | 来源 | 预估工作量 |
|--------|--------|------|-----------|
| **P0** | Gateway 绑定改为 loopback | OC-10 | 5 分钟 |
| **P0** | 配置沙箱 `mode: "non-main"` | OC-10 | 10 分钟 |
| **P0** | API Key/Secret 迁移到环境变量 | OC-10 | 30 分钟 |
| **P1** | Agent 级技能白名单 | OC-06 | 20 分钟 |
| **P1** | 配置日志和脱敏 | OC-10 | 15 分钟 |
| **P1** | 执行 `openclaw doctor` + `openclaw security audit` | OC-10 | 5 分钟 |
| **P2** | MEMORY.md 精简（移除 GLM Coding 学习、精简关键教训） | OC-07 | 10 分钟 |
| **P2** | memoryFlush softThresholdTokens 从 20000 降到 4000-8000 | OC-07 | 2 分钟 |
| **P2** | 建立密钥轮换日历提醒（90天周期） | OC-10 | 5 分钟 |
| **P2** | 日志归档自动化（30天 → archive/） | OC-07 | 30 分钟 |
| **P3** | `openclaw memory index` 定期执行 | OC-07 | 5 分钟 |
| **P3** | 技能统一添加权限声明 | OC-06 | 30 分钟 |
| **P3** | extraPaths 扩展记忆搜索范围 | OC-07 | 10 分钟 |

### 4.2 核心收获

1. **记忆系统**：我们的 MEMORY.md 管理得很好（65 行），主要差距在归档自动化和 memoryFlush 阈值
2. **安全配置**：存在 3 个高危项（Gateway 绑定 lan、无沙箱、Key 明文存储），需要立即处理
3. **技能白名单**：Agent 级 skills 数组配置是最有效的 token 节省手段，目前完全未配置
4. **密钥轮换**：教程推荐 90 天周期，我们完全没有这个机制
5. **日志审计**：未配置 logging 和脱敏，安全事件无法追溯

---

# P1.2 深度学习：模型配置(OC-04) + 多Agent协作(OC-08) + Docker部署(OC-09)

> **学习日期**: 2026-04-06
> **学习方法**: 教程精读 + 现有配置对照分析
> **教程版本基线**: OpenClaw v2026.3.28

---

## 一、OC-04 AI 模型配置 — 深度学习笔记

### 1.1 教程核心内容

#### 模型提供商全景
教程覆盖 OpenAI、Anthropic、Google Gemini、Moonshot/Kimi、通义千问、MistralAI、DeepSeek、xAI (Grok)、Cohere 等提供商，以及企业级平台（Azure OpenAI、AWS Bedrock、Google Vertex AI）和本地模型（Ollama、vLLM、LM Studio）。OpenRouter 作为模型路由聚合器，一个 Key 访问所有模型。

#### 模型选择策略（按场景）
| 场景 | 推荐模型 | 理由 | 大约成本 |
|------|---------|------|----------|
| 日常闲聊 | GPT-5.2-mini / Haiku 4.5 | 便宜快速 | ~$0.15/百万 token |
| 复杂推理 | Claude Opus 4.6 / o3 | 最强推理 | ~$15/百万 token |
| 编程辅助 | Claude Sonnet 4.6 / Codex | 编程最强 | ~$3/百万 token |
| 中文场景 | Qwen-Max / Kimi-Max | 中文优化 | 按各家定价 |
| 隐私优先 | Ollama + Llama3.1 | 数据不出本地 | 免费 |
| 多模态 | Gemini 3.1 Pro / GPT-5.2 | 图片视频理解 | ~$2.5/百万 token |
| 预算有限 | OpenRouter / DeepSeek | 最便宜 | ~$0.1-1/百万 token |
| 超长文本 | Gemini 2.5 Pro / Qwen-Long | 百万级上下文 | 按各家定价 |

#### 故障转移（Fallback）机制
- **触发条件**: 5xx 错误、超时、429 限流、网络失败
- **不触发**: 4xx 客户端错误（Key 无效）、内容质量不符预期
- **建议**: 最后一个 fallback 放本地模型，确保云端全挂时仍可用

#### 按 Agent 分配不同模型
教程推荐根据任务复杂度为不同 Agent 选择不同模型：
- coding Agent → 最强推理（Opus 级别）
- social Agent → 便宜够用（Mini 级别）
- work Agent → 性价比最优（Sonnet 级别）

#### 参数调优要点
- temperature: 0.0（代码/数据）→ 0.7（对话）→ 0.9-1.0（创意）
- topP: 与 temperature 二选一调整
- maxTokens: 按场景限制输出长度
- frequencyPenalty/presencePenalty: 减少重复

### 1.2 与我们现有配置的对照分析

**当前配置**：
- main: `GLM-5-Turbo` (primary) → `GLM-5` → `GLM-4.7` (fallbacks)
- coder: `GLM-5.1`, reviewer: `GLM-5.1`
- research/writer/cron-worker: `GLM-5-Turbo`
- analyst: `GLM-5.1`, designer: `GLM-4.6V`
- imageModel: `GLM-4.6V`
- 所有 Agent 都通过智谱 (zai) 提供商，204K 上下文

**优势**：
1. ✅ **已配置 fallbacks**：主模型挂了有备选，符合教程最佳实践
2. ✅ **按角色分配模型**：coder/reviewer/analyst 用更强的 GLM-5.1，research/writer 用更快的 GLM-5-Turbo，designer 用多模态 GLM-4.6V
3. ✅ **统一提供商简化管理**：不需要管多个 API Key

**优化空间**：

| 优化项 | 当前状态 | 建议 | 优先级 |
|--------|---------|------|--------|
| 非 main Agent fallback | ❌ 只有 main 配了 fallbacks | 为 coder/reviewer/analyst 也加 fallbacks | P2 |
| Agent 级模型细化 | coder 和 reviewer 都用 GLM-5.1 | reviewer 用更快的 GLM-5-Turbo（审查不需要最强推理） | P3 |
| Fallback 跨提供商 | 智谱单提供商 | 最后一个 fallback 考虑本地模型（Ollama） | P3 |
| 模型参数 | 未配置 | 为 writer Agent 提高 temperature（0.8-0.9）增强创意 | P3 |

### 1.3 模型路由优化建议

```json5
// 建议的增量优化
{
  "agents": {
    "list": [
      { "id": "coder", "model": { "primary": "zai/glm-5.1", "fallbacks": ["zai/glm-5", "zai/glm-4.7"] } },
      { "id": "reviewer", "model": { "primary": "zai/glm-5-turbo", "fallbacks": ["zai/glm-5", "zai/glm-4.7"] } },
      { "id": "analyst", "model": { "primary": "zai/glm-5.1", "fallbacks": ["zai/glm-5-turbo"] } }
    ]
  }
}
```

**关键结论**：我们的 GLM 多模型配置已基本合理，核心改进点是为非 main Agent 补充 fallbacks。

---

## 二、OC-08 多 Agent 协作 — 深度学习笔记

### 2.1 教程核心内容

#### 为什么需要多 Agent
1. **上下文污染** — 一个 Agent 什么都干，系统提示词会很长，浪费 token、降低专注度
2. **人格冲突** — 编程助手严谨 vs 社交助手轻松，一个 Agent 难以兼顾
3. **安全隔离** — 编程 Agent 需要执行 Shell，社交 Agent 不应该有这个权限
4. **消息路由** — 不同频道/群组需要不同的 AI 行为模式

#### 架构设计原则
- **扁平路由模型**（不是层级管理）— Gateway 直接根据消息来源路由到 Agent
- **Agent 完全独立** — 各自的工作空间、记忆文件、会话历史、认证凭证均不共享
- **可选共享** — 技能配置和 AI 模型可以按 Agent 级别定制

#### 消息路由（bindings 配置）
bindings 是顶层配置，不嵌套在 agent 内部。路由顺序：bindings 匹配 → 私聊走 main → 回退到 main。

#### 四种协作策略
1. **按职能分工** — 最常见：coding/office/social/research 各管一个领域
2. **按平台分工** — whatsapp/telegram/discord 各一个 Agent
3. **按安全等级分工** — trusted/limited/readonly
4. **流水线协作** — research → writer → reviewer 按顺序处理

#### Agent 间通信
- Sessions 工具（直接）：sessions_list/history/send/spawn
- 共享文件（间接）：写入 ~/.openclaw/shared/
- 用户中转 / 定时任务串联 / HTTP 请求触发

#### Agent 级技能白名单（重点！）
为每个 Agent 配置只需要的技能，好处：安全隔离、减少 token 浪费、降低误触发概率。

#### SOUL.md 人格设定关键要点
- SOUL.md 要具体不模糊，明确技能、工作规则、沟通风格
- 明确**不做什么**比明确做什么更重要
- 提供错误处理指引
- 定期审查和优化

### 2.2 与我们现有配置的对照分析

**当前 Agent 团队**：main + coder/reviewer/research/writer/analyst/cron-worker/designer（共 8 个）

**优势**：✅ 按职能分工 ✅ 独立工作空间 ✅ subagent 权限控制 ✅ 按角色分配模型

**最大差距**：

| 维度 | 教程推荐 | 现状 | 改进建议 |
|------|---------|------|----------|
| Agent 级技能白名单 | 每个 Agent 配置 skills 数组 | ❌ **完全未配置** | **P1** — 最有效的 token 节省手段 |
| 沙箱配置 | mode: "non-main" | ❌ 未配置 | **P0** — 安全问题 |
| bindings 消息路由 | 按频道/群组路由 | ⚠️ 通过 subagent 机制 | P2 — 已满足需求 |
| shared/ 共享目录 | 公共数据交换目录 | ❌ 未建立 | P3 — 需要流水线协作时再建 |

### 2.3 技能白名单配置建议

| Agent | 建议技能 |
|-------|---------|
| main | weather, healthcheck, summarize, coding-agent, feishu-*, lark-*, daily-digest, daily-hot-news, self-improvement, node-connect, arxiv, hf-papers, learning-workflow |
| coder | coding-agent, coding-agent-plan-first, github, tmux, pr-review, claude-code-enhance, claude-code-sync |
| reviewer | coding-agent, pr-review, summarize |
| research | tavily, firecrawl-search, firecrawl-scrape, arxiv, hf-papers, summarize, learning-workflow |
| writer | summarize, feishu-create-doc, feishu-update-doc, lark-doc, lark-wiki |
| analyst | feishu-sheet, lark-sheets, lark-base, feishu-bitable, summarize |
| cron-worker | weather, daily-digest, daily-hot-news, summarize, healthcheck |
| designer | feishu-create-doc, feishu-update-doc, lark-doc, lark-whiteboard |

**预期效果**：每个加载的技能描述约 200-500 tokens，减少 10+ 不相关技能可节省 2000-5000 tokens/会话。

### 2.4 多 Agent 分工优化建议

1. **考虑合并 analyst + reviewer** — 技能重叠度高，可减少管理复杂度
2. **cron-worker 技能最小化** — 只需要天气、摘要等安全技能
3. **各 Agent SOUL.md 审查** — 确保都有明确的"不做什么"边界

---

## 三、OC-09 Docker 部署 — 深度学习笔记

### 3.1 教程核心内容

Docker 部署优势：环境一致性、一键部署、隔离性、易于迁移、Agent 沙箱、回滚方便。

关键配置：
- 官方镜像 `openclaw/openclaw:latest`
- docker-compose 基础版（Gateway + Volumes）和进阶版（+ PostgreSQL + Redis）
- 数据持久化：Named Volumes vs Bind Mounts
- 网络配置：18789 端口 + Bridge/CDP 端口池 + 容器间服务名通信
- Agent 沙箱双重角色：Gateway 容器化 vs Agent 工具执行沙箱化
- 云平台部署：VPS ($5-10/月) / AWS EC2 / GCP Cloud Run / 阿里云 ECS
- 自动更新：Watchtower / GitHub Actions CI/CD

### 3.2 WSL2 vs Docker 部署评估

| 评估维度 | WSL2 systemd（当前） | Docker 部署 | 结论 |
|---------|---------------------|------------|------|
| 部署复杂度 | ✅ 低（已配置好） | ⚠️ 中 | WSL2 更简单 |
| 环境一致性 | ⚠️ 依赖发行版 | ✅ 完全一致 | Docker 更好 |
| 升级便利性 | ✅ npm i -g | ✅ docker compose pull | 持平 |
| 回滚能力 | ❌ 手动降级 | ✅ 镜像版本切换 | Docker 更好 |
| 资源开销 | ✅ 无额外开销 | ⚠️ Docker 守护进程 | WSL2 更轻 |
| 沙箱支持 | ❌ 需额外装 Docker | ✅ 天然支持 | Docker 更好 |
| 调试便利性 | ✅ 直接访问文件 | ⚠️ 需 exec 进入 | WSL2 更方便 |
| 迁移能力 | ❌ 依赖 WSL2 环境 | ✅ 数据卷拷贝即可 | Docker 更好 |

### 3.3 Docker 部署评估结论

**结论：当前阶段不建议迁移到 Docker，但未来应考虑。**

理由：
1. 教程明确说"在自己电脑上开发调试，直接本地安装更快"
2. WSL2 已足够稳定，systemd 支持良好
3. 调试效率：WSL2 可直接访问文件和日志
4. WSL2 已有 hypervisor 层，加 Docker 增加额外开销

**折中方案（推荐）**：
1. 保持 WSL2 systemd 部署 Gateway
2. 单独安装 Docker Engine 仅用于 Agent 沙箱（`sandbox.mode: "non-main"`）
3. 两全其美：开发效率 + 沙箱安全

**什么情况下值得迁移**：远程 VPS 部署 / 多实例运行 / 正式沙箱隔离 / 团队共享

### 3.4 可借鉴的实践

1. **日志轮转** — max-size: 10m, max-file: 5
2. **健康检查脚本** — 定时检查 Gateway 状态
3. **备份策略** — 定期备份 ~/.openclaw/ 目录
4. **环境变量管理** — API Key 迁移到 .env 文件

---

## 四、综合改进方案（按优先级排序）

| 优先级 | 改进项 | 来源 | 预估工作量 |
|--------|--------|------|-----------|
| **P1** | 为所有 Agent 配置 skills 白名单 | OC-08 | 30 分钟 |
| **P2** | 为非 main Agent 补充 fallbacks | OC-04 | 15 分钟 |
| **P2** | 审查各 Agent SOUL.md 的"不做什么"边界 | OC-08 | 20 分钟 |
| **P2** | reviewer 模型从 GLM-5.1 降为 GLM-5-Turbo | OC-04 | 2 分钟 |
| **P3** | 安装 Docker Engine 仅用于沙箱 | OC-09 | 30 分钟 |
| **P3** | 建立 shared/ 目录 | OC-08 | 5 分钟 |
| **P3** | 配置日志轮转 | OC-09 | 10 分钟 |
| **P4** | 考虑合并 analyst + reviewer Agent | OC-08 | 1 小时 |
| **P4** | 接入 OpenRouter 作为跨提供商 fallback | OC-04 | 30 分钟 |

---

## 五、核心收获总结

### OC-04 模型配置
- GLM 多模型配置已基本合理，fallback 机制已就位
- 核心改进：为非 main Agent 补充 fallbacks，优化 reviewer 模型选择

### OC-08 多 Agent 协作
- **最大改进机会**：Agent 级 skills 白名单（当前完全未配置）
- 8 Agent 团队按职能分工已合理，但缺少技能级权限隔离

### OC-09 Docker 部署
- WSL2 systemd 方案适合当前场景，不需要迁移
- 折中方案：WSL2 部署 + Docker 仅用于 Agent 沙箱

---

# 🔬 深度学习：CC-02 基础使用 + CC-10 综合实战 + CC-11 企业实战

> **学习日期**: 2026-04-06
> **对应教程**: 02-基础使用完整指南、10-综合实战完整指南、11-企业实战完整指南
> **学习重点**: 工作流优化和规范方面的可落地建议

---

## 一、CC-02 基础使用完整指南 深度笔记

### 1. /compact 策略深度分析

#### 教程推荐的压缩策略

| 时机 | 操作 | 节省比例 | 说明 |
|------|------|---------|------|
| Token 超 60% | `/compact` | 40-60% | 保留关键信息 |
| 任务完成后 | `/clear` | 100% | 仅保留 CLAUDE.md |
| 响应变慢 | `/compact 保留关于X的讨论` | 30-50% | 带指令压缩 |
| 切换完全不同任务 | `/clear` | 100% | 干净起点 |

**带指令压缩**是最被低估的功能：
```bash
You: /compact 保留所有关于数据库设计的讨论和决策
You: /compact 保留API接口的变更历史，可以丢弃代码审查内容
```

#### 与 OpenClaw Compaction 的对比

| 维度 | Claude Code /compact | OpenClaw Compaction |
|------|----------------------|-------------------|
| 触发方式 | 手动命令 | 自动（safeguard 模式） |
| 可定制性 | 可附加自然语言指令 | 配置 file（postCompactionSections） |
| 保留策略 | AI 自行判断 | 可指定保留最近 N 轮 + 重注入段 |
| 记忆保护 | 无显式保护 | memoryFlush 压缩前自动刷入 OpenViking |
| 标识符保护 | 无显式保护 | identifierPolicy: strict 保留 ID/URL |

**改进建议 1**：在 OpenClaw 侧，我们的 compaction 配置已经很先进（safeguard + memoryFlush + identifierPolicy），**但缺少 Claude Code 侧的"带指令压缩"能力**。可以考虑在 AGENTS.md 中加一条实践指南：长任务中途如果用户明确说"专注 X"，应主动建议用户在下一轮 compaction 前用 `/compact 保留 X`。

**改进建议 2**：教程推荐的日常工作流很实用，我们可以参考其结构优化 HEARTBEAT.md 或 daily notes 模板：
```bash
# 每日流程（Claude Code 风格，可借鉴到 OpenClaw）
1. 恢复会话       → 主会话自动恢复（dmScope）
2. 检查状态      → /status → health-check-deps.sh
3. 工作中定期检查 → /context → 注意 token 使用
4. 超 60% 压缩   → /compact（或 OpenClaw 自动 compaction）
5. 导出关键对话   → /export → memory/YYYY-MM-DD.md
6. 下班前命名    → /rename → daily notes 标题
```

### 2. 模型选择策略

#### 教程推荐的三级模型策略

| 任务类型 | 推荐模型 | 原因 | 成本比 |
|---------|---------|------|--------|
| 简单问答/格式转换 | Haiku | 最快最便宜 | 1x |
| 日常开发/代码修改 | Sonnet | 性价比最高 | 3x |
| 架构设计/关键决策 | Opus | 最强推理 | 15x |

**推理深度与模型的搭配**：

| /effort | 适用模型 | 场景 |
|---------|---------|------|
| low ○ | Haiku | 快速选择题 |
| medium ◐ | Sonnet | 日常开发（默认） |
| high ● | Sonnet/Opus | 架构设计、复杂调试 |

**Extended Thinking 成本控制**：

| 关键词 | Token 预算 | 响应时间 | 适用 |
|--------|-----------|---------|------|
| think | ~1,500 | 5-10s | 一般问题 |
| think hard | ~3,000 | 10-20s | 复杂问题 |
| think harder | ~8,000 | 20-30s | 架构决策 |
| ultrathink | ~16,000 | 30-60s | 关键决策 |

#### 与我们的实践对比

我们目前使用 GLM-5-Turbo 作为默认模型，没有多模型切换机制。OpenClaw 支持 fallback 模型配置，但我们未配置。

**改进建议 3**：考虑配置 fallback 模型策略：
- 主模型：GLM-5-Turbo（日常对话）
- Fallback：Claude Sonnet（主力模型不可用时的降级方案）
- 高质量任务：手动切换到 Opus 或 Sonnet

### 3. 高效命令使用

#### 被低估的实用命令

| 命令 | 用途 | 使用频率 |
|------|------|---------|
| `/btw` | 不污染主线程的 side question | 高 |
| `/diff` | 查看当前变更和逐轮 diff | 中 |
| `/fast` | 快速输出模式（同模型更快） | 中 |
| `/todos` | 查看 Claude 追踪的待办 | 中 |
| `/sandbox` | OS 级沙箱隔离 | 低（安全相关） |
| `/branch` | 会话分支（从当前点分叉） | 低 |

#### Rewind/Checkpoint 三种恢复策略

这是 Claude Code 最被低估的功能之一：

| 恢复选项 | 效果 | 适用场景 |
|---------|------|--------|
| 仅恢复对话 | 保留代码改动，重置 AI 上下文 | AI 理解错了，代码改对了 |
| 仅恢复代码 | 保留对话历史，回退文件修改 | 代码改错了，讨论有价值 |
| 同时恢复 | 代码和对话都回到之前 | 完全走错方向 |

**决策表**：

| 代码对吗？ | 对话有用吗？ | 选哪个？ |
|-----------|------------|--------|
| 对 | 不对 | 仅恢复对话 |
| 不对 | 有用 | 仅恢复代码 |
| 不对 | 没用 | 同时恢复 |
| 都对 | 都对 | 按 Cancel |

> ⚠️ **关键限制**：Checkpoint 只追踪 Claude 的文件编辑工具，**不追踪 bash 命令修改**！重要操作让 Claude 用文件工具修改。

**改进建议 4**：将 Checkpoint/Rewind 的思维引入 OpenClaw 的工作流：
- 在 AGENTS.md 中增加"重要修改使用 write/edit 而非 exec 覆盖"的实践建议
- 考虑在 subagent 任务中引入 git commit checkpoint 策略

---

## 二、CC-10 综合实战完整指南 深度笔记

### 1. CLAUDE.md 层级结构分析

#### 教程推荐的三层配置

```
~/.claude/CLAUDE.md          # 全局配置（个人偏好、通用规则）
└── 项目根目录/CLAUDE.md       # 项目配置（团队共享，入库管理）
    └── 子目录/CLAUDE.md       # 模块级配置（如 src/legacy/ 特殊规则）
```

**配置内容分工**：

| 层级 | 内容 | 入库 | 覆盖 |
|------|------|------|------|
| 全局 | 语言偏好、通用安全规则 | ❌ 个人 | 最低 |
| 项目 | 技术栈、代码规范、命名约定、测试要求 | ✅ 团队 | 中 |
| 子目录 | 模块特殊规则（遗留代码处理等） | ✅ 团队 | 最高 |

**项目 CLAUDE.md 推荐模板**（6 大板块）：
1. 项目概览（描述、技术栈、当前阶段）
2. 代码规范（通用规则、命名约定、文档要求）
3. 安全规则（禁止行为、必须行为）
4. 测试要求（覆盖率、测试类型）
5. Git 规范（分支命名、提交信息格式）
6. 项目特殊说明

#### 与我们 AGENTS.md / SOUL.md 的对照

| 教程 CLAUDE.md 板块 | 我们的对应文件 | 对比分析 |
|-------------------|-------------|---------|
| 项目概览 | AGENTS.md（Workspace 目录规范） | ✅ 我们更详细，有完整目录树 |
| 代码规范 | rules/common/（coding-style, security 等） | ✅ 我们用了 ECC 风格分层，更灵活 |
| 安全规则 | AGENTS.md（Red Lines） | ✅ 我们更精炼，但缺少"必须行为"清单 |
| 测试要求 | rules/common/testing（如果存在） | ⚠️ 未确认是否有专门测试规则 |
| Git 规范 | AGENTS.md（Red Lines 中提到） | ⚠️ 只说"禁止 --no-verify / --force"，缺少正面规范 |
| 项目特殊说明 | SOUL.md + USER.md | ✅ 我们的人格定义远超教程的"偏好" |
| n/a | HEARTBEAT.md | 🌟 我们的独创，教程没有等效概念 |
| n/a | TOOLS.md | ✅ 环境特定配置，教程未专门讨论 |

**核心差异**：
- 教程的 CLAUDE.md = 单文件全栈配置，适合 Claude Code 的简单层级
- 我们的体系 = 多文件职责分离，更灵活但也更复杂
- 我们有 Claude Code 教程**完全没有**的两个关键概念：HEARTBEAT.md（自动化运维）和 TOOLS.md（环境备忘）

**改进建议 5**：借鉴教程的"必须行为"清单概念，在 AGENTS.md Red Lines 中补充正面规范：
```markdown
## 必须行为（Best Practices）
- 修改代码后必须运行相关测试（如果存在）
- 所有文件操作使用 write/edit，避免 exec 覆盖
- 涉及用户隐私数据时必须确认后操作
- subagent 任务完成后必须记录到 subagent-log.md
```

**改进建议 6**：教程的分层配置思路值得参考。我们目前所有规则都在 AGENTS.md 根层级，考虑按项目目录建立子目录级规则：
```
projects/team-dashboard/CLAUDE.md   # 专属该项目的规则
research/CLAUDE.md                  # 研究笔记的特殊规则
```

### 2. 团队协作规范

#### 教程推荐的团队协作体系

**1. 配置同步策略**：

| 类型 | 示例 | 入库 | 说明 |
|------|------|------|------|
| 团队共享 | .claude/settings.json | ✅ | 统一权限配置 |
| 个人本地 | .claude/settings.local.json | ❌ | 个人偏好覆盖 |
| 环境变量 | .env（模板 .env.example） | ❌ / ✅ 模板 | 敏感信息 |

**2. 代码审查流程**：
```
开发者提交 PR → CI 自动触发 Claude 审查 → 5 维度审查
（代码质量 / 安全性 / 性能 / 测试 / 文档）
→ 自动添加评论 → 人工复核 → 合并/打回
```

**3. Skills 系统共享**：
- 公司级 skills → 团队级 skills → 项目级 skills
- Skills 用 SKILL.md 定义，支持 Hot Reload

### 3. 权限系统详解

#### 教程的三级权限模型

```json
{
  "permissions": {
    "allow": ["Read", "Glob", "Grep", "Bash(npm test *)"],
    "deny": ["Bash(rm -rf /)", "Read(./.env)", "Bash(sudo *)"]
  }
}
```

- **Allow**：直接执行，无需确认
- **Ask**（默认）：执行前需要确认
- **Deny**：完全禁止

**Sandbox 沙箱配置**（v2.1.92 增强）：
```json
{
  "sandbox": {
    "filesystem": {
      "allowWrite": ["/tmp", "./src"],
      "allowRead": ["./", "/usr/lib"],
      "denyRead": [".env", "credentials.json"]  // 优先级最高！
    }
  }
}
```

> ⚠️ `denyRead` 优先级高于 `allowRead`。即使 `allowRead` 包含 `"./"`，`denyRead` 中的文件仍被禁止。

### 4. 审计日志

#### 教程方案：通过 Hooks 实现

Claude Code **没有内置审计日志配置块**，但可以通过 PostToolUse Hook 实现：

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "echo '{\"timestamp\":\"'$(date -Iseconds)'\"}' >> ./logs/claude-audit.jsonl"
      }]
    }]
  }
}
```

> 环境变量由 Claude Code 自动注入：`$CLAUDE_TOOL_NAME`、`$CLAUDE_FILE_PATHS`、`$CLAUDE_TOOL_EXIT_CODE` 等。

**改进建议 7**：OpenClaw 有内置的 `session_status` 和 session 日志，但我们没有做结构化的操作审计。可以考虑：
- 在 `exec` 调用前自动记录到 daily notes（高危操作）
- 利用 OpenClaw 的 memory_search 做事后查询
- 或者在 subagent 完成回调中记录操作摘要

### 5. 上下文管理与性能优化

#### CLAUDE.md 优化策略

1. **精简内容**：冗长描述 → 精炼要点（目标 <5000 字符）
2. **引用外部**：内联大量内容 → `详见 docs/xxx.md`
3. **分层配置**：根目录 CLAUDE.md <1000 tokens，子目录各自 <500 tokens

#### 分解大任务

```
# ❌ 不推荐
"重构整个项目的所有模块"

# ✅ 推荐
1. "分析用户模块的当前结构"
2. "基于分析结果，提出重构方案"
3. "执行用户模块重构"
4. "验证重构结果"
```

**改进建议 8**：我们的 AGENTS.md 已经比较精炼，但 SOUL.md 的"Continuity"段落值得精简。可以检查：
- AGENTS.md 当前总 token 数（含注入的文件）
- 是否有重复内容可以在多文件间去重

---

## 三、CC-11 企业实战完整指南 深度笔记

### 1. API Key 密钥分级管理

#### 教程的密钥层级体系

```
Production Keys (生产环境)
├── Master Key (主密钥)     # 最高权限，仅 CEO/CTO，2FA + 硬件密钥
├── Service Keys (服务密钥)  # 各服务独立
│   ├── API Gateway Key     # 限制：10,000 RPM
│   ├── Backend Service Key # 限制：5,000 RPM
│   └── Batch Job Key       # 限制：100 RPM
└── Developer Keys (开发密钥)
    ├── Dev Environment     # 限制：100 RPM
    └── Test Environment    # 限制：50 RPM

Staging Keys (预发布)       # 独立，与生产完全隔离
Development Keys (开发)      # 团队共享，每周轮换
```

**三大密钥存储方案**：

| 方案 | 优点 | 缺点 | 适用 |
|------|------|------|------|
| AWS Secrets Manager | AWS 深度集成 | 仅限 AWS | AWS 用户 |
| HashiCorp Vault | 跨平台、功能强大 | 需额外维护 | 多云环境 |
| Azure Key Vault | Azure 集成 | 仅限 Azure | Azure 用户 |

**密钥轮换自动化**：
```
检查过期(90天) → 生成新密钥 → 存储到Vault → 更新所有服务
→ 观察5分钟 → 验证 → 成功:撤销旧密钥 / 失败:回滚旧密钥
```

#### 与我们的实践对比

| 维度 | 教程推荐 | 我们的实践 | 差距 |
|------|---------|-----------|------|
| 密钥分级 | 4 层（Master/Service/Dev/Test） | 未分级 | ⚠️ 所有 Key 同级 |
| 存储方式 | Secrets Manager / Vault | TOOLS.md 明文 + 环境变量 | ⚠️ TOOLS.md 中有明文 Key |
| 轮换周期 | 90 天自动 | 无 | ⚠️ 需建立机制 |
| RPM 限制 | 按服务分级（100-10000） | 无 | ⚠️ 暂不紧迫（个人使用） |
| 泄露检测 | Git Secrets 扫描 + 自动告警 | 无 | ⚠️ 需要关注 |

> **高危发现**：TOOLS.md 中明文存储了 Firecrawl API Key 和 Tavily API Key。虽然这是 workspace 内部文件，但如果有任何 workspace 内容被同步/备份/分享，密钥就会泄露。

**改进建议 9**：立即将 TOOLS.md 中的 API Key 迁移到环境变量：
```bash
# 从 TOOLS.md 移除明文 Key，改为：
export FIRECRAWL_API_KEY="fc-xxx"   # 在 .bashrc 或 .env
export TAVILY_API_KEY="tvly-xxx"
```

**改进建议 10**：建立密钥轮换提醒机制：
- 使用飞书日历创建 90 天后的提醒事件
- 或使用 qqbot_remind 设置周期性检查

### 2. 敏感数据保护

#### 教程的 Git Secrets 扫描

```bash
# 敏感信息正则
sk-ant-api[0-9]{2}-[a-zA-Z0-9_-]{95,}   # Anthropic
AKIA[0-9A-Z]{16}                         # AWS
ghp_[a-zA-Z0-9]{36}                        # GitHub
-----BEGIN (RSA|EC|OPENSSH )?PRIVATE KEY-----  # 私钥
password\\s*[=:]‌\\s*['\"]([^'\"]{8,})['\"]     # 密码
```

#### 日志脱敏

```python
class SensitiveDataFilter(logging.Filter):
    @staticmethod
    def mask_sensitive_data(text: str) -> str:
        # API Key: sk-ant-api03-*** → sk-ant-api03-****
        # Email: j***n@example.com
        # Phone: 123-***-7890
```

**改进建议 11**：在 AGENTS.md 的 Red Lines 中增加"日志脱敏"规则：
```markdown
- 输出中不暴露完整 API Key、密码、Token（如需展示格式，用 `fc-xxx...xxx` 省略中间部分）
- 飞书消息中不发送包含完整密钥的内容
```

### 3. modelOverrides：企业模型端点映射

```json
{
  "modelOverrides": {
    "claude-sonnet-4-6": "arn:aws:bedrock:us-east-1:123456:model/claude-sonnet",
    "claude-opus-4-6": "your-azure-deployment-name"
  }
}
```

- Claude Code 内部仍使用标准模型名
- 实际请求自动转发到自定义端点
- 适用场景：Amazon Bedrock、Azure OpenAI、内部 API 网关

**与 OpenClaw 对比**：OpenClaw 通过 `openclaw.json` 的 `models` 配置实现类似功能（baseUrl + apiKey），概念等价但配置方式不同。

### 4. Worktree 系统：大型 Monorepo 并行开发

```bash
claude --worktree  # 自动创建 Git Worktree 隔离环境
```

```json
{
  "worktree": {
    "sparsePaths": [
      "packages/frontend/**",
      "packages/shared/**",
      "package.json",
      "tsconfig.json"
    ]
  }
}
```

- 按 Sparse Checkout 只检出需要的目录
- 适合几十 GB 级别的 Monorepo
- 配合 Agent Teams 或 Subagents 并行开发

### 5. 合规要求

#### GDPR 核心要求

| 要求 | Claude Code 实现 |
|------|-----------------|
| 数据最小化 | 限制日志记录的个人信息 |
| 访问权 | 提供数据导出 API |
| 删除权 | 实现数据删除流程 |
| 违规通知 | 72 小时内自动化响应 |

#### SOC 2 五大信任原则

1. **Security**：防止未授权访问
2. **Availability**：系统正常运行
3. **Processing Integrity**：数据处理正确
4. **Confidentiality**：敏感信息保密
5. **Privacy**：个人信息保护

### 6. 20 条企业安全黄金规则

| 优先级 | 规则 | 我们的状态 |
|--------|------|-----------|
| P0 | API Key 永远不硬编码 | ⚠️ TOOLS.md 有明文 Key |
| P0 | 使用环境变量或 Secrets Manager | ⚠️ 部分使用 |
| P0 | 每 90 天轮换一次密钥 | ❌ 无轮换机制 |
| P0 | 限制 API 速率 | ℹ️ 个人使用暂不紧迫 |
| P0 | 记录所有 API 访问 | ⚠️ 无结构化审计日志 |
| P0 | 异常访问立即告警 | ❌ 无监控 |
| P1 | 敏感数据必须加密 | ℹ️ 本地使用 |
| P1 | 日志自动脱敏 | ❌ 无脱敏机制 |
| P1 | 定期安全扫描 | ❌ 无 |
| P1 | 依赖漏洞检查 | ⚠️ 未系统化 |
| P1 | 最小权限原则 | ✅ AGENTS.md 已有 |
| P1 | 多因素认证（2FA） | ✅ 飞书已启用 |
| P2 | 网络隔离 | ℹ️ 本地 WSL 环境 |
| P2 | SSL/TLS 加密 | ✅ OpenClaw TLS 1.3 |
| P2 | 备份与恢复 | ⚠️ 无系统化备份 |
| P2 | 安全培训 | N/A（个人使用） |
| P2 | 事故响应预案 | ❌ 无 |
| P3 | 合规性审计 | N/A |
| P3 | 安全文档更新 | ⚠️ 可改进 |

**安全评分**：P0 满足 1/6，P1 满足 3/6，P2 满足 2/6 = **6/20（30%）**

---

## 四、对照分析：我们的实践 vs 教程推荐

### 已做得好的

1. ✅ **多文件职责分离**：AGENTS.md + SOUL.md + USER.md + HEARTBEAT.md + TOOLS.md，比教程的单文件 CLAUDE.md 更灵活
2. ✅ **Compaction 配置先进**：safeguard 模式 + memoryFlush + identifierPolicy，远超教程的手动 /compact
3. ✅ **Subagent 任务派发规范**：四要素模板（Goal + Context + Constraints + Done），教程无等效概念
4. ✅ **记忆系统完善**：daily notes + MEMORY.md + OpenViking 三层 + 心跳沉淀，教程无等效概念
5. ✅ **安全意识**：Red Lines、高危操作确认、Config Protection，基础良好
6. ✅ **HEARTBEAT.md 自动化运维**：教程完全没有覆盖的领域，我们的独创优势
7. ✅ **飞书深度集成**：远超教程的通用 CI/CD 讨论

### 可以改进的（按优先级）

| # | 改进项 | 来源教程 | 具体行动 | 工作量 |
|---|--------|---------|---------|--------|
| 1 | **TOOLS.md 密钥迁移** | CC-11 | 将 Firecrawl/Tavily Key 迁移到环境变量 | 10min |
| 2 | **日志脱敏规范** | CC-11 | Red Lines 增加"不输出完整密钥"规则 | 2min |
| 3 | **补充正面行为规范** | CC-10 | AGENTS.md 增加 Best Practices 清单 | 10min |
| 4 | **子目录级配置** | CC-10 | 按项目目录创建子目录 CLAUDE.md | 20min |
| 5 | **结构化操作审计** | CC-10 | 在 subagent 完成后记录操作摘要 | 15min |
| 6 | **密钥轮换提醒** | CC-11 | 创建 90 天日历提醒 | 5min |
| 7 | **Checkpoint 思维引入** | CC-02 | AGENTS.md 增加"重要修改用 write/edit"规范 | 5min |
| 8 | **Fallback 模型配置** | CC-02 | openclaw.json 配置备用模型 | 10min |
| 9 | **安全评分提升** | CC-11 | P0 项逐个改进（审计日志、速率限制等） | 2h |
| 10 | **Git Secrets 扫描** | CC-11 | 配置 pre-commit Hook 扫描密钥泄露 | 30min |

### 不适用的（个人使用场景暂不需要）

- 企业级 CI/CD 流水线（个人项目暂无需求）
- 多团队配置同步（单用户）
- SOC 2/GDPR 正式合规审计（个人使用）
- 密钥分级 RPM 限制（个人使用，量级不大）
- HashiCorp Vault / AWS Secrets Manager（个人使用，环境变量足够）
- 新成员入职流程（单用户）

---

## 五、每篇至少 2 个具体可操作的改进建议（汇总）

### CC-02 基础使用
1. **带指令压缩实践**：长任务中途明确焦点后，在 compaction 前附加"保留 X"指令
2. **Checkpoint 思维**：重要文件修改使用 write/edit 而非 exec 覆盖，便于回退
3. **Fallback 模型**：配置备用模型，主力模型不可用时自动降级
4. **每日流程标准化**：参考教程的 7 步日常流程优化 daily notes 模板

### CC-10 综合实战
5. **补充正面行为规范**：在 AGENTS.md Red Lines 下方增加 Best Practices 清单
6. **子目录级配置**：在 projects/ 和 research/ 下建立 CLAUDE.md 子目录规则
7. **结构化操作审计**：subagent 完成后记录操作摘要到 subagent-log.md（已有框架，需强化）
8. **CLAUDE.md token 预算**：检查注入文件的总 token 数，确保在合理范围内

### CC-11 企业实战
9. **密钥迁移**：将 TOOLS.md 明文 API Key 迁移到环境变量
10. **日志脱敏**：Red Lines 增加"不暴露完整密钥"的输出规范
11. **密钥轮换提醒**：创建 90 天周期提醒事件
12. **Git Secrets 扫描**：配置 pre-commit Hook 防止密钥意外提交

---

# 🔬 P2 新领域探索：CC-08 Plugins + CC-09 Agent-SDK + CC-12 Remote + CC-13 Channels

> **学习日期**: 2026-04-06
> **学习方法**: 概述性阅读 + OpenClaw 对照分析
> **学习目标**: 四个新领域做认知储备，评估与 OpenClaw 的关系，暂不落地

---

## 一、CC-08 Plugins 生态完整指南

### 1. 核心概念

**Plugin = Claude Code 的扩展包**，是 Commands/Skills/MCP 的「超集」：

```
Plugin = manifest(plugin.json) + agents + skills + hooks + MCP + LSP + bin + settings
```

**关键区分**：
| 维度 | Commands | Skills | MCP | **Plugins** |
|------|----------|--------|-----|------------|
| 定义 | Markdown 提示词 | 专业 Agent 能力 | 外部服务集成 | **打包的扩展** |
| 位置 | `.claude/commands/` | `.claude/skills/` | `.mcp.json` | **本地目录 + market 安装** |
| 可分享性 | ❌ 手动复制 | ❌ 手动复制 | ⚠️ 需配置 | **✅ 市场/CLI/本地** |
| 加载方式 | 自动 | 自动 | 自动 | **`/plugin` 为主，`--plugin-dir` 为开发补充** |

### 2. 安装与管理
- **官方主路径**：`/plugin` 交互命令 + Marketplace（`code.claude.com/plugins`）
- **本地开发**：`--plugin-dir /path/to/plugin`（调试用，非推荐日常方式）
- **目录结构**：`.claude-plugin/plugin.json`（必需）+ skills/ + commands/ + hooks/ + agents/
- **命名空间**：Plugin 内的 Skill 自动加 `plugin-name:` 前缀，避免冲突
- **卸载**：市场安装的用 `/plugin`，本地的删除目录

### 3. 适用场景
- 团队共享标准化能力包（如统一代码审查规范）
- 社区优质能力一键安装
- 跨项目复用 Skills + Hooks + MCP 配置

### 4. 与 OpenClaw 的关系
| 维度 | Claude Code Plugins | OpenClaw | 评估 |
|------|---------------------|----------|------|
| 扩展机制 | Plugin = manifest + 多资源 | Skills + Extensions | **概念等价** |
| 分发方式 | Marketplace + git clone | ClawHub + npm | OpenClaw 更成熟 |
| 命名空间 | `plugin-name:skill` 自动隔离 | Agent 级 skills 白名单 | OpenClaw 的隔离更灵活 |
| 热更新 | 重启生效 | `openclaw skills check` | 持平 |
| 状态 | research preview，生态早期 | 50+ 内置 + 社区 | **OpenClaw 远超** |

**评估结论**：Claude Code Plugins 生态还处于早期阶段（Marketplace 刚上线），而 OpenClaw 的 Skills 体系已非常成熟。Plugin 的核心价值在于「打包分发」，这个能力 OpenClaw 通过 ClawHub 已经覆盖。

### 5. 何时值得深入学习
- **现在**：不需要。我们已通过 OpenClaw Skills/Extensions 获得了等价能力
- **未来**：如果开始深度使用 Claude Code CLI（如编程工作流），可以探索 Marketplace
- **关注点**：Plugin 的 manifest 结构设计理念值得借鉴（标准化扩展包的元数据描述）

---

## 二、CC-09 Agent-SDK 完整指南

### 1. 核心概念

**Agent SDK = 把 Claude Code 核心引擎封装为可编程接口**，支持 Python 和 TypeScript。

```
你的应用程序
├── Claude Agent SDK（编程接口）
│   └── Claude Code 核心引擎（文件读写/Bash/代码分析/MCP）
└── 完全控制：model、tools、hooks、MCP servers
```

**核心 API**：
- `query(prompt, options)` → 返回异步迭代器（流式消息）
- Options：model、system_prompt、cwd、max_turns、allowed_tools、mcp_servers
- 消息类型：AssistantMessage、ToolUseBlock、ToolResultBlock、ResultMessage

**Agent Loop 工作流程**：
```
接收任务 → 思考 → 决定行动 → 需要工具？
  → 是：执行工具 → 检查结果 → 任务完成？→ 继续循环
  → 否：直接回复
```

### 2. 适用场景
- **自动化脚本**：每天自动审查代码、生成报告
- **批量处理**：一次处理 100 个文件的重构
- **CI/CD 集成**：把 Claude 嵌入流水线
- **多 Agent 并行**：让多个 Agent 同时工作
- **定制化工具**：构建特定领域的 AI 助手
- **自定义工具**：通过 `@tool` 装饰器 + SDK MCP Server 创建自定义工具

### 3. 与 OpenClaw 的关系
| 维度 | Claude Agent SDK | OpenClaw | 评估 |
|------|-----------------|----------|------|
| 定位 | 编程控制 Claude Code | AI 助手框架（Gateway + Channel） | **不同层面** |
| 使用方式 | 写 Python/TS 代码调用 | 配置文件 + Skills + 消息平台 | OpenClaw 更低门槛 |
| 消息平台 | ❌ 无（纯 CLI） | ✅ 飞书/Telegram/Discord 等 | **OpenClaw 完胜** |
| 自动化 | 脚本级 | Cron + 心跳 + subagent | **OpenClaw 更完整** |
| 工具调用 | 内置 tools + 自定义 MCP | 内置 tools + Skills + Extensions | 功能相当 |
| 多 Agent | Task tool + 并行 query | 多 Agent 路由 + subagent | **OpenClaw 更成熟** |
| 持久化 | 无内置 | MEMORY.md + OpenViking + daily notes | **OpenClaw 完胜** |

**评估结论**：Agent SDK 和 OpenClaw 解决的是不同层面的问题。Agent SDK 是给开发者用的「编程接口」，适合嵌入到程序中；OpenClaw 是给用户用的「助手框架」，适合日常自动化。两者可以互补但功能重叠不大。

### 4. 何时值得深入学习
- **现在**：不需要。我们的自动化需求已通过 OpenClaw cron + subagent 覆盖
- **如果开始用 Claude Code 做编程**：值得学。可以把 Claude 的编程能力嵌入到自动化流水线中
- **具体场景**：需要将 Claude Code 的代码审查能力集成到 GitHub Actions / CI/CD 时
- **关注点**：`query()` API 的流式处理模式和自定义工具（`@tool` 装饰器）是核心能力

---

## 三、CC-12 Remote Control 完整指南

### 1. 核心概念

**Remote Control = 让 claude.ai/code 或手机 App 变成你本地 Claude Code 会话的远程窗口。**

**关键特性**：
- ✅ 会话仍在本地机器运行（不是云端克隆）
- ✅ 本地文件系统、MCP、配置仍然可用
- ✅ 手机/浏览器/终端可以同时连同一会话
- ✅ 适合「中途离开工位但不想中断当前任务」
- ❌ 需要 claude.ai 登录（API key 不支持）
- ❌ Team/Enterprise 需管理员先启用

**三种启动方式**：
| 方式 | 命令 | 适用场景 |
|------|------|--------|
| 独立服务器 | `claude remote-control` | 本地不敲终端，直接挂出来 |
| 本地交互+远程 | `claude --remote-control` 或 `claude --rc` | 保留终端交互，同时远端可连 |
| 已运行会话临时开 | `/remote-control` | 正在做一半才决定换设备 |

**并发模式**：
- `same-dir`：所有会话同目录（简单，但易冲突）
- `worktree`：每个会话单独 git worktree（并行任务友好）

### 2. 与 Claude Code on the Web 的区别
| 功能 | Remote Control | Claude Code on the Web |
|------|---------------|----------------------|
| 运行位置 | 你的本地机器 | Anthropic 云端 |
| 文件系统 | 本地真实项目 | 云端克隆/沙箱 |
| MCP/本地工具 | 直接复用本地环境 | 取决于云端环境 |
| 典型场景 | 已做一半，换设备继续 | 新开云端任务 |

### 3. 与 OpenClaw 的关系
| 维度 | Claude Code Remote Control | OpenClaw | 评估 |
|------|------------------------|----------|------|
| 远程访问 | 手机/浏览器连本地会话 | 消息平台（飞书/TG）随时访问 | **OpenClaw 天然支持** |
| 设备切换 | 需额外开启 | 原生多平台 | **OpenClaw 更便捷** |
| 持久连接 | 需本地终端运行 | Gateway 常驻服务 | **OpenClaw 更可靠** |
| 实时性 | 流式同步 | 消息推送 | 持平 |

**评估结论**：Remote Control 解决的核心问题——「跨设备继续会话」——OpenClaw 通过消息平台（飞书/Telegram）已经天然实现了。OpenClaw 的 Gateway 是常驻服务，不需要本地终端运行，体验更好。Remote Control 的唯一优势是在「已有本地 Claude Code 会话」时可以无缝切换，但我们目前主要用 OpenClaw 而非 Claude Code CLI。

### 4. 何时值得深入学习
- **现在**：不需要。OpenClaw 的飞书/Telegram 接入已完全覆盖跨设备场景
- **如果开始深度使用 Claude Code CLI**：值得了解。本地跑了长时间编程任务，想躺沙发继续时很方便
- **限制**：需要 claude.ai 登录，不适合 API key 模式

---

## 四、CC-13 Channels 与计划任务完整指南

### 1. 核心概念

**Channels = 通过 MCP server 把外部事件推入已打开的 Claude Code 会话。**
**计划任务 = Claude 按时间轮询或提醒。**

**核心区分**：
| 功能 | 解决什么问题 | 最适合场景 |
|------|------------|------------|
| **Channels** | 外部事件主动推进来 | CI、聊天桥、Webhook |
| **Remote Control** | 你自己从别的设备继续控制会话 | 手机继续本地会话 |
| **普通 MCP** | Claude 在任务中主动调用外部工具 | 按需查数据/操作系统 |
| **`/loop` / Cron** | 按时间轮询或提醒 | 没有事件推送源时 |

**核心判断标准**：
- 有事件源（外部系统会主动发事件）→ 用 Channels
- 没有事件源（只能定时检查）→ 用 `/loop`

### 2. Channels 实现方式
- **状态**：research preview（v2.1.80+）
- **安装**：`/plugin install fakechat@claude-plugins-official`
- **启动**：`claude --channels plugin:fakechat@claude-plugins-official`
- **官方支持**：Telegram、Discord、iMessage、fakechat（demo）
- **安全**：所有 channel plugin 有 sender allowlist
- **限制**：需 claude.ai 登录、Team/Enterprise 需管理员启用

### 3. 计划任务
| 工具 | 作用 | 限制 |
|------|------|------|
| `/loop 5m check deploy` | 定时循环（bundled skill） | 当前会话内，最小 1 分钟粒度 |
| `/schedule` | 创建 Cloud/Desktop 计划任务 | 需要 Claude 订阅 |
| `CronCreate/List/Delete` | 底层 cron 调度 | session-scoped，不跨重启 |

**关键限制**：
- ❌ 任务是 **session-scoped**（会话结束就没了）
- ❌ **不跨重启持久化**
- ❌ recurring task **7 天自动过期**
- ✅ Claude 忙时不会插队（turn 之间触发）
- ✅ 自然语言创建提醒："remind me at 3pm to push the release branch"

**可靠调度需用 Cloud/Desktop scheduled tasks**（非本地 session）。

### 4. 与 OpenClaw 的关系
| 维度 | Claude Code Channels | Claude Code 计划任务 | OpenClaw | 评估 |
|------|---------------------|-------------------|----------|------|
| 外部消息通道 | MCP plugin（Telegram/Discord/iMessage） | — | 原生飞书/Telegram/Discord + 15+ 平台 | **OpenClaw 远超** |
| 定时任务 | `/loop`（session-scoped） | `/schedule` + CronCreate（session-scoped） | cron（systemd 级持久化）+ qqbot_remind | **OpenClaw 远超** |
| 持久化 | ❌ 不跨重启 | ❌ 7 天过期 | ✅ systemd 服务常驻 | **OpenClaw 完胜** |
| CI/CD 集成 | Channels 推送 CI 结果 | — | 可通过 subagent + webhook 实现 | 持平 |
| 安全控制 | allowlist + Team 策略 | — | DM pairing + 沙箱 + Agent 白名单 | **OpenClaw 更成熟** |

**评估结论**：Claude Code 的 Channels 和计划任务功能与 OpenClaw 高度重叠，但 OpenClaw 在每个维度都显著更强。Channels 本质上是把消息平台能力塞进 Claude Code CLI，而 OpenClaw 天生就是消息平台优先的架构。计划任务方面，Claude Code 的 session-scoped 限制使其只能用于临时任务，而 OpenClaw 的 cron 是系统级持久化的。

### 5. 何时值得深入学习
- **现在**：不需要。OpenClaw 已完全覆盖且远超这两个功能
- **如果开始用 Claude Code CLI 做开发**：`/loop` 有一定实用价值（盯构建、看部署状态），但功能有限
- **注意**：Claude Code 的计划任务是 research preview，API 可能频繁变化

---

## 五、四篇教程综合评估

### 1. 与 OpenClaw 的重叠度总览

| 教程 | 重叠度 | OpenClaw 替代方案 | 评估 |
|------|--------|-----------------|------|
| **CC-08 Plugins** | 🟡 中等 | Skills + Extensions + ClawHub | OpenClaw 更成熟，Plugin 生态早期 |
| **CC-09 Agent-SDK** | 🟢 低 | Subagent + cron + Gateway | 不同层面，可互补 |
| **CC-12 Remote Control** | 🔴 高 | 飞书/Telegram 消息平台 | OpenClaw 天然覆盖 |
| **CC-13 Channels+计划任务** | 🔴 高 | 消息平台 + cron + qqbot_remind | OpenClaw 远超 |

### 2. 认知储备要点

**值得记住的**：
1. **Plugin manifest 模式**：标准化扩展包的元数据描述，未来设计 OpenClaw Skill 包时可参考
2. **Agent SDK 的 query() API**：编程控制 AI Agent 的模式，如果需要将 AI 能力嵌入自定义程序，这是最直接的方式
3. **Channels vs Remote Control 的区分**：「外部事件推入」vs「你远程接管」，这个概念模型在架构设计中有参考价值
4. **`/loop` 的轻量级设计**：session 内定时轮询，不持久化，7 天过期——一种安全的临时任务模式

**可以忽略的**：
- Plugin Marketplace 的具体使用（我们用 OpenClaw Skills）
- Agent SDK 的详细安装步骤（用到时再看）
- Remote Control 的三种启动方式（我们用飞书/Telegram）
- Channels 的 Telegram/Discord 配置（OpenClaw 已有）

### 3. 「何时值得深入学习」判断矩阵

| 条件 | CC-08 Plugins | CC-09 Agent-SDK | CC-12 Remote | CC-13 Channels |
|------|:---:|:---:|:---:|:---:|
| 当前（已用 OpenClaw） | ❌ | ❌ | ❌ | ❌ |
| 开始深度用 Claude Code CLI | ⚠️ | ✅ | ⚠️ | ⚠️ |
| 需要 CI/CD 集成 Claude | ❌ | ✅ | ❌ | ⚠️ |
| 需要编程控制 AI Agent | ❌ | ✅ | ❌ | ❌ |
| 团队标准化 Claude Code 能力 | ✅ | ⚠️ | ❌ | ❌ |

### 4. 最终结论

**四个领域对当前 OpenClaw 用户的价值排序**：

1. **Agent-SDK**（最有长期价值）：编程控制 AI 的能力，与 OpenClaw 互补而非替代
2. **Plugins**（设计理念有价值）：manifest + 打包分发的模式值得借鉴
3. **Remote Control**（已被 OpenClaw 覆盖）：概念清晰但功能冗余
4. **Channels+计划任务**（完全被 OpenClaw 覆盖）：OpenClaw 在每个维度都更强

**行动建议**：当前不需要任何落地行动。如果未来开始深度使用 Claude Code CLI，优先学习 Agent-SDK。
