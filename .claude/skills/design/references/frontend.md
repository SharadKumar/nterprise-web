# Frontend Design Quality Reference

Read this during Phase 2 (Visual Design) to inform aesthetic direction, typography, color, motion, and spatial composition decisions. This guidance ensures distinctive, production-grade visual design that avoids generic AI aesthetics.

## Design Thinking

Before designing, understand the context and commit to a BOLD aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme — brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work — the key is intentionality, not intensity.

## Typography

Choose fonts that are beautiful, unique, and interesting:

- **Avoid generic fonts**: Arial, Inter, Roboto, system fonts — these are the hallmark of generic AI output
- **Pick distinctive choices** that elevate the product's identity — unexpected, characterful font selections
- **Pair a display font with a body font**: the display font carries personality, the body font carries readability
- **Never converge on common choices** (e.g., Space Grotesk) across projects — vary typography per product

Good pairings emerge from contrast: geometric + humanist, slab serif + grotesque, condensed + wide. The display font should be opinionated; the body font should be invisible.

## Color & Theme

- **Use OKLCH color format** — shadcn/Tailwind v4 standard. Perceptually uniform, wider gamut, predictable results when manipulating colors. Format: `oklch(lightness chroma hue)`.
- **Use shadcn CSS variable names** (`--primary`, `--background`, `--muted`, etc.) — these map directly to Tailwind utility classes (`bg-primary`, `text-muted-foreground`). See `references/registry-guide.md` for the complete variable list.
- **Dominant colors with sharp accents** outperform timid, evenly-distributed palettes
- **Commit to a cohesive aesthetic** — don't hedge with safe neutrals everywhere
- **Consider dark mode** as a first-class citizen, not an afterthought — define both `:root` (light) and `.dark` token sets
- **Build the theme as a registry:theme item** — one JSON file that constrains all UI through `cssVars` for light/dark modes. See `references/theme-registry-item-template.json`.

## Motion & Animation

- **Motion library** (Framer Motion for React, Reanimated for React Native) when available
- **High-impact moments over scattered micro-interactions**: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than many small hover effects
- **Scroll-triggering**: reveal content as users scroll — intersection observer patterns
- **Hover states that surprise**: not just color changes — scale, rotation, shadow shifts, clip-path reveals
- **Duration tokens**: fast (150ms) for micro-interactions, medium (300ms) for transitions, slow (500ms) for page-level orchestration

## Spatial Composition

- **Unexpected layouts**: not everything needs to be a centered card grid
- **Asymmetry**: intentional imbalance creates visual tension and interest
- **Overlap**: elements that break out of their containers create depth
- **Diagonal flow**: angled sections, rotated elements, non-horizontal dividers
- **Grid-breaking elements**: hero images that bleed, text that overlaps columns
- **Generous negative space OR controlled density**: both are valid strategies, but choose one and commit

## Backgrounds & Visual Details

Create atmosphere and depth rather than defaulting to solid colors:

- **Gradient meshes**: multi-point gradients that create organic color fields
- **Noise textures**: subtle grain adds tactile quality to digital surfaces
- **Geometric patterns**: repeating shapes as background texture
- **Layered transparencies**: overlapping semi-transparent elements
- **Dramatic shadows**: not just subtle box-shadows — bold, colored, offset shadows
- **Decorative borders**: not just 1px solid gray — thick, colored, patterned
- **Grain overlays**: CSS noise or SVG filters for texture

## Anti-Patterns (Never Do These)

- **No generic AI aesthetics** — if it looks like "default ChatGPT output", redesign it
- **No Inter/Roboto/Arial** — these are the typography equivalent of beige
- **No purple gradients on white backgrounds** — the most overused AI design pattern
- **No cookie-cutter layouts** — centered hero → features grid → testimonials → CTA is generic
- **No flat solid backgrounds everywhere** — create visual atmosphere
- **No scattered micro-interactions** — orchestrate motion, don't sprinkle it
- **No safe, inoffensive color palettes** — commit to a bold direction

## Matching Complexity to Vision

- **Maximalist designs** need elaborate code: extensive animations, layered effects, bold typography, complex layouts
- **Minimalist designs** need restraint and precision: careful spacing, subtle typography, one or two perfect details
- Elegance comes from executing the vision well, not from choosing a "safe" middle ground
