#!/usr/bin/env bash
# workpad-upsert.sh — posts or updates the <!-- claudius:workpad --> sticky comment.
# Idempotent: finds existing workpad comment and patches it in-place.
#
# Usage:
#   bash .claude/scripts/workpad-upsert.sh <issue-number> "<status>" ["<body>"]
#
# Arguments:
#   issue-number  GitHub issue number (required)
#   status        One-line status, e.g. "🔄 Claimed — attempt 1" (required)
#   body          Optional markdown body (ACs, validation, notes)
#
# Examples:
#   bash .claude/scripts/workpad-upsert.sh 42 "🔄 Claimed — attempt 1"
#   bash .claude/scripts/workpad-upsert.sh 42 "✅ Complete — PR #55" "- [x] AC1\n- [x] AC2"
set -euo pipefail

ISSUE_NUMBER="${1:?'issue-number required'}"
STATUS="${2:?'status required'}"
BODY="${3:-}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%MZ")

if [ -n "$BODY" ]; then
  COMMENT="<!-- claudius:workpad -->
> ${STATUS} · ${TIMESTAMP}

${BODY}"
else
  COMMENT="<!-- claudius:workpad -->
> ${STATUS} · ${TIMESTAMP}"
fi

# Find existing workpad comment ID — search ALL comments, take the last match
EXISTING=$(gh api "repos/{owner}/{repo}/issues/${ISSUE_NUMBER}/comments" \
  --paginate --jq '[.[] | select(.body | contains("claudius:workpad")) | .id] | last // empty' \
  2>/dev/null || echo "")

if [ -n "$EXISTING" ]; then
  gh api "repos/{owner}/{repo}/issues/comments/${EXISTING}" -X PATCH -f body="$COMMENT" >/dev/null
  echo "Workpad updated on issue #${ISSUE_NUMBER}"
else
  gh issue comment "$ISSUE_NUMBER" --body "$COMMENT" >/dev/null
  echo "Workpad created on issue #${ISSUE_NUMBER}"
fi
