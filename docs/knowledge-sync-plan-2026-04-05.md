# 知识沉淀计划 2026-04-05

> 状态：执行中
> 飞书任务授权待解决（HTTP 444），暂时用本地跟踪

## 任务列表

- [x] 创建 4 个新 skill（lark-knowledge-sync, agent-task-dispatch, daily-digest, lark-wiki-curator）
- [x] 升级 security-briefing 为子模块模式
- [x] skill 分配到 subagent
- [x] 初始化飞书知识库空间（已有 AI Agent 实践笔记空间，含 3 个文档）
- [ ] 同步 GLM 学习笔记到飞书知识库（subagent 执行中，等待完成）
- [x] 设置 daily-digest cron job（每天 08:00，job ID: 72d10a6c，已禁用旧安全简报 cron）

## Cron 变更
- ✅ 新建：每日早报（72d10a6c）— 每天 08:00，安全+日程+待办+热榜+天气
- ❌ 禁用：每日安全简报（fcd358b4）— 已被 daily-digest 包含

## 备注
- 飞书任务 API 授权失败（HTTP 444），需检查开放平台权限配置
