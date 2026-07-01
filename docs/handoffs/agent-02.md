# Agent 02 Authentication & Security Handoff

## What Was Built

- Supabase Auth service layer for registration, login, logout, password reset, password update, email update, account deactivation/reactivation, session refresh, and session validation.
- Scalable RBAC catalog with roles, permissions, role grants, and permission helpers.
- Route guard middleware helpers for public, authenticated, seller, and admin access levels.
- CSRF token helpers, fixed-window rate-limit hook, security headers, password policy, and audit logging interface.
- Unit tests for password policy, permissions, route guards, and auth service flows.
- Authentication documentation under `docs/authentication/`.

## Authentication Flow

Registration calls Supabase Auth, creates a `profiles` row, grants the default `buyer` role, and writes an audit event. Login calls Supabase Auth, reads roles from `user_roles`, writes an activity event, and returns a normalized session.

## Role System

Roles are `buyer`, `seller`, `moderator`, `support`, `admin`, and `super_admin`. Permissions are centralized in code. Features must check permissions, not raw role strings.

## Middleware

Use `authorizeRoute` with the route's declared auth level and required permissions. RLS remains the source of truth for database authorization.

## Security Decisions

Supabase Auth owns passwords, sessions, verification emails, reset emails, and refresh tokens. Application code validates input, applies password policy, checks permissions, and writes audit/activity records.

## Files Created

- `auth/` is reserved for future route adapters.
- `lib/auth/*`
- `lib/permissions/*`
- `lib/roles/*`
- `middleware/auth-guard.ts`
- `security/headers.ts`
- `types/auth.ts`
- `types/permissions.ts`
- `types/roles.ts`
- `docs/authentication/*`

## APIs Exposed

- `createAuthService`
- `validatePassword`
- `createCsrfToken`
- `verifyCsrfToken`
- `createFixedWindowRateLimiter`
- `authorizeRoute`
- `permissionsForRoles`
- `hasPermission`
- `hasEveryPermission`

## Testing Completed

Implemented unit tests for core logic. Run:

```bash
pnpm install
pnpm test
pnpm typecheck
```

## Known Limitations

- The remote has no `develop` branch, so this branch was based on `origin/feat/database-phase-2-foundation`.
- The current database enum does not persist `support` or `super_admin`; Agent 1 must approve a migration before those roles are written to `user_roles` in production.
- The repository did not yet contain the documented `apps/web` scaffold, so this handoff provides framework-agnostic auth modules ready for route adapters.

## Integration Notes For Agent 3

Seller onboarding should reuse the same authenticated session and grant `seller` only after seller account creation. Agent 3 should not create a separate seller login system and should call permission helpers instead of checking role strings directly.
