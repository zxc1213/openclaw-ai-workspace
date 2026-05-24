#!/usr/bin/env bash
# subagent-stats.sh — Subagent 任务成功率统计工具
#
# 用法:
#   ./scripts/subagent-stats.sh [选项]
#
# 选项:
#   --week [N]     统计最近 N 周（默认: 1，即本周）
#   --all          统计全部数据
#   --help         显示帮助
#
# 输出: Markdown 格式的统计报告，可直接用于 daily notes 或 cron 推送
#
# 依赖: bash, awk, date（GNU coreutils）
# 日志文件: memory/subagent-log.md

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKSPACE="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$WORKSPACE/memory/subagent-log.md"

# ── 参数解析 ──
WEEKS=1
MODE="week"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --week)
      WEEKS="${2:-1}"
      shift 2
      ;;
    --all)
      MODE="all"
      shift
      ;;
    --help|-h)
      sed -n '2,/^$/{ s/^# //; s/^#//; p }' "$0"
      exit 0
      ;;
    *)
      echo "未知参数: $1（使用 --help 查看用法）" >&2
      exit 1
      ;;
  esac
done

# ── 空日志检测 ──
if [[ ! -f "$LOG_FILE" ]]; then
  echo "## Subagent 统计"
  echo "> 日志文件不存在: $LOG_FILE"
  exit 0
fi

# 提取日志数据行
# Markdown 表格以 | 分隔: | 日期 | 类型 | agent | 结果 | 耗时 | 备注 |
# awk -F'|' 后: $2=日期, $3=类型, $4=agent, $5=结果(含emoji), $6=耗时, $7=备注
LOG_DATA=$(awk -F'|' '
  NF >= 7 {
    date = $2; gsub(/^[ \t]+|[ \t]+$/, "", date)
    if (date !~ /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/) next
    type = $3; gsub(/^[ \t]+|[ \t]+$/, "", type)
    agent = $4; gsub(/^[ \t]+|[ \t]+$/, "", agent)
    raw_result = $5; gsub(/^[ \t]+|[ \t]+$/, "", raw_result)
    time = $6; gsub(/^[ \t]+|[ \t]+$/, "", time)
    notes = $7; gsub(/^[ \t]+|[ \t]+$/, "", notes)
    # 提取结果关键词（emoji 后的文字）
    if (raw_result ~ /success/) result = "success"
    else if (raw_result ~ /partial/) result = "partial"
    else if (raw_result ~ /failed/) result = "failed"
    else if (raw_result ~ /retried/) result = "retried"
    else result = "unknown"
    printf "%s\t%s\t%s\t%s\t%s\t%s\n", date, type, agent, result, time, notes
  }
' "$LOG_FILE")

if [[ -z "$LOG_DATA" ]]; then
  echo "## Subagent 统计"
  echo ""
  echo "> 暂无数据"
  echo ""
  echo "日志文件: \`memory/subagent-log.md\`"
  echo "请按 AGENTS.md 规范在每次 subagent 完成后追加记录。"
  exit 0
fi

# ── 时间过滤 ──
if [[ "$MODE" == "all" ]]; then
  FILTERED="$LOG_DATA"
else
  WEEKS_AGO=$(( (WEEKS - 1) * 7 ))
  START_DATE=$(date -d "monday ${WEEKS_AGO} weeks ago" +%Y-%m-%d 2>/dev/null || \
               date -v-${WEEKS_AGO}w -v-Mon +%Y-%m-%d 2>/dev/null || \
               echo "0000-01-01")
  FILTERED=$(awk -F'\t' -v start="$START_DATE" '{ if ($1 >= start) print }' <<< "$LOG_DATA")
fi

# ── 统计计算（使用 <<< 避免 printf 去掉尾部换行的问题） ──
TOTAL=$(awk 'END { print NR }' <<< "$FILTERED")

if [[ "$TOTAL" -eq 0 ]]; then
  echo "## Subagent 统计"
  echo ""
  echo "> 本周期内暂无数据"
  exit 0
fi

SUCCESS=$(awk -F'\t' '$4 == "success" { c++ } END { print c+0 }' <<< "$FILTERED")
PARTIAL=$(awk -F'\t' '$4 == "partial" { c++ } END { print c+0 }' <<< "$FILTERED")
FAILED=$(awk -F'\t'  '$4 == "failed"  { c++ } END { print c+0 }' <<< "$FILTERED")
RETRIED=$(awk -F'\t' '$4 == "retried" { c++ } END { print c+0 }' <<< "$FILTERED")

OK=$((SUCCESS + RETRIED))
RATE=$(awk "BEGIN { printf \"%.1f\", $OK / $TOTAL * 100 }")

# ── 输出报告 ──
echo "## Subagent 统计"
echo ""

if [[ "$MODE" == "all" ]]; then
  echo "**时间范围:** 全部"
else
  echo "**时间范围:** 最近 ${WEEKS} 周"
fi

echo "**总任务数:** $TOTAL"
echo ""
echo "### 总览"
echo ""
echo "| 结果 | 数量 | 占比 |"
echo "|------|------|------|"
printf "| ✅ 成功 | %d | %.1f%% |\n" "$SUCCESS" "$(awk "BEGIN { printf \"%.1f\", $SUCCESS / $TOTAL * 100 }")"
printf "| ⚠️ 部分完成 | %d | %.1f%% |\n" "$PARTIAL" "$(awk "BEGIN { printf \"%.1f\", $PARTIAL / $TOTAL * 100 }")"
printf "| ❌ 失败 | %d | %.1f%% |\n" "$FAILED" "$(awk "BEGIN { printf \"%.1f\", $FAILED / $TOTAL * 100 }")"
printf "| 🔄 重试成功 | %d | %.1f%% |\n" "$RETRIED" "$(awk "BEGIN { printf \"%.1f\", $RETRIED / $TOTAL * 100 }")"
echo ""
echo "**成功率:** ${RATE}%"
echo ""

# 按类型分布
echo "### 按任务类型分布"
echo ""
echo "| 类型 | 总数 | 成功 | 成功率 |"
echo "|------|------|------|--------|"
awk -F'\t' '{
  type = $2; counts[type]++
  if ($4 == "success" || $4 == "retried") ok[type]++
}
END {
  for (t in counts) {
    rate = (ok[t] / counts[t]) * 100
    printf "| %s | %d | %d | %.0f%% |\n", t, counts[t], ok[t]+0, rate
  }
}' <<< "$FILTERED" | sort -t'|' -k3 -rn
echo ""

# 按 agent 分布
echo "### 按 Agent 分布"
echo ""
echo "| Agent | 总数 | 成功 | 成功率 |"
echo "|-------|------|------|--------|"
awk -F'\t' '{
  agent = $3; counts[agent]++
  if ($4 == "success" || $4 == "retried") ok[agent]++
}
END {
  for (a in counts) {
    rate = (ok[a] / counts[a]) * 100
    printf "| %s | %d | %d | %.0f%% |\n", a, counts[a], ok[a]+0, rate
  }
}' <<< "$FILTERED" | sort -t'|' -k3 -rn
echo ""

# 每日趋势（仅当数据跨多天时显示）
DAYS=$(awk -F'\t' '{ u[$1]=1 } END { print length(u) }' <<< "$FILTERED")
if [[ "$DAYS" -gt 1 ]]; then
  echo "### 每日趋势"
  echo ""
  echo "| 日期 | 总数 | 成功 | 成功率 |"
  echo "|------|------|------|--------|"
  awk -F'\t' '{
    date = $1; counts[date]++
    if ($4 == "success" || $4 == "retried") ok[date]++
  }
  END {
    n = asorti(counts, sd)
    for (i = 1; i <= n; i++) {
      d = sd[i]
      rate = (ok[d] / counts[d]) * 100
      printf "| %s | %d | %d | %.0f%% |\n", d, counts[d], ok[d]+0, rate
    }
  }' <<< "$FILTERED" | sort
  echo ""
fi

# ═══════════════════════════════════════════════════════════════
# HEARTBEAT.md 集成建议（不自动修改，供人工审核后添加）
# ═══════════════════════════════════════════════════════════════
#
# 建议在 HEARTBEAT.md 检查项中添加：
#
#   ### Subagent 健康度
#   - 运行 `scripts/subagent-stats.sh --week`
#   - 成功率 < 80% 时标记 ⚠️ 并在 reflection 中分析原因
#   - 连续两周下降时提醒关注
#
# 建议在 AGENTS.md 「任务结果记录」章节末尾补充：
#
#   ### 自动化
#   - 统计脚本: `scripts/subagent-stats.sh --week`（每周日 cron 执行）
#   - 输出追加到当天 daily notes: `memory/YYYY-MM-DD.md`
#   - 心跳检查: HEARTBEAT.md 中添加 subagent 健康度检查项
