---
name: nightly-status
cron: "0 22 * * *"
enabled: true
description: End-of-day status summary
timeout: 120
allowedTools: Bash,Read,Glob,Grep
maxTurns: 15
---
Generate end-of-day summary: PRs merged today, issues closed,
costs from .claudius/costs.jsonl. Write summary to .claudius/pulse-state.md
recent activity section.
