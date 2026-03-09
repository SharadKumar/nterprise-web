# Workflow

## Branch Convention
Every change = branch + PR. Never commit to main.

| Type | Pattern |
|------|---------|
| Feature | `feat/N-slug` |
| Bug fix | `fix/N-slug` |
| Chore | `chore/N-slug` |

## Commits
Format: `<type>(<scope>): <description> (#N)`

Types: `feat`, `fix`, `docs`, `test`, `chore`

## PR Format
```markdown
## Summary
What was done (1-3 bullets).

## Closes
Closes #N

## Test Plan
- [ ] Specific test scenarios
```

## Session Boundary
One session = one PR. Create PR when:
- Task complete
- Context polluted
- Switching work
- End of day

## Merge
Squash merge. Delete branch after merge.

## Issues Before Code
Every change traces to an issue. Use `/backlog` to create issues, `/build` to implement them.
