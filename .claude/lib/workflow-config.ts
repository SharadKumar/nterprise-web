import { resolve } from 'node:path';

/**
 * Shared Workflow Configuration
 *
 * Canonical values imported by hooks. Hooks run as standalone processes
 * without access to rules, so they read configuration from this file.
 *
 * Source of truth for rules: .claude/rules/ (auto-loaded into agent sessions)
 * Source of truth for hooks: this file (imported at runtime)
 */

/** Branches protected from direct commits/pushes */
export const PROTECTED_BRANCHES = ['main', 'master'] as const;

/** Branch naming patterns */
export const BRANCH_PATTERNS = {
	/** Matches feature/fix/chore branches: type/N-slug */
	issueFromBranch: /^(?:feat|fix|chore)\/(\d+)-/,
	/** Matches native worktree branches: worktree-<name> */
	worktreeBranch: /^worktree-(\d+)$/,
	/** All valid branch type prefixes */
	validTypes: ['feat', 'fix', 'chore'] as const,
} as const;

/** Worktree configuration */
export const WORKTREE = {
	/** Native base directory for claude -w worktrees */
	nativeBasePath: '.claude/worktrees',
	/** All base paths to check */
	allBasePaths: ['.claude/worktrees'] as const,
} as const;

// ─── Branch / Worktree Utilities ─────────────────────────────────────────────

/**
 * Check if a branch name is protected (main or master).
 */
export function isProtectedBranch(branch: string): boolean {
	return (PROTECTED_BRANCHES as readonly string[]).includes(branch);
}

/**
 * Extract issue number from a branch name.
 * Checks conventional patterns (feat/N-slug) first, then worktree branches (worktree-N).
 * Returns null if the branch doesn't match any expected pattern.
 */
export function extractIssueFromBranch(branch: string): number | null {
	const conventionalMatch = branch.match(BRANCH_PATTERNS.issueFromBranch);
	if (conventionalMatch) return Number.parseInt(conventionalMatch[1], 10);

	const worktreeMatch = branch.match(BRANCH_PATTERNS.worktreeBranch);
	if (worktreeMatch) return Number.parseInt(worktreeMatch[1], 10);

	return null;
}

export interface WorktreeInfo {
	inWorktree: boolean;
	root: string | null;
	source: 'native' | null;
	name: string | null;
}

/**
 * Detect if a file path is inside any known worktree directory.
 */
export function getWorktreeInfo(
	filePath: string,
	projectDir: string,
): WorktreeInfo {
	const absolutePath = resolve(projectDir, filePath);

	for (const basePath of WORKTREE.allBasePaths) {
		const worktreesDir = resolve(projectDir, basePath);
		if (absolutePath.startsWith(`${worktreesDir}/`)) {
			const relativePath = absolutePath.slice(worktreesDir.length + 1);
			const worktreeName = relativePath.split('/')[0];
			if (worktreeName) {
				return {
					inWorktree: true,
					root: resolve(worktreesDir, worktreeName),
					source: 'native',
					name: worktreeName,
				};
			}
		}
	}

	return { inWorktree: false, root: null, source: null, name: null };
}

/**
 * Check if a git toplevel path is inside a known worktree directory.
 */
export function isInWorktreePath(
	toplevel: string,
	projectDir: string,
): boolean {
	for (const basePath of WORKTREE.allBasePaths) {
		const worktreesDir = resolve(projectDir, basePath);
		if (toplevel.startsWith(worktreesDir)) return true;
	}
	return false;
}
