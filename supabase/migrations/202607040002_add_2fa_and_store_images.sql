-- ============================================================
-- Add 2FA columns to profiles table
-- Migration: 202607040002_add_2fa_columns.sql
-- ============================================================

-- Add 2FA columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;

-- Add store logo and cover to sellers table
ALTER TABLE sellers
  ADD COLUMN IF NOT EXISTS store_logo_url TEXT,
  ADD COLUMN IF NOT EXISTS store_cover_url TEXT;
