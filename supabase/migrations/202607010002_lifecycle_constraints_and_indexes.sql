-- Phase 2 hardening for lifecycle state, data quality, and high-volume access paths.

alter table public.profiles
  add column if not exists deleted_at timestamptz;

alter table public.sellers
  add column if not exists deleted_at timestamptz;

alter table public.products
  add column if not exists deleted_at timestamptz;

alter table public.product_variants
  add column if not exists deleted_at timestamptz;

alter table public.collections
  add column if not exists deleted_at timestamptz;

alter table public.addresses
  add column if not exists deleted_at timestamptz;

alter table public.wishlists
  add column if not exists deleted_at timestamptz;

alter table public.carts
  add column if not exists deleted_at timestamptz;

alter table public.coupons
  add column if not exists deleted_at timestamptz;

alter table public.promotions
  add column if not exists deleted_at timestamptz;

alter table public.banners
  add column if not exists deleted_at timestamptz;

alter table public.cms_pages
  add column if not exists deleted_at timestamptz;

alter table public.faqs
  add column if not exists deleted_at timestamptz;

alter table public.contact_requests
  add column if not exists deleted_at timestamptz;

drop policy if exists "active sellers are public" on public.sellers;
create policy "active sellers are public" on public.sellers
  for select
  using (deleted_at is null and status = 'active' or public.current_user_can_manage_seller(id));

drop policy if exists "products public active read" on public.products;
create policy "products public active read" on public.products
  for select
  using (deleted_at is null and status = 'active' or public.current_user_can_manage_seller(seller_id));

drop policy if exists "product images public active read" on public.product_images;
create policy "product images public active read" on public.product_images
  for select
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_id
        and (p.deleted_at is null and p.status = 'active' or public.current_user_can_manage_seller(p.seller_id))
    )
  );

drop policy if exists "product variants public active read" on public.product_variants;
create policy "product variants public active read" on public.product_variants
  for select
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_id
        and (p.deleted_at is null and p.status = 'active' or public.current_user_can_manage_seller(p.seller_id))
    )
  );

drop policy if exists "attributes public active read" on public.product_attributes;
create policy "attributes public active read" on public.product_attributes
  for select
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_id
        and (p.deleted_at is null and p.status = 'active' or public.current_user_can_manage_seller(p.seller_id))
    )
  );

drop policy if exists "collections public published read" on public.collections;
create policy "collections public published read" on public.collections
  for select
  using (
    deleted_at is null and status = 'published'
    or (seller_id is not null and public.current_user_can_manage_seller(seller_id))
    or public.current_user_is_staff()
  );

drop policy if exists "shipping profiles public seller read" on public.shipping_profiles;
create policy "shipping profiles public seller read" on public.shipping_profiles
  for select
  using (
    public.current_user_is_staff()
    or public.current_user_can_manage_seller(seller_id)
    or exists (
      select 1
      from public.sellers s
      where s.id = seller_id
        and s.deleted_at is null
        and s.status = 'active'
    )
  );

drop policy if exists "shipping zones public seller read" on public.shipping_zones;
create policy "shipping zones public seller read" on public.shipping_zones
  for select
  using (
    exists (
      select 1
      from public.shipping_profiles sp
      join public.sellers s on s.id = sp.seller_id
      where sp.id = shipping_profile_id
        and (
          s.deleted_at is null and s.status = 'active'
          or public.current_user_can_manage_seller(s.id)
        )
    )
  );

drop policy if exists "coupons public active read" on public.coupons;
create policy "coupons public active read" on public.coupons
  for select
  using (
    deleted_at is null and is_active
    or public.current_user_is_staff()
    or (seller_id is not null and public.current_user_can_manage_seller(seller_id))
  );

drop policy if exists "promotions public active read" on public.promotions;
create policy "promotions public active read" on public.promotions
  for select
  using (
    deleted_at is null and is_active
    or public.current_user_is_staff()
    or (seller_id is not null and public.current_user_can_manage_seller(seller_id))
  );

drop policy if exists "banners public published read" on public.banners;
create policy "banners public published read" on public.banners
  for select
  using (deleted_at is null and status = 'published' or public.current_user_is_staff());

drop policy if exists "cms pages public published read" on public.cms_pages;
create policy "cms pages public published read" on public.cms_pages
  for select
  using (deleted_at is null and status = 'published' or public.current_user_is_staff());

drop policy if exists "faqs public published read" on public.faqs;
create policy "faqs public published read" on public.faqs
  for select
  using (deleted_at is null and status = 'published' or public.current_user_is_staff());

alter table public.products
  add constraint products_compare_at_price_not_below_base
  check (compare_at_price_minor is null or compare_at_price_minor >= base_price_minor) not valid;

alter table public.product_variants
  add constraint product_variants_compare_at_price_not_below_price
  check (price_minor is null or compare_at_price_minor is null or compare_at_price_minor >= price_minor) not valid;

alter table public.orders
  add constraint orders_total_matches_components
  check (total_minor = subtotal_minor + shipping_minor + tax_minor - discount_minor) not valid;

alter table public.order_items
  add constraint order_items_total_matches_quantity
  check (total_minor = quantity * unit_price_minor) not valid;

alter table public.coupons
  add constraint coupons_percentage_value_range
  check (discount_type <> 'percentage' or discount_value between 1 and 100) not valid;

alter table public.coupons
  add constraint coupons_fixed_amount_requires_currency
  check (discount_type <> 'fixed_amount' or currency is not null) not valid;

alter table public.collections
  add constraint collections_time_window_valid
  check (starts_at is null or ends_at is null or starts_at < ends_at) not valid;

alter table public.coupons
  add constraint coupons_time_window_valid
  check (starts_at is null or ends_at is null or starts_at < ends_at) not valid;

alter table public.promotions
  add constraint promotions_time_window_valid
  check (starts_at is null or ends_at is null or starts_at < ends_at) not valid;

alter table public.banners
  add constraint banners_time_window_valid
  check (starts_at is null or ends_at is null or starts_at < ends_at) not valid;

create index if not exists idx_profiles_active_status
  on public.profiles(status, created_at desc)
  where deleted_at is null;

create index if not exists idx_sellers_active_slug
  on public.sellers(slug)
  where deleted_at is null and status = 'active';

create index if not exists idx_products_active_catalog
  on public.products(status, published_at desc, created_at desc)
  where deleted_at is null;

create index if not exists idx_products_seller_active_pagination
  on public.products(seller_id, created_at desc, id)
  where deleted_at is null;

create index if not exists idx_orders_buyer_status_pagination
  on public.orders(buyer_id, status, created_at desc, id);

create index if not exists idx_orders_seller_payment_fulfillment
  on public.orders(seller_id, payment_status, fulfillment_status, created_at desc);

create index if not exists idx_messages_conversation_seek
  on public.messages(conversation_id, created_at desc, id);

create index if not exists idx_notifications_unread
  on public.notifications(user_id, created_at desc)
  where status = 'unread';

create index if not exists idx_analytics_events_time
  on public.analytics_events(occurred_at desc, id);

create index if not exists idx_audit_logs_actor_time
  on public.audit_logs(actor_id, created_at desc)
  where actor_id is not null;

create index if not exists idx_cms_pages_published_slug
  on public.cms_pages(slug)
  where status = 'published' and deleted_at is null;

create or replace view public.product_catalog
with (security_invoker = true) as
select
  p.id,
  p.seller_id,
  s.store_name,
  s.slug as seller_slug,
  p.category_id,
  c.name as category_name,
  p.brand_id,
  b.name as brand_name,
  p.name,
  p.slug,
  p.description,
  p.base_price_minor,
  p.compare_at_price_minor,
  p.currency,
  p.is_featured,
  p.published_at,
  p.created_at
from public.products p
join public.sellers s on s.id = p.seller_id
left join public.categories c on c.id = p.category_id
left join public.brands b on b.id = p.brand_id
where p.deleted_at is null
  and s.deleted_at is null
  and p.status = 'active'
  and s.status = 'active';

create or replace view public.seller_storefronts
with (security_invoker = true) as
select
  id,
  store_name,
  slug,
  description,
  logo_url,
  banner_url,
  country_code,
  default_currency,
  created_at
from public.sellers
where deleted_at is null
  and status = 'active';

alter table public.products validate constraint products_compare_at_price_not_below_base;
alter table public.product_variants validate constraint product_variants_compare_at_price_not_below_price;
alter table public.orders validate constraint orders_total_matches_components;
alter table public.order_items validate constraint order_items_total_matches_quantity;
alter table public.coupons validate constraint coupons_percentage_value_range;
alter table public.coupons validate constraint coupons_fixed_amount_requires_currency;
alter table public.collections validate constraint collections_time_window_valid;
alter table public.coupons validate constraint coupons_time_window_valid;
alter table public.promotions validate constraint promotions_time_window_valid;
alter table public.banners validate constraint banners_time_window_valid;
