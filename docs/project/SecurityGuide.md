# Security Guide

**Status:** Approved
**Applies to:** Zuri Market
**Full detail:** [`docs/Security.md`](../Security.md)

## Authentication and authorization

- Supabase Auth is the sole identity provider — no custom password storage anywhere.
- Sessions are short-lived JWT access tokens with refresh rotation, handled entirely by the
  Supabase client. MFA is supported for admin and seller accounts at minimum.
- Row Level Security (RLS) is enabled on every table containing user-owned or sensitive
  data, added in the same migration that creates the table — a missing policy must never
  mean "open."
- Roles (`buyer`, `seller`, `admin`, `moderator`, `service`) are enforced in RLS policies and
  mirrored in route handler guards for fast UX failure. The Postgres service role key is
  used only in trusted server contexts (Edge Functions, scheduled jobs), never exposed to
  the client or used to route around RLS for user-triggered requests.

## Data protection

- PII (names, addresses, phone numbers, KYC documents) is never logged.
- Seller KYC documents are stored by Didit, not duplicated into platform storage unless
  required, and access is scoped to the seller and authorized admins only.
- Payment credentials are never stored on platform infrastructure — handled entirely by the
  payment provider's hosted flow or tokenization.
- All data in transit uses TLS, enforced by Cloudflare and Supabase. No plaintext
  credentials belong in repos, docs, tickets, or logs — ever.

## Input handling

- All external input (API bodies, query params, webhook payloads) is validated against a
  schema before use — reject invalid input, don't sanitize-and-hope.
- Webhook endpoints (payment, KYC callbacks) verify provider signatures before processing.
- File uploads are validated for type and size, and processed through Cloudinary, never
  written directly to application storage.

## Infrastructure security

- Cloudflare WAF and rate limiting sit in front of all public endpoints.
- Environment secrets are managed per-environment (local/preview/staging/production) and
  never shared across environments.
- Dependency vulnerabilities are scanned in CI; high/critical findings block merge.

## Incident response

Any suspected credential leak or security incident is reported immediately — rotate the
credential first, investigate second. Security-relevant PRs (auth, RLS, permissions)
require sign-off from the engineer responsible for that domain, regardless of who authored
them. To report a vulnerability privately, see [`SECURITY.md`](../../SECURITY.md) — please
do not open a public issue for security issues.

## Reporting patterns to watch for in this codebase

Credential hygiene has historically been a recurring risk across projects in this
organization: GitHub personal access tokens or API keys shared in plaintext, or committed
to a repository. If this happens: revoke/rotate the credential immediately, then scrub it
from git history if it was committed (not just deleted in a later commit).

## Related detail

- [`docs/production/security-checklist.md`](../production/security-checklist.md) and
  [`docs/production/security-review.md`](../production/security-review.md) — operational
  security checklists.
- [`docs/authentication/`](../authentication/) — auth architecture, RBAC, session flow, and
  the permission matrix in detail.
- [`docs/kyc/`](../kyc/) — seller KYC integration detail.

## Back to the top

Return to the [project README](../../README.md) or the [project docs index](./README.md).
