# Security Decisions

- Supabase Auth is the only identity provider.
- Password hashing is delegated to Supabase Auth.
- Password policy is enforced before password creation or update.
- Email verification and password reset are delegated to Supabase Auth email flows.
- CSRF protection uses signed double-submit tokens for cookie-backed mutating requests.
- Rate limiting is exposed as a hook so Agent 13 can back it with Cloudflare or Redis later.
- Audit logging never records passwords, tokens, raw PII, payment data, or KYC documents.
- Service role credentials are not used in user-triggered request paths.
