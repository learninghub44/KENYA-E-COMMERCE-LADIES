# Security Review — KENYA-E-COMMERCE-LADIES

**Date**: 2026-07-02
**Scope**: Full-stack marketplace (Next.js + Supabase + Cloudinary)

---

## 1. Authentication (`lib/auth/auth-service.ts`)

### ✅ Implemented Correctly
- All inputs validated with Zod schemas before processing
- Audit logging on every auth event (login, logout, registration, password changes, email changes)
- Session verification using Supabase SSR (`sessionFromSupabase`)
- Password update requires a valid session (`SESSION_REQUIRED` check on line 159)
- Email update requires a valid session (line 178-179)
- Password reset with optional `redirectTo` validated as URL
- Logout supports `global | local | others` scope

### ⚠️ Needs Attention
- **No rate limiting** — No brute-force protection on login, registration, or password reset endpoints. Attackers can submit unlimited guesses.
- **No MFA enforcement** — Supabase supports MFA, but there's no MFA check or policy in the auth service.
- **No account lockout** — After N failed login attempts, there's no lockout mechanism.
- **`deactivateAccount` / `reactivateAccount`** — These methods accept a `userId` parameter but perform no authorization check to verify the caller owns that account (or has admin privileges). *See critical finding below.*

### ❌ Critical Vulnerabilities
- **`deactivateAccount(userId)` / `reactivateAccount(userId)` — Missing authorization** (lines 213-235): These methods call `deps.profiles.setProfileStatus(userId, ...)` without verifying the caller's identity or permissions. Any authenticated user could deactivate or reactivate *any* account by passing a different `userId`. This requires a session/ownership check, e.g., comparing `userId` to the current authenticated user's ID, or requiring an admin role.

---

## 2. RBAC — Permissions (`lib/permissions/index.ts`)

### ✅ Implemented Correctly
- `permissionsForRoles()` correctly aggregates permissions from all assigned roles
- `hasPermission()` / `hasEveryPermission()` work correctly for single and multi-permission checks
- `assertPermission()` throws a clean error when authorization fails
- `normalizeRoles()` filters out unknown/invalid role strings safely

### ⚠️ Needs Attention
- No custom error type for `assertPermission` — a generic `Error` is thrown; callers must match on message string
- `normalizeRoles()` silently drops unrecognized roles — could mask configuration errors

---

## 3. Role Definitions (`lib/roles/index.ts` + `types/roles.ts`)

### ✅ Implemented Correctly
- Granular permission strings following a clear `resource.action.scope` convention
- 6 roles defined with appropriate permission sets (buyer, seller, moderator, support, admin, super_admin)
- Well-scoped boundaries between roles (e.g., buyer cannot manage products, seller cannot access security audit)

### ❌ Critical Vulnerabilities
- **Database enum mismatch** — The Supabase migration `202607010001_foundation_schema.sql` defines `app_role` as enum `('buyer', 'seller', 'admin', 'moderator', 'service')` but TypeScript types define `AppRole` as including `'support'` and `'super_admin'`. There is no `ALTER TYPE` migration to add these values. As a result:
  - `support` and `super_admin` roles **cannot be stored** in the `user_roles` table (enum cast fails)
  - All RLS policies referencing `ur.role in ('admin', 'super_admin')` (in migrations 202607020010 through 202607020013) **will fail at runtime** with `invalid input value for enum app_role: "super_admin"`
  - The entire RBAC hierarchy is broken for the highest-privilege roles

---

## 4. Input Sanitization & XSS Prevention (`lib/security.ts`)

### ✅ Implemented Correctly
- Functions exist for HTML entity encoding, URL sanitization, file name sanitization, MIME type validation, HTML stripping
- URL sanitizer properly restricts protocols to `https:`, `http:`, `mailto:`, `tel:`
- File name sanitizer prevents path traversal (removes `..`) and restricts length to 255

### ❌ Critical Vulnerabilities
- **Functions are exported but NEVER imported anywhere in the codebase** — `sanitizeInput`, `stripHtml`, `sanitizeUrl`, `sanitizeFileName`, `isValidFileType`, and `buildCspHeader` are defined and exported but have zero consumers. A `grep` for `from.*security` across all `.ts` files returns no results.
  - No input sanitization is applied to user-supplied text (review body, product descriptions, messages, etc.)
  - The application relies entirely on React's default XSS protection (JSX escaping), which only protects against script injection in rendered content, not against stored XSS in raw data consumed by APIs, emails, or SSR pages
- **CSP config exists but is not applied** — `cspConfig` in `lib/security.ts` defines a Content-Security-Policy but is not used anywhere; `next.config.ts` does not include a CSP header (see Section 5)

---

## 5. CSP & Security Headers (`next.config.ts`)

### ✅ Implemented Correctly
- `X-Frame-Options: DENY` — prevents clickjacking
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` — HSTS for 1 year
- `Referrer-Policy: strict-origin-when-cross-origin` — referrer leak protection
- `Permissions-Policy` restricts camera, microphone, geolocation, interest-cohort
- `poweredByHeader: false` — removes `X-Powered-By: Express`
- `reactStrictMode: true`

### ❌ Critical Vulnerabilities
- **No Content-Security-Policy header** — Despite `cspConfig` existing in `lib/security.ts`, it is not referenced or applied in `next.config.ts`. Without CSP, XSS vulnerabilities cannot be mitigated at the browser level.
- **`script-src` includes `'unsafe-eval'` and `'unsafe-inline'`** — Even if CSP were applied, these directives severely weaken XSS protection. `unsafe-inline` is sometimes required for Next.js, but `unsafe-eval` should be removed if possible.

### ⚠️ Needs Attention
- `typescript.ignoreBuildErrors: true` — Type errors that would normally prevent compilation can ship to production, potentially masking security type-safety issues.

---

## 6. Route Protection (`middleware/auth-guard.ts`)

### ✅ Implemented Correctly
- Clean guard function with clear return types (`GuardResult`)
- Proper handling of public vs. authenticated vs. role-gated routes
- Returns `401` (SESSION_REQUIRED) when no roles present, `403` (AUTHORIZATION_DENIED) when role check fails
- Supports both single-permission and multi-permission checks
- Admin check correctly matches both `admin` and `super_admin`

### ⚠️ Needs Attention
- This is a *function*, not middleware — it must be called explicitly in each route handler. There's no automatic/programmatic middleware that runs for all protected routes.
- `super_admin` is hardcoded in the admin authorization check (line 28) rather than using a permission string

---

## 7. Row-Level Security (Supabase Migrations)

### ✅ Implemented Correctly
- **RLS enabled on ALL 32 tables** — comprehensive coverage
- **Force RLS** applied in production hardening migration
- **Granular, least-privilege policies** — separate policies for SELECT, INSERT, UPDATE with different `USING` and `WITH CHECK` clauses
- **Security helper functions** (`current_user_has_role`, `current_user_is_staff`, `current_user_can_manage_seller`) are `security definer` with explicit `set search_path` to prevent search path injection
- Views use `security_invoker = true` so RLS propagates from underlying tables
- Production hardening migration (`202607010004`) revokes default public schema access, then grants only necessary permissions
- Storage buckets have specific per-role policies (not just `auth.role() = 'authenticated'`)

### ⚠️ Needs Attention
- Some `FOR ALL` policies combine SELECT/INSERT/UPDATE/DELETE when separate policies would be more auditable
- Storage policies rely on `storage_folder_uuid()` which does try/catch for invalid UUIDs (safe, but could silently treat malformed paths as permitted)
- `"contact requests public insert"` allows `WITH CHECK (true)` — any unauthenticated visitor can submit contact requests. Acceptable for a contact form, but review if spam protection is needed.

### ❌ Critical Vulnerabilities
- **RLS policies using `ur.role in ('admin', 'super_admin')` will fail at runtime** — Since `super_admin` is not in the `app_role` database enum, any RLS policy (in migrations `202607020010` through `202607020013`) that references it will throw `invalid input value for enum app_role: "super_admin"` when triggered. This affects at least 16 policies.

---

## 8. Hardcoded Secrets / Credentials

### ✅ Implemented Correctly
- **No hardcoded secrets found** — API keys, tokens, and secrets are loaded from environment variables only
- `.env.example` contains placeholder values (keys are empty)
- Supabase client uses `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!` (server-side, from env)
- Cloudinary adapter reads `apiKey` and `apiSecret` from config object (injected from env)
- Test files use fake/placeholder tokens (e.g., `"guest-token-1234567890"`)

### ⚠️ Needs Attention
- **No environment variable validation at startup** — If `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `CLOUDINARY_API_SECRET`, or other required variables are missing, the app will fail at runtime with potentially confusing errors or undefined behavior (due to the `!` non-null assertions)

---

## 9. Checkout & Order Services (`checkout-service.ts`, `order-service.ts`)

### ✅ Implemented Correctly
- **Cart ownership check** — `cart.userId !== parsed.data.buyerId` verified (line 52)
- **Active cart check** — `cart.status !== "active"` prevents reusing converted carts
- **Inventory reservation before order** — `deps.inventory.reserve()` called before order creation
- **Inventory release on failure** — Both coupon validation failure (line 68) and catch block (line 121) release inventory
- **Mixed currency check** — Prevents multi-currency carts
- **Order ownership** — `getForBuyer` verifies `order.buyerId !== buyerId` (line 19)
- **Cancel only by buyer** — `cancelByBuyer` verifies both ownership and cancellability via `buyerCanCancel()`
- **Status transition validation** — `assertOrderStatusTransition()` enforces valid state machine transitions

### ⚠️ Needs Attention
- **`transition()` has no authorization check** (lines 42-72): The `statusTransitionSchema` includes `actorId` but there's no verification that:
  - The actor is staff/seller or the buyer (depending on the transition)
  - The actor has permission to update this specific order (seller association)
  - Anyone who can call this method could transition any order's status
- **`listForSeller` has no seller verification** (line 27-28): Takes a `sellerId` parameter but doesn't verify the caller owns that seller account. Any authenticated user could list another seller's orders.
- **Address data is stored as JSONB** — Zod validates addresses but the raw validated data is stored directly. No `sanitizeInput` applied.
- **Order number generation** uses `Math.random()` — less secure than `crypto.randomUUID()` for order number entropy

---

## 10. Zod Validation Schemas (`lib/reviews/schemas.ts`, `lib/products/schemas.ts`)

### ✅ Implemented Correctly
- **Strict type and length constraints** — UUIDs, URL validation, email validation, string length limits
- **Star rating bounded 1–5** — prevents out-of-range values
- **Trim on text fields** — whitespace stripping
- **Media validation** — MIME type whitelist (`image/jpeg`, `image/png`, `image/webp`, `image/gif`), max 8 items per review, 255 char publicId
- **Price validation** — `priceSchema` uses `int().min(0)` preventing negative prices
- **Product search schema** has proper defaults, max limits, and sort enum
- **Refine logic** — `compareAtPriceMinor >= basePriceMinor` validated cross-field
- **Schema limits** — 100 attributes max, 500 variants max, 50 images max, reasonable string max lengths

### ⚠️ Needs Attention
- **No HTML/markdown sanitization** — Review `body` (max 5000 chars) and `title` (max 120 chars) accept arbitrary text. While React escapes output, this data may be used in:
  - API responses consumed by third parties
  - Email notifications (potential HTML injection in emails)
  - RSS feeds or other non-React contexts
- **Alt text limited to 160 chars** — sufficient, but no sanitization
- **`now: z.date().optional()` in updateProductReviewSchema** — unused field, harmless but dead code

---

## Summary of Critical Issues to Fix

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| 1 | ❌ **Critical** | DB enum missing `super_admin`/`support`; RLS policies referencing them fail at runtime | `202607010001_foundation_schema.sql:7`, 16 policies in later migrations |
| 2 | ❌ **Critical** | No CSP header applied; `cspConfig` exists but is dead code | `next.config.ts`, `lib/security.ts` |
| 3 | ❌ **High** | `sanitizeInput`/`stripHtml`/`sanitizeUrl` are never imported; no sanitization applied anywhere | `lib/security.ts` (all functions) |
| 4 | ❌ **High** | `deactivateAccount`/`reactivateAccount` missing authorization checks | `lib/auth/auth-service.ts:213-235` |
| 5 | ⚠️ **High** | `order-service.transition()` missing authorization — any caller can transition any order | `lib/orders/order-service.ts:42-72` |
| 6 | ⚠️ **Medium** | `listForSeller` takes arbitrary `sellerId` without verifying caller ownership | `lib/orders/order-service.ts:27-28` |
| 7 | ⚠️ **Medium** | No rate limiting on auth endpoints | `lib/auth/auth-service.ts` |
| 8 | ⚠️ **Medium** | No MFA enforcement | `lib/auth/auth-service.ts` |
| 9 | ⚠️ **Low** | `typescript.ignoreBuildErrors: true` | `next.config.ts:5` |
| 10 | ⚠️ **Low** | `Math.random()` used for order number generation | `lib/checkout/checkout-service.ts:41` |
