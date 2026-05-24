# Security Rules

## 提交前强制检查

每次 commit 前必须通过以下 checklist：
- [ ] 无硬编码 secrets（API keys, passwords, tokens）
- [ ] 所有用户输入已验证
- [ ] SQL 参数化查询（防注入）
- [ ] HTML 已转义（防 XSS）
- [ ] CSRF 保护已启用
- [ ] 认证/授权已验证
- [ ] 限流已配置
- [ ] 错误信息不泄露敏感数据

## Secret 管理

- **禁止**在源码中硬编码 secrets
- 使用环境变量或 secret manager
- 启动时验证必需的 secrets 是否存在
- 暴露的 secrets 必须轮换

## 配置保护（Config Protection）⭐

**不修改 lint/formatter/类型检查的配置文件来让代码通过**。

错误做法：放宽 ESLint 规则、关闭 TypeScript strict、降低覆盖率阈值
正确做法：修改代码来满足规则

受保护文件（修改前需要用户确认）：
- `.eslintrc*`, `.prettierrc*`, `tsconfig.json`
- `biome.json`, `eslint.config.*`
- 任何 CI 配置中的质量门禁设置

## 安全事件响应

发现安全问题后：
1. **立即停止**当前操作
2. 通知用户
3. 修复 CRITICAL 问题后再继续
4. 轮换已暴露的 secrets
5. 全库排查类似问题
