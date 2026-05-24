# 热榜源列表与部署说明

## 支持的热榜源（54个）

### 🎬 视频/直播平台
| 接口 | 名称 |
|------|------|
| bilibili | 哔哩哔哩 |
| acfun | AcFun |
| douyin | 抖音 |
| kuaishou | 快手 |
| coolapk | 酷安 |

### 💬 社交媒体
| 接口 | 名称 |
|------|------|
| weibo | 微博 |
| zhihu | 知乎 |
| zhihu-daily | 知乎日报 |
| tieba | 百度贴吧 |
| douban-group | 豆瓣讨论小组 |
| v2ex | V2EX |
| ngabbs | NGA |
| hupu | 虎扑 |

### 📰 新闻资讯
| 接口 | 名称 |
|------|------|
| baidu | 百度热搜 |
| thepaper | 澎湃新闻 |
| toutiao | 今日头条 |
| 36kr | 36氪 |
| qq-news | 腾讯新闻 |
| sina | 新浪网 |
| sina-news | 新浪新闻 |
| netease-news | 网易新闻 |
| huxiu | 虎嗅 |
| ifanr | 爱范儿 |

### 💻 科技/技术社区
| 接口 | 名称 |
|------|------|
| ithome | IT之家 |
| ithome-xijiayi | IT之家「喜加一」 |
| sspai | 少数派 |
| csdn | CSDN |
| juejin | 稀土掘金 |
| 51cto | 51CTO |
| nodeseek | NodeSeek |
| hellogithub | HelloGitHub |

### 🎮 游戏/ACG
| 接口 | 名称 |
|------|------|
| genshin | 原神 |
| miyoushe | 米游社 |
| honkai | 崩坏3 |
| starrail | 崩坏：星穹铁道 |
| lol | 英雄联盟 |

### 📚 阅读/文化
| 接口 | 名称 |
|------|------|
| jianshu | 简书 |
| guokr | 果壳 |
| weread | 微信读书 |
| douban-movie | 豆瓣电影 |

### 🔧 工具/其他
| 接口 | 名称 |
|------|------|
| 52pojie | 吾爱破解 |
| hostloc | 全球主机交流 |
| weatheralarm | 中央气象台 |
| earthquake | 中国地震台 |
| history | 历史上的今天 |

## 部署说明

### PM2 方式管理（推荐）

```bash
cd /root/.openclaw/workspace/skills/daily-hot-api

./deploy.sh            # 部署并启动服务
./deploy.sh status     # 查看状态
./deploy.sh restart    # 重启服务
./deploy.sh stop       # 停止服务
./deploy.sh logs       # 查看日志
```

**服务地址**: `http://localhost:6688`

### 环境变量

```bash
export DAILY_HOT_API_URL=http://localhost:6688
```

### 安装 Skill 依赖

```bash
cd /root/.openclaw/workspace/skills/daily-hot-news
pip install requests aiohttp
```

## 数据存储

```
data/
├── weibo/
│   ├── 2026-02-05.json
│   └── 2026-02-04.json
├── zhihu/
│   └── 2026-02-05.json
└── ...
```

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| `DAILY_HOT_DATA_DIR` | data/ | 数据存储目录 |
| `DAILY_HOT_AUTO_SAVE` | true | 是否自动保存热榜数据 |

### 管理命令
```bash
python3 storage.py              # 查看已保存的数据统计
python3 storage.py --clear 30   # 清理 30 天前的旧数据
```

## 资源占用

| 组件 | 内存 | CPU |
|------|------|-----|
| DailyHotApi 服务 | ~200MB | 极低 |
| DailyHotApi Skill | <10MB | 可忽略 |

## 故障排查

```bash
./deploy.sh status    # 检查 PM2 状态
./deploy.sh logs      # 查看日志
./deploy.sh restart   # 重启服务
```
