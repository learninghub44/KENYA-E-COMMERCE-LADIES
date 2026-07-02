import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculateGrowthRate,
  createMarketplaceAnalyticsService,
  getMarketplaceDateWindow,
} from "./service.js";
import {
  AnalyticsDateWindow,
  BrandsAnalytics,
  CategoriesAnalytics,
  MarketplaceAnalyticsRepository,
  OrdersAnalytics,
  ProductsAnalytics,
  RevenueAnalytics,
  SellersAnalytics,
  UsersAnalytics,
} from "./types.js";

const emptyRanking = { id: "id", name: "Name", count: 1, revenueMinor: 100, growthRate: 0, revenueShare: 100 };

function createRepository(): MarketplaceAnalyticsRepository {
  const revenue: RevenueAnalytics = {
    gmvMinor: 10_000,
    marketplaceRevenueMinor: 1_000,
    commissionRevenueMinor: 1_000,
    sellerRevenueMinor: 9_000,
    averageOrderValueMinor: 2_500,
    revenueGrowth: { current: 10_000, previous: 8_000, growthRate: 25 },
  };
  const orders: OrdersAnalytics = {
    totalOrders: 4,
    completedOrders: 2,
    pendingOrders: 1,
    processingOrders: 1,
    cancelledOrders: 0,
    refundedOrders: 0,
    orderGrowth: { current: 4, previous: 2, growthRate: 100 },
    averageOrdersPerDay: 2,
    averageOrdersPerSeller: 1,
  };
  const users: UsersAnalytics = {
    totalBuyers: 20,
    activeBuyers: 10,
    newBuyers: 3,
    returningBuyers: 7,
    buyerGrowth: { current: 3, previous: 2, growthRate: 50 },
    buyerRetentionRate: 70,
    buyerAcquisitionRate: 15,
  };
  const sellers: SellersAnalytics = {
    totalSellers: 5,
    verifiedSellers: 4,
    pendingVerification: 1,
    activeSellers: 4,
    suspendedSellers: 0,
    sellerGrowth: { current: 1, previous: 1, growthRate: 0 },
    sellerActivationRate: 80,
  };
  const products: ProductsAnalytics = {
    totalProducts: 30,
    activeProducts: 20,
    draftProducts: 4,
    pendingReviewProducts: 3,
    publishedProducts: 20,
    rejectedProducts: 3,
    outOfStockProducts: 2,
    productGrowth: { current: 5, previous: 4, growthRate: 25 },
    productApprovalRate: 87,
  };
  const categories: CategoriesAnalytics = {
    totalCategories: 2,
    mostActiveCategories: [emptyRanking],
    highestRevenueCategories: [emptyRanking],
    fastestGrowingCategories: [emptyRanking],
    categoryGrowth: { current: 2, previous: 1, growthRate: 100 },
    categoryRevenueShare: [emptyRanking],
  };
  const brands: BrandsAnalytics = {
    totalBrands: 2,
    topBrands: [emptyRanking],
    fastestGrowingBrands: [emptyRanking],
    highestRevenueBrands: [emptyRanking],
    brandGrowth: { current: 2, previous: 1, growthRate: 100 },
    brandRevenue: [emptyRanking],
  };

  return {
    getRevenueAnalytics: async () => revenue,
    getOrdersAnalytics: async () => orders,
    getUsersAnalytics: async () => users,
    getSellersAnalytics: async () => sellers,
    getProductsAnalytics: async () => products,
    getCategoriesAnalytics: async () => categories,
    getBrandsAnalytics: async () => brands,
  };
}

describe("marketplace analytics service", () => {
  it("calculates date windows and previous periods", () => {
    const window = getMarketplaceDateWindow(
      { dateRange: "last_7_days" },
      new Date("2026-07-02T12:00:00Z"),
    );

    assert.deepEqual(window, {
      startDate: "2026-06-26",
      endDate: "2026-07-02",
      previousStartDate: "2026-06-19",
      previousEndDate: "2026-06-25",
    });
  });

  it("validates custom date ranges", () => {
    assert.throws(() =>
      getMarketplaceDateWindow(
        { dateRange: "custom", startDate: "2026-07-03", endDate: "2026-07-02" },
        new Date("2026-07-02T12:00:00Z"),
      ),
    );
  });

  it("calculates growth rates with zero previous values", () => {
    assert.equal(calculateGrowthRate(10, 0), 100);
    assert.equal(calculateGrowthRate(0, 0), 0);
    assert.equal(calculateGrowthRate(75, 100), -25);
  });

  it("rejects users without admin permissions", async () => {
    const service = createMarketplaceAnalyticsService({
      repository: createRepository(),
      permissionChecker: { canViewMarketplaceAnalytics: async () => false },
    });

    const result = await service.getDashboard("user-1", { dateRange: "today" });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 403);
    }
  });

  it("builds a dashboard from real repository aggregates", async () => {
    const audited: AnalyticsDateWindow[] = [];
    const service = createMarketplaceAnalyticsService({
      repository: createRepository(),
      permissionChecker: { canViewMarketplaceAnalytics: async () => true },
      now: () => new Date("2026-07-02T10:00:00Z"),
      auditWriter: {
        async writeAnalyticsAccess(input) {
          audited.push(input.dateWindow);
        },
      },
    });

    const result = await service.getDashboard("admin-1", { dateRange: "today" });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.overview.currency, "KES");
      assert.equal(result.data.revenue.gmvMinor, 10_000);
      assert.equal(result.data.orders.totalOrders, 4);
      assert.equal(result.data.products.totalProducts, 30);
      assert.equal(audited.length, 1);
      assert.equal(audited[0]?.startDate, "2026-07-02");
    }
  });

  it("rejects malformed analytics requests", async () => {
    const service = createMarketplaceAnalyticsService({
      repository: createRepository(),
      permissionChecker: { canViewMarketplaceAnalytics: async () => true },
    });

    const result = await service.getRevenue("admin-1", { dateRange: "custom", startDate: "2026-07-01" });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 400);
    }
  });
});
