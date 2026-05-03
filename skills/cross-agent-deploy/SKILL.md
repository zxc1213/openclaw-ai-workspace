---
name: cross-agent-deploy
description: "Use when deploying an OpenClaw skill to Claude Code, Codex CLI, or other AI coding agents. Handles format adaptation, tool-reference removal, sensitive-info scrubbing, and target directory placement. Triggers: deploy skill to Claude, cross-agent deploy, export skill."
---

# Cross-Agent Skill Deployment

将 OpenClaw Skill 部署到其他 AI Agent（Claude Code、Codex CLI 等）的标准化流程。

## 目标 Agent 速查

| Agent | Skill 目录 | 配置格式 | MCP 格式 |
|-------|-----------|---------|---------|
| Claude Code | `~/.claude/skills/<name>/SKILL.md` | YAML frontmatter + MD | JSON `mcpServers` |
| Codex CLI | `~/.agents/skills/<name>/SKILL.md` | YAML frontmatter + MD | TOML `[mcp_servers]` |
| Gemini CLI | `~/.gemini/skills/<name>/SKILL.md` | YAML frontmatter + MD | JSON `mcpServers` |
| Cursor | `~/.cursor/skills/<name>/SKILL.md` | YAML frontmatter + MD | JSON (VS Code) |

## 部署流程

### Step 1: 预检 — 源 Skill 评估

```
1. 读取源 SKILL.md 全文
2. 检查是否有辅助文件（脚本、参考文档）
3. 标记 OpenClaw 专有内容（见下方清单）
4. 评估 Skill 类型：
   - ✅ 纯知识/参考类 → 通常可直接部署
   - ⚠️ 流程类 → 需审查是否依赖 OpenClaw 工具
   - ❌ 深度集成类 → 不适合跨 Agent 部署
```

### Step 2: 内容适配

#### 2.1 必须移除的 OpenClaw 专有引用

| 模式 | 说明 | 处理 |
|------|------|------|
| `exec` 工具调用 | OpenClaw Shell 执行 | 移除或替换为目标 Agent 等价操作 |
| `message` 工具调用 | OpenClaw 消息通道 | 移除（目标 Agent 通常无此能力） |
| `canvas` 工具调用 | OpenClaw Canvas UI | 移除 |
| `gateway` 相关 | 配置/重启/restart | 移除 |
| `sessions_spawn` | OpenClaw 子会话 | 替换为目标 Agent 的子任务机制 |
| `process` 工具 | OpenClaw 进程管理 | 替换为标准 shell |
| 飞书/微信引用 | `feishu-*` 工具调用 | 移除 |
| `HEARTBEAT.md` 引用 | 心跳机制 | 移除 |
| `AGENTS.md` 约定 | OpenClaw 工作区规范 | 移除或泛化 |

#### 2.2 敏感信息清除

```
必须清除：
- API Keys（TOOLS.md 中的密钥）
- 内网地址（172.x.x.x 等）
- 用户个人信息（USER.md 内容）
- 项目特定路径和配置
- gateway token / Bearer token
- SSH 主机信息
```

#### 2.3 Frontmatter 适配

```yaml
# OpenClaw 格式（保留兼容字段）
---
name: skill-name
description: "Use when ..."    # 保留，格式通用
version: "1.0.0"              # 保留
---

# 如有 OpenClaw 专有字段需移除
# 不存在通用 frontmatter 标准，但 name + description 各 Agent 均支持
```

#### 2.4 路径引用适配

```
workspace/skills/ → 目标 Agent 的 skills 目录
memory/           → 移除或替换为目标 Agent 的记忆路径
AGENTS.md         → CLAUDE.md (Claude) / AGENTS.md (Codex)
```

### Step 3: 部署执行

```bash
# Claude Code
mkdir -p ~/.claude/skills/<name>/
cp SKILL.md ~/.claude/skills/<name>/
# 如有辅助文件一并复制

# Codex CLI
mkdir -p ~/.agents/skills/<name>/
cp SKILL.md ~/.agents/skills/<name>/

# 验证
cat ~/.claude/skills/<name>/SKILL.md | head -5
```

### Step 4: 部署后验证

1. 确认文件已就位且 frontmatter 格式正确
2. 确认无残留的 OpenClaw 专有工具引用
3. 确认无敏感信息泄露
4. 在目标 Agent 中触发该 Skill，验证基本功能

## 安全注意事项

### 各 Agent 安全模型差异

| 维度 | OpenClaw | Claude Code | Codex CLI |
|------|---------|-------------|-----------|
| 工具权限 | gateway 策略控制 | 用户确认 | sandbox 模式 |
| 文件访问 | 工作区限定 | 项目限定 | 项目限定 |
| 外部网络 | 代理配置 | 直连 | 直连 |
| 命令执行 | exec 工具 | terminal | sandboxed shell |

### 部署安全原则

1. **最小权限** — 只部署目标 Agent 能安全执行的 Skill
2. **无外部调用** — 移除依赖 OpenClaw 消息通道/通知的能力
3. **路径隔离** — 不在 Skill 中硬编码绝对路径
4. **信息隔离** — 不同 Agent 的配置不应互相引用

## 回滚策略

```bash
# 记录部署前的状态
ls -la ~/.claude/skills/<name>/ > /tmp/pre-deploy-<name>-$(date +%Y%m%d).txt

# 回滚：删除部署的 Skill
rm -rf ~/.claude/skills/<name>/

# 或恢复备份（如有）
cp -r /tmp/skill-backup-<name>/ ~/.claude/skills/<name>/
```

## 不适合跨 Agent 部署的 Skill

以下类型的 Skill 通常不适合导出：

- 依赖 `exec` 执行系统级命令的自动化 Skill
- 使用 `message`/`canvas` 的交互式 Skill
- 依赖 OpenClaw gateway 配置的基础设施管理 Skill
- 包含飞书/微信等特定通道集成的 Skill
- 引用 MEMORY.md / daily notes 的记忆依赖型 Skill

## 常见错误

| 问题 | 原因 | 修复 |
|------|------|------|
| 目标 Agent 不识别 Skill | frontmatter 格式错误 | 检查 YAML 语法 |
| Skill 加载但行为异常 | 残留 OpenClaw 工具引用 | 搜索 `exec`/`message`/`canvas` 关键词 |
| 敏感信息泄露 | 未清除 API Key | grep 密钥模式 |
| 路径不存在 | 目标 Agent 未安装或路径不同 | 检查 base_dir 是否存在 |
