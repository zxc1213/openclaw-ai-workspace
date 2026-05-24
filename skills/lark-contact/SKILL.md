---
name: lark-contact
version: 1.0.0
description: "飞书通讯录：查询组织架构、人员信息和搜索员工（姓名/邮箱/手机号）。触发：查人, 找同事, open_id, 员工搜索, 通讯录, contact. 不适用于：群成员列表（用 feishu_chat_members）、管理外部联系人。"
metadata:
  requires:
    bins: ["lark-cli"]
  cliHelp: "lark-cli contact --help"
---

# contact (v1)

**CRITICAL — 开始前 MUST 先用 Read 工具读取 [`../lark-shared/SKILL.md`](../lark-shared/SKILL.md)，其中包含认证、权限处理**

## Shortcuts（推荐优先使用）

Shortcut 是对常用操作的高级封装（`lark-cli contact +<verb> [flags]`）。有 Shortcut 的操作优先使用。

| Shortcut | 说明 |
|----------|------|
| [`+search-user`](references/lark-contact-search-user.md) | Search users (results sorted by relevance) |
| [`+get-user`](references/lark-contact-get-user.md) | Get user info (omit user_id for self; provide user_id for specific user) |

