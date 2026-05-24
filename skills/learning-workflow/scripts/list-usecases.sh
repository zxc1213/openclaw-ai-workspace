#!/bin/bash
# learning-workflow: 拉取 GitHub 仓库用例清单
# 用法: ./list-usecases.sh <repo-url> [output-path]
# 示例: ./list-usecases.sh https://github.com/AlexAnys/awesome-openclaw-usecases-zh

set -euo pipefail

REPO_URL="${1:?用法: $0 <repo-url> [output-path]}"
OUTPUT="${2:-/dev/stdout}"

# 从 URL 提取 owner/repo
REPO_PATH=$(echo "$REPO_URL" | sed -E 's|https://github.com/([^/]+/[^/]+).*|\1|')

# 尝试获取 README 中的用例列表（常见格式）
README_URL="https://raw.githubusercontent.com/${REPO_PATH}/main/README.md"

curl -sL "$README_URL" | grep -oP '\[.*?\]\(/[^)]*\.md\)' | \
  sed -E 's/\[([^\]]*)\]\(([^)]*)\)/\1|\2/' | \
  head -100 > "$OUTPUT"

echo "已提取用例清单到: $OUTPUT" >&2
wc -l < "$OUTPUT" | xargs -I{} echo "共 {} 条" >&2
