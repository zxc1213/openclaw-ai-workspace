# Cloud Browser & Profile Management

## Agent Tasks (Remote Mode)

### Launching Tasks
```bash
# Single task (async by default)
browser-use -b remote run "task description"

# Parallel tasks — each gets its own session
browser-use -b remote run "Research competitor A pricing"
browser-use -b remote run "Research competitor B pricing"

# Sequential tasks in same session (reuses cookies, login state)
browser-use -b remote run "Log into example.com" --keep-alive
browser-use task status <id>  # Wait for completion
browser-use -b remote run "Export settings" --session-id <id>
```

### Task Management
```bash
browser-use task list                     # List recent tasks
browser-use task list --status finished   # Filter by status
browser-use task status <task-id>         # Get task status
browser-use task status <id> -c           # All steps with reasoning
browser-use task status <id> -v           # All steps with URLs + actions
browser-use task status <id> --last 5     # Last N steps only
browser-use task stop <task-id>           # Stop a running task
browser-use task logs <task-id>           # Get task execution logs
```

**Task status efficiency:**

| Mode | Flag | Tokens | Use When |
|------|------|--------|----------|
| Default | (none) | Low | Polling progress |
| Compact | `-c` | Medium | Need full reasoning |
| Verbose | `-v` | High | Debugging actions |

### Cloud Session Management
```bash
browser-use session list                  # List cloud sessions
browser-use session get <session-id>      # Get session details + live URL
browser-use session stop <session-id>     # Stop a session
browser-use session stop --all            # Stop all active sessions
browser-use session create                # Create with defaults
browser-use session create --profile <id> --keep-alive  # With cloud profile
browser-use session share <session-id>    # Create public share URL
```

### Tunnels
```bash
browser-use tunnel <port>           # Start tunnel (returns URL)
browser-use tunnel list             # Show active tunnels
browser-use tunnel stop <port>      # Stop tunnel
browser-use tunnel stop --all       # Stop all tunnels
```

### Server Control
```bash
browser-use server logs                   # View server logs
```

## Profile Management

### Local Chrome Profiles (`--browser real`)
```bash
browser-use -b real profile list          # List local Chrome profiles
browser-use -b real profile cookies "Default"  # Show cookie domains in profile
```

### Cloud Profiles (`--browser remote`)
```bash
browser-use -b remote profile list            # List cloud profiles
browser-use -b remote profile get <id>        # Get profile details
browser-use -b remote profile create          # Create new cloud profile
browser-use -b remote profile update <id> --name "New"
browser-use -b remote profile delete <id>
```

### Profile Syncing
```bash
browser-use profile sync --from "Default" --domain github.com  # Domain-specific
browser-use profile sync --from "Default"                      # Full profile
```
