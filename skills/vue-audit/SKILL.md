---
name: vue-audit
description: Audit Vue2/Vue3 frontend code for style violations, security issues, performance problems, and best practices. Use when asked to review, audit, check, or inspect Vue/JS/TS frontend code. Triggers on phrases like "audit this Vue code", "review the frontend", "check for code smells", "code review Vue", "审计前端代码", "检查 Vue 代码", "代码审查前端".
---

# Vue/JS Code Auditor

Audit Vue (2/3) frontend code against team standards, security best practices, and common anti-patterns.

## Detect Vue Version

Before auditing, detect project Vue version:
- `package.json` → `dependencies.vue` → `^2.x` = Vue2, `^3.x` = Vue3
- Component API style: Options API = Vue2 风格, Composition API (`setup`) = Vue3 风格

## Audit Dimensions

Run all dimensions unless user specifies a subset. Report findings grouped by severity: 🔴 Critical / 🟡 Warning / 🟢 Suggestion.

### 1. Code Style (对照团队规范)

- **缩进**: Vue/JS/TS 用 2 空格，不混用 Tab
- **引号**: 单引号 `'`，不混用双引号（Prettier `singleQuote: true`）
- **分号**: 不使用分号（Prettier `semi: false`）
- **尾逗号**: ES5 风格尾逗号（Prettier `trailingComma: es5`）
- **行宽**: 不超过 100 字符
- **命名**:
  - 组件文件: 大驼峰 PascalCase（`UserProfile.vue`）
  - JS/TS 文件: 小驼峰 camelCase（`useAuth.js`）
  - CSS 类名: kebab-case（`.user-profile`）
  - 组件 name: 大驼峰，多词（`UserProfile`，避免 `Login`）
  - props: camelCase 声明，kebab-case 使用
- **模板**: 指令缩写一致性（v-if vs v-show 使用场景、@click vs v-on:click）
- **编码**: 文件 UTF-8，换行符 LF

### 2. Security（安全审计）

Check against `references/vue-security-checklist.md`:

- **XSS**: `v-html` 使用是否安全（用户输入禁止 v-html），插值 `{{ }}` 自动转义确认
- **敏感信息**: 前端代码是否硬编码密钥/密码/token，API Key 是否暴露
- **API 调用**: 是否使用 HTTPS，请求是否带 token，token 存储方式（localStorage 注意 XSS）
- **路由守卫**: 敏感页面是否有路由守卫（`beforeEach`）
- **权限控制**: 按钮级别权限是否处理（`v-if="hasPermission('xxx')"`）
- **CSRF**: 是否有 CSRF token 处理
- **文件上传**: 前端是否校验文件类型和大小（后端也必须校验）
- **第三方依赖**: 是否有已知漏洞的依赖版本

### 3. Performance（性能审计）

- **v-for 和 key**: 列表渲染是否使用 `:key`，避免用 `index` 作为 key（数据可能变化时）
- **v-if vs v-show**: 频繁切换用 v-show，条件不常变用 v-if
- **组件懒加载**: 路由级组件是否使用 `() => import()` 懒加载
- **计算属性**: 复杂计算是否用 `computed` 而非方法（避免重复计算）
- **v-once**: 静态内容是否标记 `v-once`
- **大列表**: 长列表是否有虚拟滚动
- **图片**: 是否懒加载，是否使用合适尺寸
- **watch**: 是否有不必要的 deep watch（用 computed 替代）
- **内存泄漏**: 组件销毁时是否清除定时器、解绑事件、取消未完成请求
- **响应式数据**: Vue3 是否合理使用 `ref` vs `reactive`，是否避免解构 reactive 对象

### 4. Best Practices（最佳实践）

- **组件拆分**: 单个 SFC 是否超过 300 行（建议拆分）
- **Props 定义**: 是否定义 props 类型和默认值
- **Emits**: 是否声明 emits（Vue3 必须，Vue2 建议）
- **状态管理**: 全局状态是否放 Vuex/Pinia，组件状态是否合理
- **TypeScript**: Vue3 项目是否使用 TypeScript，类型是否完整
- **CSS 作用域**: 组件样式是否使用 `scoped` 或 CSS Modules
- **错误处理**: API 调用是否统一错误处理（axios interceptor）
- **环境变量**: 不同环境配置是否使用 `.env` 文件
- **API 封装**: 是否统一封装 API 请求，避免组件内直接写 axios 调用

## Workflow

1. 检测 Vue 版本和项目结构
2. 确定审计范围
3. 读取目标代码文件
4. 按 4 个维度逐项检查
5. 输出审计报告

## Output Format

```
## Vue/JS 代码审计报告

**审计范围**: [文件/目录]
**Vue 版本**: [2/3]
**审计时间**: [日期]

### 摘要
- 🔴 严重问题: X 个
- 🟡 警告: X 个
- 🟢 建议: X 个

### 🔴 严重问题
1. **[类别] 文件名:行号** — 问题描述
   - 影响: ...
   - 修复建议: ...

### 🟡 警告
...

### 🟢 建议
...

### 代码风格统计
| 检查项 | 状态 |
|--------|------|
| 缩进统一 (2空格) | ✅/❌ |
| 单引号 | ✅/❌ |
| 无分号 | ✅/❌ |
| ...
```

## References

- `references/vue-style-rules.md` — 详细代码风格规则
- `references/vue-security-checklist.md` — 安全检查清单
