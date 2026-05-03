# Autonomous Crons & Operational Patterns

## Autonomous vs Prompted Crons

**Key insight:** There's a critical difference between cron jobs that *prompt* you vs ones that *do the work*.

### Two Architectures

| Type | How It Works | Use When |
|------|--------------|----------|
| `systemEvent` | Sends prompt to main session | Agent attention is available, interactive tasks |
| `isolated agentTurn` | Spawns sub-agent that executes autonomously | Background work, maintenance, checks |

### The Failure Mode

You create a cron that says "Check if X needs updating" as a `systemEvent`. It fires every 10 minutes. But:
- Main session is busy with something else
- Agent doesn't actually do the check
- The prompt just sits there

**The Fix:** Use `isolated agentTurn` for anything that should happen *without* requiring main session attention.

### Example: Memory Freshener

**Wrong (systemEvent):**
```json
{
  "sessionTarget": "main",
  "payload": {
    "kind": "systemEvent",
    "text": "Check if SESSION-STATE.md is current..."
  }
}
```

**Right (isolated agentTurn):**
```json
{
  "sessionTarget": "isolated",
  "payload": {
    "kind": "agentTurn",
    "message": "AUTONOMOUS: Read SESSION-STATE.md, compare to recent session history, update if stale..."
  }
}
```

## Verify Implementation, Not Intent

**Failure mode:** You say "✅ Done, updated the config" but only changed the *text*, not the *architecture*.

### The Pattern

1. You're asked to change how something works
2. You update the prompt/config text
3. You report "done"
4. But the underlying mechanism is unchanged

### The Rule

When changing *how* something works:
1. Identify the architectural components (not just text)
2. Change the actual mechanism
3. Verify by observing behavior, not just config

**Text changes ≠ behavior changes.**

## Tool Migration Checklist

When deprecating a tool or switching systems, update ALL references:

### Checklist

- [ ] **Cron jobs** — Update all prompts that mention the old tool
- [ ] **Scripts** — Check `scripts/` directory
- [ ] **Docs** — TOOLS.md, HEARTBEAT.md, AGENTS.md
- [ ] **Skills** — Any SKILL.md files that reference it
- [ ] **Templates** — Onboarding templates, example configs
- [ ] **Daily routines** — Morning briefings, heartbeat checks

### How to Find References

```bash
grep -r "old-tool-name" . --include="*.md" --include="*.sh" --include="*.json"
```

### Verification

After migration:
1. Run the old command — should fail or be unavailable
2. Run the new command — should work
3. Check automated jobs — next cron run should use new tool
