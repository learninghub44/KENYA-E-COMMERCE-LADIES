# Contributing

**Status:** Approved

## Setup

```bash
git clone <repo-url>
cd marketplace-platform
pnpm install
cp .env.example .env.local   # fill in local Supabase project values
pnpm dev
```

## Before You Start

1. Read `docs/Architecture.md` and `docs/Engineering.md` — know which module you own and
   which you don't.
2. Confirm your task has clear acceptance criteria (`docs/Workflow.md` §6).
3. Pull latest `develop`.

## Making a Change

1. Create a branch per `docs/BranchingStrategy.md`.
2. Work only inside your owning module's folder (`docs/FolderStructure.md`,
   `docs/Engineering.md`).
3. Follow `docs/CodingStandards.md` and `docs/CodingRules.md`.
4. Add/update tests.
5. Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build` before pushing.
6. Open a PR against `develop` using `.github/PULL_REQUEST_TEMPLATE.md`.
7. Ensure your PR satisfies `docs/ReviewChecklist.md` and `docs/DefinitionOfDone.md`.

## Need Something From Another Module?

Open a GitHub issue tagged `interface-request`, assigned to the owning agent, describing the
data/behavior you need exposed. Don't import their internals directly.

## Reporting Bugs / Requesting Features

Use `.github/ISSUE_TEMPLATE/bug_report.md` or `feature_request.md`.

## Questions on Architecture

Anything that isn't covered by an existing doc, or that seems to conflict with one, goes to
the Chief Software Architect as an ADR proposal (`docs/adr/`), not as an ad hoc decision in a
PR thread.
