-- Admin moderation: wire the reports table and message_moderation_events table
-- (both previously unused by application code) into the moderation queue.

-- report-service.ts already models an `internalNotes: string[]` field on
-- ReportRecord, but the reports table has no backing column for it.
alter table public.reports
  add column if not exists internal_notes jsonb not null default '[]'::jsonb;

-- moderation-service.ts needs to record admin "warn user" actions alongside
-- the existing reported/deleted/user_blocked/suspicious_content events.
alter table public.message_moderation_events
  drop constraint if exists message_moderation_events_event_type_check;

alter table public.message_moderation_events
  add constraint message_moderation_events_event_type_check
  check (event_type in ('reported', 'deleted', 'user_blocked', 'suspicious_content', 'warned'));

-- Existing "reports reporter staff read" / "reports staff update" policies
-- (from 202607010001_foundation_schema.sql) already cover staff select/update
-- access needed by the moderation queue, so no new RLS policies are required.

-- The "participants create moderation events" insert policy only allowed a
-- conversation's buyer or seller to log an event against a message. Admins
-- moderating someone else's conversation (deleting a message, warning or
-- suspending a user) were never covered, so extend the check to staff.
drop policy if exists "participants create moderation events" on public.message_moderation_events;
create policy "participants create moderation events" on public.message_moderation_events
  for insert with check (
    actor_id = auth.uid()
    and (
      message_id is null
      or public.current_user_is_staff()
      or exists (
        select 1 from public.messages m
        join public.conversations c on c.id = m.conversation_id
        where m.id = message_id
          and (c.buyer_id = auth.uid() or public.current_user_can_manage_seller(c.seller_id))
      )
    )
  );
