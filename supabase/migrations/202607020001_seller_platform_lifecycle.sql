-- Agent 03 seller platform lifecycle additions.
-- Extends Agent 01 enums without replacing existing values used by earlier branches.

alter type public.seller_status add value if not exists 'pending';
alter type public.seller_status add value if not exists 'under_review';
alter type public.seller_status add value if not exists 'approved';
alter type public.seller_status add value if not exists 'rejected';
alter type public.seller_status add value if not exists 'inactive';

alter type public.kyc_status add value if not exists 'manual_review';

create index if not exists idx_sellers_owner_status_updated
  on public.sellers(owner_id, status, updated_at desc);

create index if not exists idx_sellers_kyc_status_updated
  on public.sellers(kyc_status, updated_at desc);

create index if not exists idx_kyc_verifications_provider_reference
  on public.kyc_verifications(provider, provider_reference)
  where provider_reference is not null;
