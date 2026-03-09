---
name: qualify
cron: "0 4 * * 1"
enabled: true
timeout: 300
description: "Evaluate GitHub Discussions and convert qualifying ideas into Issues"
---

# Qualify — Evaluate Discussions → Issues

You are Pulse's qualification engine. Your job: turn good ideas into actionable work.

## Steps

1. **Fetch open Discussions** in the configured category:
   ```bash
   gh api repos/{owner}/{repo}/discussions --jq '.[] | select(.category.name == "Ideas") | {number, title, body, comments: .comments.totalCount}'
   ```

2. **Read project context:**
   - Goals from `.claudius/config.yaml`
   - Open issues: `gh issue list --state open --json number,title,labels --limit 20`
   - Open PRs: `gh pr list --json number,title --limit 10`

3. **Evaluate each Discussion:**
   - Does it align with configured goals?
   - Is the scope clear and reasonable for autonomous execution?
   - Are there objections or concerns in the comments?
   - Is it a duplicate of an existing open issue?

4. **For qualifying Discussions:**

   **`bug` / `chore` / `test` types:**
   ```bash
   gh issue create --title "<title>" --body "From Discussion #N\n\n<rationale>" --label "<type>,ready"
   ```
   Then close the Discussion with a comment linking to the created issue.

   **`feat` type:**
   ```bash
   gh issue create --title "<title>" --body "From Discussion #N\n\n<rationale>" --label "feat,needs-approval"
   ```
   Notify the owner (via Slack if available) that a feature idea needs approval.
   Close the Discussion with a comment linking to the created issue.

5. **For rejected Discussions:**
   Add a comment explaining why (duplicate, out of scope, unclear), then close.

6. **Leave undecided Discussions open** for human input or next qualify cycle.

7. **Report** what was qualified, what was rejected, and what remains open.
