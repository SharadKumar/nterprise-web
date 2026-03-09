---
name: test
description: >-
  Test suite generation — creates E2E tests (Playwright), integration tests, and
  test infrastructure beyond the unit tests written during /build. Reads
  .claudius/solution.md for testing strategy and .claudius/design.md for user flows.
  Triggers on: "write E2E tests", "write integration tests", "test coverage",
  "playwright tests", "/test", "test the critical flows".
argument-hint: "[--e2e] [--integration] [--flow <flow-name>]"
---

# /test — Test Suite Generation

Creates test suites beyond the unit tests written during `/build`. E2E tests for critical user flows, integration tests for API routes and database queries, and test infrastructure setup.

## Usage
```
/test --e2e                    → generate E2E tests for critical user flows
/test --integration            → generate integration tests for API routes
/test --flow onboarding        → generate tests for a specific flow
/test                          → assess coverage gaps and generate what's missing
```

## Workflow

### 1. Read Upstream Artifacts

```bash
Read .claudius/solution.md     # testing strategy, tech stack, API design
Read .claudius/design.md       # user flows, screen inventory
Read .claudius/design/flows/   # screen-level flow diagrams
```

Extract: testing strategy (unit/integration/e2e split), test tooling (Vitest, Playwright), API endpoints, critical user flows, database queries.

### 2. Assess Current Coverage

```bash
# Find existing test files
find . -name "*.test.*" -o -name "*.spec.*" | head -50

# Check for Playwright config
ls playwright.config.* 2>/dev/null

# Check for test scripts in package.json
cat package.json | grep -A5 '"scripts"'
```

Identify gaps: which flows have no E2E coverage? Which API routes have no integration tests?

### 3. Setup Test Infrastructure (if needed)

**Playwright** (for E2E):
- Check if Playwright is installed; if not, recommend: `bun add -d @playwright/test`
- Generate `playwright.config.ts` if missing
- Set up test directory: `tests/e2e/`

**Integration test utilities**:
- Database test helpers (setup/teardown)
- API test client factory
- Auth test helpers (create test user, get token)

### 4. Generate E2E Tests (`--e2e`)

For each critical user flow from `design/flows/`:

1. Read the flow diagram (Mermaid flowchart)
2. Map each screen transition to a Playwright action
3. Write the test:
   - Navigate to entry point
   - Perform each user action in the flow
   - Assert each screen transition
   - Verify the exit state

```typescript
// tests/e2e/onboarding.spec.ts
import { test, expect } from "@playwright/test";

test("complete onboarding flow", async ({ page }) => {
  await page.goto("/onboarding");
  // ... actions matching the flow diagram
});
```

**Prioritize flows by criticality:**
1. Auth flows (signup, login, password reset)
2. Core task flows (primary user workflow)
3. Payment flows (if applicable)
4. Onboarding flow

### 5. Generate Integration Tests (`--integration`)

For each API route group from `solution.md`:

1. Read the endpoint spec (method, path, request/response shapes)
2. Write tests for: happy path, validation errors, auth failures, edge cases
3. Include database setup/teardown

```typescript
// tests/integration/api/users.test.ts
import { describe, it, expect } from "vitest";

describe("POST /api/users", () => {
  it("creates a user with valid data", async () => { /* ... */ });
  it("returns 400 for invalid email", async () => { /* ... */ });
  it("returns 401 without auth token", async () => { /* ... */ });
});
```

### 6. Generate CI Configuration

If GitHub Actions is in the stack and no test workflow exists, generate:

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun test

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: npx playwright install --with-deps
      - run: npx playwright test
```

### 7. Report

```
Generated:
- E2E tests: {N} flows covered ({list})
- Integration tests: {N} endpoint groups covered ({list})
- Test infrastructure: {what was set up}
- CI: {workflow created/updated}

Run: bun test && npx playwright test
```

## Rules

- **Read upstream artifacts first** — tests trace to flows and specs, not guesses
- **Don't duplicate unit tests** — `/build` handles unit tests via TDD. This skill covers E2E and integration.
- **Test real behavior** — assert user-visible outcomes, not implementation details
- **No flaky tests** — use proper waits (Playwright auto-wait), avoid sleep, use test isolation
- **No PlanMode** — test generation is procedural
- **Run tests after generating** — verify they pass before declaring done

## Anti-Patterns

- **Don't test implementation details** — test what users see, not internal state
- **Don't write tests without reading flows** — E2E tests must trace to documented user flows
- **Don't skip auth in integration tests** — test both authenticated and unauthenticated paths
- **Don't generate tests that can't run** — if Playwright isn't set up, set it up first
