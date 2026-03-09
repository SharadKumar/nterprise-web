# Autonomy

## Decision Authority

**Agent decides:**
- Implementation, testing, commits, PRs
- Merge XS/S/M PRs when tests pass
- Close issues when all ACs are met
- All routine operations

**Agent escalates:**
- Scope changes beyond original issue
- Architecture decisions affecting multiple components
- Security-related changes
- Cost exceeding threshold
- External service procurement

**Human approves:**
- L/XL PRs (architecture impact)
- Production deploys
- Budget increases
- Anything flagged critical

## Escalation Triggers

| Trigger | Action |
|---------|--------|
| Security keywords (auth, token, secret) | Always escalate |
| Architecture change (schema, API design) | Always escalate |
| Scope expansion (2+ new requirements) | Escalate |
| Cost > 50% of budget | Warn |
| Cost > 90% of budget | Block + escalate |
| 3 consecutive failures | Pause + escalate |

## Constraints
Humans set budgets and boundaries via `.claudius/config.yaml`. Agents operate freely within them.
