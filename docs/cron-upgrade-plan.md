# Cron Job 升级方案

> 生成时间：2026-04-06 | 审计范围：全部 8 个 cron jobs
> 状态：**待审核** — 本文档仅输出方案，不实际修改任何 cron job

---

## 一、现状总览

| # | ID (前8位) | 名称 | Schedule | 模式 | lightContext |
|---|-----------|------|----------|------|-------------|
| 1 | `72d10a6c` | 每日早报 | `0 8 * * *` | agentTurn | ✅ |
| 2 | `27581440` | 周报生成（周日） | `0 20 * * 0` | agentTurn | ✅ |
| 3 | `19fab771` | 团队增强进度跟进 | `0 10 * * 1,4` | agentTurn | ✅ |
| 4 | `619474e6` | daily-ai-papers | `30 8 * * *` | agentTurn | ✅ |
| 5 | `480f17f5` | 竞品周报扫描 | `0 9 * * 1` | agentTurn | ✅ |
| 6 | `06993fa8` | 服务器告警检查 | `*/15 * * * *` | agentTurn | ✅ |
| 7 | `d5156146` | 服务器自动修复 | `0 3 * * *` | agentTurn | ✅ |
| 8 | `c6cbd07f` | 开源项目监控 | `0 10 * * 1,4` | agentTurn | ❌ **缺失** |

**关键发现：**
- 所有 job 已经是 `agentTurn` 模式（非 systemEvent），说明基础架构已到位
- **1 个 job 缺少 `lightContext: true`**（开源项目监控），高频/长任务场景下有 overflow 风险
- 无 disabled jobs，8/8 全部活跃
- 部分任务 payload 指令偏"写死"，缺乏动态性和容错

---

## 二、逐 Job 分析与升级建议

### 1. 每日早报 `72d10a6c` — ⭐ 高优先级升级

**当前状态：**
- 模式：agentTurn | lightContext: true | timeout: 1800s
- Payload：5步流水线（天气+日程+待办+热榜+安全），并行采集 + 固定格式输出 + 飞书归档

**问题诊断：**
1. 安全简报逻辑直接 curl GitHub API，无鉴权且限流风险（60 req/hr unauthenticated）
2. 热榜采集回退到 `localhost:6688`，如果服务挂了没有 fallback 说明
3. 飞书归档用硬编码 `wiki_node`，如果目录变动会静默失败
4. 格式写死在 prompt 中，任何调整都要改 cron job（运维负担）

**升级方向：Skill 化 + 容错增强**
```
建议：将早报逻辑封装为 skill（daily-digest），cron job 只做调度
payload message 简化为：
"执行 daily-digest skill，输出今日早报。遇到 API 失败时跳过对应模块并标注 [不可用]。"
```

**预期效果：**
- Prompt 从 ~2000 字降到 ~100 字，减少 token 消耗
- Skill 可独立迭代，不需要改 cron 配置
- 容错逻辑在 skill 中统一维护
- 可手动触发测试：直接调 skill 而不需要模拟 cron

---

### 2. 周报生成 `27581440` — ⭐ 高优先级升级

**当前状态：**
- 模式：agentTurn | lightContext: true | timeout: 600s
- Payload：读取 daily notes + MEMORY.md + subagent-log → 固定格式周报 → 飞书归档+推送

**问题诊断：**
1. 读取文件列表是"本周一到今天"，需要动态计算日期范围，模型可能算错
2. subagent-log.md 如果行数很多，可能撑爆上下文（lightContext 下的风险）
3. 周报格式固定，无法灵活调整重点

**升级方向：Skill 化 + 数据预聚合**
```
建议方案：
1. 封装为 skill（weekly-report），接受参数 --week=<start_date>
2. skill 内部先 grep/awk 提取 daily notes 摘要，再喂给模型
3. subagent-log 用 tail -100 限制输入量
4. 飞书归档路径参数化（避免硬编码 wiki_node）
```

**预期效果：**
- 上下文更可控，不会因文件膨胀而 overflow
- 可手动生成本周/上周/指定周的周报
- 数据预处理减少模型推理负担

---

### 3. 团队增强跟进 `19fab771` — 🔄 中优先级优化

**当前状态：**
- 模式：agentTurn | lightContext: true | timeout: 300s
- Payload：读 backlog 文件 → 对照当前版本 → 3-5行总结 → 有变化才通知

**问题诊断：**
1. 逻辑清晰简单，当前实现基本合理
2. `openclaw --version` 对比 backlog 是个不错的思路
3. delivery mode=none 意味着只在 payload 内部用 message 工具推送，合理

**升级方向：微调即可**
```
优化点：
1. 加上 npm check-updates 或 openclaw update --check 检查是否有新版本可升级
2. 如果 backlog 有 GitHub issue 链接，检查 issue 状态（closed = 已实现）
3. 无需 skill 化，当前复杂度适合直接写在 payload 里
```

**预期效果：**
- 更精准地判断哪些 backlog 项已实现
- 减少误判

---

### 4. daily-ai-papers `619474e6` — ⚡ 快速修复

**当前状态：**
- 模式：agentTurn | lightContext: true | timeout: 120s（偏紧）
- Payload：执行脚本 → 提取 JSON → 格式化推送飞书

**问题诊断：**
1. **timeout 120s 可能不够**：HuggingFace API 偶尔慢，加上模型处理 10 篇论文
2. 没有指定 model，会用默认模型（可能不是最快的）
3. 脚本路径硬编码

**升级方向：参数调优**
```
建议：
1. timeout 从 120s 提到 300s
2. 显式指定 model: "zai/GLM-5-Turbo"（保持一致）
3. 加入失败重试提示："如果 HuggingFace API 返回空或超时，用 web_search 搜索 'HuggingFace daily papers today' 作为 fallback"
```

**预期效果：**
- 减少因超时导致的静默失败
- 有 fallback 机制，不会完全中断推送

---

### 5. 竞品周报扫描 `480f17f5` — ⚡ 快速修复

**当前状态：**
- 模式：agentTurn | lightContext: true | timeout: 120s（偏紧）
- Payload：执行 Python 脚本 → 读 JSON → 整理 HIGH priority → 飞书推送

**问题诊断：**
1. **timeout 120s 严重不足**：Python 脚本 + Tavily/Firecrawl API 调用 + 模型推理，120s 很容易超时
2. 环境变量（API keys、proxy）硬编码在 payload 里，如果 key 变动要改 cron
3. 输出文件路径写死日期（`2026-04-05`），每周都要手动更新或动态生成

**升级方向：去硬编码 + 加 timeout**
```
建议：
1. timeout 从 120s 提到 600s
2. API keys 改为从环境变量或配置文件读取（脚本内部处理，不写在 payload 里）
3. 输出文件名改为动态日期：$(date +%Y-%m-%d)
4. 脚本失败时的 fallback："如果脚本执行失败，手动用 web_search 搜索本周 AI Agent 领域重要新闻，整理为竞品快报"
```

**预期效果：**
- 不再因硬编码日期而产生过期文件
- timeout 合理，大幅降低失败率
- API key 管理更安全

---

### 6. 服务器告警检查 `06993fa8` — ✅ 基本合理，微调

**当前状态：**
- 模式：agentTurn | lightContext: true | timeout: 120s
- 每 15 分钟执行，静默模式（OK 不通知）

**问题诊断：**
1. 高频任务，当前设计合理（lightContext + 静默）
2. 但 15 分钟间隔在凌晨也运行，产生不必要的资源消耗

**升级方向：加夜间静默**
```
建议在 payload 开头加：
"如果是 23:00-07:30 之间的时间段，跳过执行（直接返回，不检查不发消息）。"
```

**预期效果：**
- 减少深夜无意义的执行次数（每天减少约 34 次）
- 节省 token 和 API 调用

---

### 7. 服务器自动修复 `d5156146` — ✅ 基本合理

**当前状态：**
- 模式：agentTurn | lightContext: true | timeout: 300s
- 凌晨 3 点执行，安全边界定义清晰

**问题诊断：**
- 设计已经很合理，不需要大改
- 可以考虑加入执行日志归档

**升级方向：日志归档**
```
建议在 payload 中加一步：
"将执行结果追加到 ~/logs/auto-fix-$(date +%Y-%m).log（如目录不存在则创建）。"
```

**预期效果：**
- 可追溯每月自动修复历史
- 问题排查时有据可查

---

### 8. 开源项目监控 `c6cbd07f` — 🔴 必须修复

**当前状态：**
- 模式：agentTurn | **lightContext: 未设置** | timeout: 120s
- 用 firecrawl 抓取掘金 → 对比本地记录 → 有更新则通知

**问题诊断：**
1. **缺少 lightContext: true** — 这是唯一一个没开的 job，firecrawl 返回的网页内容可能很大，有 overflow 风险
2. 掘金页面需要 JS 渲染，firecrawl 有一定失败率
3. 没有 fallback 机制

**升级方向：修复 + 增强**
```
必须修复：
1. 添加 lightContext: true
2. timeout 从 120s 提到 180s

增强建议：
3. 加 fallback："如果 firecrawl 抓取失败，用 web_search 搜索 '掘金 一天一个开源项目 最新' 作为备选"
4. 考虑用掘金 API（如果有）替代网页抓取，更稳定
```

**预期效果：**
- 消除 overflow 风险
- 降低抓取失败率

---

## 三、新增自动化建议

### 🆕 建议 1：每日安全依赖扫描

**背景：** 项目多、依赖多，CVE 漏洞可能在依赖中潜伏

| 属性 | 值 |
|------|-----|
| Schedule | `0 7 * * 1,3,5`（工作日早 7 点） |
| Timeout | 300s |
| Model | zai/GLM-5-Turbo |
| lightContext | true |

**Payload 示意：**
```
执行项目依赖安全扫描：
1. 遍历 ~/projects/ 下所有包含 package-lock.json / go.sum / requirements.txt 的项目
2. 对每个项目运行 audit 命令（npm audit / pip-audit / govulncheck）
3. 汇总所有 HIGH/CRITICAL 漏洞
4. 如果有高危漏洞，推送到飞书私聊，格式：
   🔒 依赖安全扫描 | 日期
   - [项目名] [依赖名] [版本] [漏洞等级] [CVE编号]
   建议操作：升级到 [安全版本]
5. 全部安全则静默
```

**预期效果：** 主动发现供应链安全问题，每周 3 次扫描覆盖工作日

---

### 🆕 建议 2：每周代码健康度报告

**背景：** 多项目并行，代码质量需要定期巡检

| 属性 | 值 |
|------|-----|
| Schedule | `0 9 * * 5`（周五早 9 点） |
| Timeout | 600s |
| Model | zai/GLM-5-Turbo |
| lightContext | true |

**Payload 示意：**
```
生成每周代码健康度报告：
1. 遍历 ~/projects/ 下所有 Git 仓库
2. 对每个仓库收集：
   - 本周 commit 数和作者（git log --since="1 week ago" --oneline）
   - 未解决的 TODO/FIXME/HACK（grep -rn 'TODO\|FIXME\|HACK' --include='*.ts' --include='*.py'）
   - ESLint/类型检查状态（npx eslint . 2>&1 | tail -5）
   - 测试覆盖率（如果有）
   - 分支状态（是否有 stale branches 超过 30 天）
3. 生成汇总报告推送到飞书：
   📊 代码健康度 | 本周
   [各项目一行概要：commits / issues / test status]
   ⚠️ 需要关注: [stale branches / growing TODOs]
4. 保存到飞书知识库（wiki_node: UJtUw7dhwiWMv1kpXs3cDK5HnGK）
```

**预期效果：** 每周五了解代码库整体状态，及时清理技术债

---

### 🆕 建议 3：磁盘/资源使用月度巡检

**背景：** WSL 环境 + 多项目，磁盘和资源需要定期巡检

| 属性 | 值 |
|------|-----|
| Schedule | `0 2 1 * *`（每月 1 号凌晨 2 点） |
| Timeout | 600s |
| Model | zai/GLM-5-Turbo |
| lightContext | true |

**Payload 示意：**
```
执行月度资源巡检：
1. 磁盘使用：df -h / /home /mnt，标记使用率 >80% 的分区
2. 大文件扫描：du -ah ~ 2>/dev/null | sort -rh | head -30
3. node_modules 黑洞：find ~/projects -name 'node_modules' -type d -prune | xargs du -sh 2>/dev/null
4. Docker 清理候选：docker system df（如果 Docker 可用）
5. npm/pip 缓存：du -sh ~/.npm ~/.cache/pip
6. _inbox 清理：检查 ~/.openclaw/workspace/_inbox/ 超过 7 天的文件
7. 生成巡检报告推送飞书：
   🔍 月度资源巡检 | YYYY-MM
   - 磁盘: [各分区使用率]
   - 建议清理: [具体建议]
   - 自动清理: [清理了什么，释放了多少空间]
8. 对 _inbox 中超期文件执行清理（移到 trash），并在报告中列出
```

**预期效果：** 每月一次深度巡检，防止磁盘 silently 满载

---

### 🆕 建议 4：飞书知识库文档过期检查（可选）

**背景：** 知识库文档可能过时，需要定期巡检

| 属性 | 值 |
|------|-----|
| Schedule | `0 9 * * 2`（每周二早 9 点） |
| Timeout | 300s |
| Model | zai/GLM-5-Turbo |
| lightContext | true |

**Payload 示意：**
```
检查飞书知识库中最近 90 天未更新的重要文档：
1. 用 feishu_search_doc_wiki 搜索 workspace 内的文档，按编辑时间升序
2. 过滤出 90+ 天未更新的文档（排除只读/归档类）
3. 列出前 10 个最久未更新的文档，推送到飞书：
   📚 知识库巡检 | 可能过时的文档
   - [文档名] (最后编辑: X天前)
   建议：检查是否需要更新或归档
4. 全部在 90 天内更新过则静默
```

**预期效果：** 保持知识库新鲜度，减少过时信息干扰

---

## 四、升级优先级排序

| 优先级 | Job / 新增 | 操作 | 工作量 |
|--------|-----------|------|--------|
| 🔴 P0 | 开源项目监控 `c6cbd07f` | 加 lightContext + timeout | 2 min |
| ⚡ P1 | daily-ai-papers `619474e6` | timeout 120→300 + model + fallback | 5 min |
| ⚡ P1 | 竞品周报 `480f17f5` | timeout 120→600 + 去硬编码 | 10 min |
| 🔄 P2 | 告警检查 `06993fa8` | 加夜间静默 | 2 min |
| 🔄 P2 | 自动修复 `d5156146` | 加日志归档 | 3 min |
| ⭐ P3 | 每日早报 `72d10a6c` | Skill 化 | 30 min |
| ⭐ P3 | 周报生成 `27581440` | Skill 化 + 数据预聚合 | 30 min |
| 🆕 P3 | 新增：每日安全依赖扫描 | 新建 cron job | 15 min |
| 🆕 P4 | 新增：代码健康度报告 | 新建 cron job | 20 min |
| 🆕 P4 | 新增：磁盘月度巡检 | 新建 cron job | 15 min |
| 🆕 P5 | 新增：知识库过期检查 | 新建 cron job | 10 min |

**建议执行顺序：** P0 → P1 → P2（今天可完成）→ P3（本周）→ P4-P5（下周）

---

## 五、通用优化原则

1. **所有 isolated session 的 cron job 必须开 `lightContext: true`**，防止长内容撑爆上下文
2. **timeout 应留 2-3x 余量**：如果预期任务 60s 完成，timeout 设 180s
3. **API key 不硬编码在 payload 里**：让脚本从环境变量或 `~/.env` 读取
4. **所有外部 API 调用都应有 fallback**：主方案失败时用 web_search 兜底
5. **Skill 化是趋势**：复杂的、需要迭代维护的逻辑应封装为 skill，cron payload 只做调度
6. **夜间静默**：非紧急任务 23:00-07:30 不执行
7. **日志归档**：所有有副作用的任务（修复、清理、归档）都应留日志

---

*文档结束。审核通过后，按 P0→P5 顺序逐步执行升级。*
