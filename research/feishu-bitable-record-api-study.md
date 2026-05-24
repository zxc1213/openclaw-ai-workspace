# 飞书多维表格记录 API 学习笔记

> 文档来源：飞书开放平台 https://open.feishu.cn/document/
> 整理时间：2026-04-05

---

## 目录

1. [API 概览](#1-api-概览)
2. [批量获取记录 batch_get](#2-批量获取记录-batch_get)
3. [新增记录 create](#3-新增记录-create)
4. [更新记录 update](#4-更新记录-update)
5. [删除记录 delete](#5-删除记录-delete)
6. [列出记录 list（历史接口）](#6-列出记录-list历史接口)
7. [各接口关联关系与最佳实践](#7-各接口关联关系与最佳实践)
8. [附录：常见错误码速查](#8-附录常见错误码速查)

---

## 1. API 概览

所有记录 API 共享相同的基础路径前缀：

```
https://open.feishu.cn/open-apis/bitable/v1/apps/:app_token/tables/:table_id/records
```

### 通用路径参数

| 参数 | 类型 | 说明 |
|---|---|---|
| `app_token` | string | 多维表格（Base）的唯一标识，长度 0-100 字符 |
| `table_id` | string | 数据表唯一标识，长度 0-50 字符 |

### 通用认证方式

请求头需携带 `Authorization: Bearer <access_token>`，支持两种 token：
- **tenant_access_token** — 应用级别（应用身份）
- **user_access_token** — 用户级别（用户身份）

### API 速查表

| 操作 | 方法 | 路径 | 频率限制 |
|---|---|---|---|
| 批量获取 | POST | `.../records/batch_get` | 20 次/秒 |
| 新增记录 | POST | `.../records` | 50 次/秒 |
| 更新记录 | PUT | `.../records/:record_id` | 50 次/秒 |
| 删除记录 | DELETE | `.../records/:record_id` | 50 次/秒 |
| 列出记录（历史） | GET | `.../records` | 20 次/秒 |

### 权限要求速查

| 操作 | 所需权限（满足其一即可） |
|---|---|
| 批量获取 | `bitable:app:readonly` / `bitable:app` / `base:record:read` |
| 新增记录 | `bitable:app` / `base:record:create` |
| 更新记录 | `bitable:app` / `base:record:update` |
| 删除记录 | `bitable:app` / `base:record:delete` |
| 列出记录 | `bitable:app:readonly` / `bitable:app` |

> **注意**：如果 Base 开启了高级权限，调用身份需要有管理权限，否则可能返回空数据。

---

## 2. 批量获取记录 batch_get

### 接口说明

根据记录 ID 列表批量获取记录。**最多支持 100 条记录**。

### 请求

```
POST /open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/batch_get
```

#### 请求体参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `record_ids` | string[] | ✅ | 记录 ID 列表，1~100 个 |
| `user_id_type` | string | ❌ | 用户 ID 类型：`open_id` / `union_id` / `user_id` |
| `with_shared_url` | boolean | ❌ | 是否返回记录分享链接，默认 false |
| `automatic_fields` | boolean | ❌ | 是否返回自动计算字段（创建人、创建时间等），默认 false |

#### HTTP 请求示例

```bash
curl -X POST 'https://open.feishu.cn/open-apis/bitable/v1/apps/NQRxbRkBMa6OnZsjtERcxhNWnNh/tables/tbl0xe5g8PP3U3cS/records/batch_get' \
  -H 'Authorization: Bearer t-g1042xxxxx' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -d '{
    "record_ids": ["recyOaMB2F", "rec111111", "recyOaMB2F"],
    "user_id_type": "open_id",
    "with_shared_url": true,
    "automatic_fields": true
  }'
```

### 响应体结构

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "records": [
      {
        "record_id": "recyOaMB2F",
        "fields": {
          "单选": "选项1",
          "多选": ["选项1", "选项2"],
          "数字": 2323.2323,
          "日期": 1690992000000,
          "复选框": true,
          "电话号码": "131xxxx6666",
          "进度": 0.66,
          "评分": 3,
          "货币": 1,
          "人员": [{"id": "ou_xxx", "name": "张三", "email": "...", "en_name": "ZhangSan", "avatar_url": "..."}],
          "群组": [{"id": "oc_xxx", "name": "武侠聊天组", "avatar_url": "..."}],
          "超链接": {"link": "https://...", "text": "显示文本"},
          "附件": [{"file_token": "xxx", "name": "file.jpg", "size": 32975, "type": "image/jpeg", "url": "..."}],
          "单向关联": {"link_record_ids": ["recnVYsuqV"]},
          "双向关联": {"link_record_ids": ["recqLvMaXT", "recrdld32q"]},
          "地理位置": {"location": "116.397755,39.903179", "name": "天安门广场", "address": "东长安街", "full_address": "..."},
          "多行文本": [{"text": "文本内容", "type": "text"}, {"text": "@张三", "type": "mention", "token": "ou_xxx"}],
          "条码": [{"text": "123", "type": "text"}],
          "自动编号": "17"
        },
        "created_by": {"id": "ou_xxx", "name": "测试1", "en_name": "...", "email": "", "avatar_url": "..."},
        "created_time": 1691049973000,
        "last_modified_by": {"id": "ou_xxx", "name": "测试1", ...},
        "last_modified_time": 1702455191000,
        "shared_url": "https://example.feishu.cn/record/KBcNrNtpWePAlscCvdmb6ZcSc5b"
      }
    ],
    "forbidden_record_ids": ["recyOaMB2F"],
    "absent_record_ids": ["rec111111"]
  }
}
```

#### 响应体字段说明

| 字段 | 类型 | 说明 |
|---|---|---|
| `records` | array | 成功获取的记录列表 |
| `records[].record_id` | string | 记录唯一 ID |
| `records[].fields` | map | 字段值映射（key 为字段名） |
| `records[].created_by` | object | 创建者信息 |
| `records[].created_time` | int | 创建时间（毫秒时间戳） |
| `records[].last_modified_by` | object | 最后修改者信息 |
| `records[].last_modified_time` | int | 最后修改时间（毫秒时间戳） |
| `records[].shared_url` | string | 记录分享链接 |
| `forbidden_record_ids` | string[] | **被禁止访问**的记录 ID（高级权限场景） |
| `absent_record_ids` | string[] | **不存在**的记录 ID |

### 关键注意事项

- 重复传入同一个 record_id 只会返回一条结果
- `forbidden_record_ids` 告诉你哪些记录因为权限问题无法读取
- `absent_record_ids` 告诉你哪些记录 ID 根本不存在
- `record_url` 字段在此接口**不返回**，仅在 retrieve（单条获取）接口返回

---

## 3. 新增记录 create

### 接口说明

在指定数据表中新增一条记录。

### 请求

```
POST /open-apis/bitable/v1/apps/:app_token/tables/:table_id/records
```

#### 查询参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `user_id_type` | string | ❌ | 用户 ID 类型：`open_id`（默认）/ `union_id` / `user_id` |
| `client_token` | string | ❌ | 幂等操作标识，UUID v4 格式。相同 client_token 的请求不会重复创建 |
| `ignore_consistency_check` | boolean | ❌ | 是否忽略读写一致性检查，默认 false |

#### 请求体参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `fields` | map<string, union> | ✅ | 记录字段值 |

#### 字段类型与数据格式

| 字段类型 | 传入格式 | 示例 |
|---|---|---|
| 文本 Text | string | `"text": "HelloWorld"` |
| 数字 Number | number | `"number": 100` |
| 单选 Single Select | string | `"single_select": "选项1"`（新选项会自动创建） |
| 多选 Multi Select | string[] | `"multi_select": ["选项1", "选项2"]` |
| 日期 Date | 毫秒时间戳 | `"date": 1674206443000` |
| 复选框 Checkbox | boolean | `"checkbox": true` |
| 人员 Person | object[] | `"user": [{"id": "ou_xxx"}]` |
| 群组 Group | object[] | `"GroupChat": [{"id": "oc_xxx"}]` |
| 电话号码 Phone | string | `"phone": "13026162666"` |
| 超链接 URL | object | `"url": {"text": "显示文本", "link": "https://..."}` |
| 附件 Attachment | object[] | `"attachment": [{"file_token": "DRiFb..."}]`（需先上传） |
| 单向关联 | string[] | `"single_link": ["recHTLvO7x"]` |
| 双向关联 | string[] | `"duplex_link": ["recHTLvO7x", "recbS8zb2m"]` |
| 地理位置 Location | string | `"location": "116.397755,39.903179"` |
| 条码 Barcode | string | `"barcode": "+$$3170930509104X512356"` |
| 评分 Rating | number | `"rating": 3` |
| 货币 Currency | number | `"currency": 3` |
| 进度 Progress | number | `"progress": 0.25` |

> **重要**：人员字段的 `id` 类型必须与 `user_id_type` 查询参数一致。跨应用传 open_id 不可用，建议使用 `user_id`。

#### HTTP 请求示例

```bash
curl -X POST 'https://open.feishu.cn/open-apis/bitable/v1/apps/appbcbWCzen6D8dezhoCH2RpMAh/tables/tblsRc9GRRXKqhvW/records?user_id_type=open_id' \
  -H 'Authorization: Bearer t-g1042xxxxx' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -d '{
    "fields": {
      "text": "text",
      "number": 100,
      "single_select": "option_1",
      "multi_select": ["option_1", "option_2"],
      "date": 1674206443000,
      "checkbox": true,
      "user": [{"id": "ou_2910013f1e6456f16a0ce75ede950a0a"}],
      "url": {"text": "Base", "link": "https://www.feishu.cn/product/base"},
      "attachment": [{"file_token": "DRiFbwaKsoZaLax4WKZbEGCccoe"}],
      "single_link": ["recHTLvO7x", "recbS8zb2m"],
      "duplex_link": ["recHTLvO7x"],
      "location": "116.397755,39.903179"
    }
  }'
```

### 响应体结构

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "record": {
      "record_id": "reclAqylTN",
      "fields": { /* 同请求传入的 fields */ }
    }
  }
}
```

### 关键注意事项

- **幂等性**：使用 `client_token`（UUID v4）防止重复创建。同一 client_token 在 1 小时内重复请求会返回相同结果
- **附件限制**：附件需先通过 [upload material](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/upload_all) 接口上传到该 Base
- **单次限制**：每次最多创建 500 条记录
- **总限制**：单个 Base 最多 20,000 条记录

---

## 4. 更新记录 update

### 接口说明

更新指定记录的字段值。**只更新传入的字段，未传入的字段保持不变**（部分更新）。

### 请求

```
PUT /open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/:record_id
```

#### 路径参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `record_id` | string | ✅（路径中） | 要更新的记录 ID |

#### 查询参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `user_id_type` | string | ❌ | 用户 ID 类型 |
| `ignore_consistency_check` | boolean | ❌ | 是否忽略一致性检查 |

#### 请求体参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `fields` | map<string, union> | ✅ | 要更新的字段值（只需传需要更新的字段） |

#### HTTP 请求示例

```bash
curl -X PUT 'https://open.feishu.cn/open-apis/bitable/v1/apps/appbcbWCzen6D8dezhoCH2RpMAh/tables/tblsRc9GRRXKqhvW/records/recPGfZZ13?user_id_type=open_id' \
  -H 'Authorization: Bearer t-g1042xxxxx' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -d '{
    "fields": {
      "text": "updated text",
      "number": 200,
      "single_select": "option_2"
    }
  }'
```

### 响应体结构

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "record": {
      "record_id": "reclAqylTN",
      "fields": { /* 更新后的完整字段值 */ }
    }
  }
}
```

### 关键注意事项

- **部分更新**：只需传入要修改的字段，其他字段不受影响
- **并发限制**：同一数据表不支持并发调用写接口（包括增、改、删记录，增、改、删字段，修改视图等）
- **双向关联字段**：必须是字符串数组格式
- **数据源同步表**：从其他数据源同步的数据表不支持修改

---

## 5. 删除记录 delete

### 接口说明

删除指定的一条记录。

### 请求

```
DELETE /open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/:record_id
```

#### 路径参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `record_id` | string | ✅（路径中） | 要删除的记录 ID |

#### 查询参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `ignore_consistency_check` | boolean | ❌ | 是否忽略一致性检查，默认 false |

#### HTTP 请求示例

```bash
curl -X DELETE 'https://open.feishu.cn/open-apis/bitable/v1/apps/appbcbWCzen6D8dezhoCH2RpMAh/tables/tblsRc9GRRXKqhvW/records/recpCsf4ME' \
  -H 'Authorization: Bearer t-7f1Bxxxxx8e560'
```

### 响应体结构

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

### 关键注意事项

- **不可恢复**：删除后无法通过 API 恢复，请在调用前确认
- **权限要求**：调用身份必须有 Base 的编辑权限
- **数据源同步表**：从其他数据源同步的表不支持删除

---

## 6. 列出记录 list（历史接口）

### 接口说明

列出数据表中的记录，支持分页、筛选和排序。最多返回 500 条/页。

> ⚠️ **此接口已标记为历史接口，官方推荐使用 [Query Record](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search) 接口替代。** 但因 list 接口仍有广泛使用，此处保留完整笔记。

### 请求

```
GET /open-apis/bitable/v1/apps/:app_token/tables/:table_id/records
```

#### 查询参数详解

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `page_size` | int | ❌ | 20 | 分页大小，最大 500 |
| `page_token` | string | ❌ | — | 分页标识，首次不传，后续使用响应中的 page_token |
| `view_id` | string | ❌ | — | 视图 ID，指定后返回该视图下的记录 |
| `filter` | string | ❌ | — | 筛选条件，最多 2000 字符 |
| `sort` | string | ❌ | — | 排序条件，最多 1000 字符 |
| `field_names` | string | ❌ | — | 指定返回的字段（JSON 数组字符串） |
| `user_id_type` | string | ❌ | open_id | 用户 ID 类型 |
| `text_field_as_array` | boolean | ❌ | false | 文本字段值是否以数组结构返回 |
| `display_formula_ref` | boolean | ❌ | false | 公式字段/查找引用是否返回原始值 |
| `automatic_fields` | boolean | ❌ | false | 是否返回自动计算字段 |

#### 筛选条件（filter）语法

```
AND(CurrentValue.[字段名] > 值, CurrentValue.[字段名] < 值)
OR(CurrentValue.[字段名] = "文本值")
```

**支持的逻辑连接词**：`AND(...)` / `OR(...)` / `NOT(...)`

**支持的比较运算符**：

| 运算符 | 说明 | 示例 |
|---|---|---|
| `=` | 等于 | `CurrentValue.[状态] = "进行中"` |
| `!=` | 不等于 | `CurrentValue.[状态] != "已完成"` |
| `>` | 大于 | `CurrentValue.[数字] > 100` |
| `<` | 小于 | `CurrentValue.[日期] < 1674206443000` |
| `>=` | 大于等于 | `CurrentValue.[进度] >= 0.5` |
| `<=` | 小于等于 | `CurrentValue.[评分] <= 3` |
| `IS_EMPTY` | 为空 | `CurrentValue.[备注] IS_EMPTY` |
| `IS_NOT_EMPTY` | 不为空 | `CurrentValue.[备注] IS_NOT_EMPTY` |
| `CONTAINS` | 包含 | `CurrentValue.[标题] CONTAINS "测试"` |
| `NOT_CONTAINS` | 不包含 | `CurrentValue.[标题] NOT_CONTAINS "测试"` |

**filter 长度限制**：最多 **2000 字符**

#### 排序条件（sort）语法

```json
["fieldName1 DESC", "fieldName2 ASC"]
```

- 降序：`DESC`
- 升序：`ASC`
- 多字段排序：按数组顺序排列

**sort 长度限制**：最多 **1000 字符**

#### 分页机制

1. 首次请求不传 `page_token`
2. 响应中 `has_more: true` 表示还有更多数据
3. 使用响应中的 `page_token` 作为下一次请求的 `page_token`
4. `page_token` 是一个 **游标**（cursor），不是页码

```
请求1: GET .../records?page_size=100
响应1: {"has_more": true, "page_token": "recP750ZNJ", "total": 350, "items": [...]}

请求2: GET .../records?page_size=100&page_token=recP750ZNJ
响应2: {"has_more": true, "page_token": "recG70uhxh", "total": 350, "items": [...]}
```

#### HTTP 请求示例

```bash
# 基本列表
curl 'https://open.feishu.cn/open-apis/bitable/v1/apps/bascnd0HM3KAyiZJELxfMHRrGZc/tables/tblEGB3HKvDrpj71/records?page_size=10&user_id_type=open_id' \
  -H 'Authorization: Bearer t-g1042xxxxx'

# 带筛选和排序
curl 'https://open.feishu.cn/open-apis/bitable/v1/apps/bascnd0HM3KAyiZJELxfMHRrGZc/tables/tblEGB3HKvDrpj71/records?page_size=20&filter=AND(CurrentValue.[状态]="进行中",CurrentValue.[优先级]="高")&sort=["创建时间 DESC"]&user_id_type=open_id' \
  -H 'Authorization: Bearer t-g1042xxxxx'
```

### 响应体结构

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total": 8,
    "has_more": true,
    "page_token": "recG70uhxh",
    "items": [
      {
        "record_id": "recG70uhxh",
        "fields": {
          "primary": "primary",
          "text": "text",
          "number": "100",
          /* ... 其他字段 */
        }
      }
    ]
  }
}
```

#### 响应体字段说明

| 字段 | 类型 | 说明 |
|---|---|---|
| `total` | int | 符合条件的记录总数 |
| `has_more` | boolean | 是否还有更多数据 |
| `page_token` | string | 下一页的分页标识 |
| `items` | array | 记录列表 |

---

## 7. 各接口关联关系与最佳实践

### 接口关联关系图

```
┌─────────────────────────────────────────────────┐
│           飞书多维表格 Base (app_token)            │
│  ┌─────────────────────────────────────────┐    │
│  │    数据表 Table (table_id)               │    │
│  │                                          │    │
│  │  ┌─── list (GET) ──→ 获取记录列表 ──────┐ │    │
│  │  │   ↓ (得到 record_id)                 │ │    │
│  │  ├── batch_get (POST) ──→ 批量获取记录  │ │    │
│  │  │                                     │ │    │
│  │  ├── create (POST) ──→ 新增记录         │ │    │
│  │  │   ↓ (返回 record_id)                 │ │    │
│  │  │                                     │ │    │
│  │  ├── update (PUT) ──→ 更新记录           │ │    │
│  │  │   (需要 record_id)                   │ │    │
│  │  │                                     │ │    │
│  │  └── delete (DELETE) ──→ 删除记录        │ │    │
│  │      (需要 record_id)                   │ │    │
│  └──────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### 典型工作流

#### 工作流 1：创建并确认
```
create → 获取 record_id → batch_get 确认数据
```

#### 工作流 2：查询并更新
```
list (带 filter) → 获取 record_id → update 修改
```

#### 工作流 3：批量处理
```
list (分页遍历) → 收集 record_id 列表 → batch_get 批量获取
```

### 最佳实践

1. **使用 list 替代方案**：list 接口已标记为历史接口，新项目建议使用 [Query Record (search)](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search) 接口

2. **分页遍历**：使用游标式分页（page_token），不要假设数据量小就一次性获取
   ```python
   page_token = None
   all_records = []
   while True:
       params = {"page_size": 500}
       if page_token:
           params["page_token"] = page_token
       resp = requests.get(url, params=params, headers=headers)
       data = resp.json()["data"]
       all_records.extend(data["items"])
       if not data["has_more"]:
           break
       page_token = data["page_token"]
   ```

3. **幂等性保护**：
   - create 时使用 `client_token`（UUID v4）防止重复创建
   - update 时不需要额外幂等处理（PUT 天然幂等）

4. **并发控制**：
   - 同一数据表的写接口（create/update/delete + 字段/视图修改）**不支持并发**
   - 遇到 `1254291` 错误码表示写冲突，需要串行重试

5. **错误码 1254607 重试**：数据未就绪时可适当重试（通常是上一次修改未处理完，或数据量过大导致超时）

6. **高级权限注意**：
   - 开启高级权限后，需确保调用身份有管理权限
   - 需在高级权限设置中添加包含应用的群组并赋予读写权限
   - 特定行列权限仅支持商业版和企业版

7. **人员字段注意事项**：
   - `user_id_type` 必须与传入的 ID 类型匹配
   - 跨应用传 `open_id` 不可用，建议用 `user_id`
   - 人员字段值必须为数组格式：`[{"id": "ou_xxx"}]`

8. **附件字段**：
   - 必须先上传到该 Base，再在记录中引用 `file_token`
   - 附件必须属于当前 Base，否则返回 `1254303`

9. **数据量限制**：
   - 单次批量获取：最多 100 条
   - 单次新增：最多 500 条
   - 单页列表：最多 500 条
   - Base 总记录数：最多 20,000 条
   - Base 数据表数：最多 300 个
   - 视图数：最多 200 个

---

## 8. 附录：常见错误码速查

| 错误码 | HTTP 状态码 | 说明 | 建议 |
|---|---|---|---|
| 1254003 | 400 | WrongBaseToken | 检查 app_token 是否正确 |
| 1254004 | 400 | WrongTableId | 检查 table_id 是否正确 |
| 1254006 | 400 | WrongRecordId | 检查 record_id 是否正确 |
| 1254010 | 400 | ReqConvError | 请求参数格式错误 |
| 1254015 | 400 | Field types do not match | 字段值类型与字段定义不匹配 |
| 1254018 | 400 | InvalidFilter | filter 语法错误，参考[筛选开发指南](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/record-filter-guide) |
| 1254107 | 400 | FilterLengthExceedLimit | filter 超过 2000 字符限制 |
| 1254108 | 400 | SortLengthExceedLimit | sort 超过 1000 字符限制 |
| 1254290 | 400 | TooManyRequest | 请求过快，稍后重试 |
| 1254291 | 400 | Write conflict | 同一表并发写冲突 |
| 1254301 | 400 | OperationTypeError | 未开启高级权限或不支持 |
| 1254302 | 403 | Permission denied | 无访问权限（高级权限场景） |
| 1254303 | 403 | AttachPermNotAllow | 附件不属于此 Base |
| 1254304 | 403 | Permission denied | 行列高级权限仅商业/企业版支持 |
| 1254607 | 400 | Data not ready | 数据未就绪，可重试 |
| 1254608 | 403 | ReqRecommited | 重复提交相同请求 |
| 1254036 | 400 | Base is copying | Base 正在复制中，稍后重试 |
| 1254040 | 404 | BaseTokenNotFound | app_token 不存在 |
| 1254041 | 404 | TableIdNotFound | table_id 不存在 |
| 1254043 | 404 | RecordIdNotFound | record_id 不存在 |
| 1255001 | 500 | InternalError | 服务端内部错误 |
| 1255040 | 504 | Request timed out | 请求超时，重试 |

---

## 参考链接

- [批量获取记录 API](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/batch_get)
- [新增记录 API](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/create)
- [更新记录 API](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/update)
- [删除记录 API](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/delete)
- [列出记录 API（历史）](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/list)
- [查询记录 API（推荐）](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search)
- [记录筛选开发指南](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/record-filter-guide)
- [记录数据结构概览](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/bitable-record-data-structure-overview)