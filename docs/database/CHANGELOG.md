# Database Changelog

## 2026-07-01 - Production hardening

- Added production grants and schema creation lockdown.
- Forced RLS on all application tables.
- Restricted direct function execution and set safer function search paths.
- Expanded validation SQL for production hardening checks.
- Added a direct SQL runner for migration, seed, and validation execution.

## 2026-07-01

- Added Phase 2 lifecycle and constraint hardening migration.
- Added soft-delete columns for user-managed and content lifecycle records.
- Added order, order item, coupon, product price, and time-window check constraints.
- Added high-volume pagination and operational indexes.
- Added required Supabase Storage buckets and object policies.
- Added repeatable development seed data.
- Added database validation SQL.
- Added RLS, function, storage, status, and Agent 01 handoff documentation.
