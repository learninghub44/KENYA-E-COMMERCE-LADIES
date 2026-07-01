# RBAC

## Roles

- `buyer`: default account role.
- `seller`: seller account access after seller onboarding.
- `moderator`: moderation tools and audit read access.
- `support`: customer support access without role administration.
- `admin`: staff management, support, moderation, lockout, and audit write access.
- `super_admin`: highest platform role for break-glass and ownership operations.

## Rules

- Permissions are represented as code constants in `types/permissions.ts`.
- Role permission grants live in `lib/roles/index.ts`.
- Permission checks use `lib/permissions`; no feature should branch on raw role strings.
- Data access must still be enforced by RLS.

## Current Database Note

The current Agent 1 database enum persists `buyer`, `seller`, `moderator`, `admin`, and `service`. Code-level RBAC includes `support` and `super_admin` as required by Agent 2, but persisting those two roles requires an Agent 1-reviewed enum migration before production use.
