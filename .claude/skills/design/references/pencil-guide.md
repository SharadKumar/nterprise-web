# Pencil.dev Guide

Reference for generating visual designs using Pencil MCP tools during Phase 2 (Visual Design).

## How Pencil Works

Pencil is a vector design tool that generates `.pen` files — JSON-based design documents that live alongside code in git. It integrates with Claude Code via MCP, exposing tools to read, create, and modify designs programmatically. Pencil has an internal agent (Ember) that orchestrates multi-step design work.

Key capabilities:
- `.pen` files are git-friendly JSON describing an object tree (frames, text, shapes, refs) with flexbox layout, variables/theming, and a reusable component system
- **Built-in UI kits**: shadcn UI, Halo, Lunaris, Nitro — ready-to-use component libraries
- **Two-way code sync**: Design → Code (generate React/Vue/Svelte from designs) and Code → Design (import existing components into `.pen`)
- **Variable sync**: Import CSS variables from `globals.css` into Pencil variables and export back

## MCP Tools

Pencil's MCP server runs locally when Pencil is open. Tools use the `mcp__pencil__` prefix in Claude Code.

### Design Tools

| Tool | Purpose |
|------|---------|
| `batch_design` | Create, modify, manipulate design elements. Operations: insert, copy, update, replace, move, delete. Can generate and place images. |
| `batch_get` | Read design components and hierarchy. Search by patterns. Inspect structure. Params: `filePath`, `nodeIds`, `readDepth`, `resolveInstances`, `resolveVariables`. |
| `open_document` | Create or open a `.pen` file. Param: `filePathOrTemplate` ("new" or file path). |

### Analysis Tools

| Tool | Purpose |
|------|---------|
| `get_screenshot` | Render design preview as image. Optional scale (1x/2x). |
| `snapshot_layout` | Analyze layout structure. Detect positioning issues. Find overlapping elements. |
| `get_editor_state` | Current editor context, selection information, active file details. |

### Design System Tools

| Tool | Purpose |
|------|---------|
| `get_variables` | Read design tokens/theme variables from `.pen` file. |
| `set_variables` | Define/update design tokens (colors, typography, spacing). |
| `get_style_guide_tags` | List available style guide tags (includes UI kit styles). |
| `get_style_guide` | Retrieve visual direction/style rules for selected tags. |
| `get_guidelines` | Fetch layout/design best practices. Types: `"design-system"`, `"landing-page"`. |

## Built-in UI Kits

Pencil ships with pre-built design systems. When the project uses shadcn (detected in Step 10 from `solution.md`), leverage the **shadcn UI kit** — it provides ready-to-use component designs that match the shadcn component library used in code.

Use `get_style_guide_tags` to discover available kit styles, then `get_style_guide` to load them. This gives Pencil's agent built-in knowledge of component patterns, spacing conventions, and visual structure.

## .pen File Format

`.pen` files are JSON describing an object tree. Key concepts:

**Node types:** `frame`, `rectangle`, `ellipse`, `text`, `note`, `path`, `line`, `polygon`, `icon_font`, `ref`, `group`, `prompt`, `context`

**Layout:** Frames support flexbox — `layout` ("none"/"vertical"/"horizontal"), `gap`, `padding`, `justifyContent`, `alignItems`. Children use `width`/`height` with sizing behaviors (`"fit_content"`, `"fill_container"`).

**Fills:** Solid color, gradient (linear/radial/angular/mesh), image. Multiple fills per object.

**Effects:** `blur`, `background_blur`, `shadow` (inner/outer with offset, spread, color).

**Components:** Mark with `reusable: true`. Instantiate with `type: "ref"` + `ref: "<id>"`. Instances support property overrides and descendant customization via path syntax.

**Variables & Theming:** Document-wide tokens (`color`, `number`, `boolean`, `string` types) with theme-based values. Themes are axis-based — e.g., `{ "mode": ["light", "dark"] }` lets variables resolve differently per theme context.

**Icons:** `icon_font` type supports lucide, feather, Material Symbols, phosphor.

## Workflow

### 1. Discovery

Before designing, read existing state:

```
get_editor_state          → what's on the canvas
get_style_guide_tags      → available style tags (includes UI kit styles)
get_style_guide(tags)     → visual direction for chosen tags
get_guidelines("design-system") → layout best practices
get_variables             → existing design tokens
```

### 2. Set Up Design Tokens

Use `set_variables` to define the token palette from Step 13 (colors, typography, spacing) before designing screens. Tokens use Pencil's variable system with theme support for light/dark modes.

If the project has existing CSS variables (e.g., `globals.css` from shadcn), import them into Pencil variables for consistency.

### 3. Create All Placeholder Frames

Create empty frames for every screen in the inventory before designing any of them. This gives spatial awareness of the full project.

**Important:** `.pen` files must exist before MCP can write to them. Ensure the file is created (via Pencil UI or `open_document`) before batch operations.

### 4. Design Screens in Sections

Pencil builds screens in layers — 2-4 `batch_design` calls per screen:

| Pass | What it covers | Example |
|------|---------------|---------|
| 1 | Background, hero/header, primary layout | Welcome: hero image + app branding |
| 2 | Form fields, content areas | Sign In: email + password inputs |
| 3 | CTAs, buttons, actions | Sign In: sign-in button + social login |
| 4 | Secondary elements, links, fixes | Sign In: bottom sign-up link, icon fixes |

Each call needs **full screen context** (what exists) plus **what to add**.

### 5. Build Reusable Components

Mark common elements as `reusable: true` — buttons, input fields, nav bars, cards. Use `ref` instances in subsequent screens. This mirrors how `/build` implements components and keeps the design system consistent.

### 6. Fix Pass

After all screens are designed, do a targeted fix pass:
- Missing or incorrect icons
- Font inconsistencies
- Spacing/alignment issues
- Use `snapshot_layout` to detect positioning problems

### 7. Screenshot Verification

Take `get_screenshot` of every screen. Present to user for approval before proceeding to the prototype step.

## Prompt Patterns

### Effective Prompting

Be specific. Pencil responds to concrete descriptions, not vague directions.

| Bad | Good |
|-----|------|
| "Make it better" | "Increase button padding to 16px and change color to blue" |
| "Add a form" | "Add login form with email, password, remember checkbox, submit button" |
| "Design a screen" | "Design the Sign In screen with email field, password field with toggle, gold Sign In button, Apple/Google social login, and sign-up link" |

### Iterative Refinement

1. **Start broad**: "Create a dashboard layout with sidebar and main content"
2. **Refine**: "Add navigation items to sidebar: Home, Analytics, Settings"
3. **Detail**: "Style nav items with hover states and active indicator"
4. **Polish**: "Adjust spacing to match 8px grid"

### Section-Based Design Calls

Include in every `batch_design` call:

1. **App identity**: product name, type, aesthetic direction
2. **Screen context**: which screen, what's already on it
3. **What to design now**: specific elements for this pass
4. **Platform**: iOS/Android/web, expected chrome
5. **Style direction**: reference the variables set in step 2

## Style Descriptors

Match to the visual personality from Step 11. Include in the first design call per screen:

| Personality | Descriptor |
|-------------|-----------|
| Brutally minimal | "Clean, stark, maximum whitespace, single accent color" |
| Maximalist | "Dense, layered, rich textures, bold typography" |
| Retro-futuristic | "CRT aesthetic, scan lines, neon accents, terminal-inspired" |
| Organic/natural | "Soft curves, earth tones, botanical elements" |
| Luxury/refined | "Serif typography, generous spacing, muted palette, gold accents" |
| Playful/toy-like | "Rounded corners, bright colors, bouncy elements" |
| Editorial/magazine | "Strong typography hierarchy, asymmetric grid, pull quotes" |
| Brutalist/raw | "Exposed grid, monospace, harsh borders" |
| Art deco/geometric | "Geometric patterns, symmetry, metallic accents" |
| Soft/pastel | "Low contrast, rounded shapes, gradient washes" |
| Industrial/utilitarian | "Exposed structure, label-heavy, grid-strict" |

## Design-to-Code Bridge

After Pencil designs are approved, the `.pen` files serve as a source of truth for `/build`:

- **Code generation**: `Cmd/Ctrl + K` → "Generate React component for this screen" — Pencil outputs framework-specific code (React, Next.js, Vue, Svelte) with Tailwind CSS
- **Component libraries**: Specify target: "Use shadcn UI components for this layout"
- **Token export**: Pencil variables can be exported to CSS, keeping design tokens and code in sync
- **Code import**: Existing components can be imported into Pencil for visual refinement

Keep `.pen` files in the repo alongside source code — this lets the agent see both design and code for accurate generation.

## Key Rules

- **Sections, not atoms** — design in meaningful chunks (hero, form, CTA), not individual nodes
- **Full context every call** — always say which screen and what exists
- **Create all frames first** — placeholder frames before design work
- **Set variables first** — design tokens before designing screens
- **Use UI kits** — leverage shadcn UI kit via `get_style_guide` when the project uses shadcn
- **Build reusable components** — `reusable: true` + `ref` instances
- **Use realistic content** — "Enter your email" not "placeholder text"
- **Name nodes clearly** — for iterative ease and code generation
- **Fix pass after all screens** — batch fixes over inline fixes
- **Screenshot to verify** — always verify before presenting to user
- **Specify platform chrome** — "iOS status bar", "floating tab bar", "back chevron"

## Sources

- [Pencil AI Integration](https://docs.pencil.dev/getting-started/ai-integration)
- [.pen Format Specification](https://docs.pencil.dev/for-developers/the-pen-format)
- [Styles and UI Kits](https://docs.pencil.dev/design-and-code/styles-and-ui-kits)
- [Design ↔ Code](https://docs.pencil.dev/design-and-code/design-to-code)
- [Design System skill by TobyScr](https://gist.github.com/TobyScr/cc30eba6541a1e7174076dd2667b96a7)
- [pencil-to-code skill](https://www.skillavatars.com/skills/pencil-to-code)
- [pencil-renderer skill](https://playbooks.com/skills/phrazzld/claude-config/pencil-renderer)
