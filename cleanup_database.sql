-- ============================================================
-- CLEANUP: Drop everything before running production_schema.sql
-- Run this FIRST, then run production_schema.sql
-- ============================================================

-- 1. Disable RLS on all public tables
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
  END LOOP;
END $$;

-- 2. Drop all triggers on all public tables + auth.users
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT triggername, event_object_table, event_object_schema FROM information_schema.triggers WHERE trigger_schema IN ('public', 'auth') LOOP
    EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.triggername) || ' ON ' || quote_ident(r.event_object_schema) || '.' || quote_ident(r.event_object_table) || ' CASCADE';
  END LOOP;
END $$;

-- 3. Drop all functions in public schema
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT oid::regprocedure AS func_sig FROM pg_proc WHERE pronamespace = 'public'::regnamespace LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_sig || ' CASCADE';
  END LOOP;
END $$;

-- 4. Drop all views
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT viewname FROM pg_views WHERE schemaname = 'public' LOOP
    EXECUTE 'DROP VIEW IF EXISTS public.' || quote_ident(r.viewname) || ' CASCADE';
  END LOOP;
END $$;

-- 5. Drop all tables (CASCADE handles foreign keys)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END $$;

-- 6. Drop all enums/types
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT typname FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typtype = 'e' LOOP
    EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
  END LOOP;
END $$;

-- 7. Drop all RLS policies
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END $$;

-- 8. Drop storage policies
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE schemaname = 'storage' LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON storage.objects CASCADE';
  END LOOP;
END $$;

-- 9. Clean storage buckets and objects
DELETE FROM storage.objects WHERE bucket_id IN ('avatars', 'product-images', 'seller-logos', 'kyc-documents', 'category-images', 'admin-uploads', 'chat-files', 'export-files');
DELETE FROM storage.buckets WHERE id IN ('avatars', 'product-images', 'seller-logos', 'kyc-documents', 'category-images', 'admin-uploads', 'chat-files', 'export-files');

-- 10. Grant back schema creation permissions
GRANT CREATE ON SCHEMA public TO postgres;
GRANT CREATE ON SCHEMA public TO anon;
GRANT CREATE ON SCHEMA public TO authenticated;
GRANT CREATE ON SCHEMA public TO service_role;

SELECT 'Cleanup complete. Now run production_schema.sql' AS status;
