# Variants, Inventory, and Media

**Status:** Draft
**Owner:** Marketplace Engineer (Agent 04)

## Variant model

`product_variants.options` is a `jsonb` map (`Record<string, string>`, e.g.
`{ "color": "Red", "size": "M" }`) rather than fixed `color`/`size`/`material` columns. This keeps
the model generic for future product types (electronics, homeware) without a migration. SKU is
unique per product (`unique (product_id, sku)`, enforced in the foundation migration and mirrored
in `variant-service.ts`'s pre-check).

`lib/products/variant-service.ts` exposes `list`, `add`, `update`, `remove` — all ownership-checked
against the parent product's `seller_id`.

## Inventory model

One `inventory_items` row per `(product_id, variant_id)` pair; a `variant_id is null` row is the
base/simple-product inventory. `lib/products/inventory-service.ts` derives a buyer-facing
`InventoryStatus` (`in_stock | low_stock | out_of_stock | not_tracked`) from
`quantity_available - quantity_reserved` vs `low_stock_threshold`, so callers never do that
arithmetic themselves. `quantity_reserved` (order holds during checkout) is owned by Agent 5 and
only read here, never written.

Explicitly out of scope: warehouse/location-level stock, backorder fulfillment logic (the
`track_inventory` flag exists so a future backorder feature has a home, but no backorder behavior
is implemented).

## Cloudinary integration

`lib/products/media-service.ts` only stores/orders Cloudinary URLs already produced by an upload
pipeline. It does not call the Cloudinary API directly — upload, transformation, and optimization
are owned by the API Integration Engineer (Agent 9). Route-handler code should call Agent 9's
upload helper first, then pass the resulting `url` into `mediaService.add()`.

`reorder()` requires the full, exact set of current image ids (drag-and-drop reorder from the
seller UI) and rejects partial lists to prevent silently dropping images.

## Validation summary

All create/update input is validated with zod schemas in `lib/products/schemas.ts` before any
repository call:

- `productCreateSchema` / `productUpdateSchema`: name length, non-negative integer minor-unit
  prices, `compareAtPriceMinor >= basePriceMinor`, currency is a 3-letter code.
- `productVariantInputSchema`: SKU required, prices non-negative, `options` values capped at 80
  chars.
- `productImageInputSchema`: `url` must be a valid URL.
- `inventoryInputSchema`: `quantityAvailable` and `lowStockThreshold` are non-negative integers.

Server-side validation is authoritative; client-side validation is UX only, per
`docs/APIStandards.md`.
