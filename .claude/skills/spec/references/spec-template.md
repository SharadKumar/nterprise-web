# Spec Template — Epic Issue

Structure each spec issue body using this template. Fill every section. Acceptance criteria must be testable — each one maps to a pass/fail test.

**Writing rules:** This spec is read by /backlog (which decomposes it into work items) and by developers (who implement it). Be precise about contracts. Specify error cases. Name everything.

---

```markdown
# {Domain Name}

**Product:** `.claudius/product.md`
**Solution:** `.claudius/solution.md`

## Scope

**Owns:** {what this spec covers — be explicit}
**Does not own:** {what's covered elsewhere — reference other spec issues}
**Dependencies:** {other specs that must be built first, or built concurrently}

## Overview

{2-3 sentences. What this domain does, why it exists, who interacts with it.}

## Functional Requirements

### {Capability 1}

{Description of what the system does. Inputs → processing → outputs.}

**Endpoint:** `{METHOD} {/path}`
**Auth:** {required | optional | none} — {role restrictions if any}
**Rate limit:** {requests/window if applicable}

**Request:**
```json
{
  "field": "type — description",
  "field": "type — description"
}
```

**Response (success):** `{status code}`
```json
{
  "field": "type — description"
}
```

**Response (errors):**
| Status | Code | When |
|--------|------|------|
| {400} | {VALIDATION_ERROR} | {description} |
| {401} | {UNAUTHORIZED} | {no/invalid auth token} |
| {403} | {FORBIDDEN} | {authenticated but lacks permission} |
| {404} | {NOT_FOUND} | {resource doesn't exist} |
| {409} | {CONFLICT} | {duplicate/conflicting state} |
| {413} | {PAYLOAD_TOO_LARGE} | {exceeds size limit} |
| {429} | {RATE_LIMITED} | {too many requests} |

### {Capability 2}

{Same structure as above for each capability in this domain.}

## Data Model

### {Entity Name}

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | uuid | PK, generated | |
| {field} | {type} | {nullable, unique, FK, default} | {business meaning} |
| created_at | timestamp | not null, default now() | |
| updated_at | timestamp | not null, auto-update | |

**Indexes:**
- `{index_name}` on `({fields})` — {why: frequent query pattern}

**Relations:**
- {belongs_to User via user_id}
- {has_many Items}

### {Entity Name}

{Same structure for each entity in this domain.}

## State Machine

{If entities have lifecycle states:}

```
{Text diagram of state transitions}

  ┌─────────┐    create    ┌───────┐    publish    ┌───────────┐
  │  (none)  │────────────▶│ draft │──────────────▶│ published │
  └─────────┘              └───────┘               └───────────┘
                               │                        │
                               │ delete                 │ archive
                               ▼                        ▼
                          ┌─────────┐             ┌──────────┐
                          │ deleted │             │ archived │
                          └─────────┘             └──────────┘
```

| Transition | Trigger | Side Effects |
|------------|---------|-------------|
| → draft | User creates entity | Record created, `created` event emitted |
| draft → published | User clicks publish | Validation runs, `published` event emitted |
| published → archived | User archives | Removed from listings, `archived` event emitted |
| draft → deleted | User deletes | Soft delete, `deleted` event emitted |

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| {Empty input} | {Return 400 with validation errors listing missing fields} |
| {Duplicate submission} | {Idempotent — return existing resource, don't create duplicate} |
| {Concurrent edit} | {Last-write-wins with updated_at check, return 409 if stale} |
| {External API down} | {Queue for retry, return 202 with status `pending`} |
| {Session expires mid-flow} | {Partial state persisted, resumable on re-auth} |
| {Malformed file upload} | {Fail fast with descriptive error, don't process partial data} |

## Security

**Authorization rules:**
- {action} — {who can do it, under what conditions}
- {action} — {permission rule}

**Data sensitivity:**
- {field/entity} — {classification: public | internal | sensitive | PII}

**Input validation:**
- {field} — {validation rules: max length, format, allowed values}

## Acceptance Criteria

- [ ] {Specific, testable criterion — maps to one test}
- [ ] {Criterion}
- [ ] {Criterion}
- [ ] {Error case criterion}
- [ ] {Edge case criterion}
- [ ] {Security criterion}
- [ ] {Performance criterion if applicable}

## Notes

- {Implementation hints that don't fit elsewhere}
- {References to solution architecture decisions: "Per solution (#2), use..."}
- {Patterns to follow from existing codebase: "Follow pattern in /api/users"}
```
