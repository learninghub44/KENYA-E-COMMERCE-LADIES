-- Agent 12 (Part 1): Platform Infrastructure — background jobs, cache, configuration, file tracking

create table if not exists public.platform_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null,
  queue text not null default 'default',
  priority integer not null default 5 check (priority between 1 and 10),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed', 'cancelled', 'dead_letter')),
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  error_stack text,
  dead_letter_at timestamptz,
  recurring_cron text,
  timeout_seconds integer not null default 30,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_platform_jobs_status_queue
  on public.platform_jobs (status, queue, priority desc, created_at);
create index if not exists idx_platform_jobs_scheduled
  on public.platform_jobs (scheduled_at) where status = 'pending' and scheduled_at is not null;
create index if not exists idx_platform_jobs_recurring
  on public.platform_jobs (recurring_cron) where recurring_cron is not null;

create or replace function public.platform_claim_next_job(p_queue text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job_id uuid;
begin
  select id into v_job_id
  from public.platform_jobs
  where status = 'pending'
    and queue = p_queue
    and (scheduled_at is null or scheduled_at <= now())
    and attempts < max_attempts
  order by priority desc, created_at
  limit 1
  for update skip locked;

  if v_job_id is not null then
    update public.platform_jobs
    set status = 'running', started_at = now(), attempts = attempts + 1
    where id = v_job_id;
  end if;

  return v_job_id;
end;
$$;

create or replace function public.platform_complete_job(p_job_id uuid, p_error_message text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_error_message is not null then
    update public.platform_jobs
    set status = case when attempts >= max_attempts then 'dead_letter' else 'pending' end,
        error_message = p_error_message,
        completed_at = now()
    where id = p_job_id;
  else
    update public.platform_jobs
    set status = 'completed', completed_at = now()
    where id = p_job_id;
  end if;
end;
$$;

create table if not exists public.platform_job_logs (
  id bigint generated always as identity primary key,
  job_id uuid not null references public.platform_jobs(id) on delete cascade,
  level text not null default 'info' check (level in ('debug', 'info', 'warn', 'error')),
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_platform_job_logs_job
  on public.platform_job_logs (job_id, created_at);

create table if not exists public.platform_cache_entries (
  id bigint generated always as identity primary key,
  cache_namespace text not null default 'default',
  cache_key text not null,
  cache_value jsonb not null default '{}'::jsonb,
  ttl_seconds integer,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cache_namespace, cache_key)
);

create index if not exists idx_platform_cache_expires
  on public.platform_cache_entries (expires_at) where expires_at is not null;
create index if not exists idx_platform_cache_namespace
  on public.platform_cache_entries (cache_namespace);

create or replace function public.platform_clear_expired_cache()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  delete from public.platform_cache_entries
  where expires_at is not null and expires_at < now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create table if not exists public.platform_config (
  id bigint generated always as identity primary key,
  config_key text not null unique,
  config_value jsonb not null default '{}'::jsonb,
  config_type text not null default 'string' check (config_type in ('string', 'number', 'boolean', 'json', 'secret')),
  description text,
  is_feature_flag boolean not null default false,
  is_encrypted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.platform_get_config(p_key text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select config_value from public.platform_config where config_key = p_key;
$$;

create or replace function public.platform_set_config(p_key text, p_value jsonb, p_type text default 'string')
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.platform_config (config_key, config_value, config_type)
  values (p_key, p_value, p_type)
  on conflict (config_key) do update set
    config_value = excluded.config_value,
    config_type = excluded.config_type,
    updated_at = now();
end;
$$;

create table if not exists public.platform_files (
  id uuid primary key default gen_random_uuid(),
  file_path text not null,
  file_name text not null,
  mime_type text not null,
  file_size_bytes bigint not null,
  storage_provider text not null default 'cloudinary',
  storage_bucket text,
  public_url text,
  checksum text,
  entity_type text,
  entity_id uuid,
  uploaded_by uuid references public.profiles(id) on delete set null,
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_platform_files_path
  on public.platform_files (file_path) where is_deleted = false;
create index if not exists idx_platform_files_entity
  on public.platform_files (entity_type, entity_id);
create index if not exists idx_platform_files_uploaded_by
  on public.platform_files (uploaded_by);
create index if not exists idx_platform_files_checksum
  on public.platform_files (checksum) where checksum is not null and is_deleted = false;

create table if not exists public.platform_storage_metrics (
  id bigint generated always as identity primary key,
  storage_provider text not null default 'cloudinary',
  total_bytes bigint not null default 0,
  total_files integer not null default 0,
  orphan_files integer not null default 0,
  recorded_at timestamptz not null default now()
);

create index if not exists idx_platform_storage_metrics_provider
  on public.platform_storage_metrics (storage_provider, recorded_at desc);

alter table public.platform_jobs enable row level security;
drop policy if exists platform_jobs_admin_all on public.platform_jobs;
create policy platform_jobs_admin_all
  on public.platform_jobs for all
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('admin', 'super_admin')));
drop policy if exists platform_jobs_service_insert on public.platform_jobs;
create policy platform_jobs_service_insert
  on public.platform_jobs for insert
  with check (auth.role() = 'service_role');

alter table public.platform_job_logs enable row level security;
drop policy if exists platform_job_logs_admin_read on public.platform_job_logs;
create policy platform_job_logs_admin_read
  on public.platform_job_logs for select
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('admin', 'super_admin')));

alter table public.platform_cache_entries enable row level security;
drop policy if exists platform_cache_admin_all on public.platform_cache_entries;
create policy platform_cache_admin_all
  on public.platform_cache_entries for all
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('admin', 'super_admin')));
drop policy if exists platform_cache_service_all on public.platform_cache_entries;
create policy platform_cache_service_all
  on public.platform_cache_entries for all
  with check (auth.role() = 'service_role');

alter table public.platform_config enable row level security;
drop policy if exists platform_config_admin_all on public.platform_config;
create policy platform_config_admin_all
  on public.platform_config for all
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('admin', 'super_admin')));

alter table public.platform_files enable row level security;
drop policy if exists platform_files_admin_read on public.platform_files;
create policy platform_files_admin_read
  on public.platform_files for select
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('admin', 'super_admin')));
drop policy if exists platform_files_insert_authenticated on public.platform_files;
create policy platform_files_insert_authenticated
  on public.platform_files for insert
  with check (auth.role() = 'authenticated' or auth.role() = 'service_role');

alter table public.platform_storage_metrics enable row level security;
drop policy if exists platform_storage_metrics_admin_read on public.platform_storage_metrics;
create policy platform_storage_metrics_admin_read
  on public.platform_storage_metrics for select
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('admin', 'super_admin')));
