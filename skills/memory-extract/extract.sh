#!/usr/bin/env bash
# memory-extract: 扫描归档 session 文件，输出候选列表
#
# 归档 session 文件后缀格式：
#   .deleted.{timestamp}  — 已删除的 session
#   .reset.{timestamp}    — 已重置的 session
#
# 用法:
#   bash extract.sh [--min-size BYTES] [--limit N]
#
# 参数:
#   --min-size  最小文件大小（字节），默认 20000 (20KB)
#   --limit     最大返回数量，默认 10
#
# 输出: 每行一个 JSON {"id":"uuid","path":"/abs/path","size":12345}

set -euo pipefail

MIN_SIZE=20000
LIMIT=10
SESSIONS_ROOT="${HOME}/.openclaw/agents"

# 解析参数
while [[ $# -gt 0 ]]; do
  case "$1" in
    --min-size)
      MIN_SIZE="$2"
      shift 2
      ;;
    --limit)
      LIMIT="$2"
      shift 2
      ;;
    *)
      echo "未知参数: $1" >&2
      exit 1
      ;;
  esac
done

# 查找所有 .deleted.* 和 .reset.* 文件，按大小降序排列
# 提取 session UUID：从完整文件名中去掉 .deleted.xxx 或 .reset.xxx 后缀
find "$SESSIONS_ROOT" -path '*/sessions/*' \
  \( -name '*.deleted.*' -o -name '*.reset.*' \) \
  -type f 2>/dev/null \
  | while IFS= read -r file; do
      size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo 0)

      # 跳过小于阈值的文件
      if (( size < MIN_SIZE )); then
        continue
      fi

      # 提取 session UUID
<<<<<<< HEAD
      # 文件名示例: c2cf1f1a-9db9-4f1c-8881-cca97d7d3643.jsonl.deleted.1713267600
      # 文件名示例: c2cf1f1a-9db9-4f1c-8881-cca97d7d3643.jsonl.reset.1713267600
=======
      # 文件名示例: aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.jsonl.deleted.1713267600
      # 文件名示例: aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.jsonl.reset.1713267600
>>>>>>> 0b16965cf9e8ed0cbfb77a2dd281c8c04f090264
      filename=$(basename "$file")
      # 去掉 .deleted.XXX 或 .reset.XXX 后缀，再去掉 .jsonl 后缀，保留 UUID
      session_id=$(echo "$filename" | sed -E 's/\.(deleted|reset)\..+$//' | sed 's/\.jsonl$//')

      echo "$size $session_id $file"
    done \
  | sort -rn \
  | head -n "$LIMIT" \
  | while IFS=' ' read -r size session_id path; do
      # 输出 JSON 格式
      printf '{"id":"%s","path":"%s","size":%d}\n' "$session_id" "$path" "$size"
    done
