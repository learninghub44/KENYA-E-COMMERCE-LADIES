# Product Lifecycle

**Status:** Draft
**Owner:** Marketplace Engineer (Agent 04)

## States

```
draft -> pending_review -> approved -> published
  ^            |               |          |
  |            v               v          v
  +------- rejected      archived <-- suspended
```

| Status | Meaning | Who can set it |
|---|---|---|
| `draft` | Seller is editing; not visible anywhere. | Seller |
| `pending_review` | Seller submitted for moderation. | Seller (`submit`) |
| `approved` | Moderator signed off, but not yet visible to buyers. | Moderator only (Agent 7) |
| `published` | Live in the catalog. | Seller (`publish`, only from `approved`) or moderator |
| `rejected` | Moderator declined; seller can revise back to `draft`. | Moderator only |
| `suspended` | Was published, pulled by a moderator without deleting it. | Moderator only |
| `archived` | Retired by the seller or after moderation; not shown anywhere. | Seller (`archive`) or moderator |

Valid transitions are enforced centrally in `lib/products/status.ts`
(`PRODUCT_STATUS_TRANSITIONS`, `assertProductStatusTransition`). `product-service.ts`'s
`transition()` method is the only way to change status; direct repository writes must not be used
by feature code.

## Why `approved`/`published`/`suspended` aren't separate database enum values

`public.product_status` (defined by Agent 01) has five values:
`draft | pending_review | active | rejected | archived`. Widening a shared enum mid-project would
touch Agent 1's foundation migration and every RLS policy that matches on `status`, so this module
instead layers the richer lifecycle on top of two existing columns plus one new one:

- `published_at` (already existed): `active` + `published_at is null` = **approved**;
  `active` + `published_at is not null` = **published**.
- `is_suspended` (added by this module in `202607020002_marketplace_product_catalog.sql`):
  `archived` + `is_suspended = true` = **suspended**; `archived` + `is_suspended = false` = a
  normal **archived** row.

`lib/products/status.ts` (`normalizeProductStatus` / `toStoredProductStatus`) is the single place
that translates between the two representations — the same pattern Agent 03 used for
`pending_kyc` / `active` legacy compatibility in `lib/seller/status.ts`.

## Moderator-only transitions

`approve`, `reject`, and `suspend` are reachable through `productService.transition(productId,
null, to)` (the third argument, `actorSellerId`, is `null` to skip the ownership check). Only
Agent 7's admin service should call `transition()` with a `null` actor — seller-facing route
handlers must always pass the authenticated seller's id so ownership is enforced.

## Recommendation for Agent 7 (Admin/Moderation)

Build the moderation queue and staff review UI against `productService.transition()`. Do not write
directly to `products.status`/`is_suspended`/`published_at` from admin code — go through this
service so the state machine and event publishing stay centralized.
