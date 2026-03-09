#!/usr/bin/env npx tsx
/**
 * Context Inject Hook — Subagent gap + cost reporting
 * Trigger: SubagentStart
 *
 * Injects gap-reporting format, skill observation format, and cost
 * awareness into every subagent spawned by the manager.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function getBudgetInfo(): string {
	const projectDir = process.env.CLAUDE_PROJECT_DIR || ".";
	const costLogPath = resolve(projectDir, ".claudius/costs.jsonl");

	if (!existsSync(costLogPath)) return "Budget: no cost data yet.";

	try {
		const lines = readFileSync(costLogPath, "utf-8").trim().split("\n").filter(Boolean);
		const total = lines.reduce((sum, line) => {
			const entry = JSON.parse(line);
			return sum + (entry.amountUsd || 0);
		}, 0);

		const configPath = resolve(projectDir, ".claudius/config.yaml");
		let cap = 50;
		if (existsSync(configPath)) {
			const content = readFileSync(configPath, "utf-8");
			const match = content.match(/budgetCapUsd:\s*(\d+)/);
			if (match) cap = Number.parseInt(match[1], 10);
		}

		const pct = Math.round((total / cap) * 100);
		return `Budget: $${total.toFixed(2)} / $${cap} (${pct}%)${pct >= 80 ? " ⚠ approaching limit" : ""}`;
	} catch {
		return "Budget: unable to read cost data.";
	}
}

function getGoals(): string {
	const projectDir = process.env.CLAUDE_PROJECT_DIR || ".";
	const configPath = resolve(projectDir, ".claudius/config.yaml");

	if (!existsSync(configPath)) return "";

	try {
		const content = readFileSync(configPath, "utf-8");
		const goalsMatch = content.match(/goals:\n((?:\s+-\s+.+\n?)+)/);
		if (!goalsMatch) return "";
		const goals = goalsMatch[1]
			.split("\n")
			.map((l) => l.replace(/^\s+-\s+/, "").replace(/^["']|["']$/g, "").trim())
			.filter(Boolean);
		if (goals.length === 0) return "";
		return `### Project Goals\n${goals.map((g) => `- ${g}`).join("\n")}\n\nAlign your work with these goals. Prioritize actions that advance them.`;
	} catch {
		return "";
	}
}

function getPersonality(): string {
	const projectDir = process.env.CLAUDE_PROJECT_DIR || ".";
	const personalityPath = resolve(projectDir, ".claudius/personality.md");
	if (!existsSync(personalityPath)) return "";
	try {
		return readFileSync(personalityPath, "utf-8");
	} catch {
		return "";
	}
}

function main() {
	const budgetInfo = getBudgetInfo();
	const goalsInfo = getGoals();
	const personality = getPersonality();

	const context = `${personality ? `${personality}\n\n---\n\n` : ""}## Claudius Subagent Context

### ${budgetInfo}

${goalsInfo}

Be efficient with tool calls. Check loaded context before searching. Avoid redundant reads.

### Gap Reporting

If you discover issues during your work (bugs, missing features, tech debt, security concerns),
report them at the END of your response using this exact format:

GAPS_DETECTED:
[
  {
    "category": "feature|bug|chore|security",
    "severity": "critical|high|medium|low",
    "title": "Verb-first issue title",
    "description": "What the gap is and why it matters",
    "location": "file:line or module name"
  }
]
END_GAPS

Rules:
- Maximum 5 gaps per response
- Prioritize by severity (critical > high > medium > low)
- Only report genuine issues, not style preferences
- Title must be verb-first (Add..., Fix..., Update..., Remove...)

### Skill Observations

If you notice capability friction or patterns worth tracking, report at the END:

SKILLS_OBSERVED:
[
  {
    "category": "pattern|error|debt",
    "topic": "short-slug",
    "signal": "What was observed",
    "context": "Why it matters"
  }
]
END_SKILLS

Rules:
- Maximum 3 observations per response
- Only report meaningful signals, not routine operations
- "pattern" = tech actively used; "error" = recurring friction; "debt" = manual workaround needed
`;

	console.log(JSON.stringify({ context }));
}

main();
