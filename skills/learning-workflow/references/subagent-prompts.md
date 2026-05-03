# Subagent Prompt 模板

## Phase 1: 全量扫描与分类

```
## 任务：{Topic Name} 全量扫描与分类

### Goal
从 {source URL} 拉取全部内容条目，提取关键信息并按 A/B/C 三档分类。

### Context
- 资源主页: {URL}
- 输出文件: {workspace}/research/{topic-name}-analysis.md
- 能力对照清单: 见 references/existing-capabilities.md

### Constraints
1. 逐条提取：名称、描述、难度、技能需求
2. A=已掌握 / B=可落地 / C=新领域，每条附分类理由
3. 输出中文
4. 上下文预算：复杂度 500-800

### Done 标准
1. 覆盖全部条目
2. 每条有 A/B/C 分类
3. 输出分类汇总表 + 统计数据
4. 文件保存到指定路径
```

## Phase 3: 深度学习单个子任务

```
## 任务：深度学习 — {子任务名称}

### Goal
从 awesome-openclaw-usecases-zh 仓库拉取{用例列表}的完整内容，深度学习后沉淀结构化笔记。

### Context
- 仓库地址: https://github.com/AlexAnys/awesome-openclaw-usecases-zh
- 涉及用例: {列出具体用例文件名}
- 输出文件: {workspace}/research/openclaw-usecases-analysis.md（追加，不覆盖）
- 当前文件行数: {行数}

### Constraints
1. 拉取每个用例的完整 markdown 内容（用 web_fetch 或 firecrawl）
2. 提取：痛点、方案架构、所需依赖、关键配置/prompt、落地步骤、踩坑经验
3. 与我们现有能力做对比，标注差异点和互补点
4. 落地建议要具体：给脚本框架、cron 配置、安装命令（不要泛泛而谈）
5. 追加到文件末尾，不要修改已有内容
6. 上下文预算：复杂度 500-800

### Done 标准
1. 覆盖所有指定用例
2. 每个用例有完整的学习笔记
3. 包含可复制的配置/脚本/命令
4. 包含与我们现有能力的结合方案
5. 文件已追加保存
```

## Phase 3: 落地执行

```
## 任务：落地 — {子任务名称}

### Goal
将{子任务名称}的学习成果实际部署到系统中。

### Context
- 学习笔记: {workspace}/research/openclaw-usecases-analysis.md
- 相关配置: {已有配置路径}
- 环境信息: WSL2, systemd, 代理 x.x.x.x:PORT

### Constraints
1. 脚本保存到 ~/scripts/，chmod +x
2. cron 任务使用 isolated session + light-context
3. 验证可用：脚本运行测试、API 可达性验证
4. 部署记录写入 memory/YYYY-MM-DD.md
5. 上下文预算：复杂度 300-500

### Done 标准
1. 脚本/配置已创建并验证可用
2. cron 任务已配置（如需要）
3. 飞书告警链路测试通过（如需要）
4. 部署记录已写入 daily notes
```
