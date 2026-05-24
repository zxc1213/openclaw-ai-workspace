# HarnessKit-zh 全量扫描与分类报告

> 生成时间: 2026-05-03 16:56 CST  
> 版本: hk 1.3.1 (中文版)  
> 来源: https://github.com/649875367zh-ship-it/harnesskit-zh  
> 原版: https://github.com/RealZST/HarnessKit  
> License: Apache-2.0

---

## 一、项目概述

HarnessKit 是一个**AI Agent 扩展统一管理中心**，支持桌面端 (macOS)、CLI 和 Web 模式。中文版 (harnesskit-zh) 在原版基础上增加了 OpenClaw、Hermes 等额外 Agent 支持。

**核心定位**: 管理多个 AI 编码 Agent 的扩展、配置、记忆、规则和安全审计。

**支持的 Agent**: Claude Code, Codex, Gemini CLI, Cursor, Antigravity, Copilot, Windsurf, Hermes, OpenClaw (中文版独有)

**支持的扩展类型**: Skills, MCP Servers, Plugins, Hooks, Agent-first CLI

---

## 二、功能模块逐项分析与分类

### 分类标准

| 档位 | 定义 | 含义 |
|:---:|------|------|
| **A** | OpenClaw 已有类似能力 | 功能重复，无需迁移 |
| **B** | 可落地且有增量价值 | 值得借鉴或集成 |
| **C** | 新领域需评估 | 暂无对应能力，需评估是否需要 |

---

### 2.1 扩展管理 (Extension Management)

| # | 功能模块 | 描述 | 分类 | 理由 |
|:-:|---------|------|:----:|------|
| 1 | **Skills 管理** | 发现、安装、启用/禁用 Skills | **A** | OpenClaw 已有完整的 Skill 目录管理 (`openclaw skills check/install/...`)，功能覆盖 |
| 2 | **MCP Server 管理** | 浏览 Smithery 注册表，安装/管理 MCP | **A** | OpenClaw 已有 MCP 配置管理能力，通过 gateway config 管理 |
| 3 | **Plugin 管理** | 管理 Claude Code 插件 | **A** | OpenClaw 的 Skill 体系本质上已涵盖 Plugin 功能 |
| 4 | **Hooks 管理** | 管理 Agent 的钩子脚本 | **A** | OpenClaw 自身不需要 hooks（自有完整生命周期管理） |
| 5 | **Agent-first CLI 管理** | 发现和安装 Agent 专用 CLI 工具 | **B** | OpenClaw 无专门的 CLI 扩展市场，但已有 TOOLS.md 中的工具笔记 |
| 6 | **跨 Agent 部署** | 一键将扩展部署到多个 Agent | **B** | OpenClaw 当前只管理自身，不管理其他 Agent 的扩展。如 Ray 同时使用 Claude Code / Codex 等，此功能有增量价值 |
| 7 | **扩展包 (Packs)** | 同一仓库的扩展自动归类，批量管理 | **A** | OpenClaw 的 Skill 目录已按目录结构组织，类似效果 |

### 2.2 Agent 配置管理 (Agent Config Management)

| # | 功能模块 | 描述 | 分类 | 理由 |
|:-:|---------|------|:----:|------|
| 8 | **配置文件追踪** | 自动发现各 Agent 的全局/项目级配置 | **B** | OpenClaw 管理自身配置 (gateway config)，但不追踪其他 Agent (如 Claude Code, Cursor) 的配置。对多 Agent 用户有增量价值 |
| 9 | **记忆管理** | 管理 Agent 的 Memory 文件 | **A** | OpenClaw 有完善的 MEMORY.md + daily notes + L1/L2 分层体系 |
| 10 | **规则管理** | 管理 Agent 的 Rules 文件 | **A** | OpenClaw 通过 AGENTS.md + rules/common/ 已有完整规则管理 |
| 11 | **忽略文件管理** | 管理 .ignore 文件 | **A** | OpenClaw 自身通过 workspace 结构管理 |
| 12 | **自定义路径追踪** | 为 Agent 面板添加自定义文件/文件夹 | **B** | OpenClaw 无此功能，但可通过 MEMORY.md / TOOLS.md 记录替代 |

### 2.3 安全审计 (Security Audit)

| # | 功能模块 | 描述 | 分类 | 理由 |
|:-:|---------|------|:----:|------|
| 13 | **18 项静态分析规则** | 对所有扩展执行安全扫描 | **B** | OpenClaw 有 security-briefing skill 但侧重信息通报，非代码级静态分析。HarnessKit 的 18 项规则扫描有参考价值 |
| 14 | **信任评分 (Trust Score)** | 0-100 分，分三档 | **B** | OpenClaw 无类似评分机制，但 skill-vetter 部分覆盖此需求 |
| 15 | **权限透明** | 5 维度展示权限（文件系统、网络、Shell、数据库、环境变量） | **B** | OpenClaw 的安全边界靠 AGENTS.md 约定，无程序化权限扫描 |
| 16 | **逐 Agent 扫描** | 同一扩展在不同 Agent 上独立审计 | **A** | OpenClaw 不管理其他 Agent，此功能对其无意义 |
| 17 | **一键审计** | 全量安全扫描 | **A** | OpenClaw 已有 `openclaw skills check` 审计能力 |

### 2.4 市场生态 (Marketplace)

| # | 功能模块 | 描述 | 分类 | 理由 |
|:-:|---------|------|:----:|------|
| 18 | **skills.sh 技能注册表** | 浏览并安装技能 | **A** | OpenClaw 有自己的 Skill 发现和安装机制 |
| 19 | **Smithery MCP 注册表** | 浏览 MCP 服务器 | **B** | OpenClaw 的 MCP 管理不依赖 Smithery，但作为发现渠道有价值 |
| 20 | **Agent-first CLI 市场** | 发现 Agent 专用 CLI | **C** | OpenClaw 无此概念，是扩展生态的新维度 |

### 2.5 Web UI (Web 模式)

| # | 功能模块 | 描述 | 分类 | 理由 |
|:-:|---------|------|:----:|------|
| 21 | **Web UI 服务器** | `hk serve` 提供完整 Web 界面 | **B** | OpenClaw 有 canvas 但定位不同（Agent 内部 UI），HarnessKit Web UI 是独立的可视化管理界面 |
| 22 | **远程访问** | 通过 SSH 隧道或 `--host 0.0.0.0` 远程访问 | **B** | OpenClaw 的 canvas 可通过 gateway 暴露，但无独立管理界面 |
| 23 | **多主题支持** | 浅色/深色/系统跟随 | **A** | UI 风格，非核心功能 |

### 2.6 CLI 工具 (CLI)

| # | 功能模块 | 描述 | 分类 | 理由 |
|:-:|---------|------|:----:|------|
| 24 | **hk status** | 状态总览 | **A** | OpenClaw 有 `openclaw gateway status` 等效功能 |
| 25 | **hk list** | 列出扩展（按类型/Agent 筛选） | **A** | OpenClaw 有 `openclaw skills check/list` |
| 26 | **hk info** | 查看扩展详情 | **A** | OpenClaw 可直接读 Skill 文件 |
| 27 | **hk audit** | 安全审计 | **B** | OpenClaw 有 `openclaw skills check` 但侧重不同 |
| 28 | **hk enable/disable** | 启用/禁用扩展 | **A** | OpenClaw 有 skill 管理能力 |
| 29 | **hk serve** | Web UI 服务 | **B** | 见 2.5 分析 |

### 2.7 用户体验 (UX)

| # | 功能模块 | 描述 | 分类 | 理由 |
|:-:|---------|------|:----:|------|
| 30 | **每日提示** | 概览仪表盘推送实用技巧 | **A** | OpenClaw 的 heartbeat 机制部分覆盖 |
| 31 | **活动流** | 实时捕获配置变更/安装/事件 | **A** | OpenClaw 通过 daily notes 记录活动 |
| 32 | **快捷操作** | 一键查看/审计/更新 | **A** | CLI 工具本身即快捷操作 |
| 33 | **原地管理** | 直接操作 Agent 原生目录 | **B** | 设计理念，非功能差异。OpenClaw 也采用此方式 |

---

## 三、分类汇总

| 分类 | 数量 | 占比 | 代表功能 |
|:----:|:----:|:----:|---------|
| **A - 已有类似能力** | 21 | 63.6% | Skills/MCP 管理、记忆/规则管理、CLI 命令、市场 |
| **B - 有增量价值** | 11 | 33.3% | 跨 Agent 部署、安全审计引擎、Web UI、权限透明、CLI 市场 |
| **C - 新领域** | 1 | 3.0% | Agent-first CLI 市场概念 |

### B 类详细评估

| 功能 | 增量价值 | 建议 |
|------|---------|------|
| 跨 Agent 部署 | ★★★★ | 如 Ray 同时用 Claude Code + OpenClaw，可统一管理。但 OpenClaw 的 Skill 体系更成熟，仅作为补充 |
| 安全审计引擎 (18 规则) | ★★★★ | 可参考其静态分析规则集，增强 OpenClaw 的 skill-vetter / security-briefing |
| 信任评分机制 | ★★★ | 有参考价值，但 OpenClaw 已有 skill-vetter |
| 权限透明 (5 维度) | ★★★ | 可借鉴到 OpenClaw 的安全审计流程 |
| Web UI | ★★★ | 独立可视化管理界面，适合非 CLI 偏好用户。但 OpenClaw 的 canvas 已能呈现 UI |
| Smithery MCP 市场 | ★★ | 作为 MCP 发现渠道有价值 |
| Agent-first CLI 市场 | ★★ | 新概念，值得观察生态发展 |

### C 类评估

| 功能 | 评估 | 建议 |
|------|------|------|
| Agent-first CLI 市场 | 新兴生态，目前规模小 | 观察期，暂不需要引入 |

---

## 四、WSL 跨平台访问解决方案

### 问题
`hk serve` 默认绑定 `127.0.0.1:7070`，WSL 内可访问但 Windows 宿主无法访问。

### 解决方案

```bash
# 方法 1: 绑定所有接口 (推荐)
hk serve --host 0.0.0.0 --port 7070
# Windows 浏览器访问: http://172.25.192.2:7070
# ⚠️ 会自动生成 access token，注意保管

# 方法 2: 指定端口 + 自定义 token
hk serve --host 0.0.0.0 --port 7070 --token "your-secret-token"

# 方法 3: WSL 端口转发 (如不想绑定 0.0.0.0)
# 在 Windows PowerShell (管理员) 中执行:
netsh interface portproxy add v4tov4 listenport=7070 listenaddress=0.0.0.0 connectport=7070 connectaddress=172.25.192.2
# 然后默认 hk serve 即可，Windows 通过 localhost:7070 访问
```

### 验证结果
✅ 实测 `hk serve --host 0.0.0.0` 在 WSL2 中成功绑定，Windows 侧可通过 `http://172.25.192.2:7070` 访问  
✅ 非 localhost 绑定时自动生成 Auth Token（如 `3501f86dc2968eaf523aa7a014021b4e`）

### 推荐做法
日常使用推荐**方法 1**，简单直接。如需固定 token，使用**方法 2**。

---

## 五、总结

### HarnessKit-zh 对 OpenClaw 的价值

1. **最大价值在安全审计引擎** — 18 项静态分析规则和信任评分机制值得借鉴，可增强 OpenClaw 的 skill-vetter
2. **跨 Agent 管理是差异化能力** — 如果 Ray 使用多个 AI Agent，HarnessKit 可作为统一管理入口
3. **Web UI 是不错的补充** — 但 OpenClaw 的 canvas + 飞书交互已形成完整闭环

### 不需要的部分
- Skills/MCP/Plugin 的基础管理 — OpenClaw 已覆盖且更成熟
- 记忆/规则管理 — OpenClaw 有更完善的体系
- 市场 — OpenClaw 有自己的 Skill 发现机制

### 建议行动
1. ✅ **保留 hk 安装** — 作为多 Agent 扩展管理的补充工具
2. ✅ **使用 hk serve --host 0.0.0.0** — 在 WSL 环境下提供 Web UI 访问
3. 🔍 **研究其安全审计规则集** — 考虑将部分规则集成到 OpenClaw 的 skill-vetter
4. ⏳ **观察 Agent-first CLI 市场** — 生态尚早期，持续关注

---

*Report generated by subagent harnesskit-scan*
