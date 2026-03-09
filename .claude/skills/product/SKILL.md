---
name: product
description: >-
  Product vision capture — interactively discovers a product vision through
  structured questioning and writes `.claudius/product.md` as the living target
  state. Use when starting a new project from an idea, capturing a product
  vision, kicking off the first build, or refining a previous vision. Triggers
  on: "I have an idea", "new project", "start from scratch", "build something
  new", "refine the idea", "update the vision", "/product", "product vision",
  "capture the product". Also use when the user wants to revisit or improve an
  existing product vision. This is Stage 1 of the development lifecycle
  (/product → /solution → /design → /spec → /backlog → /build).
argument-hint: "[idea in a few words]"
---

# /product — Product Vision Capture

Interactively discovers a product vision and writes `.claudius/product.md` — the living target state document. No GitHub Issue is created; the file is the sole artifact. Supports both fresh captures and delta refinement of previous runs.

This is **Stage 1** of the development lifecycle. After completing this stage, the next step is `/solution` to design the technical architecture.

## Usage
```
/product "AI recipe app"     → new idea, asks about repo context
/product                     → ask for the idea (or refine existing .claudius/product.md)
```

## Workflow

### 1. Context & Seed

Determine the working context upfront — this shapes the entire flow.

**Step A — Seed the idea:**
If text is provided, use it as the seed idea. If no argument, ask the user to describe their idea in a sentence or two.

**Step B — Check for existing target state:**
If `.claudius/product.md` exists and has content, enter **delta mode** (Step 1b) — treat its content as the existing vision to refine.

**Step C — Repo context (ask via `AskUserQuestion`):**

Ask the user:

| Question | Options |
|----------|---------|
| Where does this live? | **New repo** — create fresh repo · **Existing repo** — use the current repo or specify one |

If **existing repo**, the product file lives in `.claudius/product.md` in that repo.

### 1b. Delta Mode (Second-Pass Refinement)

When `.claudius/product.md` has existing content:

1. **Read the source** — read `.claudius/product.md`.
1a. **Check for architecture-informed revisions** — if the file contains an `## Architecture-Informed Revisions` section, treat those items as priority delta inputs. Surface to user: "The architecture phase surfaced these product changes: [list]. Let me incorporate them." After incorporating revisions into the appropriate dimensions, remove the `## Architecture-Informed Revisions` section (it's a handoff artifact, not permanent content).
2. **Parse against the checklist** — map each section to the dimensions in Step 2. Identify:
   - **Gaps** — dimensions with no coverage or placeholder content
   - **Shallow areas** — dimensions covered at surface level but lacking specifics
   - **Stale content** — information that may be outdated (research in background)
   - **New dimensions** — areas the current skill covers that the previous version didn't capture at all
3. **Only ask delta questions** — do NOT re-ask what's already well-covered. Show the user a brief summary: "The existing vision covers X, Y, Z well. I need to explore A, B, C further." Then proceed to Step 3 (Progressive Interview) with only the gap/shallow dimensions.
4. At synthesis time, produce an updated product document that preserves good existing content and fills gaps.

### 2. Build Internal Checklist

Based on the seed, build an internal checklist of dimensions to cover. Track which are already answered by the seed, organic conversation, or (in delta mode) the existing issue. The dimensions:

| Dimension | Covers |
|-----------|--------|
| Vision & Problem | What is this? What pain does it solve? Why now? |
| Target User | Who specifically, their context, their current workaround |
| Competitive Landscape | What exists today? How is this different? Why will users switch? |
| Core Capabilities | 3-5 things users can DO, primary workflow |
| v1 Scope | Minimum useful set, what's deferred, definition of done |
| User Experience | Platform, first screen, key flows, user roles |
| Success Criteria | North star metric, how you know v1 worked, measurable KPIs |
| Data Concepts | Core entities and relationships at a product level (users, recipes, orders — not schemas) |
| Integrations | External services the product needs (payments, email, maps — not how they're implemented) |
| Constraints | Performance expectations, security sensitivity, accessibility, compliance, hard limits |
| Productization & Audience | Who is this for? How does it reach them? Marketing presence? (see Step 3a) |
| Monetization | Revenue model (if applicable), pricing approach, free vs paid |
| Growth & Roadmap | Post-v1 features, target scale |
| Constraints & Risks | Technical/business constraints, known risks |

### 3. Progressive Interview

Ask questions using `AskUserQuestion` in rounds of 2-3 questions each. There is no fixed limit on rounds — iterate as many times as needed until all dimensions are thoroughly covered or the user signals they're done.

After each round:
- Update understanding of the product
- Mark dimensions as covered
- Determine what to ask next
- Skip what's already answered organically
- If a dimension needs deeper exploration, ask follow-up questions

#### 3a. Productization Deep-Dive

This is a critical dimension. After the foundational questions (vision, users, capabilities), dedicate focused questioning to productization. The answers here shape the project structure and deliverables.

**Core productization questions:**

1. **Nature of the product** — "Is this a commercial product/SaaS, an open-source tool, an internal tool, or a side project?" This drives everything else.

2. **Target audience** — "Who specifically will use this? Describe their role, company size, technical sophistication. What's their buying process?" Go deeper than the "Target User" dimension — this is about market, not just user persona.

3. **Public-facing website** — "Will this need a marketing/landing page website to attract users?"

**If yes to marketing website**, expand into:
- "What's the tone? Developer-focused technical? Enterprise polished? Consumer playful?"
- "What pages do you envision? Landing, pricing, docs, blog, changelog?"
- "Any visual inspiration? Sites you admire for this kind of product?"
- "What's the primary CTA? Sign up, request demo, download, try free?"
- "Do you need SEO/content marketing from day one?"

**Deliverable implications (note internally, confirm with user):**
- Marketing website needed → separate deliverable from the app itself
- SaaS → marketing site + authenticated app experience
- Internal tool only → single app, no marketing site
- CLI tool → package + optional docs site

4. **Distribution** — "How do users discover and access this? App store, direct URL, npm install, word of mouth?"

#### 3b. Background Research (Parallel)

While the user is answering questions, actively research in the background to make the next round of questions more intelligent and forward-looking. Use the Agent tool to spawn research subagents that run concurrently with user interaction.

**What to research and when:**

| After dimension... | Research... |
|---------------------|------------|
| Vision & Problem | WebSearch for market size, trends, recent developments in the problem space. Is this a growing area? Any recent regulatory changes? |
| Competitive Landscape | WebSearch + WebFetch to find actual competitors, their pricing, features, reviews, recent funding. Look for gaps the user hasn't mentioned. |
| Target User | Search for community discussions (Reddit, HN, forums) about the pain point. What language do real users use to describe this problem? |
| Productization | Research comparable products' go-to-market strategies, pricing models, landing pages for design inspiration. |

**How to use research results:**
- Surface findings as part of the next question round: "I found that [competitor X] just launched [feature Y] last month — does that change how you think about differentiation?"
- Propose informed defaults: "Based on what I'm seeing in this space, most successful tools use freemium with usage-based pricing for teams. Does that resonate?"
- Flag opportunities: "There's a lot of discussion on HN about [pain point] — might be worth positioning around that specifically."

The research should feel natural — weave findings into questions rather than presenting a research dump. The goal is to ask questions that the user wouldn't think to answer without prompting.

### Key Interview Behaviors

- **Don't accept vague answers** — probe deeper with follow-ups ("You said 'social features' — what specifically? Comments? Sharing? Collaboration?")
- **Note technical implications without deciding** — if a product decision has obvious tech consequences, flag it for `/solution`: "Real-time collaboration will have infrastructure implications — we'll address that in the architecture stage."
- **Let the user drive the depth** — some ideas need 3 rounds, others need 15
- **Group related questions** — don't bounce between unrelated dimensions
- **Start broad, go narrow** — vision and users first, technical details later

Question ordering (adapt as needed):
1. Vision, problem, target user (foundational)
2. Competitive landscape, differentiation (positioning)
3. Core capabilities, primary workflow (what it does)
4. **Productization & audience** (who it reaches, how)
5. User experience, platform, key screens (how it feels)
6. Success criteria, north star metric (how you measure)
7. v1 scope boundaries, definition of done (what ships)
8. Data concepts, integrations needed (what connects)
9. Constraints, monetization (what limits and sustains it)
10. Growth, roadmap (where it goes)

### 4. Synthesize Prompt

Read `references/prompt-template.md`. Merge all answers, inferences, and research findings into the prompt format.

**Writing style — this matters.** The output is a prompt for an LLM that will design the architecture (via `/solution`) and eventually build the product. Write for that reader:

- **Terse over verbose.** Every word must carry signal. Cut filler, cut adjectives, cut "this will enable users to..." phrasing. Just state what it does.
- **Decisions over descriptions.** Don't describe options — state what was chosen and why. "PostgreSQL — relational data, complex queries" not "The database should be chosen based on the needs of the application."
- **Constraints over aspirations.** "Must work offline" is useful. "Should provide a delightful experience" is noise.
- **Concrete over abstract.** "Users upload CSV, see preview, map columns, import" not "Users can import their data through an intuitive interface."
- **Structure over prose.** Use tables, bullets, short fragments. No paragraphs. If it reads like an essay, rewrite it.
- **Name things.** Entities, screens, API endpoints, roles — give them names. "RecipeCard component" not "the card that shows recipe information."
- **Research-informed.** Weave in competitive insights, market context, and validated assumptions from background research. "Competitors charge $X/mo — position at $Y for [reason]."

Every section must be filled — if something wasn't explicitly discussed, infer from context and mark inferences with `[inferred]`.

### 5. Present for Approval

Use `AskUserQuestion` with a `markdown` preview on the "Approve" option showing the full formatted prompt. Two options:

- **Approve** — with markdown preview of the complete prompt
- **Revise** — user wants to change or add something (ask what to revise, update, re-present)

If the user chooses "Revise", ask what they want to change, update the prompt, and present again. Repeat until approved.

### 6. Write Target State File

On approval only:

**Write `.claudius/product.md`** — this is the sole output artifact.

**If new repo**, also set up the repo first:
1. **Project name:** Suggest a name based on the idea (short, memorable, lowercase). Ask the user to confirm or provide their own.
2. **GitHub account:** Ask which GitHub account or org to create the repo under.
3. **Create repo:**
   ```bash
   gh repo create <owner>/<name> --public --description "<one-liner>"
   ```

### 7. Report

```
.claudius/product.md written.
Next: `/solution` to design the technical architecture.
```

## Rules

- **Sole output is `.claudius/product.md`** — the target state file that evolves with the product, no GitHub Issue
- **Every dimension must be addressed** — asked directly or inferred and confirmed
- **Present inferences explicitly** — "Based on X, I'm assuming Y — correct?"
- **Don't accept vague answers** — probe deeper until answers are specific enough to build from
- **The file must be self-contained** — anyone reading it should understand the full product vision without additional context
- **Checkboxes in v1 scope** — each `- [ ]` item maps to an acceptance criterion for `/backlog`
- **No PlanMode** — this skill uses `AskUserQuestion` for interaction, not plan mode
- **Research actively** — don't just ask questions in a vacuum; use web search and exploration to inform the conversation
- **Delta mode preserves good content** — when refining, don't discard well-written sections; enhance and fill gaps

## Anti-Patterns (Do Not)

- **Don't lead the user** — ask "What platform?" not "This should be a web app, right?" Let them state preferences unprompted.
- **Don't accept vague verbs** — words like "improve", "enhance", "make better", "optimize" are not requirements. Push for specifics: "Improve how? Faster load? Fewer steps? Higher accuracy?"
- **Don't skip competitive analysis** — "Nothing like this exists" is almost never true. Push: "What do people use today instead? Spreadsheets? A competitor? Nothing?"
- **Don't conflate vision with v1** — the vision is the 5-year picture; v1 is the minimum useful slice. Keep them separate.
- **Don't invent features** — never add capabilities the user didn't mention or confirm. Infer architecture, not product scope.
- **Don't specify implementation** — this is a product vision, not architecture. Stack, hosting, database, auth mechanism — all belong in `/solution`. If the user volunteers tech preferences, note them briefly but don't expand.
- **Don't assume monetization** — not every product makes money. Ask, don't assume. "Is this a business, a side project, or an internal tool?"
- **Don't rush to synthesis** — if a dimension has only surface-level answers, ask another round. Shallow input produces shallow prompts.
- **Don't use close-ended questions** — "Do you want auth?" gets a yes/no. "How should users identify themselves?" gets a real answer.
- **Don't bounce between topics** — finish one dimension before moving to the next. Context-switching frustrates users and produces fragmented answers.
- **Don't write prose in the output** — the prompt is read by an LLM, not a stakeholder. Every word must earn its place.
- **Don't skip productization** — even if the user says "it's just a side project", explore audience and distribution. The smallest tool still needs to know who finds it and how.
- **Don't dump research** — weave findings into questions naturally. "I noticed X — does that change your thinking on Y?" not "Here are 10 competitors I found."
- **Don't re-ask in delta mode** — if the existing vision already covers a dimension well, acknowledge it and move on. Only probe gaps and shallow areas.

## Success Criteria

The skill is done well when:

1. **Self-contained** — an LLM reading `.claudius/product.md` cold can build the product without asking clarifying questions.
2. **Every dimension covered** — no section left as placeholder or hand-waved.
3. **v1 scope is testable** — each checkbox maps to a test. "Share recipes via link with preview card" not "add social features".
4. **Success is measurable** — north star and KPIs are numbers, not aspirations. "50 weekly active users" not "users love it".
5. **Competitive positioning is clear** — reader knows what exists, what's different, why users switch. Informed by actual research.
6. **Tech-free** — no stack, hosting, database, or auth decisions. Technical implications are flagged but deferred to `/solution`.
7. **Terse and signal-dense** — no filler, no marketing language, no "intuitive experience" prose. Reads like product requirements, not a pitch deck.
8. **User felt heard** — the interview explored their vision, didn't impose one. Final prompt reflects their intent.
9. **Productization is addressed** — audience, distribution, and public presence are clear. Project structure matches the product type.
10. **Research-enriched** — competitive landscape and market context reflect real current data, not guesses.
11. **Delta mode is efficient** — when refining, the user wasn't re-asked things already covered. Only gaps were explored.
