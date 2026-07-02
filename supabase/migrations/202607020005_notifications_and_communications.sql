-- Agent 08 (Notifications & Platform Communications): durable event log, in-app notifications,
-- per-user notification preferences, outbound email queue, and admin broadcasts.
-- Real-time delivery (websockets/push) and the concrete email provider client intentionally
-- remain out of scope; this migration lays down the storage the service layer writes through.

create table if not exists public.platform_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  actor_id uuid references public.profiles(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_platform_events_type_created on public.platform_events(event_type, created_at desc);
create index if not exists idx_platform_events_unprocessed on public.platform_events(created_at) where processed_at is null;
create index if not exists idx_platform_events_entity on public.platform_events(entity_type, entity_id);

create table if not exists public.notification_categories (
  key text primary key,
  label text not null,
  description text not null default '',
  is_security boolean not null default false
);

insert into public.notification_categories (key, label, description, is_security) values
  ('orders', 'Order updates', 'New orders, status changes, and shipping updates.', false),
  ('messaging', 'Messaging', 'New messages and read receipts.', false),
  ('seller', 'Seller lifecycle', 'Seller application and product approval or rejection.', false),
  ('account', 'Account status', 'Changes to your account status.', false),
  ('reviews', 'Reviews', 'New reviews on your products or purchases.', false),
  ('announcements', 'Platform announcements', 'Admin broadcasts and maintenance notices.', false),
  ('security', 'Security alerts', 'Password resets, new sign-ins, and other security events.', true)
on conflict (key) do nothing;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null references public.notification_categories(key),
  type text not null,
  title text not null,
  body text not null default '',
  data jsonb not null default '{}'::jsonb,
  source_event_id uuid references public.platform_events(id) on delete set null,
  read_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_created on public.notifications(user_id, created_at desc);
create index if not exists idx_notifications_user_unread
  on public.notifications(user_id, created_at desc) where read_at is null and archived_at is null;
create index if not exists idx_notifications_user_category on public.notifications(user_id, category, created_at desc);

create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  email_enabled boolean not null default true,
  in_app_enabled boolean not null default true,
  marketing_emails boolean not null default false,
  order_updates boolean not null default true,
  messaging_notifications boolean not null default true,
  security_notifications boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Security notifications can never be fully silenced; this constraint backstops the
-- application-layer check in the preference service.
alter table public.notification_preferences
  add constraint notification_preferences_security_always_on check (security_notifications = true);

create table if not exists public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  to_email text not null,
  template text not null,
  subject text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'sending', 'sent', 'failed', 'skipped')),
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  provider_message_id text,
  source_event_id uuid references public.platform_events(id) on delete set null,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists idx_email_outbox_status_created on public.email_outbox(status, created_at) where status in ('pending', 'sending');
create index if not exists idx_email_outbox_user on public.email_outbox(user_id, created_at desc);

create table if not exists public.admin_broadcasts (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  body text not null,
  severity text not null default 'info' check (severity in ('info', 'maintenance', 'emergency')),
  audience text not null default 'all' check (audience in ('all', 'buyers', 'sellers', 'admins', 'segment')),
  audience_filter jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'expired')),
  published_at timestamptz,
  expires_at timestamptz,
  recipient_count integer not null default 0 check (recipient_count >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_broadcasts_status_published on public.admin_broadcasts(status, published_at desc);

drop trigger if exists set_notification_preferences_updated_at on public.notification_preferences;
create trigger set_notification_preferences_updated_at before update on public.notification_preferences
  for each row execute function public.set_updated_at();

alter table public.platform_events enable row level security;
alter table public.notification_categories enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.email_outbox enable row level security;
alter table public.admin_broadcasts enable row level security;

-- Events, the email outbox, and category metadata are internal/staff surfaces; end users never
-- query these tables directly, only through the notification service.
drop policy if exists "staff view platform events" on public.platform_events;
create policy "staff view platform events" on public.platform_events
  for select using (public.current_user_is_staff());

drop policy if exists "everyone reads notification categories" on public.notification_categories;
create policy "everyone reads notification categories" on public.notification_categories
  for select using (true);

drop policy if exists "staff view email outbox" on public.email_outbox;
create policy "staff view email outbox" on public.email_outbox
  for select using (public.current_user_is_staff());

drop policy if exists "users view own notifications" on public.notifications;
create policy "users view own notifications" on public.notifications
  for select using (user_id = auth.uid() or public.current_user_is_staff());

drop policy if exists "users update own notifications" on public.notifications;
create policy "users update own notifications" on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "users view own notification preferences" on public.notification_preferences;
create policy "users view own notification preferences" on public.notification_preferences
  for select using (user_id = auth.uid() or public.current_user_is_staff());

drop policy if exists "users manage own notification preferences" on public.notification_preferences;
create policy "users manage own notification preferences" on public.notification_preferences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "everyone reads published broadcasts" on public.admin_broadcasts;
create policy "everyone reads published broadcasts" on public.admin_broadcasts
  for select using (status = 'published' or public.current_user_is_staff());

drop policy if exists "staff manage broadcasts" on public.admin_broadcasts;
create policy "staff manage broadcasts" on public.admin_broadcasts
  for insert with check (public.current_user_is_staff());

drop policy if exists "staff update broadcasts" on public.admin_broadcasts;
create policy "staff update broadcasts" on public.admin_broadcasts
  for update using (public.current_user_is_staff()) with check (public.current_user_is_staff());

comment on table public.platform_events is
  'Durable, ordered log of domain events emitted by other agents. Source of truth for the event bus.';
comment on table public.notifications is
  'In-app notifications delivered to a single user. Never hard-deleted by users; delete = archive at data layer.';
comment on table public.notification_preferences is
  'Per-user opt in/out flags. security_notifications is pinned true and cannot be disabled.';
comment on table public.email_outbox is
  'Outbound transactional email queue. Processed asynchronously by the email service worker.';
comment on table public.admin_broadcasts is
  'Platform-wide or targeted announcements created by staff. Fan out to notifications on publish.';
