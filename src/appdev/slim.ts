/** Check if slim is available */
export async function hasSlim(): Promise<boolean> {
  try {
    const proc = Bun.spawn(["slim", "version"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    await proc.exited;
    return proc.exitCode === 0;
  } catch {
    return false;
  }
}

/** Register a slim domain */
export async function slimStart(domain: string, port: number): Promise<void> {
  const proc = Bun.spawn(["slim", "start", domain, "--port", String(port)], {
    stdout: "inherit",
    stderr: "inherit",
  });
  await proc.exited;
}

/** Stop all slim domains we registered */
export async function slimCleanup(domains: string[]): Promise<void> {
  for (const domain of domains) {
    try {
      const proc = Bun.spawn(["slim", "stop", domain], {
        stdout: "pipe",
        stderr: "pipe",
      });
      await proc.exited;
    } catch {
      // ignore cleanup errors
    }
  }
}
