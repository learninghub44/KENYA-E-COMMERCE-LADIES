# Repository Standards

**Status:** Approved
**Applies to:** Zuri Market
**Full detail:** [`docs/Repository.md`](../Repository.md)

## Repository model

Single repository for the web application, Supabase migrations/functions, and
documentation, managed with pnpm workspaces. The target long-term shape is a full pnpm +
Turborepo monorepo (`apps/web`, `packages/*`) described in
[`docs/Repository.md`](../Repository.md) and [`docs/FolderStructure.md`](../FolderStructure.md);
future mobile apps would live under `apps/mobile` in the same repository. See [Architecture
Summary](./ArchitectureSummary.md) for why that target shape was chosen.

## Current top-level layout

```
KENYA-E-COMMERCE-LADIES/
├── app/                    # Next.js App Router — routes only
├── features/               # Feature/domain modules (business logic, one folder per domain)
├── lib/                     # Framework glue, module logic, and integrations per domain
├── components/              # ui/, shared/, layout/, dashboard/
├── hooks/                   # App-wide hooks
├── middleware/               # Route guards (e.g. auth-guard.ts)
├── security/                 # Security headers config
├── database/                 # Database docs and utilities
├── supabase/                 # migrations/, policies/, functions/, seed/, tests/
├── scripts/                  # Operational scripts
├── branding/                 # Brand assets & guidelines
├── docs/                     # Architecture, standards, and per-module documentation
└── types/                    # Shared TypeScript types
```

The full annotated layout, including what lives inside each folder, is in the [root
README's Folder Structure section](../../README.md#folder-structure). This is the
**current, as-built** structure — see [Architecture Summary](./ArchitectureSummary.md) for
how it differs from the target `apps/web`/`packages/*` layout.

## Repository rules

- `main` is always production-deployable; direct pushes are disabled.
- `develop` is the integration branch; direct pushes are disabled, PRs only.
- Every PR requires passing CI, at least one owning-domain approval, and no unresolved
  conversations.
- Commit messages follow [Conventional Commits](../BranchingStrategy.md#3-commit-messages--conventional-commits).
- No secrets, credentials, or `.env` files are ever committed —
  [`.env.example`](../../.env.example) documents required variables with placeholder values
  only.
- Generated files (build output, `node_modules`, coverage reports) are never committed.
- Large binary assets do not belong in the repo — they go through Cloudinary or object
  storage; the repo stores references, not files.

Full detail: [`docs/Repository.md`](../Repository.md) §4.

## Required root files

- [`README.md`](../../README.md) — project overview, setup instructions, documentation index.
- [`.env.example`](../../.env.example) — every environment variable, documented, no real values.
- [`CONTRIBUTING.md`](../../CONTRIBUTING.md) — points to [`docs/Contributing.md`](../Contributing.md).
- [`LICENSE`](../../LICENSE)
- [`.github/CODEOWNERS`](../../.github/CODEOWNERS)

## Governance and legal framework

Zuri Market is a proprietary platform. Decision-making authority, roles, and how changes get
made are defined in [`GOVERNANCE.md`](../../GOVERNANCE.md). Ownership of the codebase, brand,
and IP is defined in [`OWNER.md`](../../OWNER.md), [`COPYRIGHT.md`](../../COPYRIGHT.md), and
[`TRADEMARK.md`](../../TRADEMARK.md). Terms for using the platform are in
[`TERMS_OF_USE.md`](../../TERMS_OF_USE.md), and community conduct expectations are in
[`CODE_OF_CONDUCT.md`](../../CODE_OF_CONDUCT.md).

## CODEOWNERS

[`.github/CODEOWNERS`](../../.github/CODEOWNERS) routes review requirements by folder. Keep
it in sync with actual ownership as the team changes — a CODEOWNERS entry pointing at
someone no longer responsible for that area silently breaks the review-routing guarantee.

## GitHub metadata

Issue and PR templates, the discussion template, and CODEOWNERS live under
[`.github/`](../../.github/) — see [`docs/handoffs/agent-15c.md`](../handoffs/agent-15c.md)
for what was set up and why. Note the flagged follow-up there: GitHub's native Discussions
feature expects category-specific templates inside a `.github/DISCUSSION_TEMPLATE/`
**directory**, not the single top-level file currently present — convert it if Discussions
is enabled and native template rendering is wanted.

## Back to the top

Return to the [project README](../../README.md) or the [project docs index](./README.md).
