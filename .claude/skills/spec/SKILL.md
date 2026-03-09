---
name: spec
description: >-
  Detailed specification writing — reads `.claudius/product.md` and
  `.claudius/solution.md` target state files, then decomposes the product into
  domain specifications. Each spec is a GitHub Issue (epic) with full contracts,
  API definitions, data models, edge cases, and testable acceptance criteria.
  Use after /solution to create build-ready specs. Triggers on: "write specs",
  "create specifications", "spec this out", "detail the requirements", "/spec",
  "write the epics", "break into specs".
  This is Stage 3 of the development lifecycle (/product → /solution → /design → /spec → /backlog → /build).
argument-hint: "[--domain auth]"
---

# /spec — Detailed Specifications

Decomposes a product into domain-level specifications. Each spec becomes a GitHub Issue labeled as an epic — a complete contract that defines exactly what needs to be built, with enough detail that implementation requires no clarifying questions.

This is **Stage 3** of the development lifecycle. It reads the output of `/product` (Stage 1), `/solution` (Stage 2), and `/design` (Stage 2.5), and produces input for `/backlog` (Stage 4).

## Usage
```
/spec                     → reads .claudius/product.md and .claudius/solution.md
/spec                      → reads .claudius/product.md and .claudius/solution.md
/spec --domain auth        → spec only the auth domain
/spec #8                   → delta mode — refine existing spec epic #8
```

## Workflow

### 1. Read Upstream Artifacts

Read the target state files first, then optionally fetch issues for additional context:

```bash
# Primary sources — the living target state
Read .claudius/product.md
Read .claudius/solution.md

# Design artifacts (if /design has been run)
Read .claudius/design.md
Read .claudius/design/screens.md
Read .claudius/design/components.md
Glob .claudius/design/flows/*.md
```

Parse and internalize:
- From product: capabilities, user flows, roles, success criteria, v1 scope
- From solution: components, technology stack, API style, data architecture, auth approach, error handling philosophy
- From design: personas, user journeys, screen flows, screen inventory, information architecture, component inventory, design tokens

These are settled decisions. The spec skill doesn't revisit them — it details them.

### 2. Identify Domains

Decompose the product into logical domains. A domain is a cohesive area of functionality that can be specified, built, and tested independently.

Good domain boundaries:
- **Authentication** — signup, login, password reset, session management, OAuth
- **User Management** — profile, settings, account deletion, roles
- **Data Import** — file upload, parsing, validation, mapping, processing
- **Dashboard** — views, widgets, filtering, data aggregation
- **Billing** — plans, checkout, invoicing, usage tracking
- **API** — public API surface, rate limiting, API keys, docs
- **Marketing Site** — landing pages, content, SEO, analytics (if applicable)

Present the proposed domain breakdown to the user via `AskUserQuestion`:
- "I've identified these domains: [list]. Should I add, remove, or reorganize any?"

### 3. Research for Each Domain

Before writing each spec, research to write realistic, current specifications:

| Research Area | Purpose |
|---------------|---------|
| Codebase (Explore, Grep) | Existing patterns, abstractions, naming conventions to align with |
| API conventions | How existing endpoints are structured, error formats, auth middleware |
| Similar open-source projects | How comparable domains are specified — edge cases you might miss |
| Library documentation | Capabilities and constraints of chosen libraries (from `.claudius/solution.md`) |

### 4. Write Each Spec

For each domain, write a detailed specification. Read `references/spec-template.md` for the template.

A specification must cover:

**Scope boundary** — What this spec owns and explicitly what it does not. Draw clear lines so domains don't overlap or leave gaps. "This spec covers user authentication flows. User profile management is covered in the User Management spec."

**Functional requirements** — What the system does in this domain, described as inputs → processing → outputs. Be specific enough that two developers implementing independently would produce compatible results.

Bad: "Users can upload files."
Good: "POST /api/uploads accepts multipart/form-data. Single file field named `file`. Max size: 10MB. Allowed types: csv, xlsx, json. On success: stores file, creates Upload record with status `processing`, returns 201 with `{ id, filename, size, status, created_at }`. On failure: 413 (over limit), 415 (wrong type), 401 (unauthenticated)."

**API contracts** — Every endpoint this domain exposes or consumes:
- Method + path
- Request body/params with types
- Response shape with types
- Status codes (success AND error)
- Auth requirements
- Rate limits if applicable

**Data model** — Tables, fields, types, constraints, indexes, and relationships relevant to this domain. Include migration considerations if extending existing tables.

**State transitions** — If entities have lifecycle states, document:
- Valid states and transitions (diagram if complex)
- What triggers each transition
- Side effects (emails sent, events emitted, records created)

**Edge cases** — Enumerate specific scenarios:
- What happens when input is empty/null/malformed?
- Concurrent access scenarios
- External API failures
- Partial success (some items processed, others failed)
- Timeout and retry behavior
- Session expiry during multi-step flows

**Security** — Authorization rules for this domain:
- Who can access what (by role, by ownership, by relationship)
- Data sensitivity classification
- Input validation rules
- Rate limiting specifics

**Acceptance criteria** — Testable checkboxes that map 1:1 to verifiable tests:

Bad: `- [ ] User can upload files`
Good:
```
- [ ] POST /api/uploads with valid 5MB CSV returns 201 with upload ID
- [ ] POST /api/uploads with 15MB file returns 413
- [ ] POST /api/uploads with .exe file returns 415
- [ ] POST /api/uploads without auth token returns 401
- [ ] Upload record has status `processing` immediately after creation
- [ ] Background job transitions status to `complete` within 30s for files under 1MB
- [ ] Upload list endpoint returns only uploads owned by authenticated user
```

### 5. Cross-Reference Check

After writing all specs, verify:
- **Coverage** — every product capability (from `.claudius/product.md`) is covered by at least one spec
- **No gaps** — no functionality falls between domain boundaries
- **No overlap** — no functionality is specified in two different specs
- **Architecture alignment** — specs are consistent with the solution architecture
- **Dependency clarity** — if spec A depends on spec B (e.g., auth is needed for uploads), the dependency is noted

### 6. Write Drafts & Present for Approval

Before creating any GitHub issues, write every spec to disk as a draft:

```bash
mkdir -p .claudius/specs
# For each domain, write to .claudius/specs/<slug>.md
# e.g. .claudius/specs/auth.md, .claudius/specs/data-layer.md
```

Each draft file contains the full spec body (using the template from `references/spec-template.md`). Writing to disk is **mandatory** — it is the review artifact. Do not skip this step or substitute it with inline output.

Once all drafts are written, present via `AskUserQuestion`:
> "I've written N spec drafts to `.claudius/specs/`. Please review them and reply:
> - **Approve all** — I'll create GitHub issues for every draft
> - **Revise `<domain>`** — describe what to change and I'll update the file
> - **Approve some, hold others** — list which to create now"

Do NOT create any GitHub issues until the user explicitly approves. Options:
- **Approve all** — proceed to issue creation for all specs
- **Revise** — update the draft file, re-present that spec
- **Partial approve** — create issues for approved specs, iterate on the rest

### 7. Create Issues

For each approved spec, create a GitHub Issue labeled as an epic. Use the domain name as the title — no verb prefix, no type prefix, no internal codes:

```bash
gh issue create --repo <owner>/<name> \
  --title "<Domain Name>" \
  --body "<the full specification>" \
  --label "spec,epic"
```

Title rules:
- **Do:** `"Auth & Family Management"`, `"Data Layer"`, `"Assistant Runtime"` — domain name only; the `spec,epic` labels identify it
- **Don't:** `"Spec: Authentication"`, `"Implement Auth"`, `"WI E: Auth"`, `"E1: Auth"` — no prefix codes of any kind. "Implement" is reserved for build-layer work items.

### 8. Report

```
Created N spec issues:
  - #X: Auth & Onboarding
  - #Y: Data Import
  - #Z: Dashboard

Next: `/backlog #X` to decompose each spec into work items.
```

## Delta Mode

When pointed at an existing spec issue:
1. Read the existing specification
2. Compare against the current template and upstream artifacts (`.claudius/product.md` + `.claudius/solution.md`)
3. Identify: missing sections, shallow areas, stale content, missing edge cases
4. Only ask about gaps — don't re-derive what's already well-specified
5. Update the issue body with the refined specification

## Rules

- **No code, no files** beyond GitHub issues — this is specification writing, not implementation
- **Upstream decisions are settled** — product decisions from `/product` and architecture from `/solution` are constraints, not suggestions
- **Every endpoint must have a contract** — request shape, response shape, status codes, auth requirements
- **Every acceptance criterion must be testable** — if you can't write a test for it, rewrite it
- **Edge cases are required** — the most valuable part of a spec is what happens when things go wrong
- **No PlanMode** — output is specification documents, not code
- **Self-contained specs** — each spec can be understood independently (reference other specs by number, don't inline their content)

## Anti-Patterns (Do Not)

- **Don't write user stories** — "As a user, I want to..." is not a spec. Describe system behavior in terms of inputs, outputs, and state changes.
- **Don't leave endpoints vague** — "API for managing uploads" is not a contract. Specify every endpoint with method, path, request/response shapes, and error codes.
- **Don't skip error cases** — the happy path is the easy part. Specs exist to define behavior when things go wrong.
- **Don't assume obvious behavior** — "Obviously the user can't delete someone else's upload" is not obvious to a developer agent. Specify: "DELETE /api/uploads/:id returns 403 if upload.user_id !== authenticated user ID."
- **Don't over-scope epics** — if a spec feels like it needs more than 5-8 work items, split it into smaller domains.
- **Don't duplicate the solution** — don't re-explain architecture decisions. Reference the solution: "Per `.claudius/solution.md`, auth uses JWT with httpOnly cookies."
- **Don't write implementation instructions** — "Use a for loop to iterate over rows" is implementation. "Process rows in batches of 1000" is specification.
- **Don't ignore existing code** — if the codebase has patterns, the spec should reference them: "Follow the existing pattern in /api/users for error responses."

## Success Criteria

1. **Build-ready** — a developer (human or agent) can implement from this spec without asking clarifying questions
2. **Complete contracts** — every API endpoint has full request/response documentation
3. **Edge cases enumerated** — error scenarios, boundary conditions, and failure modes are specified
4. **Testable ACs** — every acceptance criterion maps to a test that passes or fails
5. **Domain independence** — each spec can be built and tested independently (with noted dependencies)
6. **Cross-referenced** — coverage maps back to product capabilities; architecture aligns with solution
7. **Right-sized** — each epic decomposes into 3-8 work items (small enough to plan, large enough to be cohesive)
8. **No ambiguity** — two developers implementing independently would produce compatible results
