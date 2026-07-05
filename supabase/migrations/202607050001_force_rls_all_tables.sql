-- ============================================================
-- SECURITY FIX: Add FORCE ROW LEVEL SECURITY to all tables
-- created after 202607010004_production_hardening.sql
-- ============================================================

-- Commerce engine (202607020003)
ALTER TABLE public.order_coupon_applications FORCE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history FORCE ROW LEVEL SECURITY;

-- Messaging engine (202607020004)
ALTER TABLE public.message_attachments FORCE ROW LEVEL SECURITY;
ALTER TABLE public.message_moderation_events FORCE ROW LEVEL SECURITY;

-- Notifications (202607020005)
ALTER TABLE public.platform_events FORCE ROW LEVEL SECURITY;
ALTER TABLE public.notification_categories FORCE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences FORCE ROW LEVEL SECURITY;
ALTER TABLE public.email_outbox FORCE ROW LEVEL SECURITY;
ALTER TABLE public.admin_broadcasts FORCE ROW LEVEL SECURITY;

-- Reviews & Ratings (202607020006)
ALTER TABLE public.product_reviews FORCE ROW LEVEL SECURITY;
ALTER TABLE public.seller_reviews FORCE ROW LEVEL SECURITY;
ALTER TABLE public.review_media FORCE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpful_votes FORCE ROW LEVEL SECURITY;
ALTER TABLE public.review_reports FORCE ROW LEVEL SECURITY;
ALTER TABLE public.rating_summaries FORCE ROW LEVEL SECURITY;

-- Search & Discovery (202607020007)
ALTER TABLE public.product_search_documents FORCE ROW LEVEL SECURITY;
ALTER TABLE public.search_history FORCE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches FORCE ROW LEVEL SECURITY;
ALTER TABLE public.recently_viewed_products FORCE ROW LEVEL SECURITY;
ALTER TABLE public.popular_search_terms FORCE ROW LEVEL SECURITY;

-- Seller Analytics (202607020008)
ALTER TABLE public.seller_daily_metrics FORCE ROW LEVEL SECURITY;
ALTER TABLE public.seller_product_metrics FORCE ROW LEVEL SECURITY;

-- Marketplace Analytics (202607020009)
ALTER TABLE public.marketplace_daily_metrics FORCE ROW LEVEL SECURITY;

-- Marketplace BI (202607020010)
ALTER TABLE public.marketplace_bi_daily_metrics FORCE ROW LEVEL SECURITY;

-- Event Analytics & Observability (202607020011)
ALTER TABLE public.internal_events FORCE ROW LEVEL SECURITY;
ALTER TABLE public.event_aggregations_hourly FORCE ROW LEVEL SECURITY;
ALTER TABLE public.event_aggregations_daily FORCE ROW LEVEL SECURITY;
ALTER TABLE public.app_metrics FORCE ROW LEVEL SECURITY;
ALTER TABLE public.db_metrics FORCE ROW LEVEL SECURITY;
ALTER TABLE public.cache_metrics FORCE ROW LEVEL SECURITY;
ALTER TABLE public.storage_metrics FORCE ROW LEVEL SECURITY;
ALTER TABLE public.forecasting_hooks FORCE ROW LEVEL SECURITY;
ALTER TABLE public.forecasting_hook_invocations FORCE ROW LEVEL SECURITY;

-- Platform Infrastructure (202607020012)
ALTER TABLE public.platform_jobs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.platform_job_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.platform_cache_entries FORCE ROW LEVEL SECURITY;
ALTER TABLE public.platform_config FORCE ROW LEVEL SECURITY;
ALTER TABLE public.platform_files FORCE ROW LEVEL SECURITY;
ALTER TABLE public.platform_storage_metrics FORCE ROW LEVEL SECURITY;

-- Platform Operations (202607020013)
ALTER TABLE public.platform_rate_limits FORCE ROW LEVEL SECURITY;
ALTER TABLE public.platform_maintenance_windows FORCE ROW LEVEL SECURITY;
ALTER TABLE public.platform_audit_log FORCE ROW LEVEL SECURITY;

-- AI Support Assistant (202607040001)
ALTER TABLE public.knowledge_articles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets FORCE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages FORCE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments FORCE ROW LEVEL SECURITY;

-- 2FA & Store images (202607040002)
ALTER TABLE public.user_2fa_backup_codes FORCE ROW LEVEL SECURITY;
