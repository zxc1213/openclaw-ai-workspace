# MEMORY.md - 长期记忆索引

> 详细历史备份见 `memory/archive/MEMORY-full-2026-04-05.md`
> 经验教训见 `memory/heartbeat-reflections/lessons.md`

---
## L1 — 核心事实（compaction 后始终重注入）

### 身份
- 用户: Ray，37岁，广州，程序员，夜猫子，偏好中文简洁沟通
- Agent: 念念 🌙，OpenClaw main session

### 项目概览
| 项目 | 技术栈 | 路径 | 状态 |
|------|--------|------|------|
| Team Dashboard | React, 5-tab | projects/team-dashboard | 端口 18788, 自启 |
| 集团平台 | Java SpringCloud | /mnt/e/todo/集团平台 | 4版本, 169表 |
### 基础设施
- **OpenClaw**: systemd, SIGUSR1 热重启, drop-in 改环境变量
- **模型**: GLM-5/5.1/5-Turbo/4.7/4.7-Flash/4.7-FlashX/5V-Turbo (智谱, 204K ctx)
- **OpenViking**: v0.3.2, embedding-3 2048维, :9333
- **WSL2**: 192.168.1.101, systemd
- **浏览器**: agent-browser + Chrome CDP (192.168.1.100:9222)

### 飞书
- 知识空间 ID: 7600000000000000000
- 任务清单: 88a75c8d-...
- 多维表格: 配置速查手册 (5表49记录)

### 定时任务
| Job ID | 时间 | 内容 |
|--------|------|------|
| 72d10a6c | 每天 09:00 | 每日早报（安全+日程+待办+热榜+天气） |
| 27581440 | 周日 20:00 | 周报（本周完成+统计+计划） |
| 19fab771 | 周一/四 10:00 | 团队增强（版本更新检查） |
| c6cbd07f | 周一/四 10:00 | 冬奇Lab开源项目监控 |
| 06993fa8 | 每15分钟 | 服务器健康检查（告警） |
| d5156146 | 每天 03:00 | 服务器健康检查（自动修复） |
| 619474e6 | ~~每天 08:30~~ | ❌ AI论文推送（已禁用） |

### 关键教训（高频踩坑）
- cron isolated session 要开 light-context 防 overflow
- Chrome CDP 新版只监听 IPv6，需 portproxy v4tov6
- systemd 改环境变量用 drop-in，SIGUSR1 不重载 systemd 配置
- 飞书 OAuth 批量授权有限流
- WSLInterop 丢失时用 binfmt_misc/register 恢复

---
## L2 — 项目详情（按需加载，主题相关时搜索）

### OpenCLI 适配器
- ~/.opencli/clis/bigmodel/ 4个 YAML (detail/summary/bykey/bill)
- 踩坑: POST→GET, billingMonth, j.rows, document.cookie 提取 JWT

### 集团平台
- 4个同构版本: base/lq/kczx/kcsystem
- PDM 反向工程: 169表/3067字段, 84字段需手动补注释


---
## L2 — 学习与决策（按需加载）

### 上下文管理
- compaction: safeguard 模式，recentTurnsPreserve=4，keepRecent=8K，reserve=16K
- memoryFlush: 压缩前 20K token 阈值
- postCompactionSections: Session Startup + Red Lines + Subagent 规范

### 待落地
- P0: Gateway loopback + 沙箱 + Key 迁移到环境变量
- P1: Agent skills 白名单 + openclaw doctor
- Claude Code Hooks/Agent-SDK 值得探索

### Skills 体系（自建）
| Skill | 版本 | 用途 | 来源 |
|-------|------|------|------|
| skill-vetter | v2.0.0 | 技能安全审计(去混淆→规则扫描→权限评估→量化评分) | HarnessKit 18规则移植 |
| mcp-audit | v1.0.0 | MCP Server 审计(注入/权限/供应链) | HarnessKit 研究 |
| cross-agent-deploy | v1.0.0 | 跨 Agent 部署(Claude Code/Codex/Gemini/Cursor) | HarnessKit 研究 |

### 已完成学习
- Claude Code x OpenClaw 教程 (2026-04-06): 25 篇, research/claude-code-openclaw-*.md
- 飞书知识库同步 (2026-04-06): 3 篇在「OpenClaw 使用与配置」下
- MemPalace 学习 (2026-04-08): 分层加载/Wing隔离/Tunnel 关联, research/mempalace-study.md
- HarnessKit + OpenClaw Pi 架构 (2026-05-03): 4篇研究文件, 3个新skill, research/harnesskit-*.md research/openclaw-pi-*.md


