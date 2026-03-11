#!/usr/bin/env npx tsx
/**
 * Guardian Hook — Branch protection + git safety
 * Trigger: PreToolUse (Write|Edit|Bash)
 *
 * Blocks:
 * - File writes/edits on protected branches (except .claude/)
 * - Force push to protected branches
 * - Hard reset on protected branches
 * - Commits/pushes to protected branches (in headless mode)
 * - Commits/pushes/writes to worktree-* branches from main checkout
 *
 * Protected branches: main, master
 * Home branches: main, master, worktree-* (all require feature-branch workflow)
 *
 * worktree-* branches are home branches for the agent session that owns them.
 * From the MAIN checkout: commits/pushes/writes are blocked (wrong context).
 * From INSIDE the worktree (inWorktree=true): normal operations are allowed.
 * Force push and hard reset are always blocked on any home branch.
 */

import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { isProtectedBranch, isInWorktreePath } from "../lib/workflow-config.ts";

interface HookInput {
	tool_name: string;
	tool_input: {
		command?: string;
		file_path?: string;
	};
}

export function getCurrentBranch(): string {
	try {
		return execSync("git rev-parse --abbrev-ref HEAD", {
			cwd: process.env.CLAUDE_PROJECT_DIR || process.cwd(),
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim();
	} catch {
		return "unknown";
	}
}

/** Returns true for branches that require the feature-branch workflow */
export function isHomeBranch(branch: string): boolean {
	return isProtectedBranch(branch) || /^worktree-/.test(branch);
}

function isWorktreeBranch(branch: string): boolean {
	return /^worktree-/.test(branch);
}

function isHeadless(): boolean {
	return process.env.CI === "true" || process.env.CLAUDIUS_MODE === "headless";
}

/**
 * Evaluate whether a tool use should be blocked.
 *
 * @param input - The hook input from Claude
 * @param branch - The current git branch
 * @param inWorktree - Whether we're executing from inside the owning worktree.
 *   For worktree-* branches: true allows normal operations (it's the right context).
 *   For main/master: this parameter has no effect.
 */
export function evaluate(
	input: HookInput,
	branch: string,
	inWorktree?: boolean,
): { decision: string; reason?: string } {
	const onHome = isHomeBranch(branch);
	const onWorktree = isWorktreeBranch(branch);
	const onProtected = isProtectedBranch(branch);

	// ── Write / Edit ──────────────────────────────────────────────────────────
	if (input.tool_name === "Write" || input.tool_name === "Edit") {
		if (onHome) {
			const filePath = input.tool_input.file_path || "";

			// Always allow .claude/ paths
			if (filePath.includes(".claude/")) {
				return { decision: "approve" };
			}

			// Inside the owning worktree — allow writes anywhere
			if (onWorktree && inWorktree) {
				return { decision: "approve" };
			}

			// Block: protected branch or worktree branch accessed from main checkout
			return {
				decision: "block",
				reason: `Cannot write files on ${branch}. Create a feature branch first: git checkout -b feat/N-slug`,
			};
		}
	}

	// ── Bash commands ─────────────────────────────────────────────────────────
	if (input.tool_name === "Bash" && onHome) {
		const cmd = input.tool_input.command || "";

		// Force push — always block on any home branch
		if (cmd.match(/git\s+push\s+.*--force/) || cmd.match(/git\s+push\s+-f/)) {
			return {
				decision: "block",
				reason: `Force push to ${branch} is blocked. This is a safety-critical protection.`,
			};
		}

		// Hard reset — always block on any home branch
		if (cmd.match(/git\s+reset\s+--hard/)) {
			return {
				decision: "block",
				reason: `Hard reset on ${branch} is blocked. Use git merge instead.`,
			};
		}

		// Worktree branch from main checkout — block commits and pushes
		if (onWorktree && !inWorktree) {
			if (cmd.match(/git\s+commit/)) {
				return {
					decision: "block",
					reason: `Commits to ${branch} blocked from main checkout. Switch to the worktree directory first.`,
				};
			}
			if (cmd.match(/git\s+push/)) {
				return {
					decision: "block",
					reason: `Push to ${branch} blocked from main checkout. Switch to the worktree directory first.`,
				};
			}
		}

		// Branch creation inside a worktree — block (defense-in-depth)
		// Agents in worktrees must use the worktree branch, never create new ones.
		if (onWorktree && inWorktree) {
			if (cmd.match(/git\s+(checkout\s+-b|switch\s+-c)/)) {
				return {
					decision: "block",
					reason: `Branch creation blocked inside worktree on ${branch}. Use the worktree branch directly — do not create feature branches inside worktrees.`,
				};
			}
		}

		// Worktree branch from inside the worktree — allow commits/pushes
		if (onWorktree && inWorktree) {
			return { decision: "approve" };
		}

		// Protected branch (main/master): block commits/pushes in headless mode only
		if (onProtected) {
			if (cmd.match(/git\s+commit/) && isHeadless()) {
				return {
					decision: "block",
					reason: `Commits to ${branch} blocked in headless mode. Create a feature branch.`,
				};
			}
			if (cmd.match(/git\s+push/) && !cmd.match(/--force/) && isHeadless()) {
				return {
					decision: "block",
					reason: `Push to ${branch} blocked in headless mode. Use a feature branch + PR.`,
				};
			}
		}
	}

	return { decision: "approve" };
}

function detectInWorktree(): boolean {
	const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
	try {
		const toplevel = execSync("git rev-parse --show-toplevel", {
			cwd,
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim();
		// git-common-dir points to the main repo's .git (absolute for worktrees,
		// relative ".git" for the main checkout). Resolving its parent gives the
		// main project root in both cases.
		const gitCommonDir = execSync("git rev-parse --git-common-dir", {
			cwd,
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim();
		const projectDir = resolve(toplevel, gitCommonDir, "..");
		return isInWorktreePath(toplevel, projectDir);
	} catch {
		return false;
	}
}

function main() {
	const input: HookInput = JSON.parse(readFileSync("/dev/stdin", "utf-8"));
	const branch = getCurrentBranch();
	const inWorktree = isWorktreeBranch(branch) ? detectInWorktree() : false;
	console.log(JSON.stringify(evaluate(input, branch, inWorktree)));
}

// Only run when executed directly (not imported for tests)
const isDirectExecution =
	process.argv[1]?.endsWith("guardian.ts") ||
	import.meta.url === `file://${process.argv[1]}`;
if (isDirectExecution) {
	main();
}
