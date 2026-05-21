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
| 72d10a6c | 每天 09:00 | 每日早报（安全+待办+天气） |
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
- gstack + Ruflo 学习 (2026-05-14): YC CEO的23个slash commands + 多Agent编排平台, research/gstack-skills-deep.md research/ruflo-architecture-deep.md #claude-code #agent-orchestration


## Promoted From Short-Term Memory (2026-05-18)

<!-- openclaw-memory-promotion:memory:memory/archive/2026-05-04.md:1:28 -->
- # 2026-05-04 Daily Notes > ⚠️ 原 daily-notes/2026-05-04.md 在周一熵管理时被覆盖，心跳检查记录丢失。 ## 心跳记录 (12:49) - 依赖: 全部健康 ✅ - 周一熵管理: 归档 2026-04-27 daily note, memory/ 根目录 1 文件 (subagent-log.md, 正常) - skill-candidate 审核中: context-budget (2026-05-04 标记, 待创建) - strategic-compact DRAFT 仍待审阅 - MEMORY.md L1 待落地条目 P0/P1 无变更 - reflections.md Claude Code Hooks 降级条目 (04-06→04-18) 超过 30 天未动, 已低优先级 ## 心跳记录 (14:49) - 依赖: 全部健康 ✅ - 周一熵管理: memory/ 根目录 2 文件 (heartbeat-state.json + subagent-log.md, 均正常) - daily notes: 6 文件 (04-29~05-04), 无 >7 天需归档 - events/: 0 文件 - workspace 根目录: 干净 (IDENTITY/SOUL/SAFETY/USER/DREAMS.md 为约定文件) - skill-candidate: context-budget 仍待创建 - strategic-compact DRAFT 仍待审阅 - reflections.md: Claude Code Hooks 停滞 >28 天 (已知低优先级) - OpenViking: v0.3.2 健康, 无新增记忆告警 - reflections.md Claude Code Hooks 降级条目 (04-06→04-18) 超过 30 天未动, 已低优先级 ## 心跳记录 (16:49) - 依赖: 全部健康 ✅ - daily notes: 6 文件 (04-29~05-04), 无 >7 天需归档 - events/: 0 文件 [score=0.880 recalls=4 avg=1.000 source=memory/archive/2026-05-04.md:1-28]
<!-- openclaw-memory-promotion:memory:memory/archive/daily-notes/2026-04-27.md:1:30 -->
- # 2026-04-27 Daily Notes ## 心跳检查 (06:49) - **依赖**: 全部正常 - **Events**: 0 文件 - **碎片清理**: `memory/extracted-sessions.jsonl` 0字节空文件 → 待删除 - **停滞项 ⚠️**: reflections.md 中 Claude Code Hooks 降级条目已停滞 21 天（04-18→04-27），优先级不足 - **Daily notes**: 5 个文件，最旧 04-20，暂无需归档 - **MEMORY.md L1**: 状态正常，无过时条目 - **Skill-candidate**: 近3天无新标记 ## 心跳检查 (14:49) - **依赖**: 全部正常 - **Events**: 0 文件 - **Daily notes**: 5 个文件，最旧 04-20，暂无需归档 - **MEMORY.md**: 78 行，状态正常，无过时条目 - **Memory 散落文件**: 根目录无散落，无碎片空文件 - **Skill-candidate**: 近3天无新标记 - **reflections.md**: Claude Code Hooks 条目停滞 21 天（04-06→04-27），低优先级暂不处理 - **OpenViking**: 查询正常，近期无新记忆沉淀（>3天无新增） - **Workspace 根目录**: 干净，无散落文件 ## 心跳检查 (12:49) - **依赖**: 全部正常 - **碎片清理**: ✅ 删除 `memory/extracted-sessions.jsonl`（0字节空文件） - **Events**: 0 文件，无需清理 - **Daily notes**: 5 个文件（04-20 至 04-27），暂无需归档 - **MEMORY.md**: 78 行，状态正常 - **Memory 散落文件**: memory/ 根目录无散落 .md - **Skill-candidate**: 近3天无新标记 [score=0.828 recalls=3 avg=1.000 source=memory/archive/daily-notes/2026-04-27.md:1-30]
<!-- openclaw-memory-promotion:memory:memory/2026-05-14.md:25:25 -->
- [self-reflection] Subagent 在复杂长任务中表现不佳（GLM-5-Turbo 上下文不足），4个 subagent 中只有1个成功产出文件。复杂研究任务更适合主会话直接执行，或拆成更小的子任务。 [score=0.823 recalls=0 avg=0.620 source=memory/2026-05-14.md:25-25]

## Promoted From Short-Term Memory (2026-05-19)

<!-- openclaw-memory-promotion:memory:memory/archive/2026-05-06.md:1:22 -->
- # 2026-05-06 Daily Notes ## 心跳记录 (08:59) - 依赖: 全部健康 ✅ (OpenViking :9333, Team Dashboard :18788) - daily notes: 7 文件 (04-29~05-05), 无 >7 天需归档 - events/: 0 文件 - reflections.md: Claude Code Hooks 停滞 >30天, "反思没有带来行动" 停滞 >27天 (均已知低优先级) - MEMORY.md L1/L2 内容与当前状态一致, 无需更新 - workspace 根目录: 干净 (仅标准 .md 文件) - memory/ 根目录: 无碎片 - 无新增需同步到 MEMORY.md 的信息 - 无新的 skill-candidate 或 skill-improvement 需求 ## 心跳记录 (12:49) - 依赖: 全部健康 ✅ (OpenViking :9333, Team Dashboard :18788) - MEMORY.md L1/L2: 无需更新 - 05-03 skill-candidate (学习工作流 Skill 增强): 已标记完成, 不需创建新草稿 - skill 使用: 近3天无 skill-improvement 需求 - events/: 0 文件 - workspace 根目录: 标准文件, 无散落 - OpenViking: healthy v0.3.2 (stats endpoint N/A, 非阻塞) [score=0.891 recalls=3 avg=1.000 source=memory/archive/2026-05-06.md:1-22]
