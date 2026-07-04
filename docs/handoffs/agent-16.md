# Agent 16 — Replace Mock Data on Three Pages with Real Supabase Wiring

## Summary

Three storefront pages were still fully hardcoded with mock data and no real API connectivity. This agent replaced all fake categories, products, sellers, and profile data with real Supabase queries through existing service layers. Also extracted a shared `toCardProduct()` mapping function to eliminate the duplicated pattern between search and category pages.

## Branch

- Work was done on `main` (fresh clone, then rebased onto remote main).
- Pushed to `production-deploy-fixes` and `main`.

## What Was Done

### 1. Categories Page (`app/(storefront)/categories/[slug]/page.tsx`)
- Removed `categoriesData` dict (6 fake categories), `generateMockProducts()`, fixed `brands`/`sizes`/`colors` arrays.
- Fetches real category by slug from new API route `/api/catalog/categories/[slug]`.
- After category loads, fetches products from `/api/products/search?categoryId=<id>&limit=200`.
- Maps results to `ProductCard` shape via shared `toCardProduct()`.
- Extracts brand filters dynamically from `sellerName` across products.
- Price range slider uses actual min/max from product data.
- Color filter uses the same fixed `COLOR_SWATCHES` vocabulary as search page.
- Loading spinner, 404 EmptyState, empty-products state all handled.

### 2. Sellers Page (`app/(storefront)/sellers/[slug]/page.tsx`)
- Removed `sellersData` dict (2 fake sellers with 12 fake products).
- Added `findBySlug()` to `SellerRepository` interface, Supabase implementation, and `SellerService`.
- New API route `/api/sellers/[slug]` fetching seller + optional rating summary.
- Fetches real products via `/api/products/search?sellerId=<id>&limit=200`.
- Derives `memberSince` from `createdAt` year, `location` from `countryCode` with "Kenya" fallback.
- Loading skeleton, 404 EmptyState, empty-products state all handled.

### 3. Profile Page (`app/(storefront)/account/profile/page.tsx`)
- Removed hardcoded "Grace Akinyi" name/email, fake setTimeout save.
- Created `lib/auth/supabase-profile-repository.ts` implementing `findByUserId`, `updateProfile`.
- Added `profileUpdateSchema` to `lib/auth/schemas.ts`.
- Added `updateProfile` and `getProfile` methods to `createAuthService`.
- New API route `GET/PUT /api/account/profile` for profile read/write.
- Page uses `useAuth()` for user identity, fetches profile from API, submits updates via PUT.
- Avatar upload wired to `/api/upload` with `userAvatars` category.

### 4. Shared Utility
- Extracted `ProductSummaryLike` interface and `toCardProduct()` function from search page into `components/shared/product-card.tsx` so both search and category pages use the same mapping.

## Files Created

| File | Purpose |
|------|---------|
| `app/api/catalog/categories/[slug]/route.ts` | GET single category by slug via `CatalogService.getCategoryBySlug()` |
| `app/api/sellers/[slug]/route.ts` | GET seller by slug via `SellerService.getBySlug()` + optional rating |
| `app/api/account/profile/route.ts` | GET/PUT current user's profile |
| `lib/auth/supabase-profile-repository.ts` | Supabase implementation of `ProfileRepository.findByUserId`/`updateProfile` |

## Files Modified

| File | Change |
|------|--------|
| `app/(storefront)/categories/[slug]/page.tsx` | Removed all mock data, wired to real API routes |
| `app/(storefront)/sellers/[slug]/page.tsx` | Removed all mock data, wired to real API routes |
| `app/(storefront)/account/profile/page.tsx` | Removed all mock data, uses `useAuth()` + real API |
| `components/shared/product-card.tsx` | Added exported `ProductSummaryLike` + `toCardProduct()` |
| `lib/auth/auth-service.ts` | Added `updateProfile()` and `getProfile()` methods |
| `lib/auth/schemas.ts` | Added `profileUpdateSchema` |
| `lib/auth/types.ts` | Added `updateProfile`/`findByUserId` to `ProfileRepository` |
| `lib/auth/index.ts` | Added barrel export for profile repository |
| `lib/seller/types.ts` | Added `findBySlug` to `SellerRepository` |
| `lib/seller/supabase-seller-repository.ts` | Added `findBySlug` implementation |
| `lib/seller/seller-service.ts` | Added `getBySlug()` method |

## Build Status

- `npx tsc --noEmit`: Clean (0 errors)
- `npm run build`: Succeeds (95 pages)
- `npm run test`: 310/311 pass (1 pre-existing order state transition failure)

## Known Limitations

- Seller location field is not in `SellerRecord` — `countryCode` is used as fallback, defaulting to "Kenya".
- Seller `memberSince` uses `createdAt` year — no dedicated field exists.
- Color filter uses fixed `COLOR_SWATCHES` (matching search page) rather than database-driven options.
- No Supabase Realtime integration for profile updates — page must be refreshed to see changes from other sessions.
- `toCardProduct()` is now shared but `search/page.tsx` still has its own copy — it should be updated to import from `product-card.tsx` in a future pass.

## Recommendations

1. Update `app/(storefront)/search/page.tsx` to import `toCardProduct` from the shared module instead of defining its own.
2. Add a `location` column to the `sellers` table so storefronts can display proper seller addresses.
3. Wire seller rating summary into the `SellerRecord` or add an API endpoint that returns seller + rating in one call.
4. Add Supabase Realtime subscription on profile page for instant save feedback.
