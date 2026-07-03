# Maintenance Guide

**Status:** Approved
**Applies to:** Keeping a deployed Zuri Market environment healthy

## Routine checks

- **Dependency vulnerabilities** are scanned in CI on every PR; high/critical findings block
  merge (see [`docs/Security.md`](../Security.md) §5 and [Security Guide](./SecurityGuide.md)).
  Outside of CI, periodically run `pnpm audit` and update flagged packages.
- **Database backups** — see [`docs/production/backup-strategy.md`](../production/backup-strategy.md)
  for the current backup cadence and restore procedure; verify restores are actually tested
  periodically, not just that backups are being written.
- **Migrations** are the only sanctioned way schema changes reach the database — never make
  manual changes in the Supabase dashboard beyond local prototyping (see [`docs/Architecture.md`](../Architecture.md) §5).
- **Credential hygiene** — rotate any credential (API key, service role key, webhook secret)
  immediately if it is ever exposed in a commit, PR, ticket, or chat log. Never share
  credentials in plain text.

## Monitoring and alerting

Application health, error tracking, and alerting are covered in
[`docs/production/monitoring-guide.md`](../production/monitoring-guide.md) and
[`docs/production/operational-runbook.md`](../production/operational-runbook.md). See the
**Known gap** note in the [Deployment Guide](./DeploymentGuide.md) before treating specific
tool names in that guide (e.g. Sentry, PagerDuty) as confirmed-integrated — verify against
the current codebase first.

## Handling incidents

- Any suspected credential leak or security incident: rotate the credential first,
  investigate second. See [`docs/Security.md`](../Security.md) §6 and
  [`SECURITY.md`](../../SECURITY.md) for how to report a vulnerability privately (please do
  not open a public issue for security issues).
- Broader incident response and recovery procedures, organized by failure scenario
  (database failure, provider outage, etc.), are in
  [`docs/production/incident-response.md`](../production/incident-response.md) and
  [`docs/production/disaster-recovery-plan.md`](../production/disaster-recovery-plan.md).
- Day-to-day troubleshooting steps for common failure modes are in
  [`docs/production/troubleshooting-guide.md`](../production/troubleshooting-guide.md).

## Dependency and platform upgrades

- Keep Node.js, pnpm, Next.js, and Supabase client libraries current; run the full local
  check (`pnpm lint && pnpm typecheck && pnpm test && pnpm build`) after any upgrade before
  merging.
- Track third-party provider changes (Supabase, Cloudinary, Didit, Google Analytics) that
  could affect the adapters in `packages/integrations` (target layout) — see [Architecture
  Summary](./ArchitectureSummary.md) for why those integrations sit behind interfaces
  specifically to make this kind of change low-risk.

## Documentation upkeep

- When a decision changes an approved standard (architecture, security, coding rules), file
  an ADR in [`docs/adr/`](../adr/) rather than editing the standard silently — see
  [`docs/Architecture.md`](../Architecture.md) §10.
- When a domain doc and one of the `docs/project/` summaries disagree, the domain doc is
  authoritative; update the summary to match rather than leaving the discrepancy.
- Record significant engineering passes in [`docs/handoffs/`](../handoffs/) and keep
  [`CHANGELOG.md`](../../CHANGELOG.md) current using [Keep a
  Changelog](https://keepachangelog.com/) format.

## Periodic review checklist

- [ ] CI is green on `main` and `develop`
- [ ] No unresolved high/critical dependency vulnerabilities
- [ ] Backups exist and a restore has been tested recently
- [ ] No plaintext credentials in the repo, issues, or PRs (see [Security
      Guide](./SecurityGuide.md))
- [ ] `docs/production/` runbooks still match the deployed environment
- [ ] `ROADMAP.md` and `CHANGELOG.md` reflect current reality

## Back to the top

Return to the [project README](../../README.md) or the [project docs index](./README.md).
