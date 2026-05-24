# 一天一个开源项目（第102篇）：NVIDIA Video Search and Summarization - 构建 GPU 加速的视觉智能体

[冬奇Lab](https://juejin.cn/user/1857501105781193/posts)

2026-05-15

43

阅读6分钟


专栏：


开源项目探索


关注

## 引言

> "视频是数据的最后一块蓝海，也是最具挑战性的非结构化信息来源。"

这是"一天一个开源项目"系列的第102篇文章。今天带你了解的项目是 **NVIDIA Video Search and Summarization (VSS)**。

在传统视觉监控或视频分析中，我们通常依赖于特定的目标检测算法（如“检测人和车”）。然而，当我们需要寻找“一个穿着红色衣服、拿着蓝色咖啡杯并走向会议室的人”时，传统的规则驱动系统往往无能为力。NVIDIA VSS 提供了一套完整的参考架构，通过集成视觉语言模型 (VLMs) 和大语言模型 (LLMs)，让开发者能够构建像人一样“读懂”视频内容的视觉智能体。

### 你将学到什么

- **多模态工作流**：如何通过自然语言对视频进行搜索和语义分析。
- **NVIDIA NIM 微服务**：利用高性能推理容器加速视觉任务。
- **RTVI 架构**：了解实时视频智能（Real-Time Video Intelligence）的索引与处理流程。
- **MCP 集成**：如何利用 Model Context Protocol 统一管理视频分析工具。
- **企业级部署**：从云端到本地 GPU 集群的快速落地方案。

### 前置知识

- 对大语言模型（LLM）和视觉语言模型（VLM）有基本理解。
- 熟悉 Docker 和计算设备（特别是 NVIDIA GPU）的基本操作。
- 了解矢量数据库在 RAG（检索增强生成）中的作用。

* * *

## 项目背景

### 项目简介

NVIDIA Video Search and Summarization (VSS) 是 NVIDIA AI Blueprints 系列中的核心项目。它不是一个简单的库，而是一套 **企业级参考架构**。它解决了将原始音视频流转化为结构化、可查询洞察的痛点，使用户能够通过聊天界面直接与视频数据“对话”，实现搜索特定时刻、生成摘要或进行视觉问答。

### 作者/团队介绍

- 作者： **NVIDIA Metropolis / AI Blueprints Team**
- 背景：NVIDIA 全球领先的 AI 计算平台提供商。Metropolis 团队专注于智慧城市、工业自动化和零售洞察的视觉 AI 解决方案。
- 项目发布时间：2024-2025（VSS 3.1.0 版本于 2026 年 3 月更新）

### 项目数据

- ⭐ GitHub Stars: 1.2k+
- 🍴 Forks: 260+
- 📄 License: NVIDIA AI Product Agreement
- 📦 版本: v3.1.0
- 🌐 官网: [NVIDIA AI Blueprints](https://link.juejin.cn/?target=https%3A%2F%2Fwww.nvidia.com%2Fen-us%2Fai-data-science%2Fai-blueprints%2F "https://www.nvidia.com/en-us/ai-data-science/ai-blueprints/")

* * *

## 主要功能

### 核心作用

VSS 的核心在于将视频内容“语义化”。它通过视频编码器提取特征并存储在向量索引中，再配合推理能力极强的 VLM（如 Cosmos-Reason2-8B），实现跨视频流的深度理解。

### 使用场景

1. **智能零售与空间**：分析顾客行为路径或现场安全隐患。
2. **仓库与工业自动化**：通过视频验证标准操作程序（SOP）的执行情况。
3. **安全监控协同**：对实时警报进行视觉验证，通过自然语言过滤掉传统算法产生的误报。
4. **数字资产管理**：在海量历史视频库中通过描述快速定位特定镜头并导出摘要报告。

### 快速开始

你需要一台配备 NVIDIA GPU（推荐 RTX 6000 Ada 或 A100/H100）的机器，并获取 NVIDIA API Key。

```bash

bash
 体验AI代码助手
 代码解读
复制代码

# 1. 克隆仓库
git clone https://github.com/NVIDIA-AI-Blueprints/video-search-and-summarization.git
cd video-search-and-summarization

# 2. 配置环境变量
echo "NVIDIA_API_KEY=your_key_here" > .env

# 3. 使用 Docker Compose 启动全栈服务（包含 UI、API 和索引引擎）
docker compose up -d
```

启动后，访问 `http://localhost:3000` 即可通过 Next.js 驱动的界面上传视频或连接 RTSP 流。

### 核心特性

1. **自然语言语义搜索**：支持“找出所有在雨中撑伞的人”这类复杂查询。
2. **视觉问答 (Visual Q&A)**：针对特定剪辑询问细节，如“工人是否佩戴了安全帽？”。
3. **自动化视频摘要**：为长达数小时的录像生成简洁的文字提要和关键帧列表。
4. **实时处理流水线 (RTVI)**：支持低延迟提取实时流的 Embedding。
5. **模型工具化 (Tool Calling)**：智能体可以根据需求调用不同的分析工具（如计数器、测距仪）。

### 项目优势

| 对比项 | NVIDIA VSS | 开源 VLM Demo (如 LLaVA) | 传统 VMS (视频管理系统) |
| :-- | :-- | :-- | :-- |
| **工程完备性** | 全栈参考架构（含索引、检索、UI） | 仅模型推理，无视频工程流程 | 仅支持基础规则过滤 |
| **实时性** | 深度优化 GPU 流水线，支持 RTSP | 主要是单文件处理，延迟高 | 毫秒级但缺乏语义理解 |
| **可扩展性** | 支持数百路摄像头并发 | 资源消耗大，难以扩展 | 部署简单但功能固化 |

* * *

## 项目详细剖析

### 架构设计：RTVI + NIM

VSS 的架构被称为 **RTVI (Real-Time Video Intelligence)**。它将处理过程分为两个平面：

#### 1\. 索引平面 (Indexing Plane)

利用专用的 Vision Encoder（如 NVIDIA 构建的高效模型）将每一帧或每秒的视频转化为向量。这些向量连同元数据一起存入高效的向量索引中。这使得“搜索”视频变成了一种大规模向量检索任务。

#### 2\. 推理平面 (Inference Plane)

当用户提出问题时，LLM 会作为控制器，首先从索引平面调取最相关的视频片段，然后将这些片段输入高性能的 VLM（跑在 **NVIDIA NIM** 微服务上）进行深度推理。

### 关键组件：Cosmos 与 Nemotron

- **Cosmos-Reason2-8B**：作为核心 VLM，负责理解复杂的视觉场景和逻辑关系。
- **Nemotron-Nano-9B**：作为轻量级控制器，负责解析用户的自然语言意图并将其转化为工具调用。

### MCP (Model Context Protocol)

VSS 最近引入了 **MCP** 技术，这使得视觉智能体能够无缝接入外部工具。例如，当问题涉及到“这辆车超速了吗？”时，智能体可以通过 MCP 接口动态调用下游的专业测速分析插件，而不是仅凭视觉“估计”。

* * *

## 项目地址与资源

### 官方资源

- 🌟 **GitHub**: [NVIDIA-AI-Blueprints/video-search-and-summarization](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2FNVIDIA-AI-Blueprints%2Fvideo-search-and-summarization "https://github.com/NVIDIA-AI-Blueprints/video-search-and-summarization")
- 📚 **文档**: [NVIDIA Metropolis Documentation](https://link.juejin.cn/?target=https%3A%2F%2Fdocs.nvidia.com%2Fmetropolis%2F "https://docs.nvidia.com/metropolis/")
- 💬 **解决方案指南**: [AI Blueprint for VSS](https://link.juejin.cn/?target=https%3A%2F%2Fwww.nvidia.com%2Fen-us%2Fai-data-science%2Fai-blueprints%2Fvideo-search-summarization%2F "https://www.nvidia.com/en-us/ai-data-science/ai-blueprints/video-search-summarization/")

### 适用人群

- **企业级开发者**：正在构建智慧城市、工业 AI 或高端监控系统。
- **AI 工程师**：希望学习如何将 VLM 落地到真实视频处理流水线的工程师。
- **视频分析从业者**：寻求自动化、自然语言交互式视频报告工具的用户。

* * *

_欢迎来我的 [个人主页](https://link.juejin.cn/?target=https%3A%2F%2Fhome.wonlab.top "https://home.wonlab.top") 找到更多有用的知识和有趣的产品_

标签：

[人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD) [计算机视觉](https://juejin.cn/tag/%E8%AE%A1%E7%AE%97%E6%9C%BA%E8%A7%86%E8%A7%89) [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90)

话题：

[每天一个知识点](https://juejin.cn/theme/detail/7243698841848348730?contentType=1)

本文收录于以下专栏

![cover](https://p9-juejin-sign.byteimg.com/tos-cn-i-k3u1fbpfcp/95414745836549ce9143753e2a30facd~tplv-k3u1fbpfcp-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674570&x-signature=Majmrp2cLor7O3HChVhw%2Bcw34E0%3D)

开源项目探索


专栏目录


有趣/实用的开源项目测评与解读


26 订阅

·

100 篇文章

订阅

上一篇

一天一个开源项目（第101篇）：OpenHuman - 真正懂你的本地优先个人 AI 超级助手


下一篇

一天一个开源项目（第103篇）：Open-Generative-AI - 开源 AI 视频与图像创作中心


评论 0

![avatar](https://lf-web-assets.juejin.cn/obj/juejin-web/xitu_juejin_web/58aaf1326ac763d8a1054056f3b7f2ef.svg)

0/ 1000

标点符号、链接等不计算在有效字数内


Ctrl + Enter


发送


登录 / 注册即可发布评论！

暂无评论数据

![](https://lf-web-assets.juejin.cn/obj/juejin-web/xitu_juejin_web/c12d6646efb2245fa4e88f0e1a9565b7.svg)点赞

![](https://lf-web-assets.juejin.cn/obj/juejin-web/xitu_juejin_web/336af4d1fafabcca3b770c8ad7a50781.svg)评论

![](https://lf-web-assets.juejin.cn/obj/juejin-web/xitu_juejin_web/3d482c7a948bac826e155953b2a28a9e.svg)
收藏


加个关注，精彩更新不错过~

![avatar](https://p6-passport.byteacctimg.com/img/user-avatar/de1cce2f42c62472385bf4b815fe0676~40x40.awebp)

关注


为你推荐

[一天一个开源项目（第57篇）：Unsloth - 2x 更快、70% 更省显存的 LLM 微调库](https://juejin.cn/post/7621832631912054838 "一天一个开源项目（第57篇）：Unsloth - 2x 更快、70% 更省显存的 LLM 微调库")

[深入解读 Unsloth，开源的大语言模型微调与强化学习库，支持 gpt-oss、DeepSeek、Qwen、Llama、Gemma 等，训练速度 2x、显存节省 70%，0% 精度损失](https://juejin.cn/post/7621832631912054838)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 1月前


- 220
- 1

- 评论


[AIGC](https://juejin.cn/tag/AIGC "AIGC") [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源") [资讯](https://juejin.cn/tag/%E8%B5%84%E8%AE%AF "资讯")

![一天一个开源项目（第57篇）：Unsloth - 2x 更快、70% 更省显存的 LLM 微调库](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/02fa10e6fa1546b6a4382055a760a702~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674570&x-signature=aO7dLpS19laW9bV%2FeKoMvzx%2FRG8%3D)

[一天一个开源项目（第84篇）：free-claude-code —— 零费用运行 Claude Code 的代理黑魔法](https://juejin.cn/post/7633317509793480745 "一天一个开源项目（第84篇）：free-claude-code —— 零费用运行 Claude Code 的代理黑魔法")

[free-claude-code 是一个轻量级 Python 代理服务，通过拦截 Claude Code 的 Anthropic API 请求并转发至免费替代后端NVIDIA NIM等多种](https://juejin.cn/post/7633317509793480745)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 20天前


- 469
- 4

- 评论


[人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD "人工智能") [Claude](https://juejin.cn/tag/Claude "Claude") [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源")

![一天一个开源项目（第84篇）：free-claude-code —— 零费用运行 Claude Code 的代理黑魔法](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/6c1e8bf63b774649963932e0288a123f~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674570&x-signature=QjMP65Ge7teDUHB4oTUjlyyMaRs%3D)

[一天一个开源项目（第28篇）：Graphiti - 为 AI Agent 构建实时知识图谱](https://juejin.cn/post/7607598321470177326 "一天一个开源项目（第28篇）：Graphiti - 为 AI Agent 构建实时知识图谱")

[深入解读 Graphiti，getzep 开源的「时间感知」知识图谱框架，支持增量更新、双时间模型与混合检索，面向动态环境中的 AI Agent 记忆与上下文工程，可接 Neo4j/FalkorDB](https://juejin.cn/post/7607598321470177326)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 2月前


- 840
- 6

- 评论


[人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD "人工智能") [AIGC](https://juejin.cn/tag/AIGC "AIGC")

![一天一个开源项目（第28篇）：Graphiti - 为 AI Agent 构建实时知识图谱](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/ace5202b2d92475e81abc53047517cd0~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674570&x-signature=bKe3DtMFerCox75u0Z2Du%2FDHsSM%3D)

[一天一个开源项目（第60篇）：IndexTTS - B 站开源的工业级零样本语音合成系统](https://juejin.cn/post/7623256350250745894 "一天一个开源项目（第60篇）：IndexTTS - B 站开源的工业级零样本语音合成系统")

[深入解读 IndexTTS，B 站 IndexTeam 开源的零样本 TTS 系统，支持情感控制、音色克隆、时长控制，IndexTTS2 实现情感与音色解耦，多模态情感输入，工业级可控与高效](https://juejin.cn/post/7623256350250745894)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 1月前


- 252
- 1

- 评论


[人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD "人工智能") [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源") [资讯](https://juejin.cn/tag/%E8%B5%84%E8%AE%AF "资讯")

![一天一个开源项目（第60篇）：IndexTTS - B 站开源的工业级零样本语音合成系统](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/44bd4f1e8a9b40bda86fc8b38bfb2cf5~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674570&x-signature=dNPKjId35snnby5Hik3OXvnsmDA%3D)

[一天一个开源项目（第16篇）：Code2Video - 用代码生成高质量教学视频的智能框架](https://juejin.cn/post/7603643044035248164 "一天一个开源项目（第16篇）：Code2Video - 用代码生成高质量教学视频的智能框架")

[深入解读 Code2Video，一个1.5k+ Stars的开源多智能体框架，通过可执行的Manim代码生成高质量教育视频，已被NeurIPS 2025接受，提供MMMC基准测试和完整评估体系](https://juejin.cn/post/7603643044035248164)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 3月前


- 475
- 1

- 评论


[AIGC](https://juejin.cn/tag/AIGC "AIGC") [音视频开发](https://juejin.cn/tag/%E9%9F%B3%E8%A7%86%E9%A2%91%E5%BC%80%E5%8F%91 "音视频开发") [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源")

![一天一个开源项目（第16篇）：Code2Video - 用代码生成高质量教学视频的智能框架](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/e704c6bcd4644a81bbbd4b2b58eb3de1~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674570&x-signature=0GcvzcK%2BKKsu632p5ioJHRalYNI%3D)

[一天一个开源项目（第55篇）：Spec Kit - GitHub 开源的规范驱动开发工具包](https://juejin.cn/post/7618768174595784754 "一天一个开源项目（第55篇）：Spec Kit - GitHub 开源的规范驱动开发工具包")

[深入解读 Spec Kit，GitHub 开源的规范驱动开发（Spec-Driven Development）工具包，让规范可执行](https://juejin.cn/post/7618768174595784754)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 1月前


- 623
- 点赞

- 评论


[开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源") [资讯](https://juejin.cn/tag/%E8%B5%84%E8%AE%AF "资讯") [AI编程](https://juejin.cn/tag/AI%E7%BC%96%E7%A8%8B "AI编程")

[一天一个开源项目（第35篇）：GitHub Store - 跨平台的 GitHub Releases 应用商店](https://juejin.cn/post/7611360423577829427 "一天一个开源项目（第35篇）：GitHub Store - 跨平台的 GitHub Releases 应用商店")

[深入解读 GitHub Store，rainxchzed 开源的跨平台应用商店，自动发现 GitHub Releases 中的可安装二进制文件（APK、EXE、DMG、AppImage 等），一键安装](https://juejin.cn/post/7611360423577829427)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 2月前


- 552
- 点赞

- 评论


[开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源") [资讯](https://juejin.cn/tag/%E8%B5%84%E8%AE%AF "资讯") [GitHub](https://juejin.cn/tag/GitHub "GitHub")

![一天一个开源项目（第35篇）：GitHub Store - 跨平台的 GitHub Releases 应用商店](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/e445bddade9544ac99e5d01faf756e61~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674570&x-signature=gL5tUa4cWFVONnv19N1Uk%2FJcDhY%3D)

[一天一个开源项目（第21篇）：Claude-Mem - 为 Claude Code 打造的持久化记忆压缩系统](https://juejin.cn/post/7606136581061771291 "一天一个开源项目（第21篇）：Claude-Mem - 为 Claude Code 打造的持久化记忆压缩系统")

[深入解读 Claude-Mem，一个自动捕获 Claude 编码会话中的工具使用与观察、用 AI 压缩并注入到未来会话的 Claude Code 插件，让 AI 助手拥有跨会话的持久记忆](https://juejin.cn/post/7606136581061771291)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 3月前


- 943
- 2

- 评论


[人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD "人工智能") [Claude](https://juejin.cn/tag/Claude "Claude") [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源")

![一天一个开源项目（第21篇）：Claude-Mem - 为 Claude Code 打造的持久化记忆压缩系统](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/bc8c5994668b458a961f7fbfa034db29~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674570&x-signature=Kf05erQ8%2Fh2riyQkyYHIUVs1LZg%3D)

[一天一个开源项目（第96篇）：OpenHarness - 轻量级 AI 代理基础设施框架](https://juejin.cn/post/7637710008821940251 "一天一个开源项目（第96篇）：OpenHarness - 轻量级 AI 代理基础设施框架")

[OpenHarness 是香港大学数据科学团队开源的轻量级 AI 代理基础设施框架，提供工具调用、技能加载、记忆管理和多代理协调四大核心能力，支持 Claude、OpenAI 等主流模型提供商](https://juejin.cn/post/7637710008821940251)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 8天前


- 105
- 点赞

- 评论


[人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD "人工智能") [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源") [资讯](https://juejin.cn/tag/%E8%B5%84%E8%AE%AF "资讯")

![一天一个开源项目（第96篇）：OpenHarness - 轻量级 AI 代理基础设施框架](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/797cdcd9f0e64573aac4cacff349eb77~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674570&x-signature=0%2B84o7F%2FyiI56SGYu7YPl530kHc%3D)

[一天一个开源项目（第89篇）：Warp - AI 驱动的现代化 Rust 终端](https://juejin.cn/post/7634874542255407142 "一天一个开源项目（第89篇）：Warp - AI 驱动的现代化 Rust 终端")

[一个用 Rust 语言从零重构的现代化终端，集成了 AI 协作、云端工作流共享和模块化 UI，致力于定义 AI 时代的“智能开发环境（ADE）”](https://juejin.cn/post/7634874542255407142)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 15天前


- 188
- 1

- 评论


[人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD "人工智能") [Rust](https://juejin.cn/tag/Rust "Rust") [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源")

![一天一个开源项目（第89篇）：Warp - AI 驱动的现代化 Rust 终端](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/10f44d53ded7404ea816a00858f8b8f7~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674570&x-signature=obItxiGn%2BU8wwAKLU%2B4iWSN6Vt8%3D)

[一天一个开源项目（第19篇）：Folo - AI驱动的下一代信息阅读器](https://juejin.cn/post/7605214360085315620 "一天一个开源项目（第19篇）：Folo - AI驱动的下一代信息阅读器")

[深入解读 Folo，一个37.1k+ Stars的开源AI阅读器，支持RSS订阅、AI摘要翻译、多端同步，将信息聚合到统一时间线，打造无噪音的阅读体验](https://juejin.cn/post/7605214360085315620)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 3月前


- 787
- 点赞

- 评论


[人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD "人工智能") [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源") [资讯](https://juejin.cn/tag/%E8%B5%84%E8%AE%AF "资讯")

![一天一个开源项目（第19篇）：Folo - AI驱动的下一代信息阅读器](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/1cbea42c86f74ee2b968b7bb412be8a5~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674570&x-signature=o8zL6jCEY1oTkDzXmkVlf4MrJy8%3D)

[一天一个开源项目（第31篇）：awesome-openclaw-usecases - OpenClaw 真实用例集合](https://juejin.cn/post/7609151073307951155 "一天一个开源项目（第31篇）：awesome-openclaw-usecases - OpenClaw 真实用例集合")

[深入解读 awesome-openclaw-usecases，hesamsheikh 维护的 OpenClaw 社区用例集合，收录 29+ 真实场景，涵盖社交媒体、生产力、DevOps、研究学习等](https://juejin.cn/post/7609151073307951155)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 2月前


- 2.4k
- 4

- 评论


[人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD "人工智能") [Agent](https://juejin.cn/tag/Agent "Agent") [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源")

![一天一个开源项目（第31篇）：awesome-openclaw-usecases - OpenClaw 真实用例集合](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/03dc36c64147497d9314b8ad9bc12277~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674570&x-signature=3NcU0CTE75IdyzQCkvdm1IoE8sk%3D)

[一天一个开源项目（第44篇）：GitNexus - 零服务器的代码智能引擎，为 AI Agent 构建代码库知识图谱](https://juejin.cn/post/7614336660985692186 "一天一个开源项目（第44篇）：GitNexus - 零服务器的代码智能引擎，为 AI Agent 构建代码库知识图谱")

[深入解读 GitNexus，一款零服务器的代码智能引擎，完全在浏览器中运行的知识图谱创建器，通过 MCP 协议为 Cursor、Claude Code、Windsurf 等 AI 代理提供深度代码库](https://juejin.cn/post/7614336660985692186)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 2月前


- 1.8k
- 点赞

- 评论


[人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD "人工智能") [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源") [资讯](https://juejin.cn/tag/%E8%B5%84%E8%AE%AF "资讯")

![一天一个开源项目（第44篇）：GitNexus - 零服务器的代码智能引擎，为 AI Agent 构建代码库知识图谱](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/774e30d5162342eda35312d71ab26dbc~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674570&x-signature=dJb0KOR8vGs7pgdR9iH%2FqB8jR9g%3D)

[一天一个开源项目（第90篇）：cmux - 为 AI Agent 时代设计的原生终端复用器](https://juejin.cn/post/7634873282533998618 "一天一个开源项目（第90篇）：cmux - 为 AI Agent 时代设计的原生终端复用器")

[一个为 AI 编程代理（Coding Agents）量身定制的 macOS 原生终端与浏览器复用器，让 Agent 与人类开发者在同一个高度可编程的窗口内协同工作](https://juejin.cn/post/7634873282533998618)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 15天前


- 93
- 点赞

- 评论


[人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD "人工智能") [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源") [资讯](https://juejin.cn/tag/%E8%B5%84%E8%AE%AF "资讯")

![一天一个开源项目（第90篇）：cmux - 为 AI Agent 时代设计的原生终端复用器](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/288e3fab79a04b6986685c80812cc6a4~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674570&x-signature=jCZLSdxmT4ZFak0mic6k%2BLZz4no%3D)

[一天一个开源项目（第29篇）：Open-AutoGLM - 用自然语言操控手机的 Phone Agent 框架](https://juejin.cn/post/7608382961723588658 "一天一个开源项目（第29篇）：Open-AutoGLM - 用自然语言操控手机的 Phone Agent 框架")

[深入解读 Open-AutoGLM，zai-org 开源的手机端智能助理框架与 AutoGLM-Phone 模型，通过 ADB/HDC 与视觉语言模型实现「说一句话、自动操作智能手机](https://juejin.cn/post/7608382961723588658)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 2月前


- 646
- 点赞

- 评论


[人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD "人工智能") [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源") [资讯](https://juejin.cn/tag/%E8%B5%84%E8%AE%AF "资讯")

![一天一个开源项目（第29篇）：Open-AutoGLM - 用自然语言操控手机的 Phone Agent 框架](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/ece3b81e25dc4508a1200ac0d921433a~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674570&x-signature=LtwtlgwO4RTy2K2L%2BT6e6Wt8NUA%3D)

收藏成功！

已添加到「」， 点击更改

- 微信
![](https://juejin.cn/post/7640008164920868874)微信扫码分享

- 新浪微博
- QQ

![image](https://lf-web-assets.juejin.cn/obj/juejin-web/xitu_juejin_web/img/cartoon.31472f0.png)

AI代码助手上线啦

选中代码，体验AI替你一键快速解读代码

立即体验

APP内打开

- ![下载掘金APP](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2ad212d53ccd44569d10317171664bae~tplv-k3u1fbpfcp-jj:90:0:0:0:q75.avis)下载APP










下载APP
- ![微信扫一扫](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9f4933cc8fdb411cba89904f14a3ec0a~tplv-k3u1fbpfcp-jj:90:0:0:0:q75.avis)微信扫一扫










微信公众号
- [新浪微博](https://weibo.com/xitucircle)

![](https://lf-web-assets.juejin.cn/obj/juejin-web/xitu_juejin_web/img/MaskGroup.13dfc4f.png)选择你感兴趣的技术方向

后端


前端


Android


iOS


人工智能


开发工具


代码人生


阅读


跳过

上一步

至少选择1个分类


![](https://lf-web-assets.juejin.cn/obj/juejin-web/xitu_juejin_web/8867e249c23a7c0ea596c139befc04d7.svg)

温馨提示

当前操作失败，如有疑问，可点击申诉

前往申诉我知道了

沉浸阅读


确定屏蔽该用户

屏蔽后，对方将不能关注你、与你产生任何互动，无法查看你的主页