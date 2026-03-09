#!/usr/bin/env npx tsx
/**
 * Learner Hook — Session end: capture gaps + prompt reflection
 * Trigger: Stop
 *
 * Parses GAPS_DETECTED blocks from the session, writes to
 * .claudius/gaps.jsonl, and prompts /reflect for substantive sessions.
 */

import { readFileSync, appendFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

interface Gap {
	category: string;
	severity: string;
	title: string;
	description: string;
	location?: string;
}

interface HookInput {
	transcript_summary?: string;
	session_id?: string;
}

function parseGaps(text: string): Gap[] {
	const gaps: Gap[] = [];
	const regex = /GAPS_DETECTED:\s*\n?\s*(\[[\s\S]*?\])\s*\n?\s*END_GAPS/g;
	let match: RegExpExecArray | null;

	// biome-ignore lint/suspicious/noAssignInExpressions: regex exec loop pattern
	while ((match = regex.exec(text)) !== null) {
		try {
			const parsed = JSON.parse(match[1]);
			if (Array.isArray(parsed)) {
				gaps.push(...parsed);
			}
		} catch {
			// Malformed JSON — skip
		}
	}

	return gaps;
}

function writeGaps(gaps: Gap[], sessionId: string, projectDir: string): void {
	const gapsPath = resolve(projectDir, ".claudius/gaps.jsonl");
	const dir = dirname(gapsPath);
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}

	for (const gap of gaps) {
		const entry = {
			...gap,
			sessionId,
			timestamp: new Date().toISOString(),
		};
		appendFileSync(gapsPath, `${JSON.stringify(entry)}\n`);
	}
}

function main() {
	const projectDir = process.env.CLAUDE_PROJECT_DIR || ".";
	let input: HookInput = {};

	try {
		input = JSON.parse(readFileSync("/dev/stdin", "utf-8"));
	} catch {
		// No input is fine
	}

	const sessionId = input.session_id || `session-${Date.now()}`;
	const transcript = input.transcript_summary || "";

	// Parse any gaps from the transcript
	const gaps = parseGaps(transcript);
	if (gaps.length > 0) {
		writeGaps(gaps, sessionId, projectDir);
	}

	// Build advisory context
	const messages: string[] = [];

	if (gaps.length > 0) {
		messages.push(
			`Captured ${gaps.length} gap(s) to .claudius/gaps.jsonl.`,
		);
	}

	// Check if substantive work happened (heuristic: transcript length)
	const isSubstantive = transcript.length > 500;

	if (isSubstantive) {
		messages.push(
			"Substantive session detected. Run /reflect to capture learnings to memory.",
		);
	}

	// Check for uncaptured gaps in recent work
	const gapsPath = resolve(projectDir, ".claudius/gaps.jsonl");
	if (existsSync(gapsPath)) {
		try {
			const lines = readFileSync(gapsPath, "utf-8").trim().split("\n").filter(Boolean);
			const recentGaps = lines
				.map((l) => JSON.parse(l))
				.filter(
					(g: { timestamp: string }) =>
						Date.now() - new Date(g.timestamp).getTime() < 24 * 60 * 60 * 1000,
				);
			if (recentGaps.length > 0) {
				messages.push(
					`${recentGaps.length} gap(s) logged in last 24h. Consider creating GitHub issues.`,
				);
			}
		} catch {
			// Corrupted file — ignore
		}
	}

	if (messages.length > 0) {
		console.log(JSON.stringify({ context: messages.join("\n") }));
	}
}

main();
