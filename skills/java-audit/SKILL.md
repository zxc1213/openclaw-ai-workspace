---
name: java-audit
description: Audit Java SpringBoot/SpringCloud code for style violations, security issues, performance problems, and best practices. Use when asked to review, audit, check, or inspect Java backend code. Triggers on phrases like "audit this Java code", "review the backend", "check for code smells", "code review Java", "审计 Java 代码", "检查后端代码", "代码审查 Java".
---

# Java Code Auditor

Audit Java code against team standards, security best practices, and common anti-patterns.

## Audit Dimensions

Run all dimensions unless user specifies a subset. Report findings grouped by severity: 🔴 Critical / 🟡 Warning / 🟢 Suggestion.

### 1. Code Style (对照团队规范)

Check the following against `references/java-style-rules.md`:

- **缩进**: Java 用 4 空格，不混用 Tab
- **大括号**: 左大括号不换行（K&R style），if/for/while/do 必须有大括号
- **行宽**: 不超过 120 字符
- **import**: 无通配符 import（`import java.util.*`），无未使用 import，顺序：java → javax → 第三方 → 项目内
- **空行**: 类声明后 1 空行，方法之间 1 空行，逻辑块之间合理空行
- **命名**: 类大驼峰，方法/变量小驼峰，常量全大写下划线，包名全小写
- **编码**: 文件 UTF-8，换行符 LF

### 2. Security（安全审计）

Check against `references/java-security-checklist.md`:

- **SQL 注入**: 检查是否使用参数化查询（PreparedStatement / JPA 参数绑定），禁止字符串拼接 SQL
- **XSS**: 检查输出是否转义，特别是 `@ResponseBody` 返回的用户输入
- **敏感数据**: 密码明文禁止硬编码（检查 `password=` / `secret=` / `key=` 等字符串），应走配置中心或环境变量
- **日志脱敏**: 敏感信息（手机号、身份证、密码）写入日志前是否脱敏
- **权限校验**: 接口是否有 `@PreAuthorize` / `@Secured` / 手动权限检查
- **文件上传**: 是否校验文件类型、大小，路径是否防止目录穿越
- **反序列化**: 是否使用不安全的 `ObjectInputStream`，Jackson 是否启用类型过滤
- **HTTP 调用**: 是否信任所有证书，是否验证响应数据

### 3. Performance（性能审计）

- **N+1 查询**: 循环内调用数据库查询，应改用批量查询 / JOIN
- **大事务**: `@Transactional` 方法内是否有远程调用、文件操作等耗时操作
- **索引缺失**: WHERE 条件字段是否有索引（需结合 DDL 判断）
- **缓存使用**: 高频查询是否有缓存，缓存是否设过期时间
- **集合初始化**: `ArrayList` / `HashMap` 是否指定初始容量（已知大小时）
- **String 拼接**: 循环内是否用 `+` 拼接（应用 StringBuilder）
- **Stream 滥用**: 简单操作是否过度使用 Stream（3 个以内元素直接 for 循环更清晰）
- **分页**: 查询是否支持分页，是否有全表查询风险

### 4. Best Practices（最佳实践）

- **异常处理**: 不捕获 Exception 后空处理（空的 catch 块），异常信息应有意义
- **返回值统一**: 是否使用统一的 Response 包装类
- **DTO/VO 分层**: Controller 参数是否使用 DTO，返回是否使用 VO，避免直接暴露 Entity
- **魔法值**: 是否有未定义为常量的魔法数字/字符串
- **方法长度**: 单个方法是否超过 80 行（建议拆分）
- **类职责**: 单个类是否超过 500 行（建议拆分）
- **注释**: 复杂逻辑是否有注释，公共 API 是否有 Javadoc
- **Lombok**: 是否合理使用 `@Data` / `@Builder` / `@Slf4j`，避免在 Entity 上使用 `@Data`（应使用 `@Getter` `@Setter`）
- **Optional**: 是否正确使用 Optional，避免 `get()` 无检查调用

## Workflow

1. 确定审计范围（文件/目录/整个项目）
2. 读取目标代码文件
3. 按 4 个维度逐项检查
4. 输出审计报告，格式见下方

## Output Format

```
## Java 代码审计报告

**审计范围**: [文件/目录]
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
| 缩进统一 | ✅/❌ |
| 大括号规范 | ✅/❌ |
| ...
```

## References

- `references/java-style-rules.md` — 详细代码风格规则
- `references/java-security-checklist.md` — 安全检查清单
