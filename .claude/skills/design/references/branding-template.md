# Theme & Branding Page Template

The branding page is a **route in the prototype app** (`/branding`) that showcases the product's visual identity using real components. It's step-0 of prototyping — scaffolds the app, installs the design system, applies tokens, and renders a branding showcase that validates the theme and component system work together.

This is the first thing the user sees in the running prototype. It should look like something a world-class design agency would present to a client.

## Quality Bar

- **Real components** — uses actual shadcn/ui (or equivalent) Button, Card, Input, Badge components, not static HTML mockups. This validates the tokens render correctly through the component library.
- **Polished** — this is a presentation artifact, not a debug page. Generous whitespace, elegant typography, intentional layout.
- **Interactive** — light/dark mode toggle that switches all swatches and specimens in real-time. Components respond to theme changes.
- **Responsive** — looks good on laptop screens (1280px+). Mobile optimization is not required.

## Required Sections

### 1. Brand Personality Statement
The aesthetic direction from the visual interview (Step 12). Display prominently at the top — this sets the context for everything below.

### 2. Color Palette
- **Semantic colors** — all shadcn semantic variables: `--primary`, `--secondary`, `--accent`, `--muted`, `--destructive`, `--background`, `--foreground`, `--card`, `--popover`, `--border`, `--input`, `--ring`
- **Each swatch** shows: color name, OKLCH value, hex equivalent, and a visual swatch (minimum 80x80px)
- **Light + dark mode** — toggle between both palettes. Both should be visible or easily switchable.
- **Contrast ratios** — show WCAG contrast ratio for foreground-on-background pairs

### 3. Typography Specimens
- **Display font** — show at multiple sizes (48px, 36px, 24px) with real words, not "Aa Bb Cc"
- **Body font** — show at body sizes (16px, 14px, 12px) with a real paragraph of text
- **Font pairing** — show display + body together in a realistic composition (heading + paragraph)
- **Type scale** — show all defined sizes in the token system with their scale names

### 4. Spacing & Radius System
- **Spacing scale** — visual boxes showing each spacing value
- **Border radius** — visual elements showing each radius value
- **Keep it concise** — a simple grid is fine

### 5. Component Compositions
Show the tokens in context using **real components from the installed library**:
- **Card** — actual Card component with CardHeader, CardContent, CardFooter
- **Button set** — actual Button component in primary, secondary, destructive, outline, ghost variants
- **Form elements** — actual Input, Label, Select components with placeholder text and focus states
- **Badge/tag** — actual Badge component in multiple variants

These are real rendered components, not HTML approximations. This validates that tokens flow correctly through the component system.

### 6. Dark Mode Toggle
A toggle in the top-right corner that switches between light and dark mode. Should swap all CSS custom properties and update all components, specimens, and swatches.

## Implementation Notes

- Build as a route in the prototype app (e.g., `app/branding/page.tsx` for Next.js, `src/routes/branding.tsx` for Vite)
- Import and use actual components from the installed component library
- Load tokens via the project's CSS custom properties (from `tokens.css`)
- Load fonts via Google Fonts in the app's layout/head
- Use the actual OKLCH values from the generated tokens
- This route persists in the prototype — later steps add product screens alongside it

## What This Page Is

- **Theme validation** — proves the tokens render correctly through real components
- **Brand showcase** — presents the visual identity for user approval
- **Prototype scaffold proof** — confirms the app, component library, and design system are wired up correctly
- **Step-0 of the prototype** — the same app gets product screens added in Step 16b

## What This Page Is NOT

- Not a standalone HTML file — it's a route in the runnable prototype
- Not a component library catalog — it showcases the brand, not every component variant
- Not generated from a template — each project's page should reflect its unique brand personality
