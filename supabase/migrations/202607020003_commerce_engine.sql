-- Agent 05 (Commerce): carts, checkout, coupons, order lifecycle, and inventory reservation.
-- Payments and shipping-provider integrations intentionally remain placeholders.

alter type public.order_status add value if not exists 'pending';
alter type public.order_status add value if not exists 'confirmed';
alter type public.order_status add value if not exists 'ready_for_shipment';
alter type public.order_status add value if not exists 'completed';
alter type public.order_status add value if not exists 'returned';

alter table public.orders
  add column if not exists order_group_number text,
  add column if not exists notes text,
  add column if not exists internal_notes text,
  add column if not exists cancelled_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.order_items
  add column if not exists discount_minor integer not null default 0 check (discount_minor >= 0),
  add column if not exists product_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists variant_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists seller_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  guest_token text,
  status text not null default 'active' check (status in ('active', 'converted', 'abandoned')),
  currency text not null default 'KES' check (char_length(currency) = 3),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or guest_token is not null)
);

alter table public.carts add column if not exists status text default 'active';
alter table public.carts alter column status set not null;
do $$
begin
 if not exists (select 1 from pg_constraint where conname='carts_status_check') then
  alter table public.carts add constraint carts_status_check check (status in ('active','converted','abandoned'));
 end if;
end $$;

create unique index if not exists idx_carts_active_user
  on public.carts(user_id)
  where user_id is not null and status = 'active';

create unique index if not exists idx_carts_active_guest
  on public.carts(guest_token)
  where guest_token is not null and status = 'active';

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  seller_id uuid not null references public.sellers(id) on delete restrict,
  quantity integer not null check (quantity > 0 and quantity <= 99),
  unit_price_minor integer not null check (unit_price_minor >= 0),
  currency text not null default 'KES' check (char_length(currency) = 3),
  status text not null default 'active' check (status in ('active', 'saved_for_later')),
  product_snapshot jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, product_id, variant_id)
);

create index if not exists idx_cart_items_cart_status on public.cart_items(cart_id, status, created_at desc);
create index if not exists idx_cart_items_product on public.cart_items(product_id);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('percentage', 'fixed')),
  scope text not null default 'marketplace' check (scope in ('marketplace', 'seller')),
  seller_id uuid references public.sellers(id) on delete cascade,
  value integer not null check (value > 0),
  currency text check (currency is null or char_length(currency) = 3),
  min_subtotal_minor integer not null default 0 check (min_subtotal_minor >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  used_count integer not null default 0 check (used_count >= 0),
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((scope = 'marketplace' and seller_id is null) or (scope = 'seller' and seller_id is not null))
);

create index if not exists idx_coupons_active_code on public.coupons(upper(code)) where is_active = true;
create index if not exists idx_coupons_seller on public.coupons(seller_id, is_active);

create table if not exists public.order_coupon_applications (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  coupon_id uuid references public.coupons(id) on delete set null,
  code text not null,
  discount_minor integer not null check (discount_minor >= 0),
  seller_id uuid references public.sellers(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  actor_id uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_buyer_created on public.orders(buyer_id, created_at desc);
create index if not exists idx_orders_seller_status_created on public.orders(seller_id, status, created_at desc);
create index if not exists idx_orders_group on public.orders(order_group_number);
create index if not exists idx_order_items_seller_order on public.order_items(seller_id, order_id);
create index if not exists idx_order_status_history_order on public.order_status_history(order_id, created_at desc);

create or replace function public.reserve_inventory_for_checkout(p_items jsonb)
returns table(product_id uuid, variant_id uuid, requested integer, available integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
  current_available integer;
begin
  create temporary table if not exists commerce_inventory_shortages (
    product_id uuid,
    variant_id uuid,
    requested integer,
    available integer
  ) on commit drop;
  truncate commerce_inventory_shortages;

  for item in
    select
      (value->>'productId')::uuid as product_id,
      nullif(value->>'variantId', '')::uuid as variant_id,
      (value->>'quantity')::integer as quantity
    from jsonb_array_elements(p_items)
  loop
    select
      case when ii.track_inventory then ii.quantity_available - ii.quantity_reserved else 2147483647 end
    into current_available
    from public.inventory_items ii
    where ii.product_id = item.product_id
      and ii.variant_id is not distinct from item.variant_id
    for update;

    if current_available is null or current_available < item.quantity then
      insert into commerce_inventory_shortages values (item.product_id, item.variant_id, item.quantity, coalesce(current_available, 0));
    else
      update public.inventory_items
      set quantity_reserved = quantity_reserved + item.quantity,
          updated_at = now()
      where product_id = item.product_id
        and variant_id is not distinct from item.variant_id
        and track_inventory = true;
    end if;
  end loop;

  if exists (select 1 from commerce_inventory_shortages) then
    for item in
      select
        (value->>'productId')::uuid as product_id,
        nullif(value->>'variantId', '')::uuid as variant_id,
        (value->>'quantity')::integer as quantity
      from jsonb_array_elements(p_items)
    loop
      update public.inventory_items
      set quantity_reserved = greatest(0, quantity_reserved - item.quantity),
          updated_at = now()
      where product_id = item.product_id
        and variant_id is not distinct from item.variant_id
        and track_inventory = true;
    end loop;
  end if;

  return query select * from commerce_inventory_shortages;
end;
$$;

drop trigger if exists set_carts_updated_at on public.carts;
create trigger set_carts_updated_at before update on public.carts for each row execute function public.set_updated_at();
drop trigger if exists set_cart_items_updated_at on public.cart_items;
create trigger set_cart_items_updated_at before update on public.cart_items for each row execute function public.set_updated_at();
drop trigger if exists set_coupons_updated_at on public.coupons;
create trigger set_coupons_updated_at before update on public.coupons for each row execute function public.set_updated_at();

alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.coupons enable row level security;
alter table public.order_coupon_applications enable row level security;
alter table public.order_status_history enable row level security;

drop policy if exists "buyers manage own carts" on public.carts;

create policy "buyers manage own carts" on public.carts
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "cart items follow cart ownership" on public.cart_items;

create policy "cart items follow cart ownership" on public.cart_items
  for all using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));

drop policy if exists "active coupons are readable" on public.coupons;

create policy "active coupons are readable" on public.coupons
  for select using (is_active = true or public.current_user_is_staff() or (seller_id is not null and public.current_user_can_manage_seller(seller_id)));

drop policy if exists "seller coupons managed by seller" on public.coupons;

create policy "seller coupons managed by seller" on public.coupons
  for all using (public.current_user_is_staff() or (seller_id is not null and public.current_user_can_manage_seller(seller_id)))
  with check (public.current_user_is_staff() or (seller_id is not null and public.current_user_can_manage_seller(seller_id)));

drop policy if exists "order coupons visible with order" on public.order_coupon_applications;

create policy "order coupons visible with order" on public.order_coupon_applications
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.buyer_id = auth.uid() or public.current_user_can_manage_seller(o.seller_id) or public.current_user_is_staff())
    )
  );

drop policy if exists "order history visible with order" on public.order_status_history;

create policy "order history visible with order" on public.order_status_history
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.buyer_id = auth.uid() or public.current_user_can_manage_seller(o.seller_id) or public.current_user_is_staff())
    )
  );

comment on function public.reserve_inventory_for_checkout(jsonb) is
  'Atomically reserves inventory during checkout. Returns shortages; an empty result means reservation succeeded.';
