---
name: nightly-report
cron: "0 22 * * *"
enabled: true
timeout: 300
---
Generate and email a nightly status report:

1. Gather data:
   - PRs merged today: `gh pr list --state merged --search "merged:>=$(date -v-1d +%Y-%m-%d)" --json number,title`
   - Issues closed today: `gh issue list --state closed --search "closed:>=$(date -v-1d +%Y-%m-%d)" --json number,title`
   - Open issues: `gh issue list --state open --json number,title,labels --limit 20`
   - Open PRs: `gh pr list --state open --json number,title --limit 10`
   - Session costs from `.claude/logs/costs/sessions.jsonl` if it exists

2. Compose an HTML email with dark-theme branding:
   - Background: #1a1a2e
   - Card background: #16213e
   - Accent: #e94560
   - Text: #eee
   - Include sections: Summary, PRs Merged, Issues Closed, Open Work, Costs, Blockers

3. Send the email using `EmailSender` from `src/lib/email.ts`:
   - Read recipient from `.claudius/config.yaml` field `email.to`
   - Subject: "Claudius Nightly Report — {date}"
