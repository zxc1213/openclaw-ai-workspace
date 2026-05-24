# OpenCLI Agent Skills 集成方案分析

> 2026-04-07 | 聚焦 AI Agent 集成模式，与 OpenClaw skill 机制对比

## 1. 架构概述

OpenCLI 的 Agent Skills 机制是一个**面向 AI Coding Agent（Claude Code、Cursor）的指令集注入系统**，核心目标是让 AI Agent 通过阅读 SKILL.md 文件来获得操作浏览器、发现 API、编写适配器、调用 CLI 命令的能力。

**核心理念**：SKILL.md 是给 AI Agent 读的「操作手册」，不是给人读的文档。

```
OpenCLI Skills 架构
├── skills/                    # Agent Skills（SKILL.md 格式）
│   ├── opencli-operate/       # 浏览器自动化操作指令
│   ├── opencli-explorer/      # 适配器探索式开发指南
│   ├── opencli-oneshot/       # 单点快速 CLI 生成模板
│   ├── opencli-usage/         # 命令参考手册
│   ├── opencli-repair/        # 适配器自修复指南
│   └── smart-search/          # 智能搜索路由器（含 references/）
├── clis/                      # 运行时适配器（YAML/TS）
│   ├── <site>/<name>.yaml     # 声明式适配器
│   └── <site>/<name>.ts       # 编程式适配器
└── npx skills add             # 安装机制（注入到 Claude Code / Cursor）
```

## 2. Skill 发现机制

### 2.1 安装方式：`npx skills add`

```bash
npx skills add jackwener/opencli              # 安装全部 skills
npx skills add jackwener/opencli --skill xxx  # 安装指定 skill
```

`npx skills` 是一个独立的 npm 工具（非 OpenCLI 自身），负责将 `skills/` 目录下的 SKILL.md 复制到 AI Agent 的 skills 目录中。**这是 Claude Code 的 skills 约定**，Claude Code 会在启动时扫描特定目录下的 SKILL.md 文件。

### 2.2 发现方式

OpenCLI 的 skill 发现依赖于 **AI Agent 自身的 skill 发现机制**，而非 OpenCLI 自己实现：

| Agent | 发现机制 | 配置位置 |
|-------|---------|---------|
| **Claude Code** | 扫描 `~/.claude/skills/` 或项目内 `.claude/skills/` 下的 SKILL.md | CLAUDE.md 或自动扫描 |
| **Cursor** | 扫描 `.cursor/skills/` 或 AGENT.md 中引用 | `.cursorrules` / `AGENT.md` |
| **Codex** | 扫描项目 `.codex/skills/` | 自动扫描 |

关键点：**OpenCLI 本身不实现 skill 发现/注册引擎**，它只是按照各 AI Agent 的约定格式编写 SKILL.md，然后通过 `npx skills add` 工具安装到正确位置。

### 2.3 AGENT.md / .cursorrules 的角色

README 中明确提到：

> 在 `AGENT.md` 或 `.cursorrules` 中配置 `opencli list`，AI 即可自动发现并调用所有可用工具。

这意味着 AGENT.md / .cursorrules 的作用是**引导 AI Agent 在运行时执行 `opencli list` 来发现可用命令**，而非硬编码命令列表。这是一种**运行时发现模式**：

```
Agent 启动 → 读取 AGENT.md → 看到 "run opencli list" → 执行命令 → 获得可用 CLI 列表 → 按需调用
```

## 3. Skill 格式规范

### 3.1 SKILL.md 结构

```yaml
---
name: skill-name
description: 触发描述（Agent 用此字段判断是否加载）
tags: [keyword1, keyword2]          # 可选标签
allowed-tools: Bash(opencli:*), Read, Edit, Write  # 可选权限声明
version: 1.0                        # 可选
---

# Skill 标题

正文指令内容...
```

- **Frontmatter**：`name`（必填）、`description`（必填，触发条件）、`tags`/`allowed-tools`/`version`（可选）
- **Body**：Markdown 格式的操作指令，写给 AI Agent 读

### 3.2 关键设计模式

| 模式 | 说明 | 示例 |
|------|------|------|
| **操作手册式** | 给 Agent 逐步操作指令 | `opencli-operate`：先 open 再 state 再 click |
| **模板式** | 提供代码模板，Agent 填参数 | `opencli-oneshot`：Tier 1/2/3/4 模板 |
| **路由器式** | Agent 根据规则做决策 | `smart-search`：选 AI 源 → 查帮助 → 执行 |
| **诊断式** | 指导 Agent 排错修复 | `opencli-repair`：收集诊断 → 分析 → 修复 |

### 3.3 渐进式信息加载

```
Level 1: description（始终在上下文中，~100 词）
Level 2: SKILL.md body（触发后加载，<5k 词）
Level 3: references/（按需加载，无限制）
```

这与 Claude Code 的 skill 加载模型一致。

## 4. 命令注册方式（与 Skills 的关系）

OpenCLI 有**两层注册机制**，它们服务于不同目的：

### 4.1 适配器注册（运行时 CLI 命令）

```
clis/<site>/<name>.yaml  或  clis/<site>/<name>.ts
  → Dynamic Loader 扫描
  → 注册到 globalThis.__opencli_registry__
  → 用户可执行 opencli <site> <command>
```

**这是给人类和 Agent 共同使用的 CLI 命令**。

### 4.2 Skill 注册（AI Agent 指令集）

```
skills/<skill-name>/SKILL.md
  → npx skills add 安装到 ~/.claude/skills/ 或 .cursor/skills/
  → AI Agent 扫描发现
  → 按 description 触发加载
```

**这是专门给 AI Agent 的操作指南**。

### 4.3 两者的关系

Skills 是适配器的「元层」——Skills 教 AI Agent 如何创建、使用、修复适配器：

```
Skills（教 Agent 如何做事）  →  适配器（实际执行的事）
  opencli-explorer 教如何创建  →  clis/*/ 里的适配器
  opencli-operate 教如何操作   →  浏览器自动化命令
  opencli-usage 列出可用命令   →  opencli list 的文档版
  opencli-repair 教如何修复    →  适配器故障恢复
```

## 5. 与 OpenClaw Skill 机制对比

### 5.1 格式对比

| 维度 | OpenCLI Skills | OpenClaw Skills |
|------|---------------|-----------------|
| **文件格式** | SKILL.md（YAML frontmatter + Markdown） | SKILL.md（YAML frontmatter + Markdown） |
| **frontmatter 必填字段** | `name`, `description` | `name`, `description` |
| **可选字段** | `tags`, `allowed-tools`, `version` | 无标准可选字段（OpenClaw 由系统注入） |
| **目录结构** | `skill-name/SKILL.md` + `references/` | `skill-name/SKILL.md` + `scripts/` + `references/` + `assets/` |
| **资源文件** | `references/`（参考文档） | `scripts/` + `references/` + `assets/` |

**结论：格式高度一致**，OpenClaw 的 skill 格式比 OpenCLI 更完善（多了 scripts/ 和 assets/ 目录约定），但核心规范（SKILL.md + frontmatter + body）完全相同。

### 5.2 发现方式对比

| 维度 | OpenCLI Skills | OpenClaw Skills |
|------|---------------|-----------------|
| **发现引擎** | 依赖 AI Agent 自带（Claude Code 扫描目录） | OpenClaw Gateway 运行时扫描 |
| **安装方式** | `npx skills add`（外部工具） | `openclaw skill install` / 手动放入 skills/ |
| **加载时机** | Agent 启动时扫描 metadata，触发时读 body | 系统启动时扫描 metadata，注入 `<available_skills>` 到 system prompt |
| **触发机制** | Agent 自行判断（基于 description） | 系统注入 description 列表，Agent 选择后由系统加载 |
| **AGNET.md 角色** | 引导 Agent 执行 `opencli list` | AGENTS.md 定义工作区规范和 subagent 规范 |

**关键差异**：
- **OpenCLI**：被动模式——写好 SKILL.md 放到正确位置，Agent 自己决定何时加载
- **OpenClaw**：主动模式——系统将所有 skill 的 description 注入 system prompt 的 `<available_skills>` 中，Agent 看到后选择读取

### 5.3 权限模型对比

| 维度 | OpenCLI Skills | OpenClaw Skills |
|------|---------------|-----------------|
| **权限声明** | `allowed-tools` frontmatter 字段（可选） | 工具级权限（系统配置，非 skill 声明） |
| **执行权限** | Agent 通过 Bash 执行 `opencli` 命令 | Agent 直接调用 OpenClaw 工具（无需 Bash） |
| **工具来源** | 外部 CLI 工具（`opencli`） | 内置工具系统（feishu_*、browser、exec 等） |
| **安全边界** | 依赖 Agent 自身的 Bash 执行策略 | OpenClaw 系统级安全策略（safeguard compaction、高危操作确认） |

**关键差异**：
- **OpenCLI**：通过 Bash 调用外部 CLI，权限由 Agent 平台（Claude Code/Cursor）的 Bash 策略控制
- **OpenClaw**：内置工具系统，有系统级权限管理和安全策略

### 5.4 AI Agent 集成方式对比

| 维度 | OpenCLI Skills | OpenClaw Skills |
|------|---------------|-----------------|
| **目标 Agent** | Claude Code、Cursor、Codex | OpenClaw 自身 Agent 系统 |
| **集成方式** | 文件级（SKILL.md + AGENT.md） | 系统级（skill 插件注册 + system prompt 注入） |
| **运行时能力** | 通过 `opencli` CLI 命令 | 通过内置工具（browser、exec、feishu_* 等） |
| **上下文管理** | 依赖 Agent 自身的 compaction | OpenClaw compaction + memoryFlush + postCompactionSections |
| **多 Agent 协作** | 无原生支持 | subagent 派发、sessions_spawn |

### 5.5 设计哲学对比

| 维度 | OpenCLI | OpenClaw |
|------|---------|----------|
| **定位** | CLI 工具的 AI Agent 指令层 | 全功能 AI Agent 平台 |
| **Skill 角色** | 操作指南（教 Agent 用 CLI） | 能力扩展（给 Agent 新能力） |
| **运行时** | Node.js CLI | Gateway 守护进程 |
| **状态管理** | 无状态 CLI | 有状态（session、memory、compaction） |
| **浏览器集成** | 通过 Chrome Extension + Daemon | 内置 browser 工具 + CDP |
| **消息通道** | 无（纯 CLI） | 多通道（飞书、Telegram、QQ、webchat） |

## 6. 核心洞察

### 6.1 OpenCLI 的 Skill 设计很聪明

1. **零运行时成本**：Skill 只是 Markdown 文件，不消耗 LLM tokens（只在触发时才加载 body）
2. **运行时发现**：通过 `opencli list` 让 Agent 动态发现可用命令，而非硬编码
3. **分层架构**：Skills 教 Agent 如何创建适配器，适配器执行实际任务——clean separation
4. **渐进式加载**：description → SKILL.md → references/，三层加载避免上下文爆炸

### 6.2 OpenClaw 的优势

1. **系统级集成**：skill 不依赖外部 CLI，直接使用内置工具
2. **多通道支持**：skill 可以被飞书/Telegram/QQ 等多种渠道的 Agent 使用
3. **状态持久化**：memory、session、compaction 提供了 OpenCLI 没有的上下文管理能力
4. **Subagent 协作**：复杂任务可以拆分给 subagent，OpenCLI 没有类似机制

### 6.3 可借鉴之处

1. **运行时命令发现模式**：OpenClaw 的 skill 是静态注册的，可以考虑类似 `opencli list` 的动态发现机制
2. **allowed-tools 声明**：在 SKILL.md frontmatter 中声明 skill 需要的工具权限，方便安全审计
3. **repair skill 模式**：OpenCLI 的 `opencli-repair` 是一个有趣的自修复模式——当适配器坏了，Agent 自动诊断和修复

## 7. 总结

OpenCLI 的 Agent Skills 本质上是**面向 Claude Code / Cursor 等第三方 AI Agent 的 Markdown 指令集**，它不实现自己的 skill 引擎，而是遵循各 Agent 平台的约定（SKILL.md 格式 + 目录扫描）。

OpenClaw 的 skill 机制则是一个**完整的内置能力扩展系统**，从发现、加载、权限到执行全链路控制。

两者在 SKILL.md 格式上高度一致（都有 YAML frontmatter + Markdown body 的三层加载模型），但在系统集成的深度上差异显著：OpenCLI 是「寄生式」的（依赖宿主 Agent），OpenClaw 是「原生式」的（内置能力）。
