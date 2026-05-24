---
name: daily-hot-news
description: "每日热榜技能 — 查询微博、知乎、B站、抖音等54个平台的热榜数据，支持定时推送和分类浏览。Triggers on 热榜, 热搜, trending, hot news, 微博热搜, 知乎热榜. NOT for: security-specific briefings (use security-briefing), or general web search (use web_search/tavily)."
categories:
  - information-aggregation
  - daily-utility
  - news
emoji: 🔥
metadata:
  openclaw:
    requires:
      bins: ["python3"]
    install:
      - id: python-deps
        kind: exec
        command: "cd /root/.openclaw/workspace/skills/daily-hot-news && python3 -m pip install requests aiohttp"
        label: "安装Python依赖"
---

# 🔥 每日热榜

基于 [DailyHotApi](https://github.com/imsyy/DailyHotApi) 项目的 **54 个热榜源**本地化查询服务。

## 核心功能

- 📊 **热榜查询** — 查询任意平台的热榜数据
- 📋 **分类浏览** — 列出所有支持的热榜源
- 💾 **历史记录** — 自动保存每日热榜数据
- ⏰ **定时推送** — 自动推送热榜到飞书

## 配置

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| `DAILY_HOT_API_URL` | http://localhost:6688 | DailyHotApi 服务地址 |
| `DAILY_HOT_CACHE_TTL` | 3600 | 缓存时间（秒） |
| `DAILY_HOT_MAX_ITEMS` | 20 | 返回最大条数 |

## 响应格式

```json
{
  "platform": "微博",
  "updateTime": "2026-02-05 17:00:00",
  "data": [
    {"rank": 1, "title": "热搜标题", "hot": "1234万", "url": "https://..."}
  ]
}
```

## 文件结构

```
daily-hot-news/
├── SKILL.md              # 本说明书
├── daily_hot_news.py     # 核心 Skill 脚本
├── api_client.py         # API 客户端封装
├── formatter.py          # 响应格式化
├── config.py             # 配置管理
├── storage.py            # 数据存储模块
├── data/                 # 热榜数据存储目录
└── requirements.txt       # 依赖列表
```

## Route Table

| Topic | Reference |
|-------|-----------|
| 完整热榜源列表（54个）、部署说明、数据存储、资源占用、故障排查 | [`sources-and-deployment.md`](references/sources-and-deployment.md) |
