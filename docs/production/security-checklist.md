# Security Audit Checklist — Kenya E-Commerce Ladies Marketplace

## Authentication

- [ ] Supabase Auth configured for email/password and OAuth providers
- [ ] Password policy enforced: minimum 8 characters, complexity required (uppercase, lowercase, number, special character)
- [ ] Multi-factor authentication (MFA) available as optional opt-in
- [ ] Session timeout configured (idle sessions expire after 60 minutes)
- [ ] Account lockout after 5 consecutive failed login attempts
- [ ] Lockout duration: 15-minute cooldown before retry allowed
- [ ] Password reset flow with secure token expiry (15 minutes)
- [ ] Email verification required before first login
- [ ] Rate limiting on login and registration endpoints

## Authorization (RBAC)

- [ ] Roles enforced: `buyer`, `seller`, `moderator`, `admin`, `super_admin`
- [ ] Row-Level Security (RLS) policies enabled on all database tables
- [ ] RLS policies tested for each role (read, write, update, delete)
- [ ] Permission checks implemented in every service function
- [ ] Route guards applied on all protected pages and API routes
- [ ] Role assignment restricted to `admin` and `super_admin` only
- [ ] Privilege escalation audit logged with user ID, timestamp, and role change

## API Security

- [ ] Content Security Policy (CSP) headers configured and enforced
- [ ] CORS restricted to known origins (no wildcard in production)
- [ ] Rate limiting active on all API routes (per IP and per user)
- [ ] Input validation with Zod schemas on every API endpoint
- [ ] CSRF token validation on all state-changing requests (POST, PUT, PATCH, DELETE)
- [ ] API responses do not leak stack traces or internal state
- [ ] HTTP methods restricted (OPTIONS, HEAD, GET, POST, PUT, PATCH, DELETE only as needed)

## Data Protection

- [ ] All secrets stored in environment variables (never hardcoded)
- [ ] No credentials, API keys, or tokens committed to version control
- [ ] PII handling compliant with data minimization principles
- [ ] Data encrypted at rest (Supabase AES-256 encryption)
- [ ] Encryption in transit enforced (TLS 1.2+)
- [ ] Database connection strings use SSL mode
- [ ] Backup data encrypted at rest
- [ ] Secrets rotation schedule defined and documented

## Frontend Security

- [ ] `sanitizeInput` utility used on all user-generated text before rendering
- [ ] `stripHtml` utility strips dangerous HTML tags from user input
- [ ] `sanitizeUrl` utility validates and sanitizes all URLs before use
- [ ] File upload validation via `isValidFileType` (allowed MIME types, max size)
- [ ] `sanitizeFileName` removes path traversal sequences and special characters
- [ ] CSP nonce generated per request for inline scripts
- [ ] No inline event handlers (`onclick`, `onerror`, etc.) in HTML
- [ ] Local storage does not store sensitive data (tokens, PII)
- [ ] Third-party scripts reviewed and minimized

## Infrastructure Security

- [ ] DDoS protection enabled (Cloudflare)
- [ ] Web Application Firewall (WAF) rules configured and active
- [ ] Bot management enabled to block malicious crawlers
- [ ] IP allowlisting enforced for admin panel access
- [ ] Security headers configured:
  - [ ] HSTS (Strict-Transport-Security)
  - [ ] X-Frame-Options (DENY)
  - [ ] X-Content-Type-Options (nosniff)
  - [ ] Referrer-Policy (strict-origin-when-cross-origin)
  - [ ] Permissions-Policy (restricted features)
- [ ] Automated vulnerability scanning scheduled (weekly)
- [ ] Dependency vulnerability scanning in CI/CD pipeline

## Compliance & Audit

- [ ] GDPR / Data Protection Agreement (DPA) readiness confirmed
- [ ] Cookie consent banner implemented and configured
- [ ] Data retention policies defined and enforced (automated cleanup)
- [ ] Audit logging for all admin actions (user ID, action, timestamp, IP)
- [ ] Audit logs immutable and tamper-proof storage
- [ ] User data export endpoint available
- [ ] User account deletion endpoint available with full cascade
- [ ] Privacy policy accessible from all pages
- [ ] Terms of service accessible from all pages
- [ ] Data processing register maintained
