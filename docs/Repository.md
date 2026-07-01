# Repository Standards

**Status:** Approved

## 1. Repository Model

Single monorepo, managed with pnpm workspaces + Turborepo. One repository for the web app,
shared packages, Supabase migrations/functions, and documentation. Mobile apps (future) live
in this same monorepo under `apps/mobile` once started, consuming `packages/*` for shared
types and logic.

## 2. Top-Level Layout

```
.
├── apps/
│   └── web/                     # Next.js application (owned by Frontend Engineer + module owners)
├── packages/
│   ├── design-system/           # Design System Engineer
│   ├── types/                   # Shared TypeScript types generated from DB + API
│   ├── lib/                     # Shared framework-agnostic utilities
│   ├── integrations/            # API Integration Engineer (Cloudinary, Didit, GA adapters)
│   └── config/                  # Shared eslint/tsconfig/tailwind config
├── supabase/
│   ├── migrations/              # Database & Infrastructure Engineer
│   ├── functions/               # Edge Functions
│   └── seed.sql
├── docs/                        # Chief Software Architect + each agent's domain docs
│   └── adr/
├── tests/
│   └── e2e/                     # QA Engineer
├── scripts/                     # DevOps Engineer
├── .github/
│   ├── workflows/                # DevOps Engineer (CI/CD)
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

Full app-level structure is defined in `FolderStructure.md`.

## 3. CODEOWNERS

`.github/CODEOWNERS` maps each top-level folder in `apps/web/features/*` and `packages/*` to
its owning agent's GitHub team/handle, so GitHub requires the right review automatically.
Agent 0 owns `docs/*` and root-level config files.

## 4. Repository Rules

- `main` is always production-deployable. Direct pushes to `main` are disabled.
- `develop` is the integration branch. Direct pushes are disabled; PRs only.
- Every PR requires: passing CI, at least one owning-domain approval, no unresolved
  conversations.
- Commit messages follow Conventional Commits (see `BranchingStrategy.md`).
- No secrets, credentials, or `.env` files are ever committed. `.env.example` documents
  required variables with placeholder values only.
- Generated files (build output, `node_modules`, coverage reports) are never committed.
- Large binary assets do not belong in the repo — they go through Cloudinary or object
  storage; the repo stores references, not files.

## 5. Required Root Files

- `README.md` — project overview, setup instructions, links into `docs/`.
- `.env.example` — every environment variable, documented, no real values.
- `CONTRIBUTING.md` — points to `docs/Contributing.md`.
- `LICENSE`
- `CODEOWNERS`
