---
description: Session retrospective — captures learnings, decisions, and patterns into memory files.
---

# /reflect — Session Retrospective

Captures session learnings into `.claude/memory/` topic files.

## Usage
```
/reflect             → review this session, update memory
/reflect "gotcha"    → capture specific insight immediately
```

## Workflow

### 1. Review Session

What was accomplished? What went well? What didn't? Any surprises?

### 2. Categorize Learnings

| Category | File | Examples |
|----------|------|---------|
| Architecture | `memory/architecture.md` | Design decisions, pattern choices |
| Debugging | `memory/debugging.md` | Gotchas, solved bugs, workarounds |
| Preferences | `memory/preferences.md` | Workflow tweaks, tool preferences |
| Decisions | `memory/decisions.md` | Key choices with rationale |

### 3. Update Files

Read the target memory file first. Then:
- Add new learnings (avoid duplicates)
- Update outdated entries
- Remove entries proven wrong

### 4. Update Index

If new topics added, update `memory/MEMORY.md` index. Keep it under 200 lines.

## Rules
- Check for duplicates before writing
- Current state only — no "previously X, now Y"
- Only capture stable patterns, not one-off observations
- Specific insight (`/reflect "gotcha"`) → write immediately to appropriate file
