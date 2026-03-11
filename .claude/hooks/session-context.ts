#!/usr/bin/env npx tsx
/**
 * Personality Inject Hook — Load Claudius personality + branch state into session context
 * Trigger: SessionStart
 *
 * Reads .claudius/personality.md and injects it as context so every
 * session (interactive and headless) starts with the right voice and traits.
 * Also injects the current git branch state so agents know upfront whether
 * they need to create a feature branch before writing files.
 * Fails silently if the file is missing — never blocks session startup.
 */

import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { isProtectedBranch, isInWorktreePath } from "../lib/workflow-config.ts";

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

function isHomeBranch(branch: string): boolean {
	return isProtectedBranch(branch) || branch.startsWith("worktree-");
}

function detectInWorktree(): boolean {
	const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
	try {
		const toplevel = execSync("git rev-parse --show-toplevel", {
			cwd, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"],
		}).trim();
		const gitCommonDir = execSync("git rev-parse --git-common-dir", {
			cwd, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"],
		}).trim();
		const projectDir = resolve(toplevel, gitCommonDir, "..");
		return isInWorktreePath(toplevel, projectDir);
	} catch {
		return false;
	}
}

/**
 * Returns a branch-state message to inject at session start.
 * Warning if on a protected/home branch, confirmation if on a feature branch.
 *
 * @param branch - The current git branch name
 * @param inWorktree - Whether the session is running inside the owning worktree.
 *   When true and branch is a worktree-* branch, emits a positive confirmation
 *   instead of a warning (agent is in the right place, no feature branch needed).
 */
export function getBranchWarning(branch: string, inWorktree?: boolean): string {
	if (branch === "unknown") return "";

	if (branch.startsWith("worktree-") && inWorktree === true) {
		return `✓ Current branch: \`${branch}\` (worktree) — commit and push from this branch directly. Do NOT create a feature branch.`;
	}

	if (isHomeBranch(branch)) {
		return `⚠ BRANCH WARNING: You are on \`${branch}\` (a protected branch). You MUST create a feature branch before writing any files.\n\nRun this exact command first:\n\`\`\`\nrm -f .git/index.lock 2>/dev/null; git checkout -q -b feat/N-slug main\n\`\`\`\n\nDo NOT attempt Write, Edit, or Bash commits until you have created a feature branch.`;
	}

	return `✓ Current branch: \`${branch}\` — ready to implement.`;
}

function main() {
	const projectDir = process.env.CLAUDE_PROJECT_DIR || ".";
	const personalityPath = resolve(projectDir, ".claudius/personality.md");

	let personality = "";
	if (existsSync(personalityPath)) {
		try {
			personality = readFileSync(personalityPath, "utf-8");
		} catch {
			// Silent fail — personality is nice to have, not a hard requirement
		}
	}

	const branch = getCurrentBranch();
	const inWorktree = branch.startsWith("worktree-") ? detectInWorktree() : undefined;
	const branchWarning = getBranchWarning(branch, inWorktree);

	const parts = [personality, branchWarning].filter(Boolean);
	if (parts.length === 0) return;

	console.log(JSON.stringify({ context: parts.join("\n\n---\n\n") }));
}

main();
