# HEARTBEAT.md

每次心跳在 isolated session 运行，控制在 1-2 分钟内。核心原则：**宁缺毋滥**。

## 每次执行

### 依赖检查
- 运行 `bash ~/.openclaw/scripts/health-check-deps.sh`，异常才记录，正常跳过

### Memory 整理
- 检查今天 daily notes 是否有信息需同步到 MEMORY.md（项目/基础设施/关键决策→L1，细节→L2）
- 快速扫描，标签检查（重要条目需有 `#tag`）

### 主动记忆沉淀
- 扫描当天会话中未保存到 OpenViking 的重要信息
- 优先级：用户偏好 > 踩坑经验 > 环境变更 > 项目约定

### Skill 候选审核
- 扫描当天 `[skill-candidate]`，满足通用性+可复用+可结构化 → 创建 `skills/` 草稿（加 `⚠️ AUTO-GENERATED DRAFT` 标记）

### Skill 使用回顾
- 回顾近 3 天 skill 使用，有改进需求记 `[skill-improvement: skill名 - 描述]`
- 检查 `memory/heartbeat-reflections/reflections.md` 中"待尝试/待落地"条目，停滞>7天标记⚠️

### 结构化沉淀
- 当天 daily notes 提取有长期价值的信息 → `memory/heartbeat-reflections/` 对应文件，去重后追加
- 跨项目同标签 → 记录到 `tunnels.md`

### Memory 容量与健康
- OpenViking 记忆数量趋势，>3天无新增则提醒
- MEMORY.md L1 过时条目标记待清理

### 事件 Feed 清理
- 清理 `events/` 目录中 >7 天的事件文件
- 只删除，不归档（事件是瞬态数据）

## 每天一次

### Memory 熵管理（周一或发现混乱时）
- 碎片清理：`memory/` 根目录 ≤5 行空文件
- 归档：>7 天 daily notes/session 移到 `memory/archive/`
- 散落文件归位：非日期 .md 移到 `docs/` 或 `research/`
- 去重：不重建已有内容的文件
- 只检查报告，不自动删除（明确碎片除外）

### Workspace 卫生
- 根目录散落文件检查（忽略核心配置文件、系统目录、约定目录）
- 有散落 → 记录 daily notes 并提醒
- events/ 目录文件数 >100 时告警
