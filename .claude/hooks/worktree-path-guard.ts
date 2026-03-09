#!/usr/bin/env npx tsx
/**
 * Worktree Path Guard Hook
 *
 * Triggered: Before Write/Edit tool execution
 * Purpose: Block writes targeting the main repo checkout when the session
 *          is running inside a git worktree (CLAUDE_PROJECT_DIR is a worktree path).
 *
 * Problem: When a session runs inside a worktree, absolute paths pointing to
 * the main repo checkout silently land on whatever branch the main repo is on,
 * bypassing worktree isolation entirely.
 *
 * Detection:
 * 1. Session is in a worktree: CLAUDE_PROJECT_DIR contains .claude/worktrees/
 * 2. File path targets main repo: resolved path is inside main repo but outside worktree root
 *
 * Action: Block with a clear message + suggest the correct worktree-equivalent path.
 * Fails open on any error to avoid blocking legitimate work.
 */

import { execSync } from 'node:child_process';
import { relative, resolve } from 'node:path';

interface HookInput {
	tool_input?: {
		file_path?: string;
	};
}

interface HookOutput {
	decision: 'approve' | 'block';
	reason?: string;
}

async function parseInput(): Promise<HookInput> {
	return new Promise((resolve) => {
		let data = '';
		process.stdin.setEncoding('utf-8');
		process.stdin.on('data', (chunk) => {
			data += chunk;
		});
		process.stdin.on('end', () => {
			try {
				resolve(data.trim() ? JSON.parse(data) : {});
			} catch {
				resolve({});
			}
		});
		process.stdin.on('error', () => {
			resolve({});
		});
		setTimeout(() => {
			resolve({});
		}, 100);
	});
}

function allow(): void {
	process.stdout.write(
		JSON.stringify({ decision: 'approve' } satisfies HookOutput),
	);
}

function block(reason: string): void {
	process.stdout.write(
		JSON.stringify({ decision: 'block', reason } satisfies HookOutput),
	);
}

export function isSessionInWorktree(projectDir: string): boolean {
	return projectDir.includes('/.claude/worktrees/');
}

/** Derives the main repo root from git's common dir. Returns null on failure. */
export function getMainRepoRoot(worktreeRoot: string): string | null {
	try {
		const gitCommonDir = execSync('git rev-parse --git-common-dir', {
			encoding: 'utf-8',
			stdio: ['pipe', 'pipe', 'pipe'],
			cwd: worktreeRoot,
		}).trim();

		const absoluteGitDir = resolve(worktreeRoot, gitCommonDir);
		return absoluteGitDir.endsWith('/.git')
			? absoluteGitDir.slice(0, -5)
			: null;
	} catch {
		return null;
	}
}

export function checkPath(
	filePath: string,
	projectDir: string,
	mainRepoRoot: string,
): HookOutput {
	const worktreeRoot = projectDir;
	const absoluteFilePath = resolve(worktreeRoot, filePath);

	// Already inside the worktree — fine
	if (
		absoluteFilePath.startsWith(`${worktreeRoot}/`) ||
		absoluteFilePath === worktreeRoot
	) {
		return { decision: 'approve' };
	}

	// Path outside both worktree and main repo — not our concern
	if (
		!absoluteFilePath.startsWith(`${mainRepoRoot}/`) &&
		absoluteFilePath !== mainRepoRoot
	) {
		return { decision: 'approve' };
	}

	// Path targets main repo while session is in a worktree — block
	const relPath = relative(mainRepoRoot, absoluteFilePath);
	const worktreeEquivalent = resolve(worktreeRoot, relPath);

	return {
		decision: 'block',
		reason:
			`[worktree-path-guard] Write blocked: path targets the main repo, not this worktree.\n\n` +
			`  Session worktree: ${worktreeRoot}\n` +
			`  Attempted path:   ${absoluteFilePath}\n\n` +
			`Writes to the main repo land on a different branch (whatever HEAD the main checkout is on).\n\n` +
			`Use the worktree-equivalent path instead:\n` +
			`  ${worktreeEquivalent}`,
	};
}

async function main(): Promise<void> {
	const input = await parseInput();
	const filePath = input.tool_input?.file_path;

	if (!filePath) {
		allow();
		return;
	}

	const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

	if (!isSessionInWorktree(projectDir)) {
		allow();
		return;
	}

	const mainRepoRoot = getMainRepoRoot(projectDir);

	// Can't determine main repo — fail open
	if (!mainRepoRoot) {
		allow();
		return;
	}

	const result = checkPath(filePath, projectDir, mainRepoRoot);
	if (result.decision === 'block' && result.reason) {
		block(result.reason);
	} else {
		allow();
	}
}

main().catch(() => {
	allow();
});
