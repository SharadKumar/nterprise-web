import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { DevServerConfig } from "./types";
import { findFreePort } from "./ports";
import { hasSlim, slimStart, slimCleanup } from "./slim";
import { getWorktreeId } from "./worktree";
import { ensureEnvFiles } from "./env-files";

/**
 * Main dev server orchestrator.
 * Finds free ports, registers slim HTTPS domains, writes dev-env.json,
 * then starts turbo dev. Cleans up slim domains on exit.
 */
export async function createDevServer(config: DevServerConfig): Promise<void> {
  const { projectName, apps, envFiles, devCommand } = config;

  console.log(`\nStarting ${projectName} dev environment...\n`);

  // 0. Ensure env files exist (auto-symlink in worktrees)
  ensureEnvFiles(envFiles);

  // 1. Find free ports for each app
  const portMap = new Map<string, number>();
  for (const app of apps) {
    const port = await findFreePort(app.defaultPort);
    portMap.set(app.name, port);
    const reused =
      port === app.defaultPort ? "" : ` (default ${app.defaultPort} was busy)`;
    console.log(`   ${app.name}: port ${port}${reused}`);
  }
  console.log();

  // 2. Register slim domains (if available)
  const useSlim = await hasSlim();
  const registeredDomains: string[] = [];
  const worktreeId = getWorktreeId();
  const domainSuffix = worktreeId ? `--${worktreeId}` : "";

  // Write dev environment metadata for other scripts (e.g. tenant:slim)
  const devEnvDir = resolve(process.cwd(), ".claudius");
  mkdirSync(devEnvDir, { recursive: true });
  writeFileSync(
    resolve(devEnvDir, "dev-env.json"),
    `${JSON.stringify(
      {
        worktreeId,
        domainSuffix,
        ports: Object.fromEntries(portMap),
      },
      null,
      2,
    )}\n`,
  );

  if (useSlim) {
    console.log("Registering HTTPS domains with slim...\n");
    if (worktreeId) {
      console.log(`   Worktree ID: ${worktreeId}\n`);
    }
    for (const app of apps) {
      const port = portMap.get(app.name)!;
      const domain = `${app.slimDomain}${domainSuffix}`;
      await slimStart(domain, port);
      registeredDomains.push(domain);
    }
    console.log();
    for (const app of apps) {
      console.log(
        `   ${app.name}: https://${app.slimDomain}${domainSuffix}.test`,
      );
    }
    console.log();
  } else {
    console.log("slim not installed — using localhost URLs only");
    console.log("   Install: curl -sL https://slim.sh/install.sh | sh\n");
    for (const app of apps) {
      const port = portMap.get(app.name)!;
      console.log(`   ${app.name}: http://localhost:${port}`);
    }
    console.log();
  }

  // 3. Build env vars for turbo
  const env: Record<string, string> = { ...process.env } as Record<
    string,
    string
  >;
  for (const app of apps) {
    env[app.envVar] = String(portMap.get(app.name));
  }

  // 4. Start turbo dev
  console.log(`Starting turbo ${devCommand}...\n`);
  const turbo = spawn("bun", ["run", devCommand], {
    env,
    stdio: "inherit",
    cwd: process.cwd(),
  });

  // 5. Cleanup on exit
  const cleanup = async () => {
    console.log("\nCleaning up...");
    turbo.kill();
    if (useSlim && registeredDomains.length > 0) {
      await slimCleanup(registeredDomains);
    }
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  turbo.on("exit", (code) => {
    if (useSlim && registeredDomains.length > 0) {
      slimCleanup(registeredDomains);
    }
    process.exit(code ?? 1);
  });
}
