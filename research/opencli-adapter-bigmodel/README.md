# OpenCLI 智谱（BigModel）费用账单适配器

为 [OpenCLI](https://github.com/jackwener/opencli) 编写的智谱 AI（bigmodel.cn）费用账单查询适配器。

## 安装

将 3 个 YAML 文件复制到 OpenCLI 适配器目录：

```bash
cp bill.yaml summary.yaml bykey.yaml ~/.opencli/clis/bigmodel/
```

## 前置条件

- OpenCLI v1.6.8+
- 已在浏览器中登录 [bigmodel.cn](https://bigmodel.cn)（Cookie 认证）
- 首次使用时 OpenCLI 会打开浏览器页面获取 Cookie

## 命令

### `opencli bigmodel bill` — 费用明细

查看指定月份的每日费用明细。

```bash
# 当月明细
opencli bigmodel bill

# 指定月份
opencli bigmodel bill --month 2026-04
```

输出字段：`date, model, api_key, amount, tokens, input_tokens, output_tokens, call_count`

### `opencli bigmodel summary` — 模型汇总

按模型分组汇总费用。

```bash
# 当月汇总
opencli bigmodel summary

# 指定月份
opencli bigmodel summary --month 2026-03
```

输出字段：`model, total_amount, total_tokens, total_input_tokens, total_output_tokens, total_calls, days`

### `opencli bigmodel bykey` — API Key 分组

按 API Key 分组查看费用。

```bash
# 所有 Key 的汇总
opencli bigmodel bykey

# 指定月份
opencli bigmodel bykey --month 2026-04

# 按 Key 过滤（服务端筛选）
opencli bigmodel bykey --apikey <你的key前缀>
```

输出字段：`api_key, models, total_amount, total_tokens, total_input_tokens, total_output_tokens, total_calls, days`

## API 说明

### 端点

```
POST https://bigmodel.cn/api/finance/expenseBill/expenseBillListByDay
```

### 认证

Cookie 认证 — 适配器通过 `navigate` 到 `https://bigmodel.cn/finance-center/bill/expensebill/list` 获取浏览器 Cookie，后续 `fetch` 请求使用 `credentials: 'include'` 自动携带。

### 请求参数

| 参数 | 类型 | 说明 |
|------|------|------|
| apiKey | string | API Key 筛选，空字符串表示全部 |
| beginDate | string | 开始日期，格式 `YYYY-MM-DD` |
| endDate | string | 结束日期，格式 `YYYY-MM-DD` |
| pageNum | int | 页码，从 1 开始 |
| pageSize | int | 每页条数，适配器固定使用 100 |

### 响应字段

每条记录包含：

| 字段 | 说明 |
|------|------|
| expenseDate / billDate / date | 费用日期 |
| modelName / model | 模型名称 |
| apiKey | API Key |
| amount | 费用金额 |
| tokens / tokenCount | 总 Token 数 |
| inputTokens | 输入 Token 数 |
| outputTokens | 输出 Token 数 |
| callCount / callNum | 调用次数 |

## 技术细节

- **自动分页**：pageSize=100，循环拉取直到返回空列表或条数不足 pageSize
- **API Key 脱敏**：长 Key 只显示前 8 位 + 后 4 位
- **日期计算**：自动计算指定月份的第一天和最后一天
- **字段兼容**：响应字段名做了多重 fallback（`data.data` → `data` → `list`）

## 文件结构

```
~/.opencli/clis/bigmodel/
├── bill.yaml      # 费用明细（按日）
├── summary.yaml   # 按模型汇总
└── bykey.yaml     # 按 API Key 分组
```
