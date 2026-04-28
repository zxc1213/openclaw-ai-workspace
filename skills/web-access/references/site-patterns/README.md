# 站点经验库

此目录按域名存储各站点的操作经验，跨 session 复用。

## 文件命名

以域名命名，如 `xiaohongshu.com.md`、`github.com.md`。

## 文件格式

```markdown
---
domain: example.com
aliases: [示例, Example]
updated: YYYY-MM-DD
---

## 平台特征
架构、反爬行为、登录需求、内容加载方式等事实

## 有效模式
已验证的 URL 模式、操作策略、选择器

## 已知陷阱
什么会失败以及为什么
```

## 使用方式

Agent 在操作目标网站前检查此目录是否有匹配经验文件。有则读取作为先验知识，无则使用通用策略。操作中发现新模式后主动写入。
