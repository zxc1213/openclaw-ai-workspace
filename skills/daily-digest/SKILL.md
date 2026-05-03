---
name: daily-digest
description: "每日综合推送工作流：整合安全简报、热榜、日程摘要为一站式每日早报。触发：每日推送, 早报, daily digest, 日报. 也可用作定时任务。 不适用于：单独查热榜（用 daily-hot-news）、单独安全简报（用 security-briefing）、单独日程查看。"
---

# 每日综合推送（Daily Digest）

每天早上 08:00 自动生成综合早报，推送到 webchat。

## 组成模块

| 模块 | 数据源 | 优先级 | 生成方式 |
|------|-------|--------|---------|
| 🔐 安全简报 | GitHub Advisories + 安全客 + 阿里云AVD | 高 | 复用 security-briefing 流程 |
| 📅 日程摘要 | 飞书日历 | 高 | feishu_calendar_event list |
| 📋 待办概览 | 飞书任务 | 中 | feishu_task_task list |
| 🔥 热榜精选 | daily-hot-news API | 低 | dailyhot (微博/知乎/B站 Top 3) |
| 🌤 天气 | wttr.in | 低 | weather skill |

## Cron 配置

```yaml
schedule: "0 8 * * *"
timezone: "Asia/Shanghai"
sessionTarget: "isolated"
```

## 生成流程

### 1. 并行采集（减少总耗时）

同时执行：
- 安全漏洞查询（web_fetch 数据源）
- 日程查询（feishu_calendar_event）
- 待办查询（feishu_task_task）
- 热榜查询（dailyhot API）
- 天气查询

### 2. 内容精简规则

每个模块严格控制输出量：
- 安全：只保留 P0/P1（≤5条）
- 日程：今日+明日，每条一行
- 待办：未完成的高优先级任务（≤5条）
- 热榜：每平台 Top 3（≤12条）
- 天气：3行以内

### 3. 组装推送

```
🌅 早安 | YYYY-MM-DD 周X

🔐 安全简报
[高危漏洞，无则写"今日无高危"]

📅 今日日程
[日程列表，无则写"今日无日程"]

📋 待办提醒
[高优先级待办，无则写"暂无待办"]

🔥 热榜速览
[各平台 Top 3]

🌤 天气
[温度/天气/建议]

---
下次推送: 明天 08:00
```

## 独立触发

- "安全简报" → 只跑安全模块
- "今日日程" → 只跑日程模块
- "热榜" → 只跑热榜模块
- "早报" / "日报" → 跑全部模块

## 文件归档

- 每日早报保存到 `memory/daily-digest/` 目录
