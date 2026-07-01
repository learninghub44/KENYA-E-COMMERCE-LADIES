# Index Strategy

## Goals

Indexes must support high-scale marketplace access patterns while avoiding unnecessary write overhead.

Every migration that adds a filterable, sortable, join-heavy, or uniqueness-critical column should add the corresponding index in the same migration.

## Required Index Classes

| Pattern | Index Type | Examples |
|---|---|---|
| Primary key lookup | B-tree primary key | `products.id`, `orders.id` |
| Foreign key joins | B-tree | `products.seller_id`, `messages.conversation_id` |
| User-owned lists | Composite B-tree | `(user_id, created_at desc)` |
| Seller dashboards | Composite B-tree | `(seller_id, status, created_at desc)` |
| Public catalog filters | Composite B-tree | `(category_id, status, created_at desc)` |
| Full-text product search | GIN | `products.search_vector` |
| JSONB exploration after proven need | GIN | `metadata`, `properties`, `rules` |

## Cursor Pagination

Unbounded list endpoints must use cursor pagination. Indexes should match the cursor sort:

- Products: `created_at desc`, with category/seller/status filters.
- Orders: `created_at desc`, scoped by buyer or seller.
- Messages: `created_at desc`, scoped by conversation.
- Notifications: `created_at desc`, scoped by user and status.
- Analytics events: `occurred_at desc`, scoped by event name or entity.

## Unique Indexes and Constraints

Use unique constraints or unique indexes for:

- `profiles.email`
- `sellers.slug`
- `categories.slug`
- `brands.slug`
- `(products.seller_id, products.slug)`
- `(product_variants.product_id, product_variants.sku)`
- `orders.order_number`
- `coupons.code`
- `cms_pages.slug`

## Avoiding Over-Indexing

Do not add indexes for:

- Columns that are not used in joins, filters, ordering, or uniqueness checks.
- Low-cardinality boolean columns alone.
- JSONB fields before a real query pattern exists.

## Review Rule

Every new table review should ask:

1. What are the top three reads?
2. What are the top three writes?
3. Which columns appear in `where`, `join`, and `order by` clauses?
4. Which list endpoints can grow without bound?
