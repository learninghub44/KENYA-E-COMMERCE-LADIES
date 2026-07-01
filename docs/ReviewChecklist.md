# Code Review Checklist

**Status:** Approved

Reviewers check every item before approving. If an item doesn't apply, say why in the review
rather than skipping silently.

## Correctness
- [ ] Code does what the PR description says it does
- [ ] Edge cases considered (empty states, zero, max values, concurrent requests)
- [ ] No obvious logic errors, off-by-one, or unhandled null/undefined

## Architecture & Boundaries
- [ ] Change stays within the owning module's folder (`Engineering.md`)
- [ ] No direct import of another module's internals — only its `index.ts` public exports
- [ ] No new dependency added without checking `Architecture.md` §7 dependency rules
- [ ] Third-party SDK calls go through `packages/integrations`, not called directly

## Security
- [ ] New/changed tables have RLS policies, not left open
- [ ] User input validated server-side
- [ ] No secrets, credentials, or PII in code, logs, or commit history
- [ ] Auth/permission checks present on new routes

## Code Quality
- [ ] TypeScript strict mode passes, no `any`
- [ ] No duplicated logic that already exists elsewhere
- [ ] No hardcoded values that should be constants/env vars
- [ ] Functions are focused and named clearly

## Data
- [ ] Migration is reversible or a rollback plan is documented
- [ ] New columns used in filters/sorts are indexed
- [ ] List endpoints are paginated

## Tests
- [ ] New logic has unit tests
- [ ] Bug fixes include a regression test
- [ ] E2E updated if user-facing flow changed

## Docs
- [ ] Public API/exported function behavior documented
- [ ] Breaking changes called out in the PR description
- [ ] ADR added if this changes an architectural decision

## Performance
- [ ] No N+1 queries introduced
- [ ] No blocking work added to the hot request path that belongs in a background job
