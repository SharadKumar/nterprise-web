#!/usr/bin/env bash
# project-status.sh — Update Project #6 Status and Execution fields for an issue.
#
# Usage: bash .claude/scripts/project-status.sh <issue-number> <status> <execution>
#
# Status values:  Todo | "In Progress" | "Under Review" | Blocked
# Execution values: Queued | Running | Review | Blocked
#
# Both fields are updated atomically. Missing or invalid values are skipped silently.
# All operations are best-effort — failures are logged but never fatal.

set -euo pipefail

ISSUE_NUMBER="${1:?Usage: project-status.sh <issue-number> <status> <execution>}"
STATUS="${2:?Missing status value}"
EXECUTION="${3:?Missing execution value}"

# --- Project #6 constants ---
PROJECT_ID="PVT_kwHOAFO-EM4BRTW5"
STATUS_FIELD="PVTSSF_lAHOAFO-EM4BRTW5zg_K3tE"
EXECUTION_FIELD="PVTSSF_lAHOAFO-EM4BRTW5zg_Lokk"

# Resolve Status option ID
case "$STATUS" in
  "Todo")           STATUS_OPT="6ed537f9" ;;
  "In Progress")    STATUS_OPT="0d583361" ;;
  "Under Review")   STATUS_OPT="173633ca" ;;
  "Blocked")        STATUS_OPT="d239ddb3" ;;
  *) echo "[project-status] Unknown status: $STATUS" >&2; exit 1 ;;
esac

# Resolve Execution option ID
case "$EXECUTION" in
  "Queued")   EXECUTION_OPT="f00eea4e" ;;
  "Running")  EXECUTION_OPT="14585208" ;;
  "Review")   EXECUTION_OPT="8e0939cc" ;;
  "Blocked")  EXECUTION_OPT="65e212b0" ;;
  *) echo "[project-status] Unknown execution: $EXECUTION" >&2; exit 1 ;;
esac

# Get issue URL
ISSUE_URL=$(gh issue view "$ISSUE_NUMBER" --json url --jq '.url' 2>/dev/null || echo "")
if [ -z "$ISSUE_URL" ]; then
  echo "[project-status] Could not find issue #$ISSUE_NUMBER" >&2
  exit 0
fi

# Add to project (idempotent) — returns the item ID whether new or existing
ITEM_ID=$(gh project item-add 6 --owner SharadKumar --url "$ISSUE_URL" --format json --jq '.id' 2>/dev/null || echo "")

if [ -z "$ITEM_ID" ]; then
  echo "[project-status] Could not add/find issue #$ISSUE_NUMBER in Project #6" >&2
  exit 0
fi

# Update both fields
gh project item-edit --id "$ITEM_ID" \
  --project-id "$PROJECT_ID" \
  --field-id "$STATUS_FIELD" \
  --single-select-option-id "$STATUS_OPT" 2>/dev/null || true

gh project item-edit --id "$ITEM_ID" \
  --project-id "$PROJECT_ID" \
  --field-id "$EXECUTION_FIELD" \
  --single-select-option-id "$EXECUTION_OPT" 2>/dev/null || true

echo "[project-status] #$ISSUE_NUMBER → Status: $STATUS, Execution: $EXECUTION"
