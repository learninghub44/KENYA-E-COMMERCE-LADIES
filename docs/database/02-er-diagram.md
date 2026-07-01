# ER Diagram

This conceptual ER diagram groups the primary database entities and ownership paths.

```mermaid
erDiagram
  AUTH_USERS ||--|| PROFILES : "has"
  PROFILES ||--o{ USER_ROLES : "assigned"
  PROFILES ||--o{ ADDRESSES : "owns"
  PROFILES ||--o{ WISHLISTS : "owns"
  PROFILES ||--o{ CARTS : "owns"
  PROFILES ||--o{ ORDERS : "places"
  PROFILES ||--o{ REVIEWS : "writes"
  PROFILES ||--o{ NOTIFICATIONS : "receives"
  PROFILES ||--o{ REPORTS : "submits"
  PROFILES ||--o{ ACTIVITY_LOGS : "generates"
  PROFILES ||--o{ ANALYTICS_EVENTS : "emits"

  PROFILES ||--o{ SELLERS : "owns"
  SELLERS ||--o{ SELLER_MEMBERS : "has"
  PROFILES ||--o{ SELLER_MEMBERS : "belongs_to"
  SELLERS ||--o{ KYC_VERIFICATIONS : "submits"
  SELLERS ||--o{ STORE_FOLLOWERS : "followed_by"
  PROFILES ||--o{ STORE_FOLLOWERS : "follows"

  CATEGORIES ||--o{ CATEGORIES : "parents"
  CATEGORIES ||--o{ PRODUCTS : "classifies"
  BRANDS ||--o{ PRODUCTS : "labels"
  SELLERS ||--o{ PRODUCTS : "lists"
  PRODUCTS ||--o{ PRODUCT_IMAGES : "has"
  PRODUCTS ||--o{ PRODUCT_VARIANTS : "has"
  PRODUCT_VARIANTS ||--o{ PRODUCT_IMAGES : "may_have"
  PRODUCTS ||--o{ INVENTORY_ITEMS : "tracked_by"
  PRODUCT_VARIANTS ||--o{ INVENTORY_ITEMS : "tracked_by"
  PRODUCTS ||--o{ PRODUCT_ATTRIBUTES : "described_by"

  SELLERS ||--o{ COLLECTIONS : "curates"
  COLLECTIONS ||--o{ COLLECTION_PRODUCTS : "contains"
  PRODUCTS ||--o{ COLLECTION_PRODUCTS : "included_in"

  WISHLISTS ||--o{ WISHLIST_ITEMS : "contains"
  PRODUCTS ||--o{ WISHLIST_ITEMS : "saved"
  CARTS ||--o{ CART_ITEMS : "contains"
  PRODUCTS ||--o{ CART_ITEMS : "selected"
  PRODUCT_VARIANTS ||--o{ CART_ITEMS : "selected"

  SELLERS ||--o{ ORDERS : "fulfills"
  ORDERS ||--o{ ORDER_ITEMS : "contains"
  PRODUCTS ||--o{ ORDER_ITEMS : "snapshot_from"
  PRODUCT_VARIANTS ||--o{ ORDER_ITEMS : "snapshot_from"
  ORDER_ITEMS ||--o{ REVIEWS : "may_generate"

  PROFILES ||--o{ CONVERSATIONS : "buyer"
  SELLERS ||--o{ CONVERSATIONS : "seller"
  ORDERS ||--o{ CONVERSATIONS : "may_contextualize"
  CONVERSATIONS ||--o{ MESSAGES : "contains"
  PROFILES ||--o{ MESSAGES : "sends"

  SELLERS ||--o{ SHIPPING_PROFILES : "defines"
  SHIPPING_PROFILES ||--o{ SHIPPING_ZONES : "contains"
  SELLERS ||--o{ COUPONS : "offers"
  SELLERS ||--o{ PROMOTIONS : "runs"

  AUDIT_LOGS }o--|| PROFILES : "actor"
```

## Notes

- `AUTH_USERS` represents Supabase-managed `auth.users`; it is not owned by application migrations.
- Order items preserve product snapshots so historical orders survive product edits.
- Reviews attach to products, sellers, buyers, and optionally order items.
- Conversations are between one buyer and one seller, optionally associated with an order.
