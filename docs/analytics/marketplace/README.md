# Marketplace Analytics

Agent 11B owns administrator-facing marketplace analytics. This module provides executive
dashboards, KPI tracking, business intelligence, search/review/messaging/notification analytics,
marketplace health scoring, and report export capabilities for super admin and admin users.

## Architecture

The module follows the repository-injection pattern:

- `lib/analytics/marketplace/types.ts` — All TypeScript types, Zod schemas, repository interfaces,
  permission check, audit hooks, and shared date utilities.
- `lib/analytics/marketplace/service.ts` — Validation, RBAC enforcement, fan-out aggregation,
  and audit logging.
- `lib/analytics/marketplace/supabase-repository.ts` — Maps service calls to Supabase RPC functions.
- `lib/analytics/marketplace/health-service.ts` — Configurable health score calculation (no DB dependency).
- `lib/analytics/marketplace/export-service.ts` — CSV, Excel, PDF export generation.
- `lib/analytics/marketplace/bi-repository.ts` — BI data repository for Supabase.
- `lib/business-intelligence/` — Business Intelligence engine and service.
- `components/dashboard/admin` — Reusable responsive admin dashboard components.
- `app/admin/analytics/` — API route handlers for all analytics endpoints.

## Part 1 Features

- Executive Dashboard
- Marketplace KPIs (revenue, orders, users, sellers, products, categories, brands)
- Core Analytics APIs
- `marketplace_daily_metrics` cached metrics table
- Database migration `202607020009_marketplace_analytics.sql`

## Part 2 Features

### Business Intelligence Engine

Located in `lib/business-intelligence/`.

Provides deterministic insights from marketplace data:
- **Fastest Growing Categories** — Categories with highest revenue growth rate
- **Highest Revenue Categories** — Categories ranked by total revenue
- **Highest Conversion Categories** — Categories with best order-to-buyer conversion
- **Lowest Performing Categories** — Categories with lowest revenue
- **Best Performing Brands** — Brands ranked by total revenue
- **Lowest Performing Brands** — Brands with lowest revenue
- **Fastest Growing Sellers** — Sellers with highest order growth
- **Product Growth Trends** — New products, active products, growth rates
- **Customer Growth Trends** — New customer acquisition rates
- **Revenue Trends** — Period-over-period revenue comparison

All calculations are deterministic SQL — no AI or machine learning.

### Search Analytics

Integrates with Agent 10 (Search & Discovery) data:
- Total searches and searches per day
- Popular keywords from `popular_search_terms`
- Search CTR (click-through rate based on result_count > 0)
- Search conversions (users who searched and ordered)
- Zero-result searches (queries with no results)
- Trending searches
- Search performance metrics (unique searchers, success rate)
- Period-over-period growth

Database tables used: `search_history`, `popular_search_terms`

### Review Analytics

Integrates with Agent 9 (Reviews & Ratings) data:
- Reviews submitted (published, non-deleted)
- Average marketplace rating
- Rating distribution (1-5 star breakdown)
- Review growth trends
- Top rated products (from `rating_summaries`)
- Lowest rated products
- Top rated sellers (from seller `rating_summaries`)
- Verified review percentage
- Average seller rating

Database tables used: `product_reviews`, `seller_reviews`, `rating_summaries`

### Messaging Analytics

Integrates with Agent 6 (Messaging) data:
- Conversations started
- Active conversations
- Messages sent (non-deleted)
- Seller response time (average hours)
- Buyer response time (average hours)
- Conversation and message growth trends

Database tables used: `conversations`, `messages`

### Notification Analytics

Integrates with Agent 8 (Notifications) data:
- Notifications sent
- Read rate (percentage read)
- Open rate (percentage read within 1 hour)
- Delivery success rate (from `email_outbox`)
- Notification type distribution (orders, messaging, seller, account, reviews, announcements, security)
- Growth trends

Database tables used: `notifications`, `email_outbox`

### Marketplace Health Score

Configurable health score engine (`lib/analytics/marketplace/health-service.ts`):

| Component | Default Weight | Data Source |
|-----------|---------------|-------------|
| Seller Activity | 20 pts | Active sellers / total sellers |
| Product Approval Rate | 15 pts | Active products / reviewed products |
| Revenue Growth | 20 pts | Current vs previous period revenue |
| Customer Growth | 15 pts | New buyers / active buyers |
| Average Ratings | 15 pts | Average product rating / 5 |
| Search Performance | 10 pts | 1 - (zero-result searches / total searches) |
| Inventory Health | 5 pts | Stocked items / total inventory items |

Score thresholds: ≥80 = "healthy", 50-79 = "moderate", <50 = "critical"

Weights are configurable via `HealthScoreConfig`.

### Export Engine

Supports three formats:
- **CSV** — Native Node.js implementation, no dependencies
- **Excel (.xlsx)** — Requires `exceljs` package
- **PDF** — Requires `jspdf` package

Report types: marketplace-summary, revenue, orders, sellers, products, categories, brands,
reviews, search, notifications.

All exports support custom date ranges via `startDate` and `endDate` parameters.

## API Reference

### Core Endpoints (Part 1)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/analytics/dashboard` | Full executive dashboard |
| GET | `/admin/analytics/kpis` | All KPI aggregates |
| GET | `/admin/analytics/revenue` | Revenue analytics |
| GET | `/admin/analytics/orders` | Orders analytics |
| GET | `/admin/analytics/users` | Users analytics |
| GET | `/admin/analytics/sellers` | Sellers analytics |
| GET | `/admin/analytics/products` | Products analytics |
| GET | `/admin/analytics/categories` | Categories analytics |
| GET | `/admin/analytics/brands` | Brands analytics |

### Part 2 Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/analytics/search` | Search analytics |
| GET | `/admin/analytics/reviews` | Review analytics |
| GET | `/admin/analytics/messages` | Messaging analytics |
| GET | `/admin/analytics/notifications` | Notification analytics |
| GET | `/admin/analytics/health` | Marketplace health score |
| GET | `/admin/analytics/business-intelligence` | Business intelligence insights |
| GET | `/admin/analytics/export` | Export reports (CSV/Excel/PDF) |

### Query Parameters

All endpoints accept:
- `dateRange`: today, yesterday, last_7_days, last_30_days, last_90_days, last_year, custom
- `startDate`: YYYY-MM-DD (required when dateRange=custom)
- `endDate`: YYYY-MM-DD (required when dateRange=custom)

Export endpoint also accepts:
- `reportType`: marketplace-summary, revenue, orders, sellers, products, categories, brands, reviews, search, notifications
- `format`: csv (default), xlsx, pdf

### Example Requests

```bash
# Search analytics (last 30 days)
GET /admin/analytics/search?dateRange=last_30_days

# Marketplace health score (custom range)
GET /admin/analytics/health?dateRange=custom&startDate=2026-01-01&endDate=2026-06-30

# Business intelligence
GET /admin/analytics/business-intelligence?dateRange=last_90_days

# Export revenue as CSV
GET /admin/analytics/export?reportType=revenue&format=csv&startDate=2026-01-01&endDate=2026-06-30
```

## Security

RBAC enforced at the application layer:
- Only `admin` and `super_admin` roles can access marketplace analytics
- Permission checker validates against `user_roles` table
- All analytics access can be optionally audited via `MarketplaceAnalyticsAuditWriter`
- Database RLS policies on `marketplace_daily_metrics` and `marketplace_bi_daily_metrics` restrict
  reads to admin/super_admin roles

## Database Migration

File: `supabase/migrations/202607020010_marketplace_analytics_part2.sql`

Adds:
- `marketplace_bi_daily_metrics` — Cached BI metrics table
- `get_marketplace_search_analytics()` — Search analytics RPC
- `get_marketplace_search_performance()` — Search performance RPC
- `get_marketplace_review_analytics()` — Review analytics RPC
- `get_marketplace_messaging_analytics()` — Messaging analytics RPC
- `get_marketplace_notification_analytics()` — Notification analytics RPC
- `get_marketplace_business_intelligence()` — BI insights RPC
- `get_marketplace_health_score()` — Health score RPC
- `get_marketplace_export_data()` — Export data RPC
- `refresh_marketplace_bi_daily_metrics()` — BI cache refresh
- RLS policies for admin/super_admin access

All statements are idempotent (CREATE IF NOT EXISTS, ALTER ADD COLUMN IF NOT EXISTS,
CREATE OR REPLACE FUNCTION, DROP POLICY IF EXISTS).

## Performance

- SQL-level aggregation via RPC functions (no N+1 queries)
- Materialized/cached daily metrics for frequent queries
- Indexed reporting queries (`idx_marketplace_daily_metrics_date`, etc.)
- Efficient multi-table joins with proper filtering
- Cursor pagination support via `marketplaceListRequestSchema`

## Testing

Run all tests:
```bash
pnpm test
```

Test files:
- `lib/analytics/marketplace/service.test.ts` — Part 1 core service tests
- `lib/analytics/marketplace/health-service.test.ts` — Health score calculation tests
- `lib/analytics/marketplace/export-service.test.ts` — Export format tests
- `lib/analytics/marketplace/search-analytics.test.ts` — Search analytics tests
- `lib/analytics/marketplace/review-analytics.test.ts` — Review analytics tests
- `lib/analytics/marketplace/messaging-analytics.test.ts` — Messaging analytics tests
- `lib/analytics/marketplace/notification-analytics.test.ts` — Notification analytics tests
- `lib/analytics/marketplace/permission-checker.test.ts` — Permission tests
- `lib/business-intelligence/service.test.ts` — BI service tests
