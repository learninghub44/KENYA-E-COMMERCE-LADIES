# Reviews, Ratings, and Trust

## Review Lifecycle

Product reviews are allowed only after a buyer owns a completed order item. The review service asks the orders boundary for a completed order item, checks that no active review already exists for that order item, validates media, then creates a published verified-purchase review.

Owners may edit or soft-delete during the configurable edit window, defaulting to 72 hours. Moderators can move reviews between `pending`, `published`, `hidden`, and `removed`.

## Verified Purchase Enforcement

`ReviewEligibilityRepository.findCompletedOrderItem` is the application contract for product reviews. It must return a completed order item owned by the buyer and containing the product/seller being reviewed. The database also enforces one active product review per `order_item_id`.

Seller reviews use `buyerCompletedOrder` and one active `(order_id, seller_id, buyer_id)` review.

## Cloudinary Media

Review media accepts images only:

- MIME types: JPEG, PNG, WebP, GIF
- Default max images: 8
- Default max file size: 5 MB
- Ordered by stable `position`
- Soft deletion via `deleted_at`

The service stores Cloudinary `publicId` and `secureUrl`; upload signing remains a provider concern outside the reviews module.

## Rating Engine

`rating_summaries` stores cached aggregates for `product` and `seller` entities:

- `average_rating`
- `total_reviews`
- `verified_reviews`
- `rating_distribution`
- `score`

Supabase triggers call `recompute_rating_summary` after review create, update, delete, and moderation status changes. Only published, non-deleted reviews contribute to aggregates.

## Moderation Flow

Users report reviews through `reportReview` with reasons: spam, offensive content, abuse, fake review, copyright, or other. Reports are stored in `review_reports`; product and seller reviews increment their report counters.

Moderation uses `lib/trust/createTrustService`. Actors must have `admin.moderate`, and every status change writes an audit record.

## API Reference

The service-first contract maps to these REST endpoints when route handlers are added:

- `POST /api/v1/reviews/product` creates a verified product review.
- `PATCH /api/v1/reviews/product/{reviewId}` edits within the owner edit window.
- `DELETE /api/v1/reviews/product/{reviewId}` soft-deletes within the owner edit window.
- `POST /api/v1/reviews/{reviewType}/{reviewId}/helpful-votes` marks helpful.
- `DELETE /api/v1/reviews/{reviewType}/{reviewId}/helpful-votes` removes the vote.
- `POST /api/v1/reviews/{reviewType}/{reviewId}/reports` reports a review.
- `GET /api/v1/products/{productId}/reviews` lists product reviews with cursor pagination.
- `GET /api/v1/sellers/{sellerId}/reviews` lists seller reviews with cursor pagination.
- `GET /api/v1/ratings/{entityType}/{entityId}` returns rating summaries.
- `PATCH /api/v1/moderation/reviews/{reviewType}/{reviewId}` updates review visibility.

List filters support rating, verified-only, with-images, most recent, most helpful, lowest rating, highest rating, cursor, and limit.

## Database Schema

Agent 09 adds:

- `product_reviews`
- `seller_reviews`
- `review_media`
- `review_helpful_votes`
- `review_reports`
- `rating_summaries`
- `published_product_reviews`
- `published_seller_reviews`

Migration `202607020006_reviews_ratings_trust.sql` is idempotent and safe to rerun on fresh or existing Supabase databases.

## Future AI Hooks

Future agents can add AI summarization by consuming published review rows and writing summaries to a separate table keyed by product or seller. Do not overload `rating_summaries`; it is intentionally numeric and deterministic.
