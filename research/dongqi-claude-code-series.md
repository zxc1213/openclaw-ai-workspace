# 冬奇Lab 开源项目调研 - Claude Code & OpenClaw 系列

> 调研时间：2026-04-05 | 来源：冬奇Lab 掘金专栏「一天一个开源项目」| 共 13 篇

---

## 一、Claude Code 直接相关（8篇）

### 1. AI-Researcher ⭐⭐⭐⭐
- **GitHub**: https://github.com/HKUDS/AI-Researcher
- **Stars**: 15k+ | **License**: Apache-2.0
- **核心功能**: 端到端科研自动化——从生成研究方向、Docker 隔离执行实验代码、到生成 LaTeX 学术论文
- **技术亮点**: 多 Agent 协作（Idea/Engineering/Validator/Writer Agent），闭环反馈自我纠错，基于 LiteLLM 支持多模型，NeurIPS 2025 Spotlight
- **适用场景**: 快速验证科研想法、自动文献综述、算法原型开发、辅助论文草稿
- **安装难度**: 中等（需 Docker + Python + API Key）
- **评价**: 学术场景极强，但 Ray 的日常开发不涉及科研论文撰写，实用性有限

### 2. lark-cli ⭐⭐⭐⭐⭐
- **GitHub**: https://github.com/larksuite/cli
- **Stars**: 6k+ | **License**: MIT
- **核心功能**: 飞书官方 CLI，11个业务域 200+ 命令，19个 Agent Skills，三层指令体系
- **技术亮点**: Agent-Native 设计，`--as user/bot` 身份切换，OAuth 登录，dry-run 安全机制，`npx skills add` 安装
- **适用场景**: Claude Code/OpenClaw 操作飞书日历/IM/文档/表格/邮件/任务的统一入口
- **安装难度**: 低（`npm install -g @larksuite/cli`）
- **评价**: **对 Ray 极高价值**——Ray 已有大量 lark-* skills，lark-cli 是其上游来源，且已安装使用

### 3. Claude Code Telegram Bot ⭐⭐⭐⭐
- **GitHub**: https://github.com/RichardAtCT/claude-code-telegram
- **Stars**: 1.8k | **License**: MIT
- **核心功能**: 通过 Telegram 远程访问 Claude Code，Agentic 模式（纯对话）+ Classic 模式（13条命令），会话按项目持久化
- **技术亮点**: Webhook 接收 GitHub 事件，Cron 定时任务，白名单+目录沙箱+限流+审计
- **适用场景**: 手机/平板远程改代码，团队共享 Claude Code 服务器，PR 自动总结
- **安装难度**: 中等（需 Python + Claude Code + Telegram Bot Token）
- **评价**: **Ray 已有 OpenClaw 多渠道能力**，功能重叠，但专注 Claude Code 远程访问是差异点

### 4. Claude HUD ⭐⭐⭐⭐
- **GitHub**: https://github.com/jarrodwatts/claude-hud
- **Stars**: 3.7k+ | **License**: MIT
- **核心功能**: Claude Code 实时状态栏插件，显示上下文健康度、工具活动、Agent 状态、Todo 进度、Git 状态、用量
- **技术亮点**: 基于 statusline API（真实 token 数据），~300ms 刷新，3种预设（Full/Essential/Minimal）
- **适用场景**: 日常 Claude Code 开发时监控会话状态，避免 context overflow
- **安装难度**: 低（`/plugin marketplace` 安装）
- **评价**: **强烈推荐安装**——Claude Code 重度用户的必备插件，提升使用体验

### 5. MyCodeAgent ⭐⭐⭐
- **GitHub**: https://github.com/YYHDBL/MyCodeAgent
- **Stars**: 105 | **License**: MIT
- **核心功能**: 面向学习的 Claude Code 风格代码代理框架，统一工具协议、上下文工程、Skills/Task 子代理、AgentTeams
- **技术亮点**: Function Calling 驱动（非文本解析），MCP 扩展，JSONL+HTML 双轨 Trace，支持智谱等国产模型
- **适用场景**: 学习 Agent 工具协议、上下文工程、子代理协作的实验平台
- **安装难度**: 低（Python 3.8+）
- **评价**: 学习价值高但 Ray 已有 OpenClaw 实战经验，作为参考代码库有价值，不必日常使用

### 6. Claude-Mem ⭐⭐⭐⭐
- **GitHub**: https://github.com/thedotmack/claude-mem
- **Stars**: 27.7k+ | **License**: AGPL-3.0
- **核心功能**: Claude Code 跨会话持久记忆系统，自动捕获→AI 压缩摘要→SQLite+Chroma 存储→按需注入
- **技术亮点**: 5个生命周期钩子，渐进式披露（~10倍 token 节省），三层搜索（search→timeline→get_observations）
- **适用场景**: 让 Claude Code 记住跨会话项目上下文、约定、已修复的 Bug
- **安装难度**: 中等（插件安装 + Worker 服务）
- **评价**: **高价值**——解决 Claude Code 跨会话失忆的核心痛点，OpenClaw 已有 memory_flush 机制但实现方式不同

### 7. SuperClaude Framework ⭐⭐⭐
- **GitHub**: https://github.com/SuperClaude-Org/SuperClaude_Framework
- **Stars**: 20.5k+ | **License**: 未注明
- **核心功能**: Claude Code 配置增强框架，30个专业命令 + 16个智能 Agent + 7种行为模式 + 8个 MCP 服务器
- **技术亮点**: 认知角色模式（Architect/Developer/Researcher 等），系统化开发方法论
- **适用场景**: 提升 Claude Code 专业开发能力，系统化 AI 辅助开发流程
- **安装难度**: 低（配置框架）
- **评价**: Stars 很高但偏向「配置堆砌」风格，Ray 的 SOUL.md/AGENTS.md 已有自己的 agent 角色体系，参考价值 > 直接使用

### 8. everything-claude-code ⭐⭐⭐
- **GitHub**: https://github.com/affaan-m/everything-claude-code
- **Stars**: 22.7k+ | **License**: 未注明
- **核心功能**: Claude Code 完整配置集合——agents、skills、hooks、commands、rules、MCPs
- **技术亮点**: Anthropic 黑客马拉松获奖者实战验证，zenith.chat 生产级应用背书
- **适用场景**: 快速获得一套经过验证的 Claude Code 配置
- **安装难度**: 低（即插即用）
- **评价**: **适合作为灵感参考**——Ray 已有成熟的 AGENTS.md/SOUL.md/Skills 体系，但可以从中挑选有价值的 rules 和 hooks

---

## 二、OpenClaw 生态（4篇）

### 9. awesome-openclaw-usecases ⭐⭐⭐
- **GitHub**: https://github.com/hesamsheikh/awesome-openclaw-usecases
- **Stars**: 5.4k+ | **License**: MIT
- **核心功能**: 社区维护的 29+ OpenClaw 真实用例集合，涵盖社交媒体/生产力/DevOps/研究学习/创意构建
- **技术亮点**: 每个用例都经过真实验证（至少使用一天），包含详细实现步骤
- **适用场景**: 发现 OpenClaw 新玩法，学习自动化工作流设计
- **安装难度**: 无需安装，参考文档
- **评价**: **值得浏览**——Ray 可能从中发现新的使用场景，但大多数场景 Ray 已在实践

### 10. OpenClawInstaller ⭐⭐
- **GitHub**: https://github.com/miaoxworld/OpenClawInstaller
- **Stars**: 1.7k+ | **License**: MIT
- **核心功能**: OpenClaw 一键部署脚本 + 交互式配置菜单，支持多模型多渠道
- **技术亮点**: 自动环境检测、API 测试、后台服务启动，搭配 OpenClaw Manager 桌面端
- **适用场景**: 首次安装 OpenClaw 的新手
- **安装难度**: 极低（一条 curl 命令）
- **评价**: **Ray 不需要**——已是 OpenClaw 重度用户，部署早已完成

### 11. Clawra ⭐⭐⭐
- **GitHub**: https://github.com/SumeLabs/clawra
- **Stars**: 1.4k+ | **License**: MIT
- **核心功能**: OpenClaw Skill，基于 fal.ai + xAI Grok Imagine 生成一致人设自拍，支持 Mirror/Direct 两种模式
- **技术亮点**: 固定参考图保持形象一致，`npx clawra@latest` 一键安装，SOUL.md 自动注入
- **适用场景**: 给 AI 助手增加「形象」和发图能力
- **安装难度**: 低（需 fal.ai API Key）
- **评价**: 有趣但非刚需——Ray 的「念念」人设已有 avatar 配置，如果想要动态生图可以考虑

### 12. ZeroClaw ⭐⭐⭐
- **GitHub**: https://github.com/zeroclaw-labs/zeroclaw
- **Stars**: 11.6k+ | **License**: MIT
- **核心功能**: 全 Rust 实现的 OpenClaw 替代品，单二进制 <5MB 内存 <10ms 启动，支持 OpenClaw 身份迁移
- **技术亮点**: Trait 驱动可插拔架构，Provider/Channel/Tool 抽象，Docker 沙箱，白名单+配对+隧道
- **适用场景**: 树莓派/低配 VPS 部署、边缘 AI、对内存和启动敏感的场景
- **安装难度**: 中等（Rust 工具链或一键脚本）
- **评价**: **值得持续关注**——Ray 在 WSL2 上运行资源充裕，暂无迁移需求，但项目架构设计值得学习

---

## 三、间接相关（1篇）

### 13. nanochat ⭐⭐⭐⭐
- **GitHub**: https://github.com/karpathy/nanochat
- **Stars**: 43k+ | **License**: MIT
- **核心功能**: Karpathy 的极简 LLM 训练套件——分词→预训练→微调→评估→推理→Web UI 聊天，全流程打通
- **技术亮点**: 「一个旋钮」`--depth` 自动推导计算最优超参，8×H100 约 3 小时约 72 美元训练 GPT-2 级模型
- **适用场景**: 端到端理解 LLM 训练、小模型研究、教学实验
- **安装难度**: 中高（需多 GPU 环境 + PyTorch）
- **评价**: **学习价值极高**——Karpathy 品质保证，但 Ray 目前无 GPU 集群，更适合作为阅读和学习材料

---

## 四、对 Ray 的实际价值分析

### Claude Code 维度

| 项目 | 价值 | 行动 |
|------|------|------|
| **lark-cli** | 🔴 已在使用 | Ray 的飞书 lark-* skills 上游来源，保持更新 |
| **Claude HUD** | 🟢 立即安装 | Claude Code 重度用户必备，`/plugin marketplace` 即装 |
| **Claude-Mem** | 🟡 值得评估 | 解决跨会话记忆痛点，但 AGPL-3.0 许可证需注意；OpenClaw 已有 memory_flush |
| **everything-claude-code** | 🟡 灵感参考 | 浏览其 rules/hooks，挑选有价值的配置融入现有体系 |
| **SuperClaude Framework** | 🟡 灵感参考 | 其认知角色模式值得参考，但 Ray 已有自己的 AGENTS.md 体系 |
| **Claude Code Telegram** | 🔴 已有替代 | OpenClaw 多渠道能力已覆盖 |
| **MyCodeAgent** | 🟢 学习材料 | Agent 工具协议和上下文工程的好参考代码 |
| **AI-Researcher** | 🔵 了解即可 | 学术场景工具，与日常开发关联度低 |

### OpenClaw 维度

| 项目 | 价值 | 行动 |
|------|------|------|
| **awesome-openclaw-usecases** | 🟡 值得浏览 | 可能发现新玩法，花 30 分钟过一遍 |
| **ZeroClaw** | 🟡 持续关注 | Rust 架构优秀，WSL2 上暂无迁移需求 |
| **Clawra** | 🔵 有趣非刚需 | 如果想给「念念」增加动态生图能力可以考虑 |
| **OpenClawInstaller** | 🔴 不需要 | 已是重度用户 |
| **nanochat** | 🟢 学习材料 | LLM 训练全流程理解，Karpathy 品质保证 |

---

## 五、决策建议

### 🚀 建议立即采用（优先级排序）

1. **Claude HUD** — 零成本高回报，一条命令安装，立刻提升 Claude Code 使用体验
2. **浏览 everything-claude-code 的 rules 和 hooks** — 花 20 分钟挑出有价值的配置
3. **浏览 awesome-openclaw-usecases** — 花 30 分钟看是否有新玩法

### 👀 值得观望/评估

4. **Claude-Mem** — 核心功能有价值，但需评估：(a) 与 OpenClaw memory_flush 的功能重叠；(b) AGPL-3.0 许可证是否影响使用
5. **ZeroClaw** — 架构设计优秀，关注其成熟度，未来如果需要轻量部署方案可考虑
6. **MyCodeAgent** — 作为 Agent 架构学习材料收藏

### ❌ 跟现有工具链重复，不必安装

7. **Claude Code Telegram Bot** — OpenClaw 多渠道已覆盖
8. **OpenClawInstaller** — 已部署完成
9. **SuperClaude Framework** — 已有 AGENTS.md/SOUL.md 体系
10. **Clawra** — 非刚需，已有 avatar

### 📚 了解即可，不必投入时间

11. **AI-Researcher** — 学术场景，与日常无关
12. **nanochat** — 无 GPU 环境，纯学习材料

---

*调研完成于 2026-04-05，由念念自动化完成*
