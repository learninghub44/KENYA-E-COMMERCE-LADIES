# Ratings Feature

Owns cached product and seller rating summaries.

The database trigger layer keeps `rating_summaries` synchronized after product review and seller review inserts, updates, soft deletes, and moderation status changes. Application code reads summaries through `lib/ratings/createRatingService`.

The summary shape includes average rating, total review count, verified review count, 1-5 distribution, and a ranking score for future discovery work.
