# RLS and Storage Policies

The executable policy definitions live in the migrations:

- `supabase/migrations/202607010001_foundation_schema.sql`
- `supabase/migrations/202607010003_storage_buckets_and_policies.sql`

## Policy Model

Public reads are limited to active or published marketplace data: countries, brands, active sellers, active products, published collections, published CMS content, public storage assets, and reporting views derived from those same tables.

Authenticated buyers can manage their own profile-adjacent records: addresses, wishlists, carts, orders they place, reviews they author, conversations they participate in, notifications, store follows, reports they submit, activity logs, and analytics events.

Seller access is explicit through `seller_members`. A seller owner, manager, or staff user can manage seller-owned catalog, inventory, collections, shipping, promotions, order fulfillment, and buyer conversations for that seller. Seller access is never inferred from email domain or free-form metadata.

Staff access is explicit through `user_roles` values `admin` and `moderator`. Staff can administer reference data, moderation queues, CMS content, reports, audits, and private storage workflows.

## Helper Functions

- `public.current_user_has_role(required_role public.app_role)`
- `public.current_user_is_staff()`
- `public.current_user_can_manage_seller(seller_uuid uuid)`
- `public.storage_folder_uuid(object_name text, folder_index integer default 1)`

The helpers are `security definer` functions with fixed `search_path` values so policies do not duplicate role and ownership joins.

## Storage Path Rules

Use these object path prefixes from application code:

- `product-images/{seller_id}/{product_id}/{filename}`
- `seller-documents/{seller_id}/{document_type}/{filename}`
- `kyc-documents/{seller_id}/{verification_id}/{filename}`
- `store-logos/{seller_id}/{filename}`
- `store-banners/{seller_id}/{filename}`
- `user-avatars/{user_id}/{filename}`
- `promotional-banners/{placement}/{filename}`
- `cms-assets/{page_or_asset_group}/{filename}`

Public buckets allow public `select` only. Writes still require the matching owner or staff role.
