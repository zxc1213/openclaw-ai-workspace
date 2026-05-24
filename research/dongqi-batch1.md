# 冬奇Lab开源项目调研 第1批（#48-64）

> 调研时间：2026-04-05 | 来源：掘金「一天一个开源项目」系列
> 共 15 篇，跳过 #62（已安排 Claude Code 系列）

---

## #64 OpenCLI

- **GitHub**: https://github.com/jackwener/opencli
- **Stars**: ~12.5k | **License**: Apache-2.0
- **核心功能**：把任意网站、Electron 应用与本地 CLI 工具统一成一套命令行接口。通过 Browser Bridge（Chrome 扩展 + 守护进程）复用已登录的浏览器会话，内置 70+ 站点适配器（B站、知乎、小红书、Twitter、Reddit 等），支持 CLI Hub 透传（`opencli gh`、`opencli docker`），可为 AI Agent 提供可脚本化的浏览器操作指令集。
- **技术栈**：Node.js 20+ / TypeScript / Chrome Extension / CDP
- **推荐指数**: ⭐⭐⭐⭐⭐
- **亮点**：与 OpenClaw 理念高度契合——统一工具发现、对 AI Agent 友好、输出可管道化（JSON/YAML/CSV）

---

## #63 lil agents

- **GitHub**: https://github.com/ryanstephen/lil-agents
- **Stars**: ~909 | **License**: MIT
- **核心功能**：macOS Dock 上的迷你 AI 伙伴。在 Dock 上方渲染两个小角色（Bruce / Jazz），点击弹出带主题的 AI 终端 popover，可在 menubar 一键切换 Claude Code / Codex / Copilot CLI / Gemini CLI。强调"随手可用"和情绪价值，带 slash commands、thinking bubbles、音效等交互细节。
- **技术栈**：Swift / Xcode / macOS Native
- **推荐指数**: ⭐⭐⭐
- **亮点**：桌面小挂件概念有趣，但功能较轻，仅限 macOS

---

## #61 knowledge_graph

- **GitHub**: https://github.com/rahulnyk/knowledge_graph
- **Stars**: ~3.1k | **License**: MIT
- **核心功能**：用 LLM 从文本中提取概念（非实体）并构建知识图谱，支持 GRAG（图检索增强生成）、中心性分析、社区发现。采用本地 Mistral 7B + Ollama 方案，零 API 成本，Docker 一键运行。核心创新在于提取"概念"而非"实体"，双权重边（语义关系 W1 + 上下文邻近 W2）。
- **技术栈**：Python / Ollama / Pyvis / Jupyter Notebook
- **推荐指数**: ⭐⭐⭐⭐
- **亮点**：本地零成本的知识图谱构建方案，GRAG 概念值得关注

---

## #60 IndexTTS

- **GitHub**: https://github.com/index-tts/index-tts
- **Stars**: ~19.4k | **License**: 见仓库
- **核心功能**：B 站 IndexTeam 开源的工业级零样本 TTS 系统。单段参考音频即可克隆音色，情感与音色解耦（情感参考音频/8维向量/文本描述三通道控制），IndexTTS2 实现自回归 TTS 的精确时长控制（业界首例）。支持中英多语言、拼音标注发音，提供 WebUI 与 Python API。
- **技术栈**：Python / PyTorch / uv / CUDA 12.8+
- **推荐指数**: ⭐⭐⭐⭐
- **亮点**：B 站出品质量高，情感控制+时长控制组合在 TTS 领域有独特优势

---

## #59 Dream Recorder

- **GitHub**: https://github.com/modem-works/dream-recorder
- **Stars**: ~1.5k | **License**: MIT
- **核心功能**：物理梦境记录设备。醒来后口述梦境，系统通过 OpenAI 语音转文本 + 生成视频提示，再用 LumaLabs 生成 5 秒 21:9 超宽视频，在 7.9 寸超宽屏上播放。基于树莓派 5 + 电容触摸 + USB 麦克风，外壳可 3D 打印（透明 PLA）。硬件成本约 €285，单次梦境成本约 $0.15。
- **技术栈**：Python / 树莓派 5 / Docker / OpenAI API / LumaLabs API
- **推荐指数**: ⭐⭐⭐
- **亮点**：硬件+AI 结合的创意项目，树莓派 IoT 参考价值高，但实用性有限

---

## #57 Unsloth

- **GitHub**: https://github.com/unslothai/unsloth
- **Stars**: ~54.1k | **License**: Apache-2.0 / AGPL-3.0
- **核心功能**：LLM 微调与强化学习库，基于 PyTorch + Triton 内核优化。训练速度约 2x，显存节省约 70%，0% 精度损失。支持全参数微调、4-bit/16-bit/FP8、GRPO/GSPO/DAPO 等强化学习（80% 显存节省）。兼容 Hugging Face transformers，支持 LLM/TTS/多模态/Embedding 各类模型。
- **技术栈**：Python / PyTorch / Triton / CUDA
- **推荐指数**: ⭐⭐⭐⭐⭐
- **亮点**：微调大模型的事实标准工具，消费级 GPU 即可微调 7B/8B 模型

---

## #56 人人都能用英语 (everyone-can-use-english)

- **GitHub**: https://github.com/ZuodaoTech/everyone-can-use-english
- **Stars**: ~33.7k | **License**: GPL-3.0
- **核心功能**：李笑来 2010 年英语学习著作的开源版 + 2024 年"一千小时"训练法 + Enjoy AI 学习应用。核心方法论：学英语重在"用"。Enjoy 应用支持视频学习（YouTube/Netflix 浏览器插件）、电子书精读（AI 辅助生词/理解）、闪卡/课程，网页版 + 浏览器插件 + 桌面版多端覆盖。
- **技术栈**：TypeScript / JavaScript / Vue / Metal
- **推荐指数**: ⭐⭐⭐⭐
- **亮点**：理念+产品+开源三位一体，AI 辅助语言学习的优秀实践

---

## #55 Spec Kit

- **GitHub**: https://github.com/github/spec-kit
- **Stars**: N/A（GitHub 官方） | **License**: MIT
- **核心功能**：GitHub 官方开源的规范驱动开发（Spec-Driven Development）工具包。提供 constitution → specify → plan → tasks → implement 五步结构化工作流，让"规范可执行"直接生成代码实现。配合 Specify CLI 和斜杠命令（`/speckit.specify` 等），支持 Claude Code / Cursor / Copilot / Gemini CLI 等 20+ AI 编码助手。
- **技术栈**：Python / uv / Claude Code / Cursor
- **推荐指数**: ⭐⭐⭐⭐⭐
- **亮点**：GitHub 官方出品，规范先行理念与 AI 编程最佳实践高度契合

---

## #54 Supabase

- **GitHub**: https://github.com/supabase/supabase
- **Stars**: 极高（知名项目） | **License**: Apache-2.0
- **核心功能**：开源的 Postgres 开发平台，Firebase 替代方案。提供托管 Postgres 数据库、JWT 认证（GoTrue）、自动 REST/GraphQL API（PostgREST/pg_graphql）、Realtime WebSocket 订阅、Edge Functions（Deno）、S3 兼容文件存储、pgvector AI 向量工具。支持云端托管和完全自托管。
- **技术栈**：PostgreSQL / TypeScript / Go / Deno / Elixir
- **推荐指数**: ⭐⭐⭐⭐⭐
- **亮点**：开源 BaaS 的事实标准，生态成熟，自托管能力强

---

## #53 PDF 补丁丁 (PDFPatcher)

- **GitHub**: https://github.com/wmjordan/PDFPatcher
- **Stars**: N/A | **License**: AGPL + 良心授权
- **核心功能**：基于 .NET 的全面 PDF 工具箱。支持书签编辑（带阅读界面、正则/XPath 查找替换）、剪裁旋转页面、解除复制打印限制、合并拆分文档、提取图片、OCR 识别（调用 Office MODI）、字体替换嵌入、结构分析等。"良心授权"：永久免费、无广告、无弹窗。
- **技术栈**：.NET Framework / iText / MuPDF
- **推荐指数**: ⭐⭐⭐⭐
- **亮点**：Windows 上最全面的免费 PDF 工具之一，书签编辑和 OCR 功能突出

---

## #52 OPB-Skills

- **GitHub**: https://github.com/chendongqi/OPB-Skills
- **Stars**: N/A | **License**: MIT
- **核心功能**：为 Claude Code / OpenClaw 等设计的 91 个专业 Skill 集合，覆盖一人公司运营全场景（产品、研发、设计、营销、运营、财务、法务）。每个 Skill 是一个虚拟专家，内置领域专业知识、方法论和模板，工作流驱动而非泛泛而谈。安装到 `~/.claude/skills` 即可即插即用。
- **技术栈**：Claude Code Skills / Markdown / YAML
- **推荐指数**: ⭐⭐⭐⭐
- **亮点**：与 OpenClaw Skill 体系理念一致，91 个 Skill 覆盖面广，值得参考借鉴

---

## #51 system-prompts-and-models-of-ai-tools

- **GitHub**: https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools
- **Stars**: ~131k | **License**: GPL-3.0
- **核心功能**：收集了 30+ 款主流 AI 工具的系统提示词、内部工具和 AI 模型信息，超过 30,000+ 行的系统提示词分析。覆盖 Cursor、Claude Code、Windsurf、Devin AI、v0、Manus、Perplexity、NotionAI 等。是理解 AI 工具工作原理、研究 Agent 架构设计、学习提示词工程的最佳资源库。
- **技术栈**：Markdown（纯资源集合）
- **推荐指数**: ⭐⭐⭐⭐⭐
- **亮点**：131k Stars 说明了价值，对 AI 工具开发者和提示词工程师是必读资源

---

## #50 MarkItDown

- **GitHub**: https://github.com/microsoft/markitdown
- **Stars**: ~90.7k | **License**: MIT
- **核心功能**：Microsoft 开源的轻量级 Python 工具，将各种文件转换为 Markdown，专为 LLM 和文本分析管道设计。支持 PDF、PowerPoint、Word、Excel、图片、音频、HTML、CSV/JSON/XML、ZIP、YouTube URLs、EPUB 等 15+ 种格式。保留文档结构（标题、列表、表格、链接），支持插件系统和 LLM 图像描述。
- **技术栈**：Python 3.10+ / Azure Document Intelligence（可选）
- **推荐指数**: ⭐⭐⭐⭐⭐
- **亮点**：Microsoft 出品，90k Stars，构建 LLM 数据管道的基础工具

---

## #49 Anything to NotebookLM

- **GitHub**: https://github.com/joeseesun/anything-to-notebooklm
- **Stars**: ~515 | **License**: MIT
- **核心功能**：Claude Code Skill，用自然语言将任何内容转换为任何格式。支持 15+ 种输入（微信文章、网页、YouTube、PDF、EPUB 等），输出播客、PPT、思维导图、Quiz、视频、报告、信息图、闪卡等 8+ 种格式。基于 Google NotebookLM API 全自动处理，从获取到生成一气呵成。
- **技术栈**：Claude Code Skill / NotebookLM API / MCP
- **推荐指数**: ⭐⭐⭐⭐
- **亮点**：内容格式转换的"瑞士军刀"，Claude Code Skill 设计模式的优秀示范

---

## #48 Agent-Reach

- **GitHub**: https://github.com/Panniantong/Agent-Reach
- **Stars**: ~8.2k | **License**: MIT
- **核心功能**：给 AI Agent 一键装上互联网能力的脚手架工具。支持 Twitter、Reddit、YouTube、GitHub、B站、小红书、抖音、LinkedIn、微信公众号、微博、RSS 等平台，零 API 费用。可插拔架构，兼容 Claude Code / OpenClaw / Cursor / Windsurf 等所有能跑命令行的 Agent，自带 `agent-reach doctor` 诊断命令。
- **技术栈**：Shell / Python / xreach / yt-dlp / gh CLI
- **推荐指数**: ⭐⭐⭐⭐⭐
- **亮点**：与 OpenClaw 互补性极强，解决 AI Agent 访问互联网的核心痛点，作者称每天自己都在用

---

## 🎯 值得 Ray 关注的项目 TOP 5

### 1. Agent-Reach ⭐⭐⭐⭐⭐
**理由**：与 OpenClaw 互补性极强。Ray 日常使用 OpenClaw，Agent-Reach 能直接增强 Agent 的互联网访问能力（Twitter、YouTube、Reddit、B站、小红书等），零 API 费用，一键安装。8.2k Stars 说明社区认可度高，且作者持续维护。

### 2. OpenCLI ⭐⭐⭐⭐⭐
**理由**：统一 CLI Hub 的理念与 OpenClaw 高度契合。70+ 站点适配器 + AI Agent 友好的设计（Skills、命令发现、`opencli-operate`），可以直接增强 OpenClaw 的工具发现和执行能力。Browser Bridge 复用浏览器登录态的方案也很实用。

### 3. Spec Kit ⭐⭐⭐⭐⭐
**理由**：GitHub 官方出品，规范驱动开发（constitution → specify → plan → tasks → implement）的工作流设计优秀。与 Ray 日常使用 Claude Code 的习惯完美匹配，能显著提升 AI 辅助编程的输出质量和可预测性。

### 4. system-prompts-and-models-of-ai-tools ⭐⭐⭐⭐⭐
**理由**：131k Stars 的资源库，是理解 AI 工具内部工作原理的最佳入口。对 Ray 研究 AI Agent 架构、优化 OpenClaw 的提示词设计有直接参考价值。

### 5. MarkItDown ⭐⭐⭐⭐⭐
**理由**：Microsoft 出品，90k Stars。构建 LLM 数据管道的基础工具，15+ 格式支持 + 保留文档结构 + 插件系统。Ray 可以用它来增强文档处理能力，与飞书文档等工具链配合使用。

---

### 其他值得关注

- **Unsloth**（54k⭐）：如果 Ray 有微调大模型的需求，这是事实标准工具
- **OPB-Skills**（91 个 Skill）：与 OpenClaw Skill 体系理念一致，值得参考其 Skill 设计和组织方式
- **IndexTTS**（19.4k⭐）：B 站出品的 TTS 系统，情感控制能力独特，语音合成场景下的好选择
- **knowledge_graph**（3.1k⭐）：本地零成本的知识图谱构建方案，GRAG 概念值得关注

---

*本报告由念念自动生成，基于掘金「一天一个开源项目」系列文章抓取分析。*
