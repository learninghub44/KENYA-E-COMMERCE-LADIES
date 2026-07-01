# Database Foundation

This directory documents the database surface owned by Agent 01. The executable schema lives in:

- `supabase/migrations/202607010001_foundation_schema.sql`

## Scope

The foundation migrations create PostgreSQL structures only:

- Core identity support tables that reference Supabase Auth users.
- Seller, KYC, catalog, product media, variants, inventory, attributes, and collections.
- Buyer-owned addresses, wishlists, carts, and cart items.
- Orders, order items, reviews, and ratings.
- Buyer-seller conversations and messages.
- Notifications, reports, store followers, audit logs, activity logs, feature flags, and analytics events.
- Shipping profiles, shipping zones, coupons, promotions, banners, CMS pages, FAQs, and contact requests.
- Public read views for catalog and seller storefront data.
- Supabase storage buckets and object policies for product images, seller documents, KYC documents, store logos, store banners, user avatars, promotional banners, and CMS assets.

No application routes, UI, authentication client code, seller dashboard code, marketplace API code, or business workflow implementation is included.

## RLS Model

Every table created by the foundation migration has row level security enabled in the same migration.

The migration defines these database helper functions for policy reuse:

- `public.current_user_has_role(required_role public.app_role)`
- `public.current_user_is_staff()`
- `public.current_user_can_manage_seller(seller_uuid uuid)`

Application code should still perform route-level checks for user experience, but these policies are the authorization source of truth.

## Roles

The `public.app_role` enum supports:

- `buyer`
- `seller`
- `admin`
- `moderator`
- `service`

Role assignment is represented in `public.user_roles`. Supabase Auth remains the identity provider; this schema does not implement authentication flows.

## Scale Readiness

The migration includes indexes for common ownership, filtering, ordering, and lookup paths:

- Seller and product status filters.
- Product category, brand, seller, and full-text search.
- Orders by buyer and seller.
- Messages by conversation and timestamp.
- Notifications by user/status/timestamp.
- Reports, audit logs, analytics events, content publishing, and shipping/coupon lookups.

Large tables such as `orders`, `messages`, and `analytics_events` are not partitioned yet. Per `docs/Scalability.md`, partitioning should be introduced only after measured volume requires it.

## Storage

The migration creates storage buckets when the Supabase `storage` schema is available:

- `product-images`: public product image assets, 10 MB max.
- `seller-documents`: private seller operational documents, 20 MB max.
- `kyc-documents`: private KYC documents, 20 MB max.
- `store-logos`: public seller logos, 5 MB max.
- `store-banners`: public seller banners, 10 MB max.
- `user-avatars`: public user avatars, 5 MB max.
- `promotional-banners`: public staff-managed promotional assets, 10 MB max.
- `cms-assets`: public staff-managed CMS assets, 10 MB max.

Product images should still go through Cloudinary in application workflows. The bucket definitions exist as database/storage support and a safe fallback surface.

## Verification

Before merge, run the migrations and seed in a Supabase-enabled environment:

```bash
supabase db reset
psql "$DATABASE_URL" -f supabase/seed/dev_seed.sql
psql "$DATABASE_URL" -f supabase/tests/database_validation.sql
```

Then generate database types for the application once the TypeScript package scaffold exists:

```bash
supabase gen types typescript --local
```
