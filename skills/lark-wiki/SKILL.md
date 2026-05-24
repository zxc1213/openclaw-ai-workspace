---
name: lark-wiki
version: 1.0.0
description: "飞书知识库：管理知识空间和文档节点 — 创建/查询空间、管理节点层级、组织文档和快捷方式。触发：知识库, wiki, 知识空间, 文档节点. 不适用于：编辑文档内容（用 lark-doc）、非知识库云存储（用 lark-drive）。"
metadata:
  requires:
    bins: ["lark-cli"]
  cliHelp: "lark-cli wiki --help"
---

# wiki (v2)

**CRITICAL — 开始前 MUST 先用 Read 工具读取 [`../lark-shared/SKILL.md`](../lark-shared/SKILL.md)，其中包含认证、权限处理**

## API Resources

```bash
lark-cli schema wiki.<resource>.<method>   # 调用 API 前必须先查看参数结构
lark-cli wiki <resource> <method> [flags] # 调用 API
```

> **重要**：使用原生 API 时，必须先运行 `schema` 查看 `--data` / `--params` 参数结构，不要猜测字段格式。

### spaces

- `get` — 获取知识空间信息
- `get_node` — 获取知识空间节点信息
- `list` — 获取知识空间列表

### nodes

- `copy` — 创建知识空间节点副本
- `create` — 创建知识空间节点
- `list` — 获取知识空间子节点列表

## 权限表

| 方法 | 所需 scope |
|------|-----------|
| `spaces.get` | `wiki:space:read` |
| `spaces.get_node` | `wiki:node:read` |
| `spaces.list` | `wiki:space:retrieve` |
| `nodes.copy` | `wiki:node:copy` |
| `nodes.create` | `wiki:node:create` |
| `nodes.list` | `wiki:node:retrieve` |
