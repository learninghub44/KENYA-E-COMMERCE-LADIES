-- ============================================================================
-- PERFORMANCE INDEXES
-- Critical indexes for query performance at scale
-- ============================================================================

-- Foundation tables
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON public.user_roles(user_id, role);

-- Sellers
CREATE INDEX IF NOT EXISTS idx_sellers_slug ON public.sellers(slug);
CREATE INDEX IF NOT EXISTS idx_sellers_status ON public.sellers(status);
CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON public.sellers(user_id);
CREATE INDEX IF NOT EXISTS idx_sellers_store_name ON public.sellers(store_name);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_seller_status ON public.products(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_base_price_minor ON public.products(base_price_minor);

-- Product images
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_position ON public.product_images(product_id, position);

-- Product variants
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);

-- Product attributes
CREATE INDEX IF NOT EXISTS idx_product_attributes_product_id ON public.product_attributes(product_id);

-- Inventory
CREATE INDEX IF NOT EXISTS idx_inventory_items_product_id ON public.inventory_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_product_variant ON public.inventory_items(product_id, variant_id);

-- Categories
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);

-- Brands
CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands(slug);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_status ON public.orders(buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_seller_status ON public.orders(seller_id, status);

-- Order items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_seller_id ON public.order_items(seller_id);

-- Order status history
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_buyer_id ON public.product_reviews(buyer_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_seller_id ON public.product_reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_status ON public.product_reviews(status);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON public.product_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seller_reviews_seller_id ON public.seller_reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_reviews_buyer_id ON public.seller_reviews(buyer_id);
CREATE INDEX IF NOT EXISTS idx_seller_reviews_status ON public.seller_reviews(status);
CREATE INDEX IF NOT EXISTS idx_rating_summaries_target ON public.rating_summaries(target_id, target_type);

-- Conversations & Messages
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON public.conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON public.conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_product_id ON public.conversations(product_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Addresses
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);

-- Wishlists
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist_id ON public.wishlist_items(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id ON public.wishlist_items(product_id);

-- Carts
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);

-- Coupons
CREATE INDEX IF NOT EXISTS idx_coupons_seller_id ON public.coupons(seller_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_seller_active ON public.coupons(seller_id, is_active);

-- Store followers
CREATE INDEX IF NOT EXISTS idx_store_followers_seller_id ON public.store_followers(seller_id);
CREATE INDEX IF NOT EXISTS idx_store_followers_user_id ON public.store_followers(user_id);

-- Audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Activity logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);

-- Search documents
CREATE INDEX IF NOT EXISTS idx_product_search_documents_product_id ON public.product_search_documents(product_id);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_user_id ON public.recently_viewed_products(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_product ON public.recently_viewed_products(product_id);
CREATE INDEX IF NOT EXISTS idx_popular_search_terms_term ON public.popular_search_terms(search_term);

-- KYC
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_seller_id ON public.kyc_verifications(seller_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_status ON public.kyc_verifications(status);

-- Platform infrastructure
CREATE INDEX IF NOT EXISTS idx_platform_config_key ON public.platform_config(config_key);
CREATE INDEX IF NOT EXISTS idx_platform_config_feature_flag ON public.platform_config(is_feature_flag) WHERE is_feature_flag = true;
CREATE INDEX IF NOT EXISTS idx_platform_jobs_status ON public.platform_jobs(status);
CREATE INDEX IF NOT EXISTS idx_platform_jobs_queue ON public.platform_jobs(queue, status);
CREATE INDEX IF NOT EXISTS idx_platform_jobs_scheduled ON public.platform_jobs(scheduled_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_platform_cache_entries_key ON public.platform_cache_entries(cache_namespace, cache_key);
CREATE INDEX IF NOT EXISTS idx_platform_cache_entries_expires ON public.platform_cache_entries(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_platform_files_checksum ON public.platform_files(checksum);
CREATE INDEX IF NOT EXISTS idx_platform_files_entity ON public.platform_files(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_platform_maintenance_active ON public.platform_maintenance_windows(is_active) WHERE is_active = true;

-- Events & observability
CREATE INDEX IF NOT EXISTS idx_internal_events_type ON public.internal_events(event_type);
CREATE INDEX IF NOT EXISTS idx_internal_events_user ON public.internal_events(user_id);
CREATE INDEX IF NOT EXISTS idx_internal_events_seller ON public.internal_events(seller_id);
CREATE INDEX IF NOT EXISTS idx_internal_events_created ON public.internal_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_internal_events_entity ON public.internal_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_internal_events_source ON public.internal_events(source);

-- Contact requests
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON public.contact_requests(created_at DESC);

-- Seller daily metrics (for analytics queries)
CREATE INDEX IF NOT EXISTS idx_seller_daily_metrics_seller_metric ON public.seller_daily_metrics(seller_id, metric_date DESC);
