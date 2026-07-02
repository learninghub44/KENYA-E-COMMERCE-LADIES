# Reviews Feature

Owns verified purchase product reviews, review media, helpful votes, reporting, and buyer edit/delete rules.

Public entry points live in `lib/reviews`:

- `createReviewService`
- `validateReviewMedia`
- Zod request schemas for product reviews, seller reviews, reports, and listing filters

This feature does not own product, order, seller, notification, or admin internals. It depends on those modules through repository interfaces and event/audit gateways.
