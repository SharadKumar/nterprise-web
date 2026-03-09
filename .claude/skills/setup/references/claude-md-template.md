# CLAUDE.md Template

This is the template for generating CLAUDE.md in subscribing projects. The entire file MUST stay under 100 lines. Sections marked `[if available]` are only included when the source exists.

## Template

```markdown
# {Project Name}

{2-3 line summary from .claudius/product.md. If product.md doesn't exist, use package.json description or a single line: "No product vision yet — run /product to create one."}

## Stack

{Bullet list from .claudius/solution.md or inferred from manifest files.}

- **Language:** {e.g., TypeScript 5.x}
- **Framework:** {e.g., Next.js 14}
- **Database:** {e.g., PostgreSQL}
- **Hosting:** {e.g., Vercel}

## Commands

| Command | Purpose |
|---------|---------|
| `{commands.build}` | Build |
| `{commands.test}` | Run tests |
| `{commands.lint}` | Lint |

{Add any other commands from config.yaml or package.json scripts that are useful.}

## Code Style

{If CC's /init was run, this section may already exist — preserve it. Otherwise, infer from linter config, tsconfig, or similar. Keep to 3-5 bullets max.}

## Claudius

Managed by [Claudius](https://github.com/SharadKumar/claudius). Config: `.claudius/config.yaml`

Behavioral rules are in `.claude/rules/` — loaded automatically into every CC conversation. Key rules:
- `claudius.md` — lifecycle, config-as-truth, skills-over-ad-hoc, CLI reference
- `workflow.md` — branch conventions, commits, PR format, merge policy
- `autonomy.md` — decision authority, escalation triggers
- `continuity.md` — session state, /clear protocol

### Skills

| Skill | Purpose |
|-------|---------|
| `/product` | Product vision capture |
| `/solution` | Technical architecture |
| `/design` | UX + visual design |
| `/spec` | Detailed specifications |
| `/backlog` | Work item decomposition |
| `/build` | Autonomous implementation |
| `/deploy` | Deployment orchestration |
| `/test` | E2E + integration tests |
| `/review` | Multi-perspective code review |
| `/write` | Content writing (docs, blog, README) |
| `/setup` | Project setup (this file) |
| `/pulse` | Autonomous heartbeat |
| `/reflect` | Session retrospective |

### Agents

| Agent | Role |
|-------|------|
| `manager` | Routes work, spawns builder + reviewer teams |
| `developer` | TDD implementation specialist |
| `reviewer` | Quality gate for code changes |
| `designer` | Experience + visual design |
| `researcher` | Market, tech, design research |

### CLI

| Command | Purpose |
|---------|---------|
| `claudius init` | Initialize project for claudius |
| `claudius daemon` | Start autonomous pulse daemon |
| `claudius pulse` | Manual pulse trigger |
| `claudius status` | Show project status |
| `claudius jobs` | Manage background jobs |
| `claudius scope` | Classify issue scope |

### Lifecycle

`/product` → `/solution` → `/design` → `/spec` → `/backlog` → `/build` → `/deploy`

### Key Paths

- `.claudius/config.yaml` — project config
- `.claudius/product.md` — product vision
- `.claudius/solution.md` — technical architecture
- `.claudius/design.md` — design system


```

## Constraints

1. **Total file length: under 100 lines.** This file is loaded into every CC conversation. Brevity is critical.
2. **Summarize, don't paste.** The product summary is 2-3 lines, not the full product.md.
3. **Stack from solution.md.** If solution.md doesn't exist, infer from manifest files and mark `[inferred]`.
4. **Commands from config.yaml.** Use `commands.test`, `commands.lint`, `commands.build` values directly.
5. **No @imports for target-state docs.** These files can be large (40k+). The `claudius.md` rule tells agents to read them on demand. Key Paths lists them for reference.
6. **Preserve non-claudius content.** When updating an existing CLAUDE.md, only touch the `## Claudius` section and below.
7. **Skip missing sections.** If design.md doesn't exist, omit it from Stack/summary. Note it as missing in the report.
8. **The ## Claudius section is the boundary.** Everything above it is user/project content. Everything from `## Claudius` onward is managed by /setup and will be regenerated on each run.
