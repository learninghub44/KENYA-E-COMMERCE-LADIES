# Folder Structure

**Status:** Approved
**Applies to:** `apps/web`

## 1. Principle

Feature-based structure. Code is grouped by what it does (a module/domain), not by technical
type (not one giant `components/` folder for the whole app). Each feature folder is close to
self-contained and maps 1:1 to an owning agent from `Engineering.md`.

## 2. Structure

```
apps/web/
├── app/                          # Next.js App Router — routes only, thin
│   ├── (storefront)/
│   ├── (seller)/
│   ├── (admin)/
│   ├── api/                      # Route handlers = the public API (see APIStandards.md)
│   └── layout.tsx
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── types.ts
│   │   └── index.ts               # Public exports — the only thing other features may import
│   ├── sellers/
│   ├── catalog/
│   ├── orders/
│   ├── messaging/
│   └── admin/
├── components/                    # Truly app-wide, feature-agnostic components only
├── hooks/                         # Truly app-wide hooks only
├── lib/                           # App-wide framework glue (supabase client, query client)
├── styles/
└── middleware.ts
```

## 3. Rules

- A feature folder exports its public surface through `index.ts`. Other features (and `app/`)
  import only from that barrel file — never from a feature's internal path
  (`features/orders/components/CheckoutForm` is off-limits outside `features/orders`).
- `app/` route files stay thin: they compose feature components and call feature functions.
  Business logic does not live in `app/`.
- Anything shared across 3+ features graduates to `packages/lib`, `packages/types`, or
  `packages/design-system` — not to `apps/web/components`.
- Tests live next to the code they test: `Component.tsx` + `Component.test.tsx`. E2E tests
  live in `tests/e2e`, owned by QA.
- File naming: `PascalCase` for components, `camelCase` for functions/hooks/utilities,
  `kebab-case` for route segments (Next.js requirement), `SCREAMING_SNAKE_CASE` for constants.
