# Spring Cloud 微服务 K8s 配置外部化改造指南

> 适用项目：Spring Boot 2.x + Spring Cloud 微服务架构，需迁移到 K8s 的场景

## 改造目标

将散落在多个 profile yml 文件中的配置合并为单一 `application.yml`，敏感值通过环境变量占位符注入，支持 IDE 开发 / 命令行打包 / K8s 部署三种启动方式。

---

## 改造步骤

### 第一步：分析现有配置

1. 列出所有服务的 `config/application*.yml` 文件
2. 分类：
   - **静态配置**：端口号、mybatis mapper-locations、druid 连接池参数、hystrix/ribbon 超时、feign 配置 → 留在 yml 里
   - **非敏感环境配置**：数据库 URL、Redis/RabbitMQ host、Eureka 地址 → ConfigMap 或 .env
   - **敏感配置**：数据库密码、Redis/RabbitMQ 密码、jasypt 密钥、SM2 私钥、第三方 API Key → Secret 或 .env

### 第二步：合并 yml 为单文件

将每个服务的多个 profile 文件合并为 `config/application.yml`：
- 删除 `application-pro-*.yml`、`application-test-*.yml` 等所有 profile 文件
- 删除 `profiles.group` 配置（不再需要）
- 所有敏感值替换为 `${ENV_VAR:默认值}` 格式
- 保留静态配置（druid pool、mybatis、hystrix/ribbon）直接写在 yml 里

### 第三步：创建 .env 三件套

每个服务目录下：
- `.env.example` — 空值模板（提交 git，给同事参考）
- `.env.test` — 本地开发实际值（gitignore 掉）
- `.env.ali` — 生产环境实际值（gitignore 掉）

### 第四步：生成 K8s yaml

在项目 `k8s/` 目录下：

**共用配置（所有服务共享）：**
- `common-secret.yaml` — jasypt 密钥、SM2 密钥对、数据库 ENC 密码、Redis/RabbitMQ 密码
- `common-configmap.yaml` — 数据库 URL、Redis/RabbitMQ/Eureka 地址

**服务特有配置：**
- `communication-secret.yaml` — mail/ftp/sms/tencept/wechat 密钥
- `file-secret.yaml` — OSS accessKeySecret
- `oss-configmap.yaml` — OSS endpoint/bucket
- `homeSearch-configmap.yaml` — Elasticsearch URIs

**Deployment：**
- `services-deployment.yaml` — 所有业务服务合并
- `gateway-deployment.yaml` — 网关（纯静态路由，只需 common config）
- `eureka-deployment.yaml` — 注册中心

### 第五步：.gitignore 更新

```gitignore
# 环境变量（含敏感信息）
**/.env.test
**/.env.ali
```

---

## 环境变量命名规范

| 配置项 | 环境变量名 |
|--------|-----------|
| 数据库主连接 URL | `DATASOURCE_MAIN_URL` |
| 数据库主用户名 | `DATASOURCE_MAIN_USERNAME` |
| 数据库主密码 | `DATASOURCE_MAIN_PASSWORD` |
| 数据库华录连接 URL | `DATASOURCE_HUALU_URL` |
| Redis 主机 | `REDIS_HOST` |
| Redis 端口 | `REDIS_PORT` |
| Redis 密码 | `REDIS_PASSWORD` |
| RabbitMQ 主机 | `RABBITMQ_HOST` |
| RabbitMQ 用户名 | `RABBITMQ_USERNAME` |
| RabbitMQ 密码 | `RABBITMQ_PASSWORD` |
| Jasypt 密钥 | `JASYPT_ENCRYPTOR_PASSWORD` |
| SM2 公钥 | `SM2_PUBLICKEY` |
| SM2 私钥 | `SM2_PRIVATEKEY` |
| Eureka 地址 | `EUREKA_URL` |
| 邮件密码 | `MAIL_PASSWORD` |
| FTP 密码 | `FTP_PASSWORD` |
| 短信 AccessKey | `SMS_ACCESS_KEY_ID` |
| OSS Secret | `OSS_ACCESS_KEY_SECRET` |

**规则**：`大写_下划线`，语义清晰，跟 Spring yml 路径不完全对应（更简洁）。

---

## 三种启动方式

### 1. IDEA 开发
装 **EnvFile** 插件 → Run Configuration → Enable EnvFile → 添加 `.env.test` 文件

### 2. 命令行打包启动
```bash
export $(cat .env.test | xargs) && java -jar target/xxx.jar
```

### 3. K8s 部署
```bash
kubectl apply -f k8s/common-configmap.yaml
kubectl apply -f k8s/common-secret.yaml
kubectl apply -f k8s/services-deployment.yaml
```

---

## 第六步：配置与依赖一致性审查（用 Claude Code 执行）

配置改造完成后，使用 Claude Code 做全面审查，清理多余配置和死代码。

### 审查内容

1. **yml 配置 vs 实际依赖**：检查每个服务的 pom.xml，确认 yml 中配置的中间件确实被依赖
   - 没有 datasource 依赖 → 删除 yml 中的数据库配置
   - 没有 spring-boot-starter-data-redis → 删除 redis 配置
   - 没有 spring-rabbit → 删除 rabbitmq 配置
   - 没有 spring-boot-starter-data-elasticsearch → 删除 es 配置

2. **Java 死代码清理**：
   - 删掉引用不存在 bean 的 `@Configuration` 类（如 `MainDataSourceConfiguration.java` 引用了 `mainSource` 但没有 druid 依赖）
   - 删掉没有对应 Mapper XML 的 Mapper 接口

3. **pom.xml 依赖审查**：
   - 声明了但没实际使用的 starter 依赖

### Claude Code 执行 prompt

```
请对当前项目的所有微服务做配置与依赖一致性审查：

1. 逐个检查每个服务的 pom.xml 依赖，对比其 application.yml 中配置的中间件
2. 如果 yml 中配置了 datasource 但 pom.xml 没有 druid/mybatis/mysql 依赖，从 yml 中删除数据库配置
3. 如果 yml 中配置了 redis 但没有 redis 依赖，删除 redis 配置
4. 如果 yml 中配置了 rabbitmq 但没有 rabbit 依赖，删除 rabbitmq 配置
5. 清理引用不存在 bean 的 Java @Configuration 类（如 MainDataSourceConfiguration 引用了未被创建的 DataSource bean）
6. 检查 pom.xml 中声明了但没实际使用的依赖
7. 每个改动都说明原因
```

---

## 已改造项目

### kczx (科技创新平台) - release/master 分支
- 路径：`/mnt/e/Develop/workspace/IdeaProjects/kczx/java/science-innovation-parent`
- 时间：2026-03-31
- 服务数：13 个（eureka + gateway + 11 业务服务）
- 改造前：每个服务 6-8 个 yml profile 文件，敏感信息散落其中
- 改造后：每个服务 1 个 application.yml + 3 个 .env 文件
- K8s yaml：共用 common-secret/configmap + 服务特有 secret/configmap + 合并 deployment
- 特殊处理：
  - communication 有 mail/ftp/sms/tencept/wechat 5 组第三方密钥
  - file/information/projectManagement 共用 OSS 配置
  - homeSearch 有 Elasticsearch 配置
  - spider 结构不同（无 config/ 子目录，有 mybatis-plus 配置）
  - spider 的 hystrix/ribbon 参数与其他服务不同（MaxAutoRetries=2）
  - test 环境用不同 jasypt 密钥 `comitKc`，.env.test 中保留 ENC() 加密值
  - env 命名：`.env.test`（本地开发）、`.env.ali`（生产）、`.env.example`（模板）
  - 根目录 env/ 汇总目录 + CONFIG-GUIDE.md 使用说明文档

### kczx (科技创新平台) - release/master-hl 分支 ✅
- 路径：同上，release/master-hl 分支
- 时间：2026-03-31
- 与 master 差异：
  - 配置拆分更细（redis/rabbitmq/email/ftp 等独立 profile）
  - file 用华为 OBS 替代阿里 OSS
  - gateway 多一层 gateway-web 目录结构
  - 有独立的 common-hystrix.yml
- 配置审查已完成：
  - 删除 user-oauth 的 MainDataSourceConfiguration.java（无数据库依赖）
  - 删除 file 的 MainDataSourceConfiguration.java（无数据库依赖）
  - 清理 gov/system-config 的 rabbitmq 配置（代码未使用）
  - 清理 user 的 mail/ftp/sms/tencept/wechat 配置（通过 RabbitMQ 委托 communication）
  - 清理 spider 的 mybatis 错误包名和 hualu 数据源

### kczx_qy_lq_server（路桥版） ✅
- 路径：`/mnt/e/Develop/workspace/IdeaProjects/kczx/java/kczx_qy_lq_server`
- 时间：2026-03-31
- 服务数：11 个（无 spider 和 homeSearch）
- 特殊：Redis database=1，生产用 Redis Sentinel 哨兵模式，file 同时有 OSS + OBS

### kczx_qy_js_server（建设/企业版） ✅
- 路径：`/mnt/e/Develop/workspace/IdeaProjects/kczx/java/kczx_qy_js_server`
- 分支：master_hl
- 时间：2026-03-31
- 服务数：11 个（无 spider 和 homeSearch）
- 特殊：file 有 OSS + OBS + COS 三套对象存储，gateway 默认用生产 Eureka 地址

### kczx_hl_server（华录独立版） ✅
- 路径：`/mnt/e/Develop/workspace/IdeaProjects/kczx/java/kczx_hl_server`
- 分支：master-hl-test
- 时间：2026-03-31
- 服务数：11 个（无 spider 和 homeSearch）
- 特殊：数据源命名 DATASOURCE_MAIN_*(kczx_hl) + DATASOURCE_KCZX_*(kczx_dev)，Redis 哨兵 db=3，端口 10210-10220
