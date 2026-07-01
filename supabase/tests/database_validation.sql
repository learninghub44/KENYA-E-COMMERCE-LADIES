-- Database validation checks for local Supabase review.
-- Run after `supabase db reset` and `psql -f supabase/seed/dev_seed.sql`.

begin;

-- Required buckets exist with expected visibility.
select id, public
from storage.buckets
where id in (
  'product-images',
  'seller-documents',
  'kyc-documents',
  'store-logos',
  'store-banners',
  'user-avatars',
  'promotional-banners',
  'cms-assets'
)
order by id;

-- Every public table has RLS enabled.
select relname as table_without_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relrowsecurity = false
order by relname;

-- High-volume tables have the expected seek/pagination indexes.
select indexname
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'idx_products_seller_active_pagination',
    'idx_orders_buyer_status_pagination',
    'idx_orders_seller_payment_fulfillment',
    'idx_messages_conversation_seek',
    'idx_analytics_events_time'
  )
order by indexname;

-- Constraint checks should fail if uncommented.
-- insert into public.orders (
--   order_number, buyer_id, seller_id, subtotal_minor, shipping_minor, discount_minor,
--   tax_minor, total_minor, currency, shipping_address
-- ) values (
--   'INVALID-TOTAL', gen_random_uuid(), gen_random_uuid(), 1000, 100, 0,
--   0, 999, 'KES', '{}'::jsonb
-- );

-- RLS smoke-test pattern for Agent 2 once auth users exist:
-- set local role authenticated;
-- set local request.jwt.claim.sub = '<auth-user-id>';
-- select * from public.profiles;

rollback;
