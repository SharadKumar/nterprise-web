import { exec } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { promisify } from "node:util";
import type { TenantSlimConfig } from "./types";

const execAsync = promisify(exec);

interface DevEnv {
  worktreeId: string | null;
  domainSuffix: string;
  ports: Record<string, number>;
}

/** Read worktree domain suffix from dev-env.json (written by createDevServer) */
function getDevEnv(): DevEnv {
  const devEnvPath = resolve(process.cwd(), ".claudius", "dev-env.json");
  if (existsSync(devEnvPath)) {
    try {
      return JSON.parse(readFileSync(devEnvPath, "utf-8"));
    } catch {
      /* fall through */
    }
  }
  return { worktreeId: null, domainSuffix: "", ports: {} };
}

async function isSlimAvailable(): Promise<boolean> {
  try {
    await execAsync("slim version");
    return true;
  } catch {
    return false;
  }
}

/** Get the slim domain name for a tenant slug */
export function slimDomainName(slug: string, config: TenantSlimConfig): string {
  const devEnv = getDevEnv();
  return `${slug}--${config.projectName}-${config.appName}${devEnv.domainSuffix}`;
}

/** Get the full HTTPS URL for a tenant slug */
export function tenantUrl(slug: string, config: TenantSlimConfig): string {
  return `https://${slimDomainName(slug, config)}.test`;
}

/** Discover the app port from slim's running domains or dev-env.json */
async function getAppPort(config: TenantSlimConfig): Promise<number | null> {
  const devEnv = getDevEnv();
  const websiteDomain = `${config.projectName}-${config.appName}${devEnv.domainSuffix}`;

  // Try slim list
  try {
    const { stdout } = await execAsync("slim list --json");
    const domains = JSON.parse(stdout);
    for (const entry of domains) {
      if (entry.domain === `${websiteDomain}.test`) {
        return entry.port;
      }
    }
  } catch {
    // slim list --json might not be supported, fall back
  }

  // Fall back to dev-env.json
  if (devEnv.ports[config.appName]) {
    return devEnv.ports[config.appName];
  }

  // Fall back to env var
  const envVar =
    config.portEnvVar || `${config.appName.toUpperCase()}_PORT`;
  const envPort = process.env[envVar];
  if (envPort) {
    return Number.parseInt(envPort, 10);
  }

  // Default
  return config.defaultPort ?? null;
}

/** Register a tenant domain with slim */
export async function registerTenantDomain(
  slug: string,
  config: TenantSlimConfig,
): Promise<boolean> {
  if (!(await isSlimAvailable())) {
    console.log("   slim not installed — skipping domain registration");
    console.log("   Install: curl -sL https://slim.sh/install.sh | sh");
    return false;
  }

  const port = await getAppPort(config);
  if (!port) {
    console.log(
      `   Could not find ${config.appName} port. Is dev server running? (bun run dev)`,
    );
    return false;
  }

  const domain = slimDomainName(slug, config);

  try {
    await execAsync(`slim start ${domain} --port ${port}`);
    console.log(`   Registered ${tenantUrl(slug, config)}`);
    return true;
  } catch (error) {
    console.log(
      `   Failed to register slim domain: ${(error as Error).message}`,
    );
    return false;
  }
}

/** Deregister a tenant domain from slim */
export async function deregisterTenantDomain(
  slug: string,
  config: TenantSlimConfig,
): Promise<boolean> {
  if (!(await isSlimAvailable())) {
    return false;
  }

  const domain = slimDomainName(slug, config);

  try {
    await execAsync(`slim stop ${domain}`);
    console.log(`   Removed ${tenantUrl(slug, config)}`);
    return true;
  } catch {
    // Domain might not be registered
    return false;
  }
}

/** CLI entry point for tenant domain management */
export function createTenantSlimCli(config: TenantSlimConfig): void {
  cliMain(config).catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });
}

async function cliMain(config: TenantSlimConfig): Promise<void> {
  const args = process.argv.slice(2);
  const slugIdx = args.indexOf("--slug");
  const slug = slugIdx !== -1 ? args[slugIdx + 1] : null;
  const remove = args.includes("--remove");

  if (!slug) {
    console.log("Usage:");
    console.log(
      "  bun scripts/tenant/slim.ts --slug <slug>          # register",
    );
    console.log(
      "  bun scripts/tenant/slim.ts --slug <slug> --remove # deregister",
    );
    process.exit(1);
  }

  if (remove) {
    await deregisterTenantDomain(slug, config);
  } else {
    await registerTenantDomain(slug, config);
  }
}
