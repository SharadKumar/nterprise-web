#!/usr/bin/env bun
/**
 * Claudius Slack CLI — generic messaging primitives for agent use.
 *
 * Usage:
 *   bun .claude/scripts/slack.ts send --channel C123ABC --text "message"
 *   → prints: C123ABC:1234567890.123456   (stored as thread ref)
 *
 *   bun .claude/scripts/slack.ts reply --thread C123ABC:1234567890.123456 --text "message"
 *   → prints: ok
 *
 * Environment:
 *   SLACK_BOT_TOKEN      required
 *   SLACK_SIGNING_SECRET optional (only needed for incoming webhooks)
 */

import { Chat, ThreadImpl } from "chat";
import { createSlackAdapter } from "@chat-adapter/slack";
import { createMemoryState } from "@chat-adapter/state-memory";

// ── Arg parsing ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const command = args[0];

function flag(name: string): string | undefined {
	const i = args.indexOf(`--${name}`);
	return i !== -1 ? args[i + 1] : undefined;
}

// ── Validate env ─────────────────────────────────────────────────────────────

const token = process.env.SLACK_BOT_TOKEN;
if (!token) {
	console.error("Error: SLACK_BOT_TOKEN is not set");
	process.exit(1);
}

// signingSecret is only used for verifying incoming webhooks.
// For outbound-only use, any non-empty value satisfies the SDK's validation.
const signingSecret = process.env.SLACK_SIGNING_SECRET ?? "not-used-for-outbound";

// ── Init Chat SDK ─────────────────────────────────────────────────────────────

const bot = new Chat({
	userName: "claudius",
	adapters: {
		slack: createSlackAdapter({
			signingSecret,
			botToken: token,
		}),
	},
	state: createMemoryState(),
});

bot.registerSingleton();
await bot.initialize();

// ── Commands ─────────────────────────────────────────────────────────────────

if (command === "send") {
	const channel = flag("channel");
	const text = flag("text");

	if (!channel || !text) {
		console.error("Usage: slack.ts send --channel CHANNEL_ID --text MESSAGE");
		process.exit(1);
	}

	const sent = await bot.channel(`slack:${channel}`).post(text);
	// Print thread ref: "channelId:messageTs" — store this for later replies
	// sent.id is the Slack message timestamp (ts)
	process.stdout.write(`${channel}:${sent.id}\n`);
} else if (command === "reply") {
	const threadRef = flag("thread");
	const text = flag("text");

	if (!threadRef || !text) {
		console.error("Usage: slack.ts reply --thread CHANNEL_ID:THREAD_TS --text MESSAGE");
		process.exit(1);
	}

	const [channelId, messageTs] = threadRef.split(":");
	const thread = ThreadImpl.fromJSON({
		_type: "chat:Thread",
		adapterName: "slack",
		channelId: `slack:${channelId}`,
		id: `slack:${channelId}:${messageTs}`,
		isDM: false,
	});

	await thread.post(text);
	process.stdout.write("ok\n");
} else {
	console.error(`Unknown command: ${command ?? "(none)"}. Use 'send' or 'reply'.`);
	process.exit(1);
}
