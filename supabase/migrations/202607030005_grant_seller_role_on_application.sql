-- Auto-grant the "seller" role when a user creates their seller/store row.
--
-- Context: public.sellers already has a correct RLS policy letting a user
-- create their own store ("seller owners can create stores" ... with check
-- (owner_id = auth.uid())). What's missing is the role grant: public.user_roles
-- can only be written by staff ("roles are staff managed"), so a buyer who
-- submits a seller application has no legal way to grant themselves the
-- "seller" role from the client. lib/seller/seller-service.ts already expects
-- this to happen (see the apply() method), it just has nothing that can
-- perform it under RLS.
--
-- Fix: the same SECURITY DEFINER trigger pattern used for auto-provisioning
-- profiles/buyer role in 202607030004. This does not bypass moderation --
-- the store itself is still created with status 'draft' and kyc_status
-- 'not_started', so the seller can operate their dashboard but stays subject
-- to whatever KYC/approval gates the rest of the app enforces before going
-- live (see kyc_status / seller status transitions in lib/seller/status.ts).

create or replace function public.handle_new_seller()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role, granted_by)
  values (new.owner_id, 'seller', new.owner_id)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists on_seller_created on public.sellers;

create trigger on_seller_created
  after insert on public.sellers
  for each row execute function public.handle_new_seller();
