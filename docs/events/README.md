# Event Analytics Documentation

## Overview
The event analytics system tracks marketplace activities across all domains: authentication, products, search, cart, checkout, orders, sellers, reviews, messaging, and notifications.

## Architecture

```
App (Next.js Route Handler)
  -> EventService (validation, versioning)
    -> EventRepository (Supabase RPC / direct table access)
      -> internal_events table
```

## Database Tables
- `internal_events` — All tracked events with full context
- `event_aggregations_hourly` — Pre-computed hourly event counts
- `event_aggregations_daily` — Pre-computed daily event counts
- `event_type_stats` — Per-type daily statistics

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST   | /internal/events | Create an event |
| GET    | /internal/events | List events with filters |
| GET    | /internal/events/:id | Get a single event |
| GET    | /internal/events/types | Get event types |
| GET    | /internal/events/statistics | Get event statistics |

## Internal API Access
All endpoints require `admin` or `super_admin` role via `user_roles` table.

## Event Types (36 total)
- Authentication: user_registered, login, logout, password_reset, email_verified, mfa_enabled, account_suspended, account_deleted
- Marketplace: product_viewed, product_created, product_updated, product_deleted, category_viewed
- Search: search_performed, search_filtered
- Cart: cart_created, cart_updated, cart_item_added, cart_item_removed, cart_abandoned
- Checkout: checkout_started, checkout_completed, checkout_abandoned, payment_attempted, payment_failed
- Orders: order_created, order_updated, order_cancelled, order_refunded, order_fulfilled
- Sellers: seller_registered, seller_updated, seller_product_added, seller_payout
- Reviews: review_created
- Messaging: conversation_started
- Notifications: notification_created

## Key Files
- `lib/events/types.ts` — Type definitions, Zod schemas, event type constants
- `lib/events/event-service.ts` — Core service (create, list, statistics, archive)
- `lib/events/event-repository.ts` — Supabase repository implementation
- `lib/events/aggregation-service.ts` — Time-based aggregation
- `lib/events/replay-service.ts` — Event replay with cursor pagination

## Testing
Tests are in `lib/events/*.test.ts`. Run with `node --test lib/events/*.test.ts`.
