# Architecture

**Status:** Approved
**Owner:** Chief Software Architect (Agent 0)
**Applies to:** All engineers and all repositories in this project

## 1. Purpose

This document defines the system architecture for the marketplace platform: a multi-vendor
e-commerce marketplace for women's fashion, beauty, lifestyle, accessories, and wellness
products. It is the single source of truth for how the system is structured and how its
parts communicate. Every other standards document (Repository, Coding Standards, API
Standards, Security, Scalability) builds on the decisions made here.

## 2. Design Goals

The architecture must support, without a rewrite:

- 1,000,000+ registered users
- 100,000+ verified sellers
- 20,000,000+ product listings
- Millions of monthly orders
- Millions of buyer-seller messages
- Multi-country / multi-currency / multi-language expansion
- Native mobile apps consuming the same backend
- Third-party API integrations (payments, shipping, analytics)
- Future AI-powered features (search ranking, fraud detection, recommendations)
- Extraction of any module into an independent service without touching unrelated modules

Trade-offs default to **simplicity now, extractability later**. We build a well-structured
modular monolith first, not a distributed system, because premature microservices would slow
down the first 12 engineers without a scaling need to justify it yet.

## 3. High-Level System Shape

```
                        ┌─────────────────────────┐
                        │        Cloudflare         │
                        │  CDN / DNS / WAF / Cache  │
                        └────────────┬─────────────┘
                                     │
                        ┌────────────▼─────────────┐
                        │     Next.js Application    │
                        │  (App Router, RSC, Edge)   │
                        └────────────┬─────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
   ┌──────────▼─────────┐ ┌──────────▼─────────┐ ┌──────────▼─────────┐
   │   Supabase Auth      │ │  Supabase Postgres   │ │ Supabase Edge Fns  │
   │  (JWT, sessions)     │ │  (RLS enforced)      │ │ (server-side logic)│
   └───────────────────────┘ └───────────────────────┘ └──────────┬──────────┘
                                                                      │
                             ┌────────────────────────────────────────┼────────────┐
                             │                                        │            │
                   ┌─────────▼─────────┐                  ┌───────────▼───┐ ┌──────▼──────┐
                   │     Cloudinary      │                  │   Didit KYC    │ │ Google       │
                   │  (image pipeline)   │                  │ (seller verify)│ │ Analytics    │
                   └─────────────────────┘                  └────────────────┘ └─────────────┘
```

- **Cloudflare** terminates traffic, serves static assets and images from edge cache, and
  provides WAF/DDoS protection in front of everything.
- **Next.js** is the only application layer. It renders the storefront, seller dashboard,
  admin dashboard, and exposes the platform's HTTP API via route handlers.
- **Supabase Postgres** is the single system of record. Row Level Security (RLS) is the
  primary authorization boundary, not application code.
- **Supabase Edge Functions** hold logic that must not run in the browser or that needs to
  run close to the database (webhooks, KYC callbacks, payment callbacks, scheduled jobs).
- **Cloudinary**, **Didit**, and **Google Analytics** are integrated as swappable providers
  behind internal interfaces (see §7 Dependency Rules), never called directly from feature
  code.

## 4. Logical Modules

The system is organized into bounded modules. Each module maps to one engineer's ownership
(see `Engineering.md`). Modules communicate only through defined interfaces (typed functions,
API routes, or Postgres views) — never by importing another module's internals.

| Module | Owner | Responsibility |
|---|---|---|
| `auth` | Authentication & Security Engineer | Identity, sessions, roles, permissions |
| `sellers` | Seller Platform Engineer | Seller onboarding, KYC, storefronts, seller settings |
| `catalog` | Marketplace Engineer | Products, categories, search, pricing, inventory |
| `orders` | Orders Engineer | Cart, checkout, payments, fulfillment, returns |
| `messaging` | Messaging Engineer | Buyer-seller chat, notifications |
| `admin` | Admin Platform Engineer | Moderation, disputes, platform configuration |
| `design-system` | Design System Engineer | Shared UI primitives, tokens, theming |
| `web` | Frontend Engineer | Page composition, routing, client state |
| `integrations` | API Integration Engineer | Cloudinary, Didit, GA, future payment/shipping providers |
| `quality` | QA Engineer | Test strategy, test infrastructure, coverage gates |
| `performance` | Performance Engineer | Caching, query performance, Core Web Vitals |
| `platform-ops` | DevOps Engineer | CI/CD, environments, infrastructure as config |

A module owns its own database tables, its own API routes, and its own feature folder. No
module may query another module's tables directly — it goes through a published interface
(a typed query function or a Postgres view maintained by the owning module).

## 5. Data Architecture

- Single Postgres database (Supabase), one schema per environment (`public` in prod, mirrored
  in staging/preview databases).
- RLS is enabled on every table with user-facing data from day one. No table ships without
  an explicit policy — "no policy" must never mean "open."
- Multi-tenancy (sellers, future multi-country) is row-scoped, not schema-per-tenant, to keep
  operations simple at this scale. Partitioning is deferred until a specific table's size
  requires it (see `Scalability.md`).
- Migrations are the only way schema changes reach the database. No manual changes in the
  Supabase dashboard for anything beyond local prototyping.

## 6. API Architecture

- One HTTP API, exposed via Next.js route handlers under `/app/api/*`, documented in
  `APIStandards.md`.
- Internal module-to-module calls within a server request use typed function calls, not
  internal HTTP round-trips.
- External consumers (future mobile apps, partners) use the same versioned REST API — there
  is no separate "mobile API."
- Edge Functions are used only for: third-party webhooks, scheduled/cron jobs, and logic that
  must run outside the Next.js request lifecycle.

## 7. Dependency Rules

- Feature code never imports a third-party SDK directly. It imports an interface from
  `packages/integrations` (e.g. `ImageProvider`, `KycProvider`, `AnalyticsProvider`). Swapping
  Cloudinary or Didit later means changing one adapter, not every call site.
- `apps/web` may depend on `packages/*`. No `packages/*` module may depend on `apps/web`.
- Modules may depend on `packages/design-system`, `packages/types`, and `packages/lib`
  (shared utilities), but not on each other's feature folders.
- Circular dependencies between modules are a build failure, not a code review comment.

## 8. Environments

| Environment | Purpose | Database | Deploy trigger |
|---|---|---|---|
| `local` | Development | Local Supabase or dev project | manual |
| `preview` | Per-PR review | Ephemeral Supabase branch | every PR |
| `staging` | Pre-production validation | Staging Supabase project | merge to `develop` |
| `production` | Live traffic | Production Supabase project | merge to `main` |

## 9. Non-Goals (for now)

- No microservices split — revisit only when a specific module's load or team size demands it.
- No multi-region active-active database — Cloudflare handles edge caching; Postgres stays
  single-region until latency data justifies otherwise.
- No custom auth system — Supabase Auth is the identity provider.
- No GraphQL layer — REST is sufficient for current API consumers.

## 10. Change Control

Any deviation from this document requires an Architecture Decision Record (see
`docs/adr/`) reviewed and approved by the Chief Software Architect before implementation.
