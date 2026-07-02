# Products API Reference

**Status:** Draft — documented ahead of route handlers, per Agent 03's precedent (the repo has no
`app/api` scaffold yet; see `docs/handoffs/agent-03.md` and `features/products/README.md`).

All responses follow `docs/APIStandards.md`: `{ "data": ..., "meta": ... }` on success,
`{ "error": { "code", "message", "details" } }` on failure, cursor pagination for list endpoints.

## Products

| Method | Path | Auth | Service call |
|---|---|---|---|
| `POST` | `/api/v1/products` | seller | `productService.create(body)` |
| `GET` | `/api/v1/products/{productId}` | public | `productService.getById(productId)` |
| `PATCH` | `/api/v1/products/{productId}` | seller (owner) | `productService.update(body)` |
| `DELETE` | `/api/v1/products/{productId}` | seller (owner) | `productService.softDelete(productId, sellerId)` |
| `POST` | `/api/v1/products/{productId}/duplicate` | seller (owner) | `productService.duplicate(productId, sellerId)` |
| `POST` | `/api/v1/products/{productId}/submit` | seller (owner) | `productService.submit(productId, sellerId)` |
| `POST` | `/api/v1/products/{productId}/publish` | seller (owner) | `productService.publish(productId, sellerId)` |
| `POST` | `/api/v1/products/{productId}/unpublish` | seller (owner) | `productService.unpublish(productId, sellerId)` |
| `POST` | `/api/v1/products/{productId}/archive` | seller (owner) | `productService.archive(productId, sellerId)` |
| `POST` | `/api/v1/products/{productId}/approve` | admin | `productService.transition(productId, null, "approved")` |
| `POST` | `/api/v1/products/{productId}/reject` | admin | `productService.transition(productId, null, "rejected")` |
| `POST` | `/api/v1/products/{productId}/suspend` | admin | `productService.transition(productId, null, "suspended")` |

## Variants

| Method | Path | Auth | Service call |
|---|---|---|---|
| `GET` | `/api/v1/products/{productId}/variants` | public | `variantService.list(productId)` |
| `POST` | `/api/v1/products/{productId}/variants` | seller (owner) | `variantService.add(...)` |
| `PATCH` | `/api/v1/products/{productId}/variants/{variantId}` | seller (owner) | `variantService.update(...)` |
| `DELETE` | `/api/v1/products/{productId}/variants/{variantId}` | seller (owner) | `variantService.remove(...)` |

## Images

| Method | Path | Auth | Service call |
|---|---|---|---|
| `GET` | `/api/v1/products/{productId}/images` | public | `mediaService.list(productId)` |
| `POST` | `/api/v1/products/{productId}/images` | seller (owner) | `mediaService.add(...)` |
| `PATCH` | `/api/v1/products/{productId}/images/order` | seller (owner) | `mediaService.reorder(...)` |
| `PATCH` | `/api/v1/products/{productId}/images/{imageId}/primary` | seller (owner) | `mediaService.setPrimary(...)` |
| `DELETE` | `/api/v1/products/{productId}/images/{imageId}` | seller (owner) | `mediaService.remove(...)` |

## Inventory

| Method | Path | Auth | Service call |
|---|---|---|---|
| `GET` | `/api/v1/products/{productId}/inventory` | seller (owner) | `inventoryService.get(...)` |
| `PATCH` | `/api/v1/products/{productId}/inventory` | seller (owner) | `inventoryService.set(...)` |

## Marketplace: catalog, search, wishlist

| Method | Path | Auth | Service call |
|---|---|---|---|
| `GET` | `/api/v1/categories` | public | `catalogService.getCategoryTree()` |
| `GET` | `/api/v1/categories/{slug}` | public | `catalogService.getCategoryBySlug(slug)` |
| `GET` | `/api/v1/brands` | public | `catalogService.listBrands()` |
| `GET` | `/api/v1/brands/{slug}` | public | `catalogService.getBrandBySlug(slug)` |
| `GET` | `/api/v1/collections/{slug}` | public | `catalogService.getCollectionBySlug(...)` |
| `GET` | `/api/v1/collections/{collectionId}/products` | public | `catalogService.getCollectionProducts(...)` |
| `GET` | `/api/v1/products?q=&categoryId=&...` | public | `searchService.search(query)` |
| `GET` | `/api/v1/products/featured` | public | `searchService.listFeatured(...)` |
| `GET` | `/api/v1/products/new-arrivals` | public | `searchService.listNewArrivals(...)` |
| `GET` | `/api/v1/products/{productId}/related` | public | `searchService.listRelated(productId)` |
| `GET` | `/api/v1/sellers/{sellerId}/products` | public | `searchService.listBySeller(...)` |
| `POST` | `/api/v1/wishlist` | authenticated | `wishlistService.add(body)` |
| `DELETE` | `/api/v1/wishlist` | authenticated | `wishlistService.remove(body)` |
| `GET` | `/api/v1/wishlist` | authenticated | `wishlistService.view(userId)` |
| `GET` | `/api/v1/wishlist/count` | authenticated | `wishlistService.count(userId)` |

## Error codes emitted by this domain

`VALIDATION_ERROR` (400), `FORBIDDEN` (403), `NOT_FOUND` (404), `SLUG_CONFLICT` (409),
`SKU_CONFLICT` (409), `INVALID_TRANSITION` (409), `SELLER_NOT_APPROVED` (403).
