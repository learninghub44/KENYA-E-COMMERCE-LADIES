-- ============================================================
-- PRODUCTION SCHEMA: Kenya E-Commerce Platform (Zuri Market)
-- Complete database schema for fresh Supabase project
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enum Types
CREATE TYPE public.app_role AS ENUM ('buyer','seller','admin','moderator','service','support','super_admin','kyc_reviewer');
CREATE TYPE public.account_status AS ENUM ('active','suspended','deleted');
CREATE TYPE public.seller_status AS ENUM ('draft','pending_kyc','active','suspended','closed','pending','under_review','approved','rejected','inactive');
CREATE TYPE public.kyc_status AS ENUM ('not_started','pending','approved','rejected','expired','manual_review');
CREATE TYPE public.product_status AS ENUM ('draft','pending_review','active','rejected','archived');
CREATE TYPE public.order_status AS ENUM ('draft','pending_payment','paid','processing','shipped','delivered','cancelled','refunded','pending','confirmed','ready_for_shipment','completed','returned');
CREATE TYPE public.payment_status AS ENUM ('unpaid','authorized','paid','failed','refunded','partially_refunded');
CREATE TYPE public.fulfillment_status AS ENUM ('unfulfilled','partial','fulfilled','returned');
CREATE TYPE public.message_status AS ENUM ('sent','delivered','read','hidden');
CREATE TYPE public.notification_status AS ENUM ('unread','read','archived');
CREATE TYPE public.report_status AS ENUM ('open','reviewing','resolved','dismissed');
CREATE TYPE public.discount_type AS ENUM ('percentage','fixed_amount','free_shipping');
CREATE TYPE public.page_status AS ENUM ('draft','published','archived');
CREATE TYPE public.ticket_status AS ENUM ('open','in_progress','waiting_for_customer','resolved','closed');
CREATE TYPE public.ticket_priority AS ENUM ('low','medium','high','urgent');
CREATE TYPE public.support_user_type AS ENUM ('buyer','seller','guest');

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE public.countries (
  code text PRIMARY KEY CHECK (char_length(code) = 2),
  name text NOT NULL,
  default_currency text NOT NULL CHECK (char_length(default_currency) = 3),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email citext UNIQUE,
  display_name text,
  phone text,
  avatar_url text,
  status public.account_status NOT NULL DEFAULT 'active',
  default_country_code text REFERENCES public.countries(code),
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  two_factor_enabled boolean DEFAULT false,
  two_factor_secret text
);

CREATE TABLE public.user_roles (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  granted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

CREATE TABLE public.sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  store_name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  logo_url text,
  banner_url text,
  status public.seller_status NOT NULL DEFAULT 'draft',
  kyc_status public.kyc_status NOT NULL DEFAULT 'not_started',
  country_code text REFERENCES public.countries(code),
  default_currency text NOT NULL DEFAULT 'KES' CHECK (char_length(default_currency) = 3),
  support_email citext,
  support_phone text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  store_logo_url text,
  store_cover_url text
);

CREATE TABLE public.seller_members (
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner','manager','staff')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (seller_id, user_id)
);

CREATE TABLE public.kyc_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'didit',
  provider_reference text,
  status public.kyc_status NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  expires_at timestamptz,
  rejection_reason text,
  metadata jsonb NOT NULL DEFAULT '{}'
);

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  logo_url text,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  status public.product_status NOT NULL DEFAULT 'draft',
  base_price_minor integer NOT NULL CHECK (base_price_minor >= 0),
  compare_at_price_minor integer CHECK (compare_at_price_minor IS NULL OR compare_at_price_minor >= 0),
  currency text NOT NULL DEFAULT 'KES' CHECK (char_length(currency) = 3),
  is_featured boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  search_vector tsvector,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  is_suspended boolean NOT NULL DEFAULT false,
  UNIQUE (seller_id, slug),
  CHECK (compare_at_price_minor IS NULL OR base_price_minor IS NULL OR compare_at_price_minor >= base_price_minor)
);

CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku text NOT NULL,
  title text,
  price_minor integer CHECK (price_minor IS NULL OR price_minor >= 0),
  compare_at_price_minor integer CHECK (compare_at_price_minor IS NULL OR compare_at_price_minor >= 0),
  currency text NOT NULL DEFAULT 'KES' CHECK (char_length(currency) = 3),
  barcode text,
  weight_grams integer CHECK (weight_grams IS NULL OR weight_grams >= 0),
  options jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (product_id, sku)
);

CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity_available integer NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  quantity_reserved integer NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  low_stock_threshold integer NOT NULL DEFAULT 0 CHECK (low_stock_threshold >= 0),
  track_inventory boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, variant_id)
);

CREATE TABLE public.product_attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES public.sellers(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  status public.page_status NOT NULL DEFAULT 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (seller_id, slug),
  CHECK (starts_at IS NULL OR ends_at IS NULL OR starts_at < ends_at)
);

CREATE TABLE public.collection_products (
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, product_id)
);

CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label text,
  recipient_name text NOT NULL,
  phone text NOT NULL,
  line1 text NOT NULL,
  line2 text,
  city text NOT NULL,
  region text,
  postal_code text,
  country_code text NOT NULL REFERENCES public.countries(code),
  is_default_shipping boolean NOT NULL DEFAULT false,
  is_default_billing boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE public.wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Default',
  is_default boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (user_id, name)
);

CREATE TABLE public.wishlist_items (
  wishlist_id uuid NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (wishlist_id, product_id)
);

CREATE TABLE public.carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_token text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','converted','abandoned')),
  currency text NOT NULL DEFAULT 'KES' CHECK (char_length(currency) = 3),
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CHECK (user_id IS NOT NULL OR guest_token IS NOT NULL)
);

CREATE TABLE public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0 AND quantity <= 99),
  unit_price_minor integer NOT NULL CHECK (unit_price_minor >= 0),
  currency text NOT NULL DEFAULT 'KES' CHECK (char_length(currency) = 3),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','saved_for_later')),
  product_snapshot jsonb NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cart_id, product_id, variant_id)
);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  buyer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE RESTRICT,
  status public.order_status NOT NULL DEFAULT 'pending_payment',
  payment_status public.payment_status NOT NULL DEFAULT 'unpaid',
  fulfillment_status public.fulfillment_status NOT NULL DEFAULT 'unfulfilled',
  subtotal_minor integer NOT NULL CHECK (subtotal_minor >= 0),
  shipping_minor integer NOT NULL DEFAULT 0 CHECK (shipping_minor >= 0),
  discount_minor integer NOT NULL DEFAULT 0 CHECK (discount_minor >= 0),
  tax_minor integer NOT NULL DEFAULT 0 CHECK (tax_minor >= 0),
  total_minor integer NOT NULL CHECK (total_minor >= 0),
  currency text NOT NULL DEFAULT 'KES' CHECK (char_length(currency) = 3),
  shipping_address jsonb NOT NULL,
  billing_address jsonb,
  placed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  order_group_number text,
  notes text,
  internal_notes text,
  cancelled_at timestamptz,
  completed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}',
  CHECK (total_minor = subtotal_minor + shipping_minor + tax_minor - discount_minor)
);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE RESTRICT,
  product_name text NOT NULL,
  variant_title text,
  sku text,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price_minor integer NOT NULL CHECK (unit_price_minor >= 0),
  total_minor integer NOT NULL CHECK (total_minor >= 0),
  currency text NOT NULL DEFAULT 'KES' CHECK (char_length(currency) = 3),
  created_at timestamptz NOT NULL DEFAULT now(),
  discount_minor integer NOT NULL DEFAULT 0 CHECK (discount_minor >= 0),
  product_snapshot jsonb NOT NULL DEFAULT '{}',
  variant_snapshot jsonb NOT NULL DEFAULT '{}',
  seller_snapshot jsonb NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}',
  CHECK (total_minor = quantity * unit_price_minor)
);

CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES public.sellers(id) ON DELETE CASCADE,
  code text NOT NULL,
  type text NOT NULL CHECK (type IN ('percentage','fixed')),
  discount_type public.discount_type,
  discount_value integer,
  value integer,
  scope text NOT NULL DEFAULT 'seller',
  currency text NOT NULL DEFAULT 'KES' CHECK (char_length(currency) = 3),
  min_subtotal_minor integer NOT NULL DEFAULT 0,
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer,
  used_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE public.order_coupon_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  coupon_id uuid REFERENCES public.coupons(id) ON DELETE SET NULL,
  code text NOT NULL,
  discount_minor integer NOT NULL CHECK (discount_minor >= 0),
  seller_id uuid REFERENCES public.sellers(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  from_status public.order_status,
  to_status public.order_status NOT NULL,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  order_item_id uuid REFERENCES public.order_items(id) ON DELETE SET NULL,
  buyer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text,
  status public.page_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, buyer_id, order_item_id)
);

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  subject text,
  product_snapshot jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  buyer_deleted_at timestamptz,
  seller_deleted_at timestamptz,
  buyer_unread_count integer NOT NULL DEFAULT 0 CHECK (buyer_unread_count >= 0),
  seller_unread_count integer NOT NULL DEFAULT 0 CHECK (seller_unread_count >= 0),
  last_message_at timestamptz,
  last_message_preview text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text,
  reply_to_message_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  status public.message_status NOT NULL DEFAULT 'sent',
  delivered_at timestamptz,
  read_at timestamptz,
  edited_at timestamptz,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  url text NOT NULL,
  cloudinary_public_id text NOT NULL,
  mime_type text NOT NULL CHECK (mime_type LIKE 'image/%'),
  width integer,
  height integer,
  bytes integer,
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.message_moderation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES public.messages(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('reported','deleted','user_blocked','suspicious_content','warned')),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.platform_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.notification_categories (
  key text PRIMARY KEY,
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_security boolean NOT NULL DEFAULT false
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  data jsonb NOT NULL DEFAULT '{}',
  source_event_id uuid,
  status public.notification_status,
  read_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_enabled boolean NOT NULL DEFAULT true,
  in_app_enabled boolean NOT NULL DEFAULT true,
  marketing_emails boolean NOT NULL DEFAULT false,
  order_updates boolean NOT NULL DEFAULT true,
  messaging_notifications boolean NOT NULL DEFAULT true,
  security_notifications boolean NOT NULL DEFAULT true CHECK (security_notifications = true),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.email_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  to_email text NOT NULL,
  template text NOT NULL,
  subject text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sending','sent','failed','skipped')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error text,
  provider_message_id text,
  source_event_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

CREATE TABLE public.admin_broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  title text NOT NULL,
  body text NOT NULL,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info','maintenance','emergency')),
  audience text NOT NULL DEFAULT 'all' CHECK (audience IN ('all','buyers','sellers','admins','segment')),
  audience_filter jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','expired')),
  published_at timestamptz,
  expires_at timestamptz,
  recipient_count integer NOT NULL DEFAULT 0 CHECK (recipient_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id uuid REFERENCES public.sellers(id) ON DELETE CASCADE,
  buyer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id uuid REFERENCES public.order_items(id) ON DELETE CASCADE,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text,
  status text DEFAULT 'published' CHECK (status IN ('pending','published','hidden','removed')),
  is_verified_purchase boolean DEFAULT true,
  helpful_count integer DEFAULT 0 CHECK (helpful_count >= 0),
  report_count integer DEFAULT 0 CHECK (report_count >= 0),
  published_at timestamptz,
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.seller_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES public.sellers(id) ON DELETE CASCADE,
  buyer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  overall_rating integer CHECK (overall_rating BETWEEN 1 AND 5),
  communication_rating integer CHECK (communication_rating BETWEEN 1 AND 5),
  shipping_rating integer CHECK (shipping_rating BETWEEN 1 AND 5),
  packaging_rating integer CHECK (packaging_rating BETWEEN 1 AND 5),
  feedback text,
  status text DEFAULT 'published' CHECK (status IN ('pending','published','hidden','removed')),
  helpful_count integer DEFAULT 0,
  report_count integer DEFAULT 0,
  published_at timestamptz,
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.review_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES public.product_reviews(id) ON DELETE CASCADE,
  public_id text,
  secure_url text,
  mime_type text CHECK (mime_type IN ('image/jpeg','image/png','image/webp','image/gif')),
  bytes integer CHECK (bytes > 0),
  width integer,
  height integer,
  position integer DEFAULT 0,
  alt_text text,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.review_helpful_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_type text CHECK (review_type IN ('product','seller')),
  review_id uuid,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.review_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_type text,
  review_id uuid,
  reporter_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason text CHECK (reason IN ('spam','offensive_content','abuse','fake_review','copyright','other')),
  description text,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE public.rating_summaries (
  entity_type text CHECK (entity_type IN ('product','seller')),
  entity_id uuid,
  average_rating numeric(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  verified_reviews integer DEFAULT 0,
  rating_distribution jsonb DEFAULT '{"1":0,"2":0,"3":0,"4":0,"5":0}'::jsonb,
  score numeric(6,4) DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (entity_type, entity_id)
);

CREATE TABLE public.product_search_documents (
  product_id uuid PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id uuid,
  category_id uuid,
  brand_id uuid,
  name text,
  description text,
  brand_name text,
  category_name text,
  seller_store_name text,
  sku_values text[],
  tags text[],
  colors text[],
  sizes text[],
  materials text[],
  condition text DEFAULT 'new' CHECK (condition IN ('new','like_new','pre_owned','refurbished')),
  currency text DEFAULT 'KES',
  base_price_minor integer DEFAULT 0 CHECK (base_price_minor >= 0),
  compare_at_price_minor integer,
  rating numeric(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  sold_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  seller_verified boolean DEFAULT false,
  in_stock boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  search_vector tsvector
);

CREATE TABLE public.search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  query text,
  filters jsonb DEFAULT '{}',
  result_count integer DEFAULT 0 CHECK (result_count >= 0),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text,
  query text DEFAULT '',
  filters jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.recently_viewed_products (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE public.popular_search_terms (
  normalized_query text PRIMARY KEY,
  display_query text,
  search_count integer DEFAULT 0 CHECK (search_count >= 0),
  last_searched_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.seller_daily_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  metric_date date NOT NULL,
  currency text NOT NULL DEFAULT 'KES' CHECK (char_length(currency) = 3),
  orders_total integer NOT NULL DEFAULT 0,
  orders_completed integer NOT NULL DEFAULT 0,
  orders_pending integer NOT NULL DEFAULT 0,
  orders_cancelled integer NOT NULL DEFAULT 0,
  gross_revenue_minor integer NOT NULL DEFAULT 0,
  net_revenue_minor integer NOT NULL DEFAULT 0,
  refunds_minor integer NOT NULL DEFAULT 0,
  products_active integer NOT NULL DEFAULT 0,
  products_draft integer NOT NULL DEFAULT 0,
  products_out_of_stock integer NOT NULL DEFAULT 0,
  customers_new integer NOT NULL DEFAULT 0,
  customers_returning integer NOT NULL DEFAULT 0,
  inventory_value_minor integer NOT NULL DEFAULT 0,
  low_stock_count integer NOT NULL DEFAULT 0,
  out_of_stock_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (seller_id, metric_date)
);

CREATE TABLE public.seller_product_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  metric_date date NOT NULL,
  views_count integer NOT NULL DEFAULT 0,
  orders_count integer NOT NULL DEFAULT 0,
  units_sold integer NOT NULL DEFAULT 0,
  gross_revenue_minor integer NOT NULL DEFAULT 0,
  net_revenue_minor integer NOT NULL DEFAULT 0,
  stock_level integer NOT NULL DEFAULT 0,
  stock_reserved integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (seller_id, product_id, metric_date)
);

CREATE TABLE public.marketplace_daily_metrics (
  metric_date date PRIMARY KEY,
  currency text NOT NULL DEFAULT 'KES' CHECK (char_length(currency) = 3),
  gmv_minor bigint NOT NULL DEFAULT 0,
  marketplace_revenue_minor bigint NOT NULL DEFAULT 0,
  commission_revenue_minor bigint NOT NULL DEFAULT 0,
  seller_revenue_minor bigint NOT NULL DEFAULT 0,
  total_orders integer NOT NULL DEFAULT 0,
  completed_orders integer NOT NULL DEFAULT 0,
  pending_orders integer NOT NULL DEFAULT 0,
  processing_orders integer NOT NULL DEFAULT 0,
  cancelled_orders integer NOT NULL DEFAULT 0,
  refunded_orders integer NOT NULL DEFAULT 0,
  active_buyers integer NOT NULL DEFAULT 0,
  new_buyers integer NOT NULL DEFAULT 0,
  returning_buyers integer NOT NULL DEFAULT 0,
  new_sellers integer NOT NULL DEFAULT 0,
  new_products integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.marketplace_bi_daily_metrics (
  metric_date date PRIMARY KEY,
  fastest_growing_category_id uuid,
  fastest_growing_category_name text,
  fastest_growing_category_growth numeric DEFAULT 0,
  highest_revenue_category_id uuid,
  highest_revenue_category_name text,
  highest_revenue_category_revenue bigint DEFAULT 0,
  highest_conversion_category_id uuid,
  highest_conversion_category_name text,
  highest_conversion_category_rate numeric DEFAULT 0,
  lowest_performing_category_id uuid,
  lowest_performing_category_name text,
  lowest_performing_category_revenue bigint DEFAULT 0,
  best_performing_brand_id uuid,
  best_performing_brand_name text,
  best_performing_brand_revenue bigint DEFAULT 0,
  lowest_performing_brand_id uuid,
  lowest_performing_brand_name text,
  lowest_performing_brand_revenue bigint DEFAULT 0,
  fastest_growing_seller_id uuid,
  fastest_growing_seller_name text,
  fastest_growing_seller_growth numeric DEFAULT 0,
  total_revenue_minor bigint DEFAULT 0,
  total_orders integer DEFAULT 0,
  total_new_products integer DEFAULT 0,
  total_new_sellers integer DEFAULT 0,
  total_new_buyers integer DEFAULT 0,
  average_rating numeric(3,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.internal_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (char_length(event_type) >= 2),
  event_version integer NOT NULL DEFAULT 1,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  seller_id uuid REFERENCES public.sellers(id) ON DELETE SET NULL,
  session_id text,
  request_id text,
  entity_type text,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}',
  device_info jsonb NOT NULL DEFAULT '{}',
  ip_hash text,
  user_agent text,
  source text NOT NULL DEFAULT 'internal',
  platform text,
  created_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE TABLE public.event_aggregations_hourly (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_type text NOT NULL,
  bucket_hour timestamptz NOT NULL,
  event_count integer NOT NULL DEFAULT 0,
  unique_users integer NOT NULL DEFAULT 0,
  unique_sellers integer NOT NULL DEFAULT 0,
  unique_sessions integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_type, bucket_hour)
);

CREATE TABLE public.event_aggregations_daily (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_type text NOT NULL,
  bucket_date date NOT NULL,
  event_count integer NOT NULL DEFAULT 0,
  unique_users integer NOT NULL DEFAULT 0,
  unique_sellers integer NOT NULL DEFAULT 0,
  unique_sessions integer NOT NULL DEFAULT 0,
  total_duration_ms bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_type, bucket_date)
);

CREATE TABLE public.app_metrics (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  tags jsonb NOT NULL DEFAULT '{}',
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.db_metrics (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  query_source text NOT NULL DEFAULT 'unknown',
  query_count integer NOT NULL DEFAULT 0,
  total_duration_ms bigint NOT NULL DEFAULT 0,
  slow_query_count integer NOT NULL DEFAULT 0,
  failed_query_count integer NOT NULL DEFAULT 0,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.cache_metrics (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cache_name text NOT NULL DEFAULT 'default',
  hits integer NOT NULL DEFAULT 0,
  misses integer NOT NULL DEFAULT 0,
  hit_ratio numeric(5,4) NOT NULL DEFAULT 0,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.storage_metrics (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  storage_type text NOT NULL DEFAULT 'cloudinary',
  total_images integer NOT NULL DEFAULT 0,
  total_bytes bigint NOT NULL DEFAULT 0,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.forecasting_hooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hook_name text NOT NULL UNIQUE,
  hook_type text NOT NULL,
  description text,
  input_schema jsonb NOT NULL DEFAULT '{}',
  output_schema jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  last_invoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.forecasting_hook_invocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hook_id uuid NOT NULL REFERENCES public.forecasting_hooks(id) ON DELETE CASCADE,
  input_data jsonb NOT NULL DEFAULT '{}',
  output_data jsonb NOT NULL DEFAULT '{}',
  duration_ms integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  invoked_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.platform_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type text NOT NULL,
  queue text NOT NULL DEFAULT 'default',
  priority integer NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed','cancelled','dead_letter')),
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3,
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  error_stack text,
  dead_letter_at timestamptz,
  recurring_cron text,
  timeout_seconds integer NOT NULL DEFAULT 30,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.platform_job_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES public.platform_jobs(id) ON DELETE CASCADE,
  level text NOT NULL DEFAULT 'info' CHECK (level IN ('debug','info','warn','error')),
  message text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.platform_cache_entries (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cache_namespace text NOT NULL DEFAULT 'default',
  cache_key text NOT NULL,
  cache_value jsonb NOT NULL DEFAULT '{}',
  ttl_seconds integer,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cache_namespace, cache_key)
);

CREATE TABLE public.platform_config (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  config_key text NOT NULL UNIQUE,
  config_value jsonb NOT NULL DEFAULT '{}',
  config_type text NOT NULL DEFAULT 'string' CHECK (config_type IN ('string','number','boolean','json','secret')),
  description text,
  is_feature_flag boolean NOT NULL DEFAULT false,
  is_encrypted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.platform_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  file_size_bytes bigint NOT NULL,
  storage_provider text NOT NULL DEFAULT 'cloudinary',
  storage_bucket text,
  public_url text,
  checksum text,
  entity_type text,
  entity_id uuid,
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.platform_storage_metrics (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  storage_provider text NOT NULL DEFAULT 'cloudinary',
  total_bytes bigint NOT NULL DEFAULT 0,
  total_files integer NOT NULL DEFAULT 0,
  orphan_files integer NOT NULL DEFAULT 0,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.platform_rate_limits (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  limit_type text NOT NULL CHECK (limit_type IN ('user','seller','admin','api','ip')),
  limit_key text NOT NULL,
  window_start timestamptz NOT NULL DEFAULT now(),
  window_seconds integer NOT NULL DEFAULT 60,
  max_requests integer NOT NULL DEFAULT 100,
  current_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (limit_type, limit_key, window_start)
);

CREATE TABLE public.platform_maintenance_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_type text NOT NULL DEFAULT 'global' CHECK (maintenance_type IN ('global','read_only','scheduled')),
  is_active boolean NOT NULL DEFAULT false,
  message text,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.platform_audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  action text NOT NULL,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_role text,
  resource_type text NOT NULL,
  resource_id text,
  details jsonb NOT NULL DEFAULT '{}',
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  activity_type text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  target_type text NOT NULL,
  target_id text NOT NULL,
  reason text NOT NULL,
  details text,
  status public.report_status NOT NULL DEFAULT 'open',
  assigned_to uuid,
  resolution text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  internal_notes text
);

CREATE TABLE public.store_followers (
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (seller_id, user_id)
);

CREATE TABLE public.feature_flags (
  key text PRIMARY KEY,
  description text,
  is_enabled boolean NOT NULL DEFAULT false,
  audience text NOT NULL DEFAULT 'all',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  anonymous_id text,
  event_name text NOT NULL,
  entity_type text,
  entity_id uuid,
  properties jsonb NOT NULL DEFAULT '{}',
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  link_url text,
  placement text NOT NULL DEFAULT 'home',
  starts_at timestamptz,
  ends_at timestamptz,
  status public.page_status NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE public.cms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  body text,
  status public.page_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'general',
  question text NOT NULL,
  answer text NOT NULL,
  status public.page_status NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE public.contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE public.shipping_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  handling_days integer NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.shipping_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipping_profile_id uuid NOT NULL REFERENCES public.shipping_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  country_codes text[] NOT NULL DEFAULT '{}',
  base_rate_minor integer NOT NULL DEFAULT 0,
  free_shipping_threshold_minor integer,
  currency text NOT NULL DEFAULT 'KES' CHECK (char_length(currency) = 3),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES public.sellers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  rules jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE public.knowledge_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  search_vector tsvector GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', coalesce(content, '')), 'B')) STORED
);

CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number serial UNIQUE,
  user_id uuid,
  user_type public.support_user_type NOT NULL DEFAULT 'buyer',
  full_name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'general_question',
  status public.ticket_status NOT NULL DEFAULT 'open',
  priority public.ticket_priority NOT NULL DEFAULT 'medium',
  assigned_to uuid,
  order_number text,
  seller_name text,
  ai_summary text,
  ai_suggested_category text,
  ai_suggested_steps text[],
  ai_confidence decimal(3,2),
  resolved_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id uuid,
  sender_type text NOT NULL CHECK (sender_type IN ('customer','support','ai','system')),
  message text NOT NULL,
  is_internal_note boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  content text NOT NULL,
  tokens_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.ticket_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  message_id uuid,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  mime_type text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.user_2fa_backup_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code_hash text NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW public.product_catalog AS
SELECT p.*, pi.url as primary_image_url, c.name as category_name, b.name as brand_name
FROM products p
LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
LEFT JOIN categories c ON c.id = p.category_id
LEFT JOIN brands b ON b.id = p.brand_id
WHERE p.deleted_at IS NULL;

CREATE OR REPLACE VIEW public.seller_storefronts AS
SELECT s.*,
  (SELECT count(*) FROM products p WHERE p.seller_id = s.id AND p.deleted_at IS NULL AND p.status = 'active') as product_count,
  COALESCE(rs.average_rating, 0) as average_rating,
  COALESCE(rs.total_reviews, 0) as total_reviews
FROM sellers s
LEFT JOIN rating_summaries rs ON rs.entity_type = 'seller' AND rs.entity_id = s.id
WHERE s.deleted_at IS NULL AND s.status = 'active';

CREATE OR REPLACE VIEW public.published_product_reviews AS
SELECT * FROM product_reviews WHERE status = 'published' AND deleted_at IS NULL;

CREATE OR REPLACE VIEW public.published_seller_reviews AS
SELECT * FROM seller_reviews WHERE status = 'published' AND deleted_at IS NULL;

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-set updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-provision profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NULL)
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'buyer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-grant seller role on seller creation
CREATE OR REPLACE FUNCTION public.handle_new_seller()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.owner_id, 'seller')
  ON CONFLICT (user_id, role) DO NOTHING;
  INSERT INTO public.seller_members (seller_id, user_id, role) VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT (seller_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update conversation on new message
CREATE OR REPLACE FUNCTION public.on_message_inserted()
RETURNS trigger AS $$
BEGIN
  UPDATE public.conversations
  SET
    last_message_at = NEW.created_at,
    last_message_preview = left(NEW.body, 200),
    buyer_unread_count = CASE
      WHEN NEW.sender_id = buyer_id THEN buyer_unread_count
      ELSE buyer_unread_count + 1
    END,
    seller_unread_count = CASE
      WHEN NEW.sender_id = (SELECT owner_id FROM sellers WHERE id = seller_id) THEN seller_unread_count
      ELSE seller_unread_count + 1
    END,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Product search vector trigger
CREATE OR REPLACE FUNCTION public.set_product_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.current_user_has_role(required_role public.app_role)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = required_role
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is staff (admin/super_admin/moderator)
CREATE OR REPLACE FUNCTION public.current_user_is_staff()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'moderator')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user can manage a seller
CREATE OR REPLACE FUNCTION public.current_user_can_manage_seller(seller_uuid uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sellers WHERE id = seller_uuid AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.seller_members WHERE seller_id = seller_uuid AND user_id = auth.uid()
  ) OR public.current_user_is_staff();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user can review KYC
CREATE OR REPLACE FUNCTION public.current_user_can_review_kyc()
RETURNS boolean AS $$
  SELECT public.current_user_is_staff() OR public.current_user_has_role('kyc_reviewer');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT public.current_user_is_staff();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if seller
CREATE OR REPLACE FUNCTION public.is_seller()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'seller'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if kyc_reviewer
CREATE OR REPLACE FUNCTION public.is_kyc_reviewer()
RETURNS boolean AS $$
  SELECT public.current_user_can_review_kyc();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Extract UUID from storage path
CREATE OR REPLACE FUNCTION public.storage_folder_uuid(object_name text, folder_index integer DEFAULT 1)
RETURNS uuid AS $$
DECLARE
  parts text[];
BEGIN
  parts := string_to_array(object_name, '/');
  IF array_length(parts, 1) >= folder_index THEN
    BEGIN
      RETURN parts[folder_index]::uuid;
    EXCEPTION WHEN others THEN
      RETURN NULL;
    END;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Sync product search document
CREATE OR REPLACE FUNCTION public.sync_product_search_document()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.product_search_documents WHERE product_id = OLD.id;
    RETURN OLD;
  END IF;

  INSERT INTO public.product_search_documents (
    product_id, seller_id, category_id, brand_id, name, description,
    brand_name, category_name, seller_store_name,
    base_price_minor, compare_at_price_minor, currency,
    is_featured, in_stock, published_at, search_vector
  )
  SELECT
    p.id, p.seller_id, p.category_id, p.brand_id, p.name, p.description,
    b.name, c.name, s.store_name,
    p.base_price_minor, p.compare_at_price_minor, p.currency,
    p.is_featured,
    EXISTS (SELECT 1 FROM inventory_items iv WHERE iv.product_id = p.id AND iv.quantity_available > 0),
    p.published_at,
    p.search_vector
  FROM products p
  LEFT JOIN brands b ON b.id = p.brand_id
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN sellers s ON s.id = p.seller_id
  WHERE p.id = NEW.id
  ON CONFLICT (product_id) DO UPDATE SET
    seller_id = EXCLUDED.seller_id,
    category_id = EXCLUDED.category_id,
    brand_id = EXCLUDED.brand_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    brand_name = EXCLUDED.brand_name,
    category_name = EXCLUDED.category_name,
    seller_store_name = EXCLUDED.seller_store_name,
    base_price_minor = EXCLUDED.base_price_minor,
    compare_at_price_minor = EXCLUDED.compare_at_price_minor,
    currency = EXCLUDED.currency,
    is_featured = EXCLUDED.is_featured,
    in_stock = EXCLUDED.in_stock,
    published_at = EXCLUDED.published_at,
    search_vector = EXCLUDED.search_vector,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record popular search term
CREATE OR REPLACE FUNCTION public.record_popular_search_term()
RETURNS trigger AS $$
BEGIN
  IF NEW.query IS NOT NULL AND length(trim(NEW.query)) > 0 THEN
    INSERT INTO public.popular_search_terms (normalized_query, display_query, search_count, last_searched_at)
    VALUES (lower(trim(NEW.query)), trim(NEW.query), 1, now())
    ON CONFLICT (normalized_query) DO UPDATE SET
      search_count = popular_search_terms.search_count + 1,
      last_searched_at = now(),
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sync product review rating summary
CREATE OR REPLACE FUNCTION public.sync_product_review_rating_summary()
RETURNS trigger AS $$
DECLARE
  target_id uuid;
  tgt record;
BEGIN
  target_id := COALESCE(NEW.product_id, OLD.product_id);

  SELECT
    coalesce(avg(rating), 0) as avg_rating,
    count(*) as total,
    count(*) FILTER (WHERE is_verified_purchase = true AND status = 'published') as verified,
    jsonb_build_object(
      '1', count(*) FILTER (WHERE rating = 1 AND status = 'published'),
      '2', count(*) FILTER (WHERE rating = 2 AND status = 'published'),
      '3', count(*) FILTER (WHERE rating = 3 AND status = 'published'),
      '4', count(*) FILTER (WHERE rating = 4 AND status = 'published'),
      '5', count(*) FILTER (WHERE rating = 5 AND status = 'published')
    ) as distribution
  INTO tgt
  FROM public.product_reviews
  WHERE product_id = target_id AND deleted_at IS NULL;

  INSERT INTO public.rating_summaries (entity_type, entity_id, average_rating, total_reviews, verified_reviews, rating_distribution, score, updated_at)
  VALUES ('product', target_id, round(tgt.avg_rating::numeric, 2), tgt.total, tgt.verified, tgt.distribution, round(tgt.avg_rating::numeric * (ln(tgt.total + 1) / 5), 4), now())
  ON CONFLICT (entity_type, entity_id) DO UPDATE SET
    average_rating = round(tgt.avg_rating::numeric, 2),
    total_reviews = tgt.total,
    verified_reviews = tgt.verified,
    rating_distribution = tgt.distribution,
    score = round(tgt.avg_rating::numeric * (ln(tgt.total + 1) / 5), 4),
    updated_at = now();

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sync seller review rating summary
CREATE OR REPLACE FUNCTION public.sync_seller_review_rating_summary()
RETURNS trigger AS $$
DECLARE
  target_id uuid;
  tgt record;
BEGIN
  target_id := COALESCE(NEW.seller_id, OLD.seller_id);

  SELECT
    coalesce(avg(overall_rating), 0) as avg_rating,
    count(*) as total,
    count(*) FILTER (WHERE status = 'published') as published_count,
    jsonb_build_object(
      '1', count(*) FILTER (WHERE overall_rating = 1 AND status = 'published'),
      '2', count(*) FILTER (WHERE overall_rating = 2 AND status = 'published'),
      '3', count(*) FILTER (WHERE overall_rating = 3 AND status = 'published'),
      '4', count(*) FILTER (WHERE overall_rating = 4 AND status = 'published'),
      '5', count(*) FILTER (WHERE overall_rating = 5 AND status = 'published')
    ) as distribution
  INTO tgt
  FROM public.seller_reviews
  WHERE seller_id = target_id AND deleted_at IS NULL;

  INSERT INTO public.rating_summaries (entity_type, entity_id, average_rating, total_reviews, verified_reviews, rating_distribution, score, updated_at)
  VALUES ('seller', target_id, round(tgt.avg_rating::numeric, 2), tgt.total, tgt.published_count, tgt.distribution, round(tgt.avg_rating::numeric * (ln(tgt.total + 1) / 5), 4), now())
  ON CONFLICT (entity_type, entity_id) DO UPDATE SET
    average_rating = round(tgt.avg_rating::numeric, 2),
    total_reviews = tgt.total,
    verified_reviews = tgt.published_count,
    rating_distribution = tgt.distribution,
    score = round(tgt.avg_rating::numeric * (ln(tgt.total + 1) / 5), 4),
    updated_at = now();

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reserve inventory item
CREATE OR REPLACE FUNCTION public.reserve_inventory_item(
  p_product_id uuid,
  p_variant_id uuid,
  p_quantity integer
) RETURNS jsonb AS $$
DECLARE
  v_item record;
BEGIN
  SELECT * INTO v_item FROM public.inventory_items
  WHERE product_id = p_product_id AND variant_id IS NOT DISTINCT FROM p_variant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Inventory item not found');
  END IF;

  IF NOT v_item.track_inventory THEN
    RETURN jsonb_build_object('ok', true, 'message', 'Inventory tracking disabled');
  END IF;

  IF v_item.quantity_available < p_quantity THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Insufficient stock');
  END IF;

  UPDATE public.inventory_items
  SET quantity_available = quantity_available - p_quantity,
      quantity_reserved = quantity_reserved + p_quantity,
      updated_at = now()
  WHERE id = v_item.id;

  RETURN jsonb_build_object('ok', true, 'message', 'Reserved');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Release inventory item
-- NOTE: This function is referenced in the code but defined above. Included here as alias.
CREATE OR REPLACE FUNCTION public.release_inventory_item(
  p_product_id uuid,
  p_variant_id uuid,
  p_quantity integer
) RETURNS jsonb AS $$
BEGIN
  UPDATE public.inventory_items
  SET quantity_available = quantity_available + p_quantity,
      quantity_reserved = GREATEST(0, quantity_reserved - p_quantity),
      updated_at = now()
  WHERE product_id = p_product_id AND variant_id IS NOT DISTINCT FROM p_variant_id;

  RETURN jsonb_build_object('ok', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get active maintenance windows
CREATE OR REPLACE FUNCTION public.platform_get_active_maintenance()
RETURNS jsonb AS $$
  SELECT COALESCE(
    (SELECT jsonb_build_object(
      'id', id,
      'type', maintenance_type,
      'message', message,
      'started_at', started_at
    ) FROM public.platform_maintenance_windows
    WHERE is_active = true
    AND (started_at IS NOT NULL OR (scheduled_start <= now() AND scheduled_end >= now()))
    LIMIT 1),
    'null'::jsonb
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Clear expired cache entries
CREATE OR REPLACE FUNCTION public.platform_clear_expired_cache()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.platform_cache_entries WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search products ranked
CREATE OR REPLACE FUNCTION public.search_products_ranked(
  p_query text DEFAULT NULL,
  p_category_id uuid DEFAULT NULL,
  p_brand_id uuid DEFAULT NULL,
  p_min_price integer DEFAULT NULL,
  p_max_price integer DEFAULT NULL,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
) RETURNS SETOF public.product_search_documents AS $$
BEGIN
  RETURN QUERY
  SELECT psd.*
  FROM public.product_search_documents psd
  WHERE (p_query IS NULL OR psd.search_vector @@ plainto_tsquery('english', p_query))
    AND (p_category_id IS NULL OR psd.category_id = p_category_id)
    AND (p_brand_id IS NULL OR psd.brand_id = p_brand_id)
    AND (p_min_price IS NULL OR psd.base_price_minor >= p_min_price)
    AND (p_max_price IS NULL OR psd.base_price_minor <= p_max_price)
    AND psd.published_at IS NOT NULL
  ORDER BY
    CASE WHEN p_query IS NOT NULL THEN ts_rank(psd.search_vector, plainto_tsquery('english', p_query)) END DESC NULLS LAST,
    psd.is_featured DESC,
    psd.rating DESC,
    psd.published_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Aggregate events hourly
CREATE OR REPLACE FUNCTION public.aggregate_events_hourly()
RETURNS void AS $$
BEGIN
  INSERT INTO public.event_aggregations_hourly (event_type, bucket_hour, event_count, unique_users, unique_sellers, unique_sessions)
  SELECT
    event_type,
    date_trunc('hour', created_at) as bucket_hour,
    count(*) as event_count,
    count(DISTINCT user_id) as unique_users,
    count(DISTINCT seller_id) as unique_sellers,
    count(DISTINCT session_id) as unique_sessions
  FROM public.internal_events
  WHERE created_at >= date_trunc('hour', now() - interval '2 hours')
    AND created_at < date_trunc('hour', now())
    AND archived_at IS NULL
  GROUP BY event_type, date_trunc('hour', created_at)
  ON CONFLICT (event_type, bucket_hour) DO UPDATE SET
    event_count = EXCLUDED.event_count,
    unique_users = EXCLUDED.unique_users,
    unique_sellers = EXCLUDED.unique_sellers,
    unique_sessions = EXCLUDED.unique_sessions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aggregate events daily
CREATE OR REPLACE FUNCTION public.aggregate_events_daily()
RETURNS void AS $$
BEGIN
  INSERT INTO public.event_aggregations_daily (event_type, bucket_date, event_count, unique_users, unique_sellers, unique_sessions)
  SELECT
    event_type,
    created_at::date as bucket_date,
    count(*) as event_count,
    count(DISTINCT user_id) as unique_users,
    count(DISTINCT seller_id) as unique_sellers,
    count(DISTINCT session_id) as unique_sessions
  FROM public.internal_events
  WHERE created_at >= (now() - interval '3 days')::date
    AND created_at < now()::date
    AND archived_at IS NULL
  GROUP BY event_type, created_at::date
  ON CONFLICT (event_type, bucket_date) DO UPDATE SET
    event_count = EXCLUDED.event_count,
    unique_users = EXCLUDED.unique_users,
    unique_sellers = EXCLUDED.unique_sellers,
    unique_sessions = EXCLUDED.unique_sessions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON public.sellers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wishlist_items_updated_at BEFORE UPDATE ON public.wishlist_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_seller_members_updated_at BEFORE UPDATE ON public.seller_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_seller_products_updated_at BEFORE UPDATE ON public.seller_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kyc_verifications_updated_at BEFORE UPDATE ON public.kyc_verifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_moderation_queue_updated_at BEFORE UPDATE ON public.moderation_queue FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_refunds_updated_at BEFORE UPDATE ON public.refunds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_delivery_partners_updated_at BEFORE UPDATE ON public.delivery_partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_seller_invitations_updated_at BEFORE UPDATE ON public.seller_invitations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_movements_updated_at BEFORE UPDATE ON public.inventory_movements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_platform_cache_entries_updated_at BEFORE UPDATE ON public.platform_cache_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_support_responses_updated_at BEFORE UPDATE ON public.support_responses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.on_order_status_inserted()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.orders SET status = NEW.status, updated_at = NOW() WHERE id = NEW.order_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_order_status_inserted
  AFTER INSERT ON public.order_status_history
  FOR EACH ROW EXECUTE FUNCTION public.on_order_status_inserted();

CREATE OR REPLACE FUNCTION public.on_kyc_inserted()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.sellers SET kyc_status = NEW.status, updated_at = NOW() WHERE id = NEW.seller_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_kyc_inserted
  AFTER INSERT ON public.kyc_verifications
  FOR EACH ROW EXECUTE FUNCTION public.on_kyc_inserted();

CREATE OR REPLACE FUNCTION public.on_internal_event_inserted()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.event_aggregations_hourly (event_type, bucket_hour, event_count, unique_users, unique_sellers, unique_sessions)
  VALUES (NEW.event_type, date_trunc('hour', NEW.created_at), 1, CASE WHEN NEW.user_id IS NOT NULL THEN 1 ELSE 0 END, CASE WHEN NEW.seller_id IS NOT NULL THEN 1 ELSE 0 END, CASE WHEN NEW.session_id IS NOT NULL THEN 1 ELSE 0 END)
  ON CONFLICT (event_type, bucket_hour) DO UPDATE SET event_count = event_aggregations_hourly.event_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_internal_event_inserted
  AFTER INSERT ON public.internal_events
  FOR EACH ROW EXECUTE FUNCTION public.on_internal_event_inserted();

-- ============================================================
-- INDEXES
-- ============================================================

-- profiles
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_phone ON public.profiles(phone_number);
CREATE INDEX idx_profiles_full_name ON public.profiles(full_name);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX idx_profiles_updated_at ON public.profiles(updated_at);

-- user_roles
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_user_roles_is_active ON public.user_roles(is_active);
CREATE UNIQUE INDEX idx_user_roles_user_role_unique ON public.user_roles(user_id, role);

-- sellers
CREATE INDEX idx_sellers_user_id ON public.sellers(user_id);
CREATE INDEX idx_sellers_store_name ON public.sellers(store_name);
CREATE UNIQUE INDEX idx_sellers_slug_unique ON public.sellers(slug);
CREATE INDEX idx_sellers_kyc_status ON public.sellers(kyc_status);
CREATE INDEX idx_sellers_is_featured ON public.sellers(is_featured);
CREATE INDEX idx_sellers_is_active ON public.sellers(is_active);
CREATE INDEX idx_sellers_created_at ON public.sellers(created_at);

-- seller_members
CREATE INDEX idx_seller_members_seller_id ON public.seller_members(seller_id);
CREATE INDEX idx_seller_members_user_id ON public.seller_members(user_id);
CREATE INDEX idx_seller_members_role ON public.seller_members(role);
CREATE INDEX idx_seller_members_is_active ON public.seller_members(is_active);
CREATE UNIQUE INDEX idx_seller_members_seller_user ON public.seller_members(seller_id, user_id);

-- seller_products
CREATE INDEX idx_seller_products_seller_id ON public.seller_products(seller_id);
CREATE INDEX idx_seller_products_product_id ON public.seller_products(product_id);
CREATE INDEX idx_seller_products_sku ON public.seller_products(sku);
CREATE INDEX idx_seller_products_stock_quantity ON public.seller_products(stock_quantity);
CREATE INDEX idx_seller_products_created_at ON public.seller_products(created_at);
CREATE UNIQUE INDEX idx_seller_products_seller_product ON public.seller_products(seller_id, product_id);

-- seller_invitations
CREATE INDEX idx_seller_invitations_seller_id ON public.seller_invitations(seller_id);
CREATE INDEX idx_seller_invitations_email ON public.seller_invitations(email);
CREATE UNIQUE INDEX idx_seller_invitations_token_unique ON public.seller_invitations(token);
CREATE INDEX idx_seller_invitations_status ON public.seller_invitations(status);

-- categories
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);
CREATE UNIQUE INDEX idx_categories_slug_unique ON public.categories(slug);
CREATE INDEX idx_categories_is_active ON public.categories(is_active);
CREATE INDEX idx_categories_sort_order ON public.categories(sort_order);
CREATE INDEX idx_categories_level ON public.categories(level);

-- brands
CREATE INDEX idx_brands_name ON public.brands(name);
CREATE UNIQUE INDEX idx_brands_slug_unique ON public.brands(slug);
CREATE INDEX idx_brands_is_active ON public.brands(is_active);
CREATE INDEX idx_brands_sort_order ON public.brands(sort_order);

-- products
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_brand_id ON public.products(brand_id);
CREATE UNIQUE INDEX idx_products_slug_unique ON public.products(slug);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_is_featured ON public.products(is_featured);
CREATE INDEX idx_products_base_price_minor ON public.products(base_price_minor);
CREATE INDEX idx_products_rating ON public.products(rating);
CREATE INDEX idx_products_total_reviews ON public.products(total_reviews);
CREATE INDEX idx_products_total_sales ON public.products(total_sales);
CREATE INDEX idx_products_created_at ON public.products(created_at);
CREATE INDEX idx_products_search_vector ON public.products USING gin(search_vector);

-- product_variants
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX idx_product_variants_stock_quantity ON public.product_variants(stock_quantity);
CREATE INDEX idx_product_variants_price_override ON public.product_variants(price_override);

-- product_images
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_product_images_sort_order ON public.product_images(sort_order);
CREATE INDEX idx_product_images_is_primary ON public.product_images(is_primary);

-- product_tags
CREATE INDEX idx_product_tags_product_id ON public.product_tags(product_id);
CREATE INDEX idx_product_tags_tag ON public.product_tags(tag);
CREATE UNIQUE INDEX idx_product_tags_product_tag ON public.product_tags(product_id, tag);

-- product_search_documents
CREATE INDEX idx_product_search_documents_product_id ON public.product_search_documents(product_id);
CREATE INDEX idx_product_search_documents_category_id ON public.product_search_documents(category_id);
CREATE INDEX idx_product_search_documents_brand_id ON public.product_search_documents(brand_id);
CREATE INDEX idx_product_search_documents_search_vector ON public.product_search_documents USING gin(search_vector);
CREATE INDEX idx_product_search_documents_published_at ON public.product_search_documents(published_at);
CREATE INDEX idx_product_search_documents_is_featured ON public.product_search_documents(is_featured);

-- addresses
CREATE INDEX idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX idx_addresses_is_default ON public.addresses(is_default);
CREATE INDEX idx_addresses_address_type ON public.addresses(address_type);

-- carts
CREATE INDEX idx_carts_user_id ON public.carts(user_id);
CREATE INDEX idx_carts_session_id ON public.carts(session_id);
CREATE INDEX idx_carts_status ON public.carts(status);
CREATE UNIQUE INDEX idx_carts_user_unique ON public.carts(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_carts_session_unique ON public.carts(session_id) WHERE session_id IS NOT NULL;

-- cart_items
CREATE INDEX idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX idx_cart_items_variant_id ON public.cart_items(variant_id);

-- wishlist_items
CREATE INDEX idx_wishlist_items_user_id ON public.wishlist_items(user_id);
CREATE INDEX idx_wishlist_items_product_id ON public.wishlist_items(product_id);
CREATE UNIQUE INDEX idx_wishlist_items_user_product ON public.wishlist_items(user_id, product_id);

-- orders
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_orders_payment_reference ON public.orders(payment_reference);

-- order_items
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX idx_order_items_seller_id ON public.order_items(seller_id);

-- order_status_history
CREATE INDEX idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX idx_order_status_history_status ON public.order_status_history(status);
CREATE INDEX idx_order_status_history_created_at ON public.order_status_history(created_at);

-- refunds
CREATE INDEX idx_refunds_order_id ON public.refunds(order_id);
CREATE INDEX idx_refunds_user_id ON public.refunds(user_id);
CREATE INDEX idx_refunds_seller_id ON public.refunds(seller_id);
CREATE INDEX idx_refunds_status ON public.refunds(status);
CREATE INDEX idx_refunds_created_at ON public.refunds(created_at);

-- delivery_partners
CREATE INDEX idx_delivery_partners_user_id ON public.delivery_partners(user_id);
CREATE INDEX idx_delivery_partners_is_active ON public.delivery_partners(is_active);
CREATE INDEX idx_delivery_partners_is_available ON public.delivery_partners(is_available);
CREATE INDEX idx_delivery_partners_current_location ON public.delivery_partners USING gist(current_location);

-- coupons
CREATE INDEX idx_coupons_seller_id ON public.coupons(seller_id);
CREATE UNIQUE INDEX idx_coupons_code_unique ON public.coupons(code);
CREATE INDEX idx_coupons_is_active ON public.coupons(is_active);
CREATE INDEX idx_coupons_expires_at ON public.coupons(expires_at);

-- reviews
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_order_id ON public.reviews(order_id);
CREATE INDEX idx_reviews_seller_id ON public.reviews(seller_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at);

-- conversations
CREATE INDEX idx_conversations_type ON public.conversations(type);
CREATE INDEX idx_conversations_participant_buyer_id ON public.conversations(participant_buyer_id);
CREATE INDEX idx_conversations_participant_seller_id ON public.conversations(participant_seller_id);
CREATE INDEX idx_conversations_participant_admin_id ON public.conversations(participant_admin_id);
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at);
CREATE INDEX idx_conversations_created_at ON public.conversations(created_at);

-- messages
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_sender_role ON public.messages(sender_role);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- support_tickets
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_conversation_id ON public.support_tickets(conversation_id);
CREATE INDEX idx_support_tickets_category ON public.support_tickets(category);
CREATE INDEX idx_support_tickets_priority ON public.support_tickets(priority);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_created_at ON public.support_tickets(created_at);

-- support_responses
CREATE INDEX idx_support_responses_ticket_id ON public.support_responses(ticket_id);
CREATE INDEX idx_support_responses_sender_id ON public.support_responses(sender_id);
CREATE INDEX idx_support_responses_created_at ON public.support_responses(created_at);

-- ai_training_conversations
CREATE INDEX idx_ai_training_conversations_session_id ON public.ai_training_conversations(session_id);
CREATE INDEX idx_ai_training_conversations_user_id ON public.ai_training_conversations(user_id);
CREATE INDEX idx_ai_training_conversations_confidence ON public.ai_training_conversations(confidence);
CREATE INDEX idx_ai_training_conversations_created_at ON public.ai_training_conversations(created_at);

-- chat_conversations
CREATE INDEX idx_chat_conversations_session_id ON public.chat_conversations(session_id);
CREATE INDEX idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX idx_chat_conversations_created_at ON public.chat_conversations(created_at);

-- chat_messages
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_role ON public.chat_messages(role);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- kyc_verifications
CREATE INDEX idx_kyc_verifications_seller_id ON public.kyc_verifications(seller_id);
CREATE INDEX idx_kyc_verifications_status ON public.kyc_verifications(status);
CREATE INDEX idx_kyc_verifications_created_at ON public.kyc_verifications(created_at);

-- admin_users
CREATE INDEX idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX idx_admin_users_role ON public.admin_users(role);
CREATE INDEX idx_admin_users_is_active ON public.admin_users(is_active);
CREATE INDEX idx_admin_users_created_at ON public.admin_users(created_at);

-- admin_roles
CREATE UNIQUE INDEX idx_admin_roles_name_unique ON public.admin_roles(name);

-- admin_audit_log
CREATE INDEX idx_admin_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_log_action ON public.admin_audit_log(action);
CREATE INDEX idx_admin_audit_log_resource_type ON public.admin_audit_log(resource_type);
CREATE INDEX idx_admin_audit_log_created_at ON public.admin_audit_log(created_at);

-- moderation_queue
CREATE INDEX idx_moderation_queue_content_type ON public.moderation_queue(content_type);
CREATE INDEX idx_moderation_queue_status ON public.moderation_queue(status);
CREATE INDEX idx_moderation_queue_created_at ON public.moderation_queue(created_at);

-- platform_maintenance_windows
CREATE INDEX idx_platform_maintenance_windows_is_active ON public.platform_maintenance_windows(is_active);
CREATE INDEX idx_platform_maintenance_windows_scheduled_start ON public.platform_maintenance_windows(scheduled_start);

-- platform_cache_entries
CREATE UNIQUE INDEX idx_platform_cache_entries_key ON public.platform_cache_entries(key);
CREATE INDEX idx_platform_cache_entries_category ON public.platform_cache_entries(category);
CREATE INDEX idx_platform_cache_entries_expires_at ON public.platform_cache_entries(expires_at);

-- event aggregations
CREATE UNIQUE INDEX idx_event_aggregations_hourly_type_hour ON public.event_aggregations_hourly(event_type, bucket_hour);
CREATE UNIQUE INDEX idx_event_aggregations_daily_type_date ON public.event_aggregations_daily(event_type, bucket_date);

-- internal_events
CREATE INDEX idx_internal_events_event_type ON public.internal_events(event_type);
CREATE INDEX idx_internal_events_user_id ON public.internal_events(user_id);
CREATE INDEX idx_internal_events_created_at ON public.internal_events(created_at);

-- security_audit_log
CREATE INDEX idx_security_audit_log_event_type ON public.security_audit_log(event_type);
CREATE INDEX idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX idx_security_audit_log_created_at ON public.security_audit_log(created_at);

-- inventory
CREATE INDEX idx_inventory_items_product_id ON public.inventory_items(product_id);
CREATE INDEX idx_inventory_items_variant_id ON public.inventory_items(variant_id);
CREATE INDEX idx_inventory_items_quantity_available ON public.inventory_items(quantity_available);
CREATE UNIQUE INDEX idx_inventory_items_product_variant ON public.inventory_items(product_id, variant_id);

CREATE INDEX idx_inventory_movements_item_id ON public.inventory_movements(item_id);
CREATE INDEX idx_inventory_movements_type ON public.inventory_movements(type);
CREATE INDEX idx_inventory_movements_created_at ON public.inventory_movements(created_at);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY + FORCE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_search_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_training_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_maintenance_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_cache_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_aggregations_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_aggregations_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.sellers FORCE ROW LEVEL SECURITY;
ALTER TABLE public.seller_members FORCE ROW LEVEL SECURITY;
ALTER TABLE public.seller_products FORCE ROW LEVEL SECURITY;
ALTER TABLE public.seller_invitations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.categories FORCE ROW LEVEL SECURITY;
ALTER TABLE public.brands FORCE ROW LEVEL SECURITY;
ALTER TABLE public.products FORCE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants FORCE ROW LEVEL SECURITY;
ALTER TABLE public.product_images FORCE ROW LEVEL SECURITY;
ALTER TABLE public.product_tags FORCE ROW LEVEL SECURITY;
ALTER TABLE public.product_search_documents FORCE ROW LEVEL SECURITY;
ALTER TABLE public.addresses FORCE ROW LEVEL SECURITY;
ALTER TABLE public.carts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items FORCE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items FORCE ROW LEVEL SECURITY;
ALTER TABLE public.orders FORCE ROW LEVEL SECURITY;
ALTER TABLE public.order_items FORCE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history FORCE ROW LEVEL SECURITY;
ALTER TABLE public.refunds FORCE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_partners FORCE ROW LEVEL SECURITY;
ALTER TABLE public.coupons FORCE ROW LEVEL SECURITY;
ALTER TABLE public.reviews FORCE ROW LEVEL SECURITY;
ALTER TABLE public.conversations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.messages FORCE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets FORCE ROW LEVEL SECURITY;
ALTER TABLE public.support_responses FORCE ROW LEVEL SECURITY;
ALTER TABLE public.ai_training_conversations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages FORCE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verifications FORCE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users FORCE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log FORCE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_queue FORCE ROW LEVEL SECURITY;
ALTER TABLE public.platform_maintenance_windows FORCE ROW LEVEL SECURITY;
ALTER TABLE public.platform_cache_entries FORCE ROW LEVEL SECURITY;
ALTER TABLE public.event_aggregations_hourly FORCE ROW LEVEL SECURITY;
ALTER TABLE public.event_aggregations_daily FORCE ROW LEVEL SECURITY;
ALTER TABLE public.internal_events FORCE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log FORCE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items FORCE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements FORCE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (is_admin());

-- user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (is_admin());

-- sellers
CREATE POLICY "Users can view all sellers" ON public.sellers FOR SELECT USING (true);
CREATE POLICY "Users can insert own seller" ON public.sellers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Sellers can update own store" ON public.sellers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all sellers" ON public.sellers FOR ALL USING (is_admin());

-- seller_members
CREATE POLICY "Users can view seller members" ON public.seller_members FOR SELECT USING (true);
CREATE POLICY "Sellers can manage members" ON public.seller_members FOR ALL USING (is_seller());

-- seller_products
CREATE POLICY "Users can view all seller products" ON public.seller_products FOR SELECT USING (true);
CREATE POLICY "Sellers can manage own products" ON public.seller_products FOR ALL USING (is_seller());
CREATE POLICY "Admins can manage all seller products" ON public.seller_products FOR ALL USING (is_admin());

-- categories
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage all categories" ON public.categories FOR ALL USING (is_admin());

-- brands
CREATE POLICY "Anyone can view active brands" ON public.brands FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage all brands" ON public.brands FOR ALL USING (is_admin());

-- products
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Sellers can manage own products" ON public.products FOR ALL USING (is_seller());
CREATE POLICY "Admins can manage all products" ON public.products FOR ALL USING (is_admin());

-- product_variants
CREATE POLICY "Anyone can view product variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Sellers can manage product variants" ON public.product_variants FOR ALL USING (is_seller());
CREATE POLICY "Admins can manage all product variants" ON public.product_variants FOR ALL USING (is_admin());

-- product_images
CREATE POLICY "Anyone can view product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Sellers can manage product images" ON public.product_images FOR ALL USING (is_seller());
CREATE POLICY "Admins can manage all product images" ON public.product_images FOR ALL USING (is_admin());

-- product_tags
CREATE POLICY "Anyone can view product tags" ON public.product_tags FOR SELECT USING (true);
CREATE POLICY "Sellers can manage product tags" ON public.product_tags FOR ALL USING (is_seller());

-- product_search_documents
CREATE POLICY "Anyone can view product search documents" ON public.product_search_documents FOR SELECT USING (true);
CREATE POLICY "Admins can manage product search documents" ON public.product_search_documents FOR ALL USING (is_admin());

-- addresses
CREATE POLICY "Users can view own addresses" ON public.addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON public.addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON public.addresses FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all addresses" ON public.addresses FOR ALL USING (is_admin());

-- carts
CREATE POLICY "Users can view own cart" ON public.carts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart" ON public.carts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart" ON public.carts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart" ON public.carts FOR DELETE USING (auth.uid() = user_id);

-- cart_items
CREATE POLICY "Users can view own cart items" ON public.cart_items FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.carts WHERE id = cart_id));
CREATE POLICY "Users can insert own cart items" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.carts WHERE id = cart_id));
CREATE POLICY "Users can update own cart items" ON public.cart_items FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.carts WHERE id = cart_id));
CREATE POLICY "Users can delete own cart items" ON public.cart_items FOR DELETE USING (auth.uid() = (SELECT user_id FROM public.carts WHERE id = cart_id));

-- wishlist_items
CREATE POLICY "Users can view own wishlist" ON public.wishlist_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wishlist" ON public.wishlist_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishlist" ON public.wishlist_items FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view product wishlist counts" ON public.wishlist_items FOR SELECT USING (true);

-- orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Sellers can view assigned orders" ON public.orders FOR SELECT USING (is_seller());
CREATE POLICY "Sellers can update assigned orders" ON public.orders FOR UPDATE USING (is_seller());
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL USING (is_admin());

-- order_items
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.orders WHERE id = order_id));
CREATE POLICY "Sellers can view assigned order items" ON public.order_items FOR SELECT USING (is_seller());
CREATE POLICY "Admins can manage all order items" ON public.order_items FOR ALL USING (is_admin());

-- order_status_history
CREATE POLICY "Users can view order status history" ON public.order_status_history FOR SELECT USING (true);
CREATE POLICY "Sellers can manage order status history" ON public.order_status_history FOR ALL USING (is_seller());
CREATE POLICY "Admins can manage all order status history" ON public.order_status_history FOR ALL USING (is_admin());

-- refunds
CREATE POLICY "Users can view own refunds" ON public.refunds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Sellers can view assigned refunds" ON public.refunds FOR SELECT USING (is_seller());
CREATE POLICY "Sellers can update assigned refunds" ON public.refunds FOR UPDATE USING (is_seller());
CREATE POLICY "Admins can manage all refunds" ON public.refunds FOR ALL USING (is_admin());

-- delivery_partners
CREATE POLICY "Users can view delivery partners" ON public.delivery_partners FOR SELECT USING (true);
CREATE POLICY "Delivery partners can update own profile" ON public.delivery_partners FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all delivery partners" ON public.delivery_partners FOR ALL USING (is_admin());

-- coupons
CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Sellers can manage own coupons" ON public.coupons FOR ALL USING (is_seller());
CREATE POLICY "Admins can manage all coupons" ON public.coupons FOR ALL USING (is_admin());

-- reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all reviews" ON public.reviews FOR ALL USING (is_admin());

-- conversations
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = participant_buyer_id OR auth.uid() = participant_seller_id OR auth.uid() = participant_admin_id);
CREATE POLICY "Users can insert conversations" ON public.conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own conversations" ON public.conversations FOR UPDATE USING (auth.uid() = participant_buyer_id OR auth.uid() = participant_seller_id OR auth.uid() = participant_admin_id);

-- messages
CREATE POLICY "Users can view messages in own conversations" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = (SELECT participant_buyer_id FROM public.conversations WHERE id = conversation_id) OR auth.uid() = (SELECT participant_seller_id FROM public.conversations WHERE id = conversation_id) OR auth.uid() = (SELECT participant_admin_id FROM public.conversations WHERE id = conversation_id));
CREATE POLICY "Users can insert messages in own conversations" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- support_tickets
CREATE POLICY "Users can view own support tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own support tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all support tickets" ON public.support_tickets FOR ALL USING (is_admin());

-- support_responses
CREATE POLICY "Users can view support responses" ON public.support_responses FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = (SELECT user_id FROM public.support_tickets WHERE id = ticket_id));
CREATE POLICY "Users can insert support responses" ON public.support_responses FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Admins can manage all support responses" ON public.support_responses FOR ALL USING (is_admin());

-- ai_training_conversations
CREATE POLICY "Users can view own training conversations" ON public.ai_training_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all training conversations" ON public.ai_training_conversations FOR ALL USING (is_admin());

-- chat_conversations
CREATE POLICY "Users can view own chat conversations" ON public.chat_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat conversations" ON public.chat_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all chat conversations" ON public.chat_conversations FOR ALL USING (is_admin());

-- chat_messages
CREATE POLICY "Users can view chat messages in own conversations" ON public.chat_messages FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.chat_conversations WHERE id = conversation_id));
CREATE POLICY "Users can insert chat messages in own conversations" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.chat_conversations WHERE id = conversation_id));

-- kyc_verifications
CREATE POLICY "Users can view own KYC verifications" ON public.kyc_verifications FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.sellers WHERE id = seller_id));
CREATE POLICY "Users can insert own KYC verifications" ON public.kyc_verifications FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.sellers WHERE id = seller_id));
CREATE POLICY "Admins can manage all KYC verifications" ON public.kyc_verifications FOR ALL USING (is_admin());

-- admin_users
CREATE POLICY "Admins can view all admin users" ON public.admin_users FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert admin users" ON public.admin_users FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update admin users" ON public.admin_users FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete admin users" ON public.admin_users FOR DELETE USING (is_admin());

-- admin_roles
CREATE POLICY "Admins can view all admin roles" ON public.admin_roles FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage admin roles" ON public.admin_roles FOR ALL USING (is_admin());

-- admin_audit_log
CREATE POLICY "Admins can view all audit logs" ON public.admin_audit_log FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_log FOR INSERT WITH CHECK (is_admin());

-- moderation_queue
CREATE POLICY "Users can view moderation queue" ON public.moderation_queue FOR SELECT USING (true);
CREATE POLICY "Users can insert moderation reports" ON public.moderation_queue FOR INSERT WITH CHECK (auth.uid() = reported_by);
CREATE POLICY "Admins can manage moderation queue" ON public.moderation_queue FOR ALL USING (is_admin());

-- platform_maintenance_windows
CREATE POLICY "Anyone can view active maintenance" ON public.platform_maintenance_windows FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage maintenance windows" ON public.platform_maintenance_windows FOR ALL USING (is_admin());

-- platform_cache_entries
CREATE POLICY "Anyone can view cache entries" ON public.platform_cache_entries FOR SELECT USING (true);
CREATE POLICY "Admins can manage cache entries" ON public.platform_cache_entries FOR ALL USING (is_admin());

-- event aggregations
CREATE POLICY "Admins can view event aggregations hourly" ON public.event_aggregations_hourly FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert event aggregations hourly" ON public.event_aggregations_hourly FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can view event aggregations daily" ON public.event_aggregations_daily FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert event aggregations daily" ON public.event_aggregations_daily FOR INSERT WITH CHECK (is_admin());

-- internal_events
CREATE POLICY "Admins can view internal events" ON public.internal_events FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert internal events" ON public.internal_events FOR INSERT WITH CHECK (is_admin());

-- security_audit_log
CREATE POLICY "Admins can view security audit logs" ON public.security_audit_log FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert security audit logs" ON public.security_audit_log FOR INSERT WITH CHECK (is_admin());

-- inventory
CREATE POLICY "Anyone can view inventory items" ON public.inventory_items FOR SELECT USING (true);
CREATE POLICY "Sellers can manage inventory items" ON public.inventory_items FOR ALL USING (is_seller());
CREATE POLICY "Admins can manage all inventory items" ON public.inventory_items FOR ALL USING (is_admin());
CREATE POLICY "Anyone can view inventory movements" ON public.inventory_movements FOR SELECT USING (true);
CREATE POLICY "Sellers can manage inventory movements" ON public.inventory_movements FOR ALL USING (is_seller());
CREATE POLICY "Admins can manage all inventory movements" ON public.inventory_movements FOR ALL USING (is_admin());

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
  ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
  ('seller-logos', 'seller-logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
  ('kyc-documents', 'kyc-documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
  ('category-images', 'category-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
  ('admin-uploads', 'admin-uploads', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf']),
  ('chat-files', 'chat-files', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf', 'text/plain']),
  ('export-files', 'export-files', false, 52428800, ARRAY['text/csv', 'application/json']);

INSERT INTO storage.objects (id, bucket_id, name, metadata, owner_id, created_at, updated_at, last_accessed_at, version)
VALUES ('30ef4b18-1801-4d13-9d8e-456332ea3e12', 'avatars', 'folder', '{"mimetype": "folder", "size": 0, "cacheControl": "no-cache"}'::jsonb, NULL, NOW(), NOW(), NOW(), NULL);

-- Storage policies
CREATE POLICY "Avatar upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Avatar read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Product image upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Product image read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Seller logo upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'seller-logos' AND auth.role() = 'authenticated');
CREATE POLICY "Seller logo read" ON storage.objects FOR SELECT USING (bucket_id = 'seller-logos');
CREATE POLICY "KYC document upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'kyc-documents' AND auth.role() = 'authenticated');
CREATE POLICY "KYC document read" ON storage.objects FOR SELECT USING (bucket_id = 'kyc-documents');
CREATE POLICY "Category image upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'category-images' AND auth.role() = 'authenticated');
CREATE POLICY "Category image read" ON storage.objects FOR SELECT USING (bucket_id = 'category-images');
CREATE POLICY "Admin upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'admin-uploads' AND auth.role() = 'authenticated');
CREATE POLICY "Admin read" ON storage.objects FOR SELECT USING (bucket_id = 'admin-uploads');
CREATE POLICY "Chat file upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-files' AND auth.role() = 'authenticated');
CREATE POLICY "Chat file read" ON storage.objects FOR SELECT USING (bucket_id = 'chat-files');
CREATE POLICY "Export file upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'export-files' AND auth.role() = 'authenticated');
CREATE POLICY "Export file read" ON storage.objects FOR SELECT USING (bucket_id = 'export-files');

-- ============================================================
-- API ROLE GRANTS
-- RLS policies control WHICH rows a role can see, but they are
-- meaningless without the underlying Postgres GRANT - a role with
-- zero table privileges gets "permission denied for table X" on
-- every query regardless of what any RLS policy says. This section
-- must run before schema lockdown revokes CREATE (order doesn't
-- matter for these grants specifically, but keeping this immediately
-- before lockdown makes it clear both are part of "finalize schema").
-- ============================================================

-- Custom enum/domain types must be usable by API roles, or any
-- column using them becomes unreadable via PostgREST.
DO $$
DECLARE
  type_record record;
BEGIN
  FOR type_record IN
    SELECT n.nspname, t.typname
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typtype IN ('d', 'e')
  LOOP
    EXECUTE format(
      'grant usage on type %I.%I to anon, authenticated, service_role',
      type_record.nspname,
      type_record.typname
    );
  END LOOP;
END $$;

-- Broad catch-all grants for authenticated/service_role. RLS remains
-- the real access-control layer for `authenticated`; this restores
-- the base privilege every RLS policy assumes already exists.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public TO service_role;

-- Explicit anon SELECT grants - only tables/views with intentionally
-- public-read RLS policies.
GRANT SELECT ON TABLE
  public.countries,
  public.sellers,
  public.categories,
  public.brands,
  public.products,
  public.product_images,
  public.product_variants,
  public.product_attributes,
  public.collections,
  public.collection_products,
  public.reviews,
  public.feature_flags,
  public.shipping_profiles,
  public.shipping_zones,
  public.coupons,
  public.promotions,
  public.banners,
  public.cms_pages,
  public.faqs,
  public.notification_categories,
  public.admin_broadcasts,
  public.product_reviews,
  public.seller_reviews,
  public.review_media,
  public.rating_summaries,
  public.product_search_documents,
  public.popular_search_terms,
  public.published_product_reviews,
  public.published_seller_reviews,
  public.search_product_catalog
TO anon;

GRANT SELECT ON TABLE
  public.product_catalog,
  public.seller_storefronts
TO anon, authenticated;

GRANT INSERT ON TABLE public.contact_requests TO anon;

-- RLS-helper functions must be executable, or every policy that
-- calls them fails closed for anon/authenticated.
GRANT EXECUTE ON FUNCTION public.current_user_has_role(public.app_role) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_is_staff() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_can_manage_seller(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.storage_folder_uuid(text, integer) TO authenticated, service_role;

-- Any other RPC-callable function (search ranking, seller analytics,
-- etc.) - broad execute for authenticated/service_role. Add anon-specific
-- execute grants above on a per-function basis if a specific RPC needs
-- to be anon-callable; do not widen this blanket grant to anon.
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;

-- ============================================================
-- SCHEMA LOCKDOWN
-- ============================================================

REVOKE CREATE ON SCHEMA public FROM postgres;
REVOKE CREATE ON SCHEMA public FROM anon;
REVOKE CREATE ON SCHEMA public FROM authenticated;
REVOKE CREATE ON SCHEMA public FROM service_role;
