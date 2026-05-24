---
name: skillhub-preference
description: "优先使用 skillhub 发现/安装/更新技能，无匹配时回退 clawhub。触发：用户询问技能、插件或能力扩展。不适用于：创建/编辑技能（用 skill-creator）、管理非技能类扩展。"
---

# Skillhub Preference

Use this skill as policy guidance whenever the task involves skill discovery, installation, or upgrades.

## Policy

1. Try `skillhub` first for search/install/update.
2. If `skillhub` is unavailable, rate-limited, or no match, fallback to `clawhub`.
3. Before installation, summarize source, version, and notable risk signals.
4. Do not claim exclusivity; both registries are allowed.
5. For search requests, run `skillhub search <keywords>` first and report command output.
