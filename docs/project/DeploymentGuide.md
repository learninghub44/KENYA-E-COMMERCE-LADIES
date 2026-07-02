# Deployment Guide

**Status:** Approved
**Applies to:** Deploying Zuri Market to staging or production

## Target topology

```
Internet Users → Cloudflare (CDN / WAF) → Next.js Application → Supabase (Postgres + RLS + Auth + Edge Functions)
                                                                → Cloudinary (media)
                                                                → Didit (seller KYC)
```

Cloudflare terminates traffic, serves static assets and cached images at the edge, and
provides WAF/DDoS protection in front of the Next.js application. Supabase is the sole data
and auth layer — there is no separate application database. See [Architecture
Summary](./ArchitectureSummary.md) for the full system shape.

## Environments

| Environment | Purpose | Database | Deploy trigger |
| --- | --- | --- | --- |
| `local` | Development | Local Supabase or dev project | manual |
| `preview` | Per-PR review | Ephemeral Supabase branch | every PR |
| `staging` | Pre-production validation | Staging Supabase project | merge to `develop` |
| `production` | Live traffic | Production Supabase project | merge to `main` |

## Deploying a new environment

1. **Provision a Supabase project** and run the migrations in `supabase/migrations/` in
   order (or via `scripts/run-supabase-sql.js`).
2. **Set environment variables** in your hosting provider's configuration — see the [root
   README's Environment Variables table](../../README.md#environment-variables) and
   [`.env.example`](../../.env.example) for the currently required set
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, the Cloudinary trio, `DIDIT_API_KEY`,
   `DIDIT_WEBHOOK_SECRET`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_APP_URL`). Never
   commit real values — `.env.local` is git-ignored.
3. **Build** with `pnpm build` and deploy the standard Next.js production output.
4. **Point Cloudflare DNS** at your hosting provider and enable the WAF/rate-limiting rules
   described in the [Security Guide](./SecurityGuide.md).

## Release flow

`develop` accumulates merged PRs and deploys continuously to staging. Once staging is
validated, a release PR (`develop` → `main`) requires sign-off plus green CI. Merging to
`main` triggers a production deploy and a semver-tagged release
(`v{major}.{minor}.{patch}`). Hotfixes branch from `main`, merge directly back into `main`
with expedited review, then get back-merged into `develop` immediately. Full detail:
[`docs/Workflow.md`](../Workflow.md) §4–§5.

## Continuous integration gate

Every PR runs install, lint, typecheck, the test suite, a production build, and a
dependency vulnerability scan, plus a preview deploy against an ephemeral Supabase branch.
Merge is blocked if any step fails. See [`docs/Workflow.md`](../Workflow.md) §3.

## Detailed operational runbooks

`docs/production/` contains deeper, hosting-specific operational documentation:
[`deployment-guide.md`](../production/deployment-guide.md),
[`environment-variables.md`](../production/environment-variables.md),
[`monitoring-guide.md`](../production/monitoring-guide.md),
[`backup-strategy.md`](../production/backup-strategy.md),
[`disaster-recovery-plan.md`](../production/disaster-recovery-plan.md), and the
[`production-checklist.md`](../production/production-checklist.md) /
[`launch-checklist.md`](../production/launch-checklist.md) pair.

**Known gap:** `docs/production/deployment-guide.md`,
[`environment-variables.md`](../production/environment-variables.md), and
[`monitoring-guide.md`](../production/monitoring-guide.md) currently reference
infrastructure and environment variables (Wrangler/Cloudflare Pages deploy commands,
`RESEND_API_KEY`, `GROQ_API_KEY`, `SESSION_SECRET`, `CSRF_SECRET`, Sentry, PagerDuty) that
are **not** present in [`.env.example`](../../.env.example) or `package.json` as of this
writing. Reconcile those documents against the current codebase (or update `.env.example`
and dependencies to match, if that tooling is actually adopted) before treating them as an
authoritative deployment procedure — see the [handoff note for this audit
pass](../handoffs/agent-15d.md) for the full finding.

## Back to the top

Return to the [project README](../../README.md) or the [project docs index](./README.md).
