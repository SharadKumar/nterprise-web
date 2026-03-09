#!/usr/bin/env bash
# DEPRECATED: sync-home.sh — No longer called by merge-pr.sh (sync logic is inlined).
# Kept for backward compatibility. Use merge-pr.sh directly instead.
#
# sync-home.sh — Return to home branch after PR merge.
#
# Behavior:
#   Root repo  → git checkout main && git pull --ff-only origin main
#   Worktree   → git checkout worktree-<name>   (derived from git-dir)
#
# Exit codes: 0 = success, 1 = fast-forward failed (manual resolve needed)

set -euo pipefail

GIT_DIR=$(git rev-parse --git-dir 2>/dev/null)

if [[ "$GIT_DIR" == */.git/worktrees/* ]]; then
  WORKTREE_NAME=$(basename "$GIT_DIR")
  HOME_BRANCH="worktree-$WORKTREE_NAME"
  git checkout "$HOME_BRANCH"
  echo "Returned to home branch: $HOME_BRANCH"
  exit 0
fi

# Root repo — return to main and sync
git checkout main

if git pull --ff-only origin main; then
  echo "main synced to latest."
else
  echo "⚠ main has diverged from origin/main — fast-forward not possible."
  echo "  Resolve manually: git fetch origin && git rebase origin/main"
  exit 1
fi
