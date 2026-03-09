import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

/**
 * Detect the worktree short ID from the directory name.
 * Returns an 8-char hash or null if main repo.
 * Used to namespace slim domains so multiple worktrees don't collide.
 */
export function getWorktreeId(): string | null {
  const cwd = process.cwd();
  const gitPath = resolve(cwd, ".git");
  if (!existsSync(gitPath)) return null;

  const stat = lstatSync(gitPath);
  if (stat.isDirectory()) return null; // main repo

  // In a worktree — hash the directory name for stable, short IDs
  const worktreeDir = cwd.split("/").pop() || "";
  if (!worktreeDir) return null;

  const hash = createHash("sha1").update(worktreeDir).digest("hex").slice(0, 8);
  return hash;
}

/**
 * Detect if we're in a git worktree and find the main repo root.
 * Returns the main repo path, or null if we're already in the main repo.
 */
export function findMainRepoRoot(): string | null {
  const cwd = process.cwd();
  const gitPath = resolve(cwd, ".git");
  if (!existsSync(gitPath)) return null;

  const stat = lstatSync(gitPath);
  if (stat.isDirectory()) return null; // we're in the main repo

  // .git is a file — read it to find the main repo
  // Format: "gitdir: /path/to/main/.git/worktrees/name"
  const gitContent = readFileSync(gitPath, "utf-8").trim();
  const match = gitContent.match(/^gitdir:\s+(.+)$/);
  if (!match) return null;

  const gitDir = resolve(cwd, match[1]);
  // gitDir is like /main-repo/.git/worktrees/branch-name
  const mainGitDir = resolve(gitDir, "..", "..");
  const mainRoot = dirname(mainGitDir);

  if (existsSync(resolve(mainRoot, "package.json"))) {
    return mainRoot;
  }
  return null;
}
