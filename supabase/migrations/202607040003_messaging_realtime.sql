-- Messaging realtime: the storefront/seller messages pages currently only
-- fetch on mount and after sending, so a reply from the other party is never
-- seen without a manual reload. Existing RLS policies ("participants view
-- messages" / "participants view conversations") already scope rows
-- correctly per-user, so it's safe to add these tables to the realtime
-- publication and subscribe to postgres_changes client-side.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'conversations'
  ) then
    alter publication supabase_realtime add table public.conversations;
  end if;
end $$;
