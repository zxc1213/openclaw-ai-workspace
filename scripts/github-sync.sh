#!/bin/bash
# GitHub 同步脚本：将 workspace 可公开内容同步到 GitHub 仓库
# 用法: bash scripts/github-sync.sh [--dry-run]
set -uo pipefail

WORKSPACE="~/.openclaw/workspace"
REPO="/tmp/openclaw-ai-workspace"
DRY_RUN="${1:-}"
PROXY="http://x.x.x.x:8080"

# 需要整体排除的 skill（含私有信息或独立仓库）
EXCLUDE_SKILLS=(
  "daily-hot-api"        # 含 API 配置
  "zread-skill"          # 独立 .git 仓库
  "imbeasting-mcp-builder" # 第三方
)

cd "$REPO" 2>/dev/null || { echo "ERROR: Repo not found at $REPO"; exit 1; }

# 确保 main 分支存在
CURRENT_BRANCH=$(git -C "$REPO" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
if [ "$CURRENT_BRANCH" = "" ] || [ "$CURRENT_BRANCH" = "HEAD" ]; then
  git -C "$REPO" checkout -b main 2>/dev/null || true
elif [ "$CURRENT_BRANCH" != "main" ]; then
  git -C "$REPO" checkout main 2>/dev/null || true
fi

# 拉取最新
echo "=== Pulling latest ==="
https_proxy="$PROXY" git pull origin main --rebase --quiet 2>/dev/null || true

CHANGES=0
SUMMARY=""

# ============================================================
# 敏感信息清洗
# 策略：
#   1. 删除：API Key、密码、token（整行删除或替换为占位符）
#   2. 替换：IP、端口、飞书 ID（替换为编造示例，加 SANITIZED 标记）
#   3. 替换：专属举例（替换为通用编造内容，加 SANITIZED 标记）
# ============================================================
sanitize_repo() {
  echo "=== Sanitizing sensitive data ==="
  local count=0
  local search_dirs="$REPO/skills/ $REPO/docs/ $REPO/scripts/ $REPO/"

  # --- 1. 删除真实 API Key ---
  # Firecrawl key: fc-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  while IFS= read -r -d '' f; do
    sed -i 's/fc-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/fc-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/g' "$f"
    echo " firecrawl_key: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ --include='*.md' --include='*.sh' 'fc-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' $search_dirs 2>/dev/null || true)

  # Tavily key: tvly-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  while IFS= read -r -d '' f; do
    sed -i 's/tvly-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/tvly-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/g' "$f"
    echo " tavily_key: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ --include='*.md' --include='*.sh' 'tvly-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' $search_dirs 2>/dev/null || true)

  # --- 2. 替换真实 IP 地址 ---
  # WSL2 IP: replace private IPs with placeholder
  while IFS= read -r -d '' f; do
    sed -i 's/172\.25\.192\.1/x.x.x.x/g; s/172\.25\.192\.2/x.x.x.x/g'
    sed -i 's/192\.168\.1\.100/x.x.x.x/g; s/192\.168\.1\.101/x.x.x.x/g' "$f"
    echo " ip: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ --include='*.md' --include='*.sh' '172\.25\.192\.[12]\|192\.168\.1\.10[01]' $search_dirs 2>/dev/null || true)

  # --- 3. 替换飞书标识符 ---
  # space_id
  while IFS= read -r -d '' f; do
    sed -i 's/7600000000000000000/xxx/g' "$f"
    echo " space_id: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ --include='*.md' --include='*.sh' '7600000000000000000' $search_dirs 2>/dev/null || true)

  # open_id
  while IFS= read -r -d '' f; do
    sed -i 's/ou_aabbccddeeff00112233445566778899/ou_aabbccddeeff00112233445566778899/g' "$f"
    echo " open_id: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ --include='*.md' --include='*.sh' 'ou_aabbccddeeff00112233445566778899' $search_dirs 2>/dev/null || true)

  # chat_id (oc_ 开头，20+ hex)
  while IFS= read -r -d '' f; do
    sed -i 's/oc_[a-f0-9]\{20,\}/oc_aabbccddeeff00112233/g' "$f"
    echo " chat_id: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ --include='*.md' --include='*.sh' 'oc_[a-f0-9]\{20,\}' $search_dirs 2>/dev/null || true)

  # app_id (cli_ 开头，20+ hex)
  while IFS= read -r -d '' f; do
    sed -i 's/cli_[a-f0-9]\{20,\}/cli_aabbccddeeff00112233/g' "$f"
    echo " app_id: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ --include='*.md' --include='*.sh' 'cli_[a-f0-9]\{20,\}' $search_dirs 2>/dev/null || true)

  # task_guid (UUID format) — 只在 skills/ 和 docs/ 的 .md 中处理
  while IFS= read -r -d '' f; do
    sed -i 's/[a-f0-9]\{8\}-[a-f0-9]\{4\}-[a-f0-9]\{4\}-[a-f0-9]\{4\}-[a-f0-9]\{12\}/aabbccdd-eeee-ffff-gggg-hhhhiiiiiiii/g' "$f"
    echo " guid: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ --include='*.md' '[a-f0-9]\{8\}-[a-f0-9]\{4\}-[a-f0-9]\{4\}-[a-f0-9]\{4\}-[a-f0-9]\{12\}' "$REPO/skills/" "$REPO/docs/" 2>/dev/null || true)

  # --- 4. 删除真实端口（替换为常见端口）---
  # OpenClaw 端口 18080 → 18080
  while IFS= read -r -d '' f; do
    sed -i 's/18080/18080/g' "$f"
    echo " port: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ --include='*.md' --include='*.sh' '18080' $search_dirs 2>/dev/null || true)

  # --- 5. 删除行内密码/token 模式 ---
  # 匹配常见密码/secret 暴露模式：password: xxx, token: xxx, secret: xxx (非占位符)
  # 只处理 .md 文件中的真实密码行（__OPENCLAW_REDACTED__ 和占位符不处理）
  while IFS= read -r -d '' f; do
    # 删除含真实密码的行（保留含有 REDACTED/placeholder/xxx/例 的行）
    sed -i '/password:.*[^R][^E][^D][^A][^C][^T].*$/d' "$f" 2>/dev/null
    echo " password_line: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ --include='*.md' 'password:.*' "$REPO/skills/" "$REPO/docs/" 2>/dev/null || true)

  # --- 6. 替换 Telegram 用户 ID ---
  while IFS= read -r -d '' f; do
    sed -i 's/1234567890/1234567890/g' "$f"
    echo " telegram_id: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ --include='*.md' --include='*.sh' '1234567890' $search_dirs 2>/dev/null || true)

  # --- 7. 替换 QQ AppId ---
  while IFS= read -r -d '' f; do
    sed -i 's/1000000001/1000000001/g; s/1000000002/1000000002/g; s/1000000003/1000000003/g' "$f"
    echo " qq_appid: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ --include='*.md' --include='*.sh' '1000000001\|1000000002\|1000000003' $search_dirs 2>/dev/null || true)

  # --- 8. 替换代理端口 ---
  while IFS= read -r -d '' f; do
    sed -i 's/8080/8080/g; s/8081/8081/g' "$f"
    # 7890 保持不变（太常见了，Clash 默认端口）
    echo " proxy_port: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ --include='*.md' --include='*.sh' '8080\|8081' $search_dirs 2>/dev/null || true)

  # --- 9. 替换 OpenViking 端口 ---
  while IFS= read -r -d '' f; do
    sed -i 's/:9333/:PORT/g' "$f"
    echo " ov_port: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ --include='*.md' --include='*.sh' ':9333' $search_dirs 2>/dev/null || true)

  echo " Sanitized $count files"
}

# ============================================================
# 通用敏感信息扫描（基于 docs/sanitization-rules.md）
# 在 sanitize_repo() 之后执行，覆盖项目特定规则未处理的通用模式
# ============================================================
sanitize_generic() {
  echo "=== Running generic sensitive data scan ==="
  local count=0
  local file_types="*.md *.sh *.json *.yaml *.yml *.toml *.ini"

  # 构建文件查找参数
  local include_args=""
  for ext in md sh json yaml yml toml ini; do
    include_args+="--include=*.$ext "
  done

  # --- P0: GitHub Tokens ---
  # ghp_ (PAT), gho_ (OAuth), ghu_/ghs_ (App), ghr_ (Refresh)
  while IFS= read -r -d '' f; do
    sed -i 's/ghp_[a-zA-Z0-9]\{36\}/ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/g' "$f"
    sed -i 's/gho_[a-zA-Z0-9]\{36\}/ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/g' "$f"
    sed -i 's/ghu_[a-zA-Z0-9]\{36\}/ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/g' "$f"
    sed -i 's/ghs_[a-zA-Z0-9]\{36\}/ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/g' "$f"
    sed -i 's/ghr_[a-zA-Z0-9]\{36\}/ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/g' "$f"
    echo " github_token: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ $include_args -E 'ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}|ghu_[a-zA-Z0-9]{36}|ghs_[a-zA-Z0-9]{36}|ghr_[a-zA-Z0-9]{36}' "$REPO/" 2>/dev/null || true)

  # --- P0: Private Keys (delete entire block from BEGIN to END) ---
  while IFS= read -r -d '' f; do
    sed -i '/-----BEGIN.*PRIVATE KEY-----/,/-----END.*PRIVATE KEY-----/d' "$f"
    sed -i '/-----BEGIN PGP PRIVATE KEY BLOCK-----/,/-----END PGP PRIVATE KEY BLOCK-----/d' "$f"
    echo " private_key: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ $include_args '-----BEGIN.*PRIVATE KEY-----\|-----BEGIN PGP PRIVATE KEY BLOCK-----' "$REPO/" 2>/dev/null || true)

  # --- P0: Database Connection Strings (replace password part with ****) ---
  # mongodb://user:password@host -> mongodb://user:****@host
  while IFS= read -r -d '' f; do
    sed -i 's|\(mongodb\+\?srv\?://[^:]*:\)[^@]*\(@[^ ]*\)|\1****\2|g' "$f"
    sed -i 's|\(mysql://[^:****@]*\(@[^ ]*\)|\1****\2|g' "$f"
    sed -i 's|\(postgres\+\?ql\?://[^:]*:\)[^@]*\(@[^ ]*\)|\1****\2|g' "$f"
    sed -i 's|\(redis://[^:****@]*\(@[^ ]*\)|\1****\2|g' "$f"
    echo " db_conn: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ $include_args -E 'mongodb\\+?srv?://[^:]+:[^@]+@|mysql://[^:****@]+@|postgres\\+?ql?://[^:]+:[^@]+@|redis://[^:****@]+@' "$REPO/" 2>/dev/null || true)

  # --- P0: Authorization: Bearer SANITIZED_TOKEN<token> ---
  while IFS= read -r -d '' f; do
    sed -i 's/\(Authorization:[[:space:]]*Bearer[[:space:]]*\)[a-zA-Z0-9_\-\.\+]*/\1SANITIZED_TOKEN/g' "$f"
    echo " bearer_token: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ $include_args 'Authorization:.*Bearer' "$REPO/" 2>/dev/null || true)

  # --- P0: AWS Access Key ID ---
  while IFS= read -r -d '' f; do
    sed -i 's/AKIA[A-Z0-9]\{16\}/AKIAAAAAAAAAAAAAAAA/g' "$f"
    echo " aws_key: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ $include_args 'AKIA[A-Z0-9]\{16\}' "$REPO/" 2>/dev/null || true)

  # --- P0: Alibaba Cloud AccessKey ID ---
  while IFS= read -r -d '' f; do
    sed -i 's/LTAI[a-zA-Z0-9]\{20\}/LTAIAAAAAAAAAAAAAAAAAAAA/g' "$f"
    echo " aliyun_key: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ $include_args 'LTAI[a-zA-Z0-9]\{20\}' "$REPO/" 2>/dev/null || true)

  # --- P0: JWT Token (eyJ...) ---
  while IFS= read -r -d '' f; do
    sed -i 's/eyJ[a-zA-Z0-9_-]\+\.eyJ[a-zA-Z0-9_-]\+\.[a-zA-Z0-9_-]*/SANITIZED_JWT/g' "$f"
    echo " jwt: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ $include_args 'eyJ[a-zA-Z0-9_-]*\.eyJ' "$REPO/" 2>/dev/null || true)

  # --- P1: Email addresses (replace username part) ---
  while IFS= read -r -d '' f; do
    sed -i 's/[a-zA-Z0-9._%+\-]\+@\([a-zA-Z0-9.-]\+\.[a-zA-Z]\{2,\}\)/user@example.com/g' "$f"
    echo " email: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ $include_args -E '[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' "$REPO/" 2>/dev/null || true)

  # --- P1: Chinese phone numbers (1[3-9] followed by 9 digits) ---
  while IFS= read -r -d '' f; do
    sed -i 's/1[3-9][0-9]\{9\}/13800000000/g' "$f"
    echo " phone: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ $include_args -E '1[3-9][0-9]{9}' "$REPO/" 2>/dev/null || true)

  # --- P1: Chinese ID numbers ---
  while IFS= read -r -d '' f; do
    sed -i 's/[1-9][0-9]\{5\}\(19\|20\)[0-9]\{2\}\(0[1-9]\|1[0-2]\)\(0[1-9]\|[12][0-9]\|3[01]\)[0-9]\{3\}[0-9Xx]/110101138000000004/g' "$f"
    echo " id_number: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ $include_args -E '[1-9][0-9]{5}(19|20)[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[0-9]{3}[0-9Xx]' "$REPO/" 2>/dev/null || true)

  # --- P2: Remaining UUIDs (not already replaced by project-specific rules) ---
  while IFS= read -r -d '' f; do
    sed -i 's/[a-f0-9]\{8\}-[a-f0-9]\{4\}-[a-f0-9]\{4\}-[a-f0-9]\{4\}-[a-f0-9]\{12\}/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/g' "$f"
    echo " uuid: $(basename "$f")"
    count=$((count + 1))
  done < <(grep -rlZ --include='*.md' --include='*.sh' --include='*.json' --include='*.yaml' --include='*.yml' '[a-f0-9]\{8\}-[a-f0-9]\{4\}-[a-f0-9]\{4\}-[a-f0-9]\{4\}-[a-f0-9]\{12\}' "$REPO/" 2>/dev/null || true)

  echo " Generic scan: $count files processed"
}

# 1. 同步顶级文件（排除私有）
echo "=== Syncing top-level files ==="
for f in AGENTS.md SOUL.md HEARTBEAT.md IDENTITY.md README.md MEMORY.md SAFETY.md TOOLS.md USER.md; do
  if [ -f "$WORKSPACE/$f" ]; then
    if [ ! -f "$REPO/$f" ] || ! diff -q "$WORKSPACE/$f" "$REPO/$f" > /dev/null 2>&1; then
      cp "$WORKSPACE/$f" "$REPO/$f"
      echo " Updated: $f"
      SUMMARY+=" 📝 $f\n"
      CHANGES=$((CHANGES + 1))
    fi
  fi
done

# 2. 同步 docs/
if [ -d "$WORKSPACE/docs" ]; then
  echo "=== Syncing docs/ ==="
  rsync -a --delete \
    --exclude='*.backup' \
    --exclude='private' \
    "$WORKSPACE/docs/" "$REPO/docs/" 2>/dev/null
  DOC_CHANGES=$(git -C "$REPO" diff --stat -- docs/ 2>/dev/null | tail -1 | grep -oP '\d+ file' || echo "0 files")
  if [ "$DOC_CHANGES" != "0 files" ]; then
    echo " Updated: docs/ ($DOC_CHANGES)"
    SUMMARY+=" 📁 docs/ ($DOC_CHANGES)\n"
    CHANGES=$((CHANGES + 1))
  fi
fi

# 3. 同步 scripts/（排除含密钥的）
if [ -d "$WORKSPACE/scripts" ]; then
  echo "=== Syncing scripts/ ==="
  rsync -a --delete \
    --exclude='*.backup' \
    --exclude='*secret*' \
    --exclude='*token*' \
    "$WORKSPACE/scripts/" "$REPO/scripts/" 2>/dev/null
  SCRIPT_CHANGES=$(git -C "$REPO" diff --stat -- scripts/ 2>/dev/null | tail -1 | grep -oP '\d+ file' || echo "0 files")
  if [ "$SCRIPT_CHANGES" != "0 files" ]; then
    echo " Updated: scripts/ ($SCRIPT_CHANGES)"
    SUMMARY+=" 📁 scripts/ ($SCRIPT_CHANGES)\n"
    CHANGES=$((CHANGES + 1))
  fi
fi

# 4. 同步 skills/
echo "=== Syncing skills/ ==="
for skill_dir in "$WORKSPACE/skills"/*/; do
  [ -d "$skill_dir" ] || continue
  skill_name=$(basename "$skill_dir")

  # 跳过排除列表
  skip=false
  for ex in "${EXCLUDE_SKILLS[@]}"; do
    if [ "$skill_name" = "$ex" ]; then skip=true; break; fi
  done
  $skip && continue

  # 跳过含 .git 的独立仓库
  [ -d "$skill_dir/.git" ] && continue

  # 检查 SKILL.md 是否存在
  [ ! -f "$skill_dir/SKILL.md" ] && continue

  # rsync 同步
  mkdir -p "$REPO/skills/$skill_name"
  rsync -a --delete \
    --exclude='.git' \
    --exclude='*.backup' \
    --exclude='*.log' \
    --exclude='node_modules' \
    --exclude='.learnings' \
    "$skill_dir" "$REPO/skills/$skill_name" 2>/dev/null

  # 检查是否有变化
  if ! git -C "$REPO" diff --quiet -- "skills/$skill_name/" 2>/dev/null; then
    echo " Updated: skills/$skill_name/"
    SUMMARY+=" 🔧 $skill_name\n"
    CHANGES=$((CHANGES + 1))
  elif [ -n "$(git -C "$REPO" ls-files --others --exclude-standard -- "skills/$skill_name/" 2>/dev/null)" ]; then
    echo " New: skills/$skill_name/"
    SUMMARY+=" ✨ $skill_name (new)\n"
    CHANGES=$((CHANGES + 1))
  fi
done

# 5. 清理仓库中已删除的 skill
echo "=== Checking for removed skills ==="
for existing_skill in "$REPO/skills"/*/; do
  [ -d "$existing_skill" ] || continue
  skill_name=$(basename "$existing_skill")
  if [ ! -d "$WORKSPACE/skills/$skill_name" ]; then
    rm -rf "$existing_skill"
    echo " Removed: skills/$skill_name/"
    SUMMARY+=" 🗑️ $skill_name (removed)\n"
    CHANGES=$((CHANGES + 1))
  fi
done

# 6. 确保 .gitignore
cat > "$REPO/.gitignore" << 'EOF'
node_modules/
TOOLS.md
USER.md
MEMORY.md
SAFETY.md
*.backup
memory/
_inbox/
events/
agents/
projects/
research/
.clawhub/
EOF

if [ "$CHANGES" -eq 0 ]; then
  echo "=== No changes detected ==="
  exit 0
fi

# 7. 清洗敏感信息（在 commit 之前）
sanitize_repo
sanitize_generic

echo ""
echo "=== Changes Summary ==="
echo -e "$SUMMARY"
echo "Total: $CHANGES items changed"

if [ "$DRY_RUN" = "--dry-run" ]; then
  echo "=== DRY RUN - skipping commit/push ==="
  exit 0
fi

# 提交并推送
git -C "$REPO" add -A
DATE=$(date +%Y-%m-%d)
git -C "$REPO" commit -m "sync: workspace auto-sync $DATE" --quiet

echo "=== Pushing to GitHub ==="
https_proxy="$PROXY" git -C "$REPO" push "https://zxc1213:token@github.com/zxc1213/openclaw-ai-workspace.git" main --quiet 2>&1
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  echo "ERROR: Push failed with exit code $EXIT_CODE"
  exit $EXIT_CODE
fi
echo "=== Done ==="
