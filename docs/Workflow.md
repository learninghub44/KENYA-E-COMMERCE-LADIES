# Engineering Workflow

**Status:** Approved

## 1. Before Starting Any Work

1. `git pull` on `develop`.
2. Read `docs/Architecture.md`, `docs/Engineering.md`, and this document if it's been more
   than a few days since last touching the repo — standards evolve.
3. Confirm which module you're working in and that it's yours per `Engineering.md`.
4. Check `docs/adr/` for any decision that affects your area.

## 2. Daily Loop

1. Branch from `develop` (see `BranchingStrategy.md`).
2. Implement inside your module's folder only.
3. Write/update tests as you go — not as a final step.
4. Run locally: `pnpm lint && pnpm typecheck && pnpm test && pnpm build` before pushing.
5. Open a PR against `develop` using the PR template.
6. Address review feedback; do not force-merge around unresolved review comments.
7. Squash-merge once approved and CI is green.

## 3. Continuous Integration (owned by DevOps Engineer)

Every PR triggers:
- Install (`pnpm install --frozen-lockfile`)
- Lint (`pnpm lint`)
- Typecheck (`pnpm typecheck`)
- Unit + integration tests (`pnpm test`)
- Build (`pnpm build`)
- Dependency vulnerability scan
- Preview deploy with an ephemeral Supabase branch

Merge is blocked if any step fails.

## 4. Release Flow

1. `develop` accumulates merged PRs and auto-deploys to staging continuously.
2. When staging is validated, a release PR (`develop` → `main`) is opened.
3. Release PR requires Chief Software Architect sign-off plus green CI.
4. Merge to `main` triggers production deploy and a tagged release
   (`v{major}.{minor}.{patch}`, semver).

## 5. Hotfixes

Branch from `main` as `hotfix/*`, fix, PR directly into `main` with expedited review, then
back-merge `main` into `develop` immediately after.

## 6. Definition of Ready (before work starts)

- The task references a spec, ticket, or ADR — not a verbal description only.
- Acceptance criteria are written down.
- Any cross-module dependency is already an approved interface (or an interface-request issue
  is open and assigned).
