# Agent 01 Database Handoff

## What Was Built

Agent 01 built the Supabase database foundation for the marketplace: normalized PostgreSQL tables, constraints, foreign keys, indexes, triggers, reporting/read views, RLS policies, storage buckets, storage object policies, seed data, validation SQL, and database documentation.

## Database Decisions

- UUID primary keys are used for application-owned entities.
- `profiles.id` references `auth.users.id`; authentication workflow remains Agent 2 ownership.
- Seller permissions are explicit through `seller_members`.
- Staff permissions are explicit through `user_roles` with `admin` and `moderator`.
- High-volume lists are designed for cursor pagination with composite indexes.
- Historical order items store product snapshots so product edits do not mutate order history.
- Soft deletes are added to lifecycle records that are commonly retired or hidden.
- Physical deletes remain appropriate for join rows, cart items, wishlist items, and other replaceable child records.

## Files Created or Updated

- `supabase/migrations/202607010001_foundation_schema.sql`
- `supabase/migrations/202607010002_lifecycle_constraints_and_indexes.sql`
- `supabase/migrations/202607010003_storage_buckets_and_policies.sql`
- `supabase/seed/dev_seed.sql`
- `supabase/policies/README.md`
- `supabase/functions/README.md`
- `supabase/tests/database_validation.sql`
- `database/README.md`
- `docs/database/00-index.md`
- `docs/database/08-index-strategy.md`
- `docs/database/10-storage-bucket-strategy.md`
- `docs/database/DATABASE_STATUS.md`
- `docs/database/CHANGELOG.md`
- `docs/handoffs/agent-01.md`

## Tables Added

The foundation includes 40 public tables: `countries`, `profiles`, `user_roles`, `sellers`, `seller_members`, `kyc_verifications`, `categories`, `brands`, `products`, `product_images`, `product_variants`, `inventory_items`, `product_attributes`, `collections`, `collection_products`, `addresses`, `wishlists`, `wishlist_items`, `carts`, `cart_items`, `orders`, `order_items`, `reviews`, `conversations`, `messages`, `notifications`, `reports`, `store_followers`, `audit_logs`, `activity_logs`, `feature_flags`, `analytics_events`, `shipping_profiles`, `shipping_zones`, `coupons`, `promotions`, `banners`, `cms_pages`, `faqs`, and `contact_requests`.

## Views

- `product_catalog`: public active product read model with seller and category context.
- `seller_storefronts`: public active seller storefront read model.

## RLS Summary

Every public table has RLS enabled. Policies use self-owned access, buyer/order participation, seller membership, staff roles, or public active/published reads. Storage policies use path prefixes and the same seller/staff ownership helpers.

## Storage Buckets

- `product-images`: public read, seller-managed writes.
- `seller-documents`: private, seller/staff access.
- `kyc-documents`: private, seller/staff access.
- `store-logos`: public read, seller-managed writes.
- `store-banners`: public read, seller-managed writes.
- `user-avatars`: public read, self-managed writes.
- `promotional-banners`: public read, staff-managed writes.
- `cms-assets`: public read, staff-managed writes.

## Known Limitations

- Migrations were statically reviewed here but not executed against a local Supabase instance in this workspace.
- No auth users are seeded because `auth.users` and signup flows belong to Agent 2.
- Legacy buckets `seller-assets` and `private-documents` may exist after the initial migration; new code should use the explicit Phase 2 buckets.
- Large-table partitioning is documented as a future measured optimization, not enabled now.

## Recommendations

- Run `supabase db reset`, then `supabase/seed/dev_seed.sql`, then `supabase/tests/database_validation.sql` before opening the PR.
- Generate typed database bindings after the application package scaffold exists.
- Add integration tests for RLS once Agent 2 creates auth bootstrap users.
- Revisit partitioning for `messages`, `orders`, `analytics_events`, and `audit_logs` when production volume justifies it.

## Dependencies for Agent 2

Agent 2 should implement:

- Supabase Auth signup, login, logout, password reset, and session handling.
- Profile creation after `auth.users` signup.
- Initial `user_roles` assignment for buyers and staff through controlled admin flows.
- Seller onboarding flow that creates `sellers` and `seller_members`.
- JWT or server-side checks that align with the database RLS helpers.
