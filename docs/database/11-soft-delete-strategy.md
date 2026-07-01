# Soft Delete Strategy

## Principle

Business records should usually move through lifecycle statuses instead of being physically deleted. Physical deletes are reserved for temporary data, relationship cleanup, local development cleanup, and legally required erasure workflows.

## Status-Based Soft Delete

Use status fields for core business entities:

- `profiles.status`: `active`, `suspended`, `deleted`
- `sellers.status`: `draft`, `pending_kyc`, `active`, `suspended`, `closed`
- `products.status`: `draft`, `pending_review`, `active`, `rejected`, `archived`
- `orders.status`: order lifecycle states.
- `reviews.status`, `cms_pages.status`, `banners.status`, `faqs.status`: content publishing lifecycle.
- `reports.status`: moderation lifecycle.

## When Physical Deletes Are Acceptable

Physical deletes may cascade for:

- Cart items.
- Wishlist items.
- Collection assignments.
- Temporary anonymous carts.
- Product child rows when the product itself is removed in a controlled cleanup.

## When Physical Deletes Are Not Acceptable

Do not physically delete by default:

- Orders.
- Order items.
- Audit logs.
- KYC verification history.
- Messages.
- Reports.
- Financial records.

## User Erasure

For privacy erasure, prefer anonymization over deletion when records must remain for tax, fraud, dispute, or audit obligations.

Examples:

- Null or replace PII fields where legally allowed.
- Preserve order totals and timestamps.
- Preserve audit events with `actor_id` set to null when required.

## Query Rule

Public reads must explicitly filter to active or published states. Staff and owners may see broader lifecycle states according to RLS policy.
