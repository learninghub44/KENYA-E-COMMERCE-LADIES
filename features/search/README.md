# Search Feature

Owns global product search, filters, sorting, autocomplete, search history, and saved searches.

Primary entry points:

- `lib/search/createSearchService`
- `lib/search/createSearchHistoryService`
- `lib/search/createSavedSearchService`
- `lib/search/createInMemoryProductSearchRepository`

Production storage is prepared by `product_search_documents`, `search_history`, `saved_searches`, and `popular_search_terms`.
