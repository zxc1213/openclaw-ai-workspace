# GLM Coding 开发者社区 · 新手修炼手册 学习笔记

> 学习时间：2026-04-05
> 知识库地址：https://zhipu-ai.feishu.cn/wiki/Ch2HwSnCdiQUCUkiuxecLtJLnkf
> 官方文档镜像：https://docs.bigmodel.cn/cn/coding-plan

---

## 一、GLM Coding Plan 介绍

**来源**：[套餐概览](https://docs.bigmodel.cn/cn/coding-plan/overview) | [使用须知](https://docs.bigmodel.cn/cn/coding-plan/usage-notes) | [常见问题](https://docs.bigmodel.cn/cn/coding-plan/faq)

### 核心要点

1. **GLM Coding Plan 是专为 AI 编码打造的订阅套餐**，通过 Anthropic 兼容 API 接入，支持 Claude Code、Cline、OpenCode、Kilo Code、Cursor、TRAE、Goose、OpenClaw 等主流编码工具
2. **可用模型**：GLM-5.1（Opus 级）、GLM-5-Turbo、GLM-5、GLM-4.7（Sonnet 级）、GLM-4.6、GLM-4.5、GLM-4.5-Air（Haiku 级）
3. **限额机制**：每 5 小时限额（动态刷新）+ 每周限额（7 天周期）。Lite 约 80/400 prompts、Pro 约 400/2000、Max 约 1600/8000
4. **专属 MCP 权益**：视觉理解 MCP（与模型共享 prompt 池）、联网搜索 MCP、网页读取 MCP、开源仓库 MCP（后三者有独立月度调用限额）
5. **OpenClaw 采用次级调度策略**：Coding Agent 任务享有资源抢占优先权，高负载下 OpenClaw 自动触发动态排队和限流

### 详细笔记

**应用场景**：自然语言编程、代码调试与修复、代码库问答、自动化任务处理（lint 修复、合并冲突、发行说明生成）

**模型选择策略**：
- 日常开发 → GLM-4.7（Sonnet 级，性价比最高）
- 复杂推理/大型工程 → GLM-5.1（Opus 级，高峰期 3 倍消耗，非高峰 2 倍消耗）
- 快速辅助 → GLM-4.5-Air（Haiku 级）
- **限时福利**（至 2026 年 4 月底）：GLM-5.1/GLM-5-Turbo 非高峰期仅 1 倍抵扣

**接入方式**：
- Claude Code：Base URL `https://open.bigmodel.cn/api/anthropic`，API Key 放入 `ANTHROPIC_AUTH_TOKEN`
- 其他工具：Base URL `https://open.bigmodel.cn/api/coding/paas/v4`
- Cherry Studio：`https://open.bigmodel.cn/api/coding/paas/v4/`

**套餐管理要点**：
- 自动续费，扣费顺序：赠金 → 现金 → 第三方支付
- 升级套餐需支付差额，立即生效
- 套餐额度耗尽后不消耗其他资源包/余额
- 不支持退款，取消续费需至少提前 3 天

### 对 OpenClaw 的借鉴价值

- OpenClaw 已被官方列为支持工具，但采用次级调度策略。在高峰期需要预期可能出现的限流
- Claude Code 和 OpenClaw 使用不同的 Base URL，OpenClaw 的配置需要注意区分
- 额度管理建议：复杂任务用 GLM-5.1，日常用 GLM-4.7，避免额度消耗过快

---

## 二、套餐变更指南

**来源**：[常见问题 - 套餐升级](https://docs.bigmodel.cn/cn/coding-plan/faq) | [使用须知 - 管理订阅](https://docs.bigmodel.cn/cn/coding-plan/usage-notes)

### 核心要点

1. **升级流程**：订阅管理 → "订阅升级" → 选择目标套餐 → 支付差额 → 立即生效
2. **升级不叠加时间**：会把之前套餐未使用时间作为剩余价值计入新套餐
3. **额度变更**：新套餐立即生效，原套餐余额按价值折算
4. **2 月 12 日前老用户**：续费价格和额度不变，且不受周限额限制

### 详细笔记

**管理路径**：
- 我的套餐：https://bigmodel.cn/usercenter/glm-coding/my-plan
- 用量统计：https://bigmodel.cn/usercenter/glm-coding/usage
- 费用明细：https://bigmodel.cn/finance/expensebill/list

**降级/取消**：
- 取消自动续费后，当前周期继续有效，到期后不再续费
- 不支持退款，已购买的套餐费用不退回
- 套餐过期后，Claude Code 中暂不支持使用资源包；其他工具需将 Base URL 改为 `https://open.bigmodel.cn/api/paas/v4` 才能用资源包

### 对 OpenClaw 的借鉴价值

- 关注套餐变更时 OpenClaw 的 Base URL 是否需要调整
- 老用户的周限额豁免是重要的成本优势
- 额度耗尽后的优雅降级策略值得参考

---

## 三、GLM 编码模型：从入门到精通的 AI 编程指南

**来源**：[快速开始](https://docs.bigmodel.cn/cn/coding-plan/quick-start) | [接入 GLM-5.1](https://docs.bigmodel.cn/cn/coding-plan/using5-1)

### 核心要点

1. **快速上手三步走**：注册账号 → 订阅套餐 → 配置编码工具（5 分钟内完成）
2. **Claude Code 配置是最佳参考**：Anthropic 兼容 API 的配置模式可作为所有工具的配置模板
3. **一键配置助手**：`npx @z_ai/coding-helper` 可自动完成工具安装、套餐配置、MCP 服务器管理
4. **环境变量配置是核心**：`ANTHROPIC_AUTH_TOKEN`、`ANTHROPIC_BASE_URL`、`API_TIMEOUT_MS`、`CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`
5. **模型映射关系**：Opus↔GLM-4.7/5.1、Sonnet↔GLM-4.7、Haiku↔GLM-4.5-Air

### 详细笔记

**Claude Code 配置步骤**：
```json
// ~/.claude/settings.json
{
    "env": {
        "ANTHROPIC_AUTH_TOKEN": "your_zhipu_api_key",
        "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
        "API_TIMEOUT_MS": "3000000",
        "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": 1,
        "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-5.1",
        "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7",
        "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air"
    }
}
```

**配置不生效排查**：
- 关闭所有 Claude Code 窗口，重新打开新的命令行
- 删除 `~/.claude/settings.json` 重新配置
- 检查 JSON 格式正确性（逗号问题最常见）

**支持的编码工具**（持续扩展中）：
Claude Code、Kilo Code、Cline、OpenCode、Crush、Goose、Roo Code、TRAE、CodeBuddy、Cursor、Factory Droid、OpenClaw

**高级功能**：
- 视觉理解 MCP：GLM-4.6V 模型分析 UI 设计图、流程图、截图
- 联网搜索 MCP：获取最新技术文档和 API 变更
- 网页读取 MCP：抓取网页完整文本与链接
- 开源仓库 MCP：GitHub 仓库检索、目录结构获取、文件代码读取

### 对 OpenClaw 的借鉴价值

- OpenClaw 的配置方式与 Claude Code 类似，可参考其环境变量模式
- `API_TIMEOUT_MS: 3000000`（50 分钟）是重要的超时设置参考
- `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: 1` 禁用非必要流量，值得在 OpenClaw 中考虑
- 一键配置助手 `npx @z_ai/coding-helper` 的设计思路值得 OpenClaw 学习

---

## 四、调用 MCP 指南

**来源**：[MCP & 智能体技巧](https://docs.bigmodel.cn/cn/coding-plan/best-practice/mcp-and-agent) | [Claude Code 常用技巧 - MCP 部分](https://docs.bigmodel.cn/cn/coding-plan/best-practice/claude-code)

### 核心要点

1. **MCP 是给 AI 装上"传感器"**：让 AI 从文本交互走向真正"感知"和"操作"外部世界
2. **智能体分层架构**：采用分层设计（单 Agent → 编排 Agent → 多 Agent 系统）
3. **专业化智能体设计**：按前端专家、后端专家等角色进行系统提示词工程
4. **MCP 配置模式**：filesystem + git + database + api-testing 组合是最小实用集合
5. **Claude Code MCP 管理命令**：`claude mcp add/list/remove`，支持 project/user 作用域

### 详细笔记

**MCP 的核心价值**：
- 不是简单的"多几个工具"，而是扩展 Agent 的**上下文边界**
- 让 Agent 从"代码仓库内的执行者"转变为"面向真实研发环境的协作节点"
- 信息获取方式从"依赖人工描述"转向"依赖工具直接查询"

**常用 MCP 配置示例**：
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "mcp-server-filesystem",
      "args": ["./src", "./docs", "./tests"]
    },
    "git": {
      "command": "mcp-server-git",
      "args": ["--repo-path", "."]
    },
    "database": {
      "command": "mcp-server-postgres",
      "args": ["--connection", "postgresql://localhost:5432/mydb"]
    }
  }
}
```

**GLM Coding Plan 专属 MCP**：
- **视觉理解 MCP**：Local MCP，使用 GLM-4.6V，与模型共享 5h prompt 池
- **联网搜索 MCP**：Remote MCP，获取实时技术信息
- **网页读取 MCP**：Remote MCP，抓取网页内容为结构化信息
- **开源仓库 MCP**：Remote MCP，GitHub 仓库检索与代码分析

**Claude Code MCP 管理技巧**：
```
# 查看状态
/mcp 或 claude mcp list

# 项目级安装
claude mcp add 工具名 --scope project

# 用户级安装
claude mcp add 工具名 --scope user

# 删除
claude mcp remove tool-name
```

**其他实用 MCP 推荐**：
- Context7：上下文管理
- spec-driven：规范驱动工作流
- Figma：原型设计工具
- EdgeOne Pages：网页部署

### 对 OpenClaw 的借鉴价值

- OpenClaw 已有丰富的 MCP 生态，可以借鉴 GLM 专属 MCP 的设计（视觉理解、联网搜索、网页读取、开源仓库）
- 智能体分层架构（单 Agent → 编排 → 多 Agent）是 OpenClaw subagent 系统的参考
- MCP 作用域管理（project vs user）的概念可以应用到 OpenClaw 的配置系统
- 专业化智能体的系统提示词模板可以直接复用到 OpenClaw 的 agent 配置中

---

## 五、Coding Agent 通用指南（最佳实践）

**来源**：[最佳实践](https://docs.bigmodel.cn/cn/coding-plan/learning-resources/best-practice)

### 核心要点

1. **将 Coding Agent 视为协作者**，而非一次性助手。价值来自模型能力与开发工作流的结合
2. **任务输入结构化**：Goal（目标）+ Context（上下文）+ Constraints（约束）+ Done when（完成标准）
3. **复杂任务先规划再执行**：先生成执行计划，再进入实现阶段
4. **临时指令写在 prompt 中，长期规则写入项目级配置文件**
5. **Coding Agent 能力三层上下文**：任务上下文、项目上下文、环境上下文

### 详细笔记

**十大最佳实践**：

| # | 原则 | 核心要点 |
|---|------|---------|
| 1 | 协作者而非助手 | 通过配置持续优化 Agent 行为 |
| 2 | 结构化任务输入 | 目标+上下文+约束+完成标准 |
| 3 | 先规划后执行 | 探索→确认→实现的三阶段模式 |
| 4 | 规则沉淀为配置 | 项目级文件承载长期规则 |
| 5 | 环境决定能力 | 文件权限、可执行命令、工具连接 |
| 6 | 参与完整开发闭环 | 实现→测试→检查→审查 |
| 7 | MCP 扩展上下文 | 连接外部系统获取实时信息 |
| 8 | 重复流程沉淀为 Skills | 结构化任务模板，可复用 |
| 9 | 稳定流程自动化 | 从交互式工具到持续运行的开发辅助 |
| 10 | 合理管理会话 | 每个任务独立线程，定期压缩历史 |

**完整开发闭环流程**：
1. 修改/新增代码
2. 编写/更新测试
3. 运行测试套件
4. 执行代码检查（lint、类型检查）
5. 审查代码变更（diff review）

**会话管理策略**：
- 每个任务使用独立线程
- 避免线程过长（摘要/压缩）
- 分支任务创建新线程
- 定期压缩历史上下文
- 复杂场景引入多 Agent 协作

### 对 OpenClaw 的借鉴价值

- **任务输入结构化**的 Goal-Context-Constraints-Done 框架可以直接应用到 OpenClaw 的 task 系统中
- **完整开发闭环**的概念可以整合到 OpenClaw 的 coding-agent skill 中
- **Skills 沉淀**理念与 OpenClaw 的 SKILL.md 机制高度一致，可以互相补充
- **会话管理**的压缩和分支策略对 OpenClaw 的 subagent 上下文管理有直接参考价值

---

## 六、Claude Code 保姆级教程

**来源**：[Claude Code 接入](https://docs.bigmodel.cn/cn/coding-plan/tool/claude) | [Claude Code 常用技巧](https://docs.bigmodel.cn/cn/coding-plan/best-practice/claude-code)

### 核心要点

1. **安装**：`npm install -g @anthropic-ai/claude-code`，需 Node.js 18+
2. **权限模式三档**：Normal（需确认）→ Auto-Accept（自动接受）→ Plan Mode（只读分析），通过 Shift+Tab 切换
3. **核心快捷命令**：`/init`（初始化项目）、`/memory`（编辑记忆）、`/compact`（压缩对话）、`/status`（查看状态）、`/mcp`（MCP 工具）
4. **@引用机制**：`@文件名` 精准引用文件、`@目录` 获取目录列表、`@github:repos/...` 引用 MCP 资源
5. **推荐版本 2.1.42+**，通过 `claude --version` 检查、`claude update` 升级

### 详细笔记

**完整配置流程**：
```bash
# 1. 安装
npm install -g @anthropic-ai/claude-code

# 2. 配置 ~/.claude/settings.json
# 3. 进入项目目录
cd your-project
# 4. 启动
claude
# 5. 选择信任文件夹
```

**CLAUDE.md 项目模板**：
- 项目概述（功能与目标）
- 技术栈（语言、框架、数据库、依赖）
- 开发环境设置（安装、配置、启动）
- 项目结构（目录树）
- 重要配置文件说明
- 开发规范（代码风格、提交规范、分支管理）
- 常用命令（测试、lint、构建、部署）
- 注意事项

**高级技巧**：
- `--dangerously-skip-permissions` 启用自动模式
- `--permission-mode plan` 以计划模式启动
- `Ctrl+G` 在编辑器中打开计划
- `#` 快速编辑 CLAUDE.md
- `!` 执行 bash 命令
- `+Enter` 换行输入
- `Ctrl+L` 清屏

**常见问题排查**：
- npm 权限错误 → `sudo npm install -g` 或配置 npm prefix
- Node.js 版本低 → 使用 nvm 管理
- 配置不生效 → 删除 `~/.claude/` 重建
- MCP 工具失败 → 检查网络、验证 API Key

**完整卸载**：
```bash
npm uninstall -g @anthropic-ai/claude-code
rm -rf ~/.claude*
npm cache clean --force
```

### 对 OpenClaw 的借鉴价值

- Claude Code 的**三档权限模式**（Normal/Auto/Plan）是 OpenClaw 安全策略的优秀参考
- **@引用机制**可以启发 OpenClaw 的文件引用功能
- **CLAUDE.md 项目模板**的结构可以直接映射到 OpenClaw 的 SOUL.md/IDENTITY.md/USER.md 体系
- Claude Code 的快捷命令设计（`/init`、`/memory`、`/compact`）可以作为 OpenClaw CLI 命令的参考

---

## 七、记忆机制

**来源**：[记忆机制](https://docs.bigmodel.cn/cn/coding-plan/learning-resources/memory-mechanism)

### 核心要点

1. **Agent 记忆架构**：短期记忆（会话上下文）+ 长期记忆（语义/情景/程序记忆）
2. **指令型记忆 vs 学习型记忆**：前者是人写的规则，后者是 Agent 从经验中积累的
3. **五层记忆分层**：组织级 → 项目级 → 用户级 → 本地域 → 角色/子代理级
4. **按路径加载规则**：主记忆只保留全局共识，专项规则按主题模块化，按需加载
5. **记忆写法要具体**：用"TypeScript 文件使用 2 空格缩进"而非"保持代码整洁"

### 详细笔记

**记忆类型详解**：

| 类型 | 说明 | 生命周期 | 示例 |
|------|------|---------|------|
| Session Memory | 当前会话上下文 | 单次会话 | 对话历史、工具调用结果 |
| Project Memory | 项目长期信息 | 持久化 | 架构、规范、构建流程（CLAUDE.md） |
| Semantic Memory | 知识和事实 | RAG 检索 | API 文档、编程语言规则 |
| Episodic Memory | 历史经验 | 持久化 | bug 修复步骤、构建失败原因 |
| Procedural Memory | 任务策略/流程 | 持久化 | 调试工作流、部署流程 |

**记忆使用固定范式**：
1. **记忆检索**：任务开始前检索项目记忆、知识库、历史经验
2. **上下文构建**：检索到的记忆拼接到模型输入
3. **记忆更新**：任务完成后写入新记忆（新规则、新经验、用户偏好）

**五层分层设计**：

| 层级 | 范围 | 典型内容 | 管理方式 |
|------|------|---------|---------|
| 组织级 | 全公司 | 安全合规、代码审查底线 | 系统级路径，不可绕过 |
| 项目级 | 团队共享 | 架构、构建命令、API 规范 | 版本控制，所有协作者共享 |
| 用户级 | 个人 | 偏好代码风格、调试顺序 | 用户目录，不覆盖项目规则 |
| 本地域 | 单机 | 测试账号、本地端口 | 不进 Git |
| 角色级 | 子代理 | 测试代理记忆、重构代理记忆 | 独立记忆目录，避免污染 |

**按路径加载的记忆结构**：
```
agent-memory/
├── project.md            # 项目总说明（全局共识）
├── rules/
│   ├── code-style.md     # 代码风格
│   ├── testing.md        # 测试约定
│   ├── api-design.md     # API 设计规范
│   ├── security.md       # 安全要求
│   └── frontend/
│       └── react.md      # 前端专项规范（按路径加载）
└── local/
    └── developer.local.md
```

**规则包复用机制**：
- `@path/to/import` 导入其他规则文件
- 符号链接（symlink）共享规则
- 支持递归展开
- 可构建可复用的规则包（如 `company-security-rules`）

**记忆故障排除**：
- Agent 不遵循规则 → `/memory` 确认加载、检查冲突
- 不知道自动记忆内容 → 运行 `/memory` 查看
- 记忆文件太大 → 拆分为多文件，使用导入机制
- 指令在压缩后消失 → 写入 `.md` 文件而非仅对话说明

### 对 OpenClaw 的借鉴价值

- **这是对 OpenClaw 最有直接参考价值的文章之一**。OpenClaw 的 SOUL.md、IDENTITY.md、USER.md、TOOLS.md 体系与记忆分层高度对应
- **指令型 vs 学习型记忆**的区分可以优化 OpenClaw 的 MEMORY.md 和 memory_recall 机制
- **五层分层设计**可以直接映射到 OpenClaw 的配置层级（系统级 → workspace → 用户级 → 本地 → 角色/skill）
- **按路径加载规则**的理念可以启发 OpenClaw skill 的按需加载机制
- **规则包复用**（符号链接、导入机制）是 OpenClaw skill 系统的进化方向

---

## 八、常用工作流

**来源**：[常用工作流](https://docs.bigmodel.cn/cn/coding-plan/learning-resources/common-workflow)

### 核心要点

1. **理解代码库**：从高级概览开始，逐步缩小到特定领域，询问架构模式和关键数据模型
2. **修复 Bug**：提供错误信息+重现步骤+持续性判断，请求修复建议后再应用
3. **Plan Mode 安全分析**：Shift+Tab 切换到计划模式，只读分析不修改代码，通过 AskUserQuestion 澄清需求
4. **专用 Subagents**：`/agents` 查看可用子代理，可自定义（code-reviewer、debugger 等）
5. **引用机制**：`@文件` 包含文件内容、`@目录` 目录列表、`@mcp:resource` MCP 资源

### 详细笔记

**工作流详细步骤**：

**1. 理解新代码库**
```
# 快速概览
give me an overview of this codebase
explain the main architecture patterns used here
what are the key data models?

# 查找相关代码
find the files that handle user authentication
how do these authentication files work together?
trace the login process from front-end to database
```

**2. 修复 Bug**
```
I'm seeing an error when I run npm test
suggest a few ways to fix the @ts-ignore in user.ts
update user.ts to add the null check you suggested
```

**3. 重构代码**
```
find deprecated API usage in our codebase
suggest how to refactor utils.js to use modern JavaScript features
refactor utils.js to use ES2024 features while maintaining the same behavior
run tests for the refactored code
```

**4. Plan Mode 使用**
```bash
# 会话中切换：Shift+Tab 三次到 Plan Mode
# 以 Plan Mode 启动
claude --permission-mode plan
# Plan Mode 无头查询
claude --permission-mode plan -p "Analyze the authentication system"
# 配置为默认
# .claude/settings.json → "permissions": {"defaultMode": "plan"}
```

**5. 编写测试**
```
find functions in NotificationsService.swift not covered by tests
add tests for the notification service
add test cases for edge conditions
run the new tests and fix any failures
```

**6. Subagents 管理**
```
/agents                           # 查看可用子代理
review my recent code changes      # 自动委派
use the code-reviewer subagent to check the auth module  # 指定子代理
```

**7. 创建 PR**
```
summarize the changes I've made to the authentication module
create a pr
enhance the PR description with more context about the security improvements
```

**8. 文档生成**
```
find functions without proper JSDoc comments in the auth module
add JSDoc comments to the undocumented functions in auth.js
improve the generated documentation with more context and examples
```

### 对 OpenClaw 的借鉴价值

- **Plan Mode** 概念可以直接在 OpenClaw 中实现：默认安全模式 + Shift+Tab 切换
- **Subagents 管理**（`/agents` 命令、自定义子代理）与 OpenClaw 的 subagent 系统高度对应
- **@引用机制**可以增强 OpenClaw 的文件引用交互
- 各个工作流的 prompt 模式可以直接转化为 OpenClaw 的 skill 或 agent 配置

---

## 九、Agentic 扩展组件

**来源**：[Agentic 扩展组件](https://docs.bigmodel.cn/cn/coding-plan/learning-resources/agentic-extension)

### 核心要点

1. **Coding Agent 架构**：Model → Agent Loop → Tools + Extension Layer（上下文文件/Skills/Subagents/外部工具/Hooks/Plugins）
2. **七大扩展组件**：CLAUDE.md、Skills、MCP、Subagents、Agent Teams、Hooks、Plugins
3. **组件选择指南**：全局规则用 CLAUDE.md、可复用流程用 Skills、上下文隔离用 Subagents、外部系统用 MCP、确定性自动化用 Hooks
4. **上下文成本管理**：每种扩展组件都有上下文开销，需在能力与成本间平衡
5. **组件层级优先级**：CLAUDE.md 叠加模式、Skills/Subagents 按名称覆盖、MCP local>project>user、Hooks 合并执行

### 详细笔记

**组件详解**：

| 组件 | 作用 | 加载时机 | 上下文成本 | 适用场景 |
|------|------|---------|-----------|---------|
| CLAUDE.md | 项目规则与背景 | 每次会话 | 每次请求（建议≤200行） | 项目规范、全局规则 |
| Skills | 可复用能力模块 | 会话开始+调用时 | 描述+完整内容（较低） | 参考文档、标准流程 |
| Subagents | 独立子 Agent | 创建时 | 与主会话隔离 | 大规模分析、并行任务 |
| Agent Teams | 多 Agent 协同 | 需要时 | 各自独立 | 并行研究、复杂开发 |
| MCP | 外部系统连接 | 会话开始 | 工具定义（每次请求） | 数据库、API、通知 |
| Hooks | 事件触发脚本 | 触发时 | 0 | 文件变更后 lint、CI 集成 |
| Plugins | 能力打包分发 | 安装时 | 取决于包含的组件 | 跨仓库复用、团队分发 |

**组件区分要点**：

**Skills vs Subagent**：
- Skills = 可复用知识或流程（Reference Skills 提供知识，Action Skills 触发任务）
- Subagent = 独立执行单元，上下文隔离
- 两者可组合：Subagent 预加载 Skills，Skills 在隔离上下文中执行

**CLAUDE.md vs Rules vs Skills**：
- CLAUDE.md：每次会话加载，整个项目范围，核心规则
- `.claude/rules/`：按文件路径加载，指定目录范围，细粒度规则
- Skills：按需加载，任务级范围，工作流程

**MCP vs Skills**：
- MCP = 外部系统连接协议（提供工具接口与数据访问）
- Skills = 知识或流程（提供使用方式与业务逻辑）
- 配合使用：MCP 连接数据库，Skills 定义查询方式

**组合模式**：

| 组合 | 工作方式 | 示例 |
|------|---------|------|
| Skills + MCP | MCP 提供连接，Skills 定义用法 | Skills 描述数据库 schema |
| Skills + Subagent | Skills 启动多个 Subagent | `/audit` 同时运行安全+性能检查 |
| CLAUDE.md + Skills | 全局规则 + 按需知识 | CLAUDE.md 定义规范，Skills 定义流程 |
| Hook + MCP | Hook 调用外部系统 | 修改关键文件后发送 Slack 通知 |

**上下文优化策略**：
- `disable-model-invocation: true` 让 Skill 仅手动调用时加载，上下文成本为零
- CLAUDE.md 控制在 200 行以内，详细内容拆分为 Skills 或 rules 文件
- 主记忆只保留全局共识，专项规则按需加载

### 对 OpenClaw 的借鉴价值

- **这是对 OpenClaw 最核心的参考文章之一**。OpenClaw 的架构与 Claude Code 的 Extension Layer 高度一致
- **组件选择指南**可以作为 OpenClaw 用户配置的最佳实践文档
- **上下文成本分析**对 OpenClaw 的 system prompt 管理有直接指导意义
- **Skills 的 Reference/Action 分类**可以启发 OpenClaw skill 的设计模式
- **Hook 的零上下文成本**特性值得在 OpenClaw 中推广
- **Plugin 打包分发**机制是 OpenClaw 扩展生态的未来方向

---

## 本板块总结

### 新手修炼手册的核心知识脉络

新手修炼手册的 9 篇文章构成了一个完整的 **Coding Agent 使用知识体系**，其知识脉络可以归纳为以下四个层次：

```
┌─────────────────────────────────────────────────┐
│              第一层：产品认知                       │
│  GLM Coding Plan 介绍 · 套餐变更指南              │
│  了解"是什么"和"怎么用"                           │
├─────────────────────────────────────────────────┤
│              第二层：工具入门                       │
│  GLM 编码模型入门 · Claude Code 教程              │
│  从"快速上手"到"熟练使用"                         │
├─────────────────────────────────────────────────┤
│              第三层：能力扩展                       │
│  调用 MCP 指南 · Agentic 扩展组件                 │
│  从"单机编程"到"连接外部世界"                      │
├─────────────────────────────────────────────────┤
│              第四层：体系构建                       │
│  Coding Agent 通用指南 · 记忆机制 · 常用工作流      │
│  从"临时使用"到"可持续的工作流体系"                  │
└─────────────────────────────────────────────────┘
```

### 核心主题归纳

1. **产品化认知**：Coding Agent 不是代码补全工具，而是可配置、可扩展、可自动化的开发协作系统
2. **结构化思维**：任务输入要结构化（Goal-Context-Constraints-Done）、记忆要分层（组织→项目→用户→本地→角色）、规则要模块化
3. **扩展组件是核心价值**：CLAUDE.md（全局规则）+ Skills（可复用流程）+ MCP（外部连接）+ Subagents（上下文隔离）+ Hooks（自动化）构成了完整的 Extension Layer
4. **记忆机制是长期稳定性的关键**：区分指令型记忆和学习型记忆、五层分层管理、按路径按需加载、规则包复用
5. **从交互工具到持续系统**：临时对话 → Skill 沉淀 → 自动化调度 → 多 Agent 协作，这是 Coding Agent 使用的成熟度演进路径

### 对 OpenClaw 的总体借鉴

OpenClaw 的系统设计与这些知识高度共鸣。最值得深入实践的三个方向：

1. **记忆分层体系的落地**：将现有的 SOUL.md/IDENTITY.md/USER.md 体系进一步细化为五层分层，引入按路径加载和规则包复用机制
2. **Extension Layer 的完善**：强化 Skills 的 Reference/Action 分类、实现 Hook 机制（零上下文成本的确定性自动化）、推动 Plugin 打包分发
3. **工作流标准化的推广**：将 Plan Mode、完整开发闭环、Subagent 管理等最佳实践整合为 OpenClaw 的标准 skill
