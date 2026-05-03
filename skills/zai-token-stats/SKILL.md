---
name: zai-token-stats
description: "查询智谱 AI 每日 token 用量统计。触发：'X日token统计'、'token用量'、'用量统计'、'今天用了多少token'、'昨天token'、'费用明细'。不适用于：非智谱平台的用量查询、实时监控。"
metadata:
---

# 智谱 Token 用量统计

通过 OpenCLI 查询智谱 AI 每日 token 用量，按日期→API Key→模型三级分组汇总。

## 触发条件

用户说以下类似表达时触发：
- "X日 token 统计"（如"今天token统计"、"4月7日token统计"）
- "今天/昨天/前天用了多少 token"
- "X月 token 用量汇总"
- "费用明细"、"用量统计"

## 执行方式

### 方式一：OpenCLI（推荐，需要 Chrome 已登录 bigmodel.cn）

```bash
# 查某月全部数据
opencli bigmodel detail --month YYYY-MM

# 默认当月
opencli bigmodel detail
```

输出按 日期→API Key→模型 分组，包含 tokens、calls、amount。

### 方式二：直接调 API（备用，需要 Cookie）

```bash
# 通过浏览器环境调 API
curl -s -b <cookie> \
  -H "Authorization: <jwt_from_cookie>" \
  "https://bigmodel.cn/api/finance/expenseBill/expenseBillListByDay?billingMonth=2026-04&pageSize=100&pageNum=1"
```

## 输出格式

查完数据后，整理为简洁的摘要格式回复用户：

```
📅 2026-04-07 Token 用量统计
━━━━━━━━━━━━━━━━━━━━━━
📌 ea051c32...36a9（总计 12.3M tokens / 2,100 calls）
  ▸ glm-5-turbo — 10M tokens / 1,800 calls
  ▸ glm-4.7 — 1.5M tokens / 200 calls
  ▸ glm-5.1 — 0.8M tokens / 100 calls

📌 7b75f8b1...a611（总计 5M tokens / 500 calls）
  ▸ glm-5 — 5M tokens / 500 calls

📊 当日合计：17.3M tokens / 2,600 calls
```

## 数据来源说明

- API 端点：`bigmodel.cn/api/finance/expenseBill/expenseBillListByDay`（GET）
- 认证：从 Cookie 中提取 `bigmodel_token_production` JWT
- 关键字段：`billingDate`、`apiKey`、`modelCode`、`usageCount`（token 数）、`apiUsage`（调用次数）
- `settlementAmount`：结算金额，包年套餐为 0

## 日期解析

| 用户说 | 解析为 |
|--------|--------|
| 今天 / 今日 | 当天 |
| 昨天 / 昨日 | 前 1 天 |
| 前天 | 前 2 天 |
| X月X日 / X号 | 具体日期 |
| X月 | 整月汇总 |
| 本周 / 上周 | 日期范围 |

解析出日期后，计算对应的 `billingMonth`（YYYY-MM），如果只查某一天，调 API 拿整月数据后过滤该天。

## 注意事项

1. **需要 Chrome 已登录 bigmodel.cn**，OpenCLI 通过 Browser Bridge 复用浏览器 Cookie
2. 数据按 `billingDate` 粒度返回，每条记录有 tokenType（输入/输出），需汇总
3. 包年套餐的 settlementAmount 为 0，对用户更有意义的是 token 数和调用次数
4. 如果 OpenCLI 连不上浏览器，提示用户检查 Chrome 是否运行且已安装 Browser Bridge 扩展
