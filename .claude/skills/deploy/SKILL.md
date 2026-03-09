---
name: deploy
description: >-
  Deployment orchestration — deploys to preview or production using the configured
  deploy adapter (Vercel or Fly.io). Runs smoke tests, validates health, supports
  rollback. Triggers on: "deploy this", "deploy to production", "preview deploy",
  "ship it", "/deploy". Reads deploy config from .claudius/config.yaml.
argument-hint: "[--preview] [--production] [PR#N]"
---

# /deploy — Deployment Orchestration

Orchestrates deployments using the configured deploy adapter (Vercel or Fly.io). Preview deploys on PRs, production deploys after merge, smoke test validation, and rollback on failure.

## Usage
```
/deploy --preview              → deploy current branch as preview
/deploy --preview PR#42        → deploy specific PR as preview
/deploy --production           → deploy main to production (requires approval)
/deploy                        → auto-detect: PR open → preview, main → production
```

## Prerequisites

Check `.claudius/config.yaml` for deploy configuration:
```yaml
deploy: vercel | fly | none
```

If `deploy: none`, stop: "No deploy adapter configured. Set `deploy: vercel` or `deploy: fly` in `.claudius/config.yaml`."

## Workflow

### 1. Detect Deploy Target

**Auto-detect from context:**
- On a feature branch with open PR → preview deploy
- On main after merge → production deploy
- Explicit `--preview` or `--production` flag overrides

### 2. Pre-Deploy Validation

Before deploying, verify the build is healthy:

```bash
bun test
bun run build
bun run lint
```

If any fail, stop: "Build validation failed. Fix issues before deploying."

### 3. Preview Deploy

```bash
# Vercel
vercel --yes 2>&1

# Fly.io
fly deploy --app <app-name>-pr-<N> --config fly.toml
```

Capture the preview URL. If deploying for a PR, post the URL as a PR comment:

```bash
gh pr comment <N> --body "Preview deployed: <url>"
```

### 4. Production Deploy

**Requires human approval** (per autonomy rules).

Use `AskUserQuestion`:
- Show what's being deployed (commit hash, PR number, change summary)
- Options: **"Deploy to production"** / **"Cancel"**

On approval:

```bash
# Vercel
vercel --prod --yes 2>&1

# Fly.io
fly deploy --app <app-name> --config fly.toml
```

### 5. Smoke Test

After deployment completes, validate the deploy is healthy:

1. **Health check** — hit the health endpoint (if configured in solution.md)
2. **Status check** — verify the deploy adapter reports success:
   ```bash
   # Vercel
   vercel inspect <deployment-url>

   # Fly.io
   fly status --app <app-name>
   ```
3. **Basic reachability** — fetch the deployed URL and verify non-error response

### 6. Rollback (on failure)

If smoke tests fail:

```bash
# Vercel — instant rollback to previous production deployment
vercel rollback --yes

# Fly.io
fly releases --app <app-name>
fly deploy --app <app-name> --image <previous-image>
```

Report failure: "Deploy failed smoke tests. Rolled back to previous version. Error: {details}"

### 7. Report

```
Deployed: {preview|production}
URL: {deployment-url}
Commit: {hash}
Status: {healthy|failed}
```

## Error Handling

- Build validation fails → stop before deploying
- Deploy command fails → report error, don't retry
- Smoke test fails → rollback, report
- Rollback fails → escalate to human immediately

## Rules

- **Production deploys require human approval** — always, no exceptions
- **Preview deploys are autonomous** — no approval needed
- **Validate before deploying** — tests, build, lint must pass
- **Smoke test after deploying** — never declare success without verification
- **Rollback on failure** — don't leave broken production
- **No PlanMode** — deployment is procedural, not exploratory
- **Respect config** — only deploy if an adapter is configured
