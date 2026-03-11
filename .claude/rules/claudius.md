# Claudius-Managed Project

This project is managed by Claudius. Follow these behavioral directives.

## Lifecycle

Follow the skill lifecycle in order. Don't skip stages.

```
/product → /solution → /design → /spec → /backlog → /build → /deploy
```

- **Don't build without specs.** If there's no issue, use `/backlog` to create one first.
- **Don't architect ad-hoc.** If `.claudius/solution.md` doesn't exist, run `/solution` before making architecture decisions.
- **Don't design in code.** UX decisions belong in `/design`, not improvised during `/build`.

## Config Is Truth

Read `.claudius/config.yaml` before assuming anything:
- **Commands** — use `commands.test`, `commands.lint`, `commands.build` from config. Don't guess.
- **Workflow** — check `workflow.defaultBranch`, `workflow.squashMerge`.
- **Autonomy** — respect `autonomy.budgetCapUsd`, `autonomy.autoMerge`.
- **Goals** — check `goals` array for prioritization.

## Target-State Docs

These files are the source of truth. Read before working, update when decisions change.

| File | Contains | Created by |
|------|----------|------------|
| `.claudius/product.md` | Product vision, v1 scope, success criteria | `/product` |
| `.claudius/solution.md` | Architecture, stack, data model, API design | `/solution` |
| `.claudius/design.md` | UX flows, design tokens, component inventory | `/design` |

If a target-state doc is missing, flag it — don't invent what belongs there.

## Skills Over Ad-Hoc

Use claudius skills instead of doing things manually:

- Writing specs? → `/spec`
- Creating work items? → `/backlog`
- Implementing an issue? → `/build`
- Writing docs/README? → `/write`
- Reviewing code? → `/review`
- Running tests beyond unit? → `/test`
- Deploying? → `/deploy`

## Session Continuity

- Write state to `.claudius/session-state.md` at natural boundaries.
- After `/clear` or new session: read session-state.md, config.yaml goals, then resume.
- Don't ask "what should I do next?" — check goals and backlog, pick the highest priority.

## What to Commit

Commit everything `claudius init` distributes — skills, rules, hooks, agents, config. These are small markdown files, not generated artifacts. Team members get full CC context on clone without running init.

**Commit:**
- `.claude/` — skills, rules, hooks, agents, settings
- `.claudius/config.yaml` — project config
- `.claudius/product.md`, `solution.md`, `design.md` — target-state docs
- `CLAUDE.md` — project context

**Gitignore (runtime state):**
- `.claudius/daemon.log`
- `.claudius/daemon.lock`
- `.claudius/costs.jsonl`
- `.claudius/session-state.md`

**Upgrade path:** `claudius init --force` pulls latest skills/rules from the claudius package.

## CLI Reference

| Command | Purpose |
|---------|---------|
| `claudius init` | Initialize project for claudius |
| `claudius daemon` | Start autonomous pulse daemon |
| `claudius pulse` | Manual pulse trigger |
| `claudius status` | Show project status |
| `claudius jobs` | Manage background jobs |
| `claudius scope` | Classify issue scope (XS/S/M/L/XL) |
