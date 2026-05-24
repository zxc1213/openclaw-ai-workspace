# CLAUDE.md — Claude Code 全局配置

> Claude Code 的 Harness 配置，相当于 OpenClaw 的 AGENTS.md。
> Agent = Model + Harness，相同模型不同 Harness 结果天差地别。

---

## 基本原则

1. **先规划再执行** — 收到任务先分析需求、查找代码、拆分步骤，再动手
2. **参与完整开发闭环** — 改码 → 测试 → lint → 审查 → 迭代，不能只写代码
3. **环境决定能力边界** — 三层上下文：任务级 / 项目级 / 环境级
4. **文档是最好的 Harness** — 这份文件的质量直接决定我的行为质量
5. **限制解空间反而提升效率** — 清晰的约束让我更快收敛

## 任务结构化

所有任务必须四要素：

- **Goal**: 一句话说清楚要做什么
- **Context**: 关键背景信息（文件路径、相关文档、前置条件）
- **Constraints**: 硬性约束（不能做什么、必须遵守什么、上下文预算）
- **Done**: 可检查的完成条件（不是"完成开发"，而是"文件X新增Y行""接口返回Z"）

## 开发规范

### 必须遵守
- 改代码不改规则 — 禁止修改 lint/formatter/tsconfig/eslint config 来让代码通过
- 禁止 `git commit --no-verify` / `git push --force`（共享分支）
- 每次改动要有明确理由，不要"顺手"改无关文件
- 新增依赖必须说明原因，优先使用项目已有依赖
- 测试先行：不确定影响范围时，先写测试验证

### 代码质量
- 提交前自检：lint pass、无 console.log、无 TODO 注释残留
- 安全扫描：无硬编码密钥/密码、无 SQL 拼接、无未校验的用户输入
- 命名规范：跟项目现有风格保持一致
- 注释：只解释"为什么"，不解释"是什么"

### Git 提交
- 提交信息格式：`type(scope): 描述`（type: feat/fix/refactor/docs/test/chore）
- 每个提交做一件事（原子提交）
- 提交前 `git diff --staged` 检查

## 项目感知

### Java/Spring Cloud 项目（集团平台）
- 技术栈：Java 17+、Spring Cloud、MyBatis-Plus
- 代码风格：遵循项目现有 Alibaba Java 规范
- 数据库操作：用 MyBatis-Plus 查询，禁止手写 SQL 拼接
- API 规范：RESTful，统一响应体

### 前端项目
- 技术栈跟随项目现有配置
- 组件命名用 PascalCase
- 样式优先使用项目已有的 CSS/SCSS 方案

### Tauri 桌面项目 (nian-desktop)
- Rust 后端 + Web 前端
- 注意跨平台兼容性（Windows/Linux）

## 工具使用

### MCP 工具
- OpenViking Memory Plugin：记忆存取
- Firecrawl：网页爬取和搜索
- Context7：库文档查询

## 会话管理

- 长任务定期总结进度，不要堆到最后
- 任务完成后快速回顾：Done 标准是否全部满足
- 遇到不确定的地方先问，不要猜
- 被纠正时记录教训，不要重复犯错

## 红线

- 私有数据（密钥、密码、个人信息）不外泄
- 线上部署、数据库 DDL、批量删除 → 必须先确认
- 删除文件优先移到回收站

## 个人偏好

- 沟通语言：中文
- 风格：简洁干练，需要详细时主动说明
- 不要说废话，直接做或直接说结论
- 给出方案时附带理由，但不要长篇大论
