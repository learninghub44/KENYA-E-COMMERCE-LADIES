-- Fix: tables/views created in migrations 202607020001 through 202607020014 were never
-- granted to `anon` / `authenticated`, because `202607010004_production_hardening.sql` revoked
-- all privileges on public schema tables and re-granted a fixed, explicit list. That grant is a
-- point-in-time snapshot -- it does not apply to tables created afterwards. Every table added
-- since (product_search_documents, product_reviews, coupons's readable policy, etc.) has RLS
-- policies that assume a role can read/write, but the role was never given the underlying
-- Postgres GRANT, so every query fails with "permission denied for table X" regardless of RLS.
--
-- Root cause seen in production: storefront home page queries `product_search_documents` as
-- `anon` and fails with `permission denied for table product_search_documents`.
--
-- Fix: (1) re-run the `authenticated`/`service_role` catch-all grants so they cover every table
-- and view that exists now, and (2) explicitly grant `anon` SELECT on every table/view whose RLS
-- policy is intentionally public-read ("everyone reads...", "published ... public read", etc.),
-- mirroring the explicit anon list already established in production_hardening.sql.
--
-- IMPORTANT for future migrations: RLS policies alone are NOT sufficient. Any new table that
-- should be reachable by `anon` or `authenticated` must also get an explicit GRANT here (or in
-- its own migration) -- creating a table and enabling RLS does not grant any role access to it.

-- Re-apply the broad catch-all grants so every table/view created after the original hardening
-- migration (analytics, messaging, reviews, search, platform_* tables, etc.) is covered.
-- RLS remains the actual access-control layer for `authenticated`; this just restores the
-- Postgres-level privilege the RLS policies assume exists.
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select, insert, update, delete, truncate, references, trigger on all tables in schema public to service_role;

-- Explicit `anon` SELECT grants for tables/views with intentionally public-read RLS policies.
-- Keep this list in sync with `production_hardening.sql`'s original anon grant block.
grant select on table
  public.coupons,
  public.notification_categories,
  public.admin_broadcasts,
  public.product_reviews,
  public.seller_reviews,
  public.review_media,
  public.rating_summaries,
  public.product_search_documents,
  public.popular_search_terms,
  public.published_product_reviews,
  public.published_seller_reviews,
  public.search_product_catalog
to anon, authenticated;
