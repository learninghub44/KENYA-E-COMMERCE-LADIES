# Search, Discovery, and Recommendation Hooks

## Search Architecture

Agent 10 introduces a dedicated search domain under `lib/search`. The application-facing service validates input, applies pagination caps, and delegates to `ProductSearchRepository`. This keeps route handlers independent from the concrete search backend.

The production database migration adds `product_search_documents`, a denormalized table built from products, sellers, brands, categories, inventory, variants, attributes, and Agent 9 rating summaries.

## Ranking Strategy

Default relevance weights:

- Product name: highest weight
- Brand, category, seller, and SKU: strong weight
- Tags: medium weight
- Description: supporting weight

The local ranking helper includes one-edit typo tolerance for practical misspellings. Production PostgreSQL search is prepared with weighted `tsvector` and trigram indexes.

## Filters And Sorting

Filters support category, brand, price range, seller, rating, availability, condition, color, size, material, discount, new arrivals, verified seller, and in-stock-only.

Sorting supports relevance, newest, lowest price, highest price, highest rated, most reviewed, best selling, and trending. Best-selling and trending fields are present as hooks and can be fed by future order/analytics jobs.

## Autocomplete

Autocomplete combines:

- Product suggestions
- Category suggestions
- Brand suggestions
- Seller suggestions
- Recent user searches
- Popular searches from `popular_search_terms`

Recent searches are private per user. Popular terms are aggregate-only and public.

## User Search State

`search_history` stores per-user query history. Users can list, delete one entry, or clear their own history.

`saved_searches` stores named search definitions. Users can save, rename, delete, and rerun their own searches.

RLS policies enforce `user_id = auth.uid()` for all personal search-state mutations.

## Discovery Architecture

`lib/discovery` exposes featured, trending, new arrivals, recently viewed, similar products, related products, and popular categories. Recently viewed is stored in `recently_viewed_products`; other rails are repository-backed so implementations can use product search documents and rating summaries without changing callers.

## API Reference

Service contracts map to these future REST routes:

- `GET /api/v1/search`
- `GET /api/v1/search/autocomplete`
- `GET /api/v1/search/history`
- `DELETE /api/v1/search/history/{entryId}`
- `DELETE /api/v1/search/history`
- `POST /api/v1/search/saved`
- `GET /api/v1/search/saved`
- `PATCH /api/v1/search/saved/{savedSearchId}`
- `DELETE /api/v1/search/saved/{savedSearchId}`
- `POST /api/v1/search/saved/{savedSearchId}/rerun`
- `GET /api/v1/discovery/featured`
- `GET /api/v1/discovery/trending`
- `GET /api/v1/discovery/new-arrivals`
- `GET /api/v1/discovery/recently-viewed`
- `POST /api/v1/discovery/recently-viewed`
- `GET /api/v1/discovery/products/{productId}/similar`
- `GET /api/v1/discovery/products/{productId}/related`
- `GET /api/v1/discovery/popular-categories`

## Future AI Integration

Future AI systems should implement `RecommendationProvider` from `lib/recommendations`. The current empty provider is deliberate; it keeps API shape stable without shipping opaque ranking, personalization, or behavioral inference in Agent 10.
