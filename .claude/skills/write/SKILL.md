---
name: write
description: >-
  Content writing — produces documentation, marketing copy, changelogs, README files,
  blog posts, onboarding guides, and other prose. Reads project context
  (.claudius/product.md, solution.md, design.md) and writes for a specific audience
  and format. Triggers on: "write docs", "write documentation", "write a README",
  "marketing copy", "changelog", "blog post", "onboarding guide", "/write".
argument-hint: "<format> [--audience <audience>]"
---

# /write — Content Writing

Produces written content for any audience and format. Reads the project's living documents (product.md, solution.md, design.md) as context and writes prose — not code.

## Usage
```
/write docs                    → API docs or developer documentation
/write readme                  → project README
/write changelog               → changelog from recent PRs
/write blog                    → blog post about a feature or release
/write onboarding              → developer onboarding guide
/write marketing               → marketing copy (landing page, feature descriptions)
/write --audience developers   → scope to a specific audience
```

## Workflow

### 1. Read Project Context

```bash
Read .claudius/product.md      # what the product is
Read .claudius/solution.md     # how it's built
Read .claudius/design.md       # how it looks and feels
```

Parse for: product name, value proposition, target users, tech stack, key features, design language.

### 2. Determine Format and Audience

**From arguments or ask via `AskUserQuestion`:**

| Format | Audience | Tone | Output |
|--------|----------|------|--------|
| `docs` | Developers | Technical, precise | API reference, guides |
| `readme` | OSS contributors | Welcoming, clear | `README.md` |
| `changelog` | Users + developers | Factual, scannable | `CHANGELOG.md` |
| `blog` | Public / community | Conversational, engaging | Markdown blog post |
| `onboarding` | New developers | Step-by-step, patient | Setup + architecture guide |
| `marketing` | Prospects / users | Persuasive, benefit-focused | Landing page copy |

### 3. Research

For **docs**: Read the codebase — API routes, exported functions, config options. Build a map of what needs documenting.

For **changelog**: Read recent git history and merged PRs:
```bash
gh pr list --state merged --limit 20 --json title,body,number,mergedAt
git log --oneline --since="<date>"
```

For **blog/marketing**: Read the product vision for positioning and value props.

For **onboarding**: Read the developer experience section of solution.md, package.json scripts, and existing docs.

### 4. Write

Write the content to the appropriate location:

| Format | Output Location |
|--------|----------------|
| `docs` | `docs/` directory (Fumadocs structure if available) |
| `readme` | `README.md` |
| `changelog` | `CHANGELOG.md` |
| `blog` | User-specified or `docs/blog/` |
| `onboarding` | `docs/develop/` or `CONTRIBUTING.md` |
| `marketing` | User-specified |

### 5. Present for Review

Use `AskUserQuestion` with markdown preview. Options: **Approve** / **Revise**.

## Writing Quality

- **No filler.** Every sentence carries information. Cut "In order to", "It should be noted that", "As mentioned above".
- **Audience-appropriate.** Marketing copy sounds different from API docs. Match tone to reader.
- **Scannable.** Headers, bullet points, code blocks, tables. Long paragraphs are a bug.
- **Accurate.** Every code example must be correct. Every API reference must match the actual code.
- **Consistent with product identity.** Use the product name correctly. Match the design language's tone.

## Rules

- **Read project context first** — product.md, solution.md, design.md inform all writing
- **No PlanMode** — this skill writes prose, not code
- **Verify code examples** — every snippet must be accurate against the codebase
- **Present for approval** — user reviews before final write
- **Don't invent features** — only write about what exists or is documented in product.md

## Anti-Patterns

- **Don't write generic content** — "Welcome to our amazing product" is noise. Be specific.
- **Don't duplicate existing docs** — check what already exists before writing
- **Don't mix audiences** — marketing copy and API docs have different readers
- **Don't skip research** — read the actual code before writing docs about it
