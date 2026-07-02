# Agent 05 Cart, Checkout, and Orders Handoff

## Features Implemented

- Persistent cart service with add, remove, quantity update, save for later, move back to cart,
  guest cart readiness, logged-in cart ownership, cart summary, and guest-to-user merge.
- Checkout service that validates buyer ownership, addresses, cart contents, coupon code,
  inventory reservation, and multi-vendor order splitting.
- Order service with buyer order access, seller list support, buyer cancellation, status
  transition state machine, invoice placeholder, and reorder placeholder.
- Centralized order/cart calculations for subtotal, discounts, shipping placeholder, tax
  placeholder, and total.
- Coupon foundation for percentage/fixed, marketplace/seller coupons.
- Notification event publishing for order created, confirmed, cancelled, and status changed.

## APIs Exposed In Code

`lib/cart`:
- `createCartService`

`lib/checkout`:
- `createCheckoutService`

`lib/orders`:
- `createOrderService`
- `calculateOrderTotals`
- `calculateCartSummary`
- `canTransitionOrderStatus`
- `assertOrderStatusTransition`
- zod schemas and shared commerce types

## Database Changes

`supabase/migrations/202607020003_commerce_engine.sql`:
- Extends `public.order_status` with Agent 05 lifecycle values.
- Extends existing `orders` and `order_items` placeholders with notes, grouping, snapshots,
  discount, metadata, and lifecycle timestamps.
- Adds `carts`, `cart_items`, `coupons`, `order_coupon_applications`, and
  `order_status_history`.
- Adds RLS policies for buyer cart ownership, coupon visibility, and order-adjacent reads.
- Adds `public.reserve_inventory_for_checkout(jsonb)` for row-locked reservation.

## Order Lifecycle

The app-level lifecycle is:

`draft -> pending -> confirmed -> processing -> ready_for_shipment -> shipped -> delivered -> completed`

Side paths: eligible early states may move to `cancelled`; shipped/delivered/completed may move
to `returned`; completed/returned may move to `refunded`.

## Cart Architecture

Cart logic is repository-injected. Route handlers should derive `userId` from Supabase Auth and
`guestToken` from a signed cookie. Product purchasability is read through `ProductReader`, which
should be backed by Agent 04 catalog/product interfaces.

## Checkout Flow

Checkout reserves inventory, splits lines by `sellerId`, creates seller-scoped orders under one
parent order number, emits events, and converts the cart. Payment is deliberately absent.

## Inventory Integration

The code uses `InventoryReservationRepository.reserve()` and `.release()`. The SQL migration
provides an RPC implementation for a Supabase adapter. It increments
`inventory_items.quantity_reserved` and prevents overselling with row locks.

## Tests Completed

`pnpm test` passes: 37 tests across 12 suites.

Agent 05 coverage includes cart totals/save-for-later, guest cart merge, checkout order splitting,
inventory shortage rejection, coupon calculation, and invalid order state transitions.

## Known Limitations

- No `app/api` route handlers exist in the repo yet; APIs are documented and services are ready
  to wire once the route scaffold lands.
- No Supabase repository adapters were added, matching Agent 03/04's repository-injection pattern.
- Shipping, taxes, invoices, reorder, refunds, and returns are placeholders/future-ready.
- Payment state remains `unpaid` at checkout by design.

## Recommendations For Agent 6

- Messaging should reference seller-scoped `orders.id`, not just the buyer-facing parent order
  number, so each seller conversation stays properly scoped.
- Use `order.created`, `order.confirmed`, `order.cancelled`, and `order.status_changed` events as
  notification triggers; do not add delivery logic inside commerce services.
- Buyer-seller communication should enforce that the buyer owns the order and the seller manages
  `orders.seller_id`.
