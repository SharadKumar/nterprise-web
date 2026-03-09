# @nterprise/web

Shared web infrastructure for nterprise projects. Published to GitHub Packages.

## Modules

### `@nterprise/web/appdev`

Dev server infrastructure — port allocation, [slim.sh](https://slim.sh) HTTPS domains, git worktree detection, env file symlinking.

```typescript
import { createDevServer } from "@nterprise/web/appdev";

await createDevServer({
  projectName: "myapp",
  apps: [
    { name: "dashboard", envVar: "DASHBOARD_PORT", slimDomain: "myapp-dashboard", defaultPort: 3000 },
    { name: "website",   envVar: "WEBSITE_PORT",   slimDomain: "myapp-website",   defaultPort: 3001 },
  ],
  envFiles: [".env.local", "apps/dashboard/.env.local"],
  devCommand: "devx",
});
```

Tenant domain CLI:

```typescript
import { createTenantSlimCli } from "@nterprise/web/appdev";

createTenantSlimCli({ projectName: "myapp", appName: "website", defaultPort: 3001 });
```

### Exports

| Export | Description |
|--------|-------------|
| `createDevServer(config)` | Orchestrates full dev startup — ports, slim, env files, turbo |
| `createTenantSlimCli(config)` | CLI entry point for tenant domain management |
| `findFreePort(preferred)` | Try preferred port, fall back to OS-assigned |
| `hasSlim()` | Check if `slim` CLI is installed |
| `slimStart(domain, port)` | Register a slim domain |
| `slimCleanup(domains)` | Stop all registered slim domains |
| `getWorktreeId()` | Detect git worktree, return 8-char hash |
| `findMainRepoRoot()` | Find main repo from worktree `.git` file |
| `ensureEnvFiles(files)` | Symlink env files from main repo in worktrees |
| `registerTenantDomain(slug, config)` | Register tenant slim domain |
| `deregisterTenantDomain(slug, config)` | Remove tenant slim domain |
| `tenantUrl(slug, config)` | Build full `https://` URL for tenant |

## Install

Add `.npmrc` to your repo root:

```
@nterprise:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then install:

```bash
bun add -D @nterprise/web
# or
npm install -D @nterprise/web
```

## Requirements

- Bun runtime (uses `Bun.spawn` for slim commands)
- [slim.sh](https://slim.sh) for HTTPS local domains (optional — gracefully degrades)

## Publishing

Publishes automatically to GitHub Packages on push to `main` via GitHub Actions.
