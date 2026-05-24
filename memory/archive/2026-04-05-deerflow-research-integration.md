# Session: 2026-04-05 06:54:18 UTC

- **Session Key**: agent:main:feishu:direct:ou_dfe4cec8ab70368885235d951a935ccd
- **Session ID**: 6ed2d2f2-4a0b-4fb9-beba-d3539399a217
- **Source**: feishu

## Conversation Summary

assistant: 不在字节官方 org 下，让我直接搜主仓库。
assistant: 这个 deerflow 是个人开发者，不是字节跳动的项目。搜索结果里提到的 "ByteDance 开源 Super Agent Harness" 应该是另一个项目。让我搜搜看。
assistant: 搜索结果只显示一个源码解析的仓库。让我换个思路，直接搜 DeerFlow 2.0。
assistant: 从搜索结果看，DeerFlow 的主仓库不在 GitHub 上（或者 org 名不同）。让我看看那个 awesome 列表和书里有没有提到。
assistant: 找到了！主仓库是 `bytedance/deer-flow`（注意是 deer-flow，带连字符）。让我看看主仓库详情。
assistant: 查到了，信息很充分。总结一下：

---

**DeerFlow**（全称 Deep Exploration and Efficient Research Flow）是**字节跳动开源的 Super Agent Harness**，主仓库在 [github.com/bytedance/deer-flow](https://github.com/bytedance/deer-flow)。

核心定位：**长周期任务编排**——把需要几分钟到几小时的复杂任务，拆解为多 Agent 协作流程。

**主要能力：**
- 🔬 **Deep Research** — 多步骤网络调研，输出结构化报告、PPT、播客等
- 💻 **Code & Repo Analysis** — 读代码库，生成概述、重构建议、API 文档
- 📄 **Document Intelligence** — 摄入长 PDF/文档，做 RAG 检索和问答
- 🤖 **Sub-Agents** — Supervisor 模式，任务分解给领域专精的子 Agent
- 🧠 **Long-Term Memory** — 内置长期记忆，支持持久化上下文
- 📦 **Sandbox** — 沙箱隔离执行 Python 代码
- 🔧 **Skills 系统** — 可扩展的技能/工具生态，支持 MCP Server

**技术栈：** LangGraph + LangChain，模型无关（推荐 Doubao-Seed-2.0-Code / DeepSeek v3.2 / Kimi 2.5，也支持 GPT、Claude 等）

**2.0 是完全重写**，v1 维护在 main-1.x 分支。2026年2月28日登上 GitHub Trending 第一名。

简单说，它和 OpenClaw 是同一类东西——都是 Agent 编排框架，但 DeerFlow 更偏「研究型长任务」场景，而 OpenClaw 更偏「个人助手 + 通道集成」。
user: System: [2026-04-05 14:49:20 GMT+8] Feishu[default] DM | 张传龙 (ou_dfe4cec8ab70368885235d951a935ccd) [msg:om_x100b521411c218acc34777ecf1008c2]

Conversation info (untrusted metadata):
```json
{
  "message_id": "om_x100b521411c218acc34777ecf1008c2",
  "sender_id": "ou_dfe4cec8ab70368885235d951a935ccd",
  "sender": "张传龙",
  "timestamp": "Sun 2026-04-05 14:49 GMT+8"
}
```

Sender (untrusted metadata):
```json
{
  "label": "张传龙 (ou_dfe4cec8ab70368885235d951a935ccd)",
  "id": "ou_dfe4cec8ab70368885235d951a935ccd",
  "name": "张传龙"
}
```

如果安装 deerflow，你能用吗
assistant: 能用，但**不是直接集成到 OpenClaw 里**，而是作为独立服务运行。

**实际可行的使用方式：**

1. **独立部署，通过 API/Web 调用** — 把 DeerFlow 跑起来后，我可以通过浏览器或 HTTP 请求帮你提交任务、查看结果

2. **作为 Coding Agent 子任务** — 用 `sessions_spawn` 把 DeerFlow 相关的编码任务（比如本地部署、配置调试）交给 subagent 处理

3. **帮我做深度研究** — 你说"帮我研究 XX"，我调 DeerFlow 的 API 去跑长周期调研任务，拿到结构化报告后整理给你

**不能做到的：**
- ❌ DeerFlow 的 subagent/skill/memory 体系跟 OpenClaw 是两套独立的，不能共享上下文
- ❌ 不能直接把 DeerFlow 当 OpenClaw 的工具调用（除非写个 MCP bridge）

**建议：** 如果你想要 DeerFlow 的能力，更实际的做法是看 OpenClaw 生态里有没有类似的 skill（比如 `firecrawl-search` + subagent 编排，其实已经能覆盖 DeerFlow 大部分研究场景）。要不要我对比一下两者在"深度研究"这个场景下的实际差距？
user: System: [2026-04-05 14:50:21 GMT+8] Feishu[default] DM | 张传龙 (ou_dfe4cec8ab70368885235d951a935ccd) [msg:om_x100b52142c017ca4c452df1f7caa5d8]

Conversation info (untrusted metadata):
```json
{
  "message_id": "om_x100b52142c017ca4c452df1f7caa5d8",
  "sender_id": "ou_dfe4cec8ab70368885235d951a935ccd",
  "sender": "张传龙",
  "timestamp": "Sun 2026-04-05 14:50 GMT+8"
}
```

Sender (untrusted metadata):
```json
{
  "label": "张传龙 (ou_dfe4cec8ab70368885235d951a935ccd)",
  "id": "ou_dfe4cec8ab70368885235d951a935ccd",
  "name": "张传龙"
}
```

对比一下
assistant: 好，我来做个实际对比。先快速看一下 DeerFlow 的架构细节。
assistant: 信息够了，给你一个清晰的对比：

---

## DeerFlow vs OpenClaw 深度研究场景对比

| 维度 | **DeerFlow** | **OpenClaw（当前配置）** |
|------|-------------|------------------------|
| **定位** | 研究型 SuperAgent Harness | 个人全能助手 + 通道集成 |
| **架构** | LangGraph + LangChain (Python) | Node.js + 子Agent系统 |
| **研究深度** | ⭐⭐⭐⭐⭐ 专为长周期深度研究设计 | ⭐⭐⭐ 通过工具组合实现 |
| **多Agent协作** | Supervisor + 领域子Agent 自动拆分 | sessions_spawn 手动编排 |
| **沙箱执行** | Docker/K8s 隔离执行 Python | 本地 shell（无沙箱隔离） |
| **长期记忆** | 内置 Memory 系统 + 向量存储 | OpenViking + memory 文件 |
| **输出产物** | 报告、PPT、播客音频、网页 | 文本、文档、表格 |
| **Web 搜索** | 内置 Tavily + BytePlus InfoQuest | Brave Search（缺 key）、Firecrawl、Tavily |
| **网页抓取** | 内置爬虫工具 | Firecrawl（已有 API key） |
| **模型** | 多模型路由（GPT/Claude/豆包/DeepSeek） | 智谱 GLM 系列 |
| **IM 通道** | Telegram/Slack/飞书/企微（自建） | 飞书/QQ（自建，已跑通） |
| **部署复杂度** | Docker Compose，~15min 初始化 | 已 systemd 自启，即开即用 |
| **可观测性** | LangSmith + Langfuse | session_status / cron 日志 |

### DeerFlow 明显更强的点

1. **研究工作流自动化** — 输入一个课题，自动拆解→搜索→抓取→综合→输出报告，全程无人干预
2. **多产物输出** — 不只是文本，还能生成 PPT、播客音频
3. **沙箱安全** — 代码执行在隔离容器里，不怕搞坏主机
4. **上下文工程** — 专门针对长文档/多轮研究的上下文管理做了优化

### OpenClaw 明显更强的点

1. **已深度集成飞书** — 日历/任务/文档/多维表格/IM 全打通，DeerFlow 的飞书集成只是发收消息
2. **日常助手能力** — 提醒、定时任务、文件管理、人肉搜索，DeerFlow 完全没有
3. **已经跑起来了** — 零部署成本，DeerFlow 还要装一堆东西
4. **中文模型支持** — GLM 系列原生中文，DeerFlow 推荐的模型偏英文

### 实际建议

**如果你需要的是：**
- "帮我调研 XX 课题，出份完整报告" → DeerFlow 更强，但 OpenClaw + Firecrawl + subagent 编排也能做到 70-80%
- "日常助手 + 偶尔深度研究" → 当前 OpenClaw 就够，不值得为 DeerFlow 额外维护一套系统
- "两者都要" → 可以部署 DeerFlow 作为 OpenClaw 的"研究后端"，我通过 HTTP API 调它

**性价比最高的方案：** 先不装 DeerFlow。如果你想试试深度研究能力，我可以现在就用 Firecrawl + subagent 给你跑一个完整的研究任务，看看效果差距有多大，再决定要不要装。
user: System: [2026-04-05 14:52:31 GMT+8] Feishu[default] DM | 张传龙 (ou_dfe4cec8ab70368885235d951a935ccd) [msg:om_x100b521425d140a4c22c164b7f7c425]

Conversation info (untrusted metadata):
```json
{
  "message_id": "om_x100b521425d140a4c22c164b7f7c425",
  "sender_id": "ou_dfe4cec8ab70368885235d951a935ccd",
  "sender": "张传龙",
  "timestamp": "Sun 2026-04-05 14:52 GMT+8"
}
```

Sender (untrusted metadata):
```json
{
  "label": "张传龙 (ou_dfe4cec8ab70368885235d951a935ccd)",
  "id": "ou_dfe4cec8ab70368885235d951a935ccd",
  "name": "张传龙"
}
```

那先记录一个研究任务，以后再说
assistant: 记好了 📝 主要存了这些：

- **DeerFlow 是什么** + 仓库地址
- **对比结论**：各有强项，OpenClaw 在飞书集成/日常助手方面领先，DeerFlow 在深度研究自动化方面领先
- **待办**：以后用 OpenClaw 现有能力实测一个研究任务，看差距大不大再决定要不要装

随时说"研究 DeerFlow"我就能调出来。
user: System: [2026-04-05 14:53:26 GMT+8] Feishu[default] DM | 张传龙 (ou_dfe4cec8ab70368885235d951a935ccd) [msg:om_x100b521420bdf4a0c44423575badcbe]

Conversation info (untrusted metadata):
```json
{
  "message_id": "om_x100b521420bdf4a0c44423575badcbe",
  "sender_id": "ou_dfe4cec8ab70368885235d951a935ccd",
  "sender": "张传龙",
  "timestamp": "Sun 2026-04-05 14:53 GMT+8"
}
```

Sender (untrusted metadata):
```json
{
  "label": "张传龙 (ou_dfe4cec8ab70368885235d951a935ccd)",
  "id": "ou_dfe4cec8ab70368885235d951a935ccd",
  "name": "张传龙"
}
```

飞书任务也写下
assistant: 写好了 ✅ 任务已创建：

**评估 DeerFlow：部署 vs OpenClaw 现有能力替代方案**

包含 3 个步骤：实测对比 → 决定是否部署 → 评估集成方案。
