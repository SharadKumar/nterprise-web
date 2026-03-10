#!/usr/bin/env bash
# merge-pr.sh — Worktree-safe PR merge.
#
# Usage: bash .claude/scripts/merge-pr.sh <PR-number>
#
# Behavior:
#   - From a worktree: API-only merge. NEVER touches the main checkout.
#   - From the main checkout: gh pr merge with fallback to API merge.
#
# Exit codes: 0 = merged, 1 = merge failed

set -euo pipefail

PR="${1:-}"
if [[ -z "$PR" ]]; then
  echo "Usage: bash merge-pr.sh <PR-number>" >&2
  exit 1
fi

# Detect context BEFORE any cd
ORIGINAL_GIT_DIR=$(git rev-parse --git-dir 2>/dev/null)
IN_WORKTREE=false
if [[ "$ORIGINAL_GIT_DIR" == */.git/worktrees/* ]] || [[ "$ORIGINAL_GIT_DIR" == */worktrees/* ]]; then
  IN_WORKTREE=true
fi

# Get PR metadata (works from any context)
BRANCH=$(gh pr view "$PR" --json headRefName --jq '.headRefName' 2>/dev/null)
REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner' 2>/dev/null)

echo "Merging PR #$PR ($BRANCH) in $REPO..."

if $IN_WORKTREE; then
  # --- WORKTREE PATH ---
  # CRITICAL: Never cd to main checkout. Never run git checkout.
  # Use GitHub API only — zero local branch operations.
  TITLE=$(gh pr view "$PR" --json title --jq '.title')
  gh api "repos/$REPO/pulls/$PR/merge" \
    -X PUT \
    -f merge_method=squash \
    -f commit_title="$TITLE" \
    --silent

  echo "Merged via API (worktree-safe)."

  # Delete remote branch via API (no local git operations)
  gh api "repos/$REPO/git/refs/heads/$BRANCH" -X DELETE --silent 2>/dev/null \
    && echo "Deleted remote branch: $BRANCH" \
    || echo "⚠ Could not delete remote branch: $BRANCH"

  # Fetch latest main (doesn't change any local branch)
  git fetch origin main 2>/dev/null || true

else
  # --- MAIN CHECKOUT PATH ---
  # Save current branch to restore after merge
  SAVED_BRANCH=$(git branch --show-current 2>/dev/null || echo "")

  # Try gh pr merge (happy path)
  if gh pr merge "$PR" --squash --delete-branch 2>/dev/null; then
    echo "Merged via gh pr merge."
  else
    echo "gh pr merge failed — falling back to API merge..."

    TITLE=$(gh pr view "$PR" --json title --jq '.title')
    gh api "repos/$REPO/pulls/$PR/merge" \
      -X PUT \
      -f merge_method=squash \
      -f commit_title="$TITLE" \
      --silent

    echo "Merged via API."

    # Delete remote branch
    if git ls-remote --exit-code origin "$BRANCH" &>/dev/null; then
      git push origin --delete "$BRANCH" 2>/dev/null \
        && echo "Deleted remote branch: $BRANCH" \
        || echo "⚠ Could not delete remote branch: $BRANCH"
    fi
  fi

  # Sync main
  git checkout main 2>/dev/null || true
  git pull --ff-only origin main 2>/dev/null || {
    echo "⚠ main has diverged — fast-forward not possible."
  }

  # Restore original branch if it still exists and wasn't the merged branch
  if [[ -n "$SAVED_BRANCH" ]] && [[ "$SAVED_BRANCH" != "$BRANCH" ]] && [[ "$SAVED_BRANCH" != "main" ]]; then
    git checkout "$SAVED_BRANCH" 2>/dev/null || true
  fi
fi
