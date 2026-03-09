# Design Document Template

Structure `.claudius/design.md` using this template. Fill every section. Link to artifact files rather than inlining their full content.

**Writing rules:** This document is read by the `/spec` skill, `/build` skill, and developers. Be precise. State design decisions with rationale. Link to artifacts. Cut ambiguity.

---

```markdown
# {Project Name} — Design Document

**Product:** `.claudius/product.md`
**Architecture:** `.claudius/solution.md`

## Design Overview

{2-3 sentences: what experience was designed, what aesthetic direction was chosen, and why. This is the design thesis — a reader should understand the product's feel from this paragraph alone.}

**Aesthetic direction:** {one-line statement, e.g., "Industrial-minimalist with monospace typography and high-contrast data visualization"}

## Surfaces

| Surface | Priority | Breakpoints | Notes |
|---------|----------|-------------|-------|
| {Web app} | Primary | 1440/1024/768/375 | {main experience} |
| {Mobile} | Secondary | 375/320 | {companion app} |

## Phase 1: Experience Design

### Personas

| Persona | Role | Primary Surface | Key Workflow |
|---------|------|-----------------|--------------|
| {Name} | {role} | {surface} | {workflow} |

Full personas: `design/personas/`

### User Journeys

| Persona | Workflow | Stages | Friction Points |
|---------|----------|--------|-----------------|
| {Name} | {workflow} | {count} | {key friction} |

Full journeys: `design/journeys/`

### Screen Flows

| Flow | Screens | Entry Point | Exit Point |
|------|---------|-------------|------------|
| {Onboarding} | {count} | {first screen} | {completion screen} |
| {Core task} | {count} | {entry} | {exit} |

Full flows: `design/flows/`

### Screen Inventory

| Surface | Screen Count | Shared Screens | Surface-Specific |
|---------|-------------|----------------|------------------|
| {Web} | {N} | {N shared} | {N unique} |

Full inventory: `design/screens.md`

### Information Architecture

{Brief description of navigation pattern per surface}

Full IA: `design/ia.md`

## Phase 2: Visual Design

### Aesthetic Direction

**Visual personality:** {chosen direction}
**Typography:** {display font} + {body font} — {rationale}
**Color strategy:** {dominant/accent approach, dark mode support}
**Motion philosophy:** {e.g., "orchestrated page loads, minimal micro-interactions"}

### Design System

The design system is distributed as a **shadcn registry** at `design/registry/`.

**Registry location:** `.claudius/design/registry/registry.json`
**Theme:** `.claudius/design/registry/theme.json` (registry:theme, OKLCH tokens)
**CSS tokens:** `.claudius/design/tokens.css` (shadcn convention: :root + .dark + @theme inline)
**JSON tokens:** `.claudius/design/tokens.json` (W3C DTCG format)

#### Component Sourcing

| Tier | Source | Count | Examples |
|------|--------|-------|---------|
| 1 | shadcn/ui (base) | {N} | {Button, Card, Dialog, ...} |
| 1.5 | Community registries | {N} | {@magicui/animated-beam, ...} |
| 3 (modified) | shadcn + variant | {N} | {Button + brand, ...} |
| 3 (custom) | Custom | {N} | {CustomComponent, ...} |

Full inventory: `design/components.md`

### Design Tokens

| Category | Token Count | Format |
|----------|-------------|--------|
| Color (light + dark) | {N} | OKLCH — CSS + JSON |
| Typography | {N} | CSS + JSON |
| Spacing | {N} | CSS + JSON |
| Other (radius, shadows, motion) | {N} | CSS + JSON |

Token files: `design/tokens.css`, `design/tokens.json`

### Wireframes

{Include this section only if Pencil was used}

| App | Screen | Wireframe | Preview |
|-----|--------|-----------|---------|
| {storefront} | {Checkout} | `design/wireframes/storefront/checkout.pen` | `design/wireframes/storefront/checkout.png` |

Wireframe directory: `design/wireframes/{app-name}/`
Index: `design/wireframes/index.md`

### Prototype

**Location:** prototype lives in the actual app codebase (not in `.claudius/`)
**Run:** `{run command, e.g., npm run dev}`
**Routes:** {list of prototyped routes, e.g., /onboarding, /dashboard, /settings}
**Screens:** {N screens with working navigation}

Pointer: `design/prototype.md` — summarises what was prototyped, which routes, and how to access.

The prototype is built in the project's actual framework and stack. Code serves as scaffolding for `/build`.

## Key Design Decisions

| Decision | Chose | Over | Because |
|----------|-------|------|---------|
| {Navigation pattern} | {Sidebar} | {Top nav} | {rationale} |
| {Typography} | {chosen fonts} | {alternatives} | {rationale} |

## Open Design Questions

- {Unresolved design decision that needs more information}
```
