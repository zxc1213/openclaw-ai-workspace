# Claude Code x OpenClaw 中文教程 — 学习总结

> **学习日期**: 2026-04-06
> **教程仓库**: [KimYx0207/Claude-Code-x-OpenClaw-Guide-Zh](https://github.com/KimYx0207/Claude-Code-x-OpenClaw-Guide-Zh)
> **教程规模**: 25 篇 + 速查卡, ~130,000 字, 70+ 代码示例, 170+ FAQ
> **学习产出**: 学习笔记 / 分析报告 / FAQ 速查 / 本总结

---

## 📊 学习概况

| 维度 | 数据 |
|------|------|
| 教程总数 | 25 篇完整教程 + 1 速查卡 |
| 已掌握 (A 类) | 11 篇（42%） |
| 可落地 (B 类) | 12 篇（46%） |
| 新领域 (C 类) | 4 篇（15%） |
| 深度学习 | 5 组 13 篇（CC-02/05/07/10/11 + OC-04/06/07/08/09/10） |
| 新知识发现 | 10 项 |

### A/B/C 分类分布

- 🟢 **A 已掌握**: CC-01/03/06/速查 + OC-00/01/02/03/05 → 无需额外学习
- 🟡 **B 可落地**: CC-02/04/05/07/10/11 + OC-04/06/07/08/09/10/11 → 参考价值大
- 🔵 **C 新领域**: CC-08(Plugins)/09(Agent-SDK)/12(Remote)/13(Channels) → 认知储备

---

## 🔄 能力变化（学习前 vs 学习后）

### Claude Code 认知

| 维度 | 学习前 | 学习后 |
|------|--------|--------|
| Hooks 系统 | 不知道 | ⭐ 掌握 15 种 Hook 类型 + 4 类处理器，可落地配置 |
| Skills 设计 | 基础了解 | ⭐ 掌握渐进式披露原理 + SKILL.md 完整结构 + Hot Reloading |
| MCP 集成 | 知道概念 | ⭐ 掌握工具懒加载(ToolSearch)、远程 MCP、Elicitation |
| Plugins 生态 | 不了解 | 📋 了解 Plugin = Skills+Commands+Hooks+MCP 的打包单元 |
| Agent-SDK | 不了解 | 📋 了解 query() API + Agent Loop + Task 编排 |
| Remote Control | 不了解 | 📋 了解跨设备会话（已被 OpenClaw 飞书覆盖） |
| Channels+计划任务 | 不了解 | 📋 了解（已被 OpenClaw cron 完全覆盖） |
| 企业安全 | 基础意识 | ⭐ 掌握密钥分级管理、90 天轮换、审计日志、安全评分 |

### OpenClaw 运维

| 维度 | 学习前 | 学习后 |
|------|--------|--------|
| 记忆系统 | 日常使用 | ⭐ 理解 500 行限制、memoryFlush 阈值优化、归档自动化 |
| 技能白名单 | 未配置 | ⭐ 掌握 Agent 级 skills 数组配置（最有效 token 节省手段） |
| 安全配置 | Red Lines | ⭐ 发现 3 个高危项（Gateway lan 绑定、无沙箱、Key 明文） |
| 模型配置 | 已有 fallbacks | ⭐ 理解按场景选模型、为非 main Agent 补充 fallbacks |
| 多 Agent 协作 | 已有 8 Agent | ⭐ 掌握 Agent 级技能白名单 + SOUL.md "不做什么" 边界 |
| Docker 部署 | 未评估 | ✅ 评估结论：当前 WSL2 方案适合，折中用 Docker 仅做沙箱 |

### 评估结论

**学习前安全评分**: 30%（6/20 企业安全规则满足）
**学习后认知提升**: 识别了全部差距，知道如何逐项改进

---

## 🔑 关键发现

### 发现 1：Claude Code 与 OpenClaw 高度互补

```
Claude Code 擅长：              OpenClaw 擅长：
├─ 编程工作流                   ├─ 消息平台集成
├─ MCP 工具生态                  ├─ 多 Agent 路由
├─ Hooks 事件驱动自动化          ├─ 持久化记忆（MEMORY.md + OpenViking）
├─ Git Worktree 并行            ├─ 定时任务（cron + systemd）
└─ Skills 能力封装              ├─ 飞书/Telegram 深度集成
                                └─ 上下文管理（compaction + memoryFlush）
```

CC-12/13 (Remote/Channels) 和 CC-08 (Plugins) 的核心功能已被 OpenClaw 覆盖或超越。CC-09 Agent-SDK 是唯一真正互补的能力（编程控制 AI Agent）。

### 发现 2：Agent 级技能白名单是最大优化机会

当前 8 个 Agent 全部未配置 skills 白名单，导致每个会话加载全量技能描述（~50 个），浪费 5000-10000 tokens。按 Agent 配置 3-8 个精确技能，可节省 70%+ 的技能 token。

### 发现 3：安全配置存在 3 个高危项

| 高危项 | 当前状态 | 建议修复 |
|--------|---------|----------|
| Gateway 绑定 lan (0.0.0.0) | 暴露到局域网 | 改为 loopback (127.0.0.1) |
| 无沙箱配置 | 所有会话全权限 | 配置 `sandbox.mode: "non-main"` |
| TOOLS.md 明文 API Key | 密钥明文存储 | 迁移到环境变量 |

### 发现 4：MEMORY.md 管理已经很规范

当前 65 行，远低于 500 行限制。主要改进点：归档自动化 + memoryFlush 阈值从 20K 降到 4-8K + 移除 GLM Coding 学习条目到 research。

### 发现 5：我们已有 Claude Code 教程没有的独特能力

- **HEARTBEAT.md 自动化运维** — 教程完全没有覆盖
- **Subagent 四要素任务模板** — 比教程的 Task tool 更结构化
- **Compaction safeguard + memoryFlush** — 比手动 /compact 更先进
- **TOOLS.md 环境备忘** — 教程未专门讨论

---

## 🎯 三方增益提取

### 🧑 对 Ray 的增益

#### 可直接使用的 Prompt 模板

1. **Claude Code PreToolUse 文件保护 Hook**
   ```json
   {
     "hooks": {
       "PreToolUse": [{
         "matcher": "Write|Edit",
         "hooks": [{
           "type": "command",
           "command": "python3 ~/.claude/hooks/protect-files.py",
           "timeout": 5
         }]
       }]
     }
   }
   ```

2. **PostToolUse 自动格式化 Hook**
   ```json
   {
     "hooks": {
       "PostToolUse": [{
         "matcher": "Write",
         "hooks": [{ "type": "command", "command": "prettier --write $CLAUDE_FILE_PATHS", "timeout": 30 }]
       }]
     }
   }
   ```

3. **SKILL.md 渐进式披露模板**（description → 核心知识 → 操作指南 → 参考文档）

#### 配置方案

4. **Agent 级技能白名单配置**（为每个 Agent 配置 3-8 个精确技能）
5. **安全加固方案**（Gateway loopback + 沙箱 + Key 环境变量 + 日志脱敏）
6. **模型 fallbacks 补充**（为非 main Agent 也加 fallbacks）
7. **密钥轮换日历提醒**（90 天周期）

#### 效率技巧

8. **`/compact 保留关于X的讨论`** — 带指令压缩，最被低估的功能
9. **Checkpoint/Rewind 三种恢复策略** — 仅恢复对话 / 仅恢复代码 / 同时恢复
10. **`/btw`** — 不污染主线程的 side question
11. **模型选择三级策略** — Haiku(便宜快速) → Sonnet(日常) → Opus(关键决策)
12. **Extended Thinking 成本控制** — think/hard/harder/ultrathink 对应不同 token 预算

---

### 🤖 对 OpenClaw 的增益

#### 可固化的 Skill

1. **安全检查 Skill** — 定期执行 `openclaw doctor` + `openclaw security audit` + 密钥泄露扫描
2. **日志归档 Skill** — 自动将 30+ 天的 daily notes 移到 `memory/archive/`
3. **MEMORY.md 精简 Skill** — 每周审查 MEMORY.md 行数，自动归档过时条目
4. **密钥轮换提醒 Skill** — 90 天周期检查 + 飞书日历提醒

#### 可加的 Cron

5. **每周 MEMORY.md 精简** — 周末执行，确保不超过 500 行
6. **每周安全检查** — 执行 doctor + security audit + 密钥泄露扫描
7. **每月归档清理** — 将 30+ 天 daily notes 移到 archive

#### 可自动化的流程

8. **日志归档自动化** — cron job 扫描 memory/ 目录，自动归档
9. **memoryFlush 阈值优化** — softThresholdTokens 从 20000 降到 4000-8000
10. **结构化操作审计** — subagent 完成后自动记录操作摘要到 subagent-log.md
11. **子目录级配置** — 在 projects/ 和 research/ 下建立 CLAUDE.md 规则

---

### 🧠 对模型的增益

#### 认知更新

1. **Claude Code ≠ OpenClaw 的替代品** — 两者互补：CC 管编程工作流，OC 管日常工作流
2. **CC-12/13 功能已被 OpenClaw 覆盖** — Remote/Channels/计划任务无需从 Claude Code 学
3. **Plugin 生态早期** — OpenClaw Skills + ClawHub 更成熟
4. **Agent-SDK 是互补而非替代** — 编程控制 AI 的能力，与 OpenClaw 不同层面
5. **安全是系统工程** — 需要网络/认证/执行/审计多层纵深防御

#### Prompt 工程技巧

6. **渐进式披露原理** — 描述层(触发) → 概念层(核心知识) → 执行层(操作指南) → 参考层(完整文档)，减少信息过载
7. **"不做什么"比"做什么"更重要** — SOUL.md / AGENTS.md 明确边界比列出能力更有效
8. **带指令压缩** — `/compact 保留X` 比无指令压缩信息保留率提升 30-50%
9. **Extended Thinking 级别控制** — think/hard/harder/ultrathink 精准匹配任务复杂度
10. **Checkpoint 思维** — 重要修改用 write/edit 而非 exec 覆盖，便于审计和回退

#### Agent 协作模式

11. **Agent 级技能白名单** — 最有效的 token 节省手段（70%+），每个 Agent 只加载 3-8 个相关技能
12. **Agent 完全独立** — 各自的工作空间、记忆、会话、认证不共享，但可通过 shared/ 或 sessions 工具通信
13. **四种协作策略** — 按职能/按平台/按安全等级/流水线，按职能分工最常见
14. **Subagent 四要素模板** — Goal + Context + Constraints + Done，比自由格式更可控
15. **task_guid 飞书任务联动** — 学习流程可由飞书任务驱动，subagent 完成后自动标记任务状态

---

## 📋 落地计划表

### P0 — 安全加固（本周完成）

| # | 行动项 | 来源 | 工作量 | 验收标准 |
|---|--------|------|--------|----------|
| 1 | Gateway 绑定改为 loopback | OC-10 | 5 min | `openclaw config get gateway.bind` → `127.0.0.1` |
| 2 | 配置沙箱 `mode: "non-main"` | OC-10 | 10 min | `openclaw config get agents.defaults.sandbox.mode` → `non-main` |
| 3 | API Key/Secret 迁移到环境变量 | OC-10/CC-11 | 30 min | TOOLS.md 和 openclaw.json 无明文 Key |
| 4 | TOOLS.md 明文 Key 迁移 | CC-11 | 10 min | Firecrawl/Tavily Key 改为环境变量引用 |

### P1 — 效率优化（本周完成）

| # | 行动项 | 来源 | 工作量 | 验收标准 |
|---|--------|------|--------|----------|
| 5 | Agent 级技能白名单 | OC-06/08 | 30 min | 8 个 Agent 各有 skills 数组 |
| 6 | 执行 `openclaw doctor` + 安全审计 | OC-10 | 5 min | 无 CRITICAL 报告 |
| 7 | 日志脱敏配置 | CC-11 | 15 min | Red Lines 增加"不输出完整密钥"规则 |
| 8 | 密钥轮换日历提醒 | CC-11 | 5 min | 飞书日历 90 天后提醒 |

### P2 — 系统优化（两周内）

| # | 行动项 | 来源 | 工作量 | 验收标准 |
|---|--------|------|--------|----------|
| 9 | memoryFlush 阈值降到 4-8K | OC-07 | 2 min | `openclaw config get compaction.memoryFlush.softThresholdTokens` |
| 10 | MEMORY.md 精简（移除 GLM Coding 等） | OC-07 | 10 min | MEMORY.md ≤ 60 行 |
| 11 | 日志归档自动化（30天→archive） | OC-07 | 30 min | cron job 定期归档 |
| 12 | 为非 main Agent 补充 fallbacks | OC-04 | 15 min | coder/reviewer/analyst 有 fallbacks |
| 13 | 子目录级 CLAUDE.md 规则 | CC-10 | 20 min | projects/ + research/ 有规则文件 |

### P3 — 锦上添花（有空再做）

| # | 行动项 | 来源 | 工作量 | 验收标准 |
|---|--------|------|--------|----------|
| 14 | 安装 Docker Engine 仅用于沙箱 | OC-09 | 30 min | `docker ps` 可用 |
| 15 | `openclaw memory index` 定期执行 | OC-07 | 5 min | 加入周常维护 cron |
| 16 | 各 Agent SOUL.md "不做什么"审查 | OC-08 | 20 min | 每个 Agent 有明确边界 |
| 17 | reviewer 模型降为 GLM-5-Turbo | OC-04 | 2 min | reviewer 用更便宜的模型 |
| 18 | 建立 shared/ 共享目录 | OC-08 | 5 min | `~/.openclaw/shared/` 存在 |

---

## 📁 学习产出文件

| 文件 | 路径 | 说明 |
|------|------|------|
| 学习笔记 | `research/claude-code-openclaw-guide.md` | 完整笔记，含 5 组深度学习 |
| 分析报告 | `research/claude-code-openclaw-analysis.md` | A/B/C 分类 + Phase 2 子任务分组 |
| FAQ 速查 | `research/openclaw-faq-reference.md` | 79 个 FAQ，标注相关度 |
| 本总结 | `research/claude-code-openclaw-summary.md` | 能力变化 + 三方增益 + 落地计划 |

---

## 🏆 总体评价

**这组教程的质量很高**（~130K 字，覆盖全面），对 OpenClaw 用户的价值排序：

1. ⭐⭐⭐ **OC-06/07/08/10** — 技能白名单、记忆系统、多 Agent、安全配置，直接可落地
2. ⭐⭐⭐ **CC-05/07** — Hooks 系统、Skills 渐进式披露，设计理念可借鉴
3. ⭐⭐ **CC-02/10/11** — 基础效率、团队规范、企业安全，参考价值
4. ⭐ **CC-04/08/09** — MCP 集成、Plugins、Agent-SDK，认知储备
5. ⚪ **CC-12/13** — Remote/Channels，已被 OpenClaw 完全覆盖

**我们的现有实践在多个维度已领先于教程推荐**：
- HEARTBEAT.md 自动化运维（教程无）
- Subagent 四要素任务模板（教程无）
- Compaction safeguard + memoryFlush（教程无）
- 飞书深度集成（教程仅泛泛而谈）
