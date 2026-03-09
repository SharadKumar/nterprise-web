---
name: setup
description: >-
  Project setup — creates or updates CLAUDE.md in subscribing projects so the
  CC agent understands how the project is managed by Claudius. Reads
  .claudius/config.yaml, product.md, solution.md, and design.md to generate a
  concise, informative CLAUDE.md. Idempotent — safe to run repeatedly. Triggers
  on: "setup claude", "create CLAUDE.md", "update CLAUDE.md", "configure
  project for claudius", "/setup". Run after `claudius init` to give the CC
  agent full project context.
argument-hint: ""
---

# /setup — Project Setup

Creates or updates `CLAUDE.md` at the project root so the CC agent has full context about the project and how Claudius manages it. Reads project sources, summarizes them concisely, and writes a compact CLAUDE.md using `@imports` for full target-state docs.

## Usage
```
/setup              → create or update CLAUDE.md
```

## Workflow

### 1. Check Prerequisites

**Step A — Verify claudius is initialized:**
Check if `.claudius/config.yaml` exists. If not, tell the user: "Run `claudius init` first to initialize this project for Claudius." (`claudius init` distributes skills, rules, hooks, and agents to the project.)

**Step B — Check for CLAUDE.md:**
- If `CLAUDE.md` does not exist at project root, check if CC's built-in `/init` has been run (look for basic project context). If not, suggest the user run `/init` first to generate a base CLAUDE.md, then run `/setup` again to layer claudius content. Alternatively, offer to generate a complete CLAUDE.md from scratch.
- If `CLAUDE.md` exists, read it and identify claudius-managed sections (everything under `## Claudius` heading) vs user/project sections.

### 2. Read Project Sources

Read all available sources (skip gracefully if missing):

| Source | What to extract |
|--------|----------------|
| `.claudius/config.yaml` | Project name, commands (test, lint, build), workflow config, goals |
| `.claudius/product.md` | Project summary (2-3 lines), core capabilities |
| `.claudius/solution.md` | Stack (language, framework, database, hosting), architecture style |
| `.claudius/design.md` | Design system summary (if exists) |
| `package.json` / `pyproject.toml` / `Cargo.toml` | Project name fallback, dependencies for stack inference |

### 3. Generate CLAUDE.md

Read `references/claude-md-template.md` for the structure and constraints.

**If CLAUDE.md does not exist:**
Generate the full file from the template, filling in all sections from the sources read in Step 2.

**If CLAUDE.md exists:**
- Preserve all content outside the `## Claudius` section (user-written project context, code style, conventions)
- Replace or insert the `## Claudius` section with freshly generated content
- If there's no `## Claudius` section yet, append it at the end

**Content rules:**
- **Summarize, don't copy.** Product vision becomes 2-3 lines. Solution becomes a stack bullet list. Don't paste entire files.
- **No @imports for target-state docs.** These files can be large (40k+) and would bloat every conversation. The `claudius.md` rule tells agents to read them on demand. Key Paths lists them for reference.
- **Keep it under 100 lines total.** The template enforces this. If the file exceeds 100 lines, trim the non-claudius sections or summarize more aggressively.
- **Fill commands from config.yaml.** Map `commands.test`, `commands.lint`, `commands.build` to the Commands table.
- **Infer what's missing.** If `solution.md` doesn't exist yet, infer stack from package.json/manifest. Mark inferences with `[inferred]`.

### 4. Write and Verify

Write the generated content to `CLAUDE.md` at the project root.

Verify:
- File is under 100 lines
- No `@imports` for target-state docs (agents read on demand via rule)
- Commands section matches config.yaml
- No duplicate sections (idempotent check)

### 5. Ensure .gitignore

Check if `.gitignore` covers claudius runtime state. If not, add:

```
# Claudius runtime state
.claudius/daemon.log
.claudius/daemon.lock
.claudius/costs.jsonl
```

Everything else (`claudius init` distributes: `.claude/` skills, rules, hooks, agents; `.claudius/config.yaml`; target-state docs; `CLAUDE.md`) should be committed so team members get full CC context on clone.

### 6. Report

```
CLAUDE.md written (N lines).
Claudius context: config, product, solution, design → summarized.
Target-state docs: @imported for on-demand loading.
```

If any sources were missing, note them:
```
Missing: .claudius/solution.md — run /solution to create it.
```

## Rules

- **Idempotent** — running `/setup` multiple times produces the same result. Never duplicate sections.
- **Preserve user content** — never overwrite non-claudius sections of an existing CLAUDE.md.
- **Under 100 lines** — the entire CLAUDE.md must stay compact. CC loads this into every conversation.
- **Summarize over copy** — product.md and solution.md can be long; CLAUDE.md gets the essence.
- **No @imports** — target-state docs can be large; agents read them on demand via the `claudius.md` rule.
- **No PlanMode** — this skill reads, generates, and writes. No interactive interview needed.
- **Graceful degradation** — missing sources are skipped with a note, not errors.

## Anti-Patterns (Do Not)

- **Don't copy entire files** — CLAUDE.md is a summary. The full docs are @imported.
- **Don't invent project details** — if a source doesn't exist, say so. Don't fabricate stack or architecture.
- **Don't remove user content** — existing non-claudius sections in CLAUDE.md are sacred.
- **Don't exceed 100 lines** — if you can't fit it, summarize harder.
- **Don't use @imports** — target-state docs can be 40k+ chars and would bloat every conversation. List them in Key Paths instead.
- **Don't hardcode claudius internals** — read from config.yaml, don't assume defaults.

## Success Criteria

1. **CC agent has context** — after `/setup`, CC understands the project's purpose, stack, commands, and how claudius manages it.
2. **Idempotent** — running twice produces identical output.
3. **Compact** — under 100 lines.
4. **No @imports** — target-state docs listed in Key Paths, not force-loaded.
5. **User content preserved** — non-claudius sections untouched on update.
6. **Sources noted** — missing sources are flagged with next-step suggestions.
