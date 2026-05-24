# Session: 2026-04-13 03:39:57 UTC

- **Session Key**: agent:main:feishu:direct:ou_dfe4cec8ab70368885235d951a935ccd
- **Session ID**: 654ddac5-a089-492e-9609-8235a7e59389
- **Source**: feishu

## Conversation Summary

user: <relevant-memories>
The following OpenViking memories may be relevant:
- [] Session started: 2026-04-09 20:49:45 GMT+8 via Feishu
- [] OpenClaw系统配置详情：2026.4.9版本，AI代理框架，使用GLM-5-Turbo模型，包含通信渠道、Agent、插件及内存系统配置
- [] 偏好直接执行任务，无需中间确认，并强调自进化机制的默认执行
- [] User requested restoration of Feishu and QQBot communication channels
- [] 用户张传龙（ou_dfe4cec8ab70368885235d951a935ccd）通过飞书直接消息沟通，是全栈开发工程师，关注飞书响应时间优化，技术栈涵盖Java/Spring Boot、Vue.js等，有LLM应用开发经验，当前用Tauri v2开发zai-tray，使用腾讯WorkBuddy系统，当前活动是分享Figma设计
- [] 任务执行偏好：使用 Feishu 进行任务跟踪，偏好直接执行任务且无中间确认，要求自主完成并最终通知。
</relevant-memories>

System: [2026-04-12 10:51:01 GMT+8] Feishu[default] DM | 张传龙 (ou_dfe4cec8ab70368885235d951a935ccd) [msg:om_x100b5284c78330b0c2abb4e5e6be1c1]

Conversation info (untrusted metadata):
```json
{
  "message_id": "om_x100b5284c78330b0c2abb4e5e6be1c1",
  "sender_id": "ou_dfe4cec8ab70368885235d951a935ccd",
  "sender": "张传龙",
  "timestamp": "Sun 2026-04-12 10:51 GMT+8"
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

要把这些整理成更深入的对比分析
assistant: 好，派 subagent 做一个系统性的对比分析。
assistant: 已派 subagent 在后台跑，完成后会自动通知你。预计 1-2 分钟出结果。
assistant: 对比分析完成了，文档已写入 `research/claw-code-vs-openclaw.md`。

**10 个对比维度全覆盖：**
1. 架构哲学
2. Provider 路由
3. 事件驱动
4. 多 Agent 协调
5. 权限模型
6. 会话/状态管理
7. 工具系统
8. 配置体系
9. 生态/扩展性
10. 适用场景

**5 条可落地方案建议（按优先级）：**

| 优先级 | 建议 | 核心思路 |
|--------|------|----------|
| ⭐⭐⭐ | Subagent 状态机 + maxTurns 硬上限 | 参考 Claw 的 worker 生命周期，给 subagent 加 spawning→running→finished 状态机，配合 maxTurns 防失控 |
| ⭐⭐⭐ | 事件 Feed 上下文外通知 | 把通知/状态汇报推到 agent 上下文窗口外，避免占用 token 预算 |
| ⭐⭐ | Provider 前缀路由 + 别名 | 模型名前缀自动选 provider，支持用户级/项目级别名覆盖 |
| ⭐⭐ | 编码场景 Plan→Execute→Review 角色 | coding subagent 引入三角色分工，提升代码质量 |
| ⭐ | Mock 测试基础设施 | 借鉴确定性 mock 服务，做 OpenClaw 的集成测试 |

每个维度都分析了设计差异和互鉴点，要我把文档内容贴出来细看，还是你自己去翻文件？
user: <relevant-memories>
The following OpenViking memories may be relevant:
- [] AGENTS.md 更新: subagent 任务 scope 和标签规范
- [] 2026-04-05日运行大量并行subagent任务，生成20+个session文件，导致memory活跃部分膨胀
- [] Research task: Analyze OpenCLI Agent Skills integration mechanism
- [] Ran openclaw doctor --non-interactive for system check
- [] Decision to implement self-improvement features in OpenClaw: Three-layer implementation plan (P0-P2)
- [] Requested OpenClaw configuration check against 2026.4.9 version requirements
</relevant-memories>

<ingest-reply-assist>
The latest user input looks like a multi-speaker transcript used for memory ingestion.
Reply with 1-2 concise sentences to acknowledge or summarize key points.
Do not output NO_REPLY or an empty reply.
Do not fabricate facts beyond the provided transcript and recalled memories.
</ingest-reply-assist>

System: [2026-04-12 14:10:59 GMT+8] Feishu[default] DM | 张传龙 (ou_dfe4cec8ab70368885235d951a935ccd) [msg:om_x100b528739e8aca0c43c96366d94689]

Conversation info (untrusted metadata):
```json
{
  "message_id": "om_x100b528739e8aca0c43c96366d94689",
  "sender_id": "ou_dfe4cec8ab70368885235d951a935ccd",
  "sender": "张传龙",
  "timestamp": "Sun 2026-04-12 14:10 GMT+8"
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

可以，你去落地吧
assistant: 好，开始落地。先看看对比分析的具体建议，再制定执行计划。
assistant: 分析报告很扎实。来评估一下哪些能落地、哪些先记录。

**能立即做的（P0，纯 workspace 层面）：**
1. ✅ 事件 Feed 目录 + 查询机制 → 新建 `events/` 目录，写查询逻辑
2. ✅ Provider 别名系统 → 在配置中加 aliases 支持
3. ✅ Plan→Execute→Review skill 草案 → 改造 coding-agent skill

**需要 OpenClaw 上游支持的（P1，先记录到待落地）：**
4. Subagent 状态机 + maxTurns → 需要改 sessions_spawn 参数
5. Mock 测试基础设施 → 需要 mock provider

先从能做的开始。
assistant: 现在来看 OpenClaw 配置体系，确认 aliases 的可行性。
assistant: OpenClaw 的 `agents.defaults.models` 已经是一个 model catalog，本质上就是 alias 系统（系统提示里已经有 `GLM: zai/glm-5` 这样的别名映射）。但这些都是 OpenClaw 上游已实现的，不需要我们落地。

重新评估——**真正需要我们做的**是 workspace 层面的改进。让我聚焦到有价值的落地点。
assistant: 现在更新 HEARTBEAT.md 加入事件 Feed 的维护职责，然后更新 AGENTS.md 的事件相关规范。
assistant: 现在更新今天的 daily notes，记录落地进展。
assistant: Daily notes 很长，我来追加今天的进展。
assistant: 现在存储关键记忆到 OpenViking。
assistant: 落地说一下进展：

**✅ 已落地（workspace 层面）：**
1. **事件 Feed 系统** — 创建 `events/` 目录，定义了 JSONL 事件格式和 9 种事件类型，HEARTBEAT.md 已加入 7 天自动清理和 100 文件告警阈值
2. **Provider 别名** — 评估后确认 OpenClaw 已有（`agents.defaults.models` + 系统提示里的别名映射如 `GLM: zai/glm-5`），不需要重复建设

**📋 待落地（需要上游或更多工作）：**
- Subagent 状态机 + maxTurns → 需要 OpenClaw 版本支持
- Mock 测试基础设施 → 需要开发 mock provider
- Plan→Execute→Review skill → coding-agent 是上游内置 skill，需要在 workspace 自定义一个编码专用 skill

**产出的文档：**
- `research/claw-code-study.md` — 原始学习笔记
- `research/claw-code-vs-openclaw.md` — 10 维度深度对比（~4500 字）

整体来看，Claw Code 最有价值的两个设计（事件 Feed、Provider 路由），前者我们已经落地了目录和规范，后者 OpenClaw 已内置。真正差异化的能力（状态机、Mock 测试）需要上游支持，暂时记在待落地清单里。
assistant: 📰 AI 每日热门论文（2026-04-13）

**[242⬆] ClawBench: Can AI Agents Complete Everyday Online Tasks?**
作者：Yuxuan Zhang, Yubo Wang, Yipeng Zhu 等
摘要：AI agents may be able to automate your inbox, but can they automate other routine aspects of your life? We introduce ClawBench, an evaluation framework of 153 simple tasks spanning 144 live platforms across 15 categories, from completing purchases to submitting job applications. Evaluations of 7 frontier models show Claude Sonnet 4.6 achieves only 33.3%.
🔗 [HF链接](https://huggingface.co/papers/2604.08523) | [arXiv](https://arxiv.org/abs/2604.08523) | ⭐ [GitHub 31 stars](https://github.com/reacher-z/ClawBench)
---

**[13⬆] Small Vision-Language Models are Smart Compressors for Long Video Understanding (Tempo)**
作者：Junjie Fei, Jun Chen, Zechun Liu 等
摘要：We propose Tempo, an efficient query-aware framework compressing long videos for downstream understanding. Tempo leverages a Small VLM as a local temporal compressor. Our 6B architecture achieves SOTA on LVBench (4101s) scoring 52.3 under strict 8K visual budget, outperforming GPT-4o and Gemini 1.5 Pro.
🔗 [HF链接](https://huggingface.co/papers/2604.08120) | [arXiv](https://arxiv.org/abs/2604.08120) | ⭐ [GitHub 31 stars](https://github.com/FeiElysia/Tempo)
---

**[8⬆] Training a Student Expert via Semi-Supervised Foundation Model Distillation**
作者：Pardis Taghavi, Tian Liu, Renjie Li 等
摘要：We introduce a semi-supervised knowledge distillation (SSKD) framework that compresses pre-trained vision foundation models into compact experts using limited labeled and abundant unlabeled data for instance segmentation. Our ~11× smaller student improves over zero-shot VFM teacher by +11.9 and +8.6 AP on Cityscapes and ADE20K.
🔗 [HF链接](https://huggingface.co/papers/2604.03841) | [arXiv](https://arxiv.org/abs/2604.03841)
---

**[6⬆] Faithful GRPO: Improving Visual Spatial Reasoning in Multimodal Language Models via Constrained Policy Optimization**
作者：Sai Srinivas Kancheti, Aditya Kanade, Rohit Sinha 等
摘要：We observe that RLVR-trained multimodal models' accuracy gains often come at the cost of reasoning quality — CoT traces are frequently inconsistent with final answers and poorly grounded in visual evidence. We propose Faithful GRPO (FGRPO) reducing inconsistency rate from 24.5% to 1.7% and improving grounding scores by +13%.
🔗 [HF链接](https://huggingface.co/papers/2604.08476) | [arXiv](https://arxiv.org/abs/2604.08476)
---

**[5⬆] The Master Key Hypothesis: Unlocking Cross-Model Capability Transfer via Linear Subspace Alignment**
作者：Rishab Balasubramanian, Pin-Jie Lin, Rituraj Sharma 等
摘要：We propose the Master Key Hypothesis — model capabilities correspond to directions in a low-dimensional latent subspace transferable across models through linear alignment. UNLOCK, a training-free framework, transfers CoT reasoning from Qwen1.5-14B to 7B yielding +12.1% accuracy on MATH, and from Qwen3-4B to 14B-Base surpassing the post-trained model.
🔗 [HF链接](https://huggingface.co/papers/2604.06377) | [arXiv](https://arxiv.org/abs/2604.06377)
---

**[4⬆] Appear2Meaning: A Cross-Cultural Benchmark for Structured Cultural Metadata Inference from Images**
作者：Yuechen Jiang, Enze Zhang, Md Mohsinul Kabir 等
摘要：We introduce a multi-category, cross-cultural benchmark for inferring structured cultural metadata (creator, origin, period) from visual input, evaluating VLMs using an LLM-as-Judge framework. Results show models capture fragmented signals with substantial performance variation across cultures.
🔗 [HF链接](https://huggingface.co/papers/2604.07338) | [arXiv](https://arxiv.org/abs/2604.07338)
---

**[4⬆] QEIL v2: Heterogeneous Computing for Edge Intelligence via Roofline-Derived Pareto-Optimal Energy Modeling**
作者：Satyam Kumar, Saurabh Jha
摘要：QEIL v2 replaces static heuristics with physics-grounded, runtime-adaptive models for LLM inference on edge devices. Introduces DASI, CPQ, and Phi metrics from semiconductor physics. Achieves 75.7% pass@k at 63.8W — first edge orchestration to surpass IPW=1.0 reference mark. Total energy drops 75.6% vs standard.
🔗 [HF链接](https://huggingface.co/papers/2602.06057) | [arXiv](https://arxiv.org/abs/2602.06057)
---

**[4⬆] AnomalyVFM — Transforming Vision Foundation Models into Zero-Shot Anomaly Detectors**
作者：Matic Fučka, Vitjan Zavrtanik, Danijel Skočaj
摘要：We propose AnomalyVFM, a framework that turns any pretrained VFM into a strong zero-shot anomaly detector through synthetic dataset generation and parameter-efficient adaptation with low-rank feature adapters. With RADIO backbone, achieves 94.1% AUROC across 9 datasets, surpassing SOTA by 3.3%.
🔗 [HF链接](https://huggingface.co/papers/2601.20524) | [arXiv](https://arxiv.org/abs/2601.20524) | ⭐ [GitHub 7 stars](https://github.com/MaticFuc/AnomalyVFM)
---

**[3⬆] On the Global Photometric Alignment for Low-Level Vision**
作者：Mingjia Li, Tianle Du, Hainuo Wang 等
摘要：We investigate per-pair photometric inconsistency in paired training sets that causes optimization pathology in low-level vision. We propose Photometric Alignment Loss (PAL) that discounts nuisance photometric discrepancy via closed-form affine color alignment. Consistently improves metrics across 6 tasks, 16 datasets, and 16 architectures.
🔗 [HF链接](https://huggingface.co/papers/2604.08172) | [arXiv](https://arxiv.org/abs/2604.08172)
---

**[2⬆] CylinderDepth: Cylindrical Spatial Attention for Multi-View Consistent Self-Supervised Surround Depth Estimation**
作者：Samer Abualhanud, Christian Grannemann, Max Mehltretter
摘要：We propose a geometry-guided method for multi-camera depth estimation that improves cross-view consistency using cylindrical spatial attention. Maps image-specific feature positions onto a shared cylinder and applies explicit spatial attention to aggregate features across images. Improves consistency on DDAD and nuScenes.
🔗 [HF链接](https://huggingface.co/papers/2511.16428) | [arXiv](https://arxiv.org/abs/2511.16428) | ⭐ [GitHub 1 star](https://github.com/abualhanud/CylinderDepth)
---

📌 今日趋势：ClawBench 以 242 票遥遥领先，AI Agent 在真实网页任务中的表现仍是热点；长视频理解（Tempo）和视觉推理的可信性（Faithful GRPO）也备受关注。模型能力跨尺度迁移（Master Key）和 VFM 零样本异常检测是值得关注的新方向。
