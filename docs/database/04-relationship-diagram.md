# Relationship Diagram

This diagram emphasizes access paths and module boundaries rather than every column.

```mermaid
flowchart LR
  auth["Supabase Auth users"]
  profiles["profiles"]
  roles["user_roles"]

  sellers["sellers"]
  sellerMembers["seller_members"]
  kyc["kyc_verifications"]

  catalog["catalog core\ncategories, brands, products"]
  productDetail["product detail\nimages, variants, inventory, attributes"]
  collections["collections\ncollection_products"]

  buyerData["buyer data\naddresses, wishlists, carts"]
  orders["orders\norder_items"]
  reviews["reviews"]

  messaging["conversations\nmessages"]
  notify["notifications"]
  moderation["reports"]

  ops["audit_logs\nactivity_logs\nfeature_flags"]
  analytics["analytics_events"]
  shipping["shipping_profiles\nshipping_zones"]
  promo["coupons\npromotions"]
  content["banners\ncms_pages\nfaqs\ncontact_requests"]

  auth --> profiles
  profiles --> roles
  profiles --> sellers
  profiles --> sellerMembers
  sellers --> sellerMembers
  sellers --> kyc

  sellers --> catalog
  catalog --> productDetail
  sellers --> collections
  catalog --> collections

  profiles --> buyerData
  buyerData --> orders
  sellers --> orders
  orders --> reviews
  catalog --> reviews

  profiles --> messaging
  sellers --> messaging
  orders --> messaging
  profiles --> notify
  profiles --> moderation

  sellers --> shipping
  sellers --> promo
  profiles --> analytics
  profiles --> ops
  content --> ops
```

## Access Pattern Summary

| Access Pattern | Relationship Path |
|---|---|
| Buyer reads own orders | `profiles.id -> orders.buyer_id` |
| Seller manages products | `profiles.id -> seller_members.user_id -> products.seller_id` or `profiles.id -> sellers.owner_id` |
| Buyer messages seller | `profiles.id -> conversations.buyer_id -> messages.conversation_id` |
| Seller reads conversation | `seller_members.seller_id -> conversations.seller_id` |
| Public product browsing | `product_catalog` view over active `products` and active `sellers` |
| Staff moderation | `user_roles.role in ('admin', 'moderator')` |
