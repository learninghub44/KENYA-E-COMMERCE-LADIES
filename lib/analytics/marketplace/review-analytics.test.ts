import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ReviewAnalytics } from "./types";

describe("review analytics types", () => {
  it("constructs valid review analytics", () => {
    const analytics: ReviewAnalytics = {
      reviewsSubmitted: 100,
      averageMarketplaceRating: 4.2,
      ratingDistribution: { 1: 5, 2: 10, 3: 15, 4: 30, 5: 40 },
      reviewGrowth: { current: 100, previous: 80, growthRate: 25 },
      topRatedProducts: [
        { id: "p1", name: "Product A", averageRating: 4.8, totalReviews: 50 },
      ],
      lowestRatedProducts: [
        { id: "p2", name: "Product B", averageRating: 2.0, totalReviews: 10 },
      ],
      topRatedSellers: [
        { id: "s1", name: "Seller A", averageRating: 4.9, totalReviews: 30 },
      ],
      verifiedReviewPercentage: 85,
      averageSellerRating: 4.3,
    };

    assert.equal(analytics.reviewsSubmitted, 100);
    assert.equal(analytics.ratingDistribution[5], 40);
    assert.equal(analytics.verifiedReviewPercentage, 85);
  });
});
