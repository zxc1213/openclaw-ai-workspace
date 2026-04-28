#!/bin/bash
# Daily Papers Push Script
# Fetches trending AI papers from HuggingFace and pushes to Feishu
# Used by cron job

set -euo pipefail

HF_ENDPOINT="${HF_ENDPOINT:-https://hf-mirror.com}"
LIMIT="${PAPERS_LIMIT:-10}"
CACHE_DIR="$HOME/.cache/hf-papers"
CACHE_FILE="$CACHE_DIR/daily_papers_$(date +%Y-%m-%d).json"

mkdir -p "$CACHE_DIR"

# Fetch from HF API (with cache)
if [ -f "$CACHE_FILE" ]; then
    echo "Using cached papers from $CACHE_FILE"
else
    echo "Fetching trending papers from HuggingFace..."
    curl -s --max-time 30 "${HF_ENDPOINT}/api/daily_papers?limit=${LIMIT}" \
        -H "Accept: application/json" \
        > "$CACHE_FILE"
fi

# Output JSON for the agent to process
cat "$CACHE_FILE"
