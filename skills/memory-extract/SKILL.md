# Skill: memory-extract

从历史 session 归档中提取有价值内容，写入 OpenViking 语义记忆。

## 触发条件

- **定时调用**: cron 定时任务（建议每日一次，低峰期）
- **手动触发**: 用户要求"提取历史记忆"或类似指令

## 执行流程

### Step 1: 获取候选列表

运行辅助脚本扫描归档 session 文件：

```bash
bash workspace/skills/memory-extract/extract.sh --min-size 20000 --limit 10
```

输出每行一个 JSON：`{"id":"uuid","path":"/abs/path","size":12345}`

### Step 2: 过滤已提取的 session

读取 `memory/extracted-sessions.jsonl`，提取已处理 session ID 集合，从候选列表中排除。

如果该文件不存在，视为空集合。

### Step 3: 逐个处理候选 session

对每个候选文件：

1. **读取内容** — 使用 `read` 工具读取 JSONL 文件。大文件（>200KB）分段读取，先读前 100 行判断价值。
2. **提取文本消息** — 从 JSONL 中筛选 `role` 为 `user` 或 `assistant` 且 `content.type` 为 `text` 的消息，拼接为纯文本。
3. **价值判断** — 按"价值标准"（见下方）评估是否值得提取。无价值则跳过，记录为 `memories_count: 0`。
4. **提取记忆** — 将有价值内容整理为结构化文本，调用 `memory_store` 写入 OpenViking。

### Step 4: 记录处理结果

向 `memory/extracted-sessions.jsonl` 追加一行（注意末尾 `|` 分隔符）：

```json
{"id":"session-uuid","size":12345,"extracted_at":"2026-04-17T01:40:00+08:00","memories_count":3}|
```

### Step 5: 输出报告

```
📊 memory-extract 报告
- 扫描候选: N 个
- 已跳过(已处理): M 个
- 本次处理: K 个
- 提取记忆: T 条
- 跳过(无价值): S 个
```

## 价值判断标准

**✅ 提取**（满足任一）：
- 用户明确表达的偏好/习惯/约定
- 用户对 agent 行为的纠正或反馈
- 技术决策及理由（选型、架构、方案对比）
- 环境配置变更（新工具、新 API key、网络配置）
- 踩坑经验（错误原因、解决方案、注意事项）
- 项目约定（命名规范、目录结构、工作流）
- 重要的需求描述或功能规格

**❌ 跳过**（满足任一）：
- 纯问候/寒暄
- 简单单轮问答（天气、时间、翻译等）
- cron 超时/空跑 session（无实质对话）
- 重复内容（已在其他 session 提取过）
- 纯工具输出/日志搬运
- 对话内容过于碎片化，无法形成有意义的记忆单元

## 性能约束

- **每次最多处理 10 个 session**（由 extract.sh --limit 控制）
- 单个 session 提取的 memory 不超过 5 条，每条不超过 500 字
- 大 session（>200KB）只读取前 100 行，判断是否有价值后再决定是否深入读取

## memory_store 使用规范

调用 `memory_store` 时：
- 每条记忆是独立的、自包含的信息单元
- 不要把整段对话塞进去，要提炼出知识点
- 示例：
  - ❌ `"用户说他的代理是 x.x.x.x:PORT，然后我帮他配了..."`
  - ✅ `"用户的代理配置：x.x.x.x:PORT（Windows 侧，HTTP/SOCKS5）。记录于 TOOLS.md。"`

## 文件清单

| 文件 | 用途 |
|------|------|
| `workspace/skills/memory-extract/SKILL.md` | 本文件，skill 指令 |
| `workspace/skills/memory-extract/extract.sh` | 扫描归档 session 的辅助脚本 |
| `memory/extracted-sessions.jsonl` | 已提取 session 的去重记录 |

## 依赖

- `bash`, `find`, `sort`, `stat`, `basename` — 系统自带
- `jq` — JSON 处理（可选，未安装时 extract.sh 会 fallback 到 grep/awk）
- `memory_store` 工具 — OpenViking 写入
- `read` 工具 — 文件读取
