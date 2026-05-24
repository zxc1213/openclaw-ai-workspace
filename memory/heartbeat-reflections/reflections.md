# 反思笔记

### 2026-03-16
- **Team Dashboard 健壮性**：5 个版本迭代说明初版设计不够全面（XSS、鉴权、数据准确性、性能等 25 个问题），以后做监控面板应先定义好错误处理和权限模型再开发
- **Agent 团队利用不足**：nian-desktop 只做了聊天客户端，Ray 提醒应该展示和调度整个 agent 团队——说明我对产品定位的理解还不够深

### 2026-03-17
- **操作前确认路径**：改错了项目目录（/mnt/e/Develop vs /mnt/e/todo），在跨多个相似项目操作时必须先确认路径
- **Dashboard 告警覆盖不全**：测试端点漏了 sendTelegram，告警系统写代码时容易遗漏通知渠道

### 2026-03-19
- **Device Identity 绕路**：一开始用 secp256k1 做签名，走了很大弯路才发现 Gateway 用的是 Ed25519。应先查看 Gateway 源码确认算法，而不是猜测

### 2026-03-20
- **MySQL 8.4 审计方案调研**：MariaDB 的 `.so` 不能加载到 MySQL（ABI 不兼容），`server_audit.so` 主要是 McAfee 老项目，MySQL 8.4 无适配版本。实际可行的方案是 Percona audit_log.so

### 2026-03-31
- **自动化脚本双刃剑**：fastjson → hutool 迁移时自动化脚本误改了 80+ 个非相关文件，虽然最终还原了但浪费了时间。以后用脚本批量修改必须先 dry-run 预览

### 2026-04-01
- **安全简报质量**：AI 生成的 CVE 编号出现幻觉（连续整数 CVE-2026-12345~12353），需要在生成流程中加入验证环节
- **Claude Code 配置优化空间**：Ray 的 Claude Code 有 13 个插件（很多用不上），每个都消耗 context window。插件多了反而稀释注意力
- **n8n 可靠性**：n8n HTTP Request 在 WSL2 下因 IPv6 问题全部失败，但 curl 和原生 fetch 正常——环境特定问题需针对性排查，不能假设所有 HTTP 客户端行为一致
- **exec 审批策略反思**：完全关闭审批后没有任何系统层面拦截，完全依赖 AGENTS.md 自律。虽然目前运行良好，但长期看对危险操作可能需要分级管控

### 2026-04-02
- **Dashboard 告警滞后**：LLM 全部超时 5 分钟 Dashboard 才发现，说明之前缺少 LLM 层面的健康监控。新增 journalctl 日志分析是正确方向
- **QQ Bot 多账号稳定性**：`accounts.default` 在重启后不被初始化，说明 OpenClaw 的 default 账号处理有边界问题。显式命名 + 绑定更可靠
- **网络中断应急**：WSL2 网络层可能临时抽风，导致 LLM API 全面超时 + QQ Bot 断连 + Gateway 被 systemd kill。虽然有告警了，但快速自愈（如自动重启 Gateway）仍待实现
- **OpenViking 记忆增强**：从纯文件记忆升级到向量搜索（2748 条），大幅提升记忆检索能力。后续应定期同步新记忆进去
- **Claude Code + OpenViking MCP 探索**：尝试了自定义 MCP server 和 marketplace plugin 两种方案，最终决定重新安装插件。跨 WSL/Windows 环境的 MCP 配置还有兼容性坑
- **embedding-proxy 简化**：BGE-M3 本地模型占用大、WSL2 无 GPU 加速不划算，停掉走纯智谱远程更简洁

### 2026-04-06
- **Claude Code Hooks 系统**：15 种 Hook 类型可用于文件保护、自动格式化、提示词增强，是 Harness 建设的重要工具 ❌ 降级（2026-04-06→04-18 停滞 12 天，优先级不足）
- **Agent 技能白名单**：按 agent 配置精确技能列表，既减少 token 浪费又降低安全风险。Ray 的 Claude Code 有 13 个插件但很多用不上，反面教材

### 2026-04-05
- **Harness Engineering 是核心杠杆**：GLM Coding 学习的最大收获——相同模型 + 不同 Harness = 天差地别的结果。AGENTS.md/SKILL.md 的质量直接决定 agent 行为质量。应把更多精力投入到 Harness 建设而非追模型升级
- **Chrome 远程控制虽通但成本高**：虽然实现了 WSL 控制 Windows Chrome，但 Chrome 资源消耗大，Ray 反馈卡顿。日常应优先用 agent-browser (headless)，Chrome 远程仅作为需要登录态的备用方案
- **飞书知识库沉淀价值**：将学习笔记和配置信息沉淀到飞书知识库，既方便 Ray 随时查阅，也能作为 agent 的外部知识源。后续新学习内容应优先写入知识库
- **WSLInterop 是隐藏坑**：`cannot execute binary file` 不一定是架构不匹配，WSL2 重启后 binfmt_misc 条目可能丢失，导致所有 Windows .exe 无法执行。遇到此问题应先检查 binfmt
- **P3.1 熵管理效果显著**：一次清理删除 11 个碎片文件、归档 58 个旧文件、归位 4 个散落文件，memory/ 根目录从 72 文件/6469 行降到 6 文件/743 行。应将熵管理作为常规维护纳入心跳

### 2026-04-09
- **自进化机制的执行鸿沟**：设计了完善的自进化机制（self-reflection/skill-candidate/tunnels）但 5 天来从未执行过。机制写在文件里≠养成习惯，Hermes 的优势在于 prompt 让每次对话**默认执行**而非附加任务
- **反思没有带来行动**：reflections.md 中多条"待尝试落地"从未 follow up。需要为反思条目建立跟踪机制（deadline + 状态标记）
- **Skill 候选标记严重不足**：5 天只标了 1 个，实际多个高频通用流程值得沉淀（飞书知识库操作、systemd 调试、浏览器自动化方案选择）
