---
name: daily-health
cron: "0 9 * * *"
enabled: true
description: Daily cleanup of stale branches, worktrees, and orphaned locks
timeout: 300
allowedTools: Bash,Read,Glob,Grep
maxTurns: 20
---
Check repository health: git status, stale branches, orphaned lock files.
Run `npx vitest run` and `bun run build`. If tests fail, create a bug issue.
Clean up any stale .claudius/daemon.lock files from dead processes.
