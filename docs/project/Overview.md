# Project Overview

**Status:** Approved
**Owner:** Chris Odhiambo (see [`OWNER.md`](../../OWNER.md))
**Applies to:** Zuri Market

## What is Zuri Market

Zuri Market is a multi-vendor e-commerce marketplace built for Kenyan women to discover
fashion, beauty, wellness, and lifestyle products from verified sellers. It connects three
audiences from a single codebase:

- **Buyers** — browse, search, and purchase from a storefront organized around Fashion,
  Beauty, Wellness, and Lifestyle categories.
- **Sellers** — onboard through KYC verification, list products, manage inventory, and
  fulfill orders from a dedicated seller dashboard.
- **Admins** — moderate listings, resolve disputes, and manage platform configuration from
  an internal admin console.

See the [root README](../../README.md) for the full feature list, tech stack, and screenshots.

## Who this is for

- **Buyers** in Kenya looking for a trusted place to shop fashion, beauty, wellness, and
  lifestyle products from vetted sellers.
- **Sellers** who want a guided onboarding path (including identity verification), a real
  storefront, and tools to manage inventory and orders without needing their own website.
- **Admins/operators** who need moderation, dispute resolution, and platform-wide visibility
  in one console.

## Product pillars

1. **Trust first.** Every seller goes through KYC verification (via Didit) before they can
   list products. Reviews, ratings, and moderation tooling reinforce trust after onboarding.
2. **Kenya-specific by design.** The platform is built around local buyer and seller
   behavior, not adapted from a generic global template.
3. **One codebase, three experiences.** Storefront, seller dashboard, and admin console
   share the same data model, auth system, and design system rather than being separate
   applications bolted together.
4. **Built to scale without a rewrite.** The architecture is deliberately sized for growth
   from day one — see [Architecture Summary](./ArchitectureSummary.md) and
   [Scaling Guide](./ScalingGuide.md).

## Current state

Zuri Market is under active development. The codebase currently lives as a single Next.js
application at the repository root (not yet the `apps/web` + `packages/*` workspace layout
described in [`docs/FolderStructure.md`](../FolderStructure.md), which is the target shape as
the project grows). Build history and scope for each engineering pass are recorded in
[`docs/handoffs/`](../handoffs/), and near/long-term priorities are tracked in
[`ROADMAP.md`](../../ROADMAP.md).

Treat anything not explicitly marked "shipped" in the handoffs or changelog as in-progress
or planned, not live in production.

## How to navigate the documentation

Start with this [project docs index](./README.md) for the eight core guides. For anything
deeper — a specific database table, an RLS policy, a KYC webhook payload — the per-domain
folders under `docs/` (e.g. `docs/database/`, `docs/authentication/`, `docs/kyc/`) are the
authoritative source.

## Ownership and licensing

Zuri Market is a proprietary platform. All rights are held by Chris Odhiambo — see
[`OWNER.md`](../../OWNER.md), [`COPYRIGHT.md`](../../COPYRIGHT.md), and
[`LICENSE`](../../LICENSE) for the full legal framework, and
[`GOVERNANCE.md`](../../GOVERNANCE.md) for how decisions get made.

## Back to the top

Return to the [project README](../../README.md) or the [project docs index](./README.md).
