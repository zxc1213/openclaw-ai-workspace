# T2-04: 项目配置文件 CLAUDE.md 实战

> CLAUDE.md 是 Claude Code 的"项目入职手册"。每次新对话自动加载，告诉 Agent 你的项目是什么、怎么运作、有什么规矩。写好它，等于给 Agent 装上了项目的"肌肉记忆"。

## 目录

- [CLAUDE.md 是什么](#claudemd-是什么)
- [写什么：六个核心模块](#写什么六个核心模块)
- [一个真实项目的 CLAUDE.md 模板](#一个真实项目的-claudemd-模板)
- [写 CLAUDE.md 的原则](#写-claudemd-的原则)
- [CLAUDE.md 的层级结构](#claudemd-的层级结构)
- [常见问题](#常见问题)
- [立即行动](#立即行动)

---

## CLAUDE.md 是什么

Claude Code 启动时，会自动读取项目根目录的 `CLAUDE.md` 文件（类似 Cursor 的 `.cursor/rules`、Cline 的 `.cline/rules`）。这个文件的内容会成为 Agent 上下文的一部分。

**类比：** CLAUDE.md 就像是给新同事写的入职文档——项目用什么技术、代码怎么组织、开发有什么规范、哪些东西不能碰。只不过这个"新同事"是 AI，它每次新对话都是"新入职"。

### 没有 CLAUDE.md 的后果

```
你：帮我在这个项目里加一个新的 API 接口
Claude Code：
  - 猜你用 JavaScript（实际你用 TypeScript）→ 写出来的代码类型全错
  - 用 npm init 创建新文件（你实际用 pnpm）→ 产生 package-lock.json 冲突
  - 把新路由放在根目录（你的路由全在 src/routes/）→ 项目结构混乱
  - 用 .then() 写异步（你团队约定用 async/await）→ 风格不统一
```

每次都要纠正，每次都浪费 5-10 分钟。

### 有 CLAUDE.md 的效果

```
你：帮我在这个项目里加一个新的 API 接口
Claude Code：
  - 读 CLAUDE.md，知道是 TypeScript + pnpm + Express
  - 按项目结构创建 src/routes/xxx.ts
  - 用 async/await 写代码
  - 自动生成对应的测试文件
  - 跑 pnpm test 验证通过
```

**零纠正，一次到位。**

---

## 写什么：六个核心模块

不需要写 50 页文档。六个模块，每个模块 3-10 行，总计 50-150 行就够。

### 模块 1：项目概述（3-5 行）

```markdown
## 项目概述
- 用户管理系统，Express + TypeScript + Prisma + PostgreSQL
- 包管理器：pnpm
- 入口文件：src/index.ts
```

**为什么：** Agent 立刻知道这是什么项目、用什么技术栈。一秒钟建立全局认知。

### 模块 2：开发命令（5-10 行）

```markdown
## 开发命令
- 启动开发服务器：pnpm dev
- 运行测试：pnpm test
- 运行单个测试：pnpm test -- path/to/test.test.ts
- 代码检查：pnpm lint
- 类型检查：pnpm typecheck
- 构建：pnpm build
```

**为什么：** Agent 知道用什么命令跑测试、检查代码。否则它可能猜 `npm test`（你实际用 pnpm），或者猜错测试框架的命令。

### 模块 3：项目结构（10-15 行）

```markdown
## 项目结构
src/
  routes/          # API 路由定义
  services/        # 业务逻辑
  models/          # Prisma 数据模型
  middleware/       # Express 中间件
  utils/           # 工具函数
  config/          # 配置文件
tests/
  unit/            # 单元测试
  integration/     # 集成测试
prisma/
  schema.prisma    # 数据库 Schema
```

**为什么：** Agent 知道新文件该放哪里、现有代码在哪找。结构清晰，它就不会"创造"新目录。

### 模块 4：代码规范（5-10 行）

```markdown
## 代码规范
- TypeScript strict 模式，禁止 any
- 错误处理用 try/catch，统一使用 AppError 类
- 异步代码用 async/await，不用 .then()
- 函数超过 30 行要拆分
- 命名：文件用 kebab-case，变量用 camelCase，常量用 SCREAMING_SNAKE
- 所有公开函数必须有 JSDoc
```

**为什么：** 这是影响代码质量最直接的部分。5 条核心规则就够了——太多反而让 Agent 抓不住重点。

### 模块 5：测试要求（3-5 行）

```markdown
## 测试要求
- 使用 vitest，测试文件放在 tests/ 对应目录
- 新功能必须写测试，覆盖正常路径和错误路径
- Mock 外部依赖（数据库、API），不使用真实连接
- 测试命名：describe('模块名') + it('应该做XXX')
```

**为什么：** 让 Agent 知道"改完代码要写测试"且"测试有特定格式"。

### 模块 6：安全红线（3-5 行）

```markdown
## 安全红线
- 禁止修改 prisma/migrations/ 下的已有文件
- 禁止提交 .env 文件或硬编码密钥
- SQL 查询必须参数化，禁止字符串拼接
- 禁止 git push --force 到 main 分支
- 禁止删除数据库或执行 DROP 操作
```

**为什么：** 这是安全网。Agent 能执行 shell 命令，必须告诉它哪些事绝对不能做。

---

## 一个真实项目的 CLAUDE.md 模板

把上面的六个模块合在一起：

```markdown
# 项目配置 — Claude Code

## 项目概述
用户管理系统后端 API。Express + TypeScript + Prisma + PostgreSQL + Redis。
包管理器 pnpm，monorepo 结构（pnpm workspace）。

## 开发命令
- pnpm dev          # 启动开发服务器（nodemon）
- pnpm test         # 运行全部测试
- pnpm test:watch   # 监听模式测试
- pnpm lint         # ESLint 检查
- pnpm typecheck    # TypeScript 类型检查
- pnpm build        # 生产构建

## 项目结构
packages/
  api/              # 主 API 服务
    src/routes/     # 路由定义
    src/services/   # 业务逻辑
    src/middleware/  # 中间件
    src/utils/      # 工具函数
  shared/           # 共享类型和工具
tests/              # 测试文件（镜像 packages 结构）
scripts/            # 部署和工具脚本
prisma/             # Prisma schema 和 migrations

## 代码规范
- TypeScript strict 模式，禁止 any 和 @ts-ignore
- 错误处理：try/catch + AppError 类，不用 process.exit
- 异步代码：async/await，不用 .then()/.catch()
- 日志：使用 winston logger，不用 console.log
- 命名：文件 kebab-case，变量 camelCase，类 PascalCase
- 导入顺序：node_modules → packages/shared → 同包相对路径

## 测试要求
- vitest + testing-library
- 测试文件放在 tests/ 镜像对应源码目录
- 新功能必须写测试，至少覆盖正常 + 错误两个路径
- Mock 外部服务（DB、Redis、第三方 API）

## 安全红线
- 禁止修改 prisma/migrations/ 下已有文件
- 禁止硬编码密钥或提交 .env
- SQL/Prisma 查询禁止字符串拼接
- 禁止 push --force 到 main/develop
- 删除操作必须有确认步骤
```

**总计约 60 行。** 这已经是一个非常实用的 CLAUDE.md 了。

---

## 写 CLAUDE.md 的原则

### 原则 1：精确优于宽泛

```
❌ "使用现代 JavaScript 特性"
   → Agent 不知道你指什么，可能用 optional chaining 也可能用 proxy

✅ "使用 optional chaining (?.) 和 nullish coalescing (??)"
   → 精确，无歧义
```

### 原则 2：说"不做什么"比"做什么"更重要

```
❌ "写好测试"
   → Agent 可能写 1 个"通过就行"的测试

✅ "新功能必须写测试，覆盖正常路径和至少一个错误路径"
   → 精确的约束
```

### 原则 3：总长度控制在 200 行以内

超过 200 行的关键信息，Claude Code 会抓不住重点。精简到核心规则，详细文档放其他文件让它按需读取。

```
❌ 在 CLAUDE.md 里写 300 行项目文档
✅ CLAUDE.md 写 50 行核心规则 + "详细文档见 docs/architecture.md"
```

### 原则 4：定期更新

项目变了（换了框架、加了新工具、改了目录结构），CLAUDE.md 也要跟着更新。过期的 CLAUDE.md 比没有更糟——它会误导 Agent。

---

## CLAUDE.md 的层级结构

Claude Code 支持多层 CLAUDE.md：

```
project-root/CLAUDE.md           # 项目级：所有开发者共享
project-root/src/CLAUDE.md       # 目录级：src 目录的特定规则
project-root/src/api/CLAUDE.md   # 子目录级：api 模块的特定规则
~/.claude/CLAUDE.md              # 全局级：所有项目的个人偏好
```

**加载顺序：全局 → 项目根 → 子目录。** 子目录的规则会叠加到项目根的规则上。

**建议：**
- 项目根放通用规则（技术栈、命令、安全红线）
- 子目录放特定规则（如 `src/api/CLAUDE.md` 写 "API 路由必须写 OpenAPI 文档"）
- 全局放个人偏好（如 "默认中文回复"）

---

## 常见问题

### Q：CLAUDE.md 和 README.md 重复吗？

不重复。README.md 写给人看（项目介绍、安装步骤、使用说明），CLAUDE.md 写给 Agent 看（技术栈、规范、红线）。受众不同，内容侧重不同。

### Q：需要把所有规范都写进去吗？

不需要。只写**频繁违反的、容易犯错的、有后果的**规则。5 条精准规则 > 50 条模糊规则。

### Q：团队协作怎么处理？

把 CLAUDE.md 纳入版本控制（git commit），团队成员共同维护。类似 ESLint 配置——它是团队的共识，不是个人的偏好。

---

## 立即行动

### 今天的练习

1. **打开你当前项目**，检查有没有 CLAUDE.md
2. **按六个模块写一个**，控制在 100 行以内
3. **开一个新的 Claude Code session**，让它做一个任务（修 bug / 加功能）
4. **对比**：有 CLAUDE.md 后，它的第一次输出是否更准确？

### 质量检查

写完后问自己：
- [ ] 一个新同事读了这个文件，能开始干活吗？
- [ ] 有没有任何模糊的描述？（"适当"、"尽量"、"如果可以"）
- [ ] 安全红线够不够具体？（"禁止修改 X 文件" vs "注意安全"）
- [ ] 超过 200 行了吗？（超了就删）

---

## 下一篇

**T2-05: Skills 渐进式加载——把重复流程变成可复用技能**

> CLAUDE.md 解决"项目规范"问题，Skills 解决"重复操作"问题。如果你发现自己每次都要给 Claude Code 描述同样的流程，就该考虑做成 Skill 了。
