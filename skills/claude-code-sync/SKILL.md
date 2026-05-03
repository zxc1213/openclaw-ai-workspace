---
name: claude-code-sync
description: 同步 Claude Code 配置（CLAUDE.md、Skills、Commands、Plugins）到 Windows 端和 WSL 端。当用户要求同步 Claude Code 配置、更新两端设置时使用。
---

# Claude Code 配置同步

同步 Claude Code 两端配置，保持一致性。

## 路径

| 端 | 配置目录 |
|----|---------|
| Windows | `/mnt/c/Users/<user>/.claude/` |
| WSL | `~/.claude/` |

## 同步范围

1. **CLAUDE.md** — Harness 配置（核心）
2. **skills/** — 技能目录
3. **commands/** — 自定义命令
4. **settings.json** — Plugins 和 MCP 配置（需谨慎，API key 不同则跳过）
5. **settings.local.json** — 本地配置（不同步）

## 同步流程

### 全量同步（首次 / 大版本更新）

```bash
# 1. CLAUDE.md
cp SOURCE/.claude/CLAUDE.md /mnt/c/Users/<user>/.claude/CLAUDE.md
cp SOURCE/.claude/CLAUDE.md ~/.claude/CLAUDE.md

# 2. Skills（双向合并，源端覆盖目标端同名 skill）
rsync -av --delete SOURCE/.claude/skills/ /mnt/c/Users/<user>/.claude/skills/
rsync -av --delete SOURCE/.claude/skills/ ~/.claude/skills/

# 3. Commands
rsync -av --delete SOURCE/.claude/commands/ /mnt/c/Users/<user>/.claude/commands/
rsync -av --delete SOURCE/.claude/commands/ ~/.claude/commands/
```

### 增量同步（单文件 / 单 skill）

直接用 `read` + `write` 或 `exec cp` 处理对应文件。

### settings.json 同步注意事项

- **不同步**: `env.ANTHROPIC_AUTH_TOKEN`（两端 key 不同）
- **不同步**: `statusLine`（Windows 端指向 Windows node 路径）
- **需同步**: `enabledPlugins`、`mcpServers`（排除 platform-specific）
- **建议**: 手动 diff 后选择性合并，不要全量覆盖

## 验证

同步后运行检查：

```bash
# 两端文件数对比
diff <(ls /mnt/c/Users/<user>/.claude/skills/) <(ls ~/.claude/skills/)
diff <(ls /mnt/c/Users/<user>/.claude/commands/) <(ls ~/.claude/commands/)
```

## 备份

每次同步前先备份到 `~/.claude/backups/`：

```bash
BACKUP_DIR=~/.claude/backups/$(date +%Y%m%d-%H%M%S)
mkdir -p "$BACKUP_DIR"
cp -r /mnt/c/Users/<user>/.claude/{CLAUDE.md,skills,commands,settings.json} "$BACKUP_DIR/windows/"
cp -r ~/.claude/{CLAUDE.md,skills,commands,settings.json} "$BACKUP_DIR/wsl/"
```

## 飞书版本追踪

知识空间 **Claude Code 配置管理** 中维护版本清单和变更记录。
