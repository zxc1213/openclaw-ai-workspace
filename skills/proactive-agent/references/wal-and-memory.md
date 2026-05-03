# WAL Protocol (Write-Ahead Log)

**The Law:** You are a stateful operator. Chat history is a BUFFER, not storage. `SESSION-STATE.md` is your "RAM" — the ONLY place specific details are safe.

## Trigger — SCAN EVERY MESSAGE FOR:

- ✏️ **Corrections** — "It's X, not Y" / "Actually..." / "No, I meant..."
- 📍 **Proper nouns** — Names, places, companies, products
- 🎨 **Preferences** — Colors, styles, approaches, "I like/don't like"
- 📋 **Decisions** — "Let's do X" / "Go with Y" / "Use Z"
- 📝 **Draft changes** — Edits to something we're working on
- 🔢 **Specific values** — Numbers, dates, IDs, URLs

## The Protocol

**If ANY of these appear:**
1. **STOP** — Do not start composing your response
2. **WRITE** — Update SESSION-STATE.md with the detail
3. **THEN** — Respond to your human

**The urge to respond is the enemy.** The detail feels so clear in context that writing it down seems unnecessary. But context will vanish. Write first.

**Example:**
```
Human says: "Use the blue theme, not red"

WRONG: "Got it, blue!" (seems obvious, why write it down?)
RIGHT: Write to SESSION-STATE.md: "Theme: blue (not red)" → THEN respond
```

## Why This Works

The trigger is the human's INPUT, not your memory. You don't have to remember to check — the rule fires on what they say. Every correction, every name, every decision gets captured automatically.

# Working Buffer Protocol

**Purpose:** Capture EVERY exchange in the danger zone between memory flush and compaction.

### How It Works

1. **At 60% context** (check via `session_status`): CLEAR the old buffer, start fresh
2. **Every message after 60%**: Append both human's message AND your response summary
3. **After compaction**: Read the buffer FIRST, extract important context
4. **Leave buffer as-is** until next 60% threshold

### Buffer Format

```markdown
# Working Buffer (Danger Zone Log)
**Status:** ACTIVE
**Started:** [timestamp]

---

## [timestamp] Human
[their message]

## [timestamp] Agent (summary)
[1-2 sentence summary of your response + key details]
```

### Why This Works

The buffer is a file — it survives compaction. Even if SESSION-STATE.md wasn't updated properly, the buffer captures everything said in the danger zone. After waking up, you review the buffer and pull out what matters.

**The rule:** Once context hits 60%, EVERY exchange gets logged. No exceptions.

# Compaction Recovery

**Auto-trigger when:**
- Session starts with `<summary>` tag
- Message contains "truncated", "context limits"
- Human says "where were we?", "continue", "what were we doing?"
- You should know something but don't

### Recovery Steps

1. **FIRST:** Read `memory/working-buffer.md` — raw danger-zone exchanges
2. **SECOND:** Read `SESSION-STATE.md` — active task state
3. Read today's + yesterday's daily notes
4. If still missing context, search all sources
5. **Extract & Clear:** Pull important context from buffer into SESSION-STATE.md
6. Present: "Recovered from working buffer. Last task was X. Continue?"

**Do NOT ask "what were we discussing?"** — the working buffer literally has the conversation.

# Unified Search Protocol

When looking for past context, search ALL sources in order:

```
1. memory_search("query") → daily notes, MEMORY.md
2. Session transcripts (if available)
3. Meeting notes (if available)
4. grep fallback → exact matches when semantic fails
```

**Don't stop at the first miss.** If one source doesn't find it, try another.

**Always search when:**
- Human references something from the past
- Starting a new session
- Before decisions that might contradict past agreements
- About to say "I don't have that information"
