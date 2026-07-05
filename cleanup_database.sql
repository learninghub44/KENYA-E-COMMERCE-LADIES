-- NUCLEAR CLEANUP: Drop and recreate the entire public schema
-- Run this FIRST, then run production_schema.sql

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Restore default permissions
GRANT CREATE ON SCHEMA public TO postgres;
GRANT CREATE ON SCHEMA public TO anon;
GRANT CREATE ON SCHEMA public TO authenticated;
GRANT CREATE ON SCHEMA public TO service_role;

-- Restore usage
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

SELECT 'Database cleaned. Now run production_schema.sql' AS status;
