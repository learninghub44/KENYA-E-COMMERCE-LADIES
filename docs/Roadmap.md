# Project Roadmap

**Status:** Living document — updated as phases complete

## Phase 0 — Foundation (Agent 0)
- Architecture, standards, repository scaffold, CI skeleton
- **Exit criteria:** every agent can clone the repo and start their module with zero
  ambiguity about structure, standards, or ownership.

## Phase 1 — Core Platform
- Database & Infrastructure: base schema (users, sellers, products, orders, messages), RLS
  foundations, migration tooling
- Authentication & Security: Supabase Auth wiring, roles/permissions, session handling
- Design System: tokens, primitives, base component library
- DevOps: CI/CD pipelines, environments (local/preview/staging/production)

## Phase 2 — Seller & Catalog
- Seller Platform: onboarding flow, Didit KYC integration, seller dashboard shell
- Marketplace: product CRUD, categories, inventory, search (Postgres full-text)
- API Integration: Cloudinary adapter, GA adapter

## Phase 3 — Transactions
- Orders: cart, checkout, payment orchestration, fulfillment states, returns
- Messaging: buyer-seller chat, notifications

## Phase 4 — Platform Operations
- Admin Platform: moderation tools, dispute resolution, platform configuration
- Frontend: full storefront composition across all module features
- QA: E2E coverage across critical user journeys
- Performance: caching strategy, Web Vitals budgets, query tuning pass

## Phase 5 — Scale Readiness
- Load testing against target scale (`Scalability.md`)
- Search layer evaluation (stay on Postgres FTS vs. dedicated search engine)
- Partitioning review for high-growth tables
- Multi-currency / multi-language groundwork

## Phase 6 — Expansion (future)
- Native mobile apps (`apps/mobile`) consuming existing API
- Additional payment/shipping provider adapters
- AI-powered features (search ranking, recommendations, fraud detection)
- Multi-country rollout

Sequencing across agents within a phase is coordinated via `docs/Engineering.md` and tracked
in the project board, not in this file — this file tracks phase-level scope only.
