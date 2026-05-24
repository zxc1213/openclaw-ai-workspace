# Java 安全检查清单

## 输入验证

- [ ] 所有外部输入（HTTP 参数、请求体、Path 参数）都做了校验
- [ ] 使用 `@Valid` / `@Validated` 进行参数校验
- [ ] 数值型参数有上下限校验（`@Min`, `@Max`, `@Size`）
- [ ] 字符串参数有长度限制
- [ ] 枚举参数有合法性校验

## SQL 注入

- [ ] 使用 JPA/MyBatis 参数绑定，禁止字符串拼接 SQL
- [ ] MyBatis 使用 `#{}` 而非 `${}`（`${}` 用于动态表名等，必须白名单校验）
- [ ] LIKE 查询使用参数绑定而非字符串拼接

## XSS 防护

- [ ] API 返回的用户输入数据已转义
- [ ] 富文本内容使用白名单过滤（如 OWASP Java HTML Sanitizer）
- [ ] Content-Type 设置正确（`application/json` 而非 `text/html`）
- [ ] 响应头包含安全相关设置（X-Content-Type-Options, X-Frame-Options 等）

## 认证与授权

- [ ] 敏感接口有权限注解（`@PreAuthorize` / `@Secured`）
- [ ] 资源操作校验归属权（不能操作别人的数据）
- [ ] Token/Session 有过期机制
- [ ] 登录接口有频率限制（防暴力破解）
- [ ] 密码传输使用 HTTPS

## 敏感数据保护

- [ ] 密码使用 BCrypt/Argon2 加密存储，禁止明文
- [ ] 配置文件中不硬编码密码/密钥（使用环境变量或配置中心）
- [ ] 日志中不打印密码、token、身份证号等敏感信息
- [ ] 数据库查询结果不返回敏感字段（密码、密钥）
- [ ] API 响应中脱敏处理（手机号 `138****1234`、身份证）

## 文件操作

- [ ] 文件上传校验类型（白名单扩展名 + Magic Number）
- [ ] 文件上传限制大小
- [ ] 文件存储路径不可控（防止目录穿越 `../`）
- [ ] 文件名使用 UUID 重命名，不使用用户原始文件名

## HTTP 调用

- [ ] 不禁用 SSL 证书验证（`TrustAllStrategy` 禁用）
- [ ] 外部 API 响应数据做校验（不能直接信任）
- [ ] HTTP 调用设置超时（连接超时 + 读取超时）
- [ ] 不在 URL 中传递敏感参数（token、密码）

## 序列化

- [ ] Jackson 未启用 `enableDefaultTyping`（防止反序列化漏洞）
- [ ] `@JsonIgnore` 标记敏感字段
- [ ] 禁止使用 `ObjectInputStream` 反序列化不可信数据

## 依赖安全

- [ ] 定期检查依赖漏洞（`mvn dependency:tree` + OWASP Dependency-Check）
- [ ] 不使用已停止维护的依赖
- [ ] 依赖版本锁定（不使用 SNAPSHOT / RELEASE）
