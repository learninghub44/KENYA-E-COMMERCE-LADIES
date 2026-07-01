-- Foundation schema for the multi-vendor marketplace.
-- Scope: database tables, constraints, indexes, triggers, RLS, views, and storage policies only.

create extension if not exists pgcrypto;
create extension if not exists citext;

create type public.app_role as enum ('buyer', 'seller', 'admin', 'moderator', 'service');
create type public.account_status as enum ('active', 'suspended', 'deleted');
create type public.seller_status as enum ('draft', 'pending_kyc', 'active', 'suspended', 'closed');
create type public.kyc_status as enum ('not_started', 'pending', 'approved', 'rejected', 'expired');
create type public.product_status as enum ('draft', 'pending_review', 'active', 'rejected', 'archived');
create type public.order_status as enum ('draft', 'pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
create type public.payment_status as enum ('unpaid', 'authorized', 'paid', 'failed', 'refunded', 'partially_refunded');
create type public.fulfillment_status as enum ('unfulfilled', 'partial', 'fulfilled', 'returned');
create type public.message_status as enum ('sent', 'delivered', 'read', 'hidden');
create type public.notification_status as enum ('unread', 'read', 'archived');
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');
create type public.discount_type as enum ('percentage', 'fixed_amount', 'free_shipping');
create type public.page_status as enum ('draft', 'published', 'archived');

create table public.countries (
  code text primary key check (char_length(code) = 2),
  name text not null,
  default_currency text not null check (char_length(default_currency) = 3),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext unique,
  display_name text,
  phone text,
  avatar_url text,
  status public.account_status not null default 'active',
  default_country_code text references public.countries(code),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  granted_by uuid references public.profiles(id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.sellers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  store_name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  banner_url text,
  status public.seller_status not null default 'draft',
  kyc_status public.kyc_status not null default 'not_started',
  country_code text references public.countries(code),
  default_currency text not null default 'KES' check (char_length(default_currency) = 3),
  support_email citext,
  support_phone text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.seller_members (
  seller_id uuid not null references public.sellers(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'manager', 'staff')),
  created_at timestamptz not null default now(),
  primary key (seller_id, user_id)
);

create table public.kyc_verifications (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  provider text not null default 'didit',
  provider_reference text,
  status public.kyc_status not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  expires_at timestamptz,
  rejection_reason text,
  metadata jsonb not null default '{}'::jsonb
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  brand_id uuid references public.brands(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  status public.product_status not null default 'draft',
  base_price_minor integer not null check (base_price_minor >= 0),
  compare_at_price_minor integer check (compare_at_price_minor is null or compare_at_price_minor >= 0),
  currency text not null default 'KES' check (char_length(currency) = 3),
  is_featured boolean not null default false,
  published_at timestamptz,
  search_vector tsvector,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (seller_id, slug)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid,
  url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null,
  title text,
  price_minor integer check (price_minor is null or price_minor >= 0),
  compare_at_price_minor integer check (compare_at_price_minor is null or compare_at_price_minor >= 0),
  currency text not null default 'KES' check (char_length(currency) = 3),
  barcode text,
  weight_grams integer check (weight_grams is null or weight_grams >= 0),
  options jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, sku)
);

alter table public.product_images
  add constraint product_images_variant_id_fkey foreign key (variant_id) references public.product_variants(id) on delete cascade;

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  quantity_available integer not null default 0 check (quantity_available >= 0),
  quantity_reserved integer not null default 0 check (quantity_reserved >= 0),
  low_stock_threshold integer not null default 0 check (low_stock_threshold >= 0),
  track_inventory boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (product_id, variant_id)
);

create table public.product_attributes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  value text not null,
  created_at timestamptz not null default now()
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.sellers(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  status public.page_status not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (seller_id, slug)
);

create table public.collection_products (
  collection_id uuid not null references public.collections(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (collection_id, product_id)
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text,
  recipient_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  region text,
  postal_code text,
  country_code text not null references public.countries(code),
  is_default_shipping boolean not null default false,
  is_default_billing boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'Default',
  is_default boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create table public.wishlist_items (
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (wishlist_id, product_id)
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  anonymous_id uuid,
  currency text not null default 'KES' check (char_length(currency) = 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((user_id is not null) or (anonymous_id is not null))
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid references public.product_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price_minor integer not null check (unit_price_minor >= 0),
  currency text not null default 'KES' check (char_length(currency) = 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  buyer_id uuid not null references public.profiles(id) on delete restrict,
  seller_id uuid not null references public.sellers(id) on delete restrict,
  status public.order_status not null default 'pending_payment',
  payment_status public.payment_status not null default 'unpaid',
  fulfillment_status public.fulfillment_status not null default 'unfulfilled',
  subtotal_minor integer not null check (subtotal_minor >= 0),
  shipping_minor integer not null default 0 check (shipping_minor >= 0),
  discount_minor integer not null default 0 check (discount_minor >= 0),
  tax_minor integer not null default 0 check (tax_minor >= 0),
  total_minor integer not null check (total_minor >= 0),
  currency text not null default 'KES' check (char_length(currency) = 3),
  shipping_address jsonb not null,
  billing_address jsonb,
  placed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  seller_id uuid not null references public.sellers(id) on delete restrict,
  product_name text not null,
  variant_title text,
  sku text,
  quantity integer not null check (quantity > 0),
  unit_price_minor integer not null check (unit_price_minor >= 0),
  total_minor integer not null check (total_minor >= 0),
  currency text not null default 'KES' check (char_length(currency) = 3),
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  seller_id uuid not null references public.sellers(id) on delete cascade,
  order_item_id uuid references public.order_items(id) on delete set null,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  status public.page_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, buyer_id, order_item_id)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.sellers(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  subject text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  status public.message_status not null default 'sent',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  status public.notification_status not null default 'unread',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  details text,
  status public.report_status not null default 'open',
  assigned_to uuid references public.profiles(id) on delete set null,
  resolution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.store_followers (
  seller_id uuid not null references public.sellers(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (seller_id, user_id)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  activity_type text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.feature_flags (
  key text primary key,
  description text,
  is_enabled boolean not null default false,
  audience jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  anonymous_id uuid,
  event_name text not null,
  entity_type text,
  entity_id uuid,
  properties jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table public.shipping_profiles (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  handling_days integer not null default 1 check (handling_days >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  shipping_profile_id uuid not null references public.shipping_profiles(id) on delete cascade,
  name text not null,
  country_codes text[] not null default '{}',
  base_rate_minor integer not null default 0 check (base_rate_minor >= 0),
  free_shipping_threshold_minor integer check (free_shipping_threshold_minor is null or free_shipping_threshold_minor >= 0),
  currency text not null default 'KES' check (char_length(currency) = 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.sellers(id) on delete cascade,
  code citext not null unique,
  discount_type public.discount_type not null,
  discount_value integer not null check (discount_value >= 0),
  currency text check (currency is null or char_length(currency) = 3),
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  used_count integer not null default 0 check (used_count >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.sellers(id) on delete cascade,
  name text not null,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  rules jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  link_url text,
  placement text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  status public.page_status not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  body text not null,
  status public.page_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  category text,
  question text not null,
  answer text not null,
  status public.page_status not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email citext not null,
  subject text not null,
  message text not null,
  status public.report_status not null default 'open',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_product_search_vector()
returns trigger
language plpgsql
as $$
begin
  new.search_vector = to_tsvector('simple', coalesce(new.name, '') || ' ' || coalesce(new.description, ''));
  return new;
end;
$$;

create or replace function public.current_user_has_role(required_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role = required_role
  );
$$;

create or replace function public.current_user_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_has_role('admin') or public.current_user_has_role('moderator');
$$;

create or replace function public.current_user_can_manage_seller(seller_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.sellers
    where id = seller_uuid
      and owner_id = auth.uid()
  ) or exists (
    select 1 from public.seller_members
    where seller_id = seller_uuid
      and user_id = auth.uid()
  ) or public.current_user_is_staff();
$$;

create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_sellers_updated_at before update on public.sellers for each row execute function public.set_updated_at();
create trigger set_categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger set_brands_updated_at before update on public.brands for each row execute function public.set_updated_at();
create trigger set_products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger set_product_variants_updated_at before update on public.product_variants for each row execute function public.set_updated_at();
create trigger set_collections_updated_at before update on public.collections for each row execute function public.set_updated_at();
create trigger set_addresses_updated_at before update on public.addresses for each row execute function public.set_updated_at();
create trigger set_wishlists_updated_at before update on public.wishlists for each row execute function public.set_updated_at();
create trigger set_carts_updated_at before update on public.carts for each row execute function public.set_updated_at();
create trigger set_cart_items_updated_at before update on public.cart_items for each row execute function public.set_updated_at();
create trigger set_orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger set_reviews_updated_at before update on public.reviews for each row execute function public.set_updated_at();
create trigger set_conversations_updated_at before update on public.conversations for each row execute function public.set_updated_at();
create trigger set_reports_updated_at before update on public.reports for each row execute function public.set_updated_at();
create trigger set_feature_flags_updated_at before update on public.feature_flags for each row execute function public.set_updated_at();
create trigger set_shipping_profiles_updated_at before update on public.shipping_profiles for each row execute function public.set_updated_at();
create trigger set_shipping_zones_updated_at before update on public.shipping_zones for each row execute function public.set_updated_at();
create trigger set_coupons_updated_at before update on public.coupons for each row execute function public.set_updated_at();
create trigger set_promotions_updated_at before update on public.promotions for each row execute function public.set_updated_at();
create trigger set_banners_updated_at before update on public.banners for each row execute function public.set_updated_at();
create trigger set_cms_pages_updated_at before update on public.cms_pages for each row execute function public.set_updated_at();
create trigger set_faqs_updated_at before update on public.faqs for each row execute function public.set_updated_at();
create trigger set_contact_requests_updated_at before update on public.contact_requests for each row execute function public.set_updated_at();
create trigger set_products_search_vector before insert or update of name, description on public.products for each row execute function public.set_product_search_vector();

create index idx_profiles_status on public.profiles(status);
create index idx_user_roles_role on public.user_roles(role);
create index idx_sellers_owner_status on public.sellers(owner_id, status);
create index idx_seller_members_user_id on public.seller_members(user_id);
create index idx_kyc_verifications_seller_status on public.kyc_verifications(seller_id, status);
create index idx_categories_parent_sort on public.categories(parent_id, sort_order);
create index idx_products_seller_status_created on public.products(seller_id, status, created_at desc);
create index idx_products_category_status_created on public.products(category_id, status, created_at desc);
create index idx_products_brand_status on public.products(brand_id, status);
create index idx_products_search_vector on public.products using gin(search_vector);
create index idx_product_images_product_sort on public.product_images(product_id, sort_order);
create index idx_product_variants_product_active on public.product_variants(product_id, is_active);
create index idx_inventory_variant on public.inventory_items(variant_id);
create index idx_product_attributes_product_name on public.product_attributes(product_id, name);
create index idx_collection_products_product on public.collection_products(product_id);
create index idx_addresses_user_id on public.addresses(user_id);
create index idx_wishlist_items_product on public.wishlist_items(product_id);
create index idx_carts_user_id on public.carts(user_id);
create index idx_cart_items_cart_id on public.cart_items(cart_id);
create index idx_orders_buyer_created on public.orders(buyer_id, created_at desc);
create index idx_orders_seller_status_created on public.orders(seller_id, status, created_at desc);
create index idx_order_items_order_id on public.order_items(order_id);
create index idx_order_items_product_id on public.order_items(product_id);
create index idx_reviews_product_status_created on public.reviews(product_id, status, created_at desc);
create index idx_conversations_buyer_updated on public.conversations(buyer_id, updated_at desc);
create index idx_conversations_seller_updated on public.conversations(seller_id, updated_at desc);
create index idx_messages_conversation_created on public.messages(conversation_id, created_at desc);
create index idx_notifications_user_status_created on public.notifications(user_id, status, created_at desc);
create index idx_reports_status_created on public.reports(status, created_at desc);
create index idx_store_followers_user_id on public.store_followers(user_id);
create index idx_audit_logs_entity on public.audit_logs(entity_type, entity_id, created_at desc);
create index idx_activity_logs_user_created on public.activity_logs(user_id, created_at desc);
create index idx_analytics_events_name_time on public.analytics_events(event_name, occurred_at desc);
create index idx_shipping_profiles_seller on public.shipping_profiles(seller_id);
create index idx_shipping_zones_profile on public.shipping_zones(shipping_profile_id);
create index idx_coupons_seller_active on public.coupons(seller_id, is_active);
create index idx_promotions_seller_active on public.promotions(seller_id, is_active);
create index idx_banners_placement_status on public.banners(placement, status, sort_order);
create index idx_cms_pages_status on public.cms_pages(status);
create index idx_faqs_status_sort on public.faqs(status, sort_order);
create index idx_contact_requests_status_created on public.contact_requests(status, created_at desc);

create view public.product_catalog
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
where p.status = 'active' and s.status = 'active';

create view public.seller_storefronts
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
where status = 'active';

alter table public.countries enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.sellers enable row level security;
alter table public.seller_members enable row level security;
alter table public.kyc_verifications enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory_items enable row level security;
alter table public.product_attributes enable row level security;
alter table public.collections enable row level security;
alter table public.collection_products enable row level security;
alter table public.addresses enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.store_followers enable row level security;
alter table public.audit_logs enable row level security;
alter table public.activity_logs enable row level security;
alter table public.feature_flags enable row level security;
alter table public.analytics_events enable row level security;
alter table public.shipping_profiles enable row level security;
alter table public.shipping_zones enable row level security;
alter table public.coupons enable row level security;
alter table public.promotions enable row level security;
alter table public.banners enable row level security;
alter table public.cms_pages enable row level security;
alter table public.faqs enable row level security;
alter table public.contact_requests enable row level security;

create policy "countries are publicly readable" on public.countries for select using (is_active or public.current_user_is_staff());
create policy "countries are staff managed" on public.countries for all using (public.current_user_is_staff()) with check (public.current_user_is_staff());

create policy "profiles are self readable" on public.profiles for select using (id = auth.uid() or public.current_user_is_staff());
create policy "profiles are self updatable" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles are staff managed" on public.profiles for all using (public.current_user_is_staff()) with check (public.current_user_is_staff());

create policy "roles are self readable" on public.user_roles for select using (user_id = auth.uid() or public.current_user_is_staff());
create policy "roles are staff managed" on public.user_roles for all using (public.current_user_is_staff()) with check (public.current_user_is_staff());

create policy "active sellers are public" on public.sellers for select using (status = 'active' or public.current_user_can_manage_seller(id));
create policy "seller owners can create stores" on public.sellers for insert with check (owner_id = auth.uid());
create policy "seller members manage stores" on public.sellers for update using (public.current_user_can_manage_seller(id)) with check (public.current_user_can_manage_seller(id));

create policy "seller members are visible to members" on public.seller_members for select using (public.current_user_can_manage_seller(seller_id));
create policy "seller members are seller managed" on public.seller_members for all using (public.current_user_can_manage_seller(seller_id)) with check (public.current_user_can_manage_seller(seller_id));

create policy "kyc visible to seller and staff" on public.kyc_verifications for select using (public.current_user_can_manage_seller(seller_id));
create policy "kyc insertable by seller" on public.kyc_verifications for insert with check (public.current_user_can_manage_seller(seller_id));
create policy "kyc staff managed" on public.kyc_verifications for update using (public.current_user_is_staff()) with check (public.current_user_is_staff());

create policy "categories public read" on public.categories for select using (is_active or public.current_user_is_staff());
create policy "categories staff managed" on public.categories for all using (public.current_user_is_staff()) with check (public.current_user_is_staff());

create policy "brands public read" on public.brands for select using (true);
create policy "brands staff managed" on public.brands for all using (public.current_user_is_staff()) with check (public.current_user_is_staff());

create policy "products public active read" on public.products for select using (status = 'active' or public.current_user_can_manage_seller(seller_id));
create policy "products seller managed" on public.products for all using (public.current_user_can_manage_seller(seller_id)) with check (public.current_user_can_manage_seller(seller_id));

create policy "product images public active read" on public.product_images for select using (exists (select 1 from public.products p where p.id = product_id and (p.status = 'active' or public.current_user_can_manage_seller(p.seller_id))));
create policy "product images seller managed" on public.product_images for all using (exists (select 1 from public.products p where p.id = product_id and public.current_user_can_manage_seller(p.seller_id))) with check (exists (select 1 from public.products p where p.id = product_id and public.current_user_can_manage_seller(p.seller_id)));

create policy "product variants public active read" on public.product_variants for select using (exists (select 1 from public.products p where p.id = product_id and (p.status = 'active' or public.current_user_can_manage_seller(p.seller_id))));
create policy "product variants seller managed" on public.product_variants for all using (exists (select 1 from public.products p where p.id = product_id and public.current_user_can_manage_seller(p.seller_id))) with check (exists (select 1 from public.products p where p.id = product_id and public.current_user_can_manage_seller(p.seller_id)));

create policy "inventory seller read" on public.inventory_items for select using (exists (select 1 from public.products p where p.id = product_id and public.current_user_can_manage_seller(p.seller_id)));
create policy "inventory seller managed" on public.inventory_items for all using (exists (select 1 from public.products p where p.id = product_id and public.current_user_can_manage_seller(p.seller_id))) with check (exists (select 1 from public.products p where p.id = product_id and public.current_user_can_manage_seller(p.seller_id)));

create policy "attributes public active read" on public.product_attributes for select using (exists (select 1 from public.products p where p.id = product_id and (p.status = 'active' or public.current_user_can_manage_seller(p.seller_id))));
create policy "attributes seller managed" on public.product_attributes for all using (exists (select 1 from public.products p where p.id = product_id and public.current_user_can_manage_seller(p.seller_id))) with check (exists (select 1 from public.products p where p.id = product_id and public.current_user_can_manage_seller(p.seller_id)));

create policy "collections public published read" on public.collections for select using (status = 'published' or (seller_id is not null and public.current_user_can_manage_seller(seller_id)) or public.current_user_is_staff());
create policy "collections seller managed" on public.collections for all using (seller_id is not null and public.current_user_can_manage_seller(seller_id)) with check (seller_id is not null and public.current_user_can_manage_seller(seller_id));
create policy "collections staff managed" on public.collections for all using (public.current_user_is_staff()) with check (public.current_user_is_staff());

create policy "collection products public read" on public.collection_products for select using (exists (select 1 from public.collections c where c.id = collection_id and (c.status = 'published' or public.current_user_is_staff() or (c.seller_id is not null and public.current_user_can_manage_seller(c.seller_id)))));
create policy "collection products managed" on public.collection_products for all using (exists (select 1 from public.collections c where c.id = collection_id and (public.current_user_is_staff() or (c.seller_id is not null and public.current_user_can_manage_seller(c.seller_id))))) with check (exists (select 1 from public.collections c where c.id = collection_id and (public.current_user_is_staff() or (c.seller_id is not null and public.current_user_can_manage_seller(c.seller_id)))));

create policy "addresses user managed" on public.addresses for all using (user_id = auth.uid() or public.current_user_is_staff()) with check (user_id = auth.uid() or public.current_user_is_staff());
create policy "wishlists user managed" on public.wishlists for all using (user_id = auth.uid() or public.current_user_is_staff()) with check (user_id = auth.uid() or public.current_user_is_staff());
create policy "wishlist items user managed" on public.wishlist_items for all using (exists (select 1 from public.wishlists w where w.id = wishlist_id and (w.user_id = auth.uid() or public.current_user_is_staff()))) with check (exists (select 1 from public.wishlists w where w.id = wishlist_id and (w.user_id = auth.uid() or public.current_user_is_staff())));
create policy "carts user managed" on public.carts for all using (user_id = auth.uid() or public.current_user_is_staff()) with check (user_id = auth.uid() or public.current_user_is_staff());
create policy "cart items user managed" on public.cart_items for all using (exists (select 1 from public.carts c where c.id = cart_id and (c.user_id = auth.uid() or public.current_user_is_staff()))) with check (exists (select 1 from public.carts c where c.id = cart_id and (c.user_id = auth.uid() or public.current_user_is_staff())));

create policy "orders buyer seller staff read" on public.orders for select using (buyer_id = auth.uid() or public.current_user_can_manage_seller(seller_id));
create policy "orders buyer insert" on public.orders for insert with check (buyer_id = auth.uid());
create policy "orders seller staff update" on public.orders for update using (public.current_user_can_manage_seller(seller_id)) with check (public.current_user_can_manage_seller(seller_id));
create policy "order items participant read" on public.order_items for select using (exists (select 1 from public.orders o where o.id = order_id and (o.buyer_id = auth.uid() or public.current_user_can_manage_seller(o.seller_id))));
create policy "order items seller staff managed" on public.order_items for all using (public.current_user_can_manage_seller(seller_id)) with check (public.current_user_can_manage_seller(seller_id));

create policy "reviews public published read" on public.reviews for select using (status = 'published' or buyer_id = auth.uid() or public.current_user_can_manage_seller(seller_id));
create policy "reviews buyer insert" on public.reviews for insert with check (buyer_id = auth.uid());
create policy "reviews buyer update draft" on public.reviews for update using (buyer_id = auth.uid() and status = 'draft') with check (buyer_id = auth.uid());
create policy "reviews staff moderate" on public.reviews for all using (public.current_user_is_staff()) with check (public.current_user_is_staff());

create policy "conversations participant read" on public.conversations for select using (buyer_id = auth.uid() or public.current_user_can_manage_seller(seller_id));
create policy "conversations buyer insert" on public.conversations for insert with check (buyer_id = auth.uid());
create policy "conversations participant update" on public.conversations for update using (buyer_id = auth.uid() or public.current_user_can_manage_seller(seller_id)) with check (buyer_id = auth.uid() or public.current_user_can_manage_seller(seller_id));
create policy "messages participant read" on public.messages for select using (exists (select 1 from public.conversations c where c.id = conversation_id and (c.buyer_id = auth.uid() or public.current_user_can_manage_seller(c.seller_id))));
create policy "messages participant insert" on public.messages for insert with check (sender_id = auth.uid() and exists (select 1 from public.conversations c where c.id = conversation_id and (c.buyer_id = auth.uid() or public.current_user_can_manage_seller(c.seller_id))));
create policy "messages staff moderate" on public.messages for update using (public.current_user_is_staff()) with check (public.current_user_is_staff());

create policy "notifications user managed" on public.notifications for all using (user_id = auth.uid() or public.current_user_is_staff()) with check (user_id = auth.uid() or public.current_user_is_staff());
create policy "reports reporter staff read" on public.reports for select using (reporter_id = auth.uid() or public.current_user_is_staff());
create policy "reports authenticated insert" on public.reports for insert with check (reporter_id = auth.uid());
create policy "reports staff update" on public.reports for update using (public.current_user_is_staff()) with check (public.current_user_is_staff());
create policy "store followers user managed" on public.store_followers for all using (user_id = auth.uid() or public.current_user_is_staff()) with check (user_id = auth.uid() or public.current_user_is_staff());

create policy "audit logs staff read" on public.audit_logs for select using (public.current_user_is_staff());
create policy "audit logs staff insert" on public.audit_logs for insert with check (public.current_user_is_staff());
create policy "activity logs owner staff read" on public.activity_logs for select using (user_id = auth.uid() or public.current_user_is_staff());
create policy "activity logs owner insert" on public.activity_logs for insert with check (user_id = auth.uid() or public.current_user_is_staff());
create policy "feature flags readable" on public.feature_flags for select using (true);
create policy "feature flags staff managed" on public.feature_flags for all using (public.current_user_is_staff()) with check (public.current_user_is_staff());
create policy "analytics events owner staff read" on public.analytics_events for select using (user_id = auth.uid() or public.current_user_is_staff());
create policy "analytics events authenticated insert" on public.analytics_events for insert with check (user_id = auth.uid() or user_id is null);

create policy "shipping profiles public seller read" on public.shipping_profiles for select using (public.current_user_is_staff() or public.current_user_can_manage_seller(seller_id) or exists (select 1 from public.sellers s where s.id = seller_id and s.status = 'active'));
create policy "shipping profiles seller managed" on public.shipping_profiles for all using (public.current_user_can_manage_seller(seller_id)) with check (public.current_user_can_manage_seller(seller_id));
create policy "shipping zones public seller read" on public.shipping_zones for select using (exists (select 1 from public.shipping_profiles sp join public.sellers s on s.id = sp.seller_id where sp.id = shipping_profile_id and (s.status = 'active' or public.current_user_can_manage_seller(s.id))));
create policy "shipping zones seller managed" on public.shipping_zones for all using (exists (select 1 from public.shipping_profiles sp where sp.id = shipping_profile_id and public.current_user_can_manage_seller(sp.seller_id))) with check (exists (select 1 from public.shipping_profiles sp where sp.id = shipping_profile_id and public.current_user_can_manage_seller(sp.seller_id)));

create policy "coupons public active read" on public.coupons for select using (is_active or public.current_user_is_staff() or (seller_id is not null and public.current_user_can_manage_seller(seller_id)));
create policy "coupons seller staff managed" on public.coupons for all using (public.current_user_is_staff() or (seller_id is not null and public.current_user_can_manage_seller(seller_id))) with check (public.current_user_is_staff() or (seller_id is not null and public.current_user_can_manage_seller(seller_id)));
create policy "promotions public active read" on public.promotions for select using (is_active or public.current_user_is_staff() or (seller_id is not null and public.current_user_can_manage_seller(seller_id)));
create policy "promotions seller staff managed" on public.promotions for all using (public.current_user_is_staff() or (seller_id is not null and public.current_user_can_manage_seller(seller_id))) with check (public.current_user_is_staff() or (seller_id is not null and public.current_user_can_manage_seller(seller_id)));

create policy "banners public published read" on public.banners for select using (status = 'published' or public.current_user_is_staff());
create policy "banners staff managed" on public.banners for all using (public.current_user_is_staff()) with check (public.current_user_is_staff());
create policy "cms pages public published read" on public.cms_pages for select using (status = 'published' or public.current_user_is_staff());
create policy "cms pages staff managed" on public.cms_pages for all using (public.current_user_is_staff()) with check (public.current_user_is_staff());
create policy "faqs public published read" on public.faqs for select using (status = 'published' or public.current_user_is_staff());
create policy "faqs staff managed" on public.faqs for all using (public.current_user_is_staff()) with check (public.current_user_is_staff());
create policy "contact requests submitter staff read" on public.contact_requests for select using (user_id = auth.uid() or public.current_user_is_staff());
create policy "contact requests public insert" on public.contact_requests for insert with check (true);
create policy "contact requests staff update" on public.contact_requests for update using (public.current_user_is_staff()) with check (public.current_user_is_staff());

insert into public.countries (code, name, default_currency) values
  ('KE', 'Kenya', 'KES'),
  ('UG', 'Uganda', 'UGX'),
  ('TZ', 'Tanzania', 'TZS'),
  ('RW', 'Rwanda', 'RWF')
on conflict (code) do nothing;

do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values
      ('product-images', 'product-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
      ('seller-assets', 'seller-assets', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
      ('private-documents', 'private-documents', false, 20971520, array['application/pdf', 'image/jpeg', 'image/png'])
    on conflict (id) do nothing;

    execute 'create policy "public product images readable" on storage.objects for select using (bucket_id = ''product-images'')';
    execute 'create policy "public seller assets readable" on storage.objects for select using (bucket_id = ''seller-assets'')';
    execute 'create policy "authenticated users upload product images" on storage.objects for insert with check (bucket_id = ''product-images'' and auth.role() = ''authenticated'')';
    execute 'create policy "authenticated users upload seller assets" on storage.objects for insert with check (bucket_id = ''seller-assets'' and auth.role() = ''authenticated'')';
    execute 'create policy "private documents staff readable" on storage.objects for select using (bucket_id = ''private-documents'' and public.current_user_is_staff())';
    execute 'create policy "private documents authenticated upload" on storage.objects for insert with check (bucket_id = ''private-documents'' and auth.role() = ''authenticated'')';
  end if;
exception
  when duplicate_object then null;
end $$;
