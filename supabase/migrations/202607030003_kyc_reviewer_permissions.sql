-- Scopes KYC manual-review access to admin, super_admin, moderator, and the new kyc_reviewer
-- role, without widening the general "staff" (profiles/user_roles/countries) grant to
-- kyc_reviewer. Also fixes current_user_is_staff() to include super_admin, which was
-- missing from the original definition.

create or replace function public.current_user_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_has_role('admin')
    or public.current_user_has_role('super_admin')
    or public.current_user_has_role('moderator');
$$;

create or replace function public.current_user_can_review_kyc()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_is_staff()
    or public.current_user_has_role('kyc_reviewer');
$$;

drop policy if exists "kyc staff managed" on public.kyc_verifications;
create policy "kyc staff managed" on public.kyc_verifications
  for update
  using (public.current_user_can_review_kyc())
  with check (public.current_user_can_review_kyc());

-- kyc_reviewer also needs to see the seller + profile rows attached to a verification
-- (kyc-review-client.tsx joins sellers -> profiles), scoped narrowly to that purpose.
drop policy if exists "sellers visible to kyc reviewers" on public.sellers;
create policy "sellers visible to kyc reviewers" on public.sellers
  for select
  using (public.current_user_can_review_kyc());

drop policy if exists "profiles visible to kyc reviewers" on public.profiles;
create policy "profiles visible to kyc reviewers" on public.profiles
  for select
  using (public.current_user_can_review_kyc());
