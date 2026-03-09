---
description: Code review — spawns reviewer agent for thorough quality, security, and correctness review.
argument-hint: "[PR#N] [--alterego] [--alterego-model <model>] [--force-alterego]"
---

# /review — Code Review

Spawns the reviewer agent for thorough code review. Optionally runs a cross-model
convergence loop via OpenAI's Codex CLI (`--alterego`) for a second opinion.

## Usage
```
/review                        → review current branch changes vs main
/review PR#N                   → review specific PR
/review --alterego             → review + Codex cross-model convergence loop
/review --alterego-model o3    → use specific Codex model
/review --force-alterego       → override BLOCKER verdict from Codex
```

## Workflow

### 1. Gather Changes

**Current branch:**
```bash
git diff main...HEAD --stat    # overview
git diff main...HEAD           # full diff
```

**Specific PR:**
```bash
gh pr diff N
gh pr view N --json title,body,files
```

### 2. Spawn Reviewer

Use the Agent tool with `subagent_type: "general-purpose"`, `model: "opus"`:

Prompt the reviewer agent with:
- The full diff
- The issue/PR context (what was this trying to accomplish?)
- Instruction to return a structured verdict

### 3. Report Verdict

Display the reviewer's verdict:
- **approve** — "Ready to merge."
- **request-changes** — List issues with file:line references
- **block** — Critical issue that must be resolved

If request-changes or block, offer to fix the issues with `/build`.

### 4. Alterego Review (optional — `--alterego` flag only)

After the Opus reviewer completes, run the Codex convergence loop. This provides
a cross-model perspective that catches blind spots unique to Claude's training.

**Integration point:**
```
Opus Reviewer → [Codex Convergence Loop ×3] → Final Report
```

**Full spec:** See [references/alterego-review.md](references/alterego-review.md)

**Quick summary:**
1. Check prerequisites (Codex CLI installed, `OPENAI_API_KEY` set) — fail-open if missing
2. Check diff size — skip if > 5000 lines (excludes lockfiles, dist/, generated files)
3. Submit diff + issue context to Codex, parse `VERDICT:` line
4. `APPROVE` → stop loop, proceed
5. `BLOCKER` (without `--force-alterego`) → abort with error message
6. `SUGGEST_IMPROVEMENTS` / `CONCERNS` → fix findings, commit, next iteration
7. After 3 iterations without `APPROVE` → abort with error message
8. Post findings as PR comment ("Cross-Model Review (Codex)") after every iteration

**Flags:**

| Flag | Purpose |
|------|---------|
| `--alterego` | Enable Codex convergence loop |
| `--alterego-model <model>` | Specify model (overrides `CODEX_MODEL` env) |
| `--force-alterego` | Override `BLOCKER` verdict (treat as `CONCERNS`) |
