# 一天一个开源项目（第101篇）：OpenHuman - 真正懂你的本地优先个人 AI 超级助手

[冬奇Lab](https://juejin.cn/user/1857501105781193/posts)

2026-05-15

84

阅读10分钟


专栏：


开源项目探索


关注

## 引言

> "Private, Simple and extremely powerful."

这是"一天一个开源项目"系列的第101篇文章。今天带你了解的项目是 **OpenHuman**。

大多数 AI 助手有一个根本性的局限： **它们没有记忆**。每次对话都从零开始，不知道你在做什么项目，不知道你的 Gmail 收件箱里有什么，不知道你的 GitHub 仓库上周发生了什么。

OpenHuman 想解决的正是这件事。它的目标不是做一个更好的聊天机器人，而是做一个 **真正融入你日常生活的 AI 超级智能**——每 20 分钟自动拉取你所有集成应用的最新数据，把它们压缩进一个本地 SQLite 知识树，让 AI 随时能访问你的完整工作上下文。5.6k Stars，Rust + Tauri 构建，GPL-3.0 开源，早期 Beta 但已展现出独特的技术路线。

### 你将学到什么

- OpenHuman 的 Memory Tree 架构如何实现真正的持久记忆（而非简单的对话历史）
- 118+ OAuth 集成 + 每 20 分钟自动同步的工作原理
- TokenJuice 压缩技术如何把 LLM 调用成本降低最高 80%
- 模型路由（Model Routing）如何根据任务类型智能选择推理/快速/视觉模型
- 桌面吉祥物（Desktop Mascot）为什么是差异化的产品设计，而不是噱头
- 为什么选择 Rust + Tauri 而不是 Electron 是一个重要的架构决策

### 前置知识

- 对 AI 助手和 Agent 有基本了解
- 了解 OAuth 授权的基本概念
- Rust 开发背景有助于理解技术设计，但不是必需的

* * *

## 项目背景

### 项目简介

OpenHuman 是一个开源的个人 AI 代理助手，定位为"Personal AI Super Intelligence"。它的核心差异化在三个关键词：

- **Private（私有）**：所有工作流数据本地加密存储，不上传到任何云端
- **Simple（简单）**：从安装到运行只需几次点击，无需终端配置
- **Powerful（强大）**：118+ 应用集成 + 持久记忆 + 智能压缩 + 多模型路由

它不只是一个对话框，而是一个主动运作的后台代理：定期拉取数据、持续更新知识树、在你需要时随时提供完整上下文。

### 作者/团队介绍

- **组织**：tinyhumansai
- **创建者**：@senamakel
- **项目状态**：早期 Beta，活跃开发中
- **技术选择**：选用 Rust（69.7%）+ TypeScript（26.1%）+ Tauri 构建桌面应用，而非主流的 Electron，体现了对性能和内存占用的高要求

### 项目数据

- ⭐ GitHub Stars: **5,600+**
- 🍴 Forks: **459**
- 🔧 主要语言: **Rust 69.7% + TypeScript 26.1%**
- 📄 License: GPL-3.0
- 🖥️ 支持平台: macOS、Linux (x64)、Windows
- 🌐 仓库: [tinyhumansai/openhuman](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Ftinyhumansai%2Fopenhuman "https://github.com/tinyhumansai/openhuman")
- 🔗 官网: [tinyhumans.ai/openhuman](https://link.juejin.cn/?target=https%3A%2F%2Ftinyhumans.ai%2Fopenhuman "https://tinyhumans.ai/openhuman")

* * *

## 主要功能

### 核心作用

OpenHuman 的本质是： **一个主动感知你工作上下文的 AI 代理**，而不是被动响应的聊天机器人。

它与传统 AI 助手的核心区别：

```yaml

yaml
 体验AI代码助手
 代码解读
复制代码

传统 AI 助手:
  用户提问 → AI 用训练数据回答 → 对话结束（记忆归零）

OpenHuman:
  后台每 20 分钟: 拉取 Gmail / GitHub / Notion / Slack / ... 最新数据
       ↓
  Memory Tree: 压缩归档进本地知识树（SQLite + Obsidian Vault）
       ↓
  用户提问: AI 基于你完整的、最新的工作上下文回答
       ↓
  对话结束: 上下文保留，下次继续
```

### 使用场景

1. **跨应用的项目上下文理解**
   - "把我 GitHub 上这个 PR 的进展总结一下，并对比 Linear 里相关 Issue 的最新评论"——AI 已经拉取了两边的数据，直接回答。
2. **邮件与任务的自动关联**
   - "我今天有没有收到关于这个项目的邮件？" AI 扫描已同步的 Gmail 数据，给出摘要和重要邮件列表。
3. **会议助手**
   - 桌面吉祥物作为参会者加入 Google Meet，实时记录、实时提供背景信息。
4. **代码与文档的问答**
   - 基于同步的 GitHub 仓库数据，回答关于代码逻辑、历史变更、PR 评论的问题。
5. **Obsidian 知识库增强**
   - 所有同步数据同时写入 Obsidian 兼容的 Vault，用户可以在熟悉的笔记界面浏览和编辑 AI 维护的知识。

### 快速开始

**方法 1：直接下载安装包（推荐）**

```bash

bash
 体验AI代码助手
 代码解读
复制代码

# macOS / Linux（一键安装脚本）
curl -fsSL https://raw.githubusercontent.com/tinyhumansai/openhuman/main/install.sh | bash

# Windows（PowerShell）
irm https://raw.githubusercontent.com/tinyhumansai/openhuman/main/install.ps1 | iex

# 或直接到官网下载安装包
# https://tinyhumans.ai/openhuman
```

安装后，通过 UI 向导完成：

1. 选择 AI 模型提供商（OpenAI / Anthropic / Ollama 本地模型）
2. 添加 OAuth 集成（从 118 个应用中选择你需要的）
3. 开始使用

**方法 2：开发者源码构建**

```bash

bash
 体验AI代码助手
 代码解读
复制代码

# 环境要求
# - Node.js 24+
# - pnpm 10.10.0
# - Rust 1.93.0（含 rustfmt + clippy）
# - CMake

git clone https://github.com/tinyhumansai/openhuman.git
cd openhuman

pnpm install

# 开发模式启动
pnpm tauri dev

# 生产构建
pnpm tauri build
```

**配置本地 Ollama 模型（完全本地化）**：

```bash

bash
 体验AI代码助手
 代码解读
复制代码

# 先安装并启动 Ollama
ollama serve
ollama pull llama3.2  # 或其他模型

# 在 OpenHuman 设置中选择 "Ollama" 作为模型提供商
# 指向本地端点: http://localhost:11434
```

### 核心特性

**1\. Memory Tree（记忆树）——持久记忆的技术实现**

这是 OpenHuman 最核心的技术创新。它不只是保存对话历史，而是构建了一棵真正的知识树：

```css

css
 体验AI代码助手
 代码解读
复制代码

原始数据（Gmail 邮件 / GitHub PR / Notion 页面 / Slack 消息 ...）
        ↓
  内容规范化（HTML → Markdown，URL 缩短，去除非 ASCII）
        ↓
  分块处理（每块 ≤ 3k tokens）
        ↓
  重要性评分（基于时效性、相关性、频次）
        ↓
  层次化摘要树（父节点 = 子节点摘要的摘要）
        ↓
  双写入:
    → SQLite 本地数据库（AI 查询用）
    → Obsidian 兼容 Vault（用户浏览用）
```

层次化摘要树的优势：当 AI 需要回答"关于 X 项目的总体状况"时，直接读取高层摘要节点；当需要细节时，再向下钻取具体的数据块。这比简单的向量检索更有结构感，更像人类的记忆组织方式。

**2\. 118+ OAuth 集成 + 自动同步**

覆盖主流工作效率工具的完整生态：

| 类别 | 代表应用 |
| :-- | :-- |
| **邮件/通讯** | Gmail、Outlook、Slack |
| **项目管理** | Notion、Linear、Jira、Asana、Trello |
| **代码托管** | GitHub、GitLab、Bitbucket |
| **文档协作** | Google Drive、Dropbox、OneDrive、Confluence |
| **日历/会议** | Google Calendar、Outlook Calendar |
| **CRM/营销** | Stripe、HubSpot、Salesforce |
| **其他** | Airtable、Figma、Zapier、Webhooks... |

每 20 分钟的自动同步意味着：你不需要手动"告诉"AI 发生了什么——它自己会去取。

**3\. TokenJuice——LLM 调用成本压缩技术**

TokenJuice 是 OpenHuman 的一个内部技术模块，在所有内容送入 LLM 之前进行压缩处理：

```less

less
 体验AI代码助手
 代码解读
复制代码

原始工具输出 / 网页抓取内容 / API 响应
        ↓
TokenJuice 处理管道:
  1. HTML → 纯 Markdown（去掉所有 HTML 标签）
  2. URL 缩短（将长 URL 替换为短标识符）
  3. 去除非 ASCII 字符（表情符号、特殊符号）
  4. 冗余内容去重（导航栏、页脚、广告等）
  5. 关键信息提取（标题、正文、元数据）
        ↓
  压缩效果: 成本和延迟最高降低 80%
```

对于频繁调用 LLM 的 Agent 来说，这个压缩层的价值是显著的——一个月的 API 费用可能直接减少一半以上。

**4\. 智能模型路由（Model Routing）**

不同的任务适合不同的模型，OpenHuman 会自动路由：

| 任务类型 | 路由目标 | 原因 |
| :-- | :-- | :-- |
| 复杂推理（代码分析、方案设计） | 推理模型（o3、Claude Opus） | 准确性优先 |
| 简单问答（查找数据、格式转换） | 快速模型（GPT-4o-mini、Haiku） | 成本和速度优先 |
| 图片/截图分析 | 视觉模型（GPT-4V、Claude Vision） | 多模态需求 |
| 完全离线场景 | Ollama 本地模型 | 隐私优先 |

**5\. 桌面吉祥物（Desktop Mascot）**

这不是一个纯粹的 UI 噱头，而是一个具备实际功能的后台代理界面：

- **会议参与**：作为参与者加入 Google Meet，实时记录讨论内容
- **背景处理**：持续在后台运行，处理定时同步任务
- **主动提醒**：基于日历和任务数据，主动提醒即将到期的事项
- **个性化交互**：有个性和记忆，而非无状态的"帮助机器人"

**6\. 本地优先隐私架构**

```

 体验AI代码助手
 代码解读
复制代码

所有工作流数据 → 本地 SQLite（AES 加密）
AI 推理 → 可选本地 Ollama（完全离线）
OAuth Token → 本地加密存储，不经过 OpenHuman 服务器
第三方数据 → 只存在你的设备上
```

这与大多数 AI 助手把你的数据发送到云端进行索引的方式截然不同。

### 项目优势

| 对比项 | OpenHuman | Notion AI / Copilot | ChatGPT / Claude.ai | Mem.ai |
| :-- | :-- | :-- | :-- | :-- |
| **持久记忆** | ✅ Memory Tree（知识树） | 仅限平台内内容 | ❌ 每次对话重置 | ✅ 但云端存储 |
| **跨应用集成** | ✅ 118+ OAuth 应用 | 有限 | ❌ | 有限 |
| **本地/隐私** | ✅ 本地 SQLite 加密 | ❌ 云端 | ❌ 云端 | ❌ 云端 |
| **自动同步** | ✅ 每 20 分钟 | 无 | 无 | 有 |
| **开源** | ✅ GPL-3.0 | ❌ | ❌ | ❌ |
| **桌面原生** | ✅ Rust + Tauri | Web 插件 | Web | Web |
| **本地 AI 模型** | ✅ Ollama 支持 | ❌ | ❌ | ❌ |

* * *

## 项目详细剖析

### 1\. 为什么选 Rust + Tauri，而不是 Electron？

这是 OpenHuman 最有意识的架构决策之一：

**Electron 的问题**：

- 每个 Electron 应用内置一个完整的 Chromium 引擎
- 基本内存占用通常在 200-500MB
- CPU 占用较高，后台运行影响电池续航

**Tauri + Rust 的优势**：

- Tauri 使用系统原生 WebView（macOS 用 WKWebView，Windows 用 WebView2）
- 核心逻辑用 Rust 编写：内存安全、零成本抽象、极低内存占用（通常 < 50MB）
- 构建产物更小：一个 Tauri 应用通常 3-10MB，而 Electron 通常 100MB+

对于一个需要 **常驻后台、每 20 分钟运行同步任务** 的应用，这个架构选择直接决定了用户体验：OpenHuman 的资源占用更接近一个原生系统应用，而不是一个重量级 Web 应用。

### 2\. Memory Tree vs 向量检索：两种记忆哲学

大多数带记忆功能的 AI 工具使用向量数据库：把内容分块、向量化，检索时找最相似的块。OpenHuman 选择了不同的路径——层次化摘要树：

```makefile

makefile
 体验AI代码助手
 代码解读
复制代码

向量检索方式:
  输入: "X 项目现在怎么样了"
  → 向量搜索找到 Top-K 相似块（可能来自不同时间、不同视角）
  → 拼接成上下文 → LLM 回答
  问题: 碎片化，缺乏整体视图

Memory Tree 方式:
  输入: "X 项目现在怎么样了"
  → 直接查询 "X 项目" 节点的高层摘要
  → 需要细节时向下展开子节点
  → 回答具有层次感和整体感
```

这两种方式各有适用场景，OpenHuman 的选择更适合"理解一个长期项目的整体状态"这类问题。

* * *

## 项目地址与资源

### 官方资源

- 🌟 **GitHub**: [github.com/tinyhumansa…](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Ftinyhumansai%2Fopenhuman "https://github.com/tinyhumansai/openhuman")
- 🔗 **官网下载**: [tinyhumans.ai/openhuman](https://link.juejin.cn/?target=https%3A%2F%2Ftinyhumans.ai%2Fopenhuman "https://tinyhumans.ai/openhuman")

### 适用人群

- **知识工作者**：同时使用多个 SaaS 工具（Gmail + Notion + GitHub + Slack），需要 AI 跨工具理解上下文
- **独立开发者 / 一人公司**：项目管理、代码、邮件全靠自己，希望 AI 助手真正懂你的项目状态
- **隐私敏感用户**：不希望工作数据上传到 AI 公司的云端
- **AI 工具研究者**：对本地优先 AI 助手的架构设计感兴趣

* * *

## 总结与展望

### 核心要点回顾

1. **Memory Tree**：层次化摘要树 \+ SQLite 本地存储，真正的跨会话持久记忆
2. **118+ OAuth + 每 20 分钟自动同步**：让 AI 主动感知你的工作上下文，而不是被动等待
3. **TokenJuice**：LLM 调用前的智能压缩，成本最高降低 80%
4. **Rust + Tauri**：原生桌面应用架构，后台常驻占用极低
5. **本地优先隐私**：所有数据加密存储在本地，支持完全离线的 Ollama 本地模型

### 一句话评价

> OpenHuman 在构建一个 AI 助手里最难做的事：让 AI 真正"了解"你——不是通过你告诉它，而是通过它主动观察你的工作世界。

* * *

_欢迎来我的 [个人主页](https://link.juejin.cn/?target=https%3A%2F%2Fhome.wonlab.top "https://home.wonlab.top") 找到更多有用的知识和有趣的产品_

标签：

[人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD) [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90) [资讯](https://juejin.cn/tag/%E8%B5%84%E8%AE%AF)

话题：

[每天一个知识点](https://juejin.cn/theme/detail/7243698841848348730?contentType=1)

本文收录于以下专栏

![cover](https://p26-juejin-sign.byteimg.com/tos-cn-i-k3u1fbpfcp/95414745836549ce9143753e2a30facd~tplv-k3u1fbpfcp-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674581&x-signature=87od8sGrMSkki%2FaTrUfF4J0cQ%2BU%3D)

开源项目探索


专栏目录


有趣/实用的开源项目测评与解读


26 订阅

·

100 篇文章

订阅

上一篇

一天一个开源项目（第100篇）：Easy-Vibe - Datawhale 出品的 AI 时代编程入门教程


下一篇

一天一个开源项目（第102篇）：NVIDIA Video Search and Summarization - 构建 GPU 加速的视觉智能体


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

[一天一个开源项目（第88篇）：pi-mono - 极简主义的高性能 AI 编程助手](https://juejin.cn/post/7634370785185808420 "一天一个开源项目（第88篇）：pi-mono - 极简主义的高性能 AI 编程助手")

[一个由 libGDX 作者 Mario Zechner 开发的极简 AI 编程 Agent，主打极速响应、极简内核与极致控制力。](https://juejin.cn/post/7634370785185808420)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 16天前


- 201
- 点赞

- 2


[人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD "人工智能") [Agent](https://juejin.cn/tag/Agent "Agent") [AI编程](https://juejin.cn/tag/AI%E7%BC%96%E7%A8%8B "AI编程")

![一天一个开源项目（第88篇）：pi-mono - 极简主义的高性能 AI 编程助手](https://p3-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/c05c15924d25473eb8f4865b408d0135~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674581&x-signature=ub4LdUWIhmXCLUX%2F0C83ARIRLIM%3D)

[一天一个开源项目（第68篇）：DeerFlow - 字节跳动出品的深度研究与超级智能体框架](https://juejin.cn/post/7626235066952826889 "一天一个开源项目（第68篇）：DeerFlow - 字节跳动出品的深度研究与超级智能体框架")

[DeerFlow (Deep Exploration and Efficient Research Flow) 是由字节跳动开源的一个深度研究框架，现已进化为支持长程任务、具备沙箱隔离和长期记忆](https://juejin.cn/post/7626235066952826889)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 1月前


- 328
- 点赞

- 评论


[人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD "人工智能") [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源") [资讯](https://juejin.cn/tag/%E8%B5%84%E8%AE%AF "资讯")

![一天一个开源项目（第68篇）：DeerFlow - 字节跳动出品的深度研究与超级智能体框架](https://p3-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/5cbbab80766642d9acbc531bf5c251d3~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674581&x-signature=llpGr3KwD2pZbHXIRp5zxAGBtEM%3D)

[3.4k Star 的 OpenHuman，我用 Claude Code 啃了 7 天——一个量化老炮的复刻实录](https://juejin.cn/post/7639188030881136655 "3.4k Star 的 OpenHuman，我用 Claude Code 啃了 7 天——一个量化老炮的复刻实录")

[强烈推荐。如果你也在做量化、金融 AI 或者独立开发，评论区聊。我那个精简版可能过段时间会开源出来，到时候挂出 repo 在这篇文章下面更新。](https://juejin.cn/post/7639188030881136655)

- [AI\_paid\_community](https://juejin.cn/user/10371126790907)

- 4天前


- 72
- 1

- 评论


[Claude](https://juejin.cn/tag/Claude "Claude")

![3.4k Star 的 OpenHuman，我用 Claude Code 啃了 7 天——一个量化老炮的复刻实录](https://p3-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/73f1388e53d44a2fb80a6377cb64b59b~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgQUlfcGFpZF9jb21tdW5pdHk=:q75.awebp?rk3s=f64ab15b&x-expires=1779674581&x-signature=6iXKhkzvaYY5E3a21t506zaSHBY%3D)

[多天霸榜 Github，这个开源AI助手火了。](https://juejin.cn/post/7640257851874361390 "多天霸榜 Github，这个开源AI助手火了。")

[OpenHuman 是一款开源的个人 AI 助手，能在几分钟内"了解你"而非几周。通过 118+ 第三方集成和 Memory Tree 记忆系统，它自动同步你的邮件、日历、代码仓库等数据，构建专属知识](https://juejin.cn/post/7640257851874361390)

- [Hey\_AI\_Coder](https://juejin.cn/user/1646433007832650)

- 23小时前


- 15
- 点赞

- 评论


[GitHub](https://juejin.cn/tag/GitHub "GitHub")

![多天霸榜 Github，这个开源AI助手火了。](https://p3-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/46d11da10b75410da208ab780deab5b4~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgSGV5X0FJX0NvZGVy:q75.awebp?rk3s=f64ab15b&x-expires=1779674581&x-signature=nu8DHnWwsZQQZmoteGRaFrPYg30%3D)

[一天一个开源项目（第79篇）：生化危机女主角亲自开源的 AI 记忆系统 MemPalace](https://juejin.cn/post/7631022614798794806 "一天一个开源项目（第79篇）：生化危机女主角亲自开源的 AI 记忆系统 MemPalace")

[深入解析 MemPalace，一个本地优先的 AI 持久记忆系统，48k+ Stars。用古希腊记忆宫殿技法重构 AI 记忆架构：翼廊/房间/抽屉的层次组织、4 层渐进式加载仅消耗 170 Token](https://juejin.cn/post/7631022614798794806)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 26天前


- 178
- 点赞

- 评论


[人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD "人工智能") [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源") [资讯](https://juejin.cn/tag/%E8%B5%84%E8%AE%AF "资讯")

![一天一个开源项目（第79篇）：生化危机女主角亲自开源的 AI 记忆系统 MemPalace](https://p3-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/2bcd5ec2d96a449e9e36b31be6ebed52~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674581&x-signature=%2FQAumPO9c2eu07ofyCUQTv2C%2Fww%3D)

[一天一个开源项目（第96篇）：OpenHarness - 轻量级 AI 代理基础设施框架](https://juejin.cn/post/7637710008821940251 "一天一个开源项目（第96篇）：OpenHarness - 轻量级 AI 代理基础设施框架")

[OpenHarness 是香港大学数据科学团队开源的轻量级 AI 代理基础设施框架，提供工具调用、技能加载、记忆管理和多代理协调四大核心能力，支持 Claude、OpenAI 等主流模型提供商](https://juejin.cn/post/7637710008821940251)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 8天前


- 105
- 点赞

- 评论


[人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD "人工智能") [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源") [资讯](https://juejin.cn/tag/%E8%B5%84%E8%AE%AF "资讯")

![一天一个开源项目（第96篇）：OpenHarness - 轻量级 AI 代理基础设施框架](https://p3-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/797cdcd9f0e64573aac4cacff349eb77~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674581&x-signature=uxVF722i2OpDVgtXIVKNKxQLRZw%3D)

[【AI Agent 深度解析】OpenHuman 开源项目全面分析 — 打造你的个人 AI 超级智能助手](https://juejin.cn/post/7640058380531941416 " 【AI Agent 深度解析】OpenHuman 开源项目全面分析 — 打造你的个人 AI 超级智能助手")

[一、项目概述 1.1 项目背景 在 AI Agent（智能代理）快速发展的今天，我们面临着一个核心问题：大多数 AI 助手需要从零开始学习用户，需要花费数天甚至数周才能真正了解你的技术栈和工作流。 O](https://juejin.cn/post/7640058380531941416)

- [码流怪侠](https://juejin.cn/user/1423243193097241)

- 23小时前


- 10
- 点赞

- 评论


[GitHub](https://juejin.cn/tag/GitHub "GitHub") [程序员](https://juejin.cn/tag/%E7%A8%8B%E5%BA%8F%E5%91%98 "程序员") [人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD "人工智能")

[一天一个开源项目（第92篇）：OpenHands - 全能型开源 AI 软件工程师](https://juejin.cn/post/7635648481567998015 "一天一个开源项目（第92篇）：OpenHands - 全能型开源 AI 软件工程师")

[OpenHands（原 OpenDevin）是一个开源的自主 AI 软件工程平台，旨在通过 AI 智能体与开发者协作，实现自动编程、修复 Bug 和交付功能](https://juejin.cn/post/7635648481567998015)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 13天前


- 124
- 点赞

- 评论


[人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD "人工智能") [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源") [Agent](https://juejin.cn/tag/Agent "Agent")

![一天一个开源项目（第92篇）：OpenHands - 全能型开源 AI 软件工程师](https://p3-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/6f981fb18ecd49e099661fd24c17b832~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674581&x-signature=SRd38mk1UXT5O%2Fwb7t%2Bp7wm61Z0%3D)

[一天一个开源项目（第73篇）：Multica - 把 AI 编程智能体变成真正的团队成员](https://juejin.cn/post/7628251518199365686 "一天一个开源项目（第73篇）：Multica - 把 AI 编程智能体变成真正的团队成员")

[深入解读 Multica，10k+ Stars 的开源智能体管理平台，通过 Kanban 看板、技能复用、WebSocket 实时推送和统一运行时管理](https://juejin.cn/post/7628251518199365686)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 1月前


- 748
- 1

- 评论


[人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD "人工智能") [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源") [资讯](https://juejin.cn/tag/%E8%B5%84%E8%AE%AF "资讯")

![一天一个开源项目（第73篇）：Multica - 把 AI 编程智能体变成真正的团队成员](https://p3-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/da0cbde843304ed497ee376a2e9dea7e~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674581&x-signature=2XPgrGZsvn95ArbFqQyJHVg8ze8%3D)

[OpenHuman 开源项目详解：个人 AI 助手架构与核心技术拆解](https://juejin.cn/post/7638936746387357722 "OpenHuman 开源项目详解：个人 AI 助手架构与核心技术拆解")

[OpenHuman 它并非单纯的聊天机器人，而是想要搭建一套面向个人的AI系统，也就是支持长期记忆、外部服务集成、模型路由、工具调用，甚至还能和桌面环境结合起来，以此形成更完整的助手体验。](https://juejin.cn/post/7638936746387357722)

- [栀维](https://juejin.cn/user/3563982632259018)

- 4天前


- 33
- 点赞

- 评论


[开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源") [性能优化](https://juejin.cn/tag/%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96 "性能优化")

![OpenHuman 开源项目详解：个人 AI 助手架构与核心技术拆解](https://p3-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/d43369a1f5c941528408d92eea479df8~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qCA57u0:q75.awebp?rk3s=f64ab15b&x-expires=1779674581&x-signature=ajQXZJyf0mrv6xBJYOkU9YPEzGI%3D)

[一天一个开源项目（第29篇）：Open-AutoGLM - 用自然语言操控手机的 Phone Agent 框架](https://juejin.cn/post/7608382961723588658 "一天一个开源项目（第29篇）：Open-AutoGLM - 用自然语言操控手机的 Phone Agent 框架")

[深入解读 Open-AutoGLM，zai-org 开源的手机端智能助理框架与 AutoGLM-Phone 模型，通过 ADB/HDC 与视觉语言模型实现「说一句话、自动操作智能手机](https://juejin.cn/post/7608382961723588658)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 2月前


- 646
- 点赞

- 评论


[人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD "人工智能") [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源") [资讯](https://juejin.cn/tag/%E8%B5%84%E8%AE%AF "资讯")

![一天一个开源项目（第29篇）：Open-AutoGLM - 用自然语言操控手机的 Phone Agent 框架](https://p3-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/ece3b81e25dc4508a1200ac0d921433a~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674581&x-signature=uD%2FllIUfpgEbMiJwEbEQMb939Ww%3D)

[一天一个开源项目（第26篇）：ZeroClaw - 零开销、全 Rust 的自主 AI 助手基础设施，与 OpenClaw 的关系与对比](https://juejin.cn/post/7606988289873068083 "一天一个开源项目（第26篇）：ZeroClaw - 零开销、全 Rust 的自主 AI 助手基础设施，与 OpenClaw 的关系与对比")

[深入解读 ZeroClaw，与 OpenClaw 同赛道的轻量级替代：单二进制、小于 5MB 内存、毫秒级启动，支持从 OpenClaw 迁移记忆与身份，并在功能与性能上做多维度对比](https://juejin.cn/post/7606988289873068083)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 2月前


- 3.8k
- 3

- 评论


[人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD "人工智能") [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源") [资讯](https://juejin.cn/tag/%E8%B5%84%E8%AE%AF "资讯")

![一天一个开源项目（第26篇）：ZeroClaw - 零开销、全 Rust 的自主 AI 助手基础设施，与 OpenClaw 的关系与对比](https://p3-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/d676e2d9420641a487adda4a1201769a~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674581&x-signature=hwNBeAyEQZJ7ZN94tl7AoUXMB3s%3D)

[一天一个开源项目（第83篇）：karpathy/autoresearch —— 开启 AI“自演化”实验室时代](https://juejin.cn/post/7632264475765407798 "一天一个开源项目（第83篇）：karpathy/autoresearch —— 开启 AI“自演化”实验室时代")

[karpathy/autoresearch 是由 AI 大神 Andrej Karpathy 发起的实验性项目，旨在构建一个自主运行的 AI 系统，让 AI 智能体能够独立进行模型架构探索、超参数调优](https://juejin.cn/post/7632264475765407798)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 22天前


- 341
- 1

- 2


[人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD "人工智能") [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源") [LLM](https://juejin.cn/tag/LLM "LLM")

![一天一个开源项目（第83篇）：karpathy/autoresearch —— 开启 AI“自演化”实验室时代](https://p3-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/cdb9149b953e4941879b06f38fcb92a0~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674581&x-signature=Hyl9XlArkjd3681KqSW2BuQBt7k%3D)

[一天一个开源项目（第5篇）：最近火爆硅谷的ClaudBot，真不是什么不得了的事](https://juejin.cn/post/7600223321041682438 "一天一个开源项目（第5篇）：最近火爆硅谷的ClaudBot，真不是什么不得了的事")

[深度剖析 Moltbot（原 Clawdbot），一个72k+ Stars的开源AI桌面助手，冷静分析它与豆包、千问等现有智能工具的差异，揭示被过度炒作的真相](https://juejin.cn/post/7600223321041682438)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 3月前


- 753
- 3

- 评论


[AI编程](https://juejin.cn/tag/AI%E7%BC%96%E7%A8%8B "AI编程") [人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD "人工智能") [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源")

![一天一个开源项目（第5篇）：最近火爆硅谷的ClaudBot，真不是什么不得了的事](https://p3-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/b0c67901881942e9bdcff0e49a89271f~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674581&x-signature=XUjRMZ6sIldTPxJ0Q6bfipZSWo8%3D)

[一天一个开源项目（第24篇）：OpenClawInstaller - 一键部署私人 AI 助手 OpenClaw](https://juejin.cn/post/7606594349582123034 "一天一个开源项目（第24篇）：OpenClawInstaller - 一键部署私人 AI 助手 OpenClaw")

[一天一个开源项目（第24篇）：OpenClawInstaller - 一键部署私人 AI 助手 OpenClaw](https://juejin.cn/post/7606594349582123034)

- [冬奇Lab](https://juejin.cn/user/1857501105781193)

- 3月前


- 957
- 2

- 评论


[人工智能](https://juejin.cn/tag/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD "人工智能") [开源](https://juejin.cn/tag/%E5%BC%80%E6%BA%90 "开源") [资讯](https://juejin.cn/tag/%E8%B5%84%E8%AE%AF "资讯")

![一天一个开源项目（第24篇）：OpenClawInstaller - 一键部署私人 AI 助手 OpenClaw](https://p3-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/e1a43a70db744c878b7c7fdd5bc3fb77~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5Yas5aWHTGFi:q75.awebp?rk3s=f64ab15b&x-expires=1779674581&x-signature=mxHjTqYkHXI8ph8GaSxYonn%2BeDU%3D)

收藏成功！

已添加到「」， 点击更改

- 微信
![](https://juejin.cn/post/7640026964774207498)微信扫码分享

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

![](https://lf-web-assets.juejin.cn/obj/juejin-web/xitu_juejin_web/8867e249c23a7c0ea596c139befc04d7.svg)

温馨提示

当前操作失败，如有疑问，可点击申诉

前往申诉我知道了

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


确定屏蔽该用户

屏蔽后，对方将不能关注你、与你产生任何互动，无法查看你的主页


沉浸阅读