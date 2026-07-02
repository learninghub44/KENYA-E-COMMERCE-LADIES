import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createBusinessIntelligenceService } from "./service.js";
import { BusinessIntelligence, BusinessIntelligenceRepository } from "./types.js";

describe("business intelligence service", () => {
  const mockBi: BusinessIntelligence = {
    fastestGrowingCategories: [
      { id: "c1", name: "Category A", revenueMinor: 50000, growthRate: 150, orderCount: 30 },
    ],
    highestRevenueCategories: [
      { id: "c2", name: "Category B", revenueMinor: 100000, growthRate: 25, orderCount: 60 },
    ],
    highestConversionCategories: [
      { id: "c3", name: "Category C", revenueMinor: 75000, growthRate: 10, orderCount: 50, buyerCount: 100, conversionRate: 50 },
    ],
    lowestPerformingCategories: [
      { id: "c4", name: "Category D", revenueMinor: 1000, growthRate: -10, orderCount: 2 },
    ],
    bestPerformingBrands: [
      { id: "b1", name: "Brand A", revenueMinor: 200000, growthRate: 50 },
    ],
    lowestPerformingBrands: [
      { id: "b2", name: "Brand B", revenueMinor: 500, growthRate: -20 },
    ],
    fastestGrowingSellers: [
      { id: "s1", name: "Seller A", revenueMinor: 30000, growthRate: 200, orderCount: 15 },
    ],
    productGrowthTrends: {
      newProducts: 50, previousNewProducts: 30, activeProducts: 200, newActiveProducts: 40, growthRate: 66.67,
    },
    customerGrowthTrends: {
      newCustomers: 100, previousNewCustomers: 80, growthRate: 25,
    },
    revenueTrends: {
      currentRevenue: 500000, previousRevenue: 400000, growthRate: 25,
    },
  };

  function createRepo(): BusinessIntelligenceRepository {
    return {
      getBusinessIntelligence: async () => mockBi,
    };
  }

  it("returns business intelligence data for authorized users", async () => {
    const service = createBusinessIntelligenceService({
      repository: createRepo(),
      permissionChecker: { canViewMarketplaceAnalytics: async () => true },
      now: () => new Date("2026-07-02T10:00:00Z"),
    });

    const result = await service.getBusinessIntelligence("admin-1", { dateRange: "today" });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.fastestGrowingCategories.length, 1);
      assert.equal(result.data.fastestGrowingCategories[0]?.name, "Category A");
      assert.equal(result.data.bestPerformingBrands[0]?.name, "Brand A");
      assert.equal(result.data.revenueTrends.currentRevenue, 500000);
    }
  });

  it("rejects unauthorized users", async () => {
    const service = createBusinessIntelligenceService({
      repository: createRepo(),
      permissionChecker: { canViewMarketplaceAnalytics: async () => false },
    });

    const result = await service.getBusinessIntelligence("seller-1", { dateRange: "today" });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 403);
    }
  });

  it("rejects invalid date ranges", async () => {
    const service = createBusinessIntelligenceService({
      repository: createRepo(),
      permissionChecker: { canViewMarketplaceAnalytics: async () => true },
    });

    const result = await service.getBusinessIntelligence("admin-1", {
      dateRange: "custom", startDate: "2026-07-03", endDate: "2026-07-02",
    });
    assert.equal(result.ok, false);
  });
});
