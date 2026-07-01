# Authentication Architecture

Agent 2 owns the identity foundation. Supabase Auth is the sole identity provider; this code does not store passwords or mint custom tokens.

## Components

- `lib/auth`: Supabase Auth use cases for registration, login, logout, password reset, password update, email update, account lifecycle, session refresh, and audit logging.
- `lib/roles`: role catalog and role-to-permission matrix.
- `lib/permissions`: reusable RBAC checks. Feature code must call these helpers instead of hardcoding role checks.
- `middleware`: route-level guard utilities for public, authenticated, seller, and admin routes.
- `security`: shared security headers and CSRF/rate-limit helpers.
- `types`: public auth, role, and permission contracts.

## Source Of Truth

Supabase Auth owns identity and sessions. Supabase Postgres RLS remains the authorization boundary for data. Route guards are a fast-fail layer for API and page access, not a replacement for RLS.

## Database Alignment

Agent 1 created `profiles`, `user_roles`, `audit_logs`, and `activity_logs`. Registration creates a profile row after Supabase signup and grants the default `buyer` role through the role repository. Sensitive auth events are written to `audit_logs`; lower-risk session activity is written to `activity_logs`.
