# Seller Analytics Documentation

This document describes the seller analytics and reporting platform built by Agent 11A.

## Overview

The seller analytics platform provides sellers with comprehensive insights into their business performance, including revenue, sales, products, customers, inventory, ratings, and search analytics. All metrics are calculated from real marketplace data.

## Architecture

### Domain Structure

```
/features/analytics/seller    - Feature boundary notes
/lib/analytics/seller          - Core analytics services
/components/dashboard/seller  - Reusable visualization components
/app/dashboard/seller/analytics - Seller dashboard UI
/docs/analytics/seller         - Documentation
```

### Service Layer

The analytics platform follows the established repository-injection pattern:

- **Service Layer** (`lib/analytics/seller/service.ts`) - Business logic and orchestration
- **Repository Layer** (`lib/analytics/seller/supabase-repository.ts`) - Database operations
- **Permission Layer** (`lib/analytics/seller/permission-checker.ts`) - RBAC enforcement
- **Export Layer** (`lib/analytics/seller/export-service.ts`) - Report generation
- **Integration Layer** (`lib/analytics/seller/rating-repository.ts`, `search-repository.ts`) - Agent 9/10 integration

## Database Schema

### Tables

#### `seller_daily_metrics`
Pre-aggregated daily metrics for each seller to optimize query performance.

**Columns:**
- `seller_id` - UUID reference to sellers
- `metric_date` - Date of the metrics
- `currency` - Currency code (e.g., KES)
- `orders_total` - Total orders for the day
- `orders_completed` - Completed orders
- `orders_pending` - Pending orders
- `orders_cancelled` - Cancelled orders
- `gross_revenue_minor` - Gross revenue in minor units
- `net_revenue_minor` - Net revenue (minus cancellations)
- `refunds_minor` - Total refunds
- `products_active` - Active product count
- `products_draft` - Draft product count
- `products_out_of_stock` - Out of stock count
- `customers_new` - New customers
- `customers_returning` - Returning customers
- `inventory_value_minor` - Total inventory value
- `low_stock_count` - Low stock items
- `out_of_stock_count` - Out of stock items

#### `seller_product_metrics`
Product-level performance metrics for detailed analysis.

**Columns:**
- `seller_id` - UUID reference to sellers
- `product_id` - UUID reference to products
- `metric_date` - Date of the metrics
- `views_count` - Product views
- `orders_count` - Orders for this product
- `units_sold` - Units sold
- `gross_revenue_minor` - Gross revenue
- `net_revenue_minor` - Net revenue
- `stock_level` - Current stock level
- `stock_reserved` - Reserved stock

#### `seller_overview_summary`
Materialized view for fast seller overview queries.

**Columns:**
- `seller_id` - UUID reference to sellers
- `store_name` - Store name
- `slug` - Store slug
- `currency` - Default currency
- `status` - Seller status
- `total_orders` - Total orders all-time
- `active_orders` - Currently active orders
- `completed_orders` - Completed orders
- `pending_orders` - Pending orders
- `cancelled_orders` - Cancelled orders
- `gross_revenue_minor` - Gross revenue
- `cancelled_revenue_minor` - Cancelled revenue
- `net_revenue_minor` - Net revenue
- `total_products` - Total products
- `active_products` - Active products
- `draft_products` - Draft products
- `total_customers` - Total customers
- `seller_created_at` - Seller creation date

### Database Functions

#### `calculate_seller_daily_metrics(seller_id, metric_date)`
Calculates and stores daily metrics for a specific seller and date. Should be called by a scheduled job.

#### `refresh_seller_overview_summary()`
Refreshes the materialized view for seller overview summaries. Should be called after significant data changes.

#### `get_seller_dashboard(seller_id, start_date, end_date)`
Returns comprehensive dashboard data including overview, products, inventory, and daily metrics.

#### `get_seller_revenue_analytics(seller_id, start_date, end_date, group_by)`
Returns revenue data grouped by hour, day, week, month, or year.

#### `get_seller_product_analytics(seller_id, limit)`
Returns product performance metrics sorted by revenue.

#### `get_seller_customer_analytics(seller_id, start_date, end_date, limit)`
Returns customer analytics including purchase behavior.

### Indexes

- `idx_seller_daily_metrics_seller_date` - For querying by seller and date range
- `idx_seller_daily_metrics_date` - For date-based queries
- `idx_seller_product_metrics_seller_product_date` - For product-level queries
- `idx_seller_product_metrics_seller_date` - For seller-level product queries
- `idx_seller_overview_summary_seller` - Unique index for seller lookup

### RLS Policies

All analytics tables enforce Row Level Security:

- **Seller Read** - Sellers can only view their own analytics
- **Admin Read** - Admins and moderators can view any seller's analytics

## API Endpoints

### Dashboard

```
GET /api/v1/analytics/seller/dashboard
```

**Query Parameters:**
- `sellerId` (required) - UUID of the seller
- `dateRange` (optional) - today, yesterday, last_7_days, last_30_days, last_90_days, last_year, custom
- `customDateRange.startDate` (required if dateRange=custom) - YYYY-MM-DD format
- `customDateRange.endDate` (required if dateRange=custom) - YYYY-MM-DD format

**Response:**
```json
{
  "overview": {
    "totalOrders": 100,
    "completedOrders": 80,
    "pendingOrders": 15,
    "cancelledOrders": 5,
    "grossRevenueMinor": 50000,
    "netRevenueMinor": 45000,
    "refundsMinor": 5000,
    "customersNew": 20,
    "customersReturning": 30
  },
  "products": {
    "totalProducts": 50,
    "activeProducts": 40,
    "draftProducts": 5,
    "outOfStock": 3,
    "lowStock": 2
  },
  "inventory": {
    "inventoryValueMinor": 10000,
    "lowStockCount": 5,
    "outOfStockCount": 2
  },
  "dailyMetrics": [...]
}
```

### Revenue Analytics

```
GET /api/v1/analytics/seller/revenue
```

**Query Parameters:**
- `sellerId` (required) - UUID of the seller
- `startDate` (required) - YYYY-MM-DD format
- `endDate` (required) - YYYY-MM-DD format
- `groupBy` (optional) - hour, day, week, month, year (default: day)

**Response:**
```json
[
  {
    "period": "2024-01-01",
    "grossRevenueMinor": 5000,
    "netRevenueMinor": 4500,
    "ordersCount": 10
  }
]
```

### Product Analytics

```
GET /api/v1/analytics/seller/products
```

**Query Parameters:**
- `sellerId` (required) - UUID of the seller
- `limit` (optional) - Number of products to return (default: 50, max: 100)

**Response:**
```json
[
  {
    "productId": "uuid",
    "productName": "Product Name",
    "sku": "SKU-123",
    "status": "active",
    "basePriceMinor": 1000,
    "currency": "KES",
    "totalOrders": 50,
    "unitsSold": 100,
    "grossRevenueMinor": 100000,
    "stockAvailable": 50,
    "stockReserved": 10,
    "isLowStock": false,
    "isOutOfStock": false
  }
]
```

### Customer Analytics

```
GET /api/v1/analytics/seller/customers
```

**Query Parameters:**
- `sellerId` (required) - UUID of the seller
- `startDate` (required) - YYYY-MM-DD format
- `endDate` (required) - YYYY-MM-DD format
- `limit` (optional) - Number of customers to return (default: 50, max: 100)

**Response:**
```json
[
  {
    "customerId": "uuid",
    "displayName": "John Doe",
    "email": "john@example.com",
    "orderCount": 5,
    "totalSpentMinor": 25000,
    "firstOrderAt": "2024-01-01T00:00:00Z",
    "lastOrderAt": "2024-01-15T00:00:00Z",
    "avgOrderValueMinor": 5000,
    "isReturning": true
  }
]
```

### Inventory Analytics

```
GET /api/v1/analytics/seller/inventory
```

**Query Parameters:**
- `sellerId` (required) - UUID of the seller

**Response:**
```json
{
  "inventoryValueMinor": 100000,
  "lowStockCount": 5,
  "outOfStockCount": 2
}
```

### Rating Analytics

```
GET /api/v1/analytics/seller/ratings
```

**Query Parameters:**
- `sellerId` (required) - UUID of the seller

**Response:**
```json
{
  "averageRating": 4.5,
  "reviewCount": 100,
  "ratingDistribution": {
    "1": 5,
    "2": 10,
    "3": 15,
    "4": 30,
    "5": 40
  },
  "ratingTrend": []
}
```

### Search Analytics

```
GET /api/v1/analytics/seller/search
```

**Query Parameters:**
- `sellerId` (required) - UUID of the seller
- `startDate` (required) - YYYY-MM-DD format
- `endDate` (required) - YYYY-MM-DD format

**Response:**
```json
{
  "productImpressions": 1000,
  "searchClicks": 100,
  "searchCTR": 0.1,
  "popularSearchTerms": [
    {
      "term": "dress",
      "count": 50
    }
  ]
}
```

### Export Reports

```
GET /api/v1/analytics/seller/export
```

**Query Parameters:**
- `sellerId` (required) - UUID of the seller
- `reportType` (required) - sales, revenue, inventory, orders, reviews, customers
- `startDate` (required) - YYYY-MM-DD format
- `endDate` (required) - YYYY-MM-DD format
- `format` (optional) - csv, xlsx, pdf (default: csv)

**Response:**
- Binary file download with appropriate Content-Type header
- Content-Disposition header with filename

## KPI Definitions

### Revenue Metrics

- **Gross Revenue** - Total revenue from all orders before cancellations
- **Net Revenue** - Gross revenue minus cancelled orders
- **Refunds** - Total amount refunded to customers
- **Revenue Growth** - Percentage change in revenue compared to previous period

### Order Metrics

- **Total Orders** - All orders placed in the period
- **Completed Orders** - Orders that reached completion status
- **Pending Orders** - Orders awaiting processing
- **Cancelled Orders** - Orders that were cancelled

### Product Metrics

- **Total Products** - All products in the seller's catalog
- **Active Products** - Products with status 'active' or 'published'
- **Draft Products** - Products with status 'draft'
- **Out of Stock** - Products with zero available inventory
- **Low Stock** - Products below their low stock threshold
- **Best Sellers** - Products sorted by revenue
- **Worst Performing** - Products with lowest revenue
- **Fast Moving** - Products with high sales velocity
- **Slow Moving** - Products with low sales velocity

### Customer Metrics

- **New Customers** - Customers placing their first order
- **Returning Customers** - Customers with previous orders
- **Repeat Purchase Rate** - Percentage of customers who made multiple purchases
- **Average Order Value (AOV)** - Average revenue per order
- **Customer Purchase Frequency** - Average time between purchases
- **Customer Retention** - Percentage of customers who return

### Inventory Metrics

- **Inventory Value** - Total value of current inventory (price × quantity)
- **Low Stock Count** - Number of products below low stock threshold
- **Out of Stock Count** - Number of products with zero inventory

## Performance Optimizations

### Materialized Views

The `seller_overview_summary` materialized view provides fast access to seller-level aggregates without scanning orders and products tables.

### Indexed Queries

All analytics queries use appropriate indexes on:
- `seller_id` for seller-scoped queries
- `metric_date` / `created_at` for date range queries
- Composite indexes for seller + date queries

### Daily Metrics Pre-aggregation

The `seller_daily_metrics` table pre-calculates daily aggregates, avoiding expensive real-time calculations for dashboard queries.

### Scheduled Jobs

The following functions should be called by scheduled jobs:

1. **Daily Metrics Calculation** - Run nightly to calculate metrics for the previous day
2. **Overview Summary Refresh** - Run after daily metrics calculation

## Security

### RBAC Enforcement

All analytics endpoints enforce role-based access control:

- **Sellers** - Can only view their own analytics
- **Admins** - Can view any seller's analytics
- **Moderators** - Can view any seller's analytics (read-only)
- **Support Staff** - Read-only access where permitted

### Permission Checker

The `PermissionChecker` interface enforces access control by:
1. Checking if the user is a seller member
2. Checking if the user has admin or moderator role
3. Denying access if neither condition is met

## Visualization Components

### KPI Card

Displays a single key performance indicator with optional trend.

```tsx
<KPICard
  title="Total Revenue"
  value="KES 125,000"
  change={12.5}
  changeType="increase"
/>
```

### Line Chart

Displays trends over time for revenue, orders, etc.

```tsx
<LineChart
  data={[
    { label: '2024-01-01', value: 5000 },
    { label: '2024-01-02', value: 6000 },
  ]}
  color="#3b82f6"
  height={200}
/>
```

### Bar Chart

Displays categorical data for products, categories, etc.

```tsx
<BarChart
  data={[
    { label: 'Product A', value: 100 },
    { label: 'Product B', value: 80 },
  ]}
  horizontal={false}
/>
```

### Pie Chart

Displays distribution data for categories, customer segments, etc.

```tsx
<PieChart
  data={[
    { label: 'Category A', value: 50, color: '#3b82f6' },
    { label: 'Category B', value: 30, color: '#10b981' },
  ]}
/>
```

### Data Table

Displays tabular data with sorting and pagination.

```tsx
<DataTable
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'value', label: 'Value' },
  ]}
  data={[...]}
  sortable={true}
  pagination={true}
/>
```

## Testing

Run tests with:

```bash
pnpm test
```

Test coverage includes:
- Schema validation
- Date range calculations
- Service methods
- Permission checks
- Export functionality
- CSV generation

## Migration

The analytics migration is fully idempotent and can be rerun on existing databases:

```bash
supabase db push
```

The migration uses:
- `CREATE TABLE IF NOT EXISTS`
- `ALTER TABLE ADD COLUMN IF NOT EXISTS`
- `CREATE INDEX IF NOT EXISTS`
- `CREATE OR REPLACE FUNCTION`
- `DROP TRIGGER IF EXISTS`
- `DROP POLICY IF EXISTS`
- Conditional constraint blocks
