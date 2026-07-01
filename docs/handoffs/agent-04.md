# Agent 04 Marketplace Engineer Handoff

## What Was Built

Agent 04 implemented a framework-agnostic product management and marketplace-discovery domain
layer on top of Agent 01's schema, Agent 02's auth primitives, and Agent 03's seller/KYC gating,
following the same repository-injection pattern Agent 03 established (`createXService(deps)`,
zod validation, `{ ok, data } | { ok: false, code, message, status }` results).

## APIs Exposed In Code

`lib/products/`:
- `createProductService` — `create`, `update`, `getById`, `duplicate`, `softDelete`,
  `transition`, plus `submit`/`publish`/`unpublish`/`archive` convenience wrappers
- `createVariantService` — `list`, `add`, `update`, `remove`
- `createMediaService` — `list`, `add`, `reorder`, `setPrimary`, `remove`
- `createInventoryService` — `get`, `set`; `inventoryStatusFor()` helper
- `normalizeProductStatus`, `toStoredProductStatus`, `canTransitionProductStatus`,
  `assertProductStatusTransition`
- `slugifyProductName`

`lib/marketplace/`:
- `createCatalogService` — categories (tree), brands, collections; `buildCategoryTree()` helper
- `createSearchService` — `search`, `getById`, `listBySeller`, `listFeatured`,
  `listNewArrivals`, `listRelated`, plus `listBestSellers`/`listTrending`/`listRecommended`
  placeholders that return `[]`
- `createWishlistService` — `add`, `remove`, `view`, `count`
- `createRecentlyViewedService` — `record`, `list`

## Intended HTTP APIs

See `docs/products/api.md` for the full route table. The repository still has no `app/api`
scaffold (same gap Agent 03 flagged), so route handlers are documented rather than added.

## Product Lifecycle

`draft -> pending_review -> approved -> published`, with `rejected`, `suspended`, and `archived`
side states. Full state machine and the reasoning behind reusing `products.status` +
`published_at` + a new `is_suspended` column (instead of widening the shared
`product_status` enum) is in `docs/products/lifecycle.md`.

## Search Architecture

Single `search()` entry point over an injected `ProductSearchIndex`, intended to be backed by
`public.product_catalog` (Agent 01's view) plus `search_vector` full-text search and the new
filter-support indexes. Full detail in `docs/marketplace/search.md`.

## Category Design

Flat `categories` table with `parent_id` self-reference; `buildCategoryTree()` builds the nested
structure in application code in O(n), sorted by `sort_order`. Brands and collections are flat,
slug-addressable resources; collections optionally scope to a seller.

## Cloudinary Integration Details

`lib/products/media-service.ts` stores/orders already-uploaded Cloudinary URLs only. Upload and
transformation are Agent 9's responsibility — see `docs/products/variants.md`.

## Validation Rules

All mutating inputs go through zod schemas in `lib/products/schemas.ts`
(`productCreateSchema`, `productUpdateSchema`, `productVariantInputSchema`,
`productImageInputSchema`, `inventoryInputSchema`, `productSearchSchema`,
`wishlistAddSchema`/`wishlistRemoveSchema`) before any repository call. Full list in
`docs/products/variants.md`.

## Database Changes Made

`supabase/migrations/202607020002_marketplace_product_catalog.sql`:
- `products.is_suspended boolean not null default false` (see lifecycle doc for why)
- `idx_products_category_price`, `idx_products_brand_active`, `idx_products_featured`
- `idx_product_variants_options` (GIN, for color/size/material filters)
- `idx_wishlist_items_wishlist`

No changes were made to Agent 01's foundation schema, RLS policies, or the `product_status` enum.

## Tests Completed

`pnpm test` (run here via `tsc --outDir dist-test && node --test`) passes with **31 tests total**
across the whole repo — the 13 pre-existing auth/permission/seller/KYC tests plus 18 new tests
added by this agent (8 in `lib/products/product-service.test.ts`, plus category-tree, catalog,
search-validation, and wishlist tests in `lib/marketplace/marketplace-service.test.ts`).

Covered: seller-approval gating on product creation, slug generation and de-duplication,
ownership enforcement on update/duplicate/soft-delete, the full lifecycle transition graph
(including rejecting invalid transitions), soft delete, category tree nesting/sorting, price-range
filter validation, and wishlist add/remove/count round-trips.

## Known Limitations

- No Next.js route handlers exist yet (repo-wide gap, not specific to this agent) — everything
  above is ready to be wired in once `app/api` is scaffolded.
- `ProductSearchIndex`, `CategoryRepository`, `BrandRepository`, `CollectionRepository`,
  `WishlistRepository`, and `RecentlyViewedStore` are interfaces only; no Supabase-backed
  implementation was written in this pass (mirrors Agent 03's approach — services are tested
  against in-memory fakes, real adapters are a route-handler-layer concern).
- `listBestSellers`, `listTrending`, `listRecommended` are placeholders returning `[]`, as the
  spec requires — they need order-volume data (Agent 5) and behavioral data neither of which
  exists yet.
- Product `search_vector` currently indexes `name` + `description` only (set by Agent 01's
  trigger); it does not yet include brand/category name or tags. Consider extending the trigger
  if search relevance on those fields matters before Agent 7 ships moderation.
- No rate limiting or idempotency keys are applied at this layer — per `docs/APIStandards.md` §5,
  that belongs at the route-handler layer once it exists.
- Recurring repo-wide note carried over from earlier sessions: GitHub PATs have previously been
  shared in plaintext during working sessions on this project. No credentials were provided or
  used in this session; rotate any previously-shared PAT to a fine-grained token before this
  branch is pushed or merged.

## Recommendations For Agent 5 (Orders)

- Read product price, currency, and availability through `searchService.getById()` /
  `ProductSearchIndex`, not by querying `products` directly, so this module's internal query
  shape can change without breaking checkout.
- Inventory holds during checkout should increment `inventory_items.quantity_reserved` directly
  (Agent 5 owns that column); read current availability via `inventoryService.get()`'s derived
  `InventoryStatus` first to fail fast on out-of-stock items.
- Products must be in `published` status (`normalizeProductStatus(record) === "published"`) to be
  purchasable — check via `productService.getById()` before allowing an add-to-cart or checkout.
