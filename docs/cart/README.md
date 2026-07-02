# Cart Lifecycle

Agent 05 owns persistent shopping carts through `lib/cart` and the `public.carts` /
`public.cart_items` tables.

## Behavior

- A buyer has at most one active cart.
- A guest cart is keyed by `guest_token` and can be claimed or merged after login.
- Cart lines store a product snapshot, seller id, unit price, currency, quantity, and either
  `active` or `saved_for_later` status.
- Cart totals count only active items. Saved items remain attached to the cart for later movement.
- Product availability is checked through an injected `ProductReader`, not by querying catalog
  internals directly.

## API Reference

Intended REST routes once `app/api` is scaffolded:

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/v1/cart` | authenticated | View active cart and summary |
| `POST` | `/api/v1/cart/items` | authenticated or guest | Add product/variant |
| `PATCH` | `/api/v1/cart/items/{itemId}` | authenticated or guest | Update quantity |
| `DELETE` | `/api/v1/cart/items/{itemId}` | authenticated or guest | Remove line |
| `POST` | `/api/v1/cart/items/{itemId}/save-for-later` | authenticated or guest | Save line |
| `POST` | `/api/v1/cart/items/{itemId}/move-to-cart` | authenticated or guest | Restore line |
| `POST` | `/api/v1/cart/merge` | authenticated | Merge guest cart after login |

## Validation

Quantities must be integers from 1 to 99. Products must be published and in stock. A cart request
must identify either `userId` or `guestToken`; route handlers should derive those values from the
session/cookie rather than accepting raw ownership ids from clients.
