# Database Status

Status: Phase 2 implementation complete for Agent 01 database foundation.

## Implemented

- `supabase/migrations/202607010001_foundation_schema.sql` creates the normalized marketplace schema, enums, foreign keys, defaults, triggers, views, indexes, RLS policies, and initial country data.
- `supabase/migrations/202607010002_lifecycle_constraints_and_indexes.sql` adds soft-delete columns where records are commonly retired instead of physically removed, hardens price/order/time-window constraints, and adds high-volume pagination indexes.
- `supabase/migrations/202607010003_storage_buckets_and_policies.sql` creates the required Supabase Storage bucket model and least-privilege object policies.
- `supabase/seed/dev_seed.sql` provides repeatable minimal development data without creating auth users.
- `supabase/tests/database_validation.sql` provides post-reset validation queries for RLS coverage, storage setup, and critical indexes.

## Table Coverage

The schema includes identity support, roles, countries, sellers, seller members, KYC verifications, categories, brands, products, product images, variants, inventory, attributes, collections, addresses, wishlists, carts, orders, reviews, conversations, messages, notifications, reports, followers, audit logs, activity logs, feature flags, analytics events, shipping profiles, zones, coupons, promotions, banners, CMS pages, FAQs, and contact requests.

## RLS Coverage

RLS is enabled on every public table created by the foundation migration. Policies follow explicit ownership: self, buyer, seller member, staff, or public published/active read access.

## Storage Coverage

Required buckets are implemented: `product-images`, `seller-documents`, `kyc-documents`, `store-logos`, `store-banners`, `user-avatars`, `promotional-banners`, and `cms-assets`.

## Validation Status

Static review completed in this workspace. Local execution was not completed because this environment does not include a running Supabase database. Run:

```bash
supabase db reset
psql "$DATABASE_URL" -f supabase/seed/dev_seed.sql
psql "$DATABASE_URL" -f supabase/tests/database_validation.sql
```

## Agent 2 Dependency

Agent 2 must implement Supabase Auth flows and create profile bootstrap behavior after user signup. The database expects `profiles.id` to match `auth.users.id`.
