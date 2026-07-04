-- Adds a dedicated "kyc_reviewer" role, separate from moderator/admin, so KYC manual review
-- can be assigned to staff without granting full moderation or admin access.
-- Postgres requires a new enum value to be committed before it can be referenced in policies/
-- functions, so this is split into its own migration ahead of 202607030003.

do $$
begin
  if not exists (
    select 1 from pg_enum
    where enumlabel = 'kyc_reviewer'
      and enumtypid = 'public.app_role'::regtype
  ) then
    alter type public.app_role add value 'kyc_reviewer';
  end if;
end $$;
