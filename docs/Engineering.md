# Engineering

**Status:** Approved
**Owner:** Chief Software Architect (Agent 0)

## 1. Purpose

Defines who owns what, how the 13 engineering agents work together, and how work moves from
idea to production without collisions.

## 2. Roles and Boundaries

| # | Agent | Owns | Does Not Touch |
|---|---|---|---|
| 0 | Chief Software Architect | Standards, structure, ADRs | Feature code |
| 1 | Database & Infrastructure Engineer | Schema, migrations, RLS policies, indexes | UI, business rules in the client |
| 2 | Authentication & Security Engineer | Supabase Auth config, session handling, roles/permissions, security headers | Product features unrelated to identity |
| 3 | Seller Platform Engineer | Seller onboarding, KYC flow (via Didit adapter), seller dashboard, storefronts | Buyer-facing catalog browsing UI |
| 4 | Marketplace Engineer | Product catalog, categories, search, pricing, inventory | Checkout, payments |
| 5 | Orders Engineer | Cart, checkout, payment orchestration, fulfillment, returns | Product data model |
| 6 | Messaging Engineer | Buyer-seller chat, notifications | Order state machine |
| 7 | Admin Platform Engineer | Moderation tools, disputes, platform configuration | Seller-facing dashboard |
| 8 | Design System Engineer | Tokens, primitives, shared components, theming | Page-level composition |
| 9 | Frontend Engineer | Route composition, page-level state, layout | Design primitives, backend logic |
| 10 | API Integration Engineer | Cloudinary, Didit, GA adapters; future payment/shipping adapters | Feature business logic |
| 11 | QA Engineer | Test strategy, test infra, coverage gates, E2E suites | Feature implementation |
| 12 | Performance Engineer | Caching strategy, query tuning, Web Vitals budgets | New features |
| 13 | DevOps Engineer | CI/CD, environments, secrets, deploy pipelines | Application code |

Ownership is enforced by CODEOWNERS (see `Repository.md`). A PR touching another agent's
folder requires that agent's review, or must not happen — raise a shared-interface change
instead of reaching into someone else's module.

## 3. How Work Flows

1. Work starts from an approved architecture/standard (this doc set) or an approved feature
   spec.
2. Engineer creates a branch per `BranchingStrategy.md`.
3. Engineer implements inside their own module folder only.
4. Cross-module needs are requested as an interface change via an issue tagged
   `interface-request`, addressed to the owning agent.
5. PR opened against `develop`, using the PR template, meeting `DefinitionOfDone.md`.
6. Review against `ReviewChecklist.md`.
7. CI must pass (lint, typecheck, unit tests, build) before merge.
8. `develop` deploys to staging automatically. `main` deploys to production and is only
   updated via a release PR from `develop`.

## 4. Coordination Rules

- No engineer starts work without pulling the latest `main`/`develop` and reading this
  document set first.
- No engineer edits another engineer's `docs/*.md` file without Agent 0's sign-off.
- No engineer merges a schema change without the Database & Infrastructure Engineer's review.
- No engineer merges an auth/permissions change without the Authentication & Security
  Engineer's review.
- Breaking API changes require an ADR and a version bump (see `APIStandards.md`).

## 5. Communication Artifacts

- **ADRs** (`docs/adr/`) — record any decision that changes architecture, adds a dependency,
  or reverses a prior decision.
- **Interface requests** — GitHub issues, used when one module needs another module to expose
  new data or behavior.
- **Roadmap** (`docs/Roadmap.md`) — sequencing across all 13 agents.
