# 敏感数据脱敏规则文档

> **版本**: 1.0  
> **更新日期**: 2026-05-03  
> **适用范围**: GitHub 公开仓库同步、文档发布、代码审计  
> **参考来源**: gitleaks (800+ rules)、detect-secrets、trufflehog、现有 `github-sync.sh`

---

## 目录

- [A. 通用规则](#a-通用规则)
  - [A1. API Key / Token](#a1-api-key--token)
  - [A2. 云服务凭证](#a2-云服务凭证)
  - [A3. 数据库凭证](#a3-数据库凭证)
  - [A4. 支付与金融](#a4-支付与金融)
  - [A5. 个人可识别信息 (PII)](#a5-个人可识别信息-pii)
  - [A6. 通信平台 ID](#a6-通信平台-id)
  - [A7. 内部基础设施](#a7-内部基础设施)
  - [A8. 加密与证书](#a8-加密与证书)
  - [A9. 版本控制与 CI/CD](#a9-版本控制与 cicd)
  - [A10. 通用密钥模式](#a10-通用密钥模式)
- [B. 项目特定规则](#b-项目特定规则)
- [C. 风险等级定义](#c-风险等级定义)
- [D. 实施策略](#d-实施策略)

---

## 风险等级定义

| 等级 | 说明 | 处置策略 |
|------|------|----------|
| **P0** | 直接泄露可导致资金损失、账户接管、数据泄露 | 整行删除或替换为占位符，零容忍 |
| **P1** | 泄露可导致服务滥用、信息暴露 | 替换为编造示例值，加 `SANITIZED` 标记 |
| **P2** | 泄露可暴露内部结构、辅助社工攻击 | 替换为通用示例值 |

---

## A. 通用规则

> 适用于任何项目。参考 gitleaks 默认规则集（800+ 条），按类别精选整理。

### A1. API Key / Token

| # | 描述 | 正则模式 | 风险 | 来源 |
|---|------|----------|------|------|
| 1 | Anthropic API Key | `sk-ant-api03-[a-zA-Z0-9_\-]{93}AA` | P0 | gitleaks |
| 2 | Anthropic Admin API Key | `sk-ant-admin01-[a-zA-Z0-9_\-]{93}AA` | P0 | gitleaks |
| 3 | OpenAI API Key | `sk-[a-zA-Z0-9]{20,}T3BlbkFJ[a-zA-Z0-9]{20,}` | P0 | gitleaks |
| 4 | Google AI API Key | `AIza[a-zA-Z0-9_\-]{35}` | P0 | gitleaks |
| 5 | Google OAuth Access Token | `ya29\.[a-zA-Z0-9_-]+` | P0 | gitleaks |
| 6 | GitHub Personal Access Token | `ghp_[a-zA-Z0-9]{36}` | P0 | gitleaks |
| 7 | GitHub OAuth Access Token | `gho_[a-zA-Z0-9]{36}` | P0 | gitleaks |
| 8 | GitHub App Token | `(ghu|ghs)_[a-zA-Z0-9]{36}` | P0 | gitleaks |
| 9 | GitHub Refresh Token | `ghr_[a-zA-Z0-9]{36}` | P0 | gitleaks |
| 10 | GitLab Personal Access Token | `glpat-[a-zA-Z0-9_\-]{20}` | P0 | gitleaks |
| 11 | GitLab OAuth Token | `glptt-[a-zA-Z0-9_\-]{20}` | P0 | gitleaks |
| 12 | GitLab CI/CD Token | `glcid-[a-zA-Z0-9_\-]{20}` | P0 | gitleaks |
| 13 | Slack Bot Token | `xoxb-[a-zA-Z0-9-]{10,}` | P0 | gitleaks |
| 14 | Slack User Token | `xoxp-[a-zA-Z0-9-]{10,}` | P0 | gitleaks |
| 15 | Slack App-Level Token | `xapp-[a-zA-Z0-9-]{10,}` | P0 | gitleaks |
| 16 | Stripe API Key (Publishable) | `pk_(test|live)_[a-zA-Z0-9]{24}` | P0 | gitleaks |
| 17 | Stripe API Key (Secret) | `sk_(test|live)_[a-zA-Z0-9]{24}` | P0 | gitleaks |
| 18 | Twilio API Key | `SK[0-9a-fA-F]{32}` | P0 | gitleaks |
| 19 | SendGrid API Key | `SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}` | P0 | gitleaks |
| 20 | Mailgun API Key | `key-[a-zA-Z0-9]{32}` | P0 | gitleaks |
| 21 | Firebase Cloud Messaging Key | `AAAA[a-zA-Z0-9_-]{7}:[a-zA-Z0-9_-]{22}` | P0 | gitleaks |
| 22 | Firebase Custom Token | `[a-zA-Z0-9_-]{100,}` (JWT-like) | P0 | gitleaks |
| 23 | PubNub Publish Key | `pub-c-[a-zA-Z0-9]{16,}` | P1 | gitleaks |
| 24 | PubNub Subscribe Key | `sub-c-[a-zA-Z0-9]{16,}` | P1 | gitleaks |
| 25 | NuGet API Key | `oy2[a-zA-Z0-9]{43}` | P1 | gitleaks |
| 26 | PyPI API Token | `pypi-AgEIcHJvZHVjdGlvbi4[a-zA-Z0-9_-]{100,}` | P1 | gitleaks |
| 27 | NPM Token | `npm_[a-zA-Z0-9]{36}` | P1 | gitleaks |
| 28 | RubyGems API Key | `rubygems_[a-f0-9]{48}` | P1 | gitleaks |
| 29 | Clojars API Token | `CLOJARS_[a-z0-9]{60}` | P1 | gitleaks |
| 30 | Heroku API Key | `[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}` (in heroku context) | P1 | gitleaks |
| 31 | Vercel Token | `vercel_[a-zA-Z0-9]{24}` | P1 | gitleaks |
| 32 | Netlify Access Token | `nfp_[a-zA-Z0-9]{36}` | P1 | gitleaks |
| 33 | 1Password Service Account Token | `ops_eyJ[a-zA-Z0-9+/]{250,}` | P0 | gitleaks |
| 34 | 1Password Secret Key | `A3-[A-Z0-9]{6}-(?:[A-Z0-9]{11}|[A-Z0-9]{6}-[A-Z0-9]{5})-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}` | P0 | gitleaks |
| 35 | Airtable Personal Access Token | `pat[[:alnum:]]{14}\.[a-f0-9]{64}` | P1 | gitleaks |
| 36 | Adafruit API Key | `(?i)adafruit[^\n]{0,50}?[a-z0-9_-]{32}` | P1 | gitleaks |
| 37 | Asana Client Secret | `(?i)asana[^\n]{0,50}?[a-z0-9]{32}` | P1 | gitleaks |
| 38 | Atlassian API Token | `ATATT3[A-Za-z0-9_\-]{186}` | P0 | gitleaks |
| 39 | Databricks API Token | `dapi[a-f0-9]{32}(?:-\d)?` | P0 | gitleaks |
| 40 | Datadog Access Token | `(?i)datadog[^\n]{0,50}?[a-z0-9]{40}` | P1 | gitleaks |
| 41 | Cohere API Token | `(?i)(?:cohere|CO_API_KEY)[^\n]{0,50}?[a-zA-Z0-9]{40}` | P1 | gitleaks |
| 42 | Beamer API Token | `b_[a-z0-9=_\-]{44}` | P1 | gitleaks |
| 43 | Firecrawl API Key | `fc-[a-f0-9]{32}` | P0 | 自定义 |
| 44 | Tavily API Key | `tvly-[a-zA-Z0-9\-_]{50,}` | P0 | 自定义 |

### A2. 云服务凭证

| # | 描述 | 正则模式 | 风险 | 来源 |
|---|------|----------|------|------|
| 1 | AWS Access Key ID | `(?:A3T[A-Z0-9]\|AKIA\|ASIA\|ABIA\|ACCA)[A-Z2-7]{16}` | P0 | gitleaks |
| 2 | AWS Secret Access Key | 40-char base64-like string following AKIA prefix | P0 | gitleaks |
| 3 | AWS Session Token | `ASIA[A-Z0-9]{16}` + long session string | P0 | gitleaks |
| 4 | Alibaba Cloud AccessKey ID | `LTAI[a-zA-Z0-9]{20}` | P0 | gitleaks |
| 5 | Alibaba Cloud Secret Key | `(?i)alibaba[^\n]{0,50}?[a-z0-9]{30}` | P0 | gitleaks |
| 6 | Azure AD Client Secret | `[a-zA-Z0-9_~.]{3}\dQ~[a-zA-Z0-9_~.-]{31,34}` | P0 | gitleaks |
| 7 | Azure Connection String | `AccountEndpoint=https://[a-z0-9]+\.documents\.azure\.com:443/;` | P0 | gitleaks |
| 8 | Azure Storage Account Key | `DefaultEndpointsProtocol=https;AccountName=[a-z0-9]+;AccountKey=[a-zA-Z0-9+/=]{88}` | P0 | gitleaks |
| 9 | Google Cloud API Key | `AIza[a-zA-Z0-9_\-]{35}` | P0 | gitleaks |
| 10 | Google Cloud Service Account (JSON) | `"type":\s*"service_account"` (含 `private_key`) | P0 | gitleaks |
| 11 | Google Cloud OAuth Token | `ya29\.[a-zA-Z0-9_-]+` | P0 | gitleaks |
| 12 | DigitalOcean Access Token | `dop_v1_[a-f0-9]{64}` | P0 | gitleaks |
| 13 | DigitalOcean Refresh Token | `dopr_v1_[a-f0-9]{64}` | P0 | gitleaks |
| 14 | Oracle Cloud Infrastructure Key | `[a-f0-9]{32}/[a-f0-9]{32}/[a-f0-9]{32}` | P0 | gitleaks |
| 15 | Tencent Cloud SecretId | `AKID[a-zA-Z0-9]{32,}` | P0 | 自定义 |
| 16 | Huawei Cloud Access Key | `AKDE[a-zA-Z0-9]{32,}` | P0 | 自定义 |

### A3. 数据库凭证

| # | 描述 | 正则模式 | 风险 | 来源 |
|---|------|----------|------|------|
| 1 | MongoDB Connection URI | `mongodb(?:\+srv)?://[^:]+:[^@]+@[a-zA-Z0-9.-]+` | P0 | 通用 |
| 2 | MySQL Connection String | `mysql://[^:****@]+@[a-zA-Z0-9.-]+` | P0 | 通用 |
| 3 | PostgreSQL Connection String | `postgres(?:ql)?://[^:]+:[^@]+@[a-zA-Z0-9.-]+` | P0 | 通用 |
| 4 | Redis Connection URI | `redis://(?:****@]+@[a-zA-Z0-9.-]+` | P0 | 通用 |
| 5 | Database URL (generic) | `(?:DB|DATABASE)_URL\s*=\s*['"][^'"]+:\/\/[^:]+:[^@]+@` | P0 | 通用 |
| 6 | JDBC Connection String | `jdbc:(?:mysql|postgresql|oracle|sqlserver)://[^:]+:[^@]+@` | P0 | 通用 |
| 7 | ClickHouse Cloud API Secret | `4b1d[A-Za-z0-9]{38}` | P1 | gitleaks |
| 8 | Supabase Service Role Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3Mi[^\"]+` (service_role) | P0 | 通用 |
| 9 | PlanetScale Password | `pscale_pw_[a-zA-Z0-9_\-]{30,}` | P0 | gitleaks |
| 10 | CouchDB Admin Password | `(?i)couchdb[^\n]{0,50}?password['":\s=]+[^\s'"`,;]{8,}` | P0 | gitleaks |

### A4. 支付与金融

| # | 描述 | 正则模式 | 风险 | 来源 |
|---|------|----------|------|------|
| 1 | Stripe Secret Key | `sk_(test\|live)_[a-zA-Z0-9]{24}` | P0 | gitleaks |
| 2 | Stripe Publishable Key | `pk_(test\|live)_[a-zA-Z0-9]{24}` | P1 | gitleaks |
| 3 | Stripe Restricted Key | `rk_(test\|live)_[a-zA-Z0-9]{24}` | P0 | gitleaks |
| 4 | PayPal Braintree Token | `access_token\$[a-f0-9]{16}\$[a-f0-9]{22}` | P0 | gitleaks |
| 5 | Coinbase Access Token | `(?i)coinbase[^\n]{0,50}?[a-z0-9_-]{64}` | P0 | gitleaks |
| 6 | Bittrex Access Key | `(?i)bittrex[^\n]{0,50}?[a-z0-9]{32}` | P0 | gitleaks |
| 7 | 信用卡号 (Visa) | `4[0-9]{12}(?:[0-9]{3})?` | P0 | PCI-DSS |
| 8 | 信用卡号 (MasterCard) | `5[1-5][0-9]{14}` | P0 | PCI-DSS |
| 9 | 信用卡号 (Amex) | `3[47][0-9]{13}` | P0 | PCI-DSS |
| 10 | 信用卡号 (UnionPay) | `62[0-9]{14,17}` | P0 | PCI-DSS |
| 11 | SWIFT Code | `[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?` | P2 | 通用 |
| 12 | 银行卡号 (中国) | `6[0-9]{15,19}` | P0 | 通用 |

### A5. 个人可识别信息 (PII)

| # | 描述 | 正则模式 | 风险 | 来源 |
|---|------|----------|------|------|
| 1 | 邮箱地址 | `[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}` | P2 | 通用 |
| 2 | 中国手机号 | `1[3-9]\d{9}` | P2 | 通用 |
| 3 | 中国身份证号 | `[1-9]\d{5}(?:19\|20)\d{2}(?:0[1-9]\|1[0-2])(?:0[1-9]\|[12]\d\|3[01])\d{3}[\dXx]` | P0 | 通用 |
| 4 | 中国护照号 | `[EeKkGgDdSsPpHh]\d{8}` | P2 | 通用 |
| 5 | IPv4 私有地址 | `(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3})\|(?:172\.(?:1[6-9]\|2\d\|3[01])\.\d{1,3}\.\d{1,3})\|(?:192\.168\.\d{1,3}\.\d{1,3})` | P2 | 通用 |
| 6 | SSH 私钥 | `-----BEGIN (?:RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----` | P0 | gitleaks |
| 7 | SSH 私钥 (PEM) | `-----BEGIN PRIVATE KEY-----` | P0 | 通用 |
| 8 | PGP 私钥 | `-----BEGIN PGP PRIVATE KEY BLOCK-----` | P0 | gitleaks |
| 9 | JWT Token | `eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+` | P1 | 通用 |
| 10 | Google OAuth Token | `ya29\.[a-zA-Z0-9_-]+` | P0 | gitleaks |

### A6. 通信平台 ID

| # | 描述 | 正则模式 | 风险 | 来源 |
|---|------|----------|------|------|
| 1 | Telegram Bot Token | `[0-9]{8,10}:[a-zA-Z0-9_-]{35}` | P0 | gitleaks |
| 2 | Telegram User ID | `[0-9]{8,12}` (在 telegram 上下文中) | P2 | 自定义 |
| 3 | Discord Bot Token | `[MN][a-zA-Z0-9_-]{23,}\.[a-zA-Z0-9_-]{6}\.[a-zA-Z0-9_-]{27}` | P0 | gitleaks |
| 4 | Discord Client Secret | `[a-f0-9]{32}` (在 discord 上下文中) | P0 | gitleaks |
| 5 | Slack Webhook URL | `https://hooks\.slack\.com/services/T[A-Z0-9]+/B[A-Z0-9]+/[a-zA-Z0-9]+` | P0 | gitleaks |
| 6 | Slack Signing Secret | `[a-f0-9]{32}` (在 slack_signing_secret 上下文中) | P0 | gitleaks |
| 7 | 飞书 open_id | `ou_[a-f0-9]{28}` | P2 | 自定义 |
| 8 | 飞书 chat_id | `oc_[a-f0-9]{20,}` | P2 | 自定义 |
| 9 | 飞书 app_id | `cli_[a-f0-9]{20,}` | P2 | 自定义 |
| 10 | 飞书 space_id | 19 位数字 | P2 | 自定义 |
| 11 | 企业微信 Secret | `[a-zA-Z0-9]{32}` (在 wecom/企业微信 上下文中) | P0 | 通用 |
| 12 | 企业微信 CorpID | `[a-zA-Z0-9]{18}` (在 wecom 上下文中) | P1 | 通用 |
| 13 | QQ AppID | 10 位数字 | P2 | 自定义 |
| 14 | 微信 AppSecret | `[a-f0-9]{32}` (在 wechat 上下文中) | P0 | 通用 |

### A7. 内部基础设施

| # | 描述 | 正则模式 | 风险 | 来源 |
|---|------|----------|------|------|
| 1 | 内网 IP 地址 | `(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3})\|(?:172\.(?:1[6-9]\|2\d\|3[01])\.\d{1,3}\.\d{1,3})\|(?:192\.168\.\d{1,3}\.\d{1,3})\|(?:172\.25\.\d{1,3}\.\d{1,3})` | P2 | 自定义 |
| 2 | WSL2 特殊 IP | `172\.25\.192\.\d{1,3}` | P2 | 自定义 |
| 3 | 非标准服务端口 | 单独出现的 5 位数端口号（需上下文判断） | P2 | 自定义 |
| 4 | 代理端口 | `(?:8080\|8081\|7890)` (在 proxy/clash 上下文中) | P2 | 自定义 |
| 5 | 数据库端口 | `(?:3306\|5432\|6379\|27017\|1433\|1521)` (裸端口暴露) | P2 | 自定义 |
| 6 | 域名 / Hostname | `(?i)[a-z0-9][-a-z0-9]*(?:\.[a-z]{2,}){1,}` (内部域名) | P2 | 通用 |
| 7 | 内部服务 URL | `https?://(?:localhost\|127\.0\.0\.1\|0\.0\.0\.0\|10\.\d+\.\d+\.\d+):[0-9]+` | P2 | 通用 |
| 8 | VPN / 隧道地址 | `(?:tunnel|vpn|wireguard|tailscale)[^\n]{0,50}?[a-zA-Z0-9.-]+` | P2 | 通用 |
| 9 | 服务器主机名 | `(?:prod|staging|dev|test)-(?:web|api|db|cache|worker)-[0-9]+` | P2 | 通用 |
| 10 | Docker Registry | `(?:ghcr\.io\|gcr\.io\|quay\.io\|registry\.[a-z]+\.amazonaws\.com)/[a-z]+/[a-z-]+` | P2 | 通用 |

### A8. 加密与证书

| # | 描述 | 正则模式 | 风险 | 来源 |
|---|------|----------|------|------|
| 1 | RSA 私钥 | `-----BEGIN RSA PRIVATE KEY-----` | P0 | gitleaks |
| 2 | EC 私钥 | `-----BEGIN EC PRIVATE KEY-----` | P0 | gitleaks |
| 3 | OPENSSH 私钥 | `-----BEGIN OPENSSH PRIVATE KEY-----` | P0 | gitleaks |
| 4 | PKCS8 私钥 | `-----BEGIN PRIVATE KEY-----` | P0 | gitleaks |
| 5 | DSA 私钥 | `-----BEGIN DSA PRIVATE KEY-----` | P0 | gitleaks |
| 6 | PGP 私钥 | `-----BEGIN PGP PRIVATE KEY BLOCK-----` | P0 | gitleaks |
| 7 | Age 加密私钥 | `AGE-SECRET-KEY-1[QPZRY9X8GF2TVDW0S3JN54KHCE6MUA7L]{58}` | P0 | gitleaks |
| 8 | Cloudflare Origin CA Key | `v1\.0-[a-f0-9]{24}-[a-f0-9]{146}` | P0 | gitleaks |
| 9 | 证书指纹 (SHA256) | `(?i)sha256[^\n]{0,10}?[a-f0-9]{64}` | P2 | 通用 |
| 10 | PKCS12 密码 | `(?i)pkcs12[^\n]{0,50}?password['":\s=]+[^\s'"`,;]{8,}` | P0 | gitleaks |

### A9. 版本控制与 CI/CD

| # | 描述 | 正则模式 | 风险 | 来源 |
|---|------|----------|------|------|
| 1 | GitHub PAT | `ghp_[a-zA-Z0-9]{36}` | P0 | gitleaks |
| 2 | GitHub OAuth | `gho_[a-zA-Z0-9]{36}` | P0 | gitleaks |
| 3 | GitHub App Token | `(ghu\|ghs)_[a-zA-Z0-9]{36}` | P0 | gitleaks |
| 4 | GitHub Refresh Token | `ghr_[a-zA-Z0-9]{36}` | P0 | gitleaks |
| 5 | GitLab PAT | `glpat-[a-zA-Z0-9_\-]{20}` | P0 | gitleaks |
| 6 | GitLab Trigger Token | `glptt-[a-zA-Z0-9_\-]{20}` | P0 | gitleaks |
| 7 | Bitbucket Client Secret | `(?i)bitbucket[^\n]{0,50}?[a-z0-9=_\-]{64}` | P0 | gitleaks |
| 8 | Jenkins Credential | `(?i)jenkins[^\n]{0,50}?password['":\s=]+[^\s'"`,;]{8,}` | P0 | 通用 |
| 9 | CircleCI Token | `[a-f0-9]{40}` (在 CIRCLECI 上下文中) | P0 | gitleaks |
| 10 | Travis CI Token | `(?i)travis[^\n]{0,50}?[a-zA-Z0-9]{20,}` | P1 | gitleaks |
| 11 | Codecov Token | `(?i)codecov[^\n]{0,50}?[a-z0-9]{32}` | P1 | gitleaks |
| 12 | SonarQube Token | `(?i)sonar[^\n]{0,50}?[a-f0-9]{40}` | P1 | gitleaks |
| 13 | npm Token | `npm_[a-zA-Z0-9]{36}` | P1 | gitleaks |
| 14 | PyPI Token | `pypi-AgEIcHJvZHVjdGlvbi4[a-zA-Z0-9_-]{100,}` | P1 | gitleaks |
| 15 | Docker Hub Token | `(?i)docker[^\n]{0,50}?-p [a-zA-Z0-9]{20,}` | P0 | gitleaks |

### A10. 通用密钥模式

| # | 描述 | 正则模式 | 风险 | 来源 |
|---|------|----------|------|------|
| 2 | 密码行 (passwd:) | `(?i)passwd['":\s]*[^\s'"`,;]{8,}` (排除占位符) | P0 | 自定义 |
| 3 | 密码行 (secret:) | `(?i)secret['":\s]*[^\s'"`,;]{8,}` (排除占位符) | P0 | 自定义 |
| 4 | 密码行 (token:) | `(?i)token['":\s]*[^\s'"`,;]{8,}` (排除占位符) | P0 | 自定义 |
| 5 | 密码行 (api_key:) | `(?i)api[_-]?key['":\s]*[^\s'"`,;]{8,}` (排除占位符) | P0 | 自定义 |
| 6 | Authorization Bearer | `Authorization:\s*Bearer\s+[a-zA-Z0-9_\-\.]+` | P0 | 通用 |
| 7 | Authorization Basic | `Authorization:\s*Basic\s+[a-zA-Z0-9+/]+=*` | P0 | 通用 |
| 8 | curl 中的 Auth Header | `curl.*-H.*Authorization` | P0 | gitleaks |
| 9 | curl 中的 -u 参数 | `curl.*-u.*:[^\s]+` | P0 | gitleaks |
| 10 | 环境变量中的密钥 | `(?:export\s+)?(?:PASSWORD|SECRET|TOKEN|API_KEY|PRIVATE_KEY)\s*=\s*['\"]?[^\s'\"$]{8,}` | P0 | 通用 |
| 11 | 高熵字符串 (32+字符) | `['\"][a-zA-Z0-9+/=_\-]{32,}['\"]` (结合熵值检测) | P1 | detect-secrets |
| 12 | Base64 编码的密钥 | `[A-Za-z0-9+/]{40,}={0,2}` (结合上下文) | P1 | 通用 |
| 13 | GUID/UUID | `[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}` | P2 | 通用 |
| 14 | Hex 密钥 (40字符) | `[a-f0-9]{40}` (结合关键词上下文) | P1 | 通用 |
| 15 | Hex 密钥 (64字符) | `[a-f0-9]{64}` (结合关键词上下文) | P1 | 通用 |

---

## B. 项目特定规则

> 以下规则针对当前项目 (`openclaw-ai-workspace`) 的真实值。所有真实值在同步到公开仓库时必须替换。
> **格式**: 真实值 → 替换值（占位符）

### B1. API Key

| # | 描述 | 真实值模式 | 替换为 | 风险 |
|---|------|-----------|--------|------|
| 1 | Firecrawl API Key | `fc-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` | `fc-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` | P0 |
| 2 | Tavily API Key | `tvly-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` | `tvly-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` | P0 |

### B2. 网络地址

| # | 描述 | 真实值模式 | 替换为 | 风险 |
|---|------|-----------|--------|------|
| 1 | WSL2 Host IP (Windows) | `192.168.1.100` | `192.168.1.100` | P2 |
| 2 | WSL2 Guest IP (Linux) | `192.168.1.101` | `192.168.1.101` | P2 |

### B3. 飞书标识符

| # | 描述 | 真实值模式 | 替换为 | 风险 |
|---|------|-----------|--------|------|
| 1 | 知识空间 ID (space_id) | `7600000000000000000` | `7600000000000000000` | P2 |
| 2 | 备用空间 ID | `7600000000000000000` | `7600000000000000000` | P2 |
| 3 | 用户 open_id | `ou_aabbccddeeff00112233445566778899` | `ou_aabbccddeeff00112233445566778899` | P2 |
| 4 | 群聊 chat_id (oc_前缀) | `oc_[a-f0-9]{20,}` | `oc_aabbccddeeff00112233` | P2 |
| 5 | 应用 app_id (cli_前缀) | `cli_[a-f0-9]{20,}` | `cli_aabbccddeeff00112233` | P2 |
| 6 | 任务 GUID (UUID格式) | `[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}` | `aabbccdd-eeee-ffff-gggg-hhhhiiiiiiii` | P2 |

### B4. 端口号

| # | 描述 | 真实值 | 替换为 | 风险 |
|---|------|--------|--------|------|
| 1 | OpenClaw 服务端口 | `18080` | `18080` | P2 |
| 2 | HTTP 代理端口 | `8080` | `8080` | P2 |
| 3 | SOCKS5 代理端口 | `8081` | `8081` | P2 |
| 4 | OpenViking 端口 | `:9333` | `:9333` | P2 |
| 5 | Mixed 代理端口 | `7890` | 保持不变（Clash 默认，过于常见） | P2 |

### B5. 第三方平台 ID

| # | 描述 | 真实值 | 替换为 | 风险 |
|---|------|--------|--------|------|
| 1 | Telegram 用户 ID | `1234567890` | `1234567890` | P2 |
| 2 | QQ AppId #1 | `1000000001` | `1000000001` | P2 |
| 3 | QQ AppId #2 | `1000000002` | `1000000002` | P2 |
| 4 | QQ AppId #3 | `1000000003` | `1000000003` | P2 |

### B6. 密码行

| # | 描述 | 模式 | 处置 | 风险 |
|---|------|------|------|------|

---

## C. 风险等级定义

| 等级 | 说明 | 处置策略 | 示例 |
|------|------|----------|------|
| **P0** | 直接泄露可导致：资金损失、账户接管、数据泄露、服务入侵 | **整行删除**或**替换为占位符**，零容忍 | API Key、数据库密码、私钥、身份证号 |
| **P1** | 泄露可导致：服务滥用、信息暴露、辅助攻击 | **替换为编造示例值**，加 `SANITIZED` 标记 | 环境变量中的 token、通信平台 ID |
| **P2** | 泄露可导致：暴露内部结构、辅助社工攻击、端口探测 | **替换为通用示例值**，保留结构 | IP 地址、端口号、GUID、域名 |

### 风险等级判断流程

```
是否涉及金融/支付？ → P0
是否可直接用于认证/授权？ → P0
是否可导致数据泄露（数据库凭证）？ → P0
是否可辅助社工（PII、内部地址）？ → P2
其他 → P1
```

---

## D. 实施策略

### D1. 当前实施方式

在 `scripts/github-sync.sh` 的 `sanitize_repo()` 函数中，使用 `sed` 进行文本替换：

```bash
# 策略1: 整行删除（密码行）
sed -i '/pattern/d' "$f"

# 策略2: 值替换（IP、端口、ID）
sed -i 's/real_value/fake_value/g' "$f"

# 策略3: 模式替换（所有匹配）
sed -i 's/pattern/replacement/g' "$f"
```

### D2. 文件处理范围

| 文件类型 | 处理方式 |
|----------|----------|
| `*.md` (Markdown) | 全部规则适用 |
| `*.sh` (Shell脚本) | 全部规则适用 |
| `*.json` | 仅 P0 规则 |
| `*.yaml` / `*.yml` | 仅 P0 规则 |
| `*.toml` / `*.ini` | 仅 P0 规则 |
| `*.env` / `.env*` | 整文件排除（不入库） |
| 二进制文件 | 跳过 |

### D3. 排除模式（不处理）

以下模式不视为敏感信息：

- 包含 `REDACTED`、`placeholder`、`xxx`、`例`、`示例`、`SANITIZED` 的行
- `.gitignore` / `.env.example` 文件
- 锁文件（`package-lock.json`、`yarn.lock` 等）
- `node_modules/` 内的文件
- 已有的 gitleaks allowlist 路径

### D4. 建议改进

1. **引入 gitleaks 作为 pre-commit hook**：在 `github-sync.sh` 之前运行 `gitleaks detect --no-git`，确保无遗漏
2. **熵值检测**：对 20+ 字符的 base64/hex 字符串计算 Shannon 熵，> 4.0 的标记审查
3. **规则版本管理**：将此文档版本与 gitleaks 规则版本关联，定期同步更新
4. **自动化测试**：添加测试用例，验证每条规则的正则匹配/替换正确性
5. **CI 集成**：在 GitHub Actions 中加入 gitleaks scan，防止敏感信息进入仓库

---

## 附录：工具参考

| 工具 | 规则数量 | 许可证 | 特点 |
|------|----------|--------|------|
| [gitleaks](https://github.com/gitleaks/gitleaks) | 800+ | MIT | 最全面，支持自定义 TOML 配置 |
| [detect-secrets](https://github.com/Yelp/detect-secrets) | 20+ 基础插件 | Apache 2.0 | 熵值检测，支持自定义插件 |
| [trufflehog](https://github.com/trufflesecurity/trufflehog) | 700+ | AGPL-3.0 | 支持全 git 历史扫描 |
| [secretlint](https://github.com/secretlint/secretlint) | 100+ | MIT | 支持 JSON/JS/YAML/Markdown |
| [gitleaks](https://github.com/gitleaks/gitleaks) (v8) | 800+ | MIT | 支持自定义 allowlist |

---

*最后更新: 2026-05-03 by 念念 🌙*