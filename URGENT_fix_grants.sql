-- ============================================================
-- URGENT FIX: restore Postgres-level grants that RLS policies
-- assume exist. Run this NOW against your live Supabase project
-- via the SQL Editor (Dashboard > SQL Editor > New query).
--
-- Root cause: cleanup_database.sql + production_schema.sql only
-- restore schema-level USAGE/CREATE and 45 FORCE RLS policies.
-- RLS policies are meaningless without the underlying Postgres
-- GRANT - a role with zero table privileges gets
-- "permission denied for table X" on every query regardless of
-- what the RLS policy says. This is why the entire site (except
-- static content like the footer) is broken right now.
-- ============================================================

-- 1. Custom enum/domain types must be usable by API roles, or any
--    column using them becomes unreadable.
do $$
declare
  type_record record;
begin
  for type_record in
    select n.nspname, t.typname
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typtype in ('d', 'e')
  loop
    execute format(
      'grant usage on type %I.%I to anon, authenticated, service_role',
      type_record.nspname,
      type_record.typname
    );
  end loop;
end $$;

-- 2. Broad catch-all grants for authenticated/service_role.
--    RLS remains the real access-control layer for `authenticated`;
--    this just restores the base privilege RLS policies assume exists.
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select, insert, update, delete, truncate, references, trigger on all tables in schema public to service_role;

-- 3. Explicit anon SELECT grants - only tables/views with intentionally
--    public-read RLS policies. Combined list from production_hardening.sql
--    + fix_missing_table_grants.sql, covering everything created since.
grant select on table
  public.countries,
  public.sellers,
  public.categories,
  public.brands,
  public.products,
  public.product_images,
  public.product_variants,
  public.product_attributes,
  public.collections,
  public.collection_products,
  public.reviews,
  public.feature_flags,
  public.shipping_profiles,
  public.shipping_zones,
  public.coupons,
  public.promotions,
  public.banners,
  public.cms_pages,
  public.faqs,
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
to anon;

grant select on table
  public.product_catalog,
  public.seller_storefronts
to anon, authenticated;

grant insert on table public.contact_requests to anon;

-- 4. RLS-helper functions must be executable, or every policy that
--    calls them fails closed for anon/authenticated.
grant execute on function public.current_user_has_role(public.app_role) to anon, authenticated, service_role;
grant execute on function public.current_user_is_staff() to anon, authenticated, service_role;
grant execute on function public.current_user_can_manage_seller(uuid) to anon, authenticated, service_role;
grant execute on function public.storage_folder_uuid(text, integer) to authenticated, service_role;

-- 5. Any other public functions the app calls via RPC (search ranking,
--    seller analytics, etc.) - grant execute broadly for authenticated,
--    narrower for anon since most RPCs shouldn't be anon-callable.
grant execute on all functions in schema public to authenticated, service_role;

select 'Grants restored. Reload the site - it should work now.' as status;
