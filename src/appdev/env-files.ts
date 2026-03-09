import { existsSync, symlinkSync } from "node:fs";
import { resolve } from "node:path";
import { findMainRepoRoot } from "./worktree";

/**
 * Ensure env files exist — symlink from main repo if in a worktree.
 * Returns true if all env files are present.
 */
export function ensureEnvFiles(files: string[]): boolean {
  const cwd = process.cwd();
  const missing: string[] = [];

  for (const envFile of files) {
    const fullPath = resolve(cwd, envFile);
    if (!existsSync(fullPath)) {
      missing.push(envFile);
    }
  }

  if (missing.length === 0) return true;

  // Try to symlink from main repo
  const mainRoot = findMainRepoRoot();
  if (!mainRoot) {
    console.log("  Missing env files (not in a worktree, can't auto-symlink):");
    for (const f of missing) {
      console.log(`   - ${f}`);
    }
    console.log();
    return false;
  }

  console.log(`Symlinking env files from main repo (${mainRoot})...\n`);
  let allOk = true;

  for (const envFile of missing) {
    const source = resolve(mainRoot, envFile);
    const target = resolve(cwd, envFile);

    if (!existsSync(source)) {
      console.log(`   ${envFile} — not found in main repo either, skipping`);
      allOk = false;
      continue;
    }

    try {
      symlinkSync(source, target);
      console.log(`   ${envFile} -> main repo`);
    } catch (err) {
      console.log(
        `   ${envFile} — failed to symlink: ${(err as Error).message}`,
      );
      allOk = false;
    }
  }
  console.log();

  return allOk;
}
