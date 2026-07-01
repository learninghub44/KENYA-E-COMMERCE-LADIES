# Security Guidelines

**Status:** Approved
**Owner:** Authentication & Security Engineer (enforced by all)

## 1. Authentication

- Supabase Auth is the sole identity provider. No custom password storage anywhere.
- Sessions are JWT-based, short-lived access tokens with refresh rotation, handled by the
  Supabase client — no engineer hand-rolls token logic.
- MFA is supported for admin and seller accounts at minimum.

## 2. Authorization

- Row Level Security (RLS) is enabled on every table containing user-owned or sensitive data,
  from the migration that creates the table — never added "later."
- Roles: `buyer`, `seller`, `admin`, `moderator`, `service`. Role checks live in RLS policies
  and are mirrored in route handler guards for fast UX failure.
- The Postgres service role key is used only in trusted server contexts (Edge Functions,
  scheduled jobs) — never exposed to the client, never used to route around RLS for
  user-triggered requests.

## 3. Data Protection

- PII (names, addresses, phone numbers, KYC documents) is never logged.
- Seller KYC documents (via Didit) are stored by the provider, not duplicated into our own
  storage unless required, and access is scoped to the seller and authorized admins only.
- Payment credentials are never stored on our infrastructure — handled entirely by the
  payment provider's hosted flow / tokenization.
- All data in transit uses TLS (enforced by Cloudflare and Supabase). No plaintext
  credentials in repos, docs, tickets, or logs — ever.

## 4. Input Handling

- All external input (API bodies, query params, webhook payloads) is validated against a
  schema before use. Reject, don't sanitize-and-hope.
- Webhook endpoints (payment, KYC callbacks) verify provider signatures before processing.
- File uploads (product images) are validated for type/size and processed through Cloudinary,
  never written directly to application storage.

## 5. Infrastructure Security

- Cloudflare WAF and rate limiting sit in front of all public endpoints.
- Environment secrets are managed per-environment (local/preview/staging/production) and
  never shared across environments.
- Dependency vulnerabilities are scanned in CI (see `Workflow.md`); high/critical findings
  block merge.

## 6. Incident Response

- Any suspected credential leak or security incident is reported immediately, the credential
  is rotated first, investigation happens second.
- Security-relevant PRs (auth, RLS, permissions) require sign-off from the Authentication &
  Security Engineer regardless of who authored them.
