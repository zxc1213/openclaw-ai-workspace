# 飞书多维表格（Bitable）记录 API 学习笔记

> 更新时间：2026-04-05
> 来源：https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/
> Base URL: `https://open.feishu.cn/open-apis/bitable/v1/apps/:app_token/tables/:table_id`

---

## 目录

1. [接口总览](#1-接口总览)
2. [批量获取记录（batch_get）⭐ 核心](#2-批量获取记录batch_get-核心)
3. [查询记录（search）⭐ 推荐](#3-查询记录search-推荐)
4. [列表查询记录（list）已废弃](#4-列表查询记录list-已废弃)
5. [获取单条记录（get）已废弃](#5-获取单条记录get-已废弃)
6. [创建记录（create）](#6-创建记录create)
7. [批量创建记录（batch_create）](#7-批量创建记录batch_create)
8. [更新记录（update）](#8-更新记录update)
9. [批量更新记录（batch_update）](#9-批量更新记录batch_update)
10. [删除记录（delete）](#10-删除记录delete)
11. [批量删除记录（batch_delete）](#11-批量删除记录batch_delete)
12. [字段类型与值格式](#12-字段类型与值格式)
13. [Filter 筛选语法详解 ⭐ 重点](#13-filter-筛选语法详解-重点)
14. [公共参数说明](#14-公共参数说明)
15. [常见错误码](#15-常见错误码)

---

## 1. 接口总览

| 接口 | 方法 | URL | 频率限制 | 说明 |
|------|------|-----|---------|------|
| batch_get | POST | `/records/batch_get` | 50次/秒 | ⭐ 批量获取记录（推荐） |
| search | POST | `/records/search` | 20次/秒 | ⭐ 查询记录（带筛选排序） |
| list | GET | `/records` | 20次/秒 | 列表查询（已废弃，推荐用 search） |
| get | GET | `/records/:record_id` | 20次/秒 | 获取单条（已废弃，推荐用 batch_get） |
| create | POST | `/records` | 50次/秒 | 创建单条记录 |
| batch_create | POST | `/records/batch_create` | 50次/秒 | 批量创建（最多500条） |
| update | PUT | `/records/:record_id` | 50次/秒 | 更新单条记录 |
| batch_update | POST | `/records/batch_update` | 50次/秒 | 批量更新（最多500条） |
| delete | DELETE | `/records/:record_id` | 50次/秒 | 删除单条记录 |
| batch_delete | POST | `/records/batch_delete` | 50次/秒 | 批量删除（最多500条） |

### 所需权限

- 读取：`bitable:app` 或 `bitable:app:readonly`
- 创建：`base:record:create` 或 `bitable:app`
- 更新：`base:record:update` 或 `bitable:app`
- 删除：`base:record:delete` 或 `bitable:app`
- 搜索：`base:record:retrieve` 或 `bitable:app` 或 `bitable:app:readonly`

---

## 2. 批量获取记录（batch_get）⭐ 核心

根据 record_id 列表批量获取记录详情。**推荐用于已知 record_id 的场景**。

### 请求

```
POST /open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/batch_get
```

#### Query 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id_type | string | 否 | 用户 ID 类型：open_id / union_id / user_id，默认 open_id |
| automatic_fields | boolean | 否 | 是否返回 created_by/created_time/last_modified_by/last_modified_time |
| display_formula_ref | boolean | 否 | 公式/查找引用字段是否返回原始值 |

#### Request Body

```json
{
  "records": ["recG70uhxh", "recP750ZNJ"],
  "field_names": ["字段1", "字段2"]
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| records | string[] | 是 | record_id 数组（**最多 500 个**） |
| field_names | string[] | 否 | 指定返回的字段名列表，不传则返回全部字段 |

### 响应示例

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "records": [
      {
        "record_id": "recG70uhxh",
        "fields": {
          "Task": "Review new features",
          "number": 100,
          "single_select": "option_1",
          "multi_select": ["option_1", "option_2"],
          "date": 1674206443000,
          "checkbox": true,
          "user": [
            { "id": "ou_2910013f1e6456f16a0ce75ede950a0a", "name": "ZhangSan" }
          ]
        }
      }
    ],
    "total": 2
  }
}
```

### 关键要点

- ✅ **最多传入 500 个 record_id**
- ✅ 通过 `field_names` 可按需返回字段，减少响应体积
- ✅ `automatic_fields=true` 可返回创建人/时间/修改人/时间
- ✅ `display_formula_ref=true` 可让公式/查找引用字段返回原始值

---

## 3. 查询记录（search）⭐ 推荐

**list 接口的替代品**，支持结构化 filter + sort，功能更强。

### 请求

```
POST /open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/search
```

#### Query 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id_type | string | 否 | 用户 ID 类型 |
| page_token | string | 否 | 分页 token |
| page_size | int | 否 | 每页数量，默认 20，最大 500 |

#### Request Body（结构化筛选）

```json
{
  "view_id": "vewqhz51lk",
  "field_names": ["字段1", "字段2"],
  "sort": [
    { "field_name": "多行文本", "desc": true }
  ],
  "filter": {
    "conjunction": "and",
    "conditions": [
      { "field_name": "职位", "operator": "is", "value": ["高级销售员"] }
    ]
  },
  "automatic_fields": false
}
```

#### Request Body 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| view_id | string | 否 | 视图 ID，传入后按视图设置筛选 |
| field_names | string[] | 否 | 指定返回的字段名列表 |
| sort | sort[] | 否 | 排序规则数组 |
| filter | filter_info | 否 | 筛选条件（结构化，推荐） |
| automatic_fields | boolean | 否 | 是否返回自动计算字段 |

#### sort 对象

| 字段 | 类型 | 说明 |
|------|------|------|
| field_name | string | 字段名 |
| desc | boolean | 是否降序，默认 false（升序） |

#### filter 对象（结构化筛选）

```json
{
  "conjunction": "and",
  "children": [
    {
      "conjunction": "or",
      "conditions": [
        { "field_name": "职位", "operator": "is", "value": ["高级销售员"] },
        { "field_name": "职位", "operator": "is", "value": ["初级销售员"] }
      ]
    }
  ]
}
```

### 响应示例

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "items": [
      {
        "record_id": "recyOaMB2F",
        "fields": {
          "数字": 2323.2323,
          "单选": "选项1",
          "多选": ["选项1", "选项2"],
          "复选框": true,
          "日期": 1690992000000
        },
        "created_by": { "id": "ou_xxx", "name": "测试1" },
        "created_time": 1691049973000,
        "last_modified_by": { "id": "ou_xxx", "name": "测试1" },
        "last_modified_time": 1702455191000
      }
    ],
    "has_more": false,
    "total": 1
  }
}
```

### 关键要点

- ✅ 最多返回 500 条/页，支持分页
- ✅ **filter 支持嵌套**（children 嵌套 children），可实现复杂条件组合
- ✅ sort 是数组，支持多字段排序
- ✅ `view_id` 可直接复用多维表格中已配置的视图筛选条件

---

## 4. 列表查询记录（list）已废弃

> ⚠️ 已废弃，推荐使用 search 接口替代。

### 请求

```
GET /open-apis/bitable/v1/apps/:app_token/tables/:table_id/records
```

#### Query 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| view_id | string | 否 | 视图 ID |
| filter | string | 否 | **表达式字符串格式**（非 JSON），如 `AND(CurrentValue.[身高]>180, CurrentValue.[体重]>150)` |
| sort | string | 否 | 排序字符串，如 `["fieldName1 DESC","fieldName2 ASC"]` |
| field_names | string | 否 | 字段名数组 JSON 字符串 |
| text_field_as_array | boolean | 否 | 文本字段是否以数组形式返回 |
| user_id_type | string | 否 | 用户 ID 类型 |
| display_formula_ref | boolean | 否 | 公式/查找引用是否返回原始值 |
| automatic_fields | boolean | 否 | 是否返回自动计算字段 |
| page_token | string | 否 | 分页标识 |
| page_size | int | 否 | 每页大小，默认 20，最大 500 |

### filter 表达式语法（list 接口专用）

```
AND(CurrentValue.[字段名]运算符值, CurrentValue.[字段名]运算符值)
OR(CurrentValue.[字段名]运算符值, CurrentValue.[字段名]运算符值)

支持运算符: =, !=, >, <, >=, <=
```

示例：
```
AND(CurrentValue.[身高]>180, CurrentValue.[体重]>150)
OR(CurrentValue.[状态]="进行中", CurrentValue.[优先级]="高")
```

**注意**：这种表达式格式仅 list 接口使用，search 接口使用 JSON 结构化 filter。

---

## 5. 获取单条记录（get）已废弃

> ⚠️ 已废弃，推荐使用 batch_get。

### 请求

```
GET /open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/:record_id
```

#### Query 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| text_field_as_array | boolean | 否 | 文本字段是否以数组形式返回 |
| user_id_type | string | 否 | 用户 ID 类型 |
| display_formula_ref | boolean | 否 | 公式/查找引用是否返回原始值 |
| with_shared_url | boolean | 否 | 是否返回记录分享链接 |
| automatic_fields | boolean | 否 | 是否返回自动计算字段 |

---

## 6. 创建记录（create）

### 请求

```
POST /open-apis/bitable/v1/apps/:app_token/tables/:table_id/records
```

#### Query 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id_type | string | 否 | 用户 ID 类型 |
| client_token | string | 否 | UUIDv4 格式幂等键，用于防止重复提交 |
| ignore_consistency_check | boolean | 否 | 是否忽略一致性检查，默认 false |

#### Request Body

```json
{
  "fields": {
    "text": "text",
    "number": 100,
    "currency": 3,
    "rating": 3,
    "progress": 0.25,
    "single_select": "option_1",
    "multi_select": ["option_1", "option_2"],
    "date": 1674206443000,
    "checkbox": true,
    "user": [
      { "id": "ou_2910013f1e6456f16a0ce75ede950a0a" },
      { "id": "ou_e04138c9633dd0d2ea166d79f548ab5d" }
    ],
    "groupChat": [
      { "id": "oc_cd07f55f14d6f4a4f1b51504e7e97f48" }
    ],
    "phone": "13026162666",
    "url": {
      "text": "Base",
      "link": "https://www.feishu.cn/product/base"
    },
    "attachment": [
      { "file_token": "DRiFbwaKsoZaLax4WKZbEGCccoe" },
      { "file_token": "BZk3bL1Enoy4pzxaPL9bNeKqcLe" }
    ],
    "single_link": ["recHTLvO7x", "recbS8zb2m"],
    "duplex_link": ["recHTLvO7x", "recbS8zb2m"],
    "location": "116.397755,39.903179",
    "barcode": "+$$3170930509104X512356"
  }
}
```

### 响应示例

```json
{
  "code": 0,
  "data": {
    "record": {
      "record_id": "reclAqylTN",
      "fields": { ... }
    }
  },
  "msg": "success"
}
```

### 关键要点

- `client_token`：UUIDv4 格式，同一 token 重复提交不会创建新记录（幂等性保证）
- `ignore_consistency_check=true` 可提升性能但可能数据暂时不一致
- 附件需先通过 [上传素材](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/upload_all) 接口上传

---

## 7. 批量创建记录（batch_create）

### 请求

```
POST /open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/batch_create
```

#### Request Body

```json
{
  "records": [
    {
      "fields": {
        "text": "text",
        "number": 100,
        "single_select": "option_1",
        "date": 1674206443000,
        "user": [{ "id": "ou_2910013f1e6456f16a0ce75ede950a0a" }]
      }
    },
    {
      "fields": {
        "text": "another text",
        "number": 200
      }
    }
  ]
}
```

**关键限制：每次最多 500 条记录。**

### 响应示例

```json
{
  "code": 0,
  "data": {
    "records": [
      {
        "record_id": "reclAqylTN",
        "fields": { ... }
      }
    ]
  },
  "msg": "success"
}
```

---

## 8. 更新记录（update）

### 请求

```
PUT /open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/:record_id
```

#### Request Body

```json
{
  "fields": {
    "text": "updated text",
    "number": 999,
    "single_select": "option_2"
  }
}
```

> **注意**：只传需要更新的字段即可，未传的字段不会被修改。

---

## 9. 批量更新记录（batch_update）

### 请求

```
POST /open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/batch_update
```

#### Request Body

```json
{
  "records": [
    {
      "record_id": "recgVdQ7o7",
      "fields": {
        "manpower": 2,
        "performer": [{ "id": "ou_debc524b2d8cb187704df652b43d29de" }],
        "description": "collect user feedbacks",
        "deadline": 1609516800000,
        "completed": true,
        "status": "complete"
      }
    },
    {
      "record_id": "recAu2ReK0",
      "fields": {
        "description": "updated task"
      }
    }
  ]
}
```

**关键限制：每次最多 500 条记录。**

---

## 10. 删除记录（delete）

### 请求

```
DELETE /open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/:record_id
```

#### Query 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ignore_consistency_check | boolean | 否 | 是否忽略一致性检查 |

### 响应示例

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "deleted": true,
    "record_id": "recWqFb7xo"
  }
}
```

---

## 11. 批量删除记录（batch_delete）

### 请求

```
POST /open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/batch_delete
```

#### Request Body

```json
{
  "records": ["recwNXzPQv", "recWqFb7xo"]
}
```

**关键限制：每次最多 500 条记录。**

### 响应示例

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "records": [
      { "deleted": true, "record_id": "recWqFb7xo" }
    ]
  }
}
```

---

## 12. 字段类型与值格式

### 写入 vs 读取格式对比

| 字段类型 | type 值 | 写入格式 | 读取格式 |
|---------|---------|---------|---------|
| 文本 | 1 | `"string"` | `"string"` |
| 数字 | 2 | `100` | `100` |
| 单选 | 3 | `"选项名"` | `"选项名"` |
| 多选 | 4 | `["选项1", "选项2"]` | `["选项1", "选项2"]` |
| 日期 | 5 | `1674206443000`（毫秒时间戳） | `1674206443000` |
| 复选框 | 7 | `true` / `false` | `true` / `false` |
| 人员 | 11 | `[{ "id": "ou_xxx" }]` | `[{ "id": "ou_xxx", "name": "张三", "email": "xx@xx.com", "en_name": "ZhangSan", "avatar_url": "..." }]` |
| 电话 | 13 | `"13126166666"` | `"13126166666"` |
| 超链接 | 15 | `{ "text": "显示文字", "link": "https://..." }` | `{ "text": "显示文字", "link": "https://..." }` |
| 附件 | 17 | `[{ "file_token": "box_xxx" }]` | `[{ "file_token": "box_xxx", "name": "文件名", "size": 32975, "type": "image/jpeg", "url": "...", "tmp_url": "..." }]` |
| 创建时间 | 1001 | —（系统自动） | `1691049973000`（毫秒时间戳） |
| 修改时间 | 1002 | —（系统自动） | `1702455191000`（毫秒时间戳） |

### 关联字段类型

| 字段类型 | 写入格式 | 读取格式 |
|---------|---------|---------|
| 单向关联（single_link） | `["rec_xxx", "rec_yyy"]`（record_id 数组） | `[{ "record_ids": ["rec_xxx"], "table_id": "tbl_xxx", "text": "显示文本", "type": "text" }]` |
| 双向关联（duplex_link） | `["rec_xxx", "rec_yyy"]`（record_id 数组） | `[{ "record_ids": ["rec_xxx"], "table_id": "tbl_xxx", "text": "显示文本", "type": "text" }]` |

### 其他字段类型

| 字段类型 | 写入格式 | 读取格式 |
|---------|---------|---------|
| 条码（barcode） | `"123"` | `[{ "text": "123", "type": "text" }]` |
| 货币（currency） | `3`（数字） | `"1"`（字符串形式，待验证） |
| 评分（rating） | `3`（数字） | `3` |
| 进度（progress） | `0.25`（0~1 浮点数） | `"0.66"`（字符串形式，待验证） |
| 位置（location） | `"116.397755,39.903179"`（经纬度字符串） | `{ "location": "116.397755,39.903179", "name": "天安门广场", "address": "东长安街", "full_address": "...", "pname": "北京市", "cityname": "北京市", "adname": "东城区" }` |
| 自动编号（auto_number） | —（系统自动） | `"17"` |
| 公式（formula） | —（系统自动计算） | `[{ "text": "计算结果", "type": "text" }]` |
| 群组（GroupChat） | `[{ "id": "oc_xxx" }]` | `[{ "id": "oc_xxx", "name": "群组名", "avatar_url": "..." }]` |

### 注意事项

1. **人员字段**：写入时只需 `{ "id": "ou_xxx" }`，`id` 类型必须与 `user_id_type` 参数匹配
2. **附件字段**：必须先通过上传素材接口上传到该 Base，再使用 file_token
3. **跨应用 open_id**：不同应用的 open_id 不能互换，跨应用推荐使用 user_id
4. **日期字段**：使用毫秒时间戳（13 位数字）
5. **读取与写入差异**：读取时字段值包含更多信息（如人员的 name/email），写入时只需最小信息

---

## 13. Filter 筛选语法详解 ⭐ 重点

### 两种筛选格式对比

| | list 接口（已废弃） | search 接口（推荐） |
|---|---|---|
| 格式 | 表达式字符串 | JSON 结构化对象 |
| 传递方式 | Query 参数 filter | Request Body filter 字段 |
| 长度限制 | 2000 字符 | 2000 字符 |
| 嵌套能力 | 支持 AND/OR 嵌套 | 支持 children 嵌套 |

### search 接口 filter 结构

```json
{
  "conjunction": "and",       // 顶层连接词
  "children": [               // 子条件组（可选，用于嵌套）
    {
      "conjunction": "or",
      "conditions": [         // 叶子条件
        { "field_name": "职位", "operator": "is", "value": ["高级销售员"] },
        { "field_name": "职位", "operator": "is", "value": ["初级销售员"] }
      ]
    }
  ],
  "conditions": [             // 叶子条件（可选，与 children 平级）
    { "field_name": "状态", "operator": "isNot", "value": ["已完成"] }
  ]
}
```

### filter_info 对象字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| conjunction | string | 是 | `"and"`（满足所有条件）或 `"or"`（满足任一条件） |
| conditions | condition[] | 否 | 条件列表（叶子节点） |
| children | filter_info[] | 否 | 子条件组（嵌套节点） |

### condition 对象字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| field_name | string | 是 | 字段名（不是 field_id） |
| operator | string | 是 | 运算符 |
| value | string[] | 否 | 值数组（**始终为数组格式**） |

### 支持的运算符

| 运算符 | 说明 | 支持的字段类型 | 备注 |
|--------|------|--------------|------|
| `is` | 等于 | 全部类型 | value 是字符串数组，如 `["值"]` |
| `isNot` | 不等于 | 全部类型 | **不支持日期字段** |
| `contains` | 包含 | 文本 | **不支持日期字段** |
| `doesNotContain` | 不包含 | 文本 | **不支持日期字段** |
| `isEmpty` | 为空 | 全部类型 | **无需传 value** |
| `isNotEmpty` | 不为空 | 全部类型 | **无需传 value** |
| `isGreater` | 大于 | 数字、日期 | — |
| `isGreaterEqual` | 大于等于 | 数字、日期 | **不支持日期字段**（待验证） |
| `isLess` | 小于 | 数字、日期 | — |
| `isLessEqual` | 小于等于 | 数字、日期 | **不支持日期字段**（待验证） |
| `like` | 模糊匹配 | 全部 | **暂未支持** |
| `in` | IN 查询 | 全部 | **暂未支持** |

### filter 示例

#### 示例 1：简单等值查询

```json
{
  "filter": {
    "conjunction": "and",
    "conditions": [
      { "field_name": "状态", "operator": "is", "value": ["进行中"] }
    ]
  }
}
```

#### 示例 2：AND 多条件

```json
{
  "filter": {
    "conjunction": "and",
    "conditions": [
      { "field_name": "状态", "operator": "is", "value": ["进行中"] },
      { "field_name": "优先级", "operator": "is", "value": ["高"] },
      { "field_name": "数量", "operator": "isGreater", "value": ["100"] }
    ]
  }
}
```

#### 示例 3：嵌套 AND + OR

```json
{
  "filter": {
    "conjunction": "and",
    "children": [
      {
        "conjunction": "or",
        "conditions": [
          { "field_name": "职位", "operator": "is", "value": ["高级销售员"] },
          { "field_name": "职位", "operator": "is", "value": ["初级销售员"] }
        ]
      },
      {
        "conjunction": "or",
        "conditions": [
          { "field_name": "销售额", "operator": "is", "value": ["10000.0"] },
          { "field_name": "销售额", "operator": "is", "value": ["20000.0"] }
        ]
      }
    ]
  }
}
```
等价于 SQL：`WHERE (职位 = '高级销售员' OR 职位 = '初级销售员') AND (销售额 = 10000 OR 销售额 = 20000)`

#### 示例 4：查询空值

```json
{
  "filter": {
    "conjunction": "and",
    "conditions": [
      { "field_name": "备注", "operator": "isEmpty" },
      { "field_name": "状态", "operator": "isNotEmpty" }
    ]
  }
}
```

#### 示例 5：日期范围查询

```json
{
  "filter": {
    "conjunction": "and",
    "conditions": [
      { "field_name": "截止日期", "operator": "isGreater", "value": ["1672531200000"] },
      { "field_name": "截止日期", "operator": "isLess", "value": ["1675209600000"] }
    ]
  }
}
```

#### 示例 6：list 接口的表达式格式（已废弃）

```
filter=AND(CurrentValue.[状态]="进行中", CurrentValue.[数量]>100)
filter=OR(CurrentValue.[优先级]="高", CurrentValue.[优先级]="中")
```

---

## 14. 公共参数说明

### 用户 ID 类型（user_id_type）

| 值 | 说明 | 跨应用可用 |
|---|---|---|
| `open_id` | 应用维度用户标识（默认） | ❌ 不同应用不同 |
| `union_id` | 开发者维度用户标识 | ✅ 同一开发者下的应用相同 |
| `user_id` | 租户维度用户标识 | ✅ 同一租户内跨应用相同 |

### Path 参数通用说明

| 参数 | 说明 | 获取方式 |
|---|---|---|
| `app_token` | 多维表格标识 | URL 中 `/base/` 后面的部分，或 wiki 节点的 obj_token |
| `table_id` | 数据表标识 | URL 中 `table=` 后面的参数，或 list table 接口获取 |
| `record_id` | 记录标识 | 创建/查询记录时返回 |

### 幂等性（client_token）

- create 接口支持 `client_token` 参数（Query 参数，UUIDv4 格式）
- 同一 token 重复提交不会创建新记录
- **不传** = 新请求；**传了** = 幂等操作
- batch_create 也支持

### 一致性检查（ignore_consistency_check）

- 默认 `false`：确保读写一致性
- 设为 `true`：提升性能，但可能导致数据暂时不一致
- 适用于对性能敏感、可容忍短暂不一致的场景

---

## 15. 常见错误码

| 错误码 | HTTP | 说明 | 处理建议 |
|--------|------|------|----------|
| 1254003 | 200 | AppToken 错误 | 检查 app_token |
| 1254004 | 200 | Table id 错误 | 检查 table_id |
| 1254006 | 200 | Record id 错误 | 检查 record_id |
| 1254015 | 400 | 字段类型不匹配 | 检查字段值格式 |
| 1254018 | 200 | Filter 参数错误 | 参考 filter 指南修正 |
| 1254027 | 403 | 附件不属于应用 | 先上传到该 Base |
| 1254036 | 400 | Base 正在复制 | 稍后重试 |
| 1254041 | 200 | Table 未找到 | 检查 table_id |
| 1254043 | 200 | Record 未找到 | 检查 record_id |
| 1254045 | 200 | Field Name 未找到 | 检查字段名拼写 |
| 1254060-1254072 | 200 | 各类字段转换失败 | 检查对应字段类型的值格式 |
| 1254104 | 200 | 单次操作超 500 条 | 减少单次数量 |
| 1254130 | 200 | 单元格过大 | 减少数据量 |
| 1254290 | 200 | 请求过快 | 降频重试 |
| 1254291 | 200 | 写冲突 | **同一数据表不支持写接口并发调用** |
| 1254302 | 403 | 无权限 | 开启了高级权限，需添加包含应用的群组 |
| 1254607 | 400 | 数据未就绪 | 上次修改未处理完，适当重试 |
| 1255040 | 504 | 请求超时 | 重试 |

### 写冲突（1254291）特别说明

**同一数据表不支持并发调用写接口。** 写接口包括：
- 增删改记录
- 增删改字段
- 修改表单、视图等

如需批量操作，必须串行执行，不能并行。

---

## 附录：接口选择速查

| 场景 | 推荐接口 | 说明 |
|------|---------|------|
| 已知 record_id，批量获取详情 | **batch_get** | 最快，最多 500 个 |
| 按条件查询记录 | **search** | 支持 filter + sort + 分页 |
| 获取全部记录 | **search**（无 filter） | 分页遍历 |
| 创建单条 | **create** | 支持 client_token 幂等 |
| 批量创建 | **batch_create** | 最多 500 条 |
| 更新单条 | **update** | 只传需改的字段 |
| 批量更新 | **batch_update** | 最多 500 条 |
| 删除 | **delete** / **batch_delete** | 视数量选择 |