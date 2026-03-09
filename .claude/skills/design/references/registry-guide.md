# shadcn Registry Guide

Reference for Phase 2 of `/design`. Use this to generate the design system as a shadcn registry.

## Four-Tier Model

```
Tier 1: shadcn/ui base           → default registry (Button, Card, Dialog, etc.)
Tier 1.5: Community registries   → shadcn directory (@magicui, @aceternity, etc.)
Tier 2: Project theme            → registry:theme item (OKLCH tokens, fonts, radius)
Tier 3: Custom/modified          → project-specific registry items
```

### Tier 1 — shadcn/ui Base

Always available. 400+ components. Install with `npx shadcn add <component>`. Themed automatically by Tier 2.

### Tier 1.5 — Community Registries

The [shadcn directory](https://ui.shadcn.com/docs/directory) lists 134+ community registries. Install with namespace syntax: `npx shadcn add @magicui/animated-beam`. These pick up Tier 2 theming when they use shadcn CSS variable conventions.

When specifying community components in the component inventory, use the full namespace: `@magicui/animated-beam`, `@aceternity/sparkles`.

### Tier 2 — Project Theme

The primary design system artifact. A single `registry:theme` item that defines:
- OKLCH color tokens for light and dark modes
- Font families (display, body, mono)
- Border radius base value

See `theme-registry-item-template.json` for the structure.

### Tier 3 — Custom & Modified Components

Two sub-categories:

**Modified shadcn components**: Base component + project-specific variant.
- Example: Button + `brand` variant (solid brand color, rounded-full, font-display)
- `/build` installs the base, then adds the variant to the CVA config
- Record as: `shadcn (button) + brand variant`

**Fully custom components**: Novel components not in any registry.
- Specified in full in the component inventory (variants, states, tokens, accessibility)
- `/build` creates them as `registry:block` or `registry:ui` items
- Record as: `Custom`

## OKLCH Color Format

shadcn/ui uses OKLCH for Tailwind v4. All tokens must use OKLCH format.

```css
--primary: oklch(0.21 0.034 264);
```

OKLCH syntax: `oklch(lightness chroma hue)`
- **Lightness**: 0 (black) to 1 (white)
- **Chroma**: 0 (gray) to ~0.4 (most vivid)
- **Hue**: 0-360 degrees (0=pink, 60=yellow, 120=green, 240=blue, 300=purple)

### shadcn Token Names

Use these exact variable names — they map to Tailwind utility classes:

| Variable | Tailwind Class | Purpose |
|----------|---------------|---------|
| `--background` | `bg-background` | Page background |
| `--foreground` | `text-foreground` | Default text |
| `--card` | `bg-card` | Card background |
| `--card-foreground` | `text-card-foreground` | Card text |
| `--popover` | `bg-popover` | Popover background |
| `--popover-foreground` | `text-popover-foreground` | Popover text |
| `--primary` | `bg-primary` | Primary actions |
| `--primary-foreground` | `text-primary-foreground` | Text on primary |
| `--secondary` | `bg-secondary` | Secondary actions |
| `--secondary-foreground` | `text-secondary-foreground` | Text on secondary |
| `--muted` | `bg-muted` | Muted backgrounds |
| `--muted-foreground` | `text-muted-foreground` | Muted text |
| `--accent` | `bg-accent` | Accent highlights |
| `--accent-foreground` | `text-accent-foreground` | Text on accent |
| `--destructive` | `bg-destructive` | Destructive actions |
| `--border` | `border-border` | Borders |
| `--input` | `border-input` | Input borders |
| `--ring` | `ring-ring` | Focus rings |
| `--chart-1` through `--chart-5` | — | Chart colors |
| `--sidebar-*` | — | Sidebar-specific tokens |

### Light/Dark Convention

```css
:root {
  --primary: oklch(0.21 0.034 264);
  --primary-foreground: oklch(0.98 0.003 264);
}
.dark {
  --primary: oklch(0.92 0.024 264);
  --primary-foreground: oklch(0.21 0.034 264);
}
@theme inline {
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
}
```

## Registry Authoring

### registry.json

The manifest file. Must have `$schema`, `name`, and `items` array:

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "project-name",
  "homepage": "",
  "items": [
    { "$ref": "theme.json" }
  ]
}
```

### registry-item.json

Each item has a `type` that determines how shadcn processes it:

| Type | Purpose |
|------|---------|
| `registry:theme` | Theme with cssVars (light/dark/theme) |
| `registry:ui` | UI component (installed to components/ui/) |
| `registry:block` | Block component (full page section) |
| `registry:hook` | React hook |
| `registry:lib` | Utility library |

### Theme Item Structure

See `theme-registry-item-template.json`. Key fields:
- `name`: Theme identifier
- `type`: Must be `registry:theme`
- `cssVars.theme`: Font families, radius — applied at the `@theme` level
- `cssVars.light`: Light mode color tokens
- `cssVars.dark`: Dark mode color tokens

## MCP Integration

The [shadcn MCP server](https://ui.shadcn.com/docs/mcp) allows Claude Code to:
- Browse available components from the default registry
- Install components into the project
- Read component documentation

During `/design` Step 10, detect if the shadcn MCP is available. If so, note it for `/build` to use during component installation.

During `/build` Step 4, if shadcn MCP is available:
1. Use it to browse available components matching the design inventory
2. Install theme and components through the MCP interface
3. Verify installations match the design system specification

## Component Modification Patterns

### Adding a Variant

After installing a base shadcn component, add variants to the CVA config:

```tsx
// components/ui/button.tsx — after shadcn install
const buttonVariants = cva("...", {
  variants: {
    variant: {
      default: "...",
      destructive: "...",
      outline: "...",
      // Added by design system:
      brand: "bg-primary text-primary-foreground rounded-full font-display",
    },
  },
});
```

### Composition Over Modification

When possible, compose rather than modify:

```tsx
// components/brand-button.tsx — wraps shadcn Button
import { Button, type ButtonProps } from "@/components/ui/button";

export function BrandButton(props: ButtonProps) {
  return <Button className="rounded-full font-display" {...props} />;
}
```

### When to Modify vs Compose

- **Modify** when: The variant should be available via the `variant` prop everywhere. The change is part of the design system vocabulary.
- **Compose** when: The combination is application-specific. The base component's API doesn't need to change.

## Generating the Registry

During Phase 2 of `/design`:

1. Generate OKLCH tokens from the visual personality interview
2. Write `tokens.css` (shadcn CSS convention)
3. Write `tokens.json` (W3C DTCG format for portability)
4. Build `theme.json` from `theme-registry-item-template.json`
5. Tag each component in the inventory with its source tier
6. For Tier 3 custom components, create registry item stubs
7. Assemble `registry.json` manifest linking all items
8. Write everything to `.claudius/design/registry/`
