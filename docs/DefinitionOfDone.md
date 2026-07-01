# Definition of Done

**Status:** Approved

A task is **done** only when all of the following are true:

1. Code implements the full acceptance criteria of the task/spec — not a partial version.
2. `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` pass locally and in CI.
3. Unit tests cover new logic; regression test added for any bug fix.
4. RLS policies exist for any new/changed table (if applicable).
5. No `any`, no hardcoded secrets, no TODO left without a linked follow-up issue.
6. Public exports/API routes are documented per `CodingStandards.md` / `APIStandards.md`.
7. PR reviewed and approved against `ReviewChecklist.md` by the relevant module owner.
8. Merged to `develop`, deployed to staging, and manually verified in staging for
   user-facing changes.
9. No known regressions introduced in another module (checked via CI + smoke test).
10. Any new architectural decision has a corresponding ADR in `docs/adr/`.

Work that meets the acceptance criteria but skips any of the above is **not done** — it is
still in progress, regardless of how the code looks.
