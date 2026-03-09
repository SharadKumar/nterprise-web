# Component Inventory Template

Structure `.claudius/design/components.md` using this template. Map every component from the screen inventory to this format.

Every component must have a **Source** field identifying its tier in the design system:

| Source | Meaning | Example | Full Spec Needed? |
|--------|---------|---------|-------------------|
| `shadcn/ui (name)` | Tier 1 — base shadcn component | `shadcn/ui (button)` | No — reference only |
| `@namespace/name` | Tier 1.5 — community registry | `@magicui/animated-beam` | No — reference only |
| `shadcn (name) + variant` | Tier 3 — modified shadcn component | `shadcn (button) + brand variant` | Variant spec only |
| `Custom` | Tier 3 — fully custom component | `Custom` | Yes — full spec |

**Tier 1 and 1.5** components need only a reference entry (name, source, purpose, which screens use it). **Tier 3 modified** components need the variant addition documented. **Tier 3 custom** components need the full spec (variants, states, tokens, accessibility, motion).

---

```markdown
# Component Inventory

## Tier 1 — shadcn/ui Base Components

Components installed directly from shadcn's default registry. Themed by the project's registry:theme item.

| Component | Source | Purpose | Used In |
|-----------|--------|---------|---------|
| {Button} | shadcn/ui (button) | {primary actions} | {dashboard, settings, onboarding} |
| {Card} | shadcn/ui (card) | {content containers} | {dashboard, profile} |
| {Dialog} | shadcn/ui (dialog) | {modal confirmations} | {settings, delete flows} |

## Tier 1.5 — Community Registry Components

Components from the shadcn directory. Install with `npx shadcn add @namespace/name`.

| Component | Source | Purpose | Used In |
|-----------|--------|---------|---------|
| {AnimatedBeam} | @magicui/animated-beam | {hero visualization} | {landing page} |

## Tier 3 — Modified shadcn Components

Base shadcn components with project-specific variant additions.

### {ComponentName}

**Source:** shadcn ({base-component}) + {variant-name} variant
**Base:** `npx shadcn add {base-component}`
**Modification:** Add `{variant-name}` variant to CVA config

**Added Variant:**
| Variant | Classes | Description |
|---------|---------|-------------|
| {brand} | {bg-primary text-primary-foreground rounded-full font-sans} | {solid brand color, pill shape} |

**Used in:** {list of screens}

---

## Tier 3 — Custom Components

### Primitives

Low-level building blocks not available in any registry.

#### {ComponentName}

**Source:** Custom
**Purpose:** {what it does, one sentence}

**Variants:**
| Variant | Description |
|---------|-------------|
| {default} | {standard appearance} |
| {outline} | {bordered, no fill} |

**States:**
| State | Visual Change | Token(s) Used |
|-------|---------------|---------------|
| Default | {description} | {--primary} |
| Hover | {description} | {--accent} |
| Active/Pressed | {description} | {--primary} |
| Disabled | {description} | {--muted} |
| Loading | {description} | {animation} |
| Error | {description} | {--destructive} |

**Tokens consumed:** {list of shadcn token variables this component uses}

**Responsive behavior:** {how it adapts across breakpoints}

**Accessibility:**
- ARIA: {role, aria-label, aria-describedby, etc.}
- Keyboard: {Tab focus, Enter/Space activation, Escape dismiss}
- Focus: {visible focus ring using --ring}

**Motion:** {animation on state change, entrance, exit}

---

### Composites

Multi-primitive components. Combine primitives into reusable patterns.

#### {ComponentName}

**Source:** Custom
**Purpose:** {what it does}
**Composed of:** {list of primitives/shadcn components used}
**Variants:** {table}
**States:** {table}
**Tokens consumed:** {list}
**Responsive behavior:** {description}
**Accessibility:** {ARIA, keyboard, focus}
**Motion:** {animation notes}

---

### Layouts

Page-level layout components. Define the structural grid.

#### {LayoutName}

**Source:** Custom
**Purpose:** {which screens use this layout}
**Structure:** {sidebar + content, full-width, split-view, etc.}
**Regions:** {header, sidebar, main, footer — which are fixed/scrollable}
**Responsive behavior:** {how layout adapts — e.g., sidebar collapses to bottom nav on mobile}
**Breakpoints:** {which breakpoint triggers layout changes}

---

### Surface-Specific

Components unique to a single surface (mobile nav, tablet sidebar, TV focus ring, etc.).

#### {ComponentName}

**Source:** Custom
**Surface:** {which surface this belongs to}
**Purpose:** {what it does on this surface}
**Platform conventions:** {iOS HIG, Material Design, tvOS focus engine, etc.}
**Accessibility:** {platform-specific accessibility considerations}
```
