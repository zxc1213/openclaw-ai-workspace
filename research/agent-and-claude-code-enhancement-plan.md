# 🚀 Agent 团队 & Claude Code 提升计划

> 基于 GLM Coding 开发者社区知识库精读 + 当前环境现状分析
> 创建日期：2026-04-05
> 作者：念念 🌙

---

## 第一部分：GLM Coding 社区知识库精读总结

### 一、GLM Coding Plan 体系

| 套餐 | 月费 | 每5h | 每周 | 适用场景 |
|------|------|------|------|----------|
| Lite | ¥49 | ~80 prompts | ~400 | 轻度使用 |
| Pro | ¥149 | ~400 prompts | ~2000 | 日常开发 |
| Max | ¥469 | ~1600 prompts | ~8000 | 高频重度 |

**模型映射（Claude Code 环境变量）：**
- Opus → GLM-5（复杂推理、大型工程）
- Sonnet → GLM-4.7（日常开发）
- Haiku → GLM-4.5-Air（轻量任务）

**注意：** GLM-5 调用额度按高峰(14:00-18:00) 3x / 非高峰 2x 抵扣。普通任务用 GLM-4.7 即可。

### 二、Agentic 生态五大组件

| 组件 | 定位 | 持久性 | 适用场景 |
|------|------|--------|----------|
| **Prompts** | 对话中的即时指令 | ❌ 不持久 | 一次性需求、迭代优化 |
| **Skills** | 可复用的"操作手册+资源包" | ✅ 持久 | 标准化流程、专业领域能力 |
| **Projects** | 长期工作空间（200K context + RAG 10x） | ✅ 持久 | 项目上下文、团队协作 |
| **Subagents** | 独立执行单元（独立上下文+权限隔离） | ✅ 持久 | 任务专精、并行处理、安全隔离 |
| **MCP** | 连接层协议（接入外部工具和数据源） | ✅ 持久 | 访问外部数据、调用业务系统 |

**关键原则：**
- Skills 教"怎么做"，Subagents 管"谁来执行"，MCP 管"数据在哪"
- 如果多个 Agent 都需要某套方法 → 做 Skill
- 如果需要权限隔离/独立上下文 → 用 Subagent

### 三、Skill 设计最佳实践

1. **命名**：小写+连字符，简洁直观
2. **描述**：必须明确能力、触发条件、上下文、边界
3. **结构**：概述 → 前置条件 → 执行步骤 → 示例 → 错误处理 → 局限
4. **模块化**：主文件像"菜单"，详细流程拆到独立文件（"菜谱式思路"）
5. **测试三场景**：常规操作、边界输入、超出范围（不应触发）
6. **强制指令**：`MANDATORY - READ ENTIRE FILE` 防止 AI "偷懒"

### 四、CLAUDE.md 最佳实践

1. **内容层次**：项目概览 → 目录结构 → 工具命令 → 工作流 → 编码规范 → 踩坑记录
2. **动态进化**：从简入手，随使用痛点逐步补充
3. **辅助目录**：`.claude/commands/` 存自定义斜杠命令
4. **上下文管理**：切换任务时用 `/clear`，复杂审查用 Sub-agent 隔离
5. **安全红线**：绝不写 API Key、数据库连接串等敏感信息

---

## 第二部分：Agent 团队提升计划

### 当前状态

| Agent | 模型 | 定位 | 工作区 | 配置完善度 |
|-------|------|------|--------|-----------|
| 🌙 念念 (main) | GLM-5-Turbo | 总调度 | workspace | ⭐⭐⭐⭐ |
| 💻 码农1号 (coder) | GLM-5.1 | 写代码 | workspace-coder | ⭐⭐⭐ |
| 🔍 评审员 (reviewer) | GLM-5.1 | 代码审查 | workspace-reviewer | ⭐⭐⭐ |
| 🎨 设计师 (designer) | GLM-4.6V | 视觉分析 | workspace-designer | ⭐⭐⭐ |
| 🔬 调研员 (research) | GLM-5-Turbo | 技术调研 | workspace-research | ⭐⭐⭐ |
| 📝 文案 (writer) | GLM-5-Turbo | 文档撰写 | workspace-writer | ⭐⭐⭐ |
| 📊 分析师 (analyst) | GLM-5.1 | 安全分析 | workspace-analyst | ⭐⭐⭐ |
| ⏰ 定时任务 (cron-worker) | GLM-5-Turbo | 定时执行 | workspace-cron-worker | ⭐⭐⭐ |

### 提升计划

#### 阶段一：基础强化（1-2 天）

**1. 为每个 Agent 完善专属 CLAUDE.md**
- 每个 Agent 的工作区都应该有项目说明书
- coder：Java/Spring Cloud 项目规范、集团平台目录结构、编码约定
- reviewer：审查清单模板（安全/性能/规范/可维护性）
- research：调研输出模板、信息源优先级、引用格式
- writer：文档风格指南、飞书文档格式规范、简报模板
- analyst：安全漏洞分级标准、报告模板

**2. 为高频任务创建 Skills**
- `spring-cloud-review`：集团平台项目的 SpringCloud 代码审查流程
- `k8s-config-migrate`：K8s 配置迁移操作手册
- `security-briefing`：安全简报生成标准化流程
- `feishu-report`：飞书文档/多维表格操作封装

**3. Agent 间协作规范**
- 定义 Subagent 调用策略：什么时候该 main 自己做，什么时候该分派
- 统一工具使用规范（避免每个 Agent 重复踩坑）
- 输出格式统一（飞书消息、文档、报告的模板）

#### 阶段二：能力扩展（1 周）

**4. 新增 Agent：ops-engineer（运维工程师）**
- 模型：GLM-5-Turbo
- 职责：服务器监控、部署流程、故障排查、日志分析
- 工具：exec（受限）、web_search、journalctl 分析
- 可承接：Team Dashboard 告警响应、服务健康巡检

**5. 强化 designer Agent**
- 升级到 GLM-5V-Turbo（多模态 coding 基座，reasoning 更强）
- 新增能力：UI 截图分析、设计稿对比、前端代码视觉验证

**6. 知识库沉淀**
- 将 `memory/spring-cloud-k8s-config-refactor-guide.md` 等 memory 文件结构化为 Skills
- 每个核心项目建立知识索引（169 表结构、服务关系、部署配置）
- 迁移经验（kczx 已完成）整理为可复用的 template

#### 阶段三：工作流优化（持续）

**7. ClawFlow 编排复杂任务**
- 安全简报生成：analyst 搜集 → writer 整理 → main 审核 → 自动发布
- 代码审查流程：coder 提交 → reviewer 审查 → 生成报告 → 飞书通知
- 调研报告：research 调研 → writer 撰写 → analyst 数据验证

**8. 自我改进循环**
- 利用 self-improvement skill 自动记录踩坑
- 心跳期间整理 memory → 更新 Agent Skills
- 定期回顾 Agent 输出质量，调整配置

---

## 第三部分：Claude Code 提升计划

### 当前环境对比

| 维度 | WSL Claude Code | Windows Claude Code |
|------|----------------|-------------------|
| 版本 | 2.1.37 | 未知（通过 npm 安装） |
| 模型 | GLM-5.1 (Sonnet+Opus) | GLM-5 (Sonnet) + GLM-5.1 (Opus) |
| Plugins | 11 个 | 14 个（多了 playwright, ui-ux-pro-max, everything-claude-code, claude-mem, codex, skill-creator） |
| MCP | 无（仅 plugins） | 5 个（zai-mcp, web-search-prime, web-reader, zread, codex） |
| 自定义命令 | 无 | 32 个（sc/ 下 30 个 + commit） |
| Skills | 无 | 6 个（planning-with-files 等） |
| Projects | 无 | ~20 个项目配置 |
| OpenViking | 有（plugin） | 有（claude-mem plugin） |

### 分析

**Windows 侧明显更成熟**：有完整的 SC 命令体系、MCP 工具链、项目管理配置。WSL 侧基本是裸奔状态。

**WSL 侧缺失的关键配置：**
- ❌ 无 MCP Server（无视觉理解、联网搜索、网页读取、开源仓库）
- ❌ 无自定义命令（无 /commit 等效率工具）
- ❌ 无 Skills（无复用知识沉淀）
- ❌ 无 Projects 配置（项目上下文未持久化）
- ⚠️ 无 OpenViking memory plugin（记忆断代）

### 提升计划

#### WSL Claude Code 增强（优先）

**1. 配置 MCP Server**
```json
{
  "mcpServers": {
    "zai-mcp-server": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@z_ai/mcp-server"],
      "env": { "Z_AI_MODE": "ZHIPU", "Z_AI_API_KEY": "<API_KEY>" }
    },
    "web-search-prime": {
      "type": "http",
      "url": "https://open.bigmodel.cn/api/mcp/web_search_prime/mcp",
      "headers": { "Authorization": "Bearer <API_KEY>" }
    },
    "web-reader": {
      "type": "http",
      "url": "https://open.bigmodel.cn/api/mcp/web_reader/mcp",
      "headers": { "Authorization": "Bearer <API_KEY>" }
    },
    "zread": {
      "type": "http",
      "url": "https://open.bigmodel.cn/api/mcp/zread/mcp",
      "headers": { "Authorization": "Bearer <API_KEY>" }
    }
  }
}
```
> 获取方式：从 Windows 侧 `~/.claude/settings.json` 复制，替换 env 中的 API Key。

**2. 创建自定义命令**
- `/commit` — Conventional Commits 提交（从 Windows 侧复制）
- `/review` — 代码审查流程
- `/security-check` — 安全检查
- `/spring-refactor` — Spring Cloud 配置改造

**3. 创建核心 Skills**
- `spring-cloud` — 集团平台项目专属知识（169 表、服务架构、常见坑）
- `k8s-migrate` — K8s 配置迁移指南
- `wsl-dev` — WSL2 开发环境注意事项（代理、binfmt_misc、权限）

**4. 配置 OpenViking Memory Plugin**
- 确认 `claude-code-memory-plugin@openviking-plugin` 在 enabledPlugins 中
- 确保 OpenViking 服务正常运行
- 跨 Windows/WSL 共享记忆（通过 OpenViking remote 模式）

**5. 模型配置优化**
```json
{
  "env": {
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "GLM-5.1",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "GLM-5.1",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "GLM-4.7"
  }
}
```
> Sonnet 也升到 GLM-5.1，日常编码和复杂推理都用最强模型。

#### Windows Claude Code 增强

**1. 补充 Plugins**
- `claude-code-memory-plugin@openviking-plugin` — 统一记忆系统
- `document-skills@anthropic-agent-skills` — 文档处理能力
- `skill-creator@claude-plugins-official` — Skill 创建辅助（已有 ✅）

**2. 优化模型配置**
- 当前 Sonnet 用 GLM-5，建议也升级到 GLM-5.1
- 配置 `model: "opus[1m]"` 长上下文模式（已有 ✅）

**3. 增强自定义命令**
- `/deploy` — 集团平台部署流程（检查配置 → 打包 → 上传）
- `/db-review` — 数据库变更审查
- `/daily-report` — 日报/周报生成

**4. SC 命令体系优化**
- 评估 30 个 sc/ 命令的使用频率，移除低频的
- 添加 Spring Cloud / K8s 专属命令
- 统一中英文输出格式

#### 跨环境统一

**5. Windows ↔ WSL 配置同步方案**
- 共享 MCP 配置（MCP Server 可通过 `wsl` 前缀从 Windows 调用 WSL 服务）
- 共享 OpenViking 记忆（两边的 Claude Code 都连同一个 OpenViking 实例）
- 共享 API Key 管理（考虑 `.env` 文件 + settings.json 引用）

**6. 项目级 CLAUDE.md 标准化**
- 为每个核心项目（集团平台 4 个版本、nian-desktop、Team Dashboard）创建 CLAUDE.md
- 包含：架构概览、构建命令、测试方式、编码规范、常见坑、部署流程
- 放在项目根目录，提交到 Git

---

## 第四部分：执行优先级

| 优先级 | 任务 | 预计耗时 | 价值 |
|--------|------|----------|------|
| 🔴 P0 | WSL 配置 MCP Server | 10 分钟 | ⭐⭐⭐⭐⭐ |
| 🔴 P0 | WSL 复制 Windows 的自定义命令 | 10 分钟 | ⭐⭐⭐⭐ |
| 🟡 P1 | Agent CLAUDE.md 完善 | 2 小时 | ⭐⭐⭐⭐ |
| 🟡 P1 | WSL 安装核心 Skills | 30 分钟 | ⭐⭐⭐⭐ |
| 🟡 P1 | 项目级 CLAUDE.md 创建 | 1 小时 | ⭐⭐⭐⭐ |
| 🟢 P2 | 新增 ops-engineer Agent | 1 小时 | ⭐⭐⭐ |
| 🟢 P2 | SpringCloud Skill 开发 | 2 小时 | ⭐⭐⭐ |
| 🟢 P2 | Windows Claude Code 配置微调 | 30 分钟 | ⭐⭐⭐ |
| 🔵 P3 | ClawFlow 工作流编排 | 半天 | ⭐⭐⭐ |
| 🔵 P3 | designer 模型升级 | 5 分钟 | ⭐⭐ |
| 🔵 P3 | 新增 Agent 测试与迭代 | 持续 | ⭐⭐ |

---

## 附录：参考来源

- 智谱 GLM Coding 开发者社区：https://zhipu-ai.feishu.cn/wiki/Ch2HwSnCdiQUCUkiuxecLtJLnkf
- GLM Coding Plan 套餐详情：https://bigmodel.cn/glm-coding
- Claude Code 官方文档：https://docs.bigmodel.cn/cn/coding-plan/tool/claude
- OpenClaw Agent Skills 规范：~/.nvm/versions/node/v25.6.0/lib/node_modules/openclaw/docs
