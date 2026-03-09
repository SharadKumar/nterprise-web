---
description: Autonomous heartbeat — status, manual triggers, and ideation for continuous development.
argument-hint: "[run|ideate]"
---

# /pulse — Autonomous Heartbeat

Status, manual triggers, and autonomous ideation.

## Usage
```
/pulse               → show status
/pulse run           → trigger one heartbeat cycle
/pulse ideate        → brainstorm improvements, create issues
```

## /pulse (status)

```bash
# Gather data
gh issue list --label ready --json number,title --limit 5
gh pr list --json number,title,state --limit 5
git log --oneline -5
cat .claude/memory/pulse.md 2>/dev/null || echo "(no pulse memory — run /backlog --groom-backlog)"
```

Display:
```
Claudius Pulse
  Recent: <last 3 commits>
  Ready issues: <count> (<titles>)
  Open PRs: <count>
  Budget: $X / $Y (Z%)
```

## /pulse run

Execute one heartbeat cycle:

1. **Check constraints:**
   - Budget remaining? (read `.claudius/costs.jsonl`)
   - Within active hours? (read `.claudius/config.yaml`)

2. **Pick work:**
   ```bash
   gh issue list --label ready --json number,title,labels --limit 1
   ```
   If no ready issues, report "No ready issues. Use `/pulse ideate` to create some."

3. **Execute:** Run `/build #N` on the picked issue.

4. **Report:** What was done, cost, result.

## /pulse ideate

Brainstorm improvements autonomously:

1. **Scan codebase:**
   - Missing tests (files without corresponding test files)
   - TODO/FIXME comments
   - Code quality issues (large files, complex functions)
   - Missing documentation

2. **Review recent work:**
   ```bash
   git log --oneline -20
   gh issue list --state closed --limit 10
   ```
   Patterns? Recurring themes? Gaps?

3. **Create issues** for discovered improvements:
   ```bash
   gh issue create --title "Verb-first title" --body "..." --label "<type>"
   ```

4. **Report:** List of created issues with rationale.

## Constraints

Read from `.claudius/config.yaml`:
- `heartbeat.budgetCapUsd` — stop if exceeded
- `heartbeat.activeHours` — only run within window
- `heartbeat.maxIssuesPerDay` — daily cap
- `heartbeat.maxConsecutiveFailures` — circuit breaker
