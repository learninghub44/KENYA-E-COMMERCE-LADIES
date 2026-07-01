# Performance Strategy

## Goals

The database should remain predictable under large catalog, order, message, and analytics volume.

## Core Practices

- Use cursor pagination for all unbounded lists.
- Use indexed ownership and status filters.
- Keep public catalog reads narrow through read views and selected columns.
- Store computed search vectors for product search.
- Store money as integers to avoid precision issues.
- Avoid synchronous third-party work in database transactions.
- Keep JSONB for flexible metadata, but do not query it heavily without measured indexes.

## Hot Access Paths

| Access Path | Required Support |
|---|---|
| Public catalog browsing | Product status/category/seller indexes, search vector, active seller filter. |
| Seller product management | `(seller_id, status, created_at desc)` indexes. |
| Buyer order history | `(buyer_id, created_at desc)` index. |
| Seller order management | `(seller_id, status, created_at desc)` index. |
| Conversation message loading | `(conversation_id, created_at desc)` index. |
| Notification feed | `(user_id, status, created_at desc)` index. |
| Analytics ingestion | Append-only writes and time-based indexes. |

## Query Design

- Select only required columns.
- Avoid N+1 query patterns in application code.
- Use views for stable cross-module read surfaces.
- Prefer server-side filtering over client-side filtering.
- Keep transactions short.
- Batch backfills and maintenance work.

## Write Path

High-write tables should stay simple:

- `messages`
- `notifications`
- `analytics_events`
- `activity_logs`
- `audit_logs`

Avoid heavy synchronous triggers on high-write tables unless the correctness benefit is essential.

## Observability

Performance reviews should inspect:

- Slow query logs.
- Query plans for hot endpoints.
- Index hit rates.
- Table and index bloat.
- Lock waits during migrations.
- RLS policy query cost.

## Scaling Roadmap

1. Start with Postgres indexes, RLS, and cursor pagination.
2. Add read models or materialized views only when repeated query cost is proven.
3. Add partitioning for high-growth tables after measured thresholds.
4. Evaluate dedicated search infrastructure only when Postgres full-text search no longer meets catalog needs.
