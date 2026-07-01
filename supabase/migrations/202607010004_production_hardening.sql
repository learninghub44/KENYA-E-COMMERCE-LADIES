-- Production hardening for grants, forced RLS, schema lockdown, and function execution.

revoke create on schema public from public;
revoke create on schema public from anon;
revoke create on schema public from authenticated;

grant usage on schema public to anon, authenticated, service_role;

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

alter function public.set_updated_at()
  set search_path = pg_catalog, public;

alter function public.set_product_search_vector()
  set search_path = pg_catalog, public;

alter function public.current_user_has_role(public.app_role)
  set search_path = pg_catalog, public;

alter function public.current_user_is_staff()
  set search_path = pg_catalog, public;

alter function public.current_user_can_manage_seller(uuid)
  set search_path = pg_catalog, public;

alter function public.storage_folder_uuid(text, integer)
  set search_path = pg_catalog, public, storage;

revoke all on all tables in schema public from anon, authenticated;
revoke execute on all functions in schema public from public;
revoke execute on all functions in schema public from anon;
revoke execute on all functions in schema public from authenticated;

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
  public.faqs
to anon;

grant select on table
  public.product_catalog,
  public.seller_storefronts
to anon, authenticated;

grant insert on table public.contact_requests to anon;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select, insert, update, delete, truncate, references, trigger on all tables in schema public to service_role;

grant execute on function public.current_user_has_role(public.app_role) to anon, authenticated, service_role;
grant execute on function public.current_user_is_staff() to anon, authenticated, service_role;
grant execute on function public.current_user_can_manage_seller(uuid) to anon, authenticated, service_role;
grant execute on function public.storage_folder_uuid(text, integer) to authenticated, service_role;

alter table public.countries force row level security;
alter table public.profiles force row level security;
alter table public.user_roles force row level security;
alter table public.sellers force row level security;
alter table public.seller_members force row level security;
alter table public.kyc_verifications force row level security;
alter table public.categories force row level security;
alter table public.brands force row level security;
alter table public.products force row level security;
alter table public.product_images force row level security;
alter table public.product_variants force row level security;
alter table public.inventory_items force row level security;
alter table public.product_attributes force row level security;
alter table public.collections force row level security;
alter table public.collection_products force row level security;
alter table public.addresses force row level security;
alter table public.wishlists force row level security;
alter table public.wishlist_items force row level security;
alter table public.carts force row level security;
alter table public.cart_items force row level security;
alter table public.orders force row level security;
alter table public.order_items force row level security;
alter table public.reviews force row level security;
alter table public.conversations force row level security;
alter table public.messages force row level security;
alter table public.notifications force row level security;
alter table public.reports force row level security;
alter table public.store_followers force row level security;
alter table public.audit_logs force row level security;
alter table public.activity_logs force row level security;
alter table public.feature_flags force row level security;
alter table public.analytics_events force row level security;
alter table public.shipping_profiles force row level security;
alter table public.shipping_zones force row level security;
alter table public.coupons force row level security;
alter table public.promotions force row level security;
alter table public.banners force row level security;
alter table public.cms_pages force row level security;
alter table public.faqs force row level security;
alter table public.contact_requests force row level security;
