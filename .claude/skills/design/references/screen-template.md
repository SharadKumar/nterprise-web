# Screen Inventory Template

Structure `.claudius/design/screens.md` using this template. Group screens by surface. Every screen from the flow diagrams must appear here.

---

```markdown
# Screen Inventory

## Summary

| Surface | Total Screens | Shared | Surface-Specific |
|---------|--------------|--------|------------------|
| {Web} | {N} | {N} | {N} |
| {Mobile} | {N} | {N} | {N} |

---

## {Surface Name}

### {Screen Name}

**Purpose:** {what the user accomplishes on this screen — one sentence}
**Route/Path:** {URL path or navigation route, e.g., `/dashboard`, `/settings/profile`}
**Layout:** {which layout component from component inventory, e.g., `DashboardLayout`}
**Appears in flow(s):** {link to flow file(s), e.g., `flows/onboarding.md`, `flows/core-task.md`}
**Persona(s):** {which persona(s) use this screen}

**Data displayed:**
- {data item 1 — e.g., "List of active projects with name, status, last updated"}
- {data item 2}

**User actions:**
- {action 1 — e.g., "Create new project (→ New Project modal)"}
- {action 2 — e.g., "Filter by status (dropdown)"}
- {action 3 — e.g., "Navigate to project detail (→ Project Detail screen)"}

**Components used:**
- {ComponentName} — {how it's used on this screen}
- {ComponentName} — {variant/configuration}

**Responsive behavior:** {how this screen adapts across breakpoints — what changes at tablet, what changes at mobile}

**Prototype route:** `design/prototype/app/{screen-slug}`

---

## Shared Screens

Screens that appear across multiple surfaces with the same core purpose.

### {Screen Name}

**Surfaces:** {list of surfaces where this screen appears}
**Shared elements:** {what stays the same across surfaces}
**Surface-specific differences:** {what changes per surface — layout, navigation, component variants}
```
