# Table List

## Identity and Access

| Table | Purpose | Primary Owner Path |
|---|---|---|
| `profiles` | Application profile for a Supabase Auth user. | `id` references `auth.users.id` |
| `user_roles` | Role assignments for buyer, seller, admin, moderator, and service access. | `user_id` |

## Geography

| Table | Purpose | Primary Owner Path |
|---|---|---|
| `countries` | Active marketplace countries and default currencies. | Platform |

## Seller Platform

| Table | Purpose | Primary Owner Path |
|---|---|---|
| `sellers` | Seller stores, status, KYC status, and store metadata. | `owner_id` |
| `seller_members` | Users who can manage a seller account. | `seller_id`, `user_id` |
| `kyc_verifications` | KYC submissions and provider references. | `seller_id` |
| `store_followers` | Buyer follows for seller stores. | `seller_id`, `user_id` |

## Catalog

| Table | Purpose | Primary Owner Path |
|---|---|---|
| `categories` | Hierarchical product categories. | Platform |
| `brands` | Brand directory and verification state. | Platform |
| `products` | Seller product listings. | `seller_id` |
| `product_images` | Product and variant image metadata. | `product_id` |
| `product_variants` | SKU-level product variants. | `product_id` |
| `inventory_items` | Product or variant stock state. | `product_id`, `variant_id` |
| `product_attributes` | Searchable and displayable product properties. | `product_id` |
| `collections` | Seller or platform product groupings. | `seller_id` or platform |
| `collection_products` | Products assigned to collections. | `collection_id`, `product_id` |

## Buyer Commerce

| Table | Purpose | Primary Owner Path |
|---|---|---|
| `addresses` | Buyer shipping and billing addresses. | `user_id` |
| `wishlists` | Buyer wishlist containers. | `user_id` |
| `wishlist_items` | Products saved to wishlists. | `wishlist_id` |
| `carts` | Authenticated or anonymous cart containers. | `user_id` or `anonymous_id` |
| `cart_items` | Items currently in carts. | `cart_id` |

## Orders and Trust

| Table | Purpose | Primary Owner Path |
|---|---|---|
| `orders` | Seller-scoped order header and totals. | `buyer_id`, `seller_id` |
| `order_items` | Snapshot of purchased products and prices. | `order_id`, `seller_id` |
| `reviews` | Product and seller ratings/reviews. | `buyer_id`, `seller_id`, `product_id` |

## Messaging and Notifications

| Table | Purpose | Primary Owner Path |
|---|---|---|
| `conversations` | Buyer-seller message threads. | `buyer_id`, `seller_id` |
| `messages` | Conversation messages. | `conversation_id`, `sender_id` |
| `notifications` | User-facing notifications. | `user_id` |

## Moderation and Operations

| Table | Purpose | Primary Owner Path |
|---|---|---|
| `reports` | User reports against marketplace entities. | `reporter_id`, staff |
| `audit_logs` | Staff and sensitive mutation audit trail. | Staff |
| `activity_logs` | User and platform activity history. | `user_id` |
| `feature_flags` | Runtime feature rollout controls. | Staff |
| `analytics_events` | Append-only product and platform events. | `user_id` or `anonymous_id` |

## Shipping, Promotions, and Content

| Table | Purpose | Primary Owner Path |
|---|---|---|
| `shipping_profiles` | Seller shipping configuration groups. | `seller_id` |
| `shipping_zones` | Rates and countries for a shipping profile. | `shipping_profile_id` |
| `coupons` | Seller or platform coupon codes. | `seller_id` or platform |
| `promotions` | Seller or platform promotion rules. | `seller_id` or platform |
| `banners` | Merchandising banner content. | Staff |
| `cms_pages` | CMS-managed static pages. | Staff |
| `faqs` | Frequently asked questions. | Staff |
| `contact_requests` | Public and authenticated support requests. | `user_id` or staff |

## Views

| View | Purpose |
|---|---|
| `product_catalog` | Public catalog read model for active products and active sellers. |
| `seller_storefronts` | Public seller storefront read model for active sellers. |
