# Session: 2026-04-06 10:59:00 UTC

- **Session Key**: agent:main:feishu:direct:ou_dfe4cec8ab70368885235d951a935ccd
- **Session ID**: 74b093d9-9717-4545-a974-c774e13e0a3b
- **Source**: feishu

## Conversation Summary

user: A new session was started via /new or /reset. Run your Session Startup sequence - read the required files before responding to the user. Then greet the user in your configured persona, if one is provided. Be yourself - use your defined voice, mannerisms, and mood. Keep it to 1-3 sentences and ask what they want to do. If the runtime model differs from default_model in the system prompt, mention the default model. Do not mention internal steps, files, tools, or reasoning.
Current time: Monday, April 6th, 2026 - 6:54 PM (Asia/Shanghai) / 2026-04-06 10:54 UTC
assistant: 🌙 嘿 Ray，晚上好。新会话已就绪，有什么想搞的？
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Mon 2026-04-06 18:54 GMT+8] openclaw 更新了什么
assistant: 当前版本是 **OpenClaw 2026.4.5** (3e72c03)。我去查一下从上次记录的版本到现在更新了什么。
assistant: 这是个大版本更新。让我整理下重点：

---

**OpenClaw 2026.4.5** 更新要点（从 2026.3.31 升级）

### 🆕 新功能

**多媒体生成**
- 新增 `video_generate` 和 `music_generate` 内置工具，支持视频/音乐生成
- 新增 ComfyUI 插件，支持本地 ComfyUI 和 Comfy Cloud 工作流
- 视频：xAI (grok-imagine-video)、阿里 Model Studio Wan、Runway
- 音乐：Google Lyria、MiniMax

**新 Provider**
- Qwen、Fireworks AI、StepFun 内置支持
- MiniMax TTS、Ollama Web Search、MiniMax Search
- Amazon Bedrock Mantle 支持（自动推理 profile 发现）

**Memory Dreaming（实验性）**
- 全新记忆系统：短期记忆加权晋升、三阶段协作（light/deep/REM）
- `/dreaming` 命令 + Dreams UI
- 可配置老化控制

**Control UI**
- 多语言支持（含简体中文）
- Skills 面板直接搜索/安装 ClawHub 技能
- 会话级 thinking-level 选择器

**安全增强**
- Claude CLI 安全加固：清除继承的 config/plugin env，防止被重定向到非预期后端
- 设备配对安全：非 operator 设备只能管理自己的 token
- 浏览器 SSRF 防护增强
- 插件工具白名单限制更严格

**Prompt Cache 优化**
- 大幅提升缓存命中率：确定性 MCP 排序、系统 prompt 指纹稳定化、移除重复工具清单

### 🔧 重要改进

- **飞书**：reasoning preview 只在 `reasoning:stream` 时才暴露
- **Claude CLI MCP Bridge**：OpenClaw 工具可通过 MCP 暴露给 Claude CLI 后台运行
- **ACPX**：运行时嵌入，移除外部 CLI 依赖
- **Cron**：重启后立即重播中断的定时任务；失败通知走主投递通道
- **Exec 审批**：iOS APNs 推送审批、Matrix 原生审批、`--force` 安装插件

### ⚠️ Breaking Change
移除一批旧版配置别名（`talk.voiceId`、`agents.*.sandbox.perSession` 等），有 `openclaw doctor --fix` 迁移支持

### 🐛 关键修复
- Telegram/WhatsApp/Discord/Matrix/Slack/Teams 多渠道修复
- GPT-5 strict schema 兼容
- Kimi 工具调用解析
- Z.AI GLM-5-turbo 变体保留
- Windows/macOS 网关重启可靠性

---

量很大，你最关心哪块？我可以展开说。
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Mon 2026-04-06 18:57 GMT+8] 你检查下配置，那个dreaming，你能用吗，其他升级改进，对我们的影响。哪些是我需要用、需要知道的
assistant: 现在让我查下 dreaming 相关的配置 schema：
