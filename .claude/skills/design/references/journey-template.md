# User Journey Template

Structure each journey file in `.claudius/design/journeys/<persona>-<workflow>.md` using this template. Include both the Mermaid diagram and the detailed stage breakdown.

---

```markdown
# {Persona Name} — {Workflow Name} Journey

## Journey Diagram

```mermaid
journey
    title {Persona} — {Workflow}
    section Awareness
      {action}: {satisfaction 1-5}: {persona}
    section Onboarding
      {action}: {satisfaction}: {persona}
    section First Value
      {action}: {satisfaction}: {persona}
    section Regular Use
      {action}: {satisfaction}: {persona}
    section Advanced Use
      {action}: {satisfaction}: {persona}
`` `

## Stages

### Awareness
**What happens:** {How the user discovers the product — marketing site, word of mouth, search, etc.}

| Aspect | Detail |
|--------|--------|
| User actions | {what they do — e.g., "Reads landing page, watches demo video"} |
| Thoughts | {what they're thinking — e.g., "Does this actually solve my problem?"} |
| Emotions | {how they feel — e.g., "Skeptical but intrigued"} |
| Touchpoints | {which surfaces — e.g., "Marketing site (web)"} |
| Friction | {what could go wrong — e.g., "Unclear pricing, no free trial visible"} |

### Onboarding
**What happens:** {First interaction with the actual product — signup, setup, configuration}

| Aspect | Detail |
|--------|--------|
| User actions | {signup flow steps, initial setup} |
| Thoughts | {first impressions, learning curve concerns} |
| Emotions | {excitement, confusion, impatience} |
| Touchpoints | {surfaces used during onboarding} |
| Friction | {too many steps, unclear guidance, missing context} |

### First Value
**What happens:** {The moment the product delivers its core promise for the first time}

| Aspect | Detail |
|--------|--------|
| User actions | {completing the primary workflow for the first time} |
| Thoughts | {realizing the value, comparing to old way} |
| Emotions | {satisfaction, relief, surprise} |
| Touchpoints | {surfaces where first value is experienced} |
| Friction | {edge cases, missing features, confusing UI} |

### Regular Use
**What happens:** {Habitual use — the user has adopted the product into their routine}

| Aspect | Detail |
|--------|--------|
| User actions | {daily/weekly routine tasks} |
| Thoughts | {efficiency, feature requests, workflow optimization} |
| Emotions | {confidence, occasional frustration, loyalty} |
| Touchpoints | {primary surfaces for daily use} |
| Friction | {repetitive tasks, missing shortcuts, performance} |

### Advanced Use
**What happens:** {Power-user behavior — the user pushes boundaries and explores depth}

| Aspect | Detail |
|--------|--------|
| User actions | {advanced features, integrations, customization} |
| Thoughts | {pushing limits, evaluating for team/org adoption} |
| Emotions | {mastery, investment, advocacy or frustration} |
| Touchpoints | {all surfaces, including admin/settings} |
| Friction | {missing advanced features, scaling limits, complexity} |

## Cross-Surface Touchpoints

{If the journey spans multiple surfaces, describe the handoff points:}
- {Discovery on web → signup on web → daily use on mobile}
- {Quick check on mobile → deep work on desktop}
```
