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

-- Every public table is forced through RLS, including table-owner access.
select relname as table_without_forced_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relforcerowsecurity = false
order by relname;

-- Browser-facing roles must not be able to create objects in the public schema.
select grantee as role_with_public_schema_create
from (
  select
    case when acl.grantee = 0 then 'PUBLIC' else r.rolname end as grantee,
    acl.privilege_type
  from pg_namespace n
  cross join lateral aclexplode(n.nspacl) acl
  left join pg_roles r on r.oid = acl.grantee
  where n.nspname = 'public'
) schema_grants
where privilege_type = 'CREATE'
  and grantee in ('PUBLIC', 'anon', 'authenticated')
order by grantee;

-- Trigger-only functions should not be directly executable by browser-facing roles.
select routine_name, grantee
from information_schema.routine_privileges
where specific_schema = 'public'
  and routine_name in ('set_updated_at', 'set_product_search_vector')
  and grantee in ('PUBLIC', 'anon', 'authenticated')
order by routine_name, grantee;

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
