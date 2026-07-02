-- Agent 04 (Marketplace): explicit suspension flag + filter-support indexes.
--
-- The product lifecycle (draft -> pending_review -> approved -> published -> rejected ->
-- suspended -> archived) needs a `suspended` state that is distinct from `archived`, but
-- `public.product_status` only has ('draft','pending_review','active','rejected','archived').
-- Rather than widening a shared enum mid-project (which would touch Agent 1's foundation
-- migration and every RLS policy that matches on `status`), a dedicated boolean column carries
-- the extra bit of state. `status` stays the source of truth for "is this row live/queryable at
-- all"; `is_suspended` only matters while `status = 'archived'`. See docs/products/lifecycle.md.

alter table public.products
  add column if not exists is_suspended boolean not null default false;

comment on column public.products.is_suspended is
  'True when a moderator suspended a previously-published product (stored as status=archived). '
  'False for ordinary archival. Read via lib/products/status.ts, never compared directly.';

-- Filter-support indexes for marketplace search/filter combinations (category+price, brand,
-- featured rail). idx_products_active_catalog (phase-2 migration) already covers the default
-- catalog listing; these cover the specific filter shapes lib/marketplace/search-service.ts issues.
create index if not exists idx_products_category_price
  on public.products(category_id, base_price_minor)
  where deleted_at is null and status = 'active';

create index if not exists idx_products_brand_active
  on public.products(brand_id, published_at desc)
  where deleted_at is null and status = 'active';

create index if not exists idx_products_featured
  on public.products(published_at desc)
  where deleted_at is null and status = 'active' and is_featured = true;

-- Variant option lookups (color/size/material) power lib/marketplace filters without a full
-- table scan of product_variants.options.
create index if not exists idx_product_variants_options
  on public.product_variants using gin(options)
  where deleted_at is null and is_active = true;

-- Wishlist count/list is a hot path on every product card; cover it directly.
create index if not exists idx_wishlist_items_wishlist
  on public.wishlist_items(wishlist_id, created_at desc);
