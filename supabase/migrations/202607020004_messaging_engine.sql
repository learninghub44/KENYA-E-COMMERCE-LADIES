-- Agent 06 (Messaging): buyer <-> seller conversations, messages, attachments, and moderation hooks.
-- Notification delivery, AI moderation, and real-time infrastructure intentionally remain out of scope.

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.sellers(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  product_snapshot jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'archived')),
  buyer_deleted_at timestamptz,
  seller_deleted_at timestamptz,
  buyer_unread_count integer not null default 0 check (buyer_unread_count >= 0),
  seller_unread_count integer not null default 0 check (seller_unread_count >= 0),
  last_message_at timestamptz,
  last_message_preview text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One conversation per buyer/seller/product combination (product_id may be null for
-- general, non-product-scoped conversations).
create unique index if not exists idx_conversations_buyer_seller_product
  on public.conversations(buyer_id, seller_id, coalesce(product_id, '00000000-0000-0000-0000-000000000000'::uuid));

create index if not exists idx_conversations_buyer_activity on public.conversations(buyer_id, last_message_at desc nulls last);
create index if not exists idx_conversations_seller_activity on public.conversations(seller_id, last_message_at desc nulls last);
create index if not exists idx_conversations_order on public.conversations(order_id) where order_id is not null;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text,
  reply_to_message_id uuid references public.messages(id) on delete set null,
  delivered_at timestamptz,
  read_at timestamptz,
  edited_at timestamptz,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conversation_created on public.messages(conversation_id, created_at desc);
create index if not exists idx_messages_sender on public.messages(sender_id, created_at desc);

-- Full-text search over non-deleted message bodies.
create index if not exists idx_messages_body_search
  on public.messages using gin (to_tsvector('english', coalesce(body, '')))
  where deleted_at is null;

create table if not exists public.message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  url text not null,
  cloudinary_public_id text not null,
  mime_type text not null check (mime_type like 'image/%'),
  width integer,
  height integer,
  bytes integer,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_message_attachments_message on public.message_attachments(message_id, position);

create table if not exists public.message_moderation_events (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references public.messages(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  event_type text not null check (event_type in ('reported', 'deleted', 'user_blocked', 'suspicious_content')),
  actor_id uuid references public.profiles(id) on delete set null,
  target_user_id uuid references public.profiles(id) on delete set null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_message_moderation_events_message on public.message_moderation_events(message_id);
create index if not exists idx_message_moderation_events_conversation on public.message_moderation_events(conversation_id, created_at desc);

drop trigger if exists set_conversations_updated_at on public.conversations;
create trigger set_conversations_updated_at before update on public.conversations for each row execute function public.set_updated_at();

-- Keeps conversation last-message metadata and unread counters in sync whenever a
-- message is inserted. Application code still owns marking messages as read.
create or replace function public.on_message_inserted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  convo record;
  preview text;
begin
  select buyer_id, seller_id into convo from public.conversations where id = new.conversation_id;

  preview := case
    when new.body is not null then left(new.body, 140)
    else '[attachment]'
  end;

  update public.conversations
  set last_message_at = new.created_at,
      last_message_preview = preview,
      buyer_unread_count = case when new.sender_id = convo.buyer_id then buyer_unread_count else buyer_unread_count + 1 end,
      seller_unread_count = case when new.sender_id = convo.buyer_id then seller_unread_count + 1 else seller_unread_count end,
      updated_at = now()
  where id = new.conversation_id;

  return new;
end;
$$;

drop trigger if exists on_message_inserted on public.messages;
create trigger on_message_inserted after insert on public.messages for each row execute function public.on_message_inserted();

alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.message_attachments enable row level security;
alter table public.message_moderation_events enable row level security;

drop policy if exists "participants view conversations" on public.conversations;
create policy "participants view conversations" on public.conversations
  for select using (
    buyer_id = auth.uid()
    or public.current_user_can_manage_seller(seller_id)
    or public.current_user_is_staff()
  );

drop policy if exists "buyers create conversations" on public.conversations;
create policy "buyers create conversations" on public.conversations
  for insert with check (buyer_id = auth.uid());

drop policy if exists "participants update conversations" on public.conversations;
create policy "participants update conversations" on public.conversations
  for update using (
    buyer_id = auth.uid()
    or public.current_user_can_manage_seller(seller_id)
    or public.current_user_is_staff()
  ) with check (
    buyer_id = auth.uid()
    or public.current_user_can_manage_seller(seller_id)
    or public.current_user_is_staff()
  );

drop policy if exists "participants view messages" on public.messages;
create policy "participants view messages" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or public.current_user_can_manage_seller(c.seller_id) or public.current_user_is_staff())
    )
  );

drop policy if exists "participants send messages" on public.messages;
create policy "participants send messages" on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or public.current_user_can_manage_seller(c.seller_id))
    )
  );

drop policy if exists "senders edit own messages" on public.messages;
create policy "senders edit own messages" on public.messages
  for update using (
    sender_id = auth.uid()
    or public.current_user_is_staff()
  ) with check (
    sender_id = auth.uid()
    or public.current_user_is_staff()
  );

drop policy if exists "participants view attachments" on public.message_attachments;
create policy "participants view attachments" on public.message_attachments
  for select using (
    exists (
      select 1 from public.messages m
      join public.conversations c on c.id = m.conversation_id
      where m.id = message_id
        and (c.buyer_id = auth.uid() or public.current_user_can_manage_seller(c.seller_id) or public.current_user_is_staff())
    )
  );

drop policy if exists "senders add attachments" on public.message_attachments;
create policy "senders add attachments" on public.message_attachments
  for insert with check (
    exists (
      select 1 from public.messages m
      where m.id = message_id and m.sender_id = auth.uid()
    )
  );

drop policy if exists "participants view moderation events" on public.message_moderation_events;
create policy "participants view moderation events" on public.message_moderation_events
  for select using (public.current_user_is_staff());

drop policy if exists "participants create moderation events" on public.message_moderation_events;
create policy "participants create moderation events" on public.message_moderation_events
  for insert with check (
    actor_id = auth.uid()
    and (
      message_id is null
      or exists (
        select 1 from public.messages m
        join public.conversations c on c.id = m.conversation_id
        where m.id = message_id
          and (c.buyer_id = auth.uid() or public.current_user_can_manage_seller(c.seller_id))
      )
    )
  );

comment on table public.conversations is
  'Buyer <-> seller conversations, optionally scoped to a product, variant, or order.';
comment on table public.messages is
  'Individual messages within a conversation. Soft-deleted via deleted_at, never hard-removed.';
comment on function public.on_message_inserted() is
  'Trigger: updates conversation last-message preview/timestamp and per-participant unread counters.';
