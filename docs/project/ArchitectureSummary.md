# Architecture Summary

**Status:** Approved
**Applies to:** Zuri Market
**Full detail:** [`docs/Architecture.md`](../Architecture.md)

## System shape, in one paragraph

Cloudflare sits in front of everything (CDN, DNS, WAF, cache). A single Next.js application
(App Router, React Server Components) is the only application layer — it renders the
storefront, seller dashboard, and admin console, and exposes the platform's HTTP API via
route handlers. Supabase is the sole data and identity layer: Postgres with Row Level
Security as the primary authorization boundary, Supabase Auth for identity, and Supabase
Edge Functions for logic that must run server-side (webhooks, scheduled jobs). Cloudinary
handles the media pipeline and Didit handles seller KYC, both wired in as swappable
provider adapters rather than called directly from feature code.

```
Internet Users → Cloudflare (CDN / WAF) → Next.js Application → Supabase (Postgres + RLS + Auth + Edge Functions)
                                                                → Cloudinary (media)
                                                                → Didit (seller KYC)
```

## Why a modular monolith, not microservices

The design goal is to support 1M+ users, 100K+ sellers, and 20M+ listings **without a
rewrite** — but the near-term trade-off favors simplicity: a well-structured modular
monolith first, not a distributed system, because premature microservices slow down a small
team without a scaling need to justify the complexity. Modules are dependency-isolated
today specifically so that any one of them (`orders`, `messaging`, `catalog`, etc.) can be
extracted into an independent service later without touching the others. See
[`docs/Architecture.md`](../Architecture.md) §2 and §9 for the full reasoning.

## Logical modules

The system is organized into bounded modules — `auth`, `sellers`, `catalog`, `orders`,
`messaging`, `admin`, `design-system`, `web`, `integrations`, `quality`, `performance`, and
`platform-ops`. Each module owns its own database tables, API routes, and feature folder;
modules talk to each other only through published interfaces (typed functions, API routes,
or Postgres views), never by reaching into another module's internals. See
[`docs/Architecture.md`](../Architecture.md) §4 for the full ownership table and
[`docs/Engineering.md`](../Engineering.md) for who owns what.

## Data, API, and dependency rules

- **Data:** one Postgres database (Supabase), RLS enabled on every user-facing table from
  the migration that creates it, row-scoped multi-tenancy, migrations as the only path to
  schema change.
- **API:** one HTTP API exposed via Next.js route handlers under `/app/api/*` (documented in
  [`docs/APIStandards.md`](../APIStandards.md)); Edge Functions are reserved for webhooks,
  cron jobs, and logic that must run outside the request lifecycle.
- **Dependencies:** feature code never imports a third-party SDK directly — it goes through
  an interface (e.g. `ImageProvider`, `KycProvider`) so swapping Cloudinary or Didit later
  means changing one adapter, not every call site. Circular dependencies between modules are
  a build failure.

Full detail: [`docs/Architecture.md`](../Architecture.md) §5–§7.

## Environments

| Environment | Purpose | Deploy trigger |
| --- | --- | --- |
| `local` | Development | manual |
| `preview` | Per-PR review | every PR |
| `staging` | Pre-production validation | merge to `develop` |
| `production` | Live traffic | merge to `main` |

## Current vs. target folder layout

The codebase currently lives at the repository root as a single Next.js application
(`app/`, `features/`, `lib/`, `components/`, etc.) rather than the target `apps/web` +
`packages/*` workspace structure described in
[`docs/FolderStructure.md`](../FolderStructure.md) and
[`docs/Repository.md`](../Repository.md). That target layout is the intended shape as the
project and team grow — it is not yet the current state. See [Repository
Standards](./RepositoryStandards.md) for the as-built layout.

## Non-goals (for now)

No microservices split, no multi-region active-active database, no custom auth system, no
GraphQL layer. Revisit each only when load, latency, or a concrete requirement demands it —
see [`docs/Architecture.md`](../Architecture.md) §9.

## Changing this architecture

Any deviation from the approved architecture requires an Architecture Decision Record — see
[`docs/adr/`](../adr/) — reviewed and approved before implementation.

## Back to the top

Return to the [project README](../../README.md) or the [project docs index](./README.md).
