#!/usr/bin/env bash
# workpad-upsert.sh — posts or updates the <!-- claudius:workpad --> sticky comment
# on a GitHub issue. Idempotent: finds existing workpad comment and patches it in-place.
#
# Usage:
#   bash .claude/scripts/workpad-upsert.sh <issue-number> <status> [plan] [acs] [validation] [attempts]
#
# Arguments:
#   issue-number  GitHub issue number (required)
#   status        Status line, e.g. "🔄 Claimed — reading issue" (required)
#   plan          Plan text (optional, default: "TBD")
#   acs           ACs markdown (optional, default: "- [ ] (loading from issue)")
#   validation    Validation status (optional, default: "pending")
#   attempts      Build attempt count (optional, default: 1)
#
# Example:
#   bash .claude/scripts/workpad-upsert.sh 42 "🔄 Claimed — reading issue"
#   bash .claude/scripts/workpad-upsert.sh 42 "✅ Implementation complete" "Added auth middleware" "- [x] Token validated" "bun test: 45/45 pass" 2
#
# Run from the repo root (where gh is authenticated).
set -euo pipefail

ISSUE_NUMBER="${1:?'issue-number required'}"
STATUS="${2:?'status required'}"
PLAN="${3:-TBD}"
ACS="${4:-- [ ] (loading from issue)}"
VALIDATION="${5:-pending}"
ATTEMPTS="${6:-1}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

BODY="<!-- claudius:workpad -->
**Workpad** · Updated: ${TIMESTAMP}
**Status:** ${STATUS}
**Attempts:** ${ATTEMPTS}
**Plan:** ${PLAN}
**ACs:**
${ACS}
**Validation:** ${VALIDATION}"

# Find existing workpad comment ID
EXISTING=$(gh issue view "$ISSUE_NUMBER" --json comments \
  --jq '[.comments[] | select(.body | contains("claudius:workpad"))] | last | .databaseId // empty' \
  2>/dev/null || echo "")

if [ -n "$EXISTING" ]; then
  gh api "repos/{owner}/{repo}/issues/comments/${EXISTING}" -X PATCH -f body="$BODY" >/dev/null
  echo "Workpad updated on issue #${ISSUE_NUMBER} (comment ${EXISTING})"
else
  gh issue comment "$ISSUE_NUMBER" --body "$BODY" >/dev/null
  echo "Workpad created on issue #${ISSUE_NUMBER}"
fi
