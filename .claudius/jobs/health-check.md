---
name: health-check
cron: "0 9 * * *"
enabled: true
timeout: 120
---
Run a health check on this repository:

1. Check git status — report any uncommitted changes or stale branches
2. List active worktrees — flag any that look orphaned
3. Check for orphaned lock files in .claudius/
4. Verify the build passes: `bun run build`
5. Run tests: `npx vitest run`
6. Report any issues found. If everything is clean, confirm "Health check passed."
