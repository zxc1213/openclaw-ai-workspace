# Browser-Use Common Workflows

## Exposing Local Dev Servers

Use when you have a local dev server and need a cloud browser to reach it.

```bash
# 1. Start your dev server
npm run dev &  # localhost:3000

# 2. Expose it via Cloudflare tunnel
browser-use tunnel 3000
# → url: https://abc.trycloudflare.com

# 3. Now the cloud browser can reach your local server
browser-use --browser remote open https://abc.trycloudflare.com
browser-use state
browser-use screenshot
```

## Authenticated Browsing with Profiles

Use when a task requires browsing a site the user is already logged into.

**Before browsing an authenticated site, the agent MUST:**
1. Ask the user whether to use **real** (local Chrome) or **remote** (cloud) browser
2. List available profiles for that mode
3. Ask which profile to use
4. If no profile has the right cookies, offer to sync

### Step 1: Check existing profiles
```bash
# Local Chrome profiles
browser-use -b real profile list

# Cloud profiles
browser-use -b remote profile list
```

### Step 2: Browse with the chosen profile
```bash
# Real browser
browser-use --browser real --profile "Default" open https://github.com

# Cloud browser
browser-use --browser remote --profile abc-123 open https://github.com
```

### Step 3: Syncing cookies (only if needed)
```bash
# Check what cookies a local profile has
browser-use -b real profile cookies "Default"

# Domain-specific sync (recommended)
browser-use profile sync --from "Default" --domain github.com

# Full profile sync (use with caution — includes all sessions)
browser-use profile sync --from "Default"
```

## Running Subagents

Use cloud sessions to run autonomous browser agents in parallel.

- **Session = Agent**: Each cloud session is a browser agent with its own state
- **Task = Work**: Jobs given to an agent; an agent can run multiple tasks sequentially

```bash
# Parallel tasks
browser-use -b remote run "Research competitor A pricing"
browser-use -b remote run "Research competitor B pricing"

# Sequential tasks in same session
browser-use -b remote run "Log into example.com" --keep-alive
browser-use task status task-1
browser-use -b remote run "Export settings" --session-id sess-123
```

**Monitoring:**
- `browser-use task status <id> -c --last 5` for long tasks
- `browser-use session get <id>` for live view
- Detect stuck tasks: if cost/duration stops increasing, stop and restart

## Troubleshooting

```bash
browser-use doctor                           # Run diagnostics first
browser-use close --all                     # Clean slate
browser-use --headed open <url>             # Debug with visible window
browser-use state                           # Check current elements
browser-use scroll down                     # Element might be below fold
```

**Session reuse fails after `task stop`**: Create a new session instead.

**Cleanup when done:**
```bash
browser-use close
browser-use session stop --all
browser-use tunnel stop --all
```
