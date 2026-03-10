#!/usr/bin/env bash
# merge-pr.sh — Robust PR merge that works regardless of CWD or worktree state.
#
# Usage: bash .claude/scripts/merge-pr.sh <PR-number>
#
# Behavior:
#   1. Resolve the main repo root via git-common-dir (CWD-agnostic)
#   2. cd to main root before any git/gh operations
#   3. Try gh pr merge (happy path — works when main is not checked out elsewhere)
#   4. On failure, fall back to GitHub API merge + remote branch deletion
#   5. Sync home branch inline (no external script dependency)
#
# Exit codes: 0 = merged + synced, 1 = merge failed, 2 = sync failed

set -euo pipefail

PR="${1:-}"
if [[ -z "$PR" ]]; then
  echo "Usage: bash merge-pr.sh <PR-number>" >&2
  exit 1
fi

# Resolve main repo root — works from any CWD (worktree, subdir, main checkout)
GIT_COMMON_DIR=$(git rev-parse --git-common-dir 2>/dev/null)
MAIN_ROOT=$(cd "$(git rev-parse --show-toplevel)" && cd "$(git rev-parse --git-common-dir)/.." && pwd)

cd "$MAIN_ROOT"

# Get branch name before merging (needed for API fallback cleanup)
BRANCH=$(gh pr view "$PR" --json headRefName --jq '.headRefName' 2>/dev/null)
REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner' 2>/dev/null)

echo "Merging PR #$PR ($BRANCH) in $REPO..."

# Happy path: gh pr merge handles everything locally
if gh pr merge "$PR" --squash --delete-branch 2>/dev/null; then
  echo "Merged via gh pr merge."
else
  echo "gh pr merge failed (likely worktree conflict) — falling back to API merge..."

  # API merge
  TITLE=$(gh pr view "$PR" --json title --jq '.title')
  gh api "repos/$REPO/pulls/$PR/merge" \
    -X PUT \
    -f merge_method=squash \
    -f commit_title="$TITLE" \
    --silent

  echo "Merged via API."

  # Delete remote branch
  if git ls-remote --exit-code origin "$BRANCH" &>/dev/null; then
    git push origin --delete "$BRANCH" 2>/dev/null && echo "Deleted remote branch: $BRANCH" || echo "⚠ Could not delete remote branch: $BRANCH"
  fi
fi

# Re-anchor to main root (gh pr merge may change CWD)
cd "$MAIN_ROOT"

# Inline sync: return to home branch
# Detect if this script was invoked from a worktree context
GIT_DIR=$(git rev-parse --git-dir 2>/dev/null)

if [[ "$GIT_DIR" == */.git/worktrees/* ]]; then
  WORKTREE_NAME=$(basename "$GIT_DIR")
  HOME_BRANCH="worktree-$WORKTREE_NAME"
  git checkout "$HOME_BRANCH" 2>/dev/null || true
  echo "Returned to home branch: $HOME_BRANCH"
else
  # Root repo — return to main and sync
  git checkout main 2>/dev/null || true
  if git pull --ff-only origin main 2>/dev/null; then
    echo "main synced to latest."
  else
    echo "⚠ main has diverged from origin/main — fast-forward not possible."
    echo "  Resolve manually: git fetch origin && git rebase origin/main"
    exit 2
  fi
fi
