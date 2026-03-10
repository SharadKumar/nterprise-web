# Local Testing

## Test Before Committing

Every change that can be tested locally MUST be tested locally before committing. Do not assume something works — verify it.

### What counts as testable

| Change type | How to test |
|-------------|-------------|
| Library code, utilities, config | Unit tests (`bun test`) |
| CLI commands, install flows | Run in a temp directory (`mktemp -d`) |
| UI changes, web apps | Browser testing via agent-browser or Playwright MCP |
| API endpoints | `curl` or Playwright MCP |
| Shell scripts | Execute in a temp directory |
| Package install / dependency changes | Test in a clean project that mirrors the target (same PM, same repo structure) |

### Rules

1. **Test against reality, not theory.** If the feature targets bun monorepos, test in a bun monorepo — not a clean npm project.
2. **Test the exact command the user will run.** Don't test `npm install` if the user runs `bun add`.
3. **Create a temp directory for integration tests.** Use `mktemp -d` or `/tmp/test-*`. Clean up after.
4. **Browser-test UI changes.** Use agent-browser (`/agent-browser`) or Playwright MCP (`mcp__playwright__*`) to verify visual and interactive behavior. Take screenshots as evidence.
5. **One PR per verified behavior change.** Don't chain 5 PRs of "try this, try that". Test locally, find the working solution, ship one PR.

### dist/ freshness

`dist/` is committed to the repo. The `prepare` script skips building when `dist/` already exists. This means stale `dist/` = users run old code.

**After changing any `src/` file, always rebuild and commit dist/:**
```bash
bun run build:server
git add dist/
```

If you forget, `npx github:SharadKumar/claudius` will silently run old code — the most dangerous kind of bug.

### Anti-patterns

- Committing install commands without testing them in the target environment
- Assuming package managers behave identically (they don't — especially for private repos, workspaces, lockfiles)
- Shipping a fix for a fix for a fix instead of reverting and getting it right once
- Trusting `bun run build` as sufficient validation when the change is user-facing
- Changing `src/` without rebuilding and committing `dist/`
