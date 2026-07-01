# Coding Standards

**Status:** Approved
**Applies to:** All engineers

## 1. TypeScript

- Strict mode is on (`strict: true`) in every `tsconfig.json`. No exceptions.
- `any` is banned. Use `unknown` and narrow, or a proper generic/type.
- No non-null assertions (`!`) except in test files or where a preceding runtime check makes
  it provably safe — comment why.
- Every exported function has an explicit return type. Inference is fine for internal/local
  variables.
- Prefer `type` for data shapes, `interface` only when declaration merging is actually needed.
- Database types are generated from Supabase (`supabase gen types typescript`) into
  `packages/types` — never hand-written and never duplicated per feature.

## 2. Structure and Style

- SOLID principles apply to modules, not just classes: single responsibility per file, small
  focused functions, dependencies injected/passed rather than reached for globally.
- No duplicate logic — if the same logic appears in two features, it belongs in
  `packages/lib` or `packages/integrations`, exposed through one function.
- No hardcoded values: URLs, limits, feature flags, and magic numbers are named constants or
  environment variables, never inline literals in business logic.
- Functions should do one thing. If a function needs a comment to explain its sections, it
  should be multiple functions.
- Prefer composition over inheritance. Class hierarchies are avoided; use functions and
  composed hooks/components instead.

## 3. React / Next.js

- Server Components by default. `"use client"` only where interactivity is actually required.
- Data fetching happens in Server Components or route handlers, not in `useEffect` fetches.
- TanStack Query is used for all client-side server-state (mutations, cache invalidation) —
  no ad hoc `useState` + `fetch` for server data.
- Co-locate loading and error states with the route segment (`loading.tsx`, `error.tsx`).

## 4. Formatting and Linting

- ESLint + Prettier configs live in `packages/config` and are extended, not overridden, by
  each app.
- CI fails the build on lint errors or formatting drift. No warnings are silently ignored.
- Import order is enforced by lint rule: external packages, then `packages/*`, then local
  feature imports.

## 5. Error Handling

- No silent `catch {}` blocks. Errors are logged with context or explicitly rethrown.
- User-facing errors are mapped to friendly messages; raw error objects/stack traces never
  reach the client.
- Every API route handler has a defined error response shape (see `APIStandards.md`).

## 6. Documentation in Code

- Every exported function/component has a doc comment describing purpose, parameters, and
  return value when the name and types alone aren't self-evident.
- Non-obvious business rules get an inline comment explaining *why*, not *what*.
- Breaking changes to a feature's public `index.ts` exports require a note in that feature's
  changelog section of its README (if present) and a mention in the PR description.

## 7. Security-Relevant Code Rules

- Never trust client input — validate on the server (route handler / Edge Function), even if
  the client also validates.
- Never bypass RLS with the service role key from code paths reachable by user input.
- Secrets are read from environment variables only, never committed, never logged.
