---
name: backlog
description: >-
  Backlog management — decomposes specs into build-ready work items via PlanMode,
  grooms the backlog, and captures ad-hoc work. Only items labeled `ready` can be
  picked up by /build. Use when decomposing epics into tasks, grooming work items,
  capturing deferred work, or preparing issues for implementation.
  Triggers on: "plan the work", "break this into tasks", "groom the backlog",
  "create work items", "decompose this spec", "/backlog", "what's ready to build",
  "prepare for implementation", "add to backlog".
  This is Stage 4 of the development lifecycle (/product → /solution → /design → /spec → /backlog → /build).
argument-hint: "#spec-issue or description or --groom or --groom-backlog"
---

# /backlog — Backlog Management

Manages the product backlog: decomposes spec epics into build-ready work items, grooms existing items, and captures ad-hoc work. This is the human-in-the-loop gate before autonomous building — only items that pass through PlanMode and get labeled `ready` can be picked up by `/build`.

This is **Stage 4** of the development lifecycle (/product → /solution → /design → /spec → /backlog → /build). It reads specs from `/spec` (Stage 3) and produces work items for `/build` (Stage 5).

## Usage
```
/backlog #8                     → decompose spec epic #8 into work items via PlanMode
/backlog "add caching layer"    → capture ad-hoc work item
/backlog --groom                → validate tasks in current session
/backlog --groom-backlog        → full backlog audit with stale detection
/backlog --type:debt "refactor" → capture with type hint
/backlog --critical "fix auth"  → capture as critical
/backlog --global               → cross-repo queue from Project #6 (global dir only)
```

## Four Responsibilities

### 1. Plan — Decompose Specs into Work Items

The primary responsibility. Takes a spec epic and produces build-ready work items through PlanMode.

**When:** `/backlog #8` where #8 is a spec epic from `/spec`

**Flow:**

1. **Read the spec** — fetch the epic issue and understand its full scope:
   ```bash
   gh issue view <number> --json body,title,labels
   ```

2. **Enter PlanMode** — this is where the codebase gets explored. PlanMode lets you:
   - Map the spec's requirements to actual files and patterns in the codebase
   - Understand existing abstractions to build on
   - Identify the right implementation approach for each piece
   - Determine dependencies between work items
   - Estimate scope accurately

3. **Design work items** — within PlanMode, decompose the spec into work items that are each implementable in one session (one branch, one PR). Each work item includes:

   - **Title** — specific, verb-first ("Implement CSV upload endpoint", not "Uploads"). **Never use planning codes (WI-A, WI-B, E1, etc.) in titles** — those are internal PlanMode labels only and must never appear in issue output.
   - **Acceptance criteria** — pulled from the spec, mapped to this specific work item
   - **Implementation approach** — which files to create/modify, which patterns to follow, which existing code to build on. This is the key value of PlanMode — the developer doesn't have to explore.
   - **Dependencies** — which other work items must complete first. During PlanMode, use ordering (create foundation items first). Once issues are created, reference them by `#N` GH issue number only — never "WI-A", "WI-B", or other codes.
   - **Test plan** — derived from acceptance criteria

4. **Present for approval** — show the user the proposed work items via `AskUserQuestion`. The user approves, revises, or reorders.

5. **Create issues** — for each approved work item. Title must be verb-first with no prefix codes:
   ```bash
   gh issue create --title "<verb-first title>" --label "task" --body "$(cat <<'EOF'
   ## Summary
   What and why in 1-3 sentences.

   ## Parent Epic
   Part of #<epic-number>

   ## Acceptance Criteria
   - [ ] Specific testable criterion
   - [ ] Another criterion

   ## Implementation Approach
   - `path/to/file.ts` — what changes, following pattern in `path/to/existing.ts`
   - `path/to/new-file.ts` — new file, purpose

   ## Dependencies
   - Requires #<N> (reason — use GH issue number, never WI-* codes)

   ## Test Plan
   - [ ] Test scenario from ACs
   EOF
   )"
   ```

6. **Set native GitHub relationships** — after all issues are created and their numbers are known, wire up the relationships using `.claude/scripts/github-relationships.sh`. This makes the hierarchy and dependency graph visible natively in GitHub (sub-issues panel, blocked-by indicators), not just as text in the body.

   **Epic → task (sub-issue):** For every task issue created, link it as a sub-issue of the parent epic:
   ```bash
   bash .claude/scripts/github-relationships.sh add-sub-issue \
     --parent <epic-number> --child <task-issue-number>
   ```

   **Task → task (blocked-by):** For every dependency between tasks, register it natively:
   ```bash
   bash .claude/scripts/github-relationships.sh add-blocked-by \
     --issue <blocked-task-number> --blocked-by <blocker-task-number>
   ```

   Do this for all issues in one pass after creation — the body text references (`Requires #N`) remain as belt-and-suspenders, but the native relationships are what GitHub's UI surfaces.

   If the script errors (e.g., the repo doesn't have the GitHub sub-issues feature enabled), log the error and continue — never block issue creation over relationship wiring.

7. **Mark ready** — after the user approves, label each work item as `ready`:
   ```bash
   gh issue edit <N> --add-label "ready"
   ```

**Build order:** Create issues in dependency order — foundation first (migrations, models, utilities), then API layer, then UI, then integration. Note dependencies explicitly so `/build` can pick them up in sequence.

### 2. Groom — Backlog Hygiene

Audit and maintain the health of existing work items.

#### `--groom`: Session Task Validation

Validate tasks in the current session. Zero GitHub API cost.

```bash
/backlog --groom
```

- Runs `TaskList` to find all current session tasks
- Validates each for: acceptance criteria present, testable criteria, bounded scope, no open questions, description length > 100 chars
- Reports which tasks pass/fail with specific issues

#### `--groom-backlog`: Full Backlog Audit

Comprehensive backlog health check across all open issues.

```bash
/backlog --groom-backlog
```

- Scans all open issues
- Identifies: stale issues (>90 days without update), vague issues (no checkboxes, short body), missing labels, duplicate candidates
- Can re-run PlanMode on items that need it — items without implementation approach aren't truly `ready`
- Posts findings as comments on affected issues
- Outputs a health summary

**Update `.claude/memory/pulse.md` after grooming:**
1. Rewrite **Queue** — cluster ready issues by theme/dependency, note sequencing rationale
2. Append to **Grooming Log**: `### <date> — groom-backlog\n- <summary of changes and key findings>`

#### `--check-stale`: Staleness Detection

Remove `ready` label from items that have gone stale.

```bash
/backlog --check-stale --threshold 30
```

- Finds `ready` issues not updated in `threshold` days (default: 30)
- Removes `ready` label, adds `stale` label
- Posts explanation comment on each issue

### 3. Capture — Ad-hoc Work Items

Quick issue creation for deferred work discovered during other activities.

**When:** `/backlog "add caching layer"` or `/backlog --type:debt "refactor auth module"`

**Flow:**

1. **Parse** — extract description from argument, detect type hints and criticality flags
2. **Categorize** — auto-detect type from keywords:

   | Category | Indicators | Label |
   |----------|------------|-------|
   | feature | new, add, implement, create, support | `feature` |
   | bug | fix, broken, error, fails, wrong | `bug` |
   | chore | update, upgrade, dependency, config | `chore` |
   | debt | refactor, cleanup, technical debt, replace | `debt` |

3. **Verify labels** — check labels exist in repo, create if missing
4. **Create issue** — with context, description, and placeholder acceptance criteria
5. **Report** — issue number, labels applied, note that it needs grooming before it's `ready`

Captured items are NOT labeled `ready` — they need grooming and PlanMode first.

## The `ready` Gate

The `ready` label is the contract between `/backlog` and `/build`. It means:

- The work item went through PlanMode (codebase was explored, approach is defined)
- Implementation approach specifies which files to create/modify and which patterns to follow
- Acceptance criteria are specific and testable
- Dependencies are noted and met (or dependency issues are also `ready`)
- Native GitHub relationships are wired (sub-issue of epic, blocked-by dependencies)
- A human approved the work item

`/build` only picks up `ready` items. `/pulse` only delegates `ready` items. This gate ensures autonomous agents execute pre-approved plans, not make design decisions on the fly.

## GitHub Relationship Script Reference

`.claude/scripts/github-relationships.sh` is available in all claudius-managed projects. Key commands:

```bash
# Link a task as a native sub-issue of its epic
bash .claude/scripts/github-relationships.sh add-sub-issue --parent <epic> --child <task>

# Mark a task as blocked by another task
bash .claude/scripts/github-relationships.sh add-blocked-by --issue <blocked> --blocked-by <blocker>

# Inspect relationships
bash .claude/scripts/github-relationships.sh list-sub-issues <epic>
bash .claude/scripts/github-relationships.sh completion-summary <epic>
bash .claude/scripts/github-relationships.sh list-blocked-by <task>
```

These use GitHub's GraphQL API (requires `gh` CLI authenticated). Errors are non-fatal — log and continue.

### 4. Global Cross-Repo Queue — `--global`

Available from the global orchestration directory only (where `.claudius/config.yaml` has a `repos[]` array). Uses Project #6 as the canonical cross-repo backlog.

**When:** `/backlog --global`

**Flow:**

1. **Read global config** — load repos[] from `.claudius/config.yaml` at the global dir:
   ```bash
   cat .claudius/config.yaml   # get repos[] array with github + path per repo
   ```

2. **Query Project #6** — fetch all Todo items not tagged `codex`:
   ```bash
   gh project item-list 6 --owner SharadKumar --format json --limit 100 \
     | jq '[.items[] | select(.status == "Todo") | {title: .title, repo: .content.repository, url: .content.url, number: .content.number}]'
   ```

3. **Group by repo** — partition results by Repository field value.

4. **Display prioritized queue** — show cross-repo summary:
   ```
   Cross-repo backlog (Project #6 — Status: Todo, no codex label)

   auctionomy-app  3 items ready
   adalati         1 item ready
   claudius        2 items ready

   Total: 6 items across 3 repos
   ```
   List each item with its issue number, title, and repo.

5. **Enter PlanMode for grooming** — ask via `AskUserQuestion` if the user wants to reorder or add items. In PlanMode, use `gh project item-edit` to update Status or Execution fields, or use `gh issue create` to add new items.

**Rules for `--global`:**
- Only run from the global orchestration dir — skip if no `repos[]` in config
- Never create or label issues `ready` here — that's per-repo backlog's job
- Read-only view by default; PlanMode is opt-in for grooming
- Project #6 field IDs are in the repo's `.claudius/config.yaml` comments

---

## Rules

- **PlanMode is required for spec decomposition** — work items without implementation approach aren't build-ready
- **Human-in-the-loop** — the user approves work items before they're labeled `ready`
- **No code changes** — this skill produces GitHub issues, not code
- **Upstream decisions are settled** — product, architecture, and spec decisions are constraints
- **Captured items need grooming** — ad-hoc captures are never auto-labeled `ready`
- **Build order matters** — create issues in dependency order, note dependencies explicitly
- **Each work item = one session** — if a work item needs more than one branch/PR, split it
- **Wire relationships after creation** — run the relationship script after all issue numbers are known, not issue-by-issue mid-creation

## Anti-Patterns (Do Not)

- **Don't skip PlanMode for spec decomposition** — the whole point is that work items have implementation approach baked in. Without PlanMode, you're just creating vague tasks.
- **Don't auto-label `ready`** — new items and captured items always need human review before they're ready to build
- **Don't create vague items** — "improve performance" is not a work item. "Add response caching to GET /api/recipes with 5-minute TTL" is.
- **Don't use planning codes in issue titles or bodies** — internal identifiers like "WI-A", "WI-B", "WI-C", "WI E:", "E1:", "Task-3" are PlanMode scratch space only. They must never appear in `gh issue create` titles or body text. Once an issue is created it has a `#N` number — use that everywhere. Titles are permanent and visible in GitHub; polluting them with planning codes makes the backlog unreadable.
- **Don't duplicate spec content** — reference the spec issue by number. The work item specifies *implementation approach*, not the full domain contract.
- **Don't over-scope** — each work item should be completable in one session. If you're writing more than 5 acceptance criteria, consider splitting.
- **Don't ignore dependencies** — building the API endpoint before the data migration exists wastes time. Note and order dependencies.
- **Don't skip relationship wiring** — body text references alone aren't enough. The native GitHub relationships make the dependency graph actionable: GitHub blocks merges on open blockers and shows epic progress automatically.

## Success Criteria

1. **Build-ready** — `/build` can pick up any `ready` item and implement without asking questions
2. **Implementation approach defined** — which files, which patterns, which existing code to build on
3. **Testable ACs** — every criterion maps to a pass/fail test
4. **Dependency-ordered** — work items can be built in sequence without blocking
5. **Human-approved** — every `ready` item was reviewed by a human
6. **Relationships wired** — every task is a native sub-issue of its epic; blocked-by links are set
7. **Clean backlog** — grooming keeps items current, stale items are flagged, duplicates are caught
