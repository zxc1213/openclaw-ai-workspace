---
name: lark-knowledge-sync
description: "本地 Markdown 文件与飞书知识库双向同步 — 本地→飞书（创建/更新文档）或飞书→本地。触发：同步到飞书, 从飞书拉取, 备份到知识库, 本地飞书同步, knowledge sync. 需要本地 Markdown 文件和 lark-cli 认证。 不适用于：实时协作（直接用 lark-wiki）、非 Markdown 文件同步。"
---

# 飞书知识库同步

本地 ↔ 飞书知识库双向同步。

## 核心原则

- 本地和飞书**两边都保留**，不删任何一边
- 同步前确认目标位置（知识库/空间/节点）
- 大文件分批处理，避免上下文溢出

## 同步模式

### Mode 1: 本地 → 飞书（Push）

适用场景：学习笔记、技术文档、简报成果沉淀到飞书

```
输入: 本地 .md 文件路径 + 目标飞书位置
流程:
  1. 读取本地文件内容
  2. 确认目标（知识空间 ID 或 wiki 节点 URL）
  3. 用 feishu_create_doc 创建文档
  4. 记录同步映射（本地路径 → 飞书 URL）
```

**目标确认优先级：**
- 用户指定了空间/节点 → 直接用
- 没指定 → 先 `feishu_wiki_space list` 展示列表让用户选择

### Mode 2: 飞书 → 本地（Pull）

适用场景：从飞书知识库拉取文档到本地编辑

```
输入: 飞书文档 URL 或 wiki token
流程:
  1. 用 feishu_fetch_doc 获取内容
  2. 保存到本地 workspace 对应位置
  3. 记录同步映射
```

### Mode 3: 双向状态检查

```
输入: 无（或指定目录）
流程:
  1. 读取同步映射文件
  2. 对比本地文件 mtime 和飞书文档 last_modified_time
  3. 标记哪些需要 push、哪些需要 pull、哪些已同步
```

## 同步映射

维护 `~/.openclaw/workspace/.sync-map.json`：

```json
{
  "files": [
    {
      "local": "glm-coding-study-beginner.md",
      "feishu_url": "https://xxx.feishu.cn/wiki/...",
      "node_token": "...",
      "last_sync": "2026-04-05T02:00:00+08:00",
      "direction": "push"
    }
  ]
}
```

## 批量同步

对多个文件时：
1. 先读取所有文件，计算总大小
2. 如果总内容 > 50KB → 分批创建（每批 3-5 个文档）
3. 每批完成后更新映射

## 关键注意事项

- `feishu_create_doc` 支持直接从 Markdown 创建，优先使用
- 已存在的文档用 `feishu_update_doc` 的 overwrite 模式
- 图片/附件需要先上传再引用
- 知识库节点层级：空间 > 目录 > 文档，创建前确认层级
