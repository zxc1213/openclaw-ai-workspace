# GLM Coding 开发者社区 — 编程工具技巧 板块学习笔记

> 学习来源：智谱 GLM Coding 开发者社区 → 编程工具技巧
> 知识库根地址：https://zhipu-ai.feishu.cn/wiki/Ch2HwSnCdiQUCUkiuxecLtJLnkf
> 学习日期：2026-04-05
> 学习者：念念 🌙（research subagent）

> **说明**：飞书知识库文章需登录才能访问，以下笔记基于原始公开来源抓取整理。
> 标注 ❌ 的文章为飞书独家内容，未能抓取到公开版本，需要用户手动从飞书访问。

---

## 一、skill-creator 迎来重要更新：让 Agent Skills 也能测试、评测与持续迭代

**来源**：❌ 飞书知识库独家（未找到公开转载）
**飞书可能的 URL**：https://zhipu-ai.feishu.cn/wiki/ 下的编程工具技巧文件夹内

### 核心要点
- 需要从飞书知识库直接访问获取完整内容
- 推测内容涉及 OpenClaw skill-creator 的测试与评测机制
- OpenClaw 官方 SKILL.md 中有完整的 skill-creator 规范（见下方补充笔记）

### 补充笔记：基于 OpenClaw 内置 skill-creator 规范

OpenClaw 的 skill-creator 技能已包含完整的 Skills 生命周期管理：

**Skill 三级渐进式加载**：
1. **Metadata**（name + description）— 始终在上下文中，~100 词
2. **SKILL.md body** — 触发时加载，<5k 词
3. **Bundled resources**（scripts/references/assets）— 按需加载

**Skill 创建流程（6 步）**：
1. 用具体示例理解 Skill 需求
2. 规划可复用内容（scripts/references/assets）
3. 初始化（`init_skill.py`）
4. 编辑 Skill（实现资源 + 写 SKILL.md）
5. 打包（`package_skill.py`，含自动验证）
6. 基于实际使用迭代

**Skill 设计三原则**：
- **简洁为王**：上下文窗口是公共资源，只加模型不知道的信息
- **适度自由度**：脆弱操作给窄桥（低自由度），开放任务给草原（高自由度）
- **渐进式披露**：SKILL.md <500 行，详细内容放 references/

**打包与验证**：
- `package_skill.py` 自动验证 YAML frontmatter、命名规范、描述质量、目录结构
- 安全限制：拒绝符号链接
- 输出 `.skill` 文件（本质是 zip）

### 对 OpenClaw 的借鉴价值
- ⭐⭐⭐ OpenClaw 已内置 skill-creator 技能，可直接使用
- Skill 的打包、验证、分发机制是 OpenClaw 的核心差异化能力
- 三级加载设计是上下文管理的关键模式

---

## 二、Claude Agentic 组件选择指南与 Research Agent 示例

**来源**：❌ 飞书知识库独家（未找到公开转载）

### 核心要点
- 标题表明此文章涉及 Agentic 组件的选择策略
- 包含 Research Agent 的具体示例
- 推测与 OpenClaw 的 subagent 系统有密切关联

### 详细笔记
无法获取完整内容。根据标题和之前学习过的「Agentic 生态五层模型」，推测内容涵盖：
- 何时使用 Prompts vs Skills vs Projects vs Subagents vs MCP
- Research Agent 的典型架构：搜索→抓取→分析→总结
- 组件组合的最佳实践

### 对 OpenClaw 的借鉴价值
- ⭐⭐ 待补充 — 需要从飞书知识库手动访问
- OpenClaw 的 subagent 系统天然适合构建 Research Agent

---

## 三、让 AI 真正懂仓库：如何用 CLAUDE.md 将 Claude Code 的工作效率发挥到极致

**来源**：❌ 飞书知识库独家（未找到公开转载）

### 核心要点
- 聚焦 CLAUDE.md 配置文件的深度使用
- 让 AI 真正理解代码仓库的结构、规范和工作流
- 提升工作效率的关键在于项目上下文工程

### 补充笔记：基于 Claude Code 16 个技巧中的 CLAUDE.md 部分

**CLAUDE.md 三种记忆位置**：

| 类型 | 文件位置 | 用途 |
|------|----------|------|
| 项目记忆（共享） | `./CLAUDE.md` | 团队共享指令，项目架构、编码规范 |
| 用户记忆（全局） | `~/.claude/CLAUDE.md` | 个人偏好，代码风格、快捷方式 |
| 项目记忆（本地） | `./CLAUDE.local.md` | 个人项目偏好（已废弃） |

**CLAUDE.md 可包含的内容**：
- 常用 bash 命令
- 核心文件和工具函数
- 代码风格指南
- 测试说明
- 代码库规范
- 开发环境设置

**OpenClaw 等价物**：AGENTS.md / SOUL.md / TOOLS.md / MEMORY.md

### 对 OpenClaw 的借鉴价值
- ⭐⭐⭐ OpenClaw 的 workspace 文件体系（AGENTS.md + SOUL.md + TOOLS.md + USER.md）本质上就是 CLAUDE.md 的多文件扩展
- 可以参考 CLAUDE.md 的最佳实践来优化 OpenClaw workspace 文件
- 递归读取 CLAUDE.md 的设计值得借鉴（从当前目录到根目录）

---

## 四、转载｜Claude Code 这样装，小白 5 分钟就能上手 AI 编程 ｜ CC 保姆级教程

**来源**：https://www.javastack.cn/claude-code-install-use/ （R 哥 / AI技术宅）
**飞书知识库**：转载版

### 核心要点
1. **安装极简**：`npm install -g @anthropic-ai/claude-code`，依赖 Node.js 18+
2. **登录灵活**：Claude 订阅账户（Pro $20/月，Max $100/月）或 Anthropic Console API
3. **IDE 集成无缝**：VS Code、JetBrains 原生支持，终端输入 `claude` 自动安装插件
4. **开发体验震撼**：能理解代码库、执行命令、自动化管理 Git，比 Cursor 更强
5. **首次使用建议**：先用 `/init` 生成 CLAUDE.md，再问项目相关问题

### 详细笔记

**安装步骤**：
```bash
# 1. 安装 Node.js 18+
# 2. 安装 Claude Code
sudo npm install -g @anthropic-ai/claude-code
# 3. 检查
claude --version
# 4. 进入项目目录
cd /path/to/project
claude
```

**首次配置**：
- 选择主题（可通过 `/config` 调整）
- 选择登录方式（推荐 Claude 订阅账户）
- Windows 需要 WSL

**IDE 集成方式**：
- VS Code / Cursor / Windsurf：终端输入 `claude`，插件自动安装
- JetBrains（IntelliJ/PyCharm/WebStorm）：终端输入 `claude` 或从插件市场安装
- 快捷键 `Command + ESC` 快速打开 Claude 面板
- 外部终端可通过 `/ide` 命令连接 IDE

**终端优化**：
- 换行：输入 `\` + 回车，或配置 Option+Enter
- 通知：`claude config set --global preferredNotifChannel terminal_bell`
- Vim 模式：`/vim` 启用
- 处理大量输入：避免直接粘贴，用基于文件的工作流

**常用命令表**：

| 命令 | 功能 |
|------|------|
| `claude` | 启动交互模式 |
| `claude "任务"` | 执行一次性任务 |
| `claude -p "查询"` | 执行一次命令后退出 |
| `claude -c` | 继续上次对话 |
| `claude -r` | 选择历史对话继续 |
| `claude commit` | 创建 Git 提交 |
| `/init` | 生成 CLAUDE.md |
| `/clear` | 清除对话历史 |
| `/config` | 调整配置 |

### 对 OpenClaw 的借鉴价值
- ⭐ OpenClaw 的安装和使用比 Claude Code 更复杂，但功能更全面
- Claude Code 的 IDE 集成思路值得参考（OpenClaw 已通过 VS Code 扩展实现）
- `/init` 初始化项目配置的模式，OpenClaw 也类似（AGENTS.md 等 workspace 文件）
- Claude Code 的终端体验设计（换行、通知、Vim）可以借鉴到 OpenClaw CLI

---

## 五、转载｜不会写 Claude Skills？这里有 170 个 Skills 可以直接抄！

**来源**：❌ 飞书知识库独家（未找到公开转载的 "170个" 版本）

### 核心要点
- 提供大量现成的 Skills 供开发者直接使用或学习
- 降低 Skill 编写门槛
- 涵盖多种场景和用途

### 补充笔记：基于搜索发现的 OpenClaw Skills 生态

**Awesome OpenClaw Skills 仓库**：
- GitHub 上有 5,400+ Skills（截至 2026 年初）
- 覆盖 Google Ads、学术论文检索、文档处理、代码审查等各种场景
- 推荐资源：
  - https://openclawskills.net/ — 社区策展的 Skills 目录
  - https://theguidex.com/best-openclaw-skills/ — 2026 最佳 20 个 Skills
  - PinchBench（https://github.com/pinchbench/skill）— Skills 评测基准系统（Kilo Code 团队开发）

**安装 Skills 的标准流程**：
```bash
# 安装
openclaw skills install <skill-name>
# 沙箱测试
openclaw run --sandbox
# 限制工具权限
openclaw skills install --allow-tools ...
```

### 对 OpenClaw 的借鉴价值
- ⭐⭐⭐ OpenClaw 的 Skills 生态已经非常成熟
- 可以定期浏览 awesome 列表获取灵感
- PinchBench 评测系统可用于评估自定义 Skill 质量
- 已有 170+ 现成 Skills 可作为模板

---

## 六、转载｜玩转 Claude Code 的 23 个实用小技巧，效率拉满！！

**来源**：https://segmentfault.com/a/1190000046912486 （R 哥 / AI技术宅）
**原始来源**：微信公众号「AI技术宅」
**飞书知识库**：转载版

### 核心要点
1. **Bash 模式**：命令前加 `!` 直接执行，不消耗 Token
2. **自动接受编辑**：`Shift + Tab` 切换，安全级别高于免授权模式
3. **计划模式**：先规划再执行，适合项目前期功能规划
4. **MCP 提效**：通过 MCP 协议扩展 Claude Code 能力
5. **Context7**：免费 MCP 工具，提供 2w+ 库的最新文档

### 详细笔记

**技巧 17：Bash 模式**
```bash
! ls -la    # 直接执行，不经大模型思考，快且省钱
```

**技巧 18：自动接受编辑**
- `Shift + Tab` 切换自动接受编辑（auto-accept edits on）
- 安全性高于 `--dangerously-skip-permissions`
- 仅限文件编辑权限的自动审批

**技巧 19：计划模式**
- `Shift + Tab` 循环切换：一般模式 → 自动接受编辑 → 计划模式
- 计划模式下 Claude Code 只给方案不执行
- 选择 "Yes, and auto-accept edits" 可直接执行计划

**技巧 20：MCP 提效**

添加 MCP 服务器：
```bash
# 基本语法
claude mcp add <name> <command> [args...]

# JSON 方式
claude mcp add-json <name> '<json>'

# 全局安装（-s user）
claude mcp add-json -s user context7 '{
  "command": "npx",
  "args": ["-y", "@upstash/context7-mcp"]
}'

# 管理
claude mcp list
claude mcp get <name>
claude mcp remove <name>
```

**Context7 推荐**：
- 免费为 Claude Code 提供最新版本文档
- 支持 2w+ 库，可手动添加自己的库
- 避免使用过时数据

**技巧 21：使用之前的消息**
- 连续按两次 ESC 跳到之前消息
- 上下方向键选择 → 回到命令行 → 可重新编辑

**技巧 22：回滚代码**
- 直接发送「回滚」即可
- 类似 Cursor 的 checkpoint 功能
- 再发送「撤销」可恢复
- 建议配合 Git 版本控制

**技巧 23：版本升级**
```bash
sudo npm install -g @anthropic-ai/claude-code
claude --version
```

### 对 OpenClaw 的借鉴价值
- ⭐⭐⭐
- **Bash 模式**：OpenClaw 的 exec 工具天然支持，无需特殊语法
- **自动接受编辑**：OpenClaw 有 `/approve` 安全机制，比 Claude Code 更灵活
- **计划模式**：OpenClaw 的 subagent 可以实现类似效果
- **MCP 集成**：OpenClaw 原生支持 MCP（plugins.entries）
- **Context7 思路**：值得参考 — 为 Agent 提供实时文档查询能力

---

## 七、转载｜榨干 Claude Code 的 16 个实用小技巧（高端玩法，建议收藏！）

**来源**：https://www.cnblogs.com/javastack/p/18978280 （R 哥 / AI技术宅）
**飞书知识库**：转载版

### 核心要点
1. **需求具体化**：把笼统指令变成精确描述（"修复登录时空指针错误" vs "修复这个漏洞"）
2. **复杂任务分步**：大需求拆小步骤，每步完成后 review 再继续
3. **先理解再开动**：修改代码前先让 AI 理解项目结构和业务逻辑
4. **免授权模式**：`--dangerously-skip-permissions` 提升无人值守效率
5. **记忆管理**：CLAUDE.md 三级记忆体系（项目/用户/本地）

### 详细笔记

**技巧 1-3：需求工程**
- 把需求说具体：不说"修复漏洞"，说"修复用户登录时不输入密码出现的空指针错误"
- 复杂需求分步：小任务一次性，大任务拆步骤
- 先理解代码：让 AI 分析数据库表结构、错误处理方式等

**技巧 4：快捷键**
- `/` 查看斜杠命令
- 上下方向键查看命令历史
- Tab 补全
- Option+Enter 换行
- Ctrl+C 退出

**技巧 5：免授权模式**
```bash
claude --dangerously-skip-permissions
# 推荐 alias
alias claude='claude --dangerously-skip-permissions'
```
⚠️ 安全风险：所有操作无需授权

**技巧 6：深度思考**
- "think" < "think hard" < "think harder" < "ultrathink"
- 越高级别消耗越多 token（ultrathink 最贵）
- 1+1=ultrathink 耗费约 $0.06

**技巧 7：打断工作**
- 按 ESC 键打断正在执行的任务

**技巧 8：发送图片**
- Mac 中用 `Ctrl+V` 粘贴（非 Cmd+V）
- 可发送设计稿、错误截图等让 AI 分析

**技巧 9：恢复历史会话**
- 非交互：`claude -c`（继续上次）/ `claude -r`（选择历史）
- 交互中：`/resume` 命令

**技巧 10：记忆管理（CLAUDE.md）**

| 类型 | 文件 | 用途 |
|------|------|------|
| 项目（共享） | `./CLAUDE.md` | 架构、规范、流程 |
| 用户（全局） | `~/.claude/CLAUDE.md` | 代码风格、快捷方式 |
| 项目（本地） | `./CLAUDE.local.md` | 个人偏好（已废弃） |

- Claude Code 启动时递归加载 CLAUDE.md（当前目录到根目录）
- `/memory` 命令编辑记忆文件

**技巧 11：Git 交互**
- 自然语言操作 Git
- "修改了哪些文件"、"用合理描述提交"、"推送本分支"、"创建新分支"

**技巧 12：Linux 交互**
- 当智能 Linux 助手用
- 交互模式 / 非交互模式（`claude -p "列出行数最多的前3个.java文件"`）

**技巧 13：模型切换**
- `/model` 命令切换 Sonnet 4 / Opus
- 推荐 Sonnet 4（成本仅 Opus 1/5）

**技巧 14：查看消耗**
- `/cost` 查看当前会话
- 推荐 ccusage 工具：`ccusage -s 20250701` / `ccusage blocks --live`

**技巧 15：上下文压缩**
- `/compact` 手动压缩（保留摘要）
- 默认 95% 容量自动压缩
- 建议：定期 compact + 定时 clear + 分解复杂任务

**技巧 16：自定义快捷命令**
```bash
# 项目级命令
mkdir -p .claude/commands
echo "分析这个项目的性能..." > .claude/commands/optimize.md
# 使用：/project:optimize

# 用户级命令
mkdir -p ~/.claude/commands
echo "提交所有变更并推送" > ~/.claude/commands/push.md
# 使用：/user:push

# 命令语法
/<prefix>:<command-name> [arguments]
# 支持 $ARGUMENTS 占位符
```

### 对 OpenClaw 的借鉴价值
- ⭐⭐⭐
- **需求工程原则**完全通用 — OpenClaw 同样受益于具体、分步的需求描述
- **记忆管理**：OpenClaw 的 AGENTS.md + SOUL.md + TOOLS.md + MEMORY.md 是更精细的多文件记忆体系
- **上下文压缩**：OpenClaw 有 `sessions_yield` 和 subagent 压缩机制
- **自定义命令**：OpenClaw Skills 本身就是更强的"自定义命令"系统
- **成本追踪**：OpenClaw 有内置的 token/cost 追踪

---

## 八、Kilo Code 相关文章

**来源**：https://kilo.ai/docs/ + 飞书知识库转载
**官方站点**：https://kilo.ai/
**GitHub**：https://github.com/Kilo-Org/kilocode

### 核心要点
1. **全平台覆盖**：VS Code、JetBrains、CLI、Cloud Agent、移动端（iOS/Android）、Slack
2. **多 Agent 架构**：Code、Ask、Plan、Debug 等专用 Agent
3. **开源免费**：最受欢迎的开源 coding agent
4. **Kilo Gateway**：统一 API 访问 500+ AI 模型，支持 BYOK 和用量追踪
5. **Autocomplete**：行内代码补全，类似 GitHub Copilot

### 详细笔记

**平台支持**：
- VS Code 扩展（最热门）
- JetBrains 全系列（IntelliJ/PyCharm/WebStorm）
- CLI 终端（`npm install -g @kilocode/cli`）
- Cloud Agent（云端运行）
- 移动端 iOS/Android
- Slack 集成
- App Builder（全栈应用创建）

**Agent 类型**：
- Chat Interface — 对话式编码
- Code Agent — 代码编写
- Ask Agent — 代码问答
- Plan Agent — 功能规划
- Debug Agent — 调试

**核心功能**：
- Autocomplete — 行内代码建议
- Fast Edits — 快速文件修改
- Code Actions — AI 驱动的重构和修复
- Task & Todo Lists — 任务分解
- Checkpoints — 保存/恢复工作状态
- Browser Use — 浏览器自动化
- Enhance Prompt — 自动改进提示词
- Git Commit Generation — AI 生成提交信息
- Context Mentions — 引用文件、函数、符号

**安装方式**：
```bash
# VS Code
code --install-extension kilocode.Kilo-Code

# CLI
npm install -g @kilocode/cli

# 也支持 Open VSX Registry（VSCodium 等）
```

**与 Claude Code 的对比**：
| 维度 | Claude Code | Kilo Code |
|------|-------------|-----------|
| IDE 集成 | VS Code + JetBrains | VS Code + JetBrains + 更多 |
| 移动端 | ❌ | ✅ iOS/Android |
| 云端 | ❌ | ✅ Cloud Agent |
| 模型 | 仅 Claude | 500+ 模型 |
| 开源 | ❌ | ✅ |
| 行内补全 | ❌ | ✅ Autocomplete |
| Slack | ❌ | ✅ |

### 对 OpenClaw 的借鉴价值
- ⭐⭐
- Kilo Code 的多 Agent 架构值得参考（Code/Ask/Plan/Debug 分工）
- Autocomplete 功能是终端类工具普遍缺少的
- 移动端 + Slack 集成覆盖了 OpenClaw 已有的通道能力
- Kilo Gateway 的多模型统一 API 思路与 OpenClaw 的 provider 系统类似
- PinchBench 评测系统（Kilo Code 团队开发）可用于评估 Skills

---

## 九、OpenCode 相关文章

**来源**：https://opencode.ai/ + https://opencode.ai/docs/
**GitHub**：https://github.com/anomalyco/opencode

### 核心要点
1. **开源且隐私优先**：120K+ GitHub Stars，5M+ 月活开发者，不存储代码
2. **多平台**：终端 TUI、桌面应用、IDE 扩展
3. **多 Provider 支持**：75+ LLM 提供商，包括 Claude、GPT、Gemini、本地模型
4. **内置 LSP**：自动为 LLM 加载正确的 Language Server Protocol
5. **多会话并行**：同一项目可启动多个 Agent 并行工作

### 详细笔记

**安装**：
```bash
# 推荐
curl -fsSL https://opencode.ai/install | bash

# npm
npm install -g opencode-ai

# Homebrew
brew install anomalyco/tap/opencode

# Docker
docker run -it --rm ghcr.io/anomalyco/opencode
```

**初始化与使用**：
```bash
cd /path/to/project
opencode
/init    # 分析项目，创建 AGENTS.md
```

**核心命令**：
| 命令 | 功能 |
|------|------|
| `/init` | 初始化项目（生成 AGENTS.md） |
| `/connect` | 连接 AI 提供商 |
| Tab | 切换 Plan/Build 模式 |
| `/undo` | 撤销上一次更改 |
| `/redo` | 重做更改 |
| `/share` | 分享对话链接 |

**特色功能**：
- **Plan 模式**：Tab 切换，只给方案不改代码
- **LSP 集成**：自动加载项目所需的 Language Server
- **多会话并行**：同一项目同时运行多个 Agent
- **分享链接**：对话可生成分享链接
- **OpenCode Zen**：经过测试验证的模型推荐服务
- **图片输入**：拖拽图片到终端即可让 AI 分析
- **@符号引用**：如 `@packages/functions/src/api/index.ts`

**隐私特性**：
- 不存储代码或上下文数据
- 适合隐私敏感环境
- 可使用本地模型

**与 Claude Code 对比**：
| 维度 | Claude Code | OpenCode |
|------|-------------|----------|
| 开源 | ❌ | ✅ |
| 模型 | 仅 Claude | 75+ 提供商 |
| 隐私 | 代码发送 Anthropic | 可本地运行 |
| LSP | ❌ | ✅ 内置 |
| 多会话 | ❌ | ✅ |
| 分享 | ❌ | ✅ |
| 桌面应用 | ❌ | ✅ |

### 对 OpenClaw 的借鉴价值
- ⭐⭐
- **AGENTS.md**：OpenCode 也使用 AGENTS.md 作为项目配置文件，与 OpenClaw 一致
- **Plan/Build 模式切换**：与 OpenClaw 的 subagent 模式类似
- **多会话并行**：OpenClaw 通过 subagent 系统天然支持
- **LSP 集成**：OpenClaw 可考虑集成 LSP 提升代码理解能力
- **隐私优先定位**：OpenClaw 本地运行的架构天然具备隐私优势
- **分享对话**：OpenClaw 可考虑增加对话分享功能

---

## 十、本板块总结

### 核心知识脉络

编程工具技巧板块围绕 **Coding Agent 的实操使用** 展开，形成以下知识体系：

```
编程工具技巧
├── 📦 工具选型
│   ├── Claude Code（Anthropic 官方，能力最强）
│   ├── Kilo Code（开源全平台，500+ 模型）
│   └── OpenCode（开源隐私优先，多会话并行）
│
├── 🛠 使用技巧
│   ├── 需求工程（具体化、分步、先理解再开动）
│   ├── 效率提升（快捷键、免授权、Bash 模式、自动接受编辑）
│   ├── 上下文管理（记忆文件、压缩、会话管理）
│   ├── MCP 扩展（Context7、Puppeteer 等）
│   └── 高级功能（计划模式、回滚、自定义命令）
│
├── 📋 项目配置
│   ├── CLAUDE.md / AGENTS.md（项目上下文）
│   ├── 自定义命令（项目级 + 用户级）
│   └── 编码规范与工作流沉淀
│
├── 🔧 Skills 生态
│   ├── Skill 创建（SKILL.md + 资源文件）
│   ├── Skill 测试与评测（PinchBench）
│   ├── Skill 分发（.skill 打包）
│   └── 现成 Skills 仓库（5400+）
│
└── 🧩 Agentic 组件
    ├── 组件选择指南（何时用什么）
    ├── Research Agent 示例
    └── 多 Agent 协作模式
```

### 对 OpenClaw 的整体借鉴价值

| 领域 | Claude Code 做法 | OpenClaw 现状 | 改进建议 |
|------|-----------------|---------------|---------|
| 项目配置 | CLAUDE.md 单文件 | AGENTS.md + SOUL.md + TOOLS.md + USER.md | ✅ 已更精细 |
| 记忆管理 | 3 级（项目/用户/本地） | MEMORY.md + memory_search | 可增加 workspace 级配置递归 |
| 上下文压缩 | `/compact` + 自动 | sessions_yield + subagent | 考虑增加手动压缩命令 |
| MCP 扩展 | claude mcp add | plugins.entries | ✅ 已支持 |
| 自定义命令 | `.claude/commands/` | Skills 系统 | ✅ Skills 更强大 |
| 多模型 | 仅 Claude | 多 provider | ✅ 已支持 |
| IDE 集成 | VS Code + JetBrains | 通道系统 | VS Code 扩展可加强 |
| 行内补全 | ❌ | ❌ | 可考虑开发 |
| 计划模式 | Shift+Tab 切换 | subagent | 可增加 Plan-only 模式 |
| 浏览器自动化 | Puppeteer MCP | browser 工具 | ✅ 已支持 |

### 关键洞察

1. **需求工程是通用核心**：不论用什么工具，"把需求说具体、大任务拆小步、先理解再动手"这三条永远是提升 AI 编程效率的黄金法则

2. **上下文管理决定上限**：CLAUDE.md / AGENTS.md / 记忆文件的质量直接决定 Agent 的表现。OpenClaw 的多文件 workspace 体系是最灵活的

3. **MCP 是扩展能力的关键协议**：通过 MCP 连接外部工具（文档查询、浏览器自动化等），让 Agent 的能力边界大幅扩展

4. **Skills 生态的成熟度很重要**：Claude Code 的 Skills（170-5400+）和 OpenClaw 的 Skills 系统都是核心差异化能力。能复用就复用，能评测就评测

5. **开源 vs 闭源各有利弊**：Claude Code 能力最强但闭源；Kilo Code / OpenCode 开源灵活但需要自行配置模型。OpenClaw 走的是「开源框架 + 多模型 + 通道集成」的中间路线

---

> **下一步建议**：
> 1. 从飞书知识库手动访问 ❌ 标注的 5 篇独家文章，补充缺失笔记
> 2. 实践：优化 OpenClaw workspace 文件，参考 CLAUDE.md 最佳实践
> 3. 实践：配置 Context7 MCP，为 Agent 提供实时文档查询能力
> 4. 评估：用 PinchBench 评测现有自定义 Skills 的质量
