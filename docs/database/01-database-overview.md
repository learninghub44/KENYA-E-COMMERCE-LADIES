# Database Overview

## Purpose

The marketplace database is the system of record for buyers, sellers, products, orders, messages, operational content, moderation, analytics events, and database-enforced authorization.

The database must support:

- 1,000,000+ users.
- 100,000+ verified sellers.
- 20,000,000+ products.
- Millions of orders, messages, notifications, and analytics events.
- Future mobile applications.
- Future AI, fraud, search ranking, and recommendation features.
- Multi-country and multi-currency expansion.

## Platform

The platform uses Supabase Postgres with Row Level Security as the primary authorization boundary.

Supabase Auth owns credentials and sessions. The application database stores profiles, roles, seller records, and domain data that reference `auth.users`.

## Design Principles

- Keep one shared `public` schema per Supabase environment.
- Use row-scoped multi-tenancy through `seller_id`, `buyer_id`, `user_id`, and ownership join tables.
- Use UUID primary keys for externally visible and distributed-safe identifiers.
- Store money as integer minor units plus an explicit three-letter currency code.
- Store all timestamps as `timestamptz`.
- Add RLS policies in the same migration that creates each user-facing table.
- Add indexes in the same migration as filterable and sortable columns.
- Prefer status-based lifecycle management over physical deletes for business records.
- Defer table partitioning until measured volume requires it.

## Bounded Areas

The database foundation supports these bounded areas without implementing their application behavior:

- Identity support: profiles, user roles.
- Seller platform: sellers, seller members, KYC records, followers.
- Catalog: categories, brands, products, variants, images, inventory, attributes, collections.
- Commerce: carts, wishlists, addresses, orders, order items, coupons, promotions, shipping profiles.
- Trust and community: reviews, reports, moderation status.
- Messaging: conversations, messages, notifications.
- Admin and operations: audit logs, activity logs, feature flags, banners, CMS pages, FAQs, contact requests.
- Analytics: append-only analytics events.

## Source of Truth

Application code may expose typed interfaces and API responses, but the database remains the source of truth for:

- Referential integrity.
- Tenant isolation.
- Ownership checks.
- Staff access checks.
- Data lifecycle status.
- Core constraints such as positive quantities and valid ratings.

## Non-Goals

The database foundation does not implement:

- Authentication flows.
- Seller dashboard workflows.
- Checkout orchestration.
- Payment processing.
- Search service replacement.
- Messaging UI or notification delivery.
- Admin dashboard behavior.
