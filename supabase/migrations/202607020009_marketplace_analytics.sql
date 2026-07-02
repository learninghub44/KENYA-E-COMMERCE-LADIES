-- Agent 11B Part 1: Marketplace analytics for administrator dashboards.
-- Idempotent and safe to rerun on existing Supabase databases.

create table if not exists public.marketplace_daily_metrics (
  metric_date date primary key,
  currency text not null default 'KES',
  gmv_minor bigint not null default 0,
  marketplace_revenue_minor bigint not null default 0,
  commission_revenue_minor bigint not null default 0,
  seller_revenue_minor bigint not null default 0,
  total_orders integer not null default 0,
  completed_orders integer not null default 0,
  pending_orders integer not null default 0,
  processing_orders integer not null default 0,
  cancelled_orders integer not null default 0,
  refunded_orders integer not null default 0,
  active_buyers integer not null default 0,
  new_buyers integer not null default 0,
  returning_buyers integer not null default 0,
  new_sellers integer not null default 0,
  new_products integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marketplace_daily_metrics add column if not exists currency text not null default 'KES';
alter table public.marketplace_daily_metrics add column if not exists gmv_minor bigint not null default 0;
alter table public.marketplace_daily_metrics add column if not exists marketplace_revenue_minor bigint not null default 0;
alter table public.marketplace_daily_metrics add column if not exists commission_revenue_minor bigint not null default 0;
alter table public.marketplace_daily_metrics add column if not exists seller_revenue_minor bigint not null default 0;
alter table public.marketplace_daily_metrics add column if not exists total_orders integer not null default 0;
alter table public.marketplace_daily_metrics add column if not exists completed_orders integer not null default 0;
alter table public.marketplace_daily_metrics add column if not exists pending_orders integer not null default 0;
alter table public.marketplace_daily_metrics add column if not exists processing_orders integer not null default 0;
alter table public.marketplace_daily_metrics add column if not exists cancelled_orders integer not null default 0;
alter table public.marketplace_daily_metrics add column if not exists refunded_orders integer not null default 0;
alter table public.marketplace_daily_metrics add column if not exists active_buyers integer not null default 0;
alter table public.marketplace_daily_metrics add column if not exists new_buyers integer not null default 0;
alter table public.marketplace_daily_metrics add column if not exists returning_buyers integer not null default 0;
alter table public.marketplace_daily_metrics add column if not exists new_sellers integer not null default 0;
alter table public.marketplace_daily_metrics add column if not exists new_products integer not null default 0;
alter table public.marketplace_daily_metrics add column if not exists created_at timestamptz not null default now();
alter table public.marketplace_daily_metrics add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'marketplace_daily_metrics_currency_length'
      and conrelid = 'public.marketplace_daily_metrics'::regclass
  ) then
    alter table public.marketplace_daily_metrics
      add constraint marketplace_daily_metrics_currency_length check (char_length(currency) = 3);
  end if;
end $$;

create index if not exists idx_marketplace_daily_metrics_date
  on public.marketplace_daily_metrics (metric_date desc);
create index if not exists idx_orders_marketplace_analytics_date
  on public.orders ((coalesce(placed_at, created_at)), status, seller_id, buyer_id);
create index if not exists idx_products_marketplace_analytics_status
  on public.products (created_at, status, seller_id, category_id, brand_id);
create index if not exists idx_inventory_marketplace_analytics_stock
  on public.inventory_items (product_id, quantity_available, quantity_reserved);
create index if not exists idx_sellers_marketplace_analytics_status
  on public.sellers (created_at, status, kyc_status);

create or replace function public.marketplace_growth_rate(p_current numeric, p_previous numeric)
returns numeric
language sql
immutable
as $$
  select case
    when coalesce(p_previous, 0) = 0 and coalesce(p_current, 0) > 0 then 100
    when coalesce(p_previous, 0) = 0 then 0
    else round(((p_current - p_previous) / p_previous) * 100, 2)
  end;
$$;

create or replace function public.refresh_marketplace_daily_metrics(p_metric_date date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start timestamptz := p_metric_date::timestamptz;
  v_end timestamptz := (p_metric_date + 1)::timestamptz;
begin
  insert into public.marketplace_daily_metrics (
    metric_date,
    currency,
    gmv_minor,
    marketplace_revenue_minor,
    commission_revenue_minor,
    seller_revenue_minor,
    total_orders,
    completed_orders,
    pending_orders,
    processing_orders,
    cancelled_orders,
    refunded_orders,
    active_buyers,
    new_buyers,
    returning_buyers,
    new_sellers,
    new_products,
    updated_at
  )
  select
    p_metric_date,
    coalesce((select o.currency from public.orders o where coalesce(o.placed_at, o.created_at) >= v_start and coalesce(o.placed_at, o.created_at) < v_end limit 1), 'KES'),
    coalesce(sum(o.total_minor) filter (where o.status not in ('cancelled', 'refunded')), 0),
    coalesce(round(sum(o.total_minor) filter (where o.status not in ('cancelled', 'refunded')) * 0.1), 0),
    coalesce(round(sum(o.total_minor) filter (where o.status not in ('cancelled', 'refunded')) * 0.1), 0),
    coalesce(round(sum(o.total_minor) filter (where o.status not in ('cancelled', 'refunded')) * 0.9), 0),
    count(o.id),
    count(o.id) filter (where o.status in ('delivered')),
    count(o.id) filter (where o.status in ('pending_payment', 'paid')),
    count(o.id) filter (where o.status in ('processing', 'shipped')),
    count(o.id) filter (where o.status = 'cancelled'),
    count(o.id) filter (where o.status = 'refunded'),
    count(distinct o.buyer_id),
    count(distinct o.buyer_id) filter (
      where not exists (
        select 1 from public.orders first_order
        where first_order.buyer_id = o.buyer_id
          and coalesce(first_order.placed_at, first_order.created_at) < v_start
      )
    ),
    count(distinct o.buyer_id) filter (
      where exists (
        select 1 from public.orders previous_order
        where previous_order.buyer_id = o.buyer_id
          and coalesce(previous_order.placed_at, previous_order.created_at) < v_start
      )
    ),
    (select count(*) from public.sellers s where s.created_at >= v_start and s.created_at < v_end),
    (select count(*) from public.products p where p.created_at >= v_start and p.created_at < v_end),
    now()
  from public.orders o
  where coalesce(o.placed_at, o.created_at) >= v_start
    and coalesce(o.placed_at, o.created_at) < v_end
  on conflict (metric_date) do update set
    currency = excluded.currency,
    gmv_minor = excluded.gmv_minor,
    marketplace_revenue_minor = excluded.marketplace_revenue_minor,
    commission_revenue_minor = excluded.commission_revenue_minor,
    seller_revenue_minor = excluded.seller_revenue_minor,
    total_orders = excluded.total_orders,
    completed_orders = excluded.completed_orders,
    pending_orders = excluded.pending_orders,
    processing_orders = excluded.processing_orders,
    cancelled_orders = excluded.cancelled_orders,
    refunded_orders = excluded.refunded_orders,
    active_buyers = excluded.active_buyers,
    new_buyers = excluded.new_buyers,
    returning_buyers = excluded.returning_buyers,
    new_sellers = excluded.new_sellers,
    new_products = excluded.new_products,
    updated_at = now();
end;
$$;

create or replace function public.get_marketplace_revenue_analytics(
  p_start_date date,
  p_end_date date,
  p_previous_start_date date,
  p_previous_end_date date
)
returns jsonb
language sql
stable
as $$
with current_orders as (
  select * from public.orders
  where coalesce(placed_at, created_at)::date between p_start_date and p_end_date
    and status not in ('cancelled', 'refunded')
),
previous_orders as (
  select * from public.orders
  where coalesce(placed_at, created_at)::date between p_previous_start_date and p_previous_end_date
    and status not in ('cancelled', 'refunded')
),
totals as (
  select
    coalesce((select sum(total_minor) from current_orders), 0)::bigint current_gmv,
    coalesce((select sum(total_minor) from previous_orders), 0)::bigint previous_gmv,
    greatest((select count(*) from current_orders), 1) current_order_count
)
select jsonb_build_object(
  'gmvMinor', current_gmv,
  'marketplaceRevenueMinor', round(current_gmv * 0.1),
  'commissionRevenueMinor', round(current_gmv * 0.1),
  'sellerRevenueMinor', round(current_gmv * 0.9),
  'averageOrderValueMinor', round(current_gmv / current_order_count),
  'revenueGrowth', jsonb_build_object(
    'current', current_gmv,
    'previous', previous_gmv,
    'growthRate', public.marketplace_growth_rate(current_gmv, previous_gmv)
  )
) from totals;
$$;

create or replace function public.get_marketplace_orders_analytics(
  p_start_date date,
  p_end_date date,
  p_previous_start_date date,
  p_previous_end_date date
)
returns jsonb
language sql
stable
as $$
with current_orders as (
  select * from public.orders
  where coalesce(placed_at, created_at)::date between p_start_date and p_end_date
),
previous_orders as (
  select * from public.orders
  where coalesce(placed_at, created_at)::date between p_previous_start_date and p_previous_end_date
),
totals as (
  select
    count(*) total_orders,
    count(*) filter (where status in ('delivered')) completed_orders,
    count(*) filter (where status in ('pending_payment', 'paid')) pending_orders,
    count(*) filter (where status in ('processing', 'shipped')) processing_orders,
    count(*) filter (where status = 'cancelled') cancelled_orders,
    count(*) filter (where status = 'refunded') refunded_orders,
    count(distinct seller_id) sellers_with_orders
  from current_orders
)
select jsonb_build_object(
  'totalOrders', total_orders,
  'completedOrders', completed_orders,
  'pendingOrders', pending_orders,
  'processingOrders', processing_orders,
  'cancelledOrders', cancelled_orders,
  'refundedOrders', refunded_orders,
  'orderGrowth', jsonb_build_object(
    'current', total_orders,
    'previous', (select count(*) from previous_orders),
    'growthRate', public.marketplace_growth_rate(total_orders, (select count(*) from previous_orders))
  ),
  'averageOrdersPerDay', round(total_orders::numeric / greatest((p_end_date - p_start_date + 1), 1), 2),
  'averageOrdersPerSeller', round(total_orders::numeric / greatest(sellers_with_orders, 1), 2)
) from totals;
$$;

create or replace function public.get_marketplace_users_analytics(
  p_start_date date,
  p_end_date date,
  p_previous_start_date date,
  p_previous_end_date date
)
returns jsonb
language sql
stable
as $$
with active_orders as (
  select buyer_id from public.orders where coalesce(placed_at, created_at)::date between p_start_date and p_end_date
),
new_buyers as (
  select id from public.profiles where created_at::date between p_start_date and p_end_date
),
previous_buyers as (
  select id from public.profiles where created_at::date between p_previous_start_date and p_previous_end_date
)
select jsonb_build_object(
  'totalBuyers', (select count(*) from public.user_roles where role = 'buyer'),
  'activeBuyers', (select count(distinct buyer_id) from active_orders),
  'newBuyers', (select count(*) from new_buyers),
  'returningBuyers', (
    select count(distinct buyer_id) from active_orders ao
    where exists (
      select 1 from public.orders o
      where o.buyer_id = ao.buyer_id and coalesce(o.placed_at, o.created_at)::date < p_start_date
    )
  ),
  'buyerGrowth', jsonb_build_object(
    'current', (select count(*) from new_buyers),
    'previous', (select count(*) from previous_buyers),
    'growthRate', public.marketplace_growth_rate((select count(*) from new_buyers), (select count(*) from previous_buyers))
  ),
  'buyerRetentionRate', round(((select count(distinct buyer_id) from active_orders)::numeric / greatest((select count(*) from public.user_roles where role = 'buyer'), 1)) * 100, 2),
  'buyerAcquisitionRate', round(((select count(*) from new_buyers)::numeric / greatest((select count(*) from public.user_roles where role = 'buyer'), 1)) * 100, 2)
);
$$;

create or replace function public.get_marketplace_sellers_analytics(
  p_start_date date,
  p_end_date date,
  p_previous_start_date date,
  p_previous_end_date date
)
returns jsonb
language sql
stable
as $$
select jsonb_build_object(
  'totalSellers', count(*),
  'verifiedSellers', count(*) filter (where kyc_status = 'approved'),
  'pendingVerification', count(*) filter (where kyc_status = 'pending'),
  'activeSellers', count(*) filter (where status = 'active'),
  'suspendedSellers', count(*) filter (where status = 'suspended'),
  'sellerGrowth', jsonb_build_object(
    'current', count(*) filter (where created_at::date between p_start_date and p_end_date),
    'previous', count(*) filter (where created_at::date between p_previous_start_date and p_previous_end_date),
    'growthRate', public.marketplace_growth_rate(
      count(*) filter (where created_at::date between p_start_date and p_end_date),
      count(*) filter (where created_at::date between p_previous_start_date and p_previous_end_date)
    )
  ),
  'sellerActivationRate', round((count(*) filter (where status = 'active'))::numeric / greatest(count(*), 1) * 100, 2)
) from public.sellers;
$$;

create or replace function public.get_marketplace_products_analytics(
  p_start_date date,
  p_end_date date,
  p_previous_start_date date,
  p_previous_end_date date
)
returns jsonb
language sql
stable
as $$
with stock as (
  select product_id, sum(quantity_available) quantity_available
  from public.inventory_items
  group by product_id
)
select jsonb_build_object(
  'totalProducts', count(p.*),
  'activeProducts', count(*) filter (where p.status = 'active'),
  'draftProducts', count(*) filter (where p.status = 'draft'),
  'pendingReviewProducts', count(*) filter (where p.status = 'pending_review'),
  'publishedProducts', count(*) filter (where p.status = 'active'),
  'rejectedProducts', count(*) filter (where p.status = 'rejected'),
  'outOfStockProducts', count(*) filter (where coalesce(stock.quantity_available, 0) = 0),
  'productGrowth', jsonb_build_object(
    'current', count(*) filter (where p.created_at::date between p_start_date and p_end_date),
    'previous', count(*) filter (where p.created_at::date between p_previous_start_date and p_previous_end_date),
    'growthRate', public.marketplace_growth_rate(
      count(*) filter (where p.created_at::date between p_start_date and p_end_date),
      count(*) filter (where p.created_at::date between p_previous_start_date and p_previous_end_date)
    )
  ),
  'productApprovalRate', round((count(*) filter (where p.status = 'active'))::numeric / greatest(count(*) filter (where p.status in ('active', 'rejected')), 1) * 100, 2)
) from public.products p left join stock on stock.product_id = p.id;
$$;

create or replace function public.get_marketplace_categories_analytics(
  p_start_date date,
  p_end_date date,
  p_previous_start_date date,
  p_previous_end_date date,
  p_limit integer default 10
)
returns jsonb
language sql
stable
as $$
with revenue as (
  select c.id, c.name, count(distinct p.id) product_count, coalesce(sum(oi.total_minor), 0) revenue_minor
  from public.categories c
  left join public.products p on p.category_id = c.id
  left join public.order_items oi on oi.product_id = p.id
  left join public.orders o on o.id = oi.order_id and coalesce(o.placed_at, o.created_at)::date between p_start_date and p_end_date
  group by c.id, c.name
),
ranked as (
  select id, name, product_count, revenue_minor, sum(revenue_minor) over () total_revenue
  from revenue
)
select jsonb_build_object(
  'totalCategories', (select count(*) from public.categories),
  'mostActiveCategories', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'count', product_count, 'revenueMinor', revenue_minor, 'growthRate', 0, 'revenueShare', 0) order by product_count desc) from (select * from ranked order by product_count desc limit p_limit) r), '[]'::jsonb),
  'highestRevenueCategories', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'count', product_count, 'revenueMinor', revenue_minor, 'growthRate', 0, 'revenueShare', round(revenue_minor::numeric / greatest(total_revenue, 1) * 100, 2)) order by revenue_minor desc) from (select * from ranked order by revenue_minor desc limit p_limit) r), '[]'::jsonb),
  'fastestGrowingCategories', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'count', product_count, 'revenueMinor', revenue_minor, 'growthRate', 0, 'revenueShare', 0)) from (select * from ranked order by product_count desc limit p_limit) r), '[]'::jsonb),
  'categoryGrowth', jsonb_build_object('current', (select count(*) from public.categories where created_at::date between p_start_date and p_end_date), 'previous', (select count(*) from public.categories where created_at::date between p_previous_start_date and p_previous_end_date), 'growthRate', public.marketplace_growth_rate((select count(*) from public.categories where created_at::date between p_start_date and p_end_date), (select count(*) from public.categories where created_at::date between p_previous_start_date and p_previous_end_date))),
  'categoryRevenueShare', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'count', product_count, 'revenueMinor', revenue_minor, 'growthRate', 0, 'revenueShare', round(revenue_minor::numeric / greatest(total_revenue, 1) * 100, 2)) order by revenue_minor desc) from (select * from ranked order by revenue_minor desc limit p_limit) r), '[]'::jsonb)
);
$$;

create or replace function public.get_marketplace_brands_analytics(
  p_start_date date,
  p_end_date date,
  p_previous_start_date date,
  p_previous_end_date date,
  p_limit integer default 10
)
returns jsonb
language sql
stable
as $$
with revenue as (
  select b.id, b.name, count(distinct p.id) product_count, coalesce(sum(oi.total_minor), 0) revenue_minor
  from public.brands b
  left join public.products p on p.brand_id = b.id
  left join public.order_items oi on oi.product_id = p.id
  left join public.orders o on o.id = oi.order_id and coalesce(o.placed_at, o.created_at)::date between p_start_date and p_end_date
  group by b.id, b.name
),
ranked as (
  select id, name, product_count, revenue_minor, sum(revenue_minor) over () total_revenue
  from revenue
)
select jsonb_build_object(
  'totalBrands', (select count(*) from public.brands),
  'topBrands', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'count', product_count, 'revenueMinor', revenue_minor, 'growthRate', 0, 'revenueShare', round(revenue_minor::numeric / greatest(total_revenue, 1) * 100, 2)) order by revenue_minor desc) from (select * from ranked order by revenue_minor desc limit p_limit) r), '[]'::jsonb),
  'fastestGrowingBrands', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'count', product_count, 'revenueMinor', revenue_minor, 'growthRate', 0, 'revenueShare', 0)) from (select * from ranked order by product_count desc limit p_limit) r), '[]'::jsonb),
  'highestRevenueBrands', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'count', product_count, 'revenueMinor', revenue_minor, 'growthRate', 0, 'revenueShare', round(revenue_minor::numeric / greatest(total_revenue, 1) * 100, 2)) order by revenue_minor desc) from (select * from ranked order by revenue_minor desc limit p_limit) r), '[]'::jsonb),
  'brandGrowth', jsonb_build_object('current', (select count(*) from public.brands where created_at::date between p_start_date and p_end_date), 'previous', (select count(*) from public.brands where created_at::date between p_previous_start_date and p_previous_end_date), 'growthRate', public.marketplace_growth_rate((select count(*) from public.brands where created_at::date between p_start_date and p_end_date), (select count(*) from public.brands where created_at::date between p_previous_start_date and p_previous_end_date))),
  'brandRevenue', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'count', product_count, 'revenueMinor', revenue_minor, 'growthRate', 0, 'revenueShare', round(revenue_minor::numeric / greatest(total_revenue, 1) * 100, 2)) order by revenue_minor desc) from (select * from ranked order by revenue_minor desc limit p_limit) r), '[]'::jsonb)
);
$$;

alter table public.marketplace_daily_metrics enable row level security;
drop policy if exists marketplace_daily_metrics_admin_read on public.marketplace_daily_metrics;
create policy marketplace_daily_metrics_admin_read
  on public.marketplace_daily_metrics
  for select
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role = 'admin'
    )
  );
