# Session Continuity

## Two Types of Context Clearing

1. **Compaction** (native, automatic) — Claude Code summarizes old messages when context fills. Use as-is. `PreCompact` hook + CLAUDE.md "Compact Instructions" control what survives.

2. **Functional clear** (agent-initiated, user-executes) — When the current context is stale relative to the next body of work. Not about running out of space — about efficiency. A session spent debugging the daemon is noise when switching to plugin packaging.

The daemon handles this naturally: each `claude -p` invocation = fresh context. Interactive sessions need explicit signaling.

## When to Signal `/clear`

Signal a functional clear when:
- **Work area switch**: finished daemon work, next task is plugin system
- **Context pollution**: many failed approaches, dead-end debugging, large outputs cluttering context
- **PR boundary crossed**: shipped a PR, next work is unrelated
- **Goal boundary**: current goal met, shifting to a different goal

Do NOT wait for context pressure. Clear for relevance, not for space.

**How to signal:**
1. Write state to `.claudius/session-state.md`
2. Tell the user: "Context switch — recommending `/clear`. State saved."
3. After `/clear`, the startup sequence below kicks in automatically.

## Session State File

Before signaling `/clear` or when hitting a natural boundary, write state to `.claudius/session-state.md`:

```markdown
# Session State
Updated: <timestamp>

## Current Goal
<what we're working toward right now>

## In Progress
- <issue/PR currently being worked on>
- <branch name>
- <what's done, what's left>

## Completed This Session
- <list of PRs merged, issues closed>

## Next Actions
- <concrete next steps, in priority order>

## Blockers
- <anything that needs human input>

## Context Worth Preserving
- <key decisions made>
- <bugs found>
- <patterns discovered>
```

## When to Write State
- After completing a significant chunk of work (PR merged)
- Before context feels heavy (many tool calls, long outputs)
- When switching between different areas of work
- Before recommending a `/clear`

## After /clear or Session Start
1. Read `.claudius/session-state.md`
2. Read `.claudius/config.yaml` goals
3. Read `.claude/memory/MEMORY.md`
4. Pick up from "Next Actions" or check backlog for ready issues
5. Continue working — don't ask "what should I do next?"

## Never Stop Working Because
- You finished one task (check goals, pick next)
- You're "summarizing" (write state file, keep going)
- You want to ask an obvious question (decide and act)
- A natural pause point arrived (natural for who? not for autonomous agents)

## Only Stop When
- Genuinely blocked on human input (architecture decision, credentials, approval)
- Context is critically full and `/clear` is needed — signal this clearly
- All goals are met and backlog is empty (unlikely)
