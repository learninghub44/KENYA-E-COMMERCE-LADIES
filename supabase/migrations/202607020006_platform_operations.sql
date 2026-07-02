-- Agent 12 (Part 2): Platform Operations — rate limits, maintenance mode, health check logs

create table if not exists public.platform_rate_limits (
  id bigint generated always as identity primary key,
  limit_type text not null check (limit_type in ('user', 'seller', 'admin', 'api', 'ip')),
  limit_key text not null,
  window_start timestamptz not null default now(),
  window_seconds integer not null default 60,
  max_requests integer not null default 100,
  current_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (limit_type, limit_key, window_start)
);

create index if not exists idx_platform_rate_limits_lookup
  on public.platform_rate_limits (limit_type, limit_key, window_start desc);

create table if not exists public.platform_maintenance_windows (
  id uuid primary key default gen_random_uuid(),
  maintenance_type text not null default 'global' check (maintenance_type in ('global', 'read_only', 'scheduled')),
  is_active boolean not null default false,
  message text,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_platform_maintenance_active
  on public.platform_maintenance_windows (is_active) where is_active = true;

create table if not exists public.platform_audit_log (
  id bigint generated always as identity primary key,
  action text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_role text,
  resource_type text not null,
  resource_id text,
  details jsonb not null default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists idx_platform_audit_log_actor
  on public.platform_audit_log (actor_id, created_at desc);
create index if not exists idx_platform_audit_log_action
  on public.platform_audit_log (action, created_at desc);
create index if not exists idx_platform_audit_log_resource
  on public.platform_audit_log (resource_type, resource_id);

alter table public.platform_rate_limits enable row level security;
drop policy if exists platform_rate_limits_admin_all on public.platform_rate_limits;
create policy platform_rate_limits_admin_all
  on public.platform_rate_limits for all
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('admin', 'super_admin')));
drop policy if exists platform_rate_limits_service_all on public.platform_rate_limits;
create policy platform_rate_limits_service_all
  on public.platform_rate_limits for all
  with check (auth.role() = 'service_role');

alter table public.platform_maintenance_windows enable row level security;
drop policy if exists platform_maintenance_admin_all on public.platform_maintenance_windows;
create policy platform_maintenance_admin_all
  on public.platform_maintenance_windows for all
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('admin', 'super_admin')));
drop policy if exists platform_maintenance_read_authenticated on public.platform_maintenance_windows;
create policy platform_maintenance_read_authenticated
  on public.platform_maintenance_windows for select
  using (is_active = true);

alter table public.platform_audit_log enable row level security;
drop policy if exists platform_audit_log_admin_read on public.platform_audit_log;
create policy platform_audit_log_admin_read
  on public.platform_audit_log for select
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('admin', 'super_admin')));
drop policy if exists platform_audit_log_service_insert on public.platform_audit_log;
create policy platform_audit_log_service_insert
  on public.platform_audit_log for insert
  with check (auth.role() = 'service_role');

create or replace function public.platform_increment_rate_limit(
  p_limit_type text,
  p_limit_key text,
  p_window_seconds integer default 60,
  p_max_requests integer default 100
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window_start timestamptz;
  v_allowed boolean;
begin
  v_window_start := date_trunc('minute', now()) - (mod(extract('epoch' from now())::integer, p_window_seconds) || ' seconds')::interval;

  insert into public.platform_rate_limits (limit_type, limit_key, window_start, window_seconds, max_requests, current_count)
  values (p_limit_type, p_limit_key, v_window_start, p_window_seconds, p_max_requests, 1)
  on conflict (limit_type, limit_key, window_start) do update
    set current_count = platform_rate_limits.current_count + 1,
        updated_at = now();

  select current_count <= max_requests into v_allowed
  from public.platform_rate_limits
  where limit_type = p_limit_type
    and limit_key = p_limit_key
    and window_start = v_window_start;

  return v_allowed;
end;
$$;

create or replace function public.platform_get_rate_limit(
  p_limit_type text,
  p_limit_key text,
  p_window_seconds integer default 60
)
returns table (
  current_count integer,
  max_requests integer,
  window_start timestamptz,
  remaining integer,
  reset_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_window_start timestamptz;
begin
  v_window_start := date_trunc('minute', now()) - (mod(extract('epoch' from now())::integer, p_window_seconds) || ' seconds')::interval;

  return query
  select
    r.current_count,
    r.max_requests,
    r.window_start,
    greatest(0, r.max_requests - r.current_count) as remaining,
    v_window_start + (p_window_seconds || ' seconds')::interval as reset_at
  from public.platform_rate_limits r
  where r.limit_type = p_limit_type
    and r.limit_key = p_limit_key
    and r.window_start = v_window_start;
end;
$$;

create or replace function public.platform_get_active_maintenance()
returns table (
  id uuid,
  maintenance_type text,
  message text,
  scheduled_start timestamptz,
  scheduled_end timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select id, maintenance_type, message, scheduled_start, scheduled_end
  from public.platform_maintenance_windows
  where is_active = true
  order by created_at desc
  limit 1;
$$;
