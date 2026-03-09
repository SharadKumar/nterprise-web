---
name: pulse
cron: "*/15 * * * *"
enabled: true
description: Autonomous heartbeat — surveys landscape, takes highest-value action
agent: pulsar
worktree: true
allowedTools: Bash,Read,Write,Edit,Glob,Grep,Agent(developer,reviewer)
maxBudgetUsd: 10
guardrails: true
---

Follow your pulsar agent protocol.
Check `.claude/memory/pulse.md` for interrupted WIP, then run the survey → merge → issue loop.
Exit with `PULSE_OK` when the queue is empty, the daily cap is reached, or budget > 80%.
