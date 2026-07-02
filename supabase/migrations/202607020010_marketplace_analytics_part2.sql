-- Agent 11B Part 2: Business Intelligence, Search, Review, Messaging, Notification Analytics
-- Idempotent and safe to rerun on existing Supabase databases.

-- ============================================================
-- BUSINESS INTELLIGENCE MATERIALIZED VIEWS
-- ============================================================

-- Daily BI metrics table
create table if not exists public.marketplace_bi_daily_metrics (
  metric_date date primary key,
  fastest_growing_category_id uuid,
  fastest_growing_category_name text,
  fastest_growing_category_growth numeric default 0,
  highest_revenue_category_id uuid,
  highest_revenue_category_name text,
  highest_revenue_category_revenue bigint default 0,
  highest_conversion_category_id uuid,
  highest_conversion_category_name text,
  highest_conversion_category_rate numeric default 0,
  lowest_performing_category_id uuid,
  lowest_performing_category_name text,
  lowest_performing_category_revenue bigint default 0,
  best_performing_brand_id uuid,
  best_performing_brand_name text,
  best_performing_brand_revenue bigint default 0,
  lowest_performing_brand_id uuid,
  lowest_performing_brand_name text,
  lowest_performing_brand_revenue bigint default 0,
  fastest_growing_seller_id uuid,
  fastest_growing_seller_name text,
  fastest_growing_seller_growth numeric default 0,
  total_revenue_minor bigint default 0,
  total_orders integer default 0,
  total_new_products integer default 0,
  total_new_sellers integer default 0,
  total_new_buyers integer default 0,
  average_rating numeric(3,2) default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marketplace_bi_daily_metrics add column if not exists fastest_growing_category_id uuid;
alter table public.marketplace_bi_daily_metrics add column if not exists fastest_growing_category_name text;
alter table public.marketplace_bi_daily_metrics add column if not exists fastest_growing_category_growth numeric default 0;
alter table public.marketplace_bi_daily_metrics add column if not exists highest_revenue_category_id uuid;
alter table public.marketplace_bi_daily_metrics add column if not exists highest_revenue_category_name text;
alter table public.marketplace_bi_daily_metrics add column if not exists highest_revenue_category_revenue bigint default 0;
alter table public.marketplace_bi_daily_metrics add column if not exists highest_conversion_category_id uuid;
alter table public.marketplace_bi_daily_metrics add column if not exists highest_conversion_category_name text;
alter table public.marketplace_bi_daily_metrics add column if not exists highest_conversion_category_rate numeric default 0;
alter table public.marketplace_bi_daily_metrics add column if not exists lowest_performing_category_id uuid;
alter table public.marketplace_bi_daily_metrics add column if not exists lowest_performing_category_name text;
alter table public.marketplace_bi_daily_metrics add column if not exists lowest_performing_category_revenue bigint default 0;
alter table public.marketplace_bi_daily_metrics add column if not exists best_performing_brand_id uuid;
alter table public.marketplace_bi_daily_metrics add column if not exists best_performing_brand_name text;
alter table public.marketplace_bi_daily_metrics add column if not exists best_performing_brand_revenue bigint default 0;
alter table public.marketplace_bi_daily_metrics add column if not exists lowest_performing_brand_id uuid;
alter table public.marketplace_bi_daily_metrics add column if not exists lowest_performing_brand_name text;
alter table public.marketplace_bi_daily_metrics add column if not exists lowest_performing_brand_revenue bigint default 0;
alter table public.marketplace_bi_daily_metrics add column if not exists fastest_growing_seller_id uuid;
alter table public.marketplace_bi_daily_metrics add column if not exists fastest_growing_seller_name text;
alter table public.marketplace_bi_daily_metrics add column if not exists fastest_growing_seller_growth numeric default 0;
alter table public.marketplace_bi_daily_metrics add column if not exists total_revenue_minor bigint default 0;
alter table public.marketplace_bi_daily_metrics add column if not exists total_orders integer default 0;
alter table public.marketplace_bi_daily_metrics add column if not exists total_new_products integer default 0;
alter table public.marketplace_bi_daily_metrics add column if not exists total_new_sellers integer default 0;
alter table public.marketplace_bi_daily_metrics add column if not exists total_new_buyers integer default 0;
alter table public.marketplace_bi_daily_metrics add column if not exists average_rating numeric(3,2) default 0;
alter table public.marketplace_bi_daily_metrics add column if not exists created_at timestamptz not null default now();
alter table public.marketplace_bi_daily_metrics add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_bi_daily_metrics_date on public.marketplace_bi_daily_metrics (metric_date desc);

-- ============================================================
-- SEARCH ANALYTICS FUNCTIONS
-- ============================================================

create or replace function public.get_marketplace_search_analytics(
  p_start_date date,
  p_end_date date,
  p_previous_start_date date,
  p_previous_end_date date
)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'totalSearches', coalesce((select count(*)::int from public.search_history where created_at::date between p_start_date and p_end_date), 0),
    'searchesPerDay', round(
      coalesce((select count(*)::numeric from public.search_history where created_at::date between p_start_date and p_end_date), 0)
      / greatest((p_end_date - p_start_date + 1), 1), 2
    ),
    'popularKeywords', coalesce((
      select jsonb_agg(jsonb_build_object(
        'query', normalized_query,
        'count', search_count,
        'lastSearchedAt', last_searched_at
      ) order by search_count desc)
      from public.popular_search_terms
      where last_searched_at::date between p_start_date and p_end_date
      limit 25
    ), '[]'::jsonb),
    'searchCtr', coalesce((
      select case when count(*) > 0
        then round((count(*) filter (where result_count > 0))::numeric / count(*) * 100, 2)
        else 0 end
      from public.search_history
      where created_at::date between p_start_date and p_end_date
    ), 0),
    'searchConversions', coalesce((
      select count(distinct sh.user_id)::int
      from public.search_history sh
      join public.orders o on o.buyer_id = sh.user_id
        and coalesce(o.placed_at, o.created_at)::date between p_start_date and p_end_date
        and o.status not in ('cancelled', 'refunded')
      where sh.created_at::date between p_start_date and p_end_date
    ), 0),
    'zeroResultSearches', coalesce((
      select count(*)::int
      from public.search_history
      where created_at::date between p_start_date and p_end_date
        and result_count = 0
    ), 0),
    'trendingSearches', coalesce((
      select jsonb_agg(jsonb_build_object(
        'query', normalized_query,
        'count', search_count
      ) order by search_count desc)
      from public.popular_search_terms
      where last_searched_at::date between p_start_date and p_end_date
      order by search_count desc
      limit 10
    ), '[]'::jsonb),
    'searchGrowth', jsonb_build_object(
      'current', coalesce((select count(*)::int from public.search_history where created_at::date between p_start_date and p_end_date), 0),
      'previous', coalesce((select count(*)::int from public.search_history where created_at::date between p_previous_start_date and p_previous_end_date), 0),
      'growthRate', public.marketplace_growth_rate(
        coalesce((select count(*)::int from public.search_history where created_at::date between p_start_date and p_end_date), 0),
        coalesce((select count(*)::int from public.search_history where created_at::date between p_previous_start_date and p_previous_end_date), 0)
      )
    )
  );
$$;

create or replace function public.get_marketplace_search_performance(
  p_start_date date,
  p_end_date date
)
returns jsonb
language sql
stable
as $$
  with search_stats as (
    select
      count(*) total_searches,
      count(distinct user_id) unique_searchers,
      count(*) filter (where result_count > 0) searches_with_results,
      count(*) filter (where result_count = 0) zero_result_searches,
      avg(result_count)::numeric(10,2) avg_results
    from public.search_history
    where created_at::date between p_start_date and p_end_date
  )
  select jsonb_build_object(
    'totalSearches', total_searches,
    'uniqueSearchers', unique_searchers,
    'searchesWithResults', searches_with_results,
    'zeroResultSearches', zero_result_searches,
    'averageResultsPerSearch', avg_results,
    'searchSuccessRate', case when total_searches > 0
      then round(searches_with_results::numeric / total_searches * 100, 2) else 0 end,
    'zeroResultRate', case when total_searches > 0
      then round(zero_result_searches::numeric / total_searches * 100, 2) else 0 end
  ) from search_stats;
$$;

-- ============================================================
-- REVIEW ANALYTICS FUNCTIONS
-- ============================================================

create or replace function public.get_marketplace_review_analytics(
  p_start_date date,
  p_end_date date,
  p_previous_start_date date,
  p_previous_end_date date
)
returns jsonb
language sql
stable
as $$
  with review_stats as (
    select
      count(*) total_reviews,
      count(*) filter (where is_verified_purchase) verified_reviews,
      round(avg(rating)::numeric, 2) average_rating,
      count(*) filter (where rating = 1) rating_1,
      count(*) filter (where rating = 2) rating_2,
      count(*) filter (where rating = 3) rating_3,
      count(*) filter (where rating = 4) rating_4,
      count(*) filter (where rating = 5) rating_5
    from public.product_reviews
    where created_at::date between p_start_date and p_end_date
      and deleted_at is null
      and status = 'published'
  ),
  seller_review_stats as (
    select
      count(*) total_seller_reviews,
      round(avg(overall_rating)::numeric, 2) avg_seller_rating
    from public.seller_reviews
    where created_at::date between p_start_date and p_end_date
      and deleted_at is null
      and status = 'published'
  ),
  top_rated as (
    select p.id, p.name, rs.average_rating, rs.total_reviews
    from public.rating_summaries rs
    join public.products p on p.id = rs.entity_id
    where rs.entity_type = 'product'
      and rs.total_reviews > 0
    order by rs.average_rating desc
    limit 10
  ),
  lowest_rated as (
    select p.id, p.name, rs.average_rating, rs.total_reviews
    from public.rating_summaries rs
    join public.products p on p.id = rs.entity_id
    where rs.entity_type = 'product'
      and rs.total_reviews > 0
    order by rs.average_rating asc
    limit 10
  ),
  top_sellers as (
    select s.id, s.store_name, rs.average_rating, rs.total_reviews
    from public.rating_summaries rs
    join public.sellers s on s.id = rs.entity_id
    where rs.entity_type = 'seller'
      and rs.total_reviews > 0
    order by rs.average_rating desc
    limit 10
  ),
  totals as (
    select count(*) all_current from public.product_reviews
    where created_at::date between p_start_date and p_end_date
      and deleted_at is null
  ),
  prev_totals as (
    select count(*) all_previous from public.product_reviews
    where created_at::date between p_previous_start_date and p_previous_end_date
      and deleted_at is null
  )
  select jsonb_build_object(
    'reviewsSubmitted', coalesce((select total_reviews from review_stats), 0),
    'averageMarketplaceRating', coalesce((select average_rating from review_stats), 0),
    'ratingDistribution', jsonb_build_object(
      '1', coalesce((select rating_1 from review_stats), 0),
      '2', coalesce((select rating_2 from review_stats), 0),
      '3', coalesce((select rating_3 from review_stats), 0),
      '4', coalesce((select rating_4 from review_stats), 0),
      '5', coalesce((select rating_5 from review_stats), 0)
    ),
    'reviewGrowth', jsonb_build_object(
      'current', coalesce((select all_current from totals), 0),
      'previous', coalesce((select all_previous from prev_totals), 0),
      'growthRate', public.marketplace_growth_rate(
        coalesce((select all_current from totals), 0),
        coalesce((select all_previous from prev_totals), 0)
      )
    ),
    'topRatedProducts', coalesce((
      select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'averageRating', average_rating, 'totalReviews', total_reviews))
      from top_rated
    ), '[]'::jsonb),
    'lowestRatedProducts', coalesce((
      select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'averageRating', average_rating, 'totalReviews', total_reviews))
      from lowest_rated
    ), '[]'::jsonb),
    'topRatedSellers', coalesce((
      select jsonb_agg(jsonb_build_object('id', id, 'name', store_name, 'averageRating', average_rating, 'totalReviews', total_reviews))
      from top_sellers
    ), '[]'::jsonb),
    'verifiedReviewPercentage', case when coalesce((select total_reviews from review_stats), 0) > 0
      then round(coalesce((select verified_reviews::numeric / total_reviews * 100 from review_stats), 0), 2)
      else 0 end,
    'averageSellerRating', coalesce((select avg_seller_rating from seller_review_stats), 0)
  );
$$;

-- ============================================================
-- MESSAGING ANALYTICS FUNCTIONS
-- ============================================================

create or replace function public.get_marketplace_messaging_analytics(
  p_start_date date,
  p_end_date date,
  p_previous_start_date date,
  p_previous_end_date date
)
returns jsonb
language sql
stable
as $$
  with conv_stats as (
    select
      count(*) filter (where created_at::date between p_start_date and p_end_date) conversations_started,
      count(*) filter (where status = 'active') active_conversations
    from public.conversations
    where created_at::date <= p_end_date::date
  ),
  msg_stats as (
    select
      count(*) total_messages,
      avg(case
        when sender_id = c.buyer_id then
          extract(epoch from m.created_at - coalesce(m2.created_at, m.created_at))
        else null
      end)::numeric(10,2) avg_buyer_response_seconds,
      avg(case
        when sender_id = c.seller_id then
          extract(epoch from m.created_at - coalesce(m2.created_at, m.created_at))
        else null
      end)::numeric(10,2) avg_seller_response_seconds
    from public.messages m
    join public.conversations c on c.id = m.conversation_id
    left join public.messages m2 on m2.conversation_id = m.conversation_id
      and m2.created_at < m.created_at
      and m2.deleted_at is null
    where m.created_at::date between p_start_date and p_end_date
      and m.deleted_at is null
  ),
  completed_conv as (
    select count(*) filter (
      where exists (
        select 1 from public.messages m2
        where m2.conversation_id = c.id
          and m2.created_at::date between p_start_date and p_end_date
          and m2.deleted_at is null
      )
    ) conversations_with_messages
    from public.conversations c
    where exists (
      select 1 from public.orders o
      where o.id = c.order_id
        and o.status = 'delivered'
    )
  )
  select jsonb_build_object(
    'conversationsStarted', coalesce((select conversations_started from conv_stats), 0),
    'activeConversations', coalesce((select active_conversations from conv_stats), 0),
    'messagesSent', coalesce((select total_messages from msg_stats), 0),
    'sellerResponseTime', coalesce((select round(avg_seller_response_seconds / 3600, 2) from msg_stats), 0),
    'buyerResponseTime', coalesce((select round(avg_buyer_response_seconds / 3600, 2) from msg_stats), 0),
    'conversationGrowth', jsonb_build_object(
      'current', coalesce((select conversations_started from conv_stats), 0),
      'previous', coalesce(
        (select count(*) from public.conversations
         where created_at::date between p_previous_start_date and p_previous_end_date), 0
      ),
      'growthRate', public.marketplace_growth_rate(
        coalesce((select conversations_started from conv_stats), 0),
        coalesce(
          (select count(*) from public.conversations
           where created_at::date between p_previous_start_date and p_previous_end_date), 0
        )
      )
    ),
    'messageGrowth', jsonb_build_object(
      'current', coalesce((select count(*) from public.messages where created_at::date between p_start_date and p_end_date and deleted_at is null), 0),
      'previous', coalesce((select count(*) from public.messages where created_at::date between p_previous_start_date and p_previous_end_date and deleted_at is null), 0),
      'growthRate', public.marketplace_growth_rate(
        (select count(*) from public.messages where created_at::date between p_start_date and p_end_date and deleted_at is null),
        (select count(*) from public.messages where created_at::date between p_previous_start_date and p_previous_end_date and deleted_at is null)
      )
    )
  );
$$;

-- ============================================================
-- NOTIFICATION ANALYTICS FUNCTIONS
-- ============================================================

create or replace function public.get_marketplace_notification_analytics(
  p_start_date date,
  p_end_date date,
  p_previous_start_date date,
  p_previous_end_date date
)
returns jsonb
language sql
stable
as $$
  with notif_stats as (
    select
      count(*) total_sent,
      count(*) filter (where read_at is not null) total_read,
      count(*) filter (where read_at is not null
        and read_at - created_at < interval '1 hour') opened,
      count(*) filter (where category = 'orders') orders_notifications,
      count(*) filter (where category = 'messaging') messaging_notifications,
      count(*) filter (where category = 'seller') seller_notifications,
      count(*) filter (where category = 'account') account_notifications,
      count(*) filter (where category = 'reviews') reviews_notifications,
      count(*) filter (where category = 'announcements') announcements_notifications,
      count(*) filter (where category = 'security') security_notifications
    from public.notifications
    where created_at::date between p_start_date and p_end_date
  ),
  email_stats as (
    select
      count(*) total_emails,
      count(*) filter (where status = 'sent') sent_emails,
      count(*) filter (where status = 'failed') failed_emails
    from public.email_outbox
    where created_at::date between p_start_date and p_end_date
  )
  select jsonb_build_object(
    'notificationsSent', coalesce((select total_sent from notif_stats), 0),
    'readRate', case when coalesce((select total_sent from notif_stats), 0) > 0
      then round(
        coalesce((select total_read::numeric / total_sent * 100 from notif_stats), 0), 2
      )
      else 0 end,
    'openRate', case when coalesce((select total_sent from notif_stats), 0) > 0
      then round(
        coalesce((select opened::numeric / total_sent * 100 from notif_stats), 0), 2
      )
      else 0 end,
    'deliverySuccess', case when coalesce((select total_emails from email_stats), 0) > 0
      then round(
        coalesce((select sent_emails::numeric / total_emails * 100 from email_stats), 0), 2
      )
      else 0 end,
    'notificationTypeDistribution', jsonb_build_object(
      'orders', coalesce((select orders_notifications from notif_stats), 0),
      'messaging', coalesce((select messaging_notifications from notif_stats), 0),
      'seller', coalesce((select seller_notifications from notif_stats), 0),
      'account', coalesce((select account_notifications from notif_stats), 0),
      'reviews', coalesce((select reviews_notifications from notif_stats), 0),
      'announcements', coalesce((select announcements_notifications from notif_stats), 0),
      'security', coalesce((select security_notifications from notif_stats), 0)
    ),
    'notificationGrowth', jsonb_build_object(
      'current', coalesce((select total_sent from notif_stats), 0),
      'previous', coalesce(
        (select count(*) from public.notifications
         where created_at::date between p_previous_start_date and p_previous_end_date), 0
      ),
      'growthRate', public.marketplace_growth_rate(
        coalesce((select total_sent from notif_stats), 0),
        coalesce(
          (select count(*) from public.notifications
           where created_at::date between p_previous_start_date and p_previous_end_date), 0
        )
      )
    ),
    'emailDelivery', jsonb_build_object(
      'total', coalesce((select total_emails from email_stats), 0),
      'sent', coalesce((select sent_emails from email_stats), 0),
      'failed', coalesce((select failed_emails from email_stats), 0)
    )
  );
$$;

-- ============================================================
-- BUSINESS INTELLIGENCE FUNCTIONS
-- ============================================================

create or replace function public.get_marketplace_business_intelligence(
  p_start_date date,
  p_end_date date,
  p_previous_start_date date,
  p_previous_end_date date
)
returns jsonb
language sql
stable
as $$
  with category_revenue as (
    select
      c.id,
      c.name,
      count(distinct o.id) order_count,
      coalesce(sum(oi.total_minor), 0) revenue_minor,
      count(distinct o.buyer_id) buyer_count
    from public.categories c
    left join public.products p on p.category_id = c.id
    left join public.order_items oi on oi.product_id = p.id
    left join public.orders o on o.id = oi.order_id
      and coalesce(o.placed_at, o.created_at)::date between p_start_date and p_end_date
      and o.status not in ('cancelled', 'refunded')
    group by c.id, c.name
  ),
  category_prev_revenue as (
    select
      c.id,
      coalesce(sum(oi.total_minor), 0) prev_revenue
    from public.categories c
    left join public.products p on p.category_id = c.id
    left join public.order_items oi on oi.product_id = p.id
    left join public.orders o on o.id = oi.order_id
      and coalesce(o.placed_at, o.created_at)::date between p_previous_start_date and p_previous_end_date
      and o.status not in ('cancelled', 'refunded')
    group by c.id
  ),
  brand_revenue as (
    select
      b.id, b.name,
      coalesce(sum(oi.total_minor), 0) revenue_minor
    from public.brands b
    left join public.products p on p.brand_id = b.id
    left join public.order_items oi on oi.product_id = p.id
    left join public.orders o on o.id = oi.order_id
      and coalesce(o.placed_at, o.created_at)::date between p_start_date and p_end_date
      and o.status not in ('cancelled', 'refunded')
    group by b.id, b.name
  ),
  seller_growth as (
    select
      s.id,
      coalesce(s.store_name, s.business_name, 'Unknown') name,
      count(distinct o.id) filter (
        where coalesce(o.placed_at, o.created_at)::date between p_start_date and p_end_date
      ) current_orders,
      count(distinct o.id) filter (
        where coalesce(o.placed_at, o.created_at)::date between p_previous_start_date and p_previous_end_date
      ) previous_orders
    from public.sellers s
    left join public.orders o on o.seller_id = s.id
    group by s.id, s.store_name, s.business_name
  ),
  product_trends as (
    select
      count(*) filter (where created_at::date between p_start_date and p_end_date) new_products,
      count(*) filter (where created_at::date between p_previous_start_date and p_previous_end_date) prev_new_products,
      count(*) filter (where status = 'active') active_products,
      count(*) filter (where status = 'active' and created_at::date between p_start_date and p_end_date) new_active_products
    from public.products
  ),
  customer_growth as (
    select
      count(*) filter (where created_at::date between p_start_date and p_end_date) new_customers,
      count(*) filter (where created_at::date between p_previous_start_date and p_previous_end_date) prev_new_customers
    from public.profiles
  ),
  revenue_trends as (
    select
      coalesce(sum(total_minor), 0) current_revenue,
      coalesce(
        (select sum(total_minor) from public.orders
         where coalesce(placed_at, created_at)::date between p_previous_start_date and p_previous_end_date
           and status not in ('cancelled', 'refunded')),
        0
      ) prev_revenue
    from public.orders
    where coalesce(placed_at, created_at)::date between p_start_date and p_end_date
      and status not in ('cancelled', 'refunded')
  ),
  category_ranked as (
    select
      cr.id, cr.name, cr.revenue_minor,
      coalesce(cpr.prev_revenue, 0) prev_revenue,
      cr.order_count, cr.buyer_count,
      public.marketplace_growth_rate(cr.revenue_minor, coalesce(cpr.prev_revenue, 0)) growth
    from category_revenue cr
    left join category_prev_revenue cpr on cpr.id = cr.id
  ),
  seller_ranked as (
    select id, name, current_orders, previous_orders,
      public.marketplace_growth_rate(current_orders, previous_orders) growth
    from seller_growth
  )
  select jsonb_build_object(
    'fastestGrowingCategories', coalesce((
      select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'revenueMinor', revenue_minor, 'growthRate', growth, 'orderCount', order_count)
        order by growth desc)
      from category_ranked
      where growth > 0
      limit 10
    ), '[]'::jsonb),
    'highestRevenueCategories', coalesce((
      select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'revenueMinor', revenue_minor, 'growthRate', growth, 'orderCount', order_count)
        order by revenue_minor desc)
      from category_ranked
      where revenue_minor > 0
      limit 10
    ), '[]'::jsonb),
    'highestConversionCategories', coalesce((
      select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'conversionRate',
        case when buyer_count > 0 then round(order_count::numeric / buyer_count * 100, 2) else 0 end,
        'orderCount', order_count, 'buyerCount', buyer_count)
        order by case when buyer_count > 0 then order_count::numeric / buyer_count else 0 end desc)
      from category_revenue
      where buyer_count > 0
      limit 10
    ), '[]'::jsonb),
    'lowestPerformingCategories', coalesce((
      select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'revenueMinor', revenue_minor, 'growthRate', growth, 'orderCount', order_count)
        order by revenue_minor asc)
      from category_ranked
      where revenue_minor > 0
      limit 10
    ), '[]'::jsonb),
    'bestPerformingBrands', coalesce((
      select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'revenueMinor', revenue_minor)
        order by revenue_minor desc)
      from brand_revenue
      where revenue_minor > 0
      limit 10
    ), '[]'::jsonb),
    'lowestPerformingBrands', coalesce((
      select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'revenueMinor', revenue_minor)
        order by revenue_minor asc)
      from brand_revenue
      where revenue_minor > 0
      limit 10
    ), '[]'::jsonb),
    'fastestGrowingSellers', coalesce((
      select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'currentOrders', current_orders, 'previousOrders', previous_orders, 'growthRate', growth)
        order by growth desc)
      from seller_ranked
      where growth > 0
      limit 10
    ), '[]'::jsonb),
    'productGrowthTrends', jsonb_build_object(
      'newProducts', (select new_products from product_trends),
      'previousNewProducts', (select prev_new_products from product_trends),
      'activeProducts', (select active_products from product_trends),
      'newActiveProducts', (select new_active_products from product_trends),
      'growthRate', public.marketplace_growth_rate(
        (select new_products from product_trends),
        (select prev_new_products from product_trends)
      )
    ),
    'customerGrowthTrends', jsonb_build_object(
      'newCustomers', (select new_customers from customer_growth),
      'previousNewCustomers', (select prev_new_customers from customer_growth),
      'growthRate', public.marketplace_growth_rate(
        (select new_customers from customer_growth),
        (select prev_new_customers from customer_growth)
      )
    ),
    'revenueTrends', jsonb_build_object(
      'currentRevenue', (select current_revenue from revenue_trends),
      'previousRevenue', (select prev_revenue from revenue_trends),
      'growthRate', public.marketplace_growth_rate(
        (select current_revenue from revenue_trends),
        (select prev_revenue from revenue_trends)
      )
    )
  );
$$;

-- ============================================================
-- MARKETPLACE HEALTH SCORE FUNCTION
-- ============================================================

create or replace function public.get_marketplace_health_score(
  p_start_date date,
  p_end_date date
)
returns jsonb
language sql
stable
as $$
  with health_data as (
    select
      coalesce((select count(*) from public.orders
        where coalesce(placed_at, created_at)::date between p_start_date and p_end_date), 0) total_orders,
      coalesce((select count(distinct seller_id) from public.orders
        where coalesce(placed_at, created_at)::date between p_start_date and p_end_date), 0) active_sellers,
      coalesce((select count(*) from public.sellers where status = 'active'), 0) total_active_sellers,
      coalesce((select count(*) from public.sellers
        where kyc_status = 'approved' and created_at::date between p_start_date and p_end_date), 0) new_verified_sellers,
      coalesce((select count(*) from public.products
        where status = 'active'), 0) active_products,
      coalesce((select count(*) from public.products
        where status in ('active', 'rejected')), 0) total_reviewed_products,
      coalesce((select sum(total_minor) from public.orders
        where coalesce(placed_at, created_at)::date between p_start_date and p_end_date
          and status not in ('cancelled', 'refunded')), 0) revenue_minor,
      coalesce((select sum(total_minor) from public.orders
        where coalesce(placed_at, created_at)::date between
          (p_start_date::date - (p_end_date - p_start_date + 1)::int)::date and (p_start_date::date - 1)::date
          and status not in ('cancelled', 'refunded')), 0) prev_revenue_minor,
      coalesce((select count(distinct buyer_id) from public.orders
        where coalesce(placed_at, created_at)::date between p_start_date and p_end_date), 0) active_buyers,
      coalesce((select count(distinct buyer_id) from public.orders
        where coalesce(placed_at, created_at)::date between p_start_date and p_end_date
          and not exists (
            select 1 from public.orders o2
            where o2.buyer_id = orders.buyer_id
              and coalesce(o2.placed_at, o2.created_at)::date < p_start_date
          )), 0) new_buyers,
      coalesce((select round(avg(rating)::numeric, 2) from public.product_reviews
        where created_at::date between p_start_date and p_end_date
          and deleted_at is null and status = 'published'), 0) avg_rating,
      coalesce((select count(*) from public.search_history
        where created_at::date between p_start_date and p_end_date), 0) total_searches,
      coalesce((select count(*) from public.search_history
        where created_at::date between p_start_date and p_end_date and result_count = 0), 0) zero_result_searches,
      coalesce((select count(*) from public.inventory_items where quantity_available > 0), 0) stocked_items,
      coalesce((select count(*) from public.inventory_items), 0) total_inventory_items
  )
  select jsonb_build_object(
    'score', round((
      -- Seller activity (20 points)
      case when total_active_sellers > 0
        then (active_sellers::numeric / total_active_sellers) * 20 else 0 end
      +
      -- Product approval rate (15 points)
      case when total_reviewed_products > 0
        then (active_products::numeric / total_reviewed_products) * 15 else 0 end
      +
      -- Revenue growth (20 points)
      case when prev_revenue_minor > 0
        then least(20, greatest(0, ((revenue_minor - prev_revenue_minor)::numeric / prev_revenue_minor) * 20 + 20))
        else 10 end
      +
      -- Customer growth (15 points)
      case when total_active_sellers > 0
        then least(15, greatest(0, (new_buyers::numeric / greatest(active_buyers, 1)) * 15))
        else 0 end
      +
      -- Average ratings (15 points)
      (avg_rating / 5.0) * 15
      +
      -- Search performance (10 points)
      case when total_searches > 0
        then (1 - zero_result_searches::numeric / greatest(total_searches, 1)) * 10 else 5 end
      +
      -- Inventory health (5 points)
      case when total_inventory_items > 0
        then (stocked_items::numeric / total_inventory_items) * 5 else 0 end
    )::numeric, 2),
    'components', jsonb_build_object(
      'sellerActivity', jsonb_build_object('score', round(
        case when total_active_sellers > 0
          then (active_sellers::numeric / total_active_sellers) * 20 else 0 end, 2
      ), 'maxScore', 20, 'label', 'Seller Activity'),
      'productApprovalRate', jsonb_build_object('score', round(
        case when total_reviewed_products > 0
          then (active_products::numeric / total_reviewed_products) * 15 else 0 end, 2
      ), 'maxScore', 15, 'label', 'Product Approval Rate'),
      'revenueGrowth', jsonb_build_object('score', round(
        case when prev_revenue_minor > 0
          then least(20, greatest(0, ((revenue_minor - prev_revenue_minor)::numeric / prev_revenue_minor) * 20 + 20))
          else 10 end, 2
      ), 'maxScore', 20, 'label', 'Revenue Growth'),
      'customerGrowth', jsonb_build_object('score', round(
        case when total_active_sellers > 0
          then least(15, greatest(0, (new_buyers::numeric / greatest(active_buyers, 1)) * 15))
          else 0 end, 2
      ), 'maxScore', 15, 'label', 'Customer Growth'),
      'averageRatings', jsonb_build_object('score', round(
        (avg_rating / 5.0) * 15, 2
      ), 'maxScore', 15, 'label', 'Average Ratings'),
      'searchPerformance', jsonb_build_object('score', round(
        case when total_searches > 0
          then (1 - zero_result_searches::numeric / greatest(total_searches, 1)) * 10 else 5 end, 2
      ), 'maxScore', 10, 'label', 'Search Performance'),
      'inventoryHealth', jsonb_build_object('score', round(
        case when total_inventory_items > 0
          then (stocked_items::numeric / total_inventory_items) * 5 else 0 end, 2
      ), 'maxScore', 5, 'label', 'Inventory Health')
    ),
    'maxScore', 100,
    'status', case
      when (
        case when total_active_sellers > 0 then (active_sellers::numeric / total_active_sellers) * 20 else 0 end
        + case when total_reviewed_products > 0 then (active_products::numeric / total_reviewed_products) * 15 else 0 end
        + case when prev_revenue_minor > 0 then least(20, greatest(0, ((revenue_minor - prev_revenue_minor)::numeric / prev_revenue_minor) * 20 + 20)) else 10 end
        + case when total_active_sellers > 0 then least(15, greatest(0, (new_buyers::numeric / greatest(active_buyers, 1)) * 15)) else 0 end
        + (avg_rating / 5.0) * 15
        + case when total_searches > 0 then (1 - zero_result_searches::numeric / greatest(total_searches, 1)) * 10 else 5 end
        + case when total_inventory_items > 0 then (stocked_items::numeric / total_inventory_items) * 5 else 0 end
      ) >= 80 then 'healthy'
      when (
        case when total_active_sellers > 0 then (active_sellers::numeric / total_active_sellers) * 20 else 0 end
        + case when total_reviewed_products > 0 then (active_products::numeric / total_reviewed_products) * 15 else 0 end
        + case when prev_revenue_minor > 0 then least(20, greatest(0, ((revenue_minor - prev_revenue_minor)::numeric / prev_revenue_minor) * 20 + 20)) else 10 end
        + case when total_active_sellers > 0 then least(15, greatest(0, (new_buyers::numeric / greatest(active_buyers, 1)) * 15)) else 0 end
        + (avg_rating / 5.0) * 15
        + case when total_searches > 0 then (1 - zero_result_searches::numeric / greatest(total_searches, 1)) * 10 else 5 end
        + case when total_inventory_items > 0 then (stocked_items::numeric / total_inventory_items) * 5 else 0 end
      ) >= 50 then 'moderate'
      else 'critical'
    end,
    'periodStart', p_start_date::text,
    'periodEnd', p_end_date::text
  ) from health_data;
$$;

-- ============================================================
-- REFRESH BI DAILY METRICS
-- ============================================================

create or replace function public.refresh_marketplace_bi_daily_metrics(p_metric_date date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start timestamptz := p_metric_date::timestamptz;
  v_end timestamptz := (p_metric_date + 1)::timestamptz;
begin
  insert into public.marketplace_bi_daily_metrics (
    metric_date,
    total_revenue_minor,
    total_orders,
    total_new_products,
    total_new_sellers,
    total_new_buyers,
    average_rating,
    updated_at
  )
  select
    p_metric_date,
    coalesce((select sum(total_minor) from public.orders
      where coalesce(placed_at, created_at) >= v_start and coalesce(placed_at, created_at) < v_end
        and status not in ('cancelled', 'refunded')), 0),
    coalesce((select count(*) from public.orders
      where coalesce(placed_at, created_at) >= v_start and coalesce(placed_at, created_at) < v_end), 0),
    coalesce((select count(*) from public.products where created_at >= v_start and created_at < v_end), 0),
    coalesce((select count(*) from public.sellers where created_at >= v_start and created_at < v_end), 0),
    coalesce((select count(*) from public.profiles where created_at >= v_start and created_at < v_end), 0),
    coalesce((select round(avg(rating)::numeric, 2) from public.product_reviews
      where created_at >= v_start and created_at < v_end
        and deleted_at is null and status = 'published'), 0),
    now()
  on conflict (metric_date) do update set
    total_revenue_minor = excluded.total_revenue_minor,
    total_orders = excluded.total_orders,
    total_new_products = excluded.total_new_products,
    total_new_sellers = excluded.total_new_sellers,
    total_new_buyers = excluded.total_new_buyers,
    average_rating = excluded.average_rating,
    updated_at = now();
end;
$$;

-- ============================================================
-- ANALYTICS EXPORT FUNCTIONS
-- ============================================================

create or replace function public.get_marketplace_export_data(
  p_report_type text,
  p_start_date date,
  p_end_date date
)
returns jsonb
language sql
stable
as $$
  select case
    when p_report_type = 'revenue' then (
      select jsonb_agg(jsonb_build_object(
        'date', coalesce(placed_at, created_at)::date,
        'orderId', id,
        'totalMinor', total_minor,
        'status', status,
        'currency', currency
      ) order by coalesce(placed_at, created_at) desc)
      from public.orders
      where coalesce(placed_at, created_at)::date between p_start_date and p_end_date
      limit 1000
    )
    when p_report_type = 'orders' then (
      select jsonb_agg(jsonb_build_object(
        'date', coalesce(placed_at, created_at)::date,
        'orderId', id,
        'buyerId', buyer_id,
        'sellerId', seller_id,
        'totalMinor', total_minor,
        'status', status
      ) order by coalesce(placed_at, created_at) desc)
      from public.orders
      where coalesce(placed_at, created_at)::date between p_start_date and p_end_date
      limit 1000
    )
    when p_report_type = 'sellers' then (
      select jsonb_agg(jsonb_build_object(
        'id', s.id,
        'storeName', s.store_name,
        'status', s.status,
        'kycStatus', s.kyc_status,
        'createdAt', s.created_at,
        'orderCount', coalesce(o.cnt, 0),
        'revenueMinor', coalesce(o.rev, 0)
      ) order by coalesce(o.rev, 0) desc)
      from public.sellers s
      left join (
        select seller_id, count(*) cnt, sum(total_minor) rev
        from public.orders
        where coalesce(placed_at, created_at)::date between p_start_date and p_end_date
          and status not in ('cancelled', 'refunded')
        group by seller_id
      ) o on o.seller_id = s.id
      limit 1000
    )
    when p_report_type = 'products' then (
      select jsonb_agg(jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'status', p.status,
        'priceMinor', p.base_price_minor,
        'sellerId', p.seller_id,
        'createdAt', p.created_at,
        'soldCount', coalesce((
          select count(*) from public.order_items oi
          join public.orders o on o.id = oi.order_id
          where oi.product_id = p.id
            and coalesce(o.placed_at, o.created_at)::date between p_start_date and p_end_date
        ), 0)
      ) order by p.created_at desc)
      from public.products p
      limit 1000
    )
    when p_report_type = 'reviews' then (
      select jsonb_agg(jsonb_build_object(
        'id', r.id,
        'productId', r.product_id,
        'rating', r.rating,
        'status', r.status,
        'isVerifiedPurchase', r.is_verified_purchase,
        'createdAt', r.created_at
      ) order by r.created_at desc)
      from public.product_reviews r
      where r.created_at::date between p_start_date and p_end_date
        and r.deleted_at is null
      limit 1000
    )
    when p_report_type = 'search' then (
      select jsonb_agg(jsonb_build_object(
        'id', sh.id,
        'userId', sh.user_id,
        'query', sh.query,
        'resultCount', sh.result_count,
        'createdAt', sh.created_at
      ) order by sh.created_at desc)
      from public.search_history sh
      where sh.created_at::date between p_start_date and p_end_date
      limit 1000
    )
    when p_report_type = 'notifications' then (
      select jsonb_agg(jsonb_build_object(
        'id', n.id,
        'userId', n.user_id,
        'category', n.category,
        'type', n.type,
        'read', n.read_at is not null,
        'createdAt', n.created_at
      ) order by n.created_at desc)
      from public.notifications n
      where n.created_at::date between p_start_date and p_end_date
      limit 1000
    )
    else '[]'::jsonb
  end;
$$;

-- ============================================================
-- RLS POLICIES
-- ============================================================

alter table public.marketplace_bi_daily_metrics enable row level security;
drop policy if exists marketplace_bi_daily_metrics_admin_read on public.marketplace_bi_daily_metrics;
create policy marketplace_bi_daily_metrics_admin_read
  on public.marketplace_bi_daily_metrics
  for select
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role in ('admin', 'super_admin')
    )
  );

drop policy if exists marketplace_bi_daily_metrics_admin_all on public.marketplace_bi_daily_metrics;
create policy marketplace_bi_daily_metrics_admin_all
  on public.marketplace_bi_daily_metrics
  for all
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role in ('admin', 'super_admin')
    )
  );

-- Add super_admin to existing marketplace_daily_metrics policy
drop policy if exists marketplace_daily_metrics_admin_read on public.marketplace_daily_metrics;
create policy marketplace_daily_metrics_admin_read
  on public.marketplace_daily_metrics
  for select
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role in ('admin', 'super_admin')
    )
  );
