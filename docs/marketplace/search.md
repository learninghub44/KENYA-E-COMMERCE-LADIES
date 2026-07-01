# Search, Filters, and Discovery

**Status:** Draft
**Owner:** Marketplace Engineer (Agent 04)

## Search foundation

`lib/marketplace/search-service.ts`'s `search()` is the single entry point for keyword + filter
queries. It validates input with `productSearchSchema` (`lib/products/schemas.ts`) and delegates
to an injected `ProductSearchIndex`. Everything downstream of validation — full-text ranking,
filter application, pagination — lives behind that one interface, so replacing Postgres
`tsvector` ranking with an AI-ranked search service later requires only a new `ProductSearchIndex`
implementation, not a change to `search-service.ts` or any route handler.

Today's intended Postgres implementation:
- Keyword search uses `products.search_vector` (already populated by a trigger and indexed with a
  GIN index — see `202607010001_foundation_schema.sql`).
- Structural fields (category, brand, seller, price range, featured) read from
  `public.product_catalog` (Agent 01's read-optimized view) plus the filter-support indexes added
  in `202607020002_marketplace_product_catalog.sql`.
- `color` / `size` / `material` filters match against `product_variants.options` (GIN-indexed).
- Cursor pagination uses `(created_at desc, id)` or `(published_at desc, id)` depending on `sort`.

## Filters supported (`ProductSearchFilters`)

`categoryId`, `brandId`, `sellerId`, `collectionId`, `tags`, `minPriceMinor`/`maxPriceMinor`,
`color`, `size`, `material`, `inStockOnly`. All are optional and combine with AND semantics.
`minPriceMinor > maxPriceMinor` is rejected with `VALIDATION_ERROR` before any query runs.

Filters are deliberately modular — each is an independent optional field on one flat object — so
Agent 6 (Admin) or a future mobile client can add new filter chips without touching the search
service signature.

## Discovery endpoints

`listFeatured`, `listNewArrivals`, and `listRelated` are implemented against
`ProductSearchIndex` today. `listBestSellers`, `listTrending`, and `listRecommended` exist on
`createSearchService` but return `[]` — per the Agent 04 spec, algorithms are intentionally not
implemented yet. They will need order-volume data from Agent 5 (best sellers/trending) and
behavioral data (recommended) that this module does not own.

`RecentlyViewedStore` / `createRecentlyViewedService` (`lib/marketplace/wishlist-service.ts`)
tracks a capped, most-recent list per user; route handlers should call `record()` on every product
detail page view.

## Recommendation for Agent 5 (Orders)

Read product price/currency/availability through `searchService.getById()` or a
`ProductSearchIndex` lookup at checkout time — do not read `products` directly, so this module can
change its internal query shape without breaking checkout.
