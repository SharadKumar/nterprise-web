#!/usr/bin/env npx tsx
/**
 * Worktree Cleanup Hook — Remove stale worktrees on session start.
 * Trigger: SessionStart
 *
 * Lists all git worktrees under .claude/worktrees/ and removes ones
 * that no process is actively using. A worktree is considered "in use"
 * if any process has it as its working directory (checked via lsof).
 *
 * This is safe with multiple concurrent sessions/tabs — only truly
 * orphaned worktrees from crashed or completed sessions get cleaned up.
 */

import { execSync } from "node:child_process";

function isWorktreeInUse(path: string): boolean {
	try {
		// lsof +D is too slow; use fuser or check if any process has cwd in this path
		const result = execSync(`lsof +d "${path}" 2>/dev/null | head -1`, {
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
			timeout: 3000,
		});
		return result.trim().length > 0;
	} catch {
		// lsof failed or no matches — treat as not in use
		return false;
	}
}

function main() {
	const projectDir = process.env.CLAUDE_PROJECT_DIR || ".";

	// Don't clean up if we're running inside a worktree ourselves
	if (projectDir.includes(".claude/worktrees/")) return;

	try {
		const output = execSync("git worktree list --porcelain", {
			cwd: projectDir,
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		});

		const worktrees: string[] = [];
		for (const line of output.split("\n")) {
			if (line.startsWith("worktree ") && line.includes(".claude/worktrees/")) {
				worktrees.push(line.replace("worktree ", ""));
			}
		}

		if (worktrees.length === 0) return;

		let removed = 0;
		for (const wt of worktrees) {
			if (isWorktreeInUse(wt)) continue;

			try {
				execSync(`git worktree remove --force "${wt}"`, {
					cwd: projectDir,
					stdio: ["pipe", "pipe", "pipe"],
				});
				removed++;
			} catch {
				// Individual removal failed — skip, don't block session
			}
		}

		if (removed > 0) {
			execSync("git worktree prune", {
				cwd: projectDir,
				stdio: ["pipe", "pipe", "pipe"],
			});
		}
	} catch {
		// Silent fail — never block session startup
	}
}

main();
