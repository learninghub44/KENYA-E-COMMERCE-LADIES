-- Agent 11A (Seller Analytics): seller analytics tables, materialized views, indexes, and functions.
-- This migration is idempotent and can be rerun on existing databases.

-- ============================================================================
-- ANALYTICS TABLES
-- ============================================================================

-- Seller daily metrics table for pre-aggregated daily data
create table if not exists public.seller_daily_metrics (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  metric_date date not null,
  currency text not null default 'KES' check (char_length(currency) = 3),
  
  -- Order metrics
  orders_total integer not null default 0,
  orders_completed integer not null default 0,
  orders_pending integer not null default 0,
  orders_cancelled integer not null default 0,
  
  -- Revenue metrics (in minor units)
  gross_revenue_minor integer not null default 0,
  net_revenue_minor integer not null default 0,
  refunds_minor integer not null default 0,
  
  -- Product metrics
  products_active integer not null default 0,
  products_draft integer not null default 0,
  products_out_of_stock integer not null default 0,
  
  -- Customer metrics
  customers_new integer not null default 0,
  customers_returning integer not null default 0,
  
  -- Inventory metrics
  inventory_value_minor integer not null default 0,
  low_stock_count integer not null default 0,
  out_of_stock_count integer not null default 0,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (seller_id, metric_date)
);

-- Add columns if they don't exist (for idempotency)
do $$
begin
  -- Add currency column if missing
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'seller_daily_metrics' 
    and column_name = 'currency'
  ) then
    alter table public.seller_daily_metrics 
    add column currency text not null default 'KES' check (char_length(currency) = 3);
  end if;
  
  -- Add orders_total column if missing
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'seller_daily_metrics' 
    and column_name = 'orders_total'
  ) then
    alter table public.seller_daily_metrics 
    add column orders_total integer not null default 0;
  end if;
  
  -- Add orders_completed column if missing
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'seller_daily_metrics' 
    and column_name = 'orders_completed'
  ) then
    alter table public.seller_daily_metrics 
    add column orders_completed integer not null default 0;
  end if;
  
  -- Add orders_pending column if missing
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'seller_daily_metrics' 
    and column_name = 'orders_pending'
  ) then
    alter table public.seller_daily_metrics 
    add column orders_pending integer not null default 0;
  end if;
  
  -- Add orders_cancelled column if missing
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'seller_daily_metrics' 
    and column_name = 'orders_cancelled'
  ) then
    alter table public.seller_daily_metrics 
    add column orders_cancelled integer not null default 0;
  end if;
  
  -- Add gross_revenue_minor column if missing
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'seller_daily_metrics' 
    and column_name = 'gross_revenue_minor'
  ) then
    alter table public.seller_daily_metrics 
    add column gross_revenue_minor integer not null default 0;
  end if;
  
  -- Add net_revenue_minor column if missing
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'seller_daily_metrics' 
    and column_name = 'net_revenue_minor'
  ) then
    alter table public.seller_daily_metrics 
    add column net_revenue_minor integer not null default 0;
  end if;
  
  -- Add refunds_minor column if missing
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'seller_daily_metrics' 
    and column_name = 'refunds_minor'
  ) then
    alter table public.seller_daily_metrics 
    add column refunds_minor integer not null default 0;
  end if;
  
  -- Add products_active column if missing
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'seller_daily_metrics' 
    and column_name = 'products_active'
  ) then
    alter table public.seller_daily_metrics 
    add column products_active integer not null default 0;
  end if;
  
  -- Add products_draft column if missing
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'seller_daily_metrics' 
    and column_name = 'products_draft'
  ) then
    alter table public.seller_daily_metrics 
    add column products_draft integer not null default 0;
  end if;
  
  -- Add products_out_of_stock column if missing
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'seller_daily_metrics' 
    and column_name = 'products_out_of_stock'
  ) then
    alter table public.seller_daily_metrics 
    add column products_out_of_stock integer not null default 0;
  end if;
  
  -- Add customers_new column if missing
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'seller_daily_metrics' 
    and column_name = 'customers_new'
  ) then
    alter table public.seller_daily_metrics 
    add column customers_new integer not null default 0;
  end if;
  
  -- Add customers_returning column if missing
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'seller_daily_metrics' 
    and column_name = 'customers_returning'
  ) then
    alter table public.seller_daily_metrics 
    add column customers_returning integer not null default 0;
  end if;
  
  -- Add inventory_value_minor column if missing
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'seller_daily_metrics' 
    and column_name = 'inventory_value_minor'
  ) then
    alter table public.seller_daily_metrics 
    add column inventory_value_minor integer not null default 0;
  end if;
  
  -- Add low_stock_count column if missing
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'seller_daily_metrics' 
    and column_name = 'low_stock_count'
  ) then
    alter table public.seller_daily_metrics 
    add column low_stock_count integer not null default 0;
  end if;
  
  -- Add out_of_stock_count column if missing
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'seller_daily_metrics' 
    and column_name = 'out_of_stock_count'
  ) then
    alter table public.seller_daily_metrics 
    add column out_of_stock_count integer not null default 0;
  end if;
end $$;

-- Seller product performance table
create table if not exists public.seller_product_metrics (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  metric_date date not null,
  
  -- Sales metrics
  views_count integer not null default 0,
  orders_count integer not null default 0,
  units_sold integer not null default 0,
  gross_revenue_minor integer not null default 0,
  net_revenue_minor integer not null default 0,
  
  -- Inventory metrics
  stock_level integer not null default 0,
  stock_reserved integer not null default 0,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (seller_id, product_id, metric_date)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_seller_daily_metrics_seller_date 
  on public.seller_daily_metrics(seller_id, metric_date desc);

create index if not exists idx_seller_daily_metrics_date 
  on public.seller_daily_metrics(metric_date desc);

create index if not exists idx_seller_product_metrics_seller_product_date 
  on public.seller_product_metrics(seller_id, product_id, metric_date desc);

create index if not exists idx_seller_product_metrics_seller_date 
  on public.seller_product_metrics(seller_id, metric_date desc);

-- ============================================================================
-- MATERIALIZED VIEWS
-- ============================================================================

-- Seller overview summary (refreshed periodically)
create materialized view if not exists public.seller_overview_summary as
select 
  s.id as seller_id,
  s.store_name,
  s.slug,
  s.currency,
  s.status,
  coalesce(count(distinct o.id), 0) as total_orders,
  coalesce(sum(case when o.status in ('confirmed', 'processing', 'ready_for_shipment', 'shipped', 'delivered', 'completed') then 1 else 0 end), 0) as active_orders,
  coalesce(sum(case when o.status = 'completed' then 1 else 0 end), 0) as completed_orders,
  coalesce(sum(case when o.status = 'pending' then 1 else 0 end), 0) as pending_orders,
  coalesce(sum(case when o.status = 'cancelled' then 1 else 0 end), 0) as cancelled_orders,
  coalesce(sum(o.total_minor), 0) as gross_revenue_minor,
  coalesce(sum(case when o.status = 'cancelled' then o.total_minor else 0 end), 0) as cancelled_revenue_minor,
  coalesce(sum(o.total_minor) - sum(case when o.status = 'cancelled' then o.total_minor else 0 end), 0) as net_revenue_minor,
  coalesce(count(distinct p.id), 0) as total_products,
  coalesce(count(distinct case when p.status = 'active' then p.id end), 0) as active_products,
  coalesce(count(distinct case when p.status = 'draft' then p.id end), 0) as draft_products,
  coalesce(count(distinct o.buyer_id), 0) as total_customers,
  s.created_at as seller_created_at
from public.sellers s
left join public.orders o on o.seller_id = s.id
left join public.products p on p.seller_id = s.id
group by s.id, s.store_name, s.slug, s.currency, s.status, s.created_at;

create unique index if not exists idx_seller_overview_summary_seller 
  on public.seller_overview_summary(seller_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to calculate seller daily metrics
create or replace function public.calculate_seller_daily_metrics(p_seller_id uuid, p_metric_date date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_gross_revenue_minor integer;
  v_net_revenue_minor integer;
  v_refunds_minor integer;
  v_orders_total integer;
  v_orders_completed integer;
  v_orders_pending integer;
  v_orders_cancelled integer;
  v_products_active integer;
  v_products_draft integer;
  v_products_out_of_stock integer;
  v_customers_new integer;
  v_customers_returning integer;
  v_inventory_value_minor integer;
  v_low_stock_count integer;
  v_out_of_stock_count integer;
begin
  -- Calculate revenue metrics
  select 
    coalesce(sum(total_minor), 0),
    coalesce(sum(case when status != 'cancelled' then total_minor else 0 end), 0),
    coalesce(sum(case when status = 'returned' then total_minor else 0 end), 0)
  into v_gross_revenue_minor, v_net_revenue_minor, v_refunds_minor
  from public.orders
  where seller_id = p_seller_id
    and date_trunc('day', created_at) = p_metric_date;
  
  -- Calculate order metrics
  select 
    coalesce(count(*), 0),
    coalesce(count(case when status = 'completed' then 1 end), 0),
    coalesce(count(case when status = 'pending' then 1 end), 0),
    coalesce(count(case when status = 'cancelled' then 1 end), 0)
  into v_orders_total, v_orders_completed, v_orders_pending, v_orders_cancelled
  from public.orders
  where seller_id = p_seller_id
    and date_trunc('day', created_at) = p_metric_date;
  
  -- Calculate product metrics
  select 
    coalesce(count(case when status = 'active' then 1 end), 0),
    coalesce(count(case when status = 'draft' then 1 end), 0),
    coalesce(count(case when ii.quantity_available = 0 then 1 end), 0)
  into v_products_active, v_products_draft, v_products_out_of_stock
  from public.products p
  left join public.inventory_items ii on ii.product_id = p.id
  where p.seller_id = p_seller_id;
  
  -- Calculate customer metrics
  with first_orders as (
    select buyer_id, min(created_at) as first_order_at
    from public.orders
    where seller_id = p_seller_id
    group by buyer_id
  )
  select 
    coalesce(count(case when date(first_order_at) = p_metric_date then 1 end), 0),
    coalesce(count(case when date(first_order_at) < p_metric_date then 1 end), 0)
  into v_customers_new, v_customers_returning
  from first_orders;
  
  -- Calculate inventory metrics
  select 
    coalesce(sum(p.base_price_minor * ii.quantity_available), 0),
    coalesce(count(case when ii.quantity_available <= ii.low_stock_threshold and ii.quantity_available > 0 then 1 end), 0),
    coalesce(count(case when ii.quantity_available = 0 then 1 end), 0)
  into v_inventory_value_minor, v_low_stock_count, v_out_of_stock_count
  from public.products p
  left join public.inventory_items ii on ii.product_id = p.id
  where p.seller_id = p_seller_id;
  
  -- Insert or update daily metrics
  insert into public.seller_daily_metrics (
    seller_id,
    metric_date,
    currency,
    orders_total,
    orders_completed,
    orders_pending,
    orders_cancelled,
    gross_revenue_minor,
    net_revenue_minor,
    refunds_minor,
    products_active,
    products_draft,
    products_out_of_stock,
    customers_new,
    customers_returning,
    inventory_value_minor,
    low_stock_count,
    out_of_stock_count
  ) values (
    p_seller_id,
    p_metric_date,
    (select default_currency from public.sellers where id = p_seller_id),
    v_orders_total,
    v_orders_completed,
    v_orders_pending,
    v_orders_cancelled,
    v_gross_revenue_minor,
    v_net_revenue_minor,
    v_refunds_minor,
    v_products_active,
    v_products_draft,
    v_products_out_of_stock,
    v_customers_new,
    v_customers_returning,
    v_inventory_value_minor,
    v_low_stock_count,
    v_out_of_stock_count
  )
  on conflict (seller_id, metric_date) do update set
    orders_total = excluded.orders_total,
    orders_completed = excluded.orders_completed,
    orders_pending = excluded.orders_pending,
    orders_cancelled = excluded.orders_cancelled,
    gross_revenue_minor = excluded.gross_revenue_minor,
    net_revenue_minor = excluded.net_revenue_minor,
    refunds_minor = excluded.refunds_minor,
    products_active = excluded.products_active,
    products_draft = excluded.products_draft,
    products_out_of_stock = excluded.products_out_of_stock,
    customers_new = excluded.customers_new,
    customers_returning = excluded.customers_returning,
    inventory_value_minor = excluded.inventory_value_minor,
    low_stock_count = excluded.low_stock_count,
    out_of_stock_count = excluded.out_of_stock_count,
    updated_at = now();
end;
$$;

-- Function to refresh seller overview summary
create or replace function public.refresh_seller_overview_summary()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  refresh materialized view concurrently public.seller_overview_summary;
end;
$$;

-- Function to get seller analytics dashboard data
create or replace function public.get_seller_dashboard(p_seller_id uuid, p_start_date date, p_end_date date)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  select jsonb_build_object(
    'overview', (
      jsonb_build_object(
        'total_orders', coalesce(sum(orders_total), 0),
        'completed_orders', coalesce(sum(orders_completed), 0),
        'pending_orders', coalesce(sum(orders_pending), 0),
        'cancelled_orders', coalesce(sum(orders_cancelled), 0),
        'gross_revenue_minor', coalesce(sum(gross_revenue_minor), 0),
        'net_revenue_minor', coalesce(sum(net_revenue_minor), 0),
        'refunds_minor', coalesce(sum(refunds_minor), 0),
        'customers_new', coalesce(sum(customers_new), 0),
        'customers_returning', coalesce(sum(customers_returning), 0)
      )
    ),
    'products', (
      jsonb_build_object(
        'total_products', (select count(*) from public.products where seller_id = p_seller_id),
        'active_products', (select count(*) from public.products where seller_id = p_seller_id and status = 'active'),
        'draft_products', (select count(*) from public.products where seller_id = p_seller_id and status = 'draft'),
        'out_of_stock', (select count(*) from public.inventory_items ii join public.products p on p.id = ii.product_id where p.seller_id = p_seller_id and ii.quantity_available = 0),
        'low_stock', (select count(*) from public.inventory_items ii join public.products p on p.id = ii.product_id where p.seller_id = p_seller_id and ii.quantity_available <= ii.low_stock_threshold and ii.quantity_available > 0)
      )
    ),
    'inventory', (
      jsonb_build_object(
        'inventory_value_minor', (select coalesce(sum(p.base_price_minor * ii.quantity_available), 0) from public.products p left join public.inventory_items ii on ii.product_id = p.id where p.seller_id = p_seller_id),
        'low_stock_count', (select count(*) from public.inventory_items ii join public.products p on p.id = ii.product_id where p.seller_id = p_seller_id and ii.quantity_available <= ii.low_stock_threshold and ii.quantity_available > 0),
        'out_of_stock_count', (select count(*) from public.inventory_items ii join public.products p on p.id = ii.product_id where p.seller_id = p_seller_id and ii.quantity_available = 0)
      )
    ),
    'daily_metrics', (
      select jsonb_agg(
        jsonb_build_object(
          'date', metric_date,
          'orders_total', orders_total,
          'orders_completed', orders_completed,
          'orders_pending', orders_pending,
          'orders_cancelled', orders_cancelled,
          'gross_revenue_minor', gross_revenue_minor,
          'net_revenue_minor', net_revenue_minor,
          'customers_new', customers_new,
          'customers_returning', customers_returning
        )
      )
      from public.seller_daily_metrics
      where seller_id = p_seller_id
        and metric_date between p_start_date and p_end_date
      order by metric_date
    )
  ) into v_result;
  
  return v_result;
end;
$$;

-- Function to get seller revenue analytics
create or replace function public.get_seller_revenue_analytics(p_seller_id uuid, p_start_date date, p_end_date date, p_group_by text default 'day')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  case p_group_by
    when 'hour' then
      select jsonb_agg(
        jsonb_build_object(
          'period', to_char(created_at, 'YYYY-MM-DD HH24:00'),
          'gross_revenue_minor', coalesce(sum(total_minor), 0),
          'net_revenue_minor', coalesce(sum(case when status != 'cancelled' then total_minor else 0 end), 0),
          'orders_count', count(*)
        )
      ) into v_result
      from public.orders
      where seller_id = p_seller_id
        and date(created_at) between p_start_date and p_end_date
      group by to_char(created_at, 'YYYY-MM-DD HH24:00')
      order by 1;
    
    when 'day' then
      select jsonb_agg(
        jsonb_build_object(
          'period', to_char(created_at, 'YYYY-MM-DD'),
          'gross_revenue_minor', coalesce(sum(total_minor), 0),
          'net_revenue_minor', coalesce(sum(case when status != 'cancelled' then total_minor else 0 end), 0),
          'orders_count', count(*)
        )
      ) into v_result
      from public.orders
      where seller_id = p_seller_id
        and date(created_at) between p_start_date and p_end_date
      group by to_char(created_at, 'YYYY-MM-DD')
      order by 1;
    
    when 'week' then
      select jsonb_agg(
        jsonb_build_object(
          'period', to_char(date_trunc('week', created_at), 'YYYY-"W"WW'),
          'gross_revenue_minor', coalesce(sum(total_minor), 0),
          'net_revenue_minor', coalesce(sum(case when status != 'cancelled' then total_minor else 0 end), 0),
          'orders_count', count(*)
        )
      ) into v_result
      from public.orders
      where seller_id = p_seller_id
        and date(created_at) between p_start_date and p_end_date
      group by date_trunc('week', created_at)
      order by 1;
    
    when 'month' then
      select jsonb_agg(
        jsonb_build_object(
          'period', to_char(created_at, 'YYYY-MM'),
          'gross_revenue_minor', coalesce(sum(total_minor), 0),
          'net_revenue_minor', coalesce(sum(case when status != 'cancelled' then total_minor else 0 end), 0),
          'orders_count', count(*)
        )
      ) into v_result
      from public.orders
      where seller_id = p_seller_id
        and date(created_at) between p_start_date and p_end_date
      group by to_char(created_at, 'YYYY-MM')
      order by 1;
    
    when 'year' then
      select jsonb_agg(
        jsonb_build_object(
          'period', to_char(created_at, 'YYYY'),
          'gross_revenue_minor', coalesce(sum(total_minor), 0),
          'net_revenue_minor', coalesce(sum(case when status != 'cancelled' then total_minor else 0 end), 0),
          'orders_count', count(*)
        )
      ) into v_result
      from public.orders
      where seller_id = p_seller_id
        and date(created_at) between p_start_date and p_end_date
      group by to_char(created_at, 'YYYY')
      order by 1;
    
    else
      select jsonb_agg(
        jsonb_build_object(
          'period', to_char(created_at, 'YYYY-MM-DD'),
          'gross_revenue_minor', coalesce(sum(total_minor), 0),
          'net_revenue_minor', coalesce(sum(case when status != 'cancelled' then total_minor else 0 end), 0),
          'orders_count', count(*)
        )
      ) into v_result
      from public.orders
      where seller_id = p_seller_id
        and date(created_at) between p_start_date and p_end_date
      group by to_char(created_at, 'YYYY-MM-DD')
      order by 1;
  end case;
  
  return coalesce(v_result, '[]'::jsonb);
end;
$$;

-- Function to get seller product analytics
create or replace function public.get_seller_product_analytics(p_seller_id uuid, p_limit integer default 50)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  select jsonb_agg(
    jsonb_build_object(
      'product_id', p.id,
      'product_name', p.name,
      'sku', pv.sku,
      'status', p.status,
      'base_price_minor', p.base_price_minor,
      'currency', p.currency,
      'total_orders', coalesce(count(distinct o.id), 0),
      'units_sold', coalesce(sum(oi.quantity), 0),
      'gross_revenue_minor', coalesce(sum(oi.total_minor), 0),
      'stock_available', ii.quantity_available,
      'stock_reserved', ii.quantity_reserved,
      'is_low_stock', ii.quantity_available <= ii.low_stock_threshold and ii.quantity_available > 0,
      'is_out_of_stock', ii.quantity_available = 0
    )
  ) into v_result
  from public.products p
  left join public.product_variants pv on pv.product_id = p.id
  left join public.inventory_items ii on ii.product_id = p.id
  left join public.order_items oi on oi.product_id = p.id
  left join public.orders o on o.id = oi.order_id and o.seller_id = p_seller_id
  where p.seller_id = p_seller_id
  group by p.id, p.name, pv.sku, p.status, p.base_price_minor, p.currency, ii.quantity_available, ii.quantity_reserved, ii.low_stock_threshold
  order by coalesce(sum(oi.total_minor), 0) desc
  limit p_limit;
  
  return coalesce(v_result, '[]'::jsonb);
end;
$$;

-- Function to get seller customer analytics
create or replace function public.get_seller_customer_analytics(p_seller_id uuid, p_start_date date, p_end_date date, p_limit integer default 50)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  with customer_stats as (
    select 
      o.buyer_id,
      pr.display_name,
      pr.email,
      count(distinct o.id) as order_count,
      sum(o.total_minor) as total_spent_minor,
      min(o.created_at) as first_order_at,
      max(o.created_at) as last_order_at,
      avg(o.total_minor) as avg_order_value_minor
    from public.orders o
    join public.profiles pr on pr.id = o.buyer_id
    where o.seller_id = p_seller_id
      and date(o.created_at) between p_start_date and p_end_date
    group by o.buyer_id, pr.display_name, pr.email
  )
  select jsonb_agg(
    jsonb_build_object(
      'customer_id', buyer_id,
      'display_name', display_name,
      'email', email,
      'order_count', order_count,
      'total_spent_minor', total_spent_minor,
      'first_order_at', first_order_at,
      'last_order_at', last_order_at,
      'avg_order_value_minor', avg_order_value_minor,
      'is_returning', order_count > 1
    )
  ) into v_result
  from customer_stats
  order by total_spent_minor desc
  limit p_limit;
  
  return coalesce(v_result, '[]'::jsonb);
end;
$$;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Drop existing policies if they exist
drop policy if exists "seller_daily_metrics_seller_read" on public.seller_daily_metrics;
drop policy if exists "seller_daily_metrics_admin_read" on public.seller_daily_metrics;
drop policy if exists "seller_product_metrics_seller_read" on public.seller_product_metrics;
drop policy if exists "seller_product_metrics_admin_read" on public.seller_product_metrics;
drop policy if exists "seller_overview_summary_seller_read" on public.seller_overview_summary;
drop policy if exists "seller_overview_summary_admin_read" on public.seller_overview_summary;

-- Create RLS policies for seller_daily_metrics
alter table public.seller_daily_metrics enable row level security;

create policy "seller_daily_metrics_seller_read"
  on public.seller_daily_metrics for select
  using (
    seller_id in (
      select seller_id from public.seller_members 
      where user_id = auth.uid()
    )
  );

create policy "seller_daily_metrics_admin_read"
  on public.seller_daily_metrics for select
  using (
    exists (
      select 1 from public.user_roles 
      where user_id = auth.uid() 
      and role in ('admin', 'moderator')
    )
  );

-- Create RLS policies for seller_product_metrics
alter table public.seller_product_metrics enable row level security;

create policy "seller_product_metrics_seller_read"
  on public.seller_product_metrics for select
  using (
    seller_id in (
      select seller_id from public.seller_members 
      where user_id = auth.uid()
    )
  );

create policy "seller_product_metrics_admin_read"
  on public.seller_product_metrics for select
  using (
    exists (
      select 1 from public.user_roles 
      where user_id = auth.uid() 
      and role in ('admin', 'moderator')
    )
  );

-- Create RLS policies for seller_overview_summary
alter table public.seller_overview_summary enable row level security;

create policy "seller_overview_summary_seller_read"
  on public.seller_overview_summary for select
  using (
    seller_id in (
      select seller_id from public.seller_members 
      where user_id = auth.uid()
    )
  );

create policy "seller_overview_summary_admin_read"
  on public.seller_overview_summary for select
  using (
    exists (
      select 1 from public.user_roles 
      where user_id = auth.uid() 
      and role in ('admin', 'moderator')
    )
  );

-- Grant execute permissions on functions
grant execute on function public.calculate_seller_daily_metrics(uuid, date) to authenticated;
grant execute on function public.refresh_seller_overview_summary() to authenticated;
grant execute on function public.get_seller_dashboard(uuid, date, date) to authenticated;
grant execute on function public.get_seller_revenue_analytics(uuid, date, date, text) to authenticated;
grant execute on function public.get_seller_product_analytics(uuid, integer) to authenticated;
grant execute on function public.get_seller_customer_analytics(uuid, date, date, integer) to authenticated;
