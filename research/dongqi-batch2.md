# 冬奇Lab开源项目调研 第2批（#28-47）

> 调研时间：2026-04-05 | 来源：掘金「一天一个开源项目」系列 | 共16篇

---

## #28 Graphiti — 为 AI Agent 构建实时知识图谱

- **GitHub**: https://github.com/getzep/graphiti ⭐ 22.9k
- **技术栈**: Python, Neo4j/FalkorDB/Kuzu/Neptune, Pydantic, FastAPI, OpenAI/Multi-LLM
- **核心功能**:
  - 面向 AI Agent 的实时、时间感知知识图谱框架，支持增量 Episode 写入
  - 双时间模型（事件发生时间+摄入时间），支持精确时间点/范围查询
  - 混合检索：语义嵌入 + BM25 + 图遍历，可选图距离 rerank，亚秒级延迟
  - 自定义实体（Pydantic），可插拔图驱动（Neo4j/FalkorDB/Kuzu/Neptune）
  - 提供 MCP 服务（供 Claude/Cursor 调用）和 REST API（FastAPI）
- **推荐指数**: ⭐⭐⭐⭐⭐
- **一句话**: Agent 长期记忆的理想底座，比传统 GraphRAG 更适合动态场景

---

## #29 Open-AutoGLM — 用自然语言操控手机的 Phone Agent 框架

- **GitHub**: https://github.com/zai-org/Open-AutoGLM ⭐ 23.5k
- **技术栈**: Python, ADB/HDC, AutoGLM-Phone-9B (GLM-4.1V), vLLM/SGLang
- **核心功能**:
  - 智谱 AI 开源的 Phone Agent 框架 + 视觉语言模型，实现「自然语言 → 手机操作」
  - 截图 → VLM 理解界面 → 输出结构化动作（Launch/Tap/Type/Swipe）→ 执行的循环
  - 支持 Android 7.0+（50+ App）和 HarmonyOS NEXT（60+ App），远程 WiFi 调试
  - 敏感操作确认 + 登录/验证码人工接管机制
- **推荐指数**: ⭐⭐⭐⭐
- **一句话**: 手机自动化的利器，适合研究 GUI Agent 和手机自动化测试

---

## #30 banana-slides — 基于 nano banana pro 的原生 AI PPT 生成应用

- **GitHub**: https://github.com/Anionex/banana-slides ⭐ 12.1k
- **技术栈**: React + Vite, Flask, SQLite, Gemini API (nano banana pro)
- **核心功能**:
  - 基于图像生成模型的 AI PPT 应用，支持一句话/大纲/页面描述三种创作路径
  - 自动解析 PDF/Docx/MD 文件提取内容，上传模板定制风格
  - 自然语言口头修改指定区域（如「把第三页改成案例分析」）
  - 一键导出 PPTX/PDF，支持可编辑 PPTX（文字图片可在 PowerPoint 修改）
- **推荐指数**: ⭐⭐⭐⭐
- **一句话**: 解决 PPT 制作痛点，从想法到成品最快路径

---

## #32 Edit-Banana — 让不可编辑的图表变成可编辑，SAM3+多模态大模型驱动

- **GitHub**: https://github.com/BIT-DataLab/Edit-Banana ⭐ 1.9k
- **技术栈**: Python, SAM3 (微调), Qwen-VL/GPT-4V, Azure OCR, React, FastAPI
- **核心功能**:
  - 北理工数据实验室开源的通用内容重编辑框架，Slogan: "Make the Uneditable, Editable"
  - 自研微调 SAM3 做图表元素分割 + 多模态 VLM 多轮扫描 + 高质量 OCR
  - 输入 PNG/JPG/PDF → 输出可编辑 DrawIO(XML)/SVG/PPTX
  - 支持 PDF 转可编辑幻灯片，公式输出 LaTeX
- **推荐指数**: ⭐⭐⭐⭐
- **一句话**: 学术/技术图可编辑化的实用工具，论文党福音

---

## #35 GitHub Store — 跨平台的 GitHub Releases 应用商店

- **GitHub**: https://github.com/rainxchzed/Github-Store ⭐ 7k
- **技术栈**: Kotlin Multiplatform, Compose Multiplatform
- **核心功能**:
  - 跨平台应用商店，专门发现和安装 GitHub Releases 中的开源软件
  - 自动检测可安装二进制（APK/EXE/MSI/DMG/DEB/RPM/AppImage），一键安装
  - 更新追踪、Trending/Recently Updated/New 分类浏览
  - 支持 Android/Windows/macOS/Linux，48,000+ 活跃用户，高中生独立开发
- **推荐指数**: ⭐⭐⭐
- **一句话**: 找 GitHub 上的桌面/移动应用不再翻 Releases

---

## #36 EverMemOS — 跨 LLM 与平台的长时记忆 OS

- **GitHub**: https://github.com/EverMind-AI/EverMemOS ⭐ 2.3k
- **技术栈**: Python, Milvus, Elasticsearch, MongoDB, Redis, REST API
- **核心功能**:
  - Agent 长时记忆操作系统，三阶段流程：Encoding → Consolidation → Retrieval
  - 多模态记忆类型：Episodes（情节）、Facts（事实）、Preferences（偏好）、Relations（关系）
  - LoCoMo 基准 93% 推理准确率，BM25/向量/混合/Agentic 多种检索策略
  - 与 LLM 无关的 REST API，可接入任意大模型
- **推荐指数**: ⭐⭐⭐⭐
- **一句话**: 生产级 Agent 记忆底座，架构清晰，适合做跨会话记忆方案

---

## #37 awesome-selfhosted — 自托管软件资源集合

- **GitHub**: https://github.com/awesome-selfhosted/awesome-selfhosted ⭐ 276k
- **技术栈**: Awesome List（Markdown 社区维护）
- **核心功能**:
  - 自托管软件最权威的资源库，收录数百个免费自托管网络服务和 Web 应用
  - 100+ 分类：分析、自动化、博客、通信、文件传输、媒体流、开发工具、知识管理等
  - 每个条目含名称、描述、Demo、源码、许可证、技术栈
  - 1,228+ 贡献者，附 non-free.md 和反特性标记
- **推荐指数**: ⭐⭐⭐⭐⭐
- **一句话**: 自托管圣经，找任何 SaaS 的开源替代先查这里

---

## #39 PandaWiki — AI 驱动的开源知识库搭建系统

- **GitHub**: https://github.com/chaitin/PandaWiki ⭐ 9.1k
- **技术栈**: Python, RAG, Docker, 长亭科技出品
- **核心功能**:
  - AI 大模型驱动的知识库系统，支持 AI 创作、AI 问答（RAG）、AI 语义搜索
  - 多渠道内容导入：URL、Sitemap、RSS、离线文件
  - 集成网页挂件、钉钉/飞书/企业微信机器人
  - 兼容 Markdown/HTML，导出 Word/PDF/Markdown
- **推荐指数**: ⭐⭐⭐
- **一句话**: 国产 AI 知识库方案，适合企业内部文档和 FAQ

---

## #40 copyparty — 单文件便携文件服务器

- **GitHub**: https://github.com/9001/copyparty ⭐ 4.3k
- **技术栈**: Python（单文件），零外部依赖
- **核心功能**:
  - 整个文件服务器塞进一个 .py/.pyz 文件，有 Python 即可运行
  - 加速断点续传、内容去重、多协议（HTTP/WebDAV/SFTP/FTP/TFTP/SMB）
  - zeroconf 自动发现、媒体索引+缩略图、浏览器内文件管理（剪切/粘贴/重命名）
  - RSS/OPDS、媒体播放、Markdown 预览、目录打包下载、race the beam
- **推荐指数**: ⭐⭐⭐⭐
- **一句话**: 临时文件共享最佳选择，U 盘即插即用

---

## #41 Workout.cool — 现代化开源健身教练平台

- **GitHub**: https://github.com/Snouzy/workout-cool ⭐ 7.1k
- **技术栈**: Next.js, TypeScript, Prisma, PostgreSQL, Feature-Sliced Design
- **核心功能**:
  - 开源健身教练平台，训练计划创建 + 进度追踪 + 运动数据库（含视频演示）
  - 8+ 语言支持，Docker 一键部署，CSV 批量导入运动数据
  - workout.lol 的精神续作，Feature-Sliced Design 架构
- **推荐指数**: ⭐⭐⭐
- **一句话**: 开源自托管健身应用，Next.js 全栈架构参考

---

## #42 OpenFang — 用 Rust 构建的 Agent 操作系统

- **GitHub**: https://github.com/RightNow-AI/openfang ⭐ 10.9k
- **技术栈**: Rust（137K LOC, 14 crates）, WASM, MCP, 40+ 通道适配器
- **核心功能**:
  - Rust 从零构建的 Agent 操作系统，单一 ~32MB 二进制，冷启动 <200ms
  - 7 个自主 Hands（Clip/Lead/Collector/Predictor/Researcher/Twitter/Browser），24/7 按计划工作
  - 16 层安全系统（WASM 沙箱、Merkle 审计链、污点追踪、Ed25519 签名）
  - 40 通道适配器（Telegram/Discord/Slack/WhatsApp/Signal 等），27 个 LLM 提供商
- **推荐指数**: ⭐⭐⭐⭐
- **一句话**: Rust 系的自主 Agent OS，性能和安全都很硬核

---

## #43 Star-Office-UI — 像素风格的 AI 办公室看板

- **GitHub**: https://github.com/ringhyacinth/Star-Office-UI ⭐ 2.9k
- **技术栈**: Python, Flask, Phaser（像素游戏引擎）, Tauri（桌面版）, Gemini API
- **核心功能**:
  - 像素风格 AI 办公室看板，将 Agent 工作状态实时可视化
  - 6 种状态映射到 3 个区域（休息区/工作区/Bug 区），角色自动移动 + 动画气泡
  - 多 Agent 协作、中英日三语、AI 生图装修（Gemini）、桌面宠物模式（Tauri）
  - 与 OpenClaw 深度集成，也可独立部署
- **推荐指数**: ⭐⭐⭐
- **一句话**: 让 AI Agent 的工作变得可见和有趣，OpenClaw 配件

---

## #44 GitNexus — 零服务器的代码智能引擎

- **GitHub**: https://github.com/abhigyanpatwari/GitNexus ⭐ 10.8k
- **技术栈**: Rust, KuzuDB, Tree-sitter, MCP, Graph RAG, React（Web UI）
- **核心功能**:
  - 将代码库索引为知识图谱（依赖、调用链、集群、执行流），让 AI 理解代码结构
  - CLI + MCP 模式：本地索引，通过 MCP 连接 Cursor/Claude Code/Windsurf
  - 7 个 MCP 工具：impact analysis、query、context、detect_changes、rename、cypher 等
  - 完全本地运行，代码永不离开机器，支持 12+ 编程语言
- **推荐指数**: ⭐⭐⭐⭐⭐
- **一句话**: 代码知识图谱 + MCP，让 AI 代码助手不再「瞎改」

---

## #45 OpenAI Agents SDK Python — 轻量级多 Agent 工作流框架

- **GitHub**: https://github.com/openai/openai-agents-python ⭐ 19.4k
- **技术栈**: Python, Pydantic, PydanticAI, LiteLLM, MCP
- **核心功能**:
  - OpenAI 官方多 Agent 框架，轻量级，内置追踪可视化、会话管理、Guardrails
  - 支持 Agents as Tools、Handoffs、并行执行等多 Agent 编排模式
  - 100+ LLM 支持（通过 LiteLLM），实时语音 Agent，Human-in-the-loop
  - MCP 工具集成，结构化输出，适合生产环境
- **推荐指数**: ⭐⭐⭐⭐⭐
- **一句话**: 官方出品的多 Agent 框架，API 简洁，适合生产级应用

---

## #46 Caddy — 自动 HTTPS 的现代化 Web 服务器

- **GitHub**: https://github.com/caddyserver/caddy ⭐ 70.8k
- **技术栈**: Go, Let's Encrypt/ZeroSSL, HTTP/3, 插件系统
- **核心功能**:
  - Go 编写的 Web 服务器，默认自动 HTTPS，支持 HTTP/1.1/2/3
  - 单二进制零依赖，Caddyfile 简洁配置 + JSON API 动态配置
  - 已服务数万亿 HTTPS 请求，管理数百万 TLS 证书，生产就绪
  - 丰富的插件生态，反向代理/API 网关/静态站点等场景
- **推荐指数**: ⭐⭐⭐⭐⭐
- **一句话**: Nginx 的现代替代，HTTPS 零配置，配置语法极度友好

---

## #47 Cursor Chat Browser — ⚠️ 抓取失败

- 抓取内容为空，跳过。
- 推测是掘金页面 JS 渲染内容未被成功捕获。

---

## 🔥 值得 Ray 关注的项目 TOP 5

| 排名 | 项目 | 理由 |
|------|------|------|
| 1 | **Graphiti** (#28) | Agent 长期记忆是 OpenClaw 的核心需求，Graphiti 的时间感知知识图谱 + MCP 集成直接可用，22.9k Stars 验证了社区认可度 |
| 2 | **GitNexus** (#44) | 代码知识图谱 + MCP 工具链，让 AI 代码助手深度理解项目结构，Ray 做大量 coding 工作时能减少破坏性变更 |
| 3 | **OpenAI Agents SDK** (#45) | 官方出品的多 Agent 框架，100+ LLM 支持，如果需要构建复杂 Agent 工作流值得参考 |
| 4 | **awesome-selfhosted** (#37) | 276k Stars 的自托管圣经，Ray 的自托管/私有化需求可以直接在这里找方案 |
| 5 | **copyparty** (#40) | 单文件文件服务器，日常临时共享场景极其实用，有 Python 就能跑 |

**特别关注**：
- **Edit-Banana** (#32)：如果经常需要把论文/报告里的图转成可编辑格式，这个工具很实用
- **OpenFang** (#42)：Rust Agent OS，如果想深入研究 Agent 系统工程化可以参考其架构
- **EverMemOS** (#36)：Agent 记忆系统，跟 Graphiti 互补，EverMemOS 更侧重记忆巩固与推理
