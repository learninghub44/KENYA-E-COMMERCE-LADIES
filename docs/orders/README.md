# Orders

Agent 05 implements order creation, buyer/seller order management, totals, coupons, status
transitions, history, and notification events.

## Lifecycle

Allowed transitions:

```text
draft -> pending -> confirmed -> processing -> ready_for_shipment -> shipped -> delivered -> completed
draft|pending|confirmed|processing|ready_for_shipment -> cancelled
shipped|delivered|completed -> returned
completed|returned -> refunded
```

`lib/orders/status.ts` is the source of truth. Invalid transitions return `INVALID_TRANSITION`.

## Historical Accuracy

Order items store:

- Product id and variant id when still available.
- Product name, variant title, sku, unit price, quantity, discount, and line total.
- Product snapshot at purchase time.
- Seller snapshot at purchase time.

Orders remain readable even when catalog data changes later.

## Totals

`calculateOrderTotals()` centralizes subtotal, discount, shipping placeholder, tax placeholder,
and total calculation. Money is always integer minor units with explicit currency.

## API Reference

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/v1/orders` | authenticated | Buyer order history |
| `GET` | `/api/v1/orders/{orderId}` | authenticated | Buyer order detail |
| `POST` | `/api/v1/orders/{orderId}/cancel` | authenticated | Buyer cancellation when eligible |
| `GET` | `/api/v1/orders/{orderId}/invoice` | authenticated | Invoice placeholder |
| `POST` | `/api/v1/orders/{orderId}/reorder` | authenticated | Reorder placeholder |
| `GET` | `/api/v1/seller-orders` | seller | Seller order list |
| `POST` | `/api/v1/orders/{orderId}/status` | seller/admin | Fulfillment status transition |

## Inventory Reservation

The migration adds `public.reserve_inventory_for_checkout(jsonb)`, which locks matching
`inventory_items` rows, checks sellable quantity, increments `quantity_reserved`, and returns any
shortages. Empty result means success.

The app-level repository interface remains injectable so a future Supabase adapter can call this
RPC without changing checkout logic.
