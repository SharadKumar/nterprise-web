#!/usr/bin/env npx tsx
/**
 * Cost Watch Hook — Budget enforcement
 * Trigger: PostToolUse (Bash)
 *
 * Reads cumulative spend from .claudius/costs.jsonl.
 * Warns at 50% of budget, advisory blocks at 90%.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

interface CostEntry {
	amountUsd: number;
}

function main() {
	const projectDir = process.env.CLAUDE_PROJECT_DIR || ".";
	const configPath = resolve(projectDir, ".claudius/config.yaml");
	const costLogPath = resolve(projectDir, ".claudius/costs.jsonl");

	// Read budget cap from config
	let budgetCap = 50;
	if (existsSync(configPath)) {
		try {
			const content = readFileSync(configPath, "utf-8");
			const match = content.match(/budgetCapUsd:\s*(\d+)/);
			if (match) budgetCap = Number.parseInt(match[1], 10);
		} catch {
			// Use default
		}
	}

	// Read total spend
	let totalSpend = 0;
	if (existsSync(costLogPath)) {
		try {
			const lines = readFileSync(costLogPath, "utf-8")
				.trim()
				.split("\n")
				.filter(Boolean);
			totalSpend = lines.reduce((sum, line) => {
				const entry: CostEntry = JSON.parse(line);
				return sum + (entry.amountUsd || 0);
			}, 0);
		} catch {
			// Corrupted log — proceed without cost data
		}
	}

	const pct = budgetCap > 0 ? totalSpend / budgetCap : 0;

	// At 90%+: advisory context warning (not a hard block — leave that to daemon)
	if (pct >= 0.9) {
		console.log(
			JSON.stringify({
				decision: "approve",
				context: `⚠ Budget critical: $${totalSpend.toFixed(2)} / $${budgetCap} (${Math.round(pct * 100)}%). Consider wrapping up this session.`,
			}),
		);
		return;
	}

	// At 50%+: info-level awareness
	if (pct >= 0.5) {
		console.log(
			JSON.stringify({
				decision: "approve",
				context: `Budget: $${totalSpend.toFixed(2)} / $${budgetCap} (${Math.round(pct * 100)}%).`,
			}),
		);
		return;
	}

	// Under 50%: silent approve
	console.log(JSON.stringify({ decision: "approve" }));
}

main();
