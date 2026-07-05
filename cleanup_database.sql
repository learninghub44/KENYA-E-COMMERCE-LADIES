-- ============================================================
-- CLEANUP SCRIPT: Drop everything before running production_schema.sql
-- Run this FIRST, then run production_schema.sql
-- ============================================================

-- Disable RLS first to avoid permission issues during drops
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sellers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seller_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seller_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seller_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_search_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.carts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wishlist_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_status_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.refunds DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.delivery_partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.support_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.support_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_training_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kyc_verifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_audit_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.moderation_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.platform_maintenance_windows DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.platform_cache_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_aggregations_hourly DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_aggregations_daily DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.internal_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.security_audit_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inventory_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.message_attachments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.message_moderation_events DISABLE ROW LEVEL SECURITY;

-- Drop all triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_seller_created ON public.sellers;
DROP TRIGGER IF ON public.profiles;
DROP TRIGGER IF ON public.sellers;
DROP TRIGGER IF ON public.products;
DROP TRIGGER IF ON public.orders;
DROP TRIGGER IF ON public.addresses;
DROP TRIGGER IF ON public.carts;
DROP TRIGGER IF ON public.cart_items;
DROP TRIGGER IF ON public.wishlist_items;
DROP TRIGGER IF ON public.reviews;
DROP TRIGGER IF ON public.categories;
DROP TRIGGER IF ON public.brands;
DROP TRIGGER IF ON public.coupons;
DROP TRIGGER IF ON public.seller_members;
DROP TRIGGER IF ON public.seller_products;
DROP TRIGGER IF ON public.support_tickets;
DROP TRIGGER IF ON public.conversations;
DROP TRIGGER IF ON public.messages;
DROP TRIGGER IF ON public.kyc_verifications;
DROP TRIGGER IF ON public.admin_users;
DROP TRIGGER IF ON public.admin_roles;
DROP TRIGGER IF ON public.admin_audit_log;
DROP TRIGGER IF ON public.moderation_queue;
DROP TRIGGER IF ON public.refunds;
DROP TRIGGER IF ON public.delivery_partners;
DROP TRIGGER IF ON public.seller_invitations;
DROP TRIGGER IF ON public.user_roles;
DROP TRIGGER IF ON public.inventory_items;
DROP TRIGGER IF ON public.inventory_movements;
DROP TRIGGER IF ON public.platform_cache_entries;
DROP TRIGGER IF ON public.support_responses;
DROP TRIGGER IF ON public.on_message_inserted ON public.messages;
DROP TRIGGER IF ON public.messages;
DROP TRIGGER IF ON public.order_status_history;
DROP TRIGGER IF ON public.kyc_verifications;
DROP TRIGGER IF ON public.internal_events;
DROP TRIGGER IF ON public.moderation_queue;
DROP TRIGGER IF ON public.seller_products;

-- Drop ALL triggers on all tables in public schema
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT triggername, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public' LOOP
    EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.triggername) || ' ON public.' || quote_ident(r.event_object_table) || ' CASCADE';
  END LOOP;
END $$;

-- Drop trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_seller() CASCADE;
DROP FUNCTION IF EXISTS public.sync_seller_to_profile() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.on_message_inserted() CASCADE;
DROP FUNCTION IF EXISTS public.on_order_status_inserted() CASCADE;
DROP FUNCTION IF EXISTS public.on_kyc_inserted() CASCADE;
DROP FUNCTION IF EXISTS public.on_support_response_inserted() CASCADE;
DROP FUNCTION IF EXISTS public.on_internal_event_inserted() CASCADE;
DROP FUNCTION IF EXISTS public.on_moderation_inserted() CASCADE;
DROP FUNCTION IF EXISTS public.update_seller_products_search_vector() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_seller() CASCADE;
DROP FUNCTION IF EXISTS public.is_kyc_reviewer() CASCADE;
DROP FUNCTION IF EXISTS public.search_products_ranked() CASCADE;
DROP FUNCTION IF EXISTS public.reserve_inventory_item() CASCADE;
DROP FUNCTION IF EXISTS public.release_inventory_item() CASCADE;
DROP FUNCTION IF EXISTS public.platform_get_active_maintenance() CASCADE;
DROP FUNCTION IF EXISTS public.platform_clear_expired_cache() CASCADE;
DROP FUNCTION IF EXISTS public.aggregate_events_hourly() CASCADE;
DROP FUNCTION IF EXISTS public.aggregate_events_daily() CASCADE;
DROP FUNCTION IF EXISTS public.grant_admin_role() CASCADE;
DROP FUNCTION IF EXISTS public.revoke_admin_role() CASCADE;
DROP FUNCTION IF EXISTS public.suspend_seller() CASCADE;
DROP FUNCTION IF EXISTS public.ban_user() CASCADE;
DROP FUNCTION IF EXISTS public.approve_refund() CASCADE;
DROP FUNCTION IF EXISTS public.process_refund() CASCADE;
DROP FUNCTION IF EXISTS public.update_seller_stats() CASCADE;

-- Drop all views
DROP VIEW IF EXISTS public.admin_dashboard_stats CASCADE;
DROP VIEW IF EXISTS public.seller_dashboard_stats CASCADE;
DROP VIEW IF EXISTS public.product_listings CASCADE;
DROP VIEW IF EXISTS public.order_details CASCADE;

-- Drop all tables (CASCADE handles foreign keys)
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.sellers CASCADE;
DROP TABLE IF EXISTS public.seller_members CASCADE;
DROP TABLE IF EXISTS public.seller_products CASCADE;
DROP TABLE IF EXISTS public.seller_invitations CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.product_variants CASCADE;
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.product_tags CASCADE;
DROP TABLE IF EXISTS public.product_search_documents CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.carts CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.wishlist_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.order_status_history CASCADE;
DROP TABLE IF EXISTS public.refunds CASCADE;
DROP TABLE IF EXISTS public.delivery_partners CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.message_attachments CASCADE;
DROP TABLE IF EXISTS public.message_moderation_events CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.support_responses CASCADE;
DROP TABLE IF EXISTS public.ai_training_conversations CASCADE;
DROP TABLE IF EXISTS public.chat_conversations CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.kyc_verifications CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.admin_roles CASCADE;
DROP TABLE IF EXISTS public.admin_audit_log CASCADE;
DROP TABLE IF EXISTS public.moderation_queue CASCADE;
DROP TABLE IF EXISTS public.platform_maintenance_windows CASCADE;
DROP TABLE IF EXISTS public.platform_cache_entries CASCADE;
DROP TABLE IF EXISTS public.event_aggregations_hourly CASCADE;
DROP TABLE IF EXISTS public.event_aggregations_daily CASCADE;
DROP TABLE IF EXISTS public.internal_events CASCADE;
DROP TABLE IF EXISTS public.security_audit_log CASCADE;
DROP TABLE IF EXISTS public.inventory_items CASCADE;
DROP TABLE IF EXISTS public.inventory_movements CASCADE;

-- Drop all enums/types
DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.seller_status CASCADE;
DROP TYPE IF EXISTS public.kyc_status CASCADE;
DROP TYPE IF EXISTS public.order_status CASCADE;
DROP TYPE IF EXISTS public.payment_status CASCADE;
DROP TYPE IF EXISTS public.message_status CASCADE;
DROP TYPE IF EXISTS public.ticket_status CASCADE;
DROP TYPE IF EXISTS public.ticket_priority CASCADE;
DROP TYPE IF EXISTS public.refund_status CASCADE;
DROP TYPE IF EXISTS public.moderation_status CASCADE;
DROP TYPE IF EXISTS public.moderation_content_type CASCADE;
DROP TYPE IF EXISTS public.conversation_type CASCADE;
DROP TYPE IF EXISTS public.ticket_category CASCADE;
DROP TYPE IF EXISTS public.kyc_document_type CASCADE;
DROP TYPE IF EXISTS public.maintenance_type CASCADE;
DROP TYPE IF EXISTS public.platform_event_type CASCADE;

-- Drop storage policies
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r SELECT policyname FROM pg_policies WHERE schemaname = 'storage' LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON storage.objects CASCADE';
  END LOOP;
END $$;

-- Drop storage buckets
DELETE FROM storage.buckets WHERE id IN ('avatars', 'product-images', 'seller-logos', 'kyc-documents', 'category-images', 'admin-uploads', 'chat-files', 'export-files');

-- Drop storage objects
DELETE FROM storage.objects WHERE bucket_id IN ('avatars', 'product-images', 'seller-logos', 'kyc-documents', 'category-images', 'admin-uploads', 'chat-files', 'export-files');

-- Drop RLS policies (backup sweep)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END $$;

-- Grant back schema creation permissions
GRANT CREATE ON SCHEMA public TO postgres;
GRANT CREATE ON SCHEMA public TO anon;
GRANT CREATE ON SCHEMA public TO authenticated;
GRANT CREATE ON SCHEMA public TO service_role;

SELECT 'Cleanup complete. Now run production_schema.sql' AS status;
