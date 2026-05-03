---
name: proactive-agent
version: 3.1.0
description: "将 AI Agent 从被动执行转变为主动协作，提供 WAL 协议、工作缓冲区、自主 Cron 等自驱动行为模式。触发：构建 Agent 自主性、自我改进循环、主动行为。不适用于：一次性任务、简单命令执行、非 Agent 工作流。"
author: halthelobster
---

# Proactive Agent 🦞

**By Hal Labs** — Part of the Hal Stack

A proactive, self-improving architecture for your AI agent. Most agents just wait — this one anticipates your needs and gets better at it over time.

## The Three Pillars

**Proactive — creates value without being asked**
- Anticipates needs, reverse prompting, proactive check-ins

**Persistent — survives context loss**
- WAL Protocol, Working Buffer, Compaction Recovery

**Self-improving — gets better at serving you**
- Self-healing, relentless resourcefulness, safe evolution

## Quick Start

1. Copy assets to your workspace: `cp assets/*.md ./`
2. Your agent detects `ONBOARDING.md` and offers to get to know you
3. Answer questions (all at once, or drip over time)
4. Agent auto-populates USER.md and SOUL.md from your answers
5. Run security audit: `./scripts/security-audit.sh`

## Architecture Overview

```
workspace/
├── ONBOARDING.md      # First-run setup (tracks progress)
├── AGENTS.md          # Operating rules, learned lessons, workflows
├── SOUL.md            # Identity, principles, boundaries
├── USER.md            # Human's context, goals, preferences
├── MEMORY.md          # Curated long-term memory
├── SESSION-STATE.md   # ⭐ Active working memory (WAL target)
├── HEARTBEAT.md       # Periodic self-improvement checklist
├── TOOLS.md           # Tool configurations, gotchas, credentials
└── memory/
    ├── YYYY-MM-DD.md  # Daily raw capture
    └── working-buffer.md  # ⭐ Danger zone log
```

## Memory Architecture

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `SESSION-STATE.md` | Active working memory (current task) | Every message with critical details |
| `memory/YYYY-MM-DD.md` | Daily raw logs | During session |
| `MEMORY.md` | Curated long-term wisdom | Periodically distill from daily logs |

**The Rule:** If it's important enough to remember, write it down NOW — not later.

## Route Table

| Topic | Reference |
|-------|-----------|
| WAL Protocol, Working Buffer, Compaction Recovery, Unified Search | [`wal-and-memory.md`](references/wal-and-memory.md) |
| Security Hardening, Relentless Resourcefulness, ADL/VFM Guardrails | [`security-and-guardrails.md`](references/security-and-guardrails.md) |
| Autonomous vs Prompted Crons, Verify Implementation, Tool Migration | [`operational-patterns.md`](references/operational-patterns.md) |
| Six Pillars, Heartbeat, Reverse Prompting, Growth Loops | [`pillars-and-growth.md`](references/pillars-and-growth.md) |

## Core Philosophy

**The mindset shift:** Don't ask "what should I do?" Ask "what would genuinely delight my human that they haven't thought to ask for?"

## Best Practices

1. **Write immediately** — context is freshest right after events
2. **WAL before responding** — capture corrections/decisions FIRST
3. **Buffer in danger zone** — log every exchange after 60% context
4. **Recover from buffer** — don't ask "what were we doing?" — read it
5. **Search before giving up** — try all sources
6. **Try 10 approaches** — relentless resourcefulness
7. **Verify before "done"** — test the outcome, not just the output
8. **Build proactively** — but get approval before external actions
9. **Evolve safely** — stability > novelty

## Complete Agent Stack

| Skill | Purpose |
|-------|---------|
| **Proactive Agent** (this) | Act without being asked, survive context loss |
| **Bulletproof Memory** | Detailed SESSION-STATE.md patterns |
| **PARA Second Brain** | Organize and find knowledge |
| **Agent Orchestration** | Spawn and manage sub-agents |

## License & Credits

**License:** MIT — use freely, modify, distribute. No warranty.
**Created by:** Hal 9001 ([@halthelobster](https://x.com/halthelobster))

*Part of the Hal Stack 🦞*
*"Every day, ask: How can I surprise my human with something amazing?"*
