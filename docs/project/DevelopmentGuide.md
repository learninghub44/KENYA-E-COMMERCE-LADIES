# Development Guide

**Status:** Approved
**Applies to:** Anyone writing code in this repository

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io) (the repository is a pnpm workspace — use it, not `npm`/`yarn`,
  to guarantee consistent installs)
- A [Supabase](https://supabase.com) project (local or hosted) for the database and auth

## Getting the app running

```bash
git clone https://github.com/learninghub44/KENYA-E-COMMERCE-LADIES.git
cd KENYA-E-COMMERCE-LADIES
pnpm install
cp .env.example .env.local   # fill in your Supabase/Cloudinary/Didit/GA values
pnpm dev
```

The app runs at `http://localhost:3000`. See [`.env.example`](../../.env.example) and the
root [README's Environment Variables section](../../README.md#environment-variables) for
what each variable does — never commit real values, and rotate any credential immediately
if it's ever exposed in a commit, PR, or chat log.

## Day-to-day commands

```bash
pnpm dev            # start the Next.js dev server
pnpm lint           # ESLint + TypeScript project check
pnpm typecheck      # tsc --noEmit
pnpm test           # domain unit tests (lib/**, middleware/**)
pnpm test:unit      # Vitest unit test suite
pnpm test:watch     # Vitest in watch mode
pnpm build          # production build
pnpm start          # run the production build locally
```

Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build` before opening a pull request.

## Where code lives

Code is organized by feature/domain, not by technical type. Business logic lives in
`features/<domain>/` and its supporting `lib/<domain>/`; route files under `app/` stay thin
and compose feature code rather than containing logic themselves. See [Repository
Standards](./RepositoryStandards.md) for the full current layout, and
[`docs/FolderStructure.md`](../FolderStructure.md) for the target modular structure the
project is growing toward.

## Making a change

1. `git pull` on `develop`.
2. Skim [`docs/Architecture.md`](../Architecture.md) and
   [`docs/Engineering.md`](../Engineering.md) if it's been a while — confirm which module
   you're working in, and check [`docs/adr/`](../adr/) for any decision that affects it.
3. Branch from `develop` — see naming conventions in
   [`docs/BranchingStrategy.md`](../BranchingStrategy.md)
   (`feature/<module>-<short-description>`, `fix/<module>-<short-description>`,
   `docs/<short-description>`, `chore/<short-description>`).
4. Implement inside your module's folder, writing or updating tests as you go rather than as
   an afterthought.
5. Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build` locally.
6. Open a PR against `develop` using the PR template; commit messages follow [Conventional
   Commits](../BranchingStrategy.md#3-commit-messages--conventional-commits)
   (e.g. `feat(orders): add cursor pagination to order list`).
7. Address review feedback rather than forcing a merge around unresolved comments; squash-merge
   once approved and CI is green.

Full workflow detail — including CI steps and the release/hotfix flow — is in
[`docs/Workflow.md`](../Workflow.md).

## Before requesting review

Check your PR against [`docs/ReviewChecklist.md`](../ReviewChecklist.md) and
[`docs/DefinitionOfDone.md`](../DefinitionOfDone.md). At minimum: no `any`, no hardcoded
secrets, no unlinked TODOs, tests included, and CI green.

## Coding standards

TypeScript conventions, naming, and formatting rules live in
[`docs/CodingStandards.md`](../CodingStandards.md) and
[`docs/CodingRules.md`](../CodingRules.md). API design conventions (request/response shape,
pagination, error format) live in [`docs/APIStandards.md`](../APIStandards.md). Underlying
engineering principles (why the rules exist, not just what they are) are in
[`docs/EngineeringPrinciples.md`](../EngineeringPrinciples.md).

## Testing

- Domain/unit tests live next to the code they test and run via `pnpm test` (Node's built-in
  test runner over `lib/**` and `middleware/**`) and `pnpm test:unit` (Vitest).
- Component/UI tests use Vitest + Testing Library.
- End-to-end tests live in `tests/e2e/`.

## Getting unstuck

- Cross-module interface needs: open a GitHub issue tagged `interface-request`.
- Architectural questions: open an ADR proposal in [`docs/adr/`](../adr/) — see
  [`docs/Contributing.md`](../Contributing.md).
- General questions: [`SUPPORT.md`](../../SUPPORT.md).

## Back to the top

Return to the [project README](../../README.md) or the [project docs index](./README.md).
