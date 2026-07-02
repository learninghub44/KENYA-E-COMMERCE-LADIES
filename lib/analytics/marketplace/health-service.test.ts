import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateMarketplaceHealthScore } from "./health-service";

describe("marketplace health score", () => {
  it("calculates a healthy score with good metrics", () => {
    const result = calculateMarketplaceHealthScore({
      activeSellers: 50,
      totalActiveSellers: 50,
      activeProducts: 90,
      totalReviewedProducts: 100,
      revenueMinor: 5_000_000,
      prevRevenueMinor: 4_000_000,
      newBuyers: 100,
      activeBuyers: 500,
      avgRating: 4.5,
      totalSearches: 1000,
      zeroResultSearches: 50,
      stockedItems: 800,
      totalInventoryItems: 1000,
    });

    assert.equal(result.maxScore, 100);
    assert.ok(result.score >= 80, `Expected score >= 80, got ${result.score}`);
    assert.equal(result.status, "healthy");
    assert.ok(result.components.sellerActivity.score > 0);
    assert.ok(result.components.averageRatings.score > 0);
  });

  it("calculates a critical score with poor metrics", () => {
    const result = calculateMarketplaceHealthScore({
      activeSellers: 0,
      totalActiveSellers: 50,
      activeProducts: 0,
      totalReviewedProducts: 100,
      revenueMinor: 0,
      prevRevenueMinor: 4_000_000,
      newBuyers: 0,
      activeBuyers: 500,
      avgRating: 1.0,
      totalSearches: 100,
      zeroResultSearches: 90,
      stockedItems: 0,
      totalInventoryItems: 1000,
    });

    assert.ok(result.score < 50, `Expected score < 50, got ${result.score}`);
    assert.equal(result.status, "critical");
  });

  it("returns moderate for middling metrics", () => {
    const result = calculateMarketplaceHealthScore({
      activeSellers: 25,
      totalActiveSellers: 50,
      activeProducts: 50,
      totalReviewedProducts: 100,
      revenueMinor: 4_000_000,
      prevRevenueMinor: 4_000_000,
      newBuyers: 50,
      activeBuyers: 500,
      avgRating: 3.0,
      totalSearches: 500,
      zeroResultSearches: 100,
      stockedItems: 500,
      totalInventoryItems: 1000,
    });

    assert.ok(result.score >= 50 && result.score < 80, `Expected 50 <= score < 80, got ${result.score}`);
    assert.equal(result.status, "moderate");
  });

  it("accepts custom weights", () => {
    const stockResult = calculateMarketplaceHealthScore(
      {
        activeSellers: 50,
        totalActiveSellers: 50,
        activeProducts: 90,
        totalReviewedProducts: 100,
        revenueMinor: 5_000_000,
        prevRevenueMinor: 4_000_000,
        newBuyers: 100,
        activeBuyers: 500,
        avgRating: 4.5,
        totalSearches: 1000,
        zeroResultSearches: 50,
        stockedItems: 0,
        totalInventoryItems: 1000,
      },
      { weights: { inventoryHealth: 0 } },
    );

    assert.equal(stockResult.components.inventoryHealth.maxScore, 0);
    assert.equal(stockResult.components.inventoryHealth.score, 0);
  });
});
