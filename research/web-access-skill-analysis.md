# web-access Skill 深度分析

> 来源: https://github.com/eze-is/web-access (v2.4.1, MIT)
> 作者: 一泽 Eze
> 学习日期: 2026-04-06

## 一句话总结

给 Claude Code 装上完整联网能力的 skill——**联网策略调度 + CDP 浏览器 Proxy + 站点经验积累 + 子 Agent 并行分治**。

---

## 架构总览

```
web-access/
├── SKILL.md                    # 核心能力文档（哲学 + 技术事实 + 操作指引）
├── README.md                   # 用户文档
├── scripts/
│   ├── cdp-proxy.mjs           # CDP Proxy 核心服务（~500行）
│   ├── check-deps.mjs          # 环境检测（Node + Chrome + Proxy）
│   └── match-site.mjs          # 站点经验匹配（按域名/别名匹配）
└── references/
    ├── cdp-api.md              # CDP Proxy API 参考文档
    └── site-patterns/          # 站点经验库（按域名存 .md）
        └── .gitkeep
```

## 核心设计理念

### 1. Skill = 哲学 + 技术事实，不是操作手册

这是这个 skill 最独特的设计理念。SKILL.md 不是"步骤1→步骤2"的 check list，而是：

- **浏览哲学**：像人一样思考，目标驱动而非步骤驱动
- **技术事实**：Shadow DOM 穿透、懒加载触发、站点内 URL 可靠性等
- **Tradeoff 清晰**：程序化操作 vs GUI 交互的利弊，让 AI 自己选

**为什么这个设计好？** AI 的强项是推理和决策，弱项是机械执行。给它约束和事实，让它自己规划路径，比写死步骤更鲁棒。

### 2. 三层通道调度

```
请求 → 工具选择决策树：
  ├── 静态层: WebSearch / WebFetch / curl / Jina
  │   适合: 公开内容、已知 URL、文章/文档
  └── 浏览器层: CDP Proxy
      适合: 需要登录态、动态渲染、反爬平台、交互操作
```

**关键创新**：不是所有请求都走浏览器，也不是都走静态抓取。Skill 教 AI 根据场景**自主判断**用哪个通道，可以任意组合。

工具选择对照表：
| 场景 | 工具 | 理由 |
|------|------|------|
| 搜索发现 | WebSearch | 信息发现入口 |
| 已知 URL 提取 | WebFetch | 定向提取，省 token |
| 原始 HTML | curl | 需要 meta/JSON-LD 等结构化字段 |
| 反爬平台 | CDP | 小红书、微信公众号等静态层无效 |
| 登录态/交互 | CDP | 天然携带用户登录态 |

### 3. CDP Proxy：轻量 HTTP→Chrome 桥

**核心思路**：Claude Code 没有 CDP 能力，但可以用 curl。所以建一个本地 HTTP Proxy，把 CDP 协议包装成 REST API。

```
Claude Code (curl) → HTTP API (localhost:3456) → WebSocket → Chrome CDP
```

**关键实现细节**：

1. **自动发现 Chrome 端口**
   - 优先读 `DevToolsActivePort` 文件（支持 macOS/Linux/Windows 多路径）
   - 回退扫描 9222/9229/9333 常见端口
   - 用 TCP 探测而非 WebSocket 探测（避免触发 Chrome 安全弹窗）

2. **反风控设计**
   - 拦截页面对 `127.0.0.1:{chromePort}` 的探测请求（`Fetch.enable` + `Fetch.failRequest`）
   - 防止网站通过 JS 检测 Chrome 调试端口是否开放

3. **三种点击方式**（递进式）
   - `/click`：JS `el.click()` — 简单快速，覆盖大多数场景
   - `/clickAt`：CDP `Input.dispatchMouseEvent` — 真实鼠标事件，能触发文件对话框
   - `/setFiles`：CDP `DOM.setFileInputFiles` — 直接设置文件，完全绕过文件对话框

4. **连接管理**
   - 延迟连接（首次请求时才连 Chrome，不是启动时就连）
   - 连接断开自动重置端口缓存（下次重新发现）
   - 已有实例检测（端口占用时先 health check）

### 4. 并行分治策略

多目标调研时，分发子 Agent 并行执行：
- 每个子 Agent 自行创建 tab、自行操作、自行关闭
- 共享一个 Chrome 实例和一个 Proxy
- 通过 targetId 隔离 tab，无竞态风险
- 抓取内容不进主 Agent 上下文，只传摘要，省 token

**子 Agent prompt 设计要点**：
- 描述目标（"获取"、"调研"），不用暗示手段的动词（"搜索"、"抓取"）
- 必须写 `必须加载 web-access skill 并遵循指引`
- 不过度指定步骤，让子 Agent 自主判断

### 5. 站点经验积累

按域名存储操作经验到 `references/site-patterns/{domain}.md`：
- URL 模式、平台特征、已知陷阱
- 跨 session 复用
- 标注发现日期，当作"可能有效的提示"而非保证

`match-site.mjs` 做模糊匹配：域名 + aliases（中文名）。

---

## 与 OpenClaw 的对比

| 能力 | web-access (Claude Code) | OpenClaw (念念) |
|------|--------------------------|-----------------|
| 联网搜索 | WebSearch (Claude 内置) | web_search (Brave API，当前缺 key) |
| 网页抓取 | WebFetch / curl / Jina | web_fetch (内置) |
| CDP 浏览器 | 自建 CDP Proxy | 内置 browser 插件 (Playwright) |
| 浏览器自动操作 | curl → HTTP API → CDP | 原生 snapshot/act API |
| 登录态 | 直连用户 Chrome | Windows Chrome CDP profile |
| 子 Agent 并行 | Claude Code subagent | sessions_spawn isolated |
| 站点经验 | 文件系统 (site-patterns/) | 无（可借鉴） |
| Skill 形态 | Claude Code Plugin | OpenClaw Skill (SKILL.md) |
| 调度策略 | SKILL.md 哲学引导 | 系统提示词 + 工具策略 |

**OpenClaw 已有的优势**：
- browser 插件功能更完善（Playwright，支持 snapshot/act/refs）
- 内置 agent-browser skill
- CDP profile 直连用户 Chrome 已配置（`windows` profile）

**可借鉴的点**：
1. **站点经验库**：按域名积累反爬经验、URL 模式、已知陷阱
2. **三层调度哲学**：Skill 教 AI 做决策而非执行步骤
3. **反风控意识**：拦截端口探测、站点内 URL 可靠性等
4. **子 Agent prompt 写法**：目标导向而非步骤指令
5. **CDP Proxy 模式**：轻量 HTTP→CDP 桥，让无浏览器能力的 agent 也能操作

---

## 技术实现亮点

1. **Node.js 22+ 原生 WebSocket** + 低版本 ws 模块回退
2. **跨平台 Chrome 端口发现**：读 DevToolsActivePort 文件（macOS/Linux/Windows 不同路径）
3. **TCP 探测替代 WebSocket 探测**：避免触发 Chrome 授权弹窗
4. **Fetch 域拦截**：`Fetch.enable` + `Fetch.failRequest` 拦截反调试检测
5. **延迟连接 + 自动重连**：首次请求时才连 Chrome，断开自动重置
6. **detached 进程管理**：Proxy 以 detached 模式启动，不随 agent 退出而终止

---

## 局限性

1. **仅限 Claude Code**：依赖 Claude Code 的 skill/plugin 系统，不能直接用于 OpenClaw
2. **单用户模式**：直连用户 Chrome，不支持多用户并发
3. **CDP Proxy 无认证**：localhost:3456 无 auth，任何本地进程可调用
4. **站点经验库为空**：repo 中 site-patterns 只有 .gitkeep，需要用户自行积累
5. **无代理支持**：所有请求直连，不能通过 HTTP 代理出站

---

## 对我们的启示

1. **可以写一个 OpenClaw 版的 web-access skill**，核心是：
   - 把三层调度哲学翻译到 OpenClaw SKILL.md 格式
   - 利用已有的 browser 插件替代 CDP Proxy
   - 加入站点经验库的概念
2. **站点经验库是低成本高回报的**：每次 CDP 操作成功后，自动记录新发现的模式
3. **反爬意识值得内置**：端口探测拦截、站点内 URL 优先等可以沉淀到 browser skill
