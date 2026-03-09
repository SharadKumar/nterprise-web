# Alterego Review: Cross-Model Code Review

## Purpose

The alterego review uses OpenAI's Codex CLI to provide an independent perspective on code
changes during the `/review` and `/build` workflows. Running a second model family after the
Opus reviewer catches blind spots that arise from Claude-specific training patterns.

## Prerequisites

1. **Codex CLI installed:**
   ```bash
   npm install -g @openai/codex
   ```

2. **OpenAI API key configured:**
   ```bash
   export OPENAI_API_KEY=sk-...
   ```

3. **Model selection (optional):**
   ```bash
   export CODEX_MODEL=o3  # Default: gpt-4o-mini if not set
   ```

## Convergence Loop

The alterego review runs as a **convergence loop** (not a single pass). It iterates until
Codex returns `APPROVE` or 3 iterations are exhausted.

### Flow

```
for iteration in 1..3:
  if Codex not installed or OPENAI_API_KEY not set:
    warn "Codex unavailable, skipping alterego"
    break

  if diff_lines > 5000:
    warn "Diff too large (>5000 lines), skipping alterego"
    break

  result = codex_review(diff, issue_context)

  # Fail-open: exec errors or unparseable output skip the iteration
  if result.error or result.empty:
    warn "Codex exec failed, skipping iteration (fail-open)"
    continue

  verdict = parse_verdict(result)
  if verdict is None:
    warn "Could not parse verdict, skipping iteration (fail-open)"
    continue

  log("Alterego round {iteration}/3: {verdict}")
  post_to_pr_comment(result, iteration)

  if verdict == "APPROVE":
    break  # Converged — continue

  if verdict == "BLOCKER" and not force_alterego:
    abort_pr_creation()  # Immediate stop
    break

  # Otherwise: incorporate feedback, fix code, commit, continue loop
```

### Iteration Behavior

| Iteration | Input | On Non-APPROVE |
|-----------|-------|----------------|
| 1 | Original diff | Fix code, commit, re-diff |
| 2 | Revised diff + round 1 feedback | Fix again |
| 3 | Revised diff + round 2 feedback | Abort PR creation |

## Verdicts

| Verdict | Action |
|---------|--------|
| `APPROVE` | Stop loop, proceed to PR creation |
| `SUGGEST_IMPROVEMENTS` | Fix findings, commit, next iteration |
| `CONCERNS` | Fix findings, commit, next iteration |
| `BLOCKER` | Abort PR creation immediately (unless `--force-alterego`) |

**After 3 iterations without `APPROVE`:** Abort PR creation with message:
```
⛔ Alterego didn't converge after 3 rounds. PR creation aborted.
  Fix the remaining findings manually and re-run /build or /review.
```

## CLI Invocation

```bash
# Check prerequisites
command -v codex >/dev/null 2>&1 || { echo "⚠ Codex CLI not installed, skipping alterego"; return 0; }
[ -n "$OPENAI_API_KEY" ] || { echo "⚠ OPENAI_API_KEY not set, skipping alterego"; return 0; }

# Check diff size (exclude lockfiles, dist/, generated files)
DIFF_LINES=$(git diff origin/main...HEAD -- \
  ':!*.lock' ':!bun.lockb' ':!package-lock.json' ':!yarn.lock' \
  ':!dist/' ':!*.min.js' ':!*.map' \
  | wc -l | tr -d ' ')

if [ "$DIFF_LINES" -gt 5000 ]; then
  echo "⚠ Diff too large ($DIFF_LINES lines), skipping alterego"
  return 0
fi

# Run Codex review
RESULT=$(codex review --base main "$PROMPT" 2>&1) || {
  echo "⚠ Codex failed (exit $?), skipping iteration (fail-open)"
  return 0
}

# Parse verdict — match VERDICT: line only (not keyword scan)
VERDICT=$(echo "$RESULT" | grep -E '^VERDICT:' | head -1 | cut -d: -f2 | tr -d ' ')
```

## Review Prompt Template

```bash
# Extract issue number from branch name
ISSUE_NUM=$(git branch --show-current | grep -oE '[0-9]+' | head -1)

# Fetch issue context if available
if [ -n "$ISSUE_NUM" ]; then
  ISSUE_JSON=$(gh issue view "$ISSUE_NUM" --json title,body 2>/dev/null)
  ISSUE_TITLE=$(echo "$ISSUE_JSON" | jq -r '.title // empty')
  ISSUE_BODY=$(echo "$ISSUE_JSON" | jq -r '.body // empty')
fi

# Build diff stats
FILE_COUNT=$(git diff --name-only origin/main...HEAD | wc -l | tr -d ' ')
ADDITIONS=$(git diff --shortstat origin/main...HEAD | grep -oE '[0-9]+ insertion' | grep -oE '[0-9]+' || echo 0)
DELETIONS=$(git diff --shortstat origin/main...HEAD | grep -oE '[0-9]+ deletion' | grep -oE '[0-9]+' || echo 0)

if [ -n "$ISSUE_TITLE" ]; then
  PROMPT="Review the code changes for this pull request.

## Issue Context
- Issue: #$ISSUE_NUM — $ISSUE_TITLE
- Requirements:
$ISSUE_BODY

## Code Changes
- Files changed: $FILE_COUNT
- Lines: +$ADDITIONS / -$DELETIONS

## Diff
$(git diff origin/main...HEAD)

## Review Focus
1. Does the code address the issue requirements and acceptance criteria?
2. Logic errors or bugs
3. Security vulnerabilities
4. Performance issues
5. Missing edge cases

Respond with exactly this format:
VERDICT: [APPROVE|SUGGEST_IMPROVEMENTS|CONCERNS|BLOCKER]
FINDINGS:
- Finding 1
- Finding 2"
else
  PROMPT="Review the following code changes.

## Code Changes
- Files changed: $FILE_COUNT
- Lines: +$ADDITIONS / -$DELETIONS

## Diff
$(git diff origin/main...HEAD)

Respond with exactly this format:
VERDICT: [APPROVE|SUGGEST_IMPROVEMENTS|CONCERNS|BLOCKER]
FINDINGS:
- Finding 1
- Finding 2

Focus on:
1. Logic errors or bugs
2. Security vulnerabilities
3. Performance issues
4. Missing edge cases"
fi
```

## BLOCKER Triggers

- Security vulnerabilities (injection, auth bypass, data exposure)
- Data loss risks (destructive operations without safeguards)
- Breaking changes to exported types/functions without deprecation

## PR Comment Format

Post after every iteration, regardless of verdict:

```markdown
## Cross-Model Review (Codex)

**Status:** RAN [model: gpt-4o-mini]
**Verdict:** CONCERNS
**Round:** 2/3

### Findings
- Missing null check in `processUser()` at line 42
- Potential injection in `buildQuery()` at line 87
```

### Status Values

| Status | Meaning |
|--------|---------|
| `RAN` | Findings listed below |
| `SKIPPED (not installed)` | Codex CLI unavailable |
| `SKIPPED (no API key)` | `OPENAI_API_KEY` not set |
| `SKIPPED (diff too large)` | Lines exceed 5000 threshold |
| `SKIPPED (empty diff)` | Nothing to review |
| `FAILED (timeout)` | API request timed out |
| `FAILED (error)` | Error details below |

## Diff Size Threshold

| Parameter | Default | Override |
|-----------|---------|----------|
| Line limit | 5,000 | `CODEX_DIFF_LIMIT` env var |

Excluded from count: `*.lock`, `bun.lockb`, `package-lock.json`, `yarn.lock`, `dist/`, `*.min.js`, `*.map`

## Error Handling

**Design principle: Fail-open.** Alterego review is advisory. Never block on Codex failures
(only block on an explicit `BLOCKER` verdict).

| Condition | Action |
|-----------|--------|
| Codex not installed | Warn, skip loop entirely |
| API key missing | Warn, skip loop entirely |
| API timeout (30s) | Warn, skip current iteration |
| Non-zero exit code | Warn with stderr, skip iteration |
| Unparseable response | Warn, treat as non-APPROVE |
| Diff too large | Warn, skip loop entirely |
| Empty diff | Skip silently |

## Flags

| Flag | Purpose |
|------|---------|
| `--alterego` | Enable Codex convergence loop |
| `--alterego-model <model>` | Specify model (overrides `CODEX_MODEL` env) |
| `--force-alterego` | Override `BLOCKER` verdict (treat as `CONCERNS`) |

## When to Use

| Scenario | Recommendation |
|----------|----------------|
| Simple typo fix | Skip |
| Routine bug fix | Optional |
| Complex feature | Recommended |
| Architecture change | Strongly recommended |
| Security-sensitive code | Strongly recommended |
| Multi-file refactor | Recommended |
