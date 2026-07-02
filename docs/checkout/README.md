# Checkout Flow

Checkout converts an authenticated buyer cart into one or more seller-scoped orders. Payments are
not implemented in Agent 05; created orders are confirmed with `paymentStatus = unpaid`.

## Flow

1. Load and authorize the active buyer cart.
2. Validate shipping and billing address snapshots.
3. Reject empty carts or mixed currencies.
4. Atomically reserve inventory through `InventoryReservationRepository`.
5. Validate an optional coupon and calculate totals centrally.
6. Split active cart lines by seller.
7. Create one confirmed order per seller, preserving product, variant, and seller snapshots.
8. Emit `order.created` and `order.confirmed` events.
9. Mark the cart `converted`.

If order creation throws after reservation, inventory is released.

## API Reference

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/v1/checkout/confirm` | authenticated | Confirm cart and create orders |
| `POST` | `/api/v1/coupons/validate` | authenticated | Validate coupon and return preview totals |

`POST /api/v1/checkout/confirm` must accept an `Idempotency-Key` header before route handlers are
implemented, because checkout mutates inventory and creates orders.

## Future Payment Integration

The payment agent should attach authorization/payment references to the seller orders after
checkout. Do not replace Agent 05's order splitting; payment should treat the returned
`parentOrderNumber` as the buyer-facing checkout group and each order as seller-settlement scope.
