---
name: security-briefing
description: "安全漏洞收集与简报生成：聚合 CVE 和安全资讯，输出结构化简报（P0-P3）。触发：查漏洞、安全简报、安全日报。可独立运行或作为 daily-digest 子模块。不适用于：一般新闻、非安全漏洞追踪、补丁管理。"
---

# Security Briefing Skill

安全漏洞收集与简报生成。可作为独立技能手动触发，也作为 daily-digest 的子模块自动运行。

## 触发方式
- 用户说"查漏洞"、"安全简报"、"安全日报"时触发手动收集
- cron 定时任务每天 08:00 (Asia/Shanghai) 作为 daily-digest 子模块运行
- 独立触发时输出完整简报；作为子模块时只返回 P0/P1 摘要（≤200 token）

## 数据源

### 国内（中文，优先）
1. **阿里云 AVD**: https://avd.aliyun.com/ — 有 API，中文，更新快
2. **OSCS 开源组件安全**: https://www.oscs1024.com/ — 开源供应链专注
3. **安全客**: https://www.anquanke.com/vul/ — 社区驱动，中文
4. **CNVD**: https://www.cnvd.org.cn/ — 国家级
5. **补天**: https://www.butian.net/ — 国内白帽

### 国际（需翻译为中文）
6. **NVD**: https://nvd.nist.gov/ — 美国国家漏洞库
7. **CVE**: https://cve.mitre.org/ — 标准漏洞编号
8. **GitHub Security Advisories**: 搜索相关仓库

## 优先级过滤

按以下优先级排序和过滤漏洞：

### 🔴 P0 — 必须立即推送
- **供应链投毒**（npm/pypi/maven 等包管理器恶意包）
- **RCE（远程代码执行）** CVSS ≥ 8.0
- **正在被利用的 0-day**

### 🟠 P1 — 当日简报必含
- **和关注技术栈直接相关的高危漏洞**（见下方关注列表）
- CVSS ≥ 7.0 的漏洞

### 🟡 P2 — 简报提及
- 关注技术栈的中危漏洞（CVSS 5.0-6.9）
- 热门开源项目（Nginx、n8n、Node.js 等）的重大漏洞

### ⚪ P3 — 可忽略
- 和我们无关的低危/信息性漏洞
- 已有广泛补丁且我们未使用的组件

## 关注技术栈

- **Node.js / JavaScript**: npm 生态、Express、Axios、webpack、Vite 等
- **Java / Spring**: SpringCloud、Spring Boot、Log4j、Jackson、Shiro
- **Tauri**: Tauri v2 及其依赖（Rust/WebView2）
- **OpenClaw**: 自身及依赖链
- **基础设施**: Docker、Nginx、Redis、MySQL、PostgreSQL、Linux Kernel
- **AI/ML**: Litellm、Hugging Face 相关组件

## 收集流程

1. 用 web_fetch 抓取各数据源最新漏洞列表
2. 按优先级过滤和排序
3. 翻译国际源内容为中文
4. 生成简报

## 简报格式

```markdown
# 🔐 安全简报 - YYYY-MM-DD

> 自动收集 | 数据源: 阿里云AVD / OSCS / 安全客 / NVD / CVE / GitHub Security

## 🔴 高危预警

### [漏洞标题]
- **编号**: CVE-XXXX-XXXXX / AVD-XXXX-XXXXXXX
- **严重程度**: CVSS X.X (Critical/High)
- **影响组件**: 组件名 版本范围
- **漏洞类型**: RCE / 供应链投毒 / ...
- **描述**: 简要描述（中文）
- **影响评估**: 是否影响我们的项目
- **修复建议**: 升级到 X.X.X / 临时缓解措施
- **来源**: [链接]

## 🟠 重要漏洞

（同上格式）

## 🟡 值得关注

（同上格式）

## 📊 本日统计
- 收集漏洞总数: X
- 高危: X | 中危: X | 低危: X
- 与我们相关: X

---
_下一期: 明天 09:00 | 手动触发: 说"查漏洞"_
```

## 文件输出

简报保存到 `/path/to/security-briefs/` 目录：
- 文件名: `安全简报-YYYY-MM-DD.md`
- 每天一个文件

## 推送规则

- 有 🔴 P0 漏洞 → 立即推送到 webchat（即使简报还没生成完）
- 有 🟠 P1 漏洞 → 随简报一起推送
- 只有 🟡 P2 → 生成简报文件，不主动推送（用户查看文件即可）
- 无任何相关漏洞 → 仅生成简报文件，不推送

## 手动指令

- **"查漏洞"** / **"安全简报"** — 立即执行一次收集
- **"查漏洞 [关键词]"** — 按关键词搜索（如"查漏洞 axios"）
- **"查漏洞 [技术栈]"** — 按技术栈过滤（如"查漏洞 spring"）
