# Coding Rules (Quick Reference)

**Status:** Approved

A condensed, always-enforced checklist. Full rationale lives in `CodingStandards.md` and
`Security.md`; this is the fast lookup during implementation.

## Always
- TypeScript strict mode
- Explicit return types on exported functions
- RLS policy on every new table before merge
- Server-side validation on every input (Zod schema)
- Pagination on every list endpoint
- Index every column used in `WHERE` / `ORDER BY`
- Third-party calls through `packages/integrations` adapters
- Tests alongside new logic
- Conventional Commit messages

## Never
- `any`
- Non-null assertion (`!`) without a preceding guard
- Direct import of another module's internal (non-`index.ts`) files
- Hardcoded secrets, URLs, or magic numbers in business logic
- Service-role key used in a user-request code path
- Silent `catch {}`
- Manual schema edits outside a migration file
- Committing `.env`, credentials, or generated build output
- Floats for money — use integer minor units + explicit currency
- New microservice/service split without an ADR
