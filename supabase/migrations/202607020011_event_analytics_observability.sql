-- Agent 11C: Event Analytics, Observability & Forecasting Foundation
-- Idempotent and safe to rerun on existing Supabase databases.

-- ============================================================
-- INTERNAL EVENT STORAGE
-- ============================================================

create table if not exists public.internal_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  event_version integer not null default 1,
  user_id uuid references public.profiles(id) on delete set null,
  seller_id uuid references public.sellers(id) on delete set null,
  session_id text,
  request_id text,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  device_info jsonb not null default '{}'::jsonb,
  ip_hash text,
  user_agent text,
  source text not null default 'internal',
  platform text,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

alter table public.internal_events add column if not exists event_type text not null;
alter table public.internal_events add column if not exists event_version integer not null default 1;
alter table public.internal_events add column if not exists user_id uuid references public.profiles(id) on delete set null;
alter table public.internal_events add column if not exists seller_id uuid references public.sellers(id) on delete set null;
alter table public.internal_events add column if not exists session_id text;
alter table public.internal_events add column if not exists request_id text;
alter table public.internal_events add column if not exists entity_type text;
alter table public.internal_events add column if not exists entity_id uuid;
alter table public.internal_events add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.internal_events add column if not exists device_info jsonb not null default '{}'::jsonb;
alter table public.internal_events add column if not exists ip_hash text;
alter table public.internal_events add column if not exists user_agent text;
alter table public.internal_events add column if not exists source text not null default 'internal';
alter table public.internal_events add column if not exists platform text;
alter table public.internal_events add column if not exists created_at timestamptz not null default now();
alter table public.internal_events add column if not exists archived_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'internal_events_event_type_length'
      and conrelid = 'public.internal_events'::regclass
  ) then
    alter table public.internal_events
      add constraint internal_events_event_type_length check (char_length(event_type) >= 2);
  end if;
end $$;

create index if not exists idx_internal_events_type_created
  on public.internal_events (event_type, created_at desc);
create index if not exists idx_internal_events_user_created
  on public.internal_events (user_id, created_at desc);
create index if not exists idx_internal_events_seller_created
  on public.internal_events (seller_id, created_at desc);
create index if not exists idx_internal_events_entity
  on public.internal_events (entity_type, entity_id, created_at desc);
create index if not exists idx_internal_events_session
  on public.internal_events (session_id, created_at desc);
create index if not exists idx_internal_events_request
  on public.internal_events (request_id);
create index if not exists idx_internal_events_created
  on public.internal_events (created_at desc);
create index if not exists idx_internal_events_source_created
  on public.internal_events (source, created_at desc);

-- ============================================================
-- EVENT AGGREGATION TABLES
-- ============================================================

create table if not exists public.event_aggregations_hourly (
  id bigint generated always as identity primary key,
  event_type text not null,
  bucket_hour timestamptz not null,
  event_count integer not null default 0,
  unique_users integer not null default 0,
  unique_sellers integer not null default 0,
  unique_sessions integer not null default 0,
  created_at timestamptz not null default now(),
  unique (event_type, bucket_hour)
);

alter table public.event_aggregations_hourly add column if not exists event_type text not null;
alter table public.event_aggregations_hourly add column if not exists bucket_hour timestamptz not null;
alter table public.event_aggregations_hourly add column if not exists event_count integer not null default 0;
alter table public.event_aggregations_hourly add column if not exists unique_users integer not null default 0;
alter table public.event_aggregations_hourly add column if not exists unique_sellers integer not null default 0;
alter table public.event_aggregations_hourly add column if not exists unique_sessions integer not null default 0;
alter table public.event_aggregations_hourly add column if not exists created_at timestamptz not null default now();

create index if not exists idx_event_agg_hourly_bucket
  on public.event_aggregations_hourly (bucket_hour desc, event_type);
create index if not exists idx_event_agg_hourly_type
  on public.event_aggregations_hourly (event_type, bucket_hour desc);

create table if not exists public.event_aggregations_daily (
  id bigint generated always as identity primary key,
  event_type text not null,
  bucket_date date not null,
  event_count integer not null default 0,
  unique_users integer not null default 0,
  unique_sellers integer not null default 0,
  unique_sessions integer not null default 0,
  total_duration_ms bigint not null default 0,
  created_at timestamptz not null default now(),
  unique (event_type, bucket_date)
);

alter table public.event_aggregations_daily add column if not exists event_type text not null;
alter table public.event_aggregations_daily add column if not exists bucket_date date not null;
alter table public.event_aggregations_daily add column if not exists event_count integer not null default 0;
alter table public.event_aggregations_daily add column if not exists unique_users integer not null default 0;
alter table public.event_aggregations_daily add column if not exists unique_sellers integer not null default 0;
alter table public.event_aggregations_daily add column if not exists unique_sessions integer not null default 0;
alter table public.event_aggregations_daily add column if not exists total_duration_ms bigint not null default 0;
alter table public.event_aggregations_daily add column if not exists created_at timestamptz not null default now();

create index if not exists idx_event_agg_daily_bucket
  on public.event_aggregations_daily (bucket_date desc, event_type);
create index if not exists idx_event_agg_daily_type
  on public.event_aggregations_daily (event_type, bucket_date desc);

-- ============================================================
-- APPLICATION METRICS
-- ============================================================

create table if not exists public.app_metrics (
  id bigint generated always as identity primary key,
  metric_name text not null,
  metric_value numeric not null,
  tags jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now()
);

alter table public.app_metrics add column if not exists metric_name text not null;
alter table public.app_metrics add column if not exists metric_value numeric not null;
alter table public.app_metrics add column if not exists tags jsonb not null default '{}'::jsonb;
alter table public.app_metrics add column if not exists recorded_at timestamptz not null default now();

create index if not exists idx_app_metrics_name_recorded
  on public.app_metrics (metric_name, recorded_at desc);
create index if not exists idx_app_metrics_recorded
  on public.app_metrics (recorded_at desc);

-- ============================================================
-- DATABASE METRICS
-- ============================================================

create table if not exists public.db_metrics (
  id bigint generated always as identity primary key,
  query_source text not null default 'unknown',
  query_count integer not null default 0,
  total_duration_ms bigint not null default 0,
  slow_query_count integer not null default 0,
  failed_query_count integer not null default 0,
  recorded_at timestamptz not null default now()
);

alter table public.db_metrics add column if not exists query_source text not null default 'unknown';
alter table public.db_metrics add column if not exists query_count integer not null default 0;
alter table public.db_metrics add column if not exists total_duration_ms bigint not null default 0;
alter table public.db_metrics add column if not exists slow_query_count integer not null default 0;
alter table public.db_metrics add column if not exists failed_query_count integer not null default 0;
alter table public.db_metrics add column if not exists recorded_at timestamptz not null default now();

create index if not exists idx_db_metrics_recorded
  on public.db_metrics (recorded_at desc);

-- ============================================================
-- CACHE METRICS
-- ============================================================

create table if not exists public.cache_metrics (
  id bigint generated always as identity primary key,
  cache_name text not null default 'default',
  hits integer not null default 0,
  misses integer not null default 0,
  hit_ratio numeric(5,4) not null default 0,
  recorded_at timestamptz not null default now()
);

alter table public.cache_metrics add column if not exists cache_name text not null default 'default';
alter table public.cache_metrics add column if not exists hits integer not null default 0;
alter table public.cache_metrics add column if not exists misses integer not null default 0;
alter table public.cache_metrics add column if not exists hit_ratio numeric(5,4) not null default 0;
alter table public.cache_metrics add column if not exists recorded_at timestamptz not null default now();

create index if not exists idx_cache_metrics_name_recorded
  on public.cache_metrics (cache_name, recorded_at desc);

-- ============================================================
-- STORAGE METRICS
-- ============================================================

create table if not exists public.storage_metrics (
  id bigint generated always as identity primary key,
  storage_type text not null default 'cloudinary',
  total_images integer not null default 0,
  total_bytes bigint not null default 0,
  recorded_at timestamptz not null default now()
);

alter table public.storage_metrics add column if not exists storage_type text not null default 'cloudinary';
alter table public.storage_metrics add column if not exists total_images integer not null default 0;
alter table public.storage_metrics add column if not exists total_bytes bigint not null default 0;
alter table public.storage_metrics add column if not exists recorded_at timestamptz not null default now();

create index if not exists idx_storage_metrics_recorded
  on public.storage_metrics (recorded_at desc);

-- ============================================================
-- FORECASTING HOOKS TABLE
-- ============================================================

create table if not exists public.forecasting_hooks (
  id uuid primary key default gen_random_uuid(),
  hook_name text not null unique,
  hook_type text not null,
  description text,
  input_schema jsonb not null default '{}'::jsonb,
  output_schema jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  last_invoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.forecasting_hooks add column if not exists hook_name text not null unique;
alter table public.forecasting_hooks add column if not exists hook_type text not null;
alter table public.forecasting_hooks add column if not exists description text;
alter table public.forecasting_hooks add column if not exists input_schema jsonb not null default '{}'::jsonb;
alter table public.forecasting_hooks add column if not exists output_schema jsonb not null default '{}'::jsonb;
alter table public.forecasting_hooks add column if not exists is_active boolean not null default true;
alter table public.forecasting_hooks add column if not exists last_invoked_at timestamptz;
alter table public.forecasting_hooks add column if not exists created_at timestamptz not null default now();
alter table public.forecasting_hooks add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_forecasting_hooks_type
  on public.forecasting_hooks (hook_type, is_active);

-- Forecasting hook invocations log
create table if not exists public.forecasting_hook_invocations (
  id uuid primary key default gen_random_uuid(),
  hook_id uuid references public.forecasting_hooks(id) on delete cascade,
  input_data jsonb not null default '{}'::jsonb,
  output_data jsonb not null default '{}'::jsonb,
  duration_ms integer not null default 0,
  status text not null default 'pending',
  error_message text,
  invoked_at timestamptz not null default now()
);

alter table public.forecasting_hook_invocations add column if not exists hook_id uuid references public.forecasting_hooks(id) on delete cascade;
alter table public.forecasting_hook_invocations add column if not exists input_data jsonb not null default '{}'::jsonb;
alter table public.forecasting_hook_invocations add column if not exists output_data jsonb not null default '{}'::jsonb;
alter table public.forecasting_hook_invocations add column if not exists duration_ms integer not null default 0;
alter table public.forecasting_hook_invocations add column if not exists status text not null default 'pending';
alter table public.forecasting_hook_invocations add column if not exists error_message text;
alter table public.forecasting_hook_invocations add column if not exists invoked_at timestamptz not null default now();

create index if not exists idx_forecasting_hook_inv_hook
  on public.forecasting_hook_invocations (hook_id, invoked_at desc);

-- ============================================================
-- EVENT AGGREGATION FUNCTION
-- ============================================================

create or replace function public.aggregate_events_hourly(p_bucket_hour timestamptz)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.event_aggregations_hourly (
    event_type, bucket_hour, event_count, unique_users, unique_sellers, unique_sessions
  )
  select
    ie.event_type,
    date_trunc('hour', ie.created_at) as bucket_hour,
    count(*)::int,
    count(distinct ie.user_id)::int,
    count(distinct ie.seller_id)::int,
    count(distinct ie.session_id)::int
  from public.internal_events ie
  where ie.created_at >= p_bucket_hour
    and ie.created_at < p_bucket_hour + interval '1 hour'
  group by ie.event_type, date_trunc('hour', ie.created_at)
  on conflict (event_type, bucket_hour) do update set
    event_count = excluded.event_count,
    unique_users = excluded.unique_users,
    unique_sellers = excluded.unique_sellers,
    unique_sessions = excluded.unique_sessions;
end;
$$;

create or replace function public.aggregate_events_daily(p_bucket_date date)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.event_aggregations_daily (
    event_type, bucket_date, event_count, unique_users, unique_sellers, unique_sessions
  )
  select
    ie.event_type,
    p_bucket_date,
    count(*)::int,
    count(distinct ie.user_id)::int,
    count(distinct ie.seller_id)::int,
    count(distinct ie.session_id)::int
  from public.internal_events ie
  where ie.created_at::date = p_bucket_date
  group by ie.event_type
  on conflict (event_type, bucket_date) do update set
    event_count = excluded.event_count,
    unique_users = excluded.unique_users,
    unique_sellers = excluded.unique_sellers,
    unique_sessions = excluded.unique_sessions;
end;
$$;

-- ============================================================
-- EVENT STATISTICS FUNCTION
-- ============================================================

create or replace function public.get_event_statistics(
  p_start_date date,
  p_end_date date
)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'totalEvents', coalesce((select count(*)::int from public.internal_events
      where created_at::date between p_start_date and p_end_date), 0),
    'uniqueEventTypes', coalesce((select count(distinct event_type)::int from public.internal_events
      where created_at::date between p_start_date and p_end_date), 0),
    'uniqueUsers', coalesce((select count(distinct user_id)::int from public.internal_events
      where created_at::date between p_start_date and p_end_date and user_id is not null), 0),
    'uniqueSessions', coalesce((select count(distinct session_id)::int from public.internal_events
      where created_at::date between p_start_date and p_end_date and session_id is not null), 0),
    'eventsByType', coalesce((
      select jsonb_agg(jsonb_build_object(
        'eventType', event_type,
        'count', count(*)
      ) order by count(*) desc)
      from public.internal_events
      where created_at::date between p_start_date and p_end_date
      group by event_type
    ), '[]'::jsonb),
    'eventsByDay', coalesce((
      select jsonb_agg(jsonb_build_object(
        'date', created_at::date,
        'count', count(*)
      ) order by created_at::date)
      from public.internal_events
      where created_at::date between p_start_date and p_end_date
      group by created_at::date
    ), '[]'::jsonb)
  );
$$;

-- ============================================================
-- EVENT ARCHIVAL FUNCTION
-- ============================================================

create or replace function public.archive_events(p_cutoff_date date)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.internal_events
  set archived_at = now()
  where created_at::date < p_cutoff_date
    and archived_at is null;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ============================================================
-- RLS POLICIES
-- ============================================================

alter table public.internal_events enable row level security;
drop policy if exists internal_events_admin_all on public.internal_events;
create policy internal_events_admin_all
  on public.internal_events
  for all
  using (
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('admin', 'super_admin'))
  );

drop policy if exists internal_events_insert_authenticated on public.internal_events;
create policy internal_events_insert_authenticated
  on public.internal_events
  for insert
  with check (auth.role() = 'authenticated' or auth.role() = 'service_role');

alter table public.event_aggregations_hourly enable row level security;
drop policy if exists event_aggregations_hourly_admin_read on public.event_aggregations_hourly;
create policy event_aggregations_hourly_admin_read
  on public.event_aggregations_hourly
  for select
  using (
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('admin', 'super_admin'))
  );

alter table public.event_aggregations_daily enable row level security;
drop policy if exists event_aggregations_daily_admin_read on public.event_aggregations_daily;
create policy event_aggregations_daily_admin_read
  on public.event_aggregations_daily
  for select
  using (
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('admin', 'super_admin'))
  );

alter table public.app_metrics enable row level security;
drop policy if exists app_metrics_admin_read on public.app_metrics;
create policy app_metrics_admin_read
  on public.app_metrics
  for select
  using (
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('admin', 'super_admin'))
  );
drop policy if exists app_metrics_insert_service on public.app_metrics;
create policy app_metrics_insert_service
  on public.app_metrics
  for insert
  with check (auth.role() = 'service_role');

alter table public.db_metrics enable row level security;
drop policy if exists db_metrics_admin_read on public.db_metrics;
create policy db_metrics_admin_read
  on public.db_metrics
  for select
  using (
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('admin', 'super_admin'))
  );

alter table public.cache_metrics enable row level security;
drop policy if exists cache_metrics_admin_read on public.cache_metrics;
create policy cache_metrics_admin_read
  on public.cache_metrics
  for select
  using (
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('admin', 'super_admin'))
  );

alter table public.storage_metrics enable row level security;
drop policy if exists storage_metrics_admin_read on public.storage_metrics;
create policy storage_metrics_admin_read
  on public.storage_metrics
  for select
  using (
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('admin', 'super_admin'))
  );

-- Seed forecasting hooks
insert into public.forecasting_hooks (hook_name, hook_type, description, input_schema, output_schema) values
  ('sales_forecast', 'forecast', 'Predict future sales based on historical order data',
   '{"type":"object","properties":{"lookbackDays":{"type":"integer"},"forecastDays":{"type":"integer"}}}',
   '{"type":"object","properties":{"predictions":{"type":"array"},"confidence":{"type":"number"}}}'),
  ('inventory_forecast', 'forecast', 'Predict inventory requirements for products',
   '{"type":"object","properties":{"productIds":{"type":"array"},"forecastDays":{"type":"integer"}}}',
   '{"type":"object","properties":{"recommendations":{"type":"array"}}}'),
  ('revenue_forecast', 'forecast', 'Forecast marketplace revenue trends',
   '{"type":"object","properties":{"period":{"type":"string"},"granularity":{"type":"string"}}}',
   '{"type":"object","properties":{"projections":{"type":"array"},"seasonality":{"type":"object"}}}'),
  ('customer_lifetime_value', 'ml_model', 'Predict customer lifetime value based on behavior',
   '{"type":"object","properties":{"customerIds":{"type":"array"}}}',
   '{"type":"object","properties":{"predictions":{"type":"array"}}}'),
  ('customer_churn', 'ml_model', 'Predict customer churn probability',
   '{"type":"object","properties":{"lookbackDays":{"type":"integer"}}}',
   '{"type":"object","properties":{"atRiskCustomers":{"type":"array"},"churnRate":{"type":"number"}}}'),
  ('demand_forecast', 'forecast', 'Predict product demand across categories',
   '{"type":"object","properties":{"categoryIds":{"type":"array"},"forecastDays":{"type":"integer"}}}',
   '{"type":"object","properties":{"demandPredictions":{"type":"array"}}}'),
  ('seasonal_trends', 'analytics', 'Analyze seasonal patterns in marketplace data',
   '{"type":"object","properties":{"years":{"type":"integer"}}}',
   '{"type":"object","properties":{"trends":{"type":"array"},"seasonality":{"type":"object"}}}'),
  ('recommendation_analytics', 'ml_model', 'Analyze recommendation engine performance',
   '{"type":"object","properties":{"modelId":{"type":"string"}}}',
   '{"type":"object","properties":{"metrics":{"type":"object"},"suggestions":{"type":"array"}}}')
on conflict (hook_name) do nothing;
