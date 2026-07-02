# features/marketplace

Owned by Agent 04 (Marketplace Engineer).

Discovery-facing logic (search, filters, categories, brands, collections, wishlist) lives in
`lib/marketplace/`. Route handlers under `app/api/v1/products` (search/filter), `app/api/v1/categories`,
`app/api/v1/brands`, `app/api/v1/collections`, and `app/api/v1/wishlist` should call these services
once the Next.js API scaffold exists — see `docs/marketplace/` and `docs/handoffs/agent-04.md`.
