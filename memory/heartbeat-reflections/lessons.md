# 经验教训

### 2026-04-06
- **systemd service 指向错误工作目录会导致 CHDIR 错误**：Team Dashboard 的 systemd 文件指向旧路径 `workspace/team-dashboard/`，代码迁移到 `projects/` 后未同步更新，导致 `status=200/CHDIR` 启动失败。教训：项目迁移后必须检查所有引用路径（systemd、cron、env）
- **OpenClaw 底层已有工具失败隔离**：`Promise.allSettled` 确保单个工具失败不阻塞其他，不需要额外实现。关键是让模型知道这个能力并善用并行调用
- **Harness 改进 > 核心代码改动**：很多"改进"其实可以通过 AGENTS.md/Skill/Rules 等 Harness 文件实现，无需改 OpenClaw 源码。Agent = Model × Harness 的投资应优先放在 Harness 侧
- **借鉴竞品不是照搬**：OpenHarness 的 8 项可借鉴设计中，OpenClaw 已实现 5 项（失败隔离、流式、compaction、多 Provider、重试）。重点补的是规范空白而非功能缺失
- **P0 改进项要在任务模板中落地**：光写在文档里不够，必须改 Subagent 任务模板，让每次派发都带上 max_turns 等约束

### 2026-03-16
- **MyBatis SQL 注入修复**：`LIKE '%${xxx}%'` → `LIKE CONCAT('%', #{xxx}, '%')`；IN 子句和 ORDER BY 需代码层白名单验证，Mapper 层只能加安全注释
- **target 目录残留**：修复了源文件但 target/ 编译缓存还在，导致扫描仍发现旧漏洞，需 `mvn clean`
- **项目路径确认**：改错了目录（改到了 /mnt/e/Develop 而非 /mnt/e/todo），操作前必须先确认项目路径
- **Skillhub vs ClawHub**：Skillhub 无限流、覆盖大部分技能，优先用 Skillhub 安装；ClawHub 限流严但注册登录后额度更高

### 2026-03-17
- **systemd drop-in 目录**：systemd service 文件被 gateway 自动管理，改 Environment 必须用 drop-in 目录（`service.d/*.conf`），否则会被覆盖
- **SIGUSR1 是热重启**：SIGUSR1 不重新加载 systemd 配置，改了 drop-in 后必须 `systemctl restart`
- **JS TDZ 陷阱**：let/const 有暂时性死区（TDZ），IIFE 和变量声明顺序必须注意，`let logSseSource` 声明在 IIFE 之后会导致 undefined
- **SSE 内存泄漏**：SSE heartbeat 失败不清理客户端会内存泄漏；fs.watch 不处理 rename 事件导致日志轮转后 offset 失效
- **OpenClaw subagent 归档**：subagent session 默认 60 分钟自动归档，归档后不出现在 CLI 列表中

### 2026-03-19
- **Device Identity 签名**：Gateway 用 Ed25519（非 secp256k1），走了大弯路才发现。`deriveDeviceIdFromPublicKey` = SHA-256(rawPubKey).hex（64 字符无前缀）
- **nian-desktop 连接 Gateway**：CORS 要去掉 HTTP 预检、client.id 必须用 `openclaw-control-ui` 才能获得 operator.write scope
- **chat streaming 消息位置**：content 在 `payload.message.content` 而非 `payload.content`，这个 bug 卡了很久
- **Gateway 自动批准 pairing**：Tauri 从 Windows IP 连接但 Gateway 只自动批准 localhost，需配 cron 每 10s 自动批准 172.25.192.*

### 2026-03-30
- **WSL2 代理地址**：WSL2 不能用 127.0.0.1 访问 Windows 代理，必须用 WSL 网关 IP（172.25.192.1）
- **Clash Allow LAN**：WSL 访问 Windows 代理需要 Clash 开启「Allow LAN」+ Windows 防火墙放行 WSL 网段
- **Claude Code 更新**：`claude update` 不走环境变量代理，直接手动 curl 下载或改用 npm 安装

### 2026-03-31
- **fastjson 迁移精准范围**：自动化脚本容易误改，要先用 `grep` 精确匹配 fastjson 相关文件，误改后及时 git 还原
- **NChannelController SimplePropertyPreFilter**：fastjson 的字段过滤功能 hutool 没有直接等价物，简化为输出完整 JSON 让前端过滤
- **K8s deploy 配置适配**：deploy 目录（逐个 env 注入）和 k8s 目录（envFrom）风格不同，需要补全变量后统一改为 envFrom

### 2026-04-01
- **n8n WSL2 IPv6 问题**：n8n HTTP Request 节点在 WSL2 下因 IPv6 DNS 解析导致 HTTPS 连接中断，修复：`NODE_OPTIONS=--dns-result-order=ipv4first`
- **tools.exec.security 是受保护字段**：不能通过 config-patch 修改，需要直接编辑 openclaw.json
- **安全简报 CVE 幻觉**：AI 生成的 CVE 编号可能是假的（连续整数编号是典型特征），必须逐一通过 NVD/阿里云 AVD 验证真实性
- **silk-wasm 依赖**：QQ Bot 语音功能需要 silk-wasm 包，缺少时 Bot 显示不在线

### 2026-04-02
- **QQ Bot 多账号不能用 default**：`accounts.default` 重启后可能不被正确初始化，应使用有意义的 accountId 并显式绑定 agent
- **QQ API 消息格式**：C2C 主动消息格式为 `{ content: text, msg_type: 0 }`（不是 `msg_type: 'text'`），错误格式返回 40011000
- **LLM 全面超时排查**：Gateway fallback 链打穿时 Dashboard 无感知，需通过 journalctl 日志分析检测
- **OpenClaw 升级注意**：升级后 exec 审批可能重置，需检查 exec-approvals 配置；升级过程中 openclaw 命令可能暂时不可用
- **BGE-M3 本地 embedding 可停用**：embedding-proxy 常驻 BGE-M3 占 ~1.8G 内存（WSL2 无直通 GPU 实际跑在 CPU），停掉后智谱 embedding-3 远程 fallback 功能不受影响
- **OpenViking root key vs user key**：root key 调租户级 API 需带 `X-OpenViking-Account` 和 `X-OpenViking-User` 请求头，OpenClaw 插件应使用 user key（在 Console 中创建 user 并生成 key）
- **Claude Code MCP 跨 WSL/Windows**：Windows 侧 Claude Code 可以用 `wsl node /path/to/server.js` 启动 WSL 中的 MCP server，但 marketplace plugin 安装可能有 node_modules 兼容问题
- **飞书 lark 插件 default account 陷阱**：`channels.feishu.accounts.default` 中的 appId/appSecret 会被插件内部逻辑忽略（`requestedId === DEFAULT_ACCOUNT_ID` 时 accountOverride 永远是 undefined），必须把 appId/appSecret 放到 `channels.feishu` 顶层

### 2026-04-05
- **Chrome CDP IPv6 only**：新版 Chrome `--remote-debugging-address=0.0.0.0` 被忽略，CDP 只在 IPv6 localhost (`[::1]`) 监听。需用 Windows `netsh interface portproxy v4tov6` 转发 IPv4 到 IPv6
- **WSL2 静态 IP 与 DNS**：`ip addr flush dev eth0` 会清掉所有网络配置，重建后 DNS 可能异常。WSL 内没配代理环境变量时，需确认外网是否通过代理走
- **Cron context overflow**：isolated session 历史累积会导致 context overflow，修复方法：清除 sessionKey 绑定 + 开启 `light-context`
- **飞书 OAuth 限流**：批量授权（`feishu_oauth_batch_auth`）有频率限制，分多轮授权每轮需间隔几分钟

### 2026-04-06
- **Claude Code Skills 四层披露**：SKILL.md 支持描述→概念→执行→参考的渐进式披露，agent 只在需要时加载深层信息，减少 token 浪费
- **MCP 工具懒加载**：按需注册/卸载 MCP 工具，可减少 95% 上下文占用。对工具多的 agent 尤其重要
- **MEMORY.md 500 行上限**：OpenClaw 官方建议 MEMORY.md 控制在 500 行以内，超过会影响加载效率。需定期精简

### 2026-04-07
- **智谱费用账单 API 用 Cookie 认证**：`bigmodel.cn/api/finance/expenseBill/expenseBillListByDay` 需要浏览器 Cookie（非 Bearer token），且支持按 Key 分组查询，适合用来做 per-key 用量统计
- **OpenCLI 适配器踩坑**：bigmodel API 文档说是 POST 实际是 GET；参数名是 `billingMonth` 不是 `month`；返回在 `j.rows`（非 `data.data`）；字段用 camelCase；认证需要从 Cookie 提取 JWT
- **OpenCLI Cookie 认证**：通过 `navigate` 获取浏览器 Cookie，`fetch` 用 `credentials: 'include'`；`evaluate` 中写任意 async JS 支持分页循环

### 2026-04-05
- **WSLInterop binfmt_misc 修复**：WSL2 无法执行 Windows .exe 时（`cannot execute binary file`），可能是 binfmt_misc WSLInterop 条目缺失，用 `echo ':WSLInterop:M::MZ::/init:PF' | sudo tee /proc/sys/fs/binfmt_misc/register` 修复，而非直接写 WSLInterop 文件
- **Chrome CDP 启动方式**：WSL 通过 `cmd.exe /c start` 启动 Windows Chrome 会超时，改用 PowerShell `Start-Process` 更可靠
- **小红书 CDP 限制**：搜索框 input 不响应 CDP 的 Input.insertText/dispatchKeyEvent，需用 Page.navigate 直接跳转搜索 URL

### 2026-05-04
- **Hook 驱动 > 纯 Prompt 指令**：ECC 研究发现 PreToolUse/PostToolUse hook 模式比纯 prompt 约束更可靠，值得在 OpenClaw skill 设计中参考（如 strategic-compact 的 context 监控）
- **"强制调查 > 自我评估"**：gateguard 的核心理念——让 agent 必须调查后再评估，而非自我打分，实验显示 +2.25 分提升。可融入 skill-vetter 等审计类 skill
- **Instinct 模型值得长期关注**：ECC continuous-learning-v2 的原子行为+置信度+项目隔离模式，是 OpenClaw 长期学习方向
