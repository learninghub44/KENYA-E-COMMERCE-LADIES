# Marketplace Analytics

Agent 11B Part 1 adds the core administrator marketplace analytics engine.

## Architecture

The module follows the repository-injection pattern used by seller analytics:

- `lib/analytics/marketplace/types.ts` defines dashboard contracts, KPI types, request schemas,
  repository interfaces, permission checks, and audit hooks.
- `lib/analytics/marketplace/service.ts` validates date filters, enforces admin-only access,
  fans out efficient aggregate requests, and audits reads when an audit writer is injected.
- `lib/analytics/marketplace/supabase-repository.ts` maps service calls to Supabase RPC
  functions.
- `components/dashboard/admin` provides reusable responsive admin dashboard components.
- `supabase/migrations/202607020009_marketplace_analytics.sql` adds cached daily metrics,
  indexes, and analytics RPC functions.

## KPI Definitions

- GMV: total non-cancelled, non-refunded order value in minor currency units.
- Marketplace revenue: current commission-based marketplace share of GMV.
- Commission revenue: commission share of GMV.
- Seller revenue: seller share after commission.
- Average order value: GMV divided by valid order count.
- Growth metrics: percentage change versus the immediately preceding period of equal length.
- Active buyers: buyers with orders in the selected date window.
- Returning buyers: buyers active in the selected date window with an earlier order.
- Seller activation rate: active sellers divided by all sellers.
- Product approval rate: active products divided by active plus rejected products.
- Category and brand revenue share: entity revenue divided by total category or brand revenue.

## Aggregation Strategy

The database migration creates `marketplace_daily_metrics` for scheduled KPI caching and adds
indexes on order dates, product status/category/brand, seller status, and inventory stock fields.
The RPC functions query production marketplace tables directly and accept current plus previous
date windows so growth is computed consistently.

`refresh_marketplace_daily_metrics(metric_date)` is intended for a daily Supabase scheduled job.
Dashboard reads can call the aggregate RPCs directly while cache warming is rolled out.

## API Reference

The service supports the requested administrator endpoints:

- `GET /admin/analytics/dashboard`
- `GET /admin/analytics/kpis`
- `GET /admin/analytics/revenue`
- `GET /admin/analytics/orders`
- `GET /admin/analytics/users`
- `GET /admin/analytics/sellers`
- `GET /admin/analytics/products`
- `GET /admin/analytics/categories`
- `GET /admin/analytics/brands`

All endpoints should construct `createMarketplaceAnalyticsService`, inject the Supabase
repository and permission checker, pass the authenticated admin user id, and forward query
parameters for `dateRange`, `startDate`, and `endDate`.

## Security

Application permission checks only allow `admin` and `super_admin` role strings to view
marketplace analytics. Database RLS on `marketplace_daily_metrics` permits reads to admins only.
Sellers are deliberately excluded.

## Dashboard Components

Admin components are responsive, dark-mode compatible, and data-driven:

- `AdminKpiCard`
- `AdminComparisonCard`
- `AdminSummaryTable`
- `MarketplaceAdminDashboard`

`MarketplaceAdminDashboard` requires a real `MarketplaceDashboard` object and does not render
mock statistics.

## Database Schema

`marketplace_daily_metrics` stores one row per metric date with order, revenue, buyer, seller,
and product aggregate columns. It is rerunnable-safe with `CREATE TABLE IF NOT EXISTS`,
`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `CREATE OR REPLACE
FUNCTION`, and `DROP POLICY IF EXISTS`.

## Testing

Run:

```bash
pnpm test
```

Current tests cover:

- Date filtering and previous-period calculation
- Growth calculations
- Permission denial
- Dashboard service aggregation
- Invalid custom date requests
