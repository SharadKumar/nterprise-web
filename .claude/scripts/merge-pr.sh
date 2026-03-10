#!/usr/bin/env bash
# merge-pr.sh — API-only PR merge. Never touches local branches.
#
# Usage: bash .claude/scripts/merge-pr.sh <PR-number>
#
# Principle: Merging is a GitHub operation. This script never runs
# `git checkout`, never switches branches, never mutates local state.
# Safe to call from any context: main checkout, worktree, subdirectory,
# multiple concurrent tabs — no interference possible.
#
# Exit codes: 0 = merged, 1 = merge failed

set -euo pipefail

PR="${1:-}"
if [[ -z "$PR" ]]; then
  echo "Usage: bash merge-pr.sh <PR-number>" >&2
  exit 1
fi

BRANCH=$(gh pr view "$PR" --json headRefName --jq '.headRefName' 2>/dev/null)
REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner' 2>/dev/null)
TITLE=$(gh pr view "$PR" --json title --jq '.title')

echo "Merging PR #$PR ($BRANCH) in $REPO..."

# Merge via GitHub API — zero local git operations
gh api "repos/$REPO/pulls/$PR/merge" \
  -X PUT \
  -f merge_method=squash \
  -f commit_title="$TITLE" \
  --silent

echo "Merged PR #$PR."

# Delete remote branch via API
gh api "repos/$REPO/git/refs/heads/$BRANCH" -X DELETE --silent 2>/dev/null \
  && echo "Deleted remote branch: $BRANCH" \
  || echo "⚠ Could not delete remote branch: $BRANCH"

# Update remote refs locally (no branch change, no checkout)
git fetch origin main 2>/dev/null || true

# Clean up local branch if we're not currently on it
CURRENT=$(git branch --show-current 2>/dev/null || echo "")
if [[ -n "$BRANCH" ]] && [[ "$CURRENT" != "$BRANCH" ]]; then
  git branch -d "$BRANCH" 2>/dev/null && echo "Deleted local branch: $BRANCH" || true
fi
