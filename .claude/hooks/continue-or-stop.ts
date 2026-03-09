#!/usr/bin/env npx tsx
/**
 * Continue-or-Stop Hook — fires on Stop event.
 *
 * Escalation ladder when there's nothing obvious to do:
 *   1. Ready issues exist → /build #N
 *   2. No ready issues → check session-state.md Next Actions
 *   3. No session actions → check open backlog (any open issues)
 *   4. Empty backlog → Slack owner if configured, else suggest /pulse
 *   5. Always exit 2 — never silently stop and never ask the user
 *
 * Exit codes:
 *   0 — let Claude stop (failure spiral / no config)
 *   2 — block stop, inject reason as next prompt
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const MAX_CONSECUTIVE_FAILURES = 3;

interface Issue {
	number: number;
	title: string;
	labels: { name: string }[];
}

function getConsecutiveFailures(projectDir: string): number {
	const statePath = resolve(projectDir, ".claudius/pulse-state.md");
	if (!existsSync(statePath)) return 0;
	const content = readFileSync(statePath, "utf-8");
	const match = content.match(/Consecutive failures:\s*(\d+)/);
	return match ? Number.parseInt(match[1], 10) : 0;
}

function getRepo(projectDir: string): string | null {
	try {
		const configPath = resolve(projectDir, ".claudius/config.yaml");
		if (!existsSync(configPath)) return null;
		const content = readFileSync(configPath, "utf-8");
		const match = content.match(/repo:\s*["']?([^\s"']+)["']?/);
		return match ? match[1] : null;
	} catch {
		return null;
	}
}

function getSlackUserId(projectDir: string): string | null {
	try {
		const configPath = resolve(projectDir, ".claudius/config.yaml");
		if (!existsSync(configPath)) return null;
		const content = readFileSync(configPath, "utf-8");
		const match = content.match(/slackUserId:\s*["']?([^\s"'\n]+)["']?/);
		const id = match?.[1]?.trim();
		return id && id.length > 0 ? id : null;
	} catch {
		return null;
	}
}

function getIssues(repo: string, label?: string): Issue[] {
	try {
		const labelFlag = label ? `--label "${label}"` : "";
		const raw = execSync(
			`gh issue list --repo ${repo} ${labelFlag} --state open --json number,title,labels --limit 10`,
			{ encoding: "utf-8", timeout: 10_000 },
		);
		const issues: Issue[] = JSON.parse(raw.trim());
		return issues.filter((i) => !i.labels.some((l) => l.name === "in-progress"));
	} catch {
		return [];
	}
}

function getSessionNextActions(projectDir: string): string[] {
	try {
		const statePath = resolve(projectDir, ".claudius/session-state.md");
		if (!existsSync(statePath)) return [];
		const content = readFileSync(statePath, "utf-8");
		const match = content.match(/## Next Actions\n([\s\S]*?)(?:\n##|$)/);
		if (!match) return [];
		return match[1]
			.split("\n")
			.map((l) => l.replace(/^[-*]\s*/, "").trim())
			.filter(Boolean);
	} catch {
		return [];
	}
}

async function sendSlackMessage(userId: string, message: string): Promise<void> {
	const token = process.env.SLACK_BOT_TOKEN;
	const channel = process.env.SLACK_CHANNEL || userId;
	if (!token) return;

	try {
		const response = await fetch("https://slack.com/api/chat.postMessage", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ channel, text: message }),
		});
		const data = (await response.json()) as { ok: boolean };
		if (!data.ok) throw new Error("Slack API returned ok:false");
	} catch {
		// Best effort
	}
}

function block(reason: string): never {
	console.log(JSON.stringify({ decision: "block", reason }));
	process.exit(2);
}

async function main() {
	const projectDir = process.env.CLAUDE_PROJECT_DIR || ".";

	// Failure guard — don't nudge into an infinite failure loop
	const failures = getConsecutiveFailures(projectDir);
	if (failures >= MAX_CONSECUTIVE_FAILURES) {
		process.exit(0);
	}

	const repo = getRepo(projectDir);
	if (!repo) {
		process.exit(0);
	}

	// 1. Ready issues — highest priority
	const ready = getIssues(repo, "ready");
	if (ready.length > 0) {
		const top = ready[0];
		const others = ready.length > 1 ? ` (${ready.length - 1} more in queue)` : "";
		block(
			[
				"Work is available. Use /build to implement it — do not ask the user.",
				"",
				`Next: Issue #${top.number} — "${top.title}"${others}`,
				`Run: /build #${top.number}`,
			].join("\n"),
		);
	}

	// 2. Session-state Next Actions
	const nextActions = getSessionNextActions(projectDir);
	if (nextActions.length > 0) {
		block(
			[
				"No ready issues, but session-state.md has pending actions. Pick one up:",
				"",
				...nextActions.slice(0, 3).map((a) => `  - ${a}`),
			].join("\n"),
		);
	}

	// 3. Open backlog (any open issues, not just "ready")
	const backlog = getIssues(repo);
	if (backlog.length > 0) {
		const top = backlog[0];
		block(
			[
				"No ready issues. Backlog has open work — groom it or pick it up.",
				"",
				`Top backlog item: Issue #${top.number} — "${top.title}"`,
				`Groom with /backlog, or implement with /build #${top.number}`,
			].join("\n"),
		);
	}

	// 4. Backlog empty — Slack owner or suggest /pulse
	const slackUserId = getSlackUserId(projectDir);
	if (slackUserId) {
		await sendSlackMessage(
			slackUserId,
			`All work complete! Backlog is empty for ${repo}. Ping me with what to work on next.`,
		);
		block(
			[
				"Backlog is empty. Sent Slack message to owner for next direction.",
				"Run /pulse to check for any background ideation or triage work.",
			].join("\n"),
		);
	}

	block(
		[
			"Backlog is empty. Options:",
			"  1. Run /pulse — scan for ideation, memory gaps, or triage work",
			"  2. Run /backlog — identify and create new issues from current goals",
			"  3. If truly nothing to do, respond: 'All work complete. Backlog is empty.'",
		].join("\n"),
	);
}

main().catch(() => process.exit(0));
