# Prompt Template — Product Issue

Structure the issue body using this template. Fill every section. Use `- [ ]` checkboxes in v1 scope — these become acceptance criteria for `/backlog`.

**Writing rules:** This prompt is read by an LLM that will design the architecture (`/solution`) and build the product. Be terse. State decisions, not options. Name things. Cut filler. Focus on WHAT and WHO — leave HOW to `/solution`.

---

```markdown
# {Project Name}

## Vision
{One sentence. What it is, who it's for, what problem it solves.}

## Problem
{2-3 sentences max. Current pain, workaround, why now.}

## Target User
{Who. Their context. What they do today instead. Be specific — "junior devs at startups" not "developers".}

## Competitive Landscape
- {Competitor/alternative} — {what it does, where it falls short}
- {Competitor/alternative} — {gap this product fills}

**Differentiation:** {Why users switch. One sentence.}

## Core Capabilities
1. **{Name}** — {what user can DO. Fragment, not sentence.}
2. **{Name}** — {description}
3. **{Name}** — {description}

## User Experience
**Platform:** {web | mobile | CLI | desktop | API}

**Primary flow:**
1. {action}
2. {action}
3. {action}

**Key views:**
| View | Purpose |
|------|---------|
| {Name} | {what user sees, what they do here} |
| {Name} | {purpose} |

**Roles:** {role → permissions, or "single role"}

## Productization
**Type:** {SaaS | open-source tool | internal tool | side project | CLI}
**Audience:** {market segment, company size, technical level, buying process}
**Distribution:** {how users discover and access — app store, direct URL, npm, word of mouth}

**Public presence:**
{If marketing website:}
- **Site:** {landing, pricing, docs, blog, changelog — which pages}
- **Tone:** {developer-focused | enterprise | consumer | technical}
- **Primary CTA:** {sign up | request demo | download | try free}
- **Visual direction:** {inspiration sites, aesthetic preferences}
{If no public website:}
- Internal distribution only — {how users access}

## Data Concepts
{Core entities and their relationships — product-level, not schema.}
- **{Entity}** — {what it represents, key attributes}
- **{Entity}** — {description, relates to {other entity}}

## Integrations Needed
{External services the product requires — what, not how.}
- {Service need} — {why: "payments", "email notifications", "maps"}

## Success Criteria
**North star:** {single metric that proves value}
**KPIs:**
- {metric} — target: {number}
- {metric} — target: {number}

**v1 succeeds when:** {concrete measurable outcome}

## v1 Scope

### In
- [ ] {Feature — specific enough to write a test for}
- [ ] {Feature}
- [ ] {Feature}

### Out (v2+)
- {Feature} — {why deferred}

### Done means
{Deployed where? Tested how? Documented?}

## Constraints
- **Performance:** {response time, concurrent users — expectations, not implementation}
- **Security:** {data sensitivity, compliance requirements}
- **Accessibility:** {WCAG level, i18n, screen readers}
- {Hard constraint — technical, legal, budget, timeline}
- {Known risk — mitigation}

## Monetization
{free | freemium | subscription | usage-based | N/A}
{If applicable: tiers, pricing, free tier limits}

## Roadmap
- **v1:** {what ships now}
- **v2:** {next batch}
- **Future:** {long-term direction}

## Open Questions
- {Unresolved decision that shapes the product}
```
