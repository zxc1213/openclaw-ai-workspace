---
name: claude-code-enhance
description: Claude Code 配置同步与增强。在 Windows 端和 WSL 端之间双向同步 CLAUDE.md、settings.json、commands、skills，确保两端能力一致。触发：同步 Claude Code、增强 Claude Code、cc sync、claude code 配置。不适用于：Claude Code 本身的安装/更新（用 claude update）。
---

# Claude Code 配置同步与增强

将 OpenClaw 的能力体系同步到 Windows 端和 WSL 端的 Claude Code。

## 路径配置

- **Windows 端**: `/mnt/c/Users/19944/.claude/`
- **WSL 端**: `~/.claude/`（即 `/home/rays/.claude/`）
- **知识库**: Claude Code 配置管理（Space ID: `7625329723022773427`）
- **清单文档**: https://www.feishu.cn/wiki/MAWkwyPwxiyUBRkdFefc9FeZnnd

## 同步操作

### 完整同步

1. **备份两端配置**到 `~/.openclaw/workspace/_inbox/claude-code-backup-YYYY-MM-DD/`
2. **CLAUDE.md**: 确保两端一致（以最新版为准）
3. **settings.json**: 合并 plugins 配置，MCP 保持一致
4. **commands**: 双向同步（Windows → WSL 为主方向）
5. **skills**: 双向同步，以 WSL 端为主要来源（lark-*/firecrawl-* 系列在 WSL 端维护）

### 单项同步

| 组件 | 源 | 目标 | 命令 |
|------|-----|------|------|
| CLAUDE.md | 任一端 | 另一端 | `cp` |
| settings.json | 任一端 | 另一端 | 合并 plugins |
| commands | Windows | WSL | `cp -r` |
| skills | WSL | Windows | `cp -r`（选增量） |
| skills | Windows | WSL | `cp -r`（选增量） |

## CLAUDE.md 增强版要点

增强版相比基础版新增 11 项内容：

1. Be resourceful before asking 原则
2. 工作流模式（直接编码/Plan-First/质量门禁）
3. 四要素模板增强（Context 上限、Done 可检查性）
4. Config Protection（禁止改规则）
5. 飞书工具链（20+ lark skills + 7 firecrawl skills）
6. MCP 工具完整列表（8 个 server）
7. SuperClaude 命令参考（12 个 /sc: 命令）
8. 记忆系统（OpenViking Memory）
9. 安全路径约定
10. 环境信息（IP/代理/CDP/模型）
11. 项目增强（集团平台版本、Team Dashboard）

## 注意事项

- 修改前先备份
- settings.json 中的 `env` 部分两端不同（API token 不同），不要覆盖
- Windows 端有 `statusLine` 配置（指向 Windows node），WSL 端不需要
- skills 目录下 `learned/` 是 Claude Code 自动生成的，不需要同步
- plugins/cache/ 是缓存目录，不需要同步
