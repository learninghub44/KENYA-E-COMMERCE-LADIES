-- Auto-provision profile + default role for every new auth.users row.
--
-- Bug: registration created an auth.users row but nothing else. RLS on
-- public.profiles has no insert policy for a plain user (only self-select,
-- self-update, and staff-managed "for all"), and public.user_roles can only
-- be written by staff. So a freshly signed-up user could never create their
-- own profile row or grant themselves the "buyer" role from the client --
-- they would end up authenticated but roleless and profile-less, unable to
-- pass any permission check in the app (see lib/permissions, middleware.ts).
--
-- Fix: a SECURITY DEFINER trigger on auth.users, matching the existing
-- security-definer pattern used by current_user_is_staff() etc. This runs
-- with elevated privileges and bypasses RLS safely, the same way Supabase
-- projects normally handle this. It also covers OAuth sign-ins for free,
-- since those create an auth.users row the same way password sign-up does.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role, granted_by)
  values (new.id, 'buyer', new.id)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
