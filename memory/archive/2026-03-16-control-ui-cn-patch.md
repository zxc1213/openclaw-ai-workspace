# Session: 2026-03-16 09:21:13 UTC

- **Session Key**: agent:main:main
- **Session ID**: 240c6267-3710-4bf6-8428-875150d944cd
- **Source**: webchat

## Conversation Summary

assistant: 这些都是 OpenClaw 内置的 skills，随安装包自带，不需要也无法单独卸载。它们只是在有对应条件时才会被激活。

让我看看你当前实际启用了哪些：
assistant: 当前状态：**52 个内置 skill，只有 6 个 ready，其余 46 个都是 missing**（缺少依赖 CLI）。

**✅ 已就绪（6 个）：**

| Skill | 说明 | 你用得上吗？ |
|-------|------|------------|
| coding-agent | 委托编码任务给 Codex/Claude Code | ✅ 有码农1号在用 |
| healthcheck | 安全审计 | ✅ 刚用过 |
| node-connect | 设备连接诊断 | ⚠️ 可能有用 |
| skill-creator | 创建/管理 skill | ⚠️ 可能有用 |
| tmux | 远程控制 tmux | ⚠️ 看你是否用 tmux |
| weather | 天气查询 | ✅ 实用 |

**关于"关闭"：** 这些都是内置 skill，随 OpenClaw 安装包自带，**无法卸载**。它们只是因为没有安装对应的 CLI 工具所以显示 missing，不会消耗资源，也不会被动触发。

**总结：** 没有需要关闭的东西。missing 的 skill 不会被加载，不占资源，等哪天你装了对应工具就自动可用了。

你觉得这 6 个 ready 的 skill 都需要保留吗？
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Mon 2026-03-16 16:35 GMT+8] 保留
assistant: 👌 都保留，没变化。还有什么要调整的吗？
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Mon 2026-03-16 16:36 GMT+8] 帮我汉化 control ui 的设置界面
assistant: Control UI 是打包后的 JS 文件（~600KB），没有源码可编辑，汉化需要从源码构建或者通过其他方式。

我查一下有没有官方的 i18n/本地化支持：
assistant: 好消息！OpenClaw 的 Control UI **已经内置了简体中文支持**，包括完整的 cron 翻译。

你只需要在 Control UI 的 **概览（Overview）** 页面找到 **Language** 下拉框，选择 **"简体中文"** 就可以了。

不需要我动手改任何代码 🌙
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Mon 2026-03-16 16:37 GMT+8] 我选了，但是感觉不生效，主界面是中文的，设置相关界面仍然是英文的
assistant: 内置的简体中文翻译**不完整**——目前只覆盖了这些页面：

- ✅ 主导航栏、概览页、定时任务页、聊天页
- ❌ **设置页、节点页、会话页、配置页、技能页等仍然是英文**

这是 OpenClaw 上游的翻译没做完，不是你的问题。

**目前的选项：**

1. **等上游补全** — 向 OpenClaw 提 issue 或 PR 贡献翻译
2. **我帮你补全** — 在打包后的 JS 里硬改，但每次更新会丢失
3. **先这样用** — 核心页面（聊天、定时任务）已经是中文了，设置页偶尔用问题不大

你倾向哪个？
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Mon 2026-03-16 16:48 GMT+8] 你帮我补全
assistant: 这是个不小的工程。让我先了解清楚需要翻译的范围，然后制定方案。

**方案：** 在 index.html 中注入一个翻译补丁脚本，用 MutationObserver 监听 DOM 变化，自动替换英文文本。更新 OpenClaw 后需要重新注入。

先让我看看各个未翻译页面都有哪些内容：
assistant: 工作量比较大，我需要从各个源码 map 文件中提取硬编码的英文字符串。让我用一个子代理来做这个工作——提取所有需要翻译的字符串并生成补丁脚本。
assistant: 已经启动子代理来处理这个工作了。它会：

1. 从源码 map 中提取所有页面的硬编码英文字符串
2. 生成一个完整的中文翻译映射表
3. 创建一个 DOM 补丁脚本
4. 注入到 Control UI 的 index.html

完成后会自动通知我，我再告诉你结果。这个工作可能需要几分钟 ⏳
assistant: 搞定了 ✅

**已完成的工作：**

1. **创建了翻译补丁脚本** — 约 350 条英文→中文映射，覆盖所有主要页面
2. **部署到 Control UI** — 脚本已注入到 index.html，刷新浏览器即可生效
3. **备份了原始 index.html** — index.html.bak

**覆盖的页面：** 概览、代理、会话、技能、频道、实例、节点、调试、日志、定时任务、设置（外观/基础设施/自动化/AI）、聊天、使用情况

**⚠️ 注意：** OpenClaw 更新后补丁会被覆盖，届时需要重新部署。补丁脚本源文件在 `~/.openclaw/workspace/control-ui-zh-patch.js`。

你现在刷新一下 Control UI 看看效果？如果有些翻译不准确或遗漏，告诉我就行，我可以直接改映射表。
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Mon 2026-03-16 17:20 GMT+8] /newq
