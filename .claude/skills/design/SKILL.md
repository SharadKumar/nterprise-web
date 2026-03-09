---
name: design
description: >-
  Experience and visual design — reads `.claudius/product.md` and
  `.claudius/solution.md`, then works in two phases. Phase 1 (Experience):
  identifies personas, maps user journeys, designs screen-level flows, extracts
  requirements with traceability, builds screen inventory, and defines
  information architecture. Phase 2 (Visual):
  generates design tokens, component inventory, visual designs via Pencil
  (when available), and an interactive prototype in the project's actual
  stack. Writes `.claudius/design.md` as the living
  design document and `.claudius/design/` as the artifact directory. Use after
  /solution to design the user experience and visual system before /spec.
  Triggers on: "design the UX", "design the UI", "user experience",
  "user flows", "design system", "wireframes", "/design". This is Stage 2.5
  of the development lifecycle
  (/product → /solution → /design → /spec → /backlog → /build).
argument-hint: "[--phase1-only] [--surface web]"
---

# /design — Experience & Visual Design

Designs the user experience and visual system in two sequential phases. Phase 1 maps what users go through (journeys, flows, requirements, screens). Phase 2 defines what it looks like (tokens, components, Pencil wireframes, interactive prototype). Reads `.claudius/product.md` and `.claudius/solution.md`, writes `.claudius/design.md` and artifacts to `.claudius/design/`.

This is **Stage 2.5** of the development lifecycle. It reads the output of `/product` (Stage 1) and `/solution` (Stage 2) and produces input for `/spec` (Stage 3).

## Usage
```
/design                  → full two-phase design (experience + visual)
/design --phase1-only    → experience design only (UX flows, no prototype)
/design --surface web    → scope to specific surface
```

## Architecture

```
/design
├── Phase 1: Experience Design (UX)
│   Inputs:  .claudius/product.md, .claudius/solution.md
│   Outputs: personas, journeys, flows, data model, requirements, screen inventory, reconciliation, IA
│   Nature:  analytical, structural — what users go through
│
├── Phase 2: Visual Design (UI)
│   Inputs:  Phase 1 artifacts + product.md + solution.md
│   Outputs: design tokens, component inventory, Pencil wireframes, interactive prototype
│   Nature:  creative, visual — what it looks like
│
└── User can stop after Phase 1 if they only need UX
```

## Collaboration Philosophy

Design realizes the **client's** vision. Every step that produces decisions or artifacts gets user approval before the next step begins. Share file paths so they can review the full output. If the user says "revise", revise.

---

## Phase 1: Experience Design

### Step 1 — Read Upstream Artifacts

```bash
Read .claudius/product.md
Read .claudius/solution.md
```

Parse and internalize: target users, user roles, core capabilities, primary workflows, key views, platform decisions, productization type, integrations, constraints. These are settled decisions — the design skill doesn't revisit them.

### Step 2 — Surface Identification Interview

Use `AskUserQuestion` to confirm which surfaces the product targets:

- Present surfaces detected from upstream (web app, marketing site, mobile, tablet, tvOS, internal tools)
- User confirms, adds, or removes surfaces
- Classify each as primary / secondary / tertiary
- Ask: "Which surface is the primary experience? Where do users spend most of their time?"

### Step 3 — Persona Development

For each user role identified in product.md, create a persona. Read `references/persona-template.md` for the template.

Each persona includes: name, role description, goals, pain points, current workaround, technical sophistication, context of use (desk, mobile, on-the-go), which surfaces they use and why.

Write each to `.claudius/design/personas/<role-slug>.md`. Present to user via `AskUserQuestion` for validation.

### Step 4 — Research

Spawn parallel research agents (Agent tool) to gather:

| Research Area | What to Look For |
|---------------|-----------------|
| Comparable products | Onboarding flows, auth experiences, navigation patterns |
| Platform UX conventions | iOS patterns, web dashboard patterns, tvOS focus navigation |
| Accessibility requirements | WCAG per surface, Apple HIG, Material Design 3 |

Summarize findings to the user. Use `AskUserQuestion`: "Do these findings align with your expectations?" — options: **Approve** / **Add context** / **Research more**.

### Step 5 — User Journey Mapping

For each persona × primary workflow, map the end-to-end journey. Read `references/journey-template.md` for the template.

Stages: awareness → onboarding → first value → regular use → advanced use. At each stage: what the user does, thinks, feels, and where friction exists. Include touchpoints across surfaces (e.g., discovers on web, onboards on mobile, uses daily on tablet).

Write Mermaid journey diagrams to `.claudius/design/journeys/<persona>-<workflow>.md`.

Present each journey to the user with file paths. Use `AskUserQuestion` per journey: "Does this accurately capture <persona>'s <workflow>?" — options: **Approve** / **Revise** / **Remove**.

### Step 6 — Screen-Level Flow Design

For each primary workflow, design the screen-by-screen flow:

- **Onboarding flow**: screens, data captured, progressive disclosure vs. upfront
- **Auth flow**: signup, login, password reset, OAuth (scoped by product.md)
- **Core task flows**: main user actions, step by step
- **Error/edge flows**: what happens when things go wrong

Each flow as a Mermaid flowchart: nodes = screens, edges = user actions/system events. Write to `.claudius/design/flows/<flow-name>.md`.

Present every flow to the user with file paths. Use `AskUserQuestion` per flow: "Does this correctly capture the <flow-name> experience?" — options: **Approve** / **Revise** / **Remove**.

### Step 7 — Data Model

Extract the conceptual data model from journeys, flows, and product.md. This defines the entities users interact with and how they relate — before designing screens or deriving requirements, you need to know your data.

**Process:**
1. Read all flows and journeys — identify every noun that users create, view, edit, or reference
2. Read product.md capabilities — identify entities implied by each capability
3. Read solution.md data model section (if exists) — align with technical model
4. Define entities, attributes, and relationships

**Output format** — write to `.claudius/design/data-model.md`:

```markdown
# Data Model

## Entities

| Entity | Description | Key Attrs |
|---|---|---|
| User | Account holder | name, email, role |
| Entity | Trackable item | title, type, status, due |
| Container | Grouping | name, type, parent |

## Relationships

| From | Rel | To | Notes |
|---|---|---|---|
| User | 1:N | Container | owns |
| Container | 1:N | Entity | holds |
| Container | 1:N | Container | nests |

## Invariants
- Every Entity belongs to exactly one Container
- Containers nest to max depth 3
```

Present to user. Use `AskUserQuestion`: "Does this data model capture the right entities and relationships?" — options: **Approve** / **Add entities** / **Remove entities** / **Revise**.

### Step 8 — Requirements Analysis & Traceability

This is the analytical bridge between "what users go through" and "what screens we need." Requirements are derived independently from user needs and domain expertise — not reverse-engineered from assumed screens. Without this step, screens are invented from intuition rather than traced to needs.

**Spawn the analyst agent** (Agent tool, subagent_type: "analyst") with all Phase 1 artifacts and upstream docs. The analyst drives the process (pass 1 — derivation):

1. Reads all upstream artifacts (product.md, solution.md, personas, journeys, flows, data model)
2. Spawns the **researcher** as a subagent to investigate domain standards, comparable products, regulatory requirements, platform conventions, and accessibility standards
3. Extracts requirements independently across five categories: functional, non-functional, data, integration, and compliance/domain
4. Spawns the researcher again with follow-up questions that emerged during analysis — this iterative analyst-researcher loop deepens coverage with each round
5. Builds traceability — every requirement traces to its source
6. Validates coverage and writes `.claudius/design/requirements.md`

**Requirement categories:**
- **Functional** — what the system must do (from persona goals, journey stages, flow actions, product.md capabilities)
- **Non-functional** — performance, security, accessibility, reliability (from solution.md, domain standards)
- **Data** — what data is needed, sources, freshness, privacy (from flows, integrations)
- **Integration** — third-party services, APIs, platform capabilities (from solution.md)
- **Compliance & domain** — industry standards, platform guidelines, regulations (from researcher findings)

**For each requirement:** ID, description, source (which persona/journey/flow/product.md/domain standard it came from), priority (must-have / should-have / deferred), and which screen(s) will address it (filled in during Step 9).

**Coverage checks:**
- Every persona goal maps to at least one requirement
- Every journey friction point maps to a requirement that resolves it
- Every product.md v1 capability maps to at least one requirement
- Domain research findings are reflected in compliance/non-functional requirements
- Flag any gaps: capabilities with no requirement, requirements with no clear source

Write to `.claudius/design/requirements.md` as a structured document with coverage matrix.

Present the requirements to the user with coverage analysis. Point user to `.claudius/design/requirements.md`. Use `AskUserQuestion`: "Are these the right requirements? Any missing or over-scoped?" — options: **Approve** / **Add requirements** / **Remove requirements** / **Revise**.

### Step 9 — Screen Inventory

Compile the complete list of screens needed. Read `references/screen-template.md` for the template.

For each surface, for each screen: name, purpose, which flow(s) it appears in, what data it displays, what actions are available, which persona uses it, and **which requirements it addresses** (IDs from Step 8). Identify shared screens vs. surface-specific screens.

**Traceability check:** Every requirement from Step 8 must be addressed by at least one screen. Every screen must trace to at least one requirement. Present any gaps — uncovered requirements mean missing screens, and screens with no requirements may be unnecessary.

Write each screen to `.claudius/design/screens/<surface>/<screen-slug>.md` — one file per screen. Each file includes the screen's purpose, requirements addressed, data shown, actions available, personas served, and flow references.

Write a summary index to `.claudius/design/screens/index.md` with the traceability matrix: requirements × screens.

Present the screen inventory with the traceability matrix. Point user to `.claudius/design/screens/index.md`. Use `AskUserQuestion`: "Is this the right set of screens? Does every requirement have coverage?" — options: **Approve** / **Add screens** / **Remove screens** / **Revise**.

### Step 10 — Requirements Reconciliation

After screens are designed, the analyst performs a second pass to reconcile derived requirements against actual screen coverage. This catches gaps in both directions: requirements that no screen addresses, and screen behaviors that imply undocumented requirements.

**Spawn the analyst agent** (Agent tool, subagent_type: "analyst") in reconciliation mode (pass 2):

1. Reads the requirements from Step 8 (`.claudius/design/requirements.md`)
2. Reads the screen inventory from Step 9 (`.claudius/design/screens/`)
3. For each screen, identifies behaviors/capabilities that aren't covered by any existing requirement — these are **implied requirements**
4. For each requirement, verifies at least one screen addresses it — flags **orphan requirements**
5. Produces a reconciliation diff:
   - **New requirements** — implied by screens but not in the original requirements set
   - **Orphan requirements** — derived but not addressed by any screen (needs a new screen or is out of scope)
   - **Coverage gaps** — requirements partially addressed (screen exists but doesn't fully satisfy the requirement)

**Output:** Appends a `## Reconciliation` section to `.claudius/design/requirements.md`:

```markdown
## Reconciliation
Reconciled: {timestamp}

### Implied Requirements (from screens)
| ID | Requirement | Source Screen | Priority |
|----|------------|---------------|----------|
| FR-042 | {description} | {screen that implies it} | {priority} |

### Orphan Requirements (no screen coverage)
| ID | Requirement | Resolution |
|----|------------|------------|
| FR-015 | {description} | Add screen / Defer / Remove |

### Coverage Gaps
| ID | Requirement | Screen | Gap |
|----|------------|--------|-----|
| FR-023 | {description} | {screen} | {what's missing} |
```

Present the reconciliation to the user. Use `AskUserQuestion`: "The analyst found these gaps between requirements and screens. How should we proceed?" — options: **Accept all** / **Review individually** / **Re-run requirements** / **Re-run screens**.

If the user accepts or adjusts, update both `requirements.md` and the screen inventory as needed before proceeding.

### Step 11 — Information Architecture

Design the navigation structure per surface:

- Site/app map (Mermaid diagram)
- Navigation patterns (sidebar, tabs, bottom nav, hamburger)
- How screens interconnect — which screen leads to which
- Content hierarchy within key screens

Write to `.claudius/design/ia.md`.

Point user to `.claudius/design/ia.md`. Use `AskUserQuestion`: "Does this navigation model match how you expect users to move through the product?" — options: **Approve** / **Revise navigation** / **Revise hierarchy**.

### Step 12 — Phase 1 Checkpoint

Present Phase 1 summary via `AskUserQuestion`:

- Persona count, journey count, flow count, screen count per surface
- Key UX decisions made
- Options: **"Approve Phase 1 and continue to Visual Design"** / **"Revise Phase 1"** / **"Stop here (Phase 1 only)"**

If `--phase1-only` flag was passed, stop here with a summary report.

---

## Phase 2: Visual Design

Read `references/frontend.md` for visual design quality guidance before starting this phase.

### Step 13 — Detect Stack & Tooling

Read `.claudius/solution.md` to identify the project's frontend stack. This determines the prototype format.

**Stack detection:**

| Stack | Prototype Format | Runner |
|-------|-----------------|--------|
| Expo / React Native | Expo app with Expo Router | `npx expo start` / Expo Go |
| Next.js / React | Next.js or Vite app with React Router | `npm run dev` |
| Vue / Nuxt | Nuxt app with file-based routing | `npm run dev` |
| Svelte / SvelteKit | SvelteKit app | `npm run dev` |
| No frontend / unknown | Vite + React app | `npm run dev` |

Also probe for available MCP tools:
- **Pencil MCP** → note availability for visual design exploration (Step 18a)
- **Figma MCP** → note availability for reading existing designs
- **shadcn MCP** → note availability for `/build` to discover and install components from the project registry

Use `AskUserQuestion`: "I detected <stack> and plan to prototype as <format>. Correct?" — options: **Confirm** / **Use different stack** / **Use different prototype format**.

### Step 14 — Visual Personality Interview

Use `AskUserQuestion`. The choices here define the product's visual identity — read `references/frontend.md` to inform the aesthetic direction.

- **Visual personality**: brutally minimal, maximalist, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian — or describe your own
- **Brand colors and fonts** — avoid generic choices (Inter, Roboto, Arial). Pick distinctive, characterful typography. Pair a display font with a body font.
- **Dark mode** support?
- **Component library** alignment (shadcn/ui is biased default per `bias.md`)
- **What makes this product's visual identity UNFORGETTABLE?**

### Step 15 — Visual Research

Spawn research agents for:

- Design system trends matching the chosen aesthetic
- Reference systems matching the tech stack
- Platform-specific visual guidelines
- Distinctive typography pairings (display + body font) that match the aesthetic

Summarize visual findings to the user. Use `AskUserQuestion`: "Does this align with your vision? Anything to add?" — options: **Approve** / **Add context** / **Research more**.

### Step 16 — Generate Design Tokens & Theme Registry Item

Read `references/tokens-template.css` for the CSS structure and `references/registry-guide.md` for the OKLCH format and shadcn variable names. Generate:

- `.claudius/design/tokens.css` — shadcn convention: `:root` (light) + `.dark` + `@theme inline` bridge. All colors in **OKLCH** format.
- `.claudius/design/tokens.json` — W3C DTCG format (interoperable)
- `.claudius/design/registry/theme.json` — `registry:theme` item from `references/theme-registry-item-template.json`. Contains `cssVars` with `theme` (fonts, radius), `light`, and `dark` sections using OKLCH values.

Token categories: color (shadcn semantic names: `--primary`, `--background`, `--muted`, etc.), typography (fonts, scale), spacing, border-radius, motion/duration.

Tokens must reflect the bold aesthetic direction from Step 14 — dominant colors with sharp accents, not timid evenly-distributed palettes. No generic defaults.

Use OKLCH format for all colors: `oklch(lightness chroma hue)`. See `references/registry-guide.md` for the complete variable-to-utility mapping.

After generating tokens, create a **theme & branding prototype** — this is step-0 of the interactive prototype (Step 18b). It scaffolds the prototype app, applies the design tokens, installs base components, and renders a branding showcase page using actual components. This validates that the theme and component system work together before building screens.

1. Generate tokens as usual (tokens.css, tokens.json, registry/theme.json)
2. **Scaffold the prototype** at `.claudius/design/prototype/` using the detected stack from Step 13. Install the component library (shadcn/ui or equivalent). Apply the tokens as CSS custom properties.
3. **Build a branding showcase route** (`/branding` or equivalent) using real components. Read `references/branding-template.md` for the structure and quality bar. The page uses actual Button, Card, Input, Badge components — not static HTML. Showcases: color palette with light/dark toggle, typography specimens, spacing/radius system, component compositions (cards, buttons, form elements, badges), brand personality statement.
4. Start the dev server. Tell user: "Open `http://localhost:PORT/branding` to review the theme and branding."
5. Use `AskUserQuestion`: "Does this brand direction feel right?" — options: **Approve** / **Revise colors** / **Revise typography** / **Start over**

This scaffold persists — Step 18b adds screens to the same prototype app rather than creating a new one.

### Step 17 — Generate Component Inventory

Read `references/component-template.md` for the template and `references/registry-guide.md` for the four-tier model. Map Phase 1 screen inventory (Step 9) to required components.

For each component, assign a **source tier**:

- **Tier 1 — shadcn/ui**: Base components from shadcn's default registry. Record as reference only (name, source, purpose, screens).
- **Tier 1.5 — Community**: Components from the [shadcn directory](https://ui.shadcn.com/docs/directory). Use namespace syntax: `@magicui/animated-beam`. Reference only.
- **Tier 3 — Modified shadcn**: Base shadcn component + project-specific variant. Document the variant addition (name, classes, description).
- **Tier 3 — Custom**: Fully novel components. Full spec: variants, states, tokens consumed, responsive behavior, accessibility, motion.

Prefer Tier 1 and 1.5 components over custom builds. Only create Tier 3 custom components when no existing component covers the need.

Include motion notes per `references/frontend.md`: high-impact page load sequences, scroll-triggered reveals, hover states that surprise.

Write to `.claudius/design/components.md`.

Present the component breakdown with tiers and screen mappings. Point user to `.claudius/design/components.md`. Use `AskUserQuestion`: "Does this component strategy look right?" — options: **Approve** / **Add components** / **Remove components** / **Revise tiers**.

### Step 17.5 — Assemble Registry

Read `references/registry-template.json` for the manifest structure. Assemble the design system registry:

1. Ensure `.claudius/design/registry/theme.json` exists (from Step 16)
2. Create `.claudius/design/registry/registry.json` from `references/registry-template.json`
3. Add `$ref` entries for any Tier 3 custom component items that were created as registry items
4. Set `name` to the project slug from `product.md`

### Step 18a — Visual Design with Pencil (if available)

If Pencil MCP was detected in Step 13, use it for visual design exploration. Read `references/pencil-guide.md` for prompting patterns.

Pencil excels at **rapid visual exploration** — trying aesthetic directions, refining layouts, and validating the visual feel before committing to code. Use it to design every screen from the inventory.

**Workflow:**

1. **Discovery** — Let Pencil read editor state, guidelines, style guide, variables, and existing components
2. **Create all placeholder frames** — one frame per screen, before any design work
3. **Design each screen in sections** — 2-4 Design calls per screen (hero/layout → form fields → CTAs → secondary elements). Each call includes full screen context + what to add.
4. **Fix pass** — After all screens are designed, batch-fix icons, fonts, spacing issues
5. **Screenshot each screen** — Use Pencil's `get_screenshot` to render each artboard as PNG. Save alongside the `.pen` file (e.g., `checkout.pen` → `checkout.png`).
6. **Write wireframes index** — Create `.claudius/design/wireframes/index.md` with all screenshots embedded as `![Screen Name](app-name/screen.png)` for easy browsing in Claudia Studio.

**Critical rule:** Design in meaningful sections (hero, form, CTA), not individual nodes. Always include full screen context in every Design call — Pencil doesn't carry state between calls.

**Directory structure:** `.claudius/design/wireframes/{app-name}/` — one folder per app (monorepo-friendly). Single-app projects use one folder. Each folder contains `.pen` files and their `.png` screenshots.

```
design/wireframes/
├── index.md              ← browsable index with all screenshots
├── storefront/
│   ├── checkout.pen
│   ├── checkout.png
│   ├── product-page.pen
│   └── product-page.png
└── admin/
    ├── dashboard.pen
    └── dashboard.png
```

Review each screen individually: design → screenshot → present to user → `AskUserQuestion` ("Does this layout work?") → next screen. Options: **Approve** / **Revise layout** / **Revise content** / **Start over**.

If Pencil is not available, skip to Step 18b.

### Step 18b — Build Interactive Prototype

Build screens into the prototype app scaffolded in Step 16. The prototype already has the design system, component library, and branding route — this step adds all product screens with navigation.

If Pencil wireframes exist from Step 18a, the prototype implements them in code. If no Pencil, the prototype is the primary visual artifact — apply the component inventory directly.

**Why stack-native:** The prototype is built in the project's actual codebase — same framework, router, and component patterns as the real app. Code written here becomes scaffolding for `/build` — not throwaway artifacts.

**Prototype structure** (continuing from Step 16's scaffold):

1. **Shared layout** — Platform chrome (status bar, nav bar, tab bar for mobile; sidebar/header for web)
4. **All screens** — Every screen from the inventory (Step 9), with placeholder/realistic content
5. **Navigation** — Working routes between screens following the flows from Step 6
6. **Responsive** — If multi-surface, prototype adapts or has separate surface entry points

**Stack-specific guidance:**

| Stack | Scaffold | Router | Tokens |
|-------|----------|--------|--------|
| Expo | `npx create-expo-app` | Expo Router (file-based) | NativeWind + CSS vars |
| Next.js | `npx create-next-app` | App Router (file-based) | Tailwind + CSS vars |
| Vite + React | `npm create vite` | React Router | Tailwind + CSS vars |
| SvelteKit | `npx sv create` | File-based routing | CSS vars |
| No frontend | `npm create vite` (React) | React Router | CSS vars |

**Fidelity:** Low-to-mid. Focus on layout structure, component placement, content hierarchy, and navigation flow. Use the design tokens for colors/typography but don't build interaction logic. Placeholder data is fine — realistic labels and copy are better than lorem ipsum.

**What the prototype is NOT:**
- Not the real app — no API calls, no state management, no business logic
- Not pixel-perfect — spacing and alignment matter, but don't over-polish

**Prototype lives in the actual app codebase** — not in `.claudius/`. The prototype is just routes/pages in the project's `src/` directory using the project's real stack.

**Pointer file:** Write `.claudius/design/prototype.md` summarising:
- What was prototyped (which screens/flows)
- Which routes to visit (e.g., `/onboarding`, `/dashboard`, `/settings`)
- How to run it (e.g., `npm run dev`)
- Link to preview deploy if applicable

Build scaffold + design system + shared layout first. Then review each screen individually: build → share dev server URL and route → `AskUserQuestion` ("Review <screen-name> at <url>. Does this look right?") → next screen. Options: **Approve** / **Revise layout** / **Revise content** / **Revise styling**.

### Step 19 — Write Design Document

Read `references/design-template.md` for the template. Write `.claudius/design.md` with:

- Design overview (experience rationale + visual rationale + aesthetic direction statement)
- Surface matrix
- Phase 1 summary: personas, journeys, flows, screen count, IA
- Phase 2 summary: aesthetic direction, token palette, typography choices, component count, prototype screen count
- **Design System section**: registry location, theme item path, CSS/JSON token paths, component sourcing table (count per tier: shadcn base, community, modified, custom)
- Key design decisions with rationale
- Links to all artifact files

Point user to `.claudius/design.md` for review. Use `AskUserQuestion`: "Does this accurately capture the design decisions?" — options: **Approve** / **Revise**.

### Step 20 — Present for Approval + Report

Use `AskUserQuestion` with markdown preview. Options: **Approve** / **Revise**.

On approval, write all files. Report: artifact summary + "Next: `/spec` to write detailed specifications."

---

## Design Delta Assessment

After both phases, evaluate if design work revealed upstream changes (same pattern as `/solution`):

- **Scope trimming** — features that don't work as designed
- **Scope expansion** — UX capabilities that naturally emerge
- **Platform shifts** — surface priorities that changed during design
- **New constraints** — accessibility, navigation, or interaction requirements surfaced

If delta is non-empty, present to user and optionally write to `.claudius/product.md` under `## Design-Informed Revisions`.

## Delta Mode

When `.claudius/design.md` already exists:
1. Read all existing artifacts in `.claudius/design/` including `registry/`
2. Diff against current upstream (product.md + solution.md)
3. Only regenerate changed Phase 1 or Phase 2 artifacts
4. Update registry items if theme or components changed
5. Present diff summary before modifying

## Rules

- **Every step gets user approval** — present artifacts, get explicit sign-off, then proceed
- **Read upstream first** — `.claudius/product.md` and `.claudius/solution.md` are inputs, not suggestions
- **Two phases, sequential** — Phase 1 completes before Phase 2 begins
- **User approves Phase 1** before Phase 2 starts
- **Prototype, not product** — the prototype is runnable code but has no business logic, API calls, or state management. It's a clickthrough for layout and navigation validation.
- **No PlanMode** — this skill uses `AskUserQuestion` for interaction
- **Self-contained output** — `.claudius/design.md` should be readable independently
- **Surface design deltas** — don't silently absorb product-level discoveries

## Anti-Patterns (Do Not)

- **Don't skip Phase 1 to jump to the prototype** — you can't design screens you haven't inventoried, and you can't inventory screens without understanding the flows
- **Don't use generic AI aesthetics** — no Inter/Roboto/Arial, no purple-on-white, no cookie-cutter layouts
- **Don't converge on common choices** — vary themes, fonts, spatial composition across projects
- **Don't default to flat solid backgrounds** — create atmosphere with gradients, textures, depth
- **Don't scatter micro-interactions** — one well-orchestrated page load beats many small animations
- **Don't revisit product decisions** — product.md is settled. Design how it works, not whether it exists
- **Don't design in a vacuum** — research comparable products, platform conventions, accessibility standards
- **Don't build the prototype without context** — every screen links back to a flow and a persona
- **Don't batch decisions** — present each meaningful artifact individually, not 10 screens at once
- **Don't treat approval as a formality** — if the user says "revise", revise

## Success Criteria

1. **Phase 1 is complete** — every user role has a persona, every primary workflow has a journey and flow, requirements are extracted with traceability, every screen is inventoried and traces to requirements, navigation is defined
2. **Phase 2 is cohesive** — tokens, components, and prototype share a consistent aesthetic that reflects the personality interview
3. **Traceable end-to-end** — every requirement traces to a persona/journey/flow source, every screen traces to requirements, every product.md capability is covered by at least one requirement
4. **Distinct, not generic** — visual identity is memorable and specific to this product
5. **Spec-ready** — `/spec` can reference screens, components, and flows without ambiguity
6. **Research-informed** — design decisions reflect platform conventions, accessibility standards, and competitive analysis
7. **User approved every step** — every artifact was presented and signed off before the next step began
