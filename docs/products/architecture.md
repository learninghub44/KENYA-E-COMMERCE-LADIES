# Product Architecture

**Status:** Draft
**Owner:** Marketplace Engineer (Agent 04)
**Builds on:** `docs/Architecture.md`, `docs/database/*`, `docs/handoffs/agent-01.md`, `docs/handoffs/agent-03.md`

## 1. Scope

This module owns discovering and managing products: creation, editing, variants, images,
inventory, moderation lifecycle, and catalog structure (categories, brands, collections). It does
**not** own checkout, orders, payments, messaging, or admin moderation UI — those belong to
Agents 5, 6, and 7.

## 2. Layering

```
app/api/v1/...              <- not yet scaffolded (see features/products/README.md)
        |
lib/products/*               <- this module: framework-agnostic services, zod schemas, types
lib/marketplace/*             <- this module: search/discovery/catalog/wishlist
        |
ProductRepository, etc.       <- injected interfaces, implemented against Supabase elsewhere
        |
supabase/migrations/*         <- public.products, product_variants, product_images,
                                  inventory_items, categories, brands, collections, wishlists
```

Every service in `lib/products` and `lib/marketplace` is a pure function of injected
repository/reader interfaces (see `lib/products/types.ts` and `lib/marketplace/types.ts`). This
mirrors Agent 02's `lib/auth` and Agent 03's `lib/seller` — no module imports another module's
internals, and no service imports a Supabase client directly. A route-handler layer (not yet
scaffolded in this repo) is responsible for constructing a Supabase-backed implementation of each
repository interface and injecting it into `createProductService(deps)` /
`createSearchService(deps)` etc.

## 3. Seller gating

`lib/products/types.ts` exports `SellerStatusReader`, a single-method interface
(`isApprovedAndVerified(sellerId)`). `product-service.ts` calls this before allowing product
creation. The real implementation must be backed by Agent 03's `lib/seller` contracts
(`normalizeSellerStatus`, `sellers.kyc_status`) — this module never queries `sellers` or
`kyc_verifications` directly, per Agent 03's handoff recommendation.

## 4. Data model

See `supabase/migrations/202607010001_foundation_schema.sql` for the tables this module reads and
writes (`products`, `product_variants`, `product_images`, `inventory_items`,
`product_attributes`, `categories`, `brands`, `collections`, `collection_products`, `wishlists`,
`wishlist_items`) and `202607020002_marketplace_product_catalog.sql` for the `is_suspended` column
and filter-support indexes this module added. The read-optimized `public.product_catalog` view
(added in the phase-2 migration by Agent 01) is the intended backing source for
`ProductSearchIndex` implementations — it already joins seller, category, and brand names and
filters to `status = 'active'`, `deleted_at is null`.

## 5. Extensibility points already wired

- `ProductSearchIndex.search()` takes one filter object; swapping in an AI-ranked search engine
  later means only replacing the Supabase-backed implementation, not any caller.
- `listBestSellers`, `listTrending`, `listRecommended` exist on `createSearchService` and return
  `[]` today — the interface is stable so Agent 5's order-volume data can fill them in later
  without a signature change.
- Variant `options` is `Record<string, string>`, not fixed columns, so new attribute types never
  require a schema migration.
