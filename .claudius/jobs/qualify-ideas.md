---
name: qualify-ideas
cron: "0 */4 * * *"
enabled: true
description: Convert approved Discussions to ready Issues
timeout: 300
guardrails: true
allowedTools: Bash,Read,Glob,Grep
maxTurns: 20
---
Review open GitHub Discussions in the "Ideas" category.
Evaluate each for goal alignment, scope, and duplicates against open issues.
Convert qualifying bug/chore/test types to Issues with `ready` label.
Feature types get `needs-approval` label.
Close rejected ones with explanation.
