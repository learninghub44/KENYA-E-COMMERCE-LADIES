import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { createSellerAnalyticsService, formatDate, getDateRange } from './service.js';
import { success, error, ErrorCodes } from './analytics-service.js';

// ============================================================================
// DATE RANGE UTILITIES TESTS
// ============================================================================

describe('Date Range Utilities', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date(2024, 0, 15); // January 15, 2024
      const result = formatDate(date);
      assert.strictEqual(result, '2024-01-15');
    });

    it('should format date with single digit month', () => {
      const date = new Date(2024, 8, 5); // September 5, 2024
      const result = formatDate(date);
      assert.strictEqual(result, '2024-09-05');
    });

    it('should format date with single digit day', () => {
      const date = new Date(2024, 5, 1); // June 1, 2024
      const result = formatDate(date);
      assert.strictEqual(result, '2024-06-01');
    });
  });

  describe('getDateRange', () => {
    it('should return today range', () => {
      const result = getDateRange('today');
      assert.strictEqual(result.startDate, result.endDate);
      // Should be today's date
      const today = new Date();
      const todayStr = formatDate(today);
      assert.strictEqual(result.startDate, todayStr);
    });

    it('should return yesterday range', () => {
      const result = getDateRange('yesterday');
      assert.strictEqual(result.startDate, result.endDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDate(yesterday);
      assert.strictEqual(result.startDate, yesterdayStr);
    });

    it('should return last 7 days range', () => {
      const result = getDateRange('last_7_days');
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      const sevenDaysAgoStr = formatDate(sevenDaysAgo);
      assert.strictEqual(result.startDate, sevenDaysAgoStr);
    });

    it('should return last 30 days range', () => {
      const result = getDateRange('last_30_days');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
      const thirtyDaysAgoStr = formatDate(thirtyDaysAgo);
      assert.strictEqual(result.startDate, thirtyDaysAgoStr);
    });

    it('should return last 90 days range', () => {
      const result = getDateRange('last_90_days');
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);
      const ninetyDaysAgoStr = formatDate(ninetyDaysAgo);
      assert.strictEqual(result.startDate, ninetyDaysAgoStr);
    });

    it('should return last year range', () => {
      const result = getDateRange('last_year');
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const oneYearAgoStr = formatDate(oneYearAgo);
      assert.strictEqual(result.startDate, oneYearAgoStr);
    });

    it('should return custom range', () => {
      const customRange = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };
      const result = getDateRange('custom', customRange);
      assert.strictEqual(result.startDate, '2024-01-01');
      assert.strictEqual(result.endDate, '2024-01-31');
    });

    it('should throw error for custom range without dates', () => {
      assert.throws(() => {
        getDateRange('custom');
      });
    });

    it('should default to.last_30_days for unknown range', () => {
      const result = getDateRange('unknown');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
      const thirtyDaysAgoStr = formatDate(thirtyDaysAgo);
      assert.strictEqual(result.startDate, thirtyDaysAgoStr);
    });
  });
});

// ============================================================================
// SERVICE TESTS
// ============================================================================

describe('Seller Analytics Service', () => {
  const sellerId = '123e4567-e89b-12d3-a456-426614174000';
  const otherSellerId = '123e4567-e89b-12d3-a456-426614174001';

  const mockAnalyticsRepository = {
    getDashboard: mock.fn(async () => ({
      overview: {
        totalOrders: 100,
        completedOrders: 80,
        pendingOrders: 15,
        cancelledOrders: 5,
        grossRevenueMinor: 50000,
        netRevenueMinor: 45000,
        refundsMinor: 5000,
        customersNew: 20,
        customersReturning: 30,
      },
      products: {
        totalProducts: 50,
        activeProducts: 40,
        draftProducts: 5,
        outOfStock: 3,
        lowStock: 2,
      },
      inventory: {
        inventoryValueMinor: 10000,
        lowStockCount: 5,
        outOfStockCount: 2,
      },
      dailyMetrics: [],
    })),
    getRevenueAnalytics: mock.fn(async () => []),
    getProductAnalytics: mock.fn(async () => []),
    getCustomerAnalytics: mock.fn(async () => []),
    getInventoryAnalytics: mock.fn(async () => ({
      inventoryValueMinor: 10000,
      lowStockCount: 5,
      outOfStockCount: 2,
    })),
    calculateDailyMetrics: mock.fn(async () => {}),
    refreshOverviewSummary: mock.fn(async () => {}),
  };

  const mockPermissionChecker = {
    canViewSellerAnalytics: mock.fn(async () => true),
  };

  const mockRatingRepository = {
    getProductRating: async (_productId: string) => null,
    getSellerRating: async (_sellerId: string) => null,
  };

  const mockSearchRepository = {
    getSearchAnalytics: async (_sellerId: string, _startDate: string, _endDate: string) => ({
      productImpressions: 0,
      searchClicks: 0,
      searchCTR: 0,
      popularSearchTerms: [],
    }),
  };

  const service = createSellerAnalyticsService({
    analyticsRepository: mockAnalyticsRepository as any,
    permissionChecker: mockPermissionChecker as any,
    ratingRepository: mockRatingRepository,
    searchRepository: mockSearchRepository,
  });

  describe('getDashboard', () => {
    it('should return dashboard data with valid request', async () => {
      const result = await service.getDashboard('user-123', {
        sellerId,
        dateRange: 'last_30_days',
      });

      assert.strictEqual(result.ok, true);
      if (result.ok) {
        assert.strictEqual(result.data.overview.totalOrders, 100);
      }
    });

    it('should return error for invalid request', async () => {
      const result = await service.getDashboard('user-123', {
        sellerId: 'invalid-uuid',
      });

      assert.strictEqual(result.ok, false);
      if (!result.ok) {
        assert.strictEqual(result.code, ErrorCodes.INVALID_INPUT);
      }
    });

    it('should return forbidden when permission denied', async () => {
      mockPermissionChecker.canViewSellerAnalytics.mock.mockImplementationOnce(async () => false);
      
      const result = await service.getDashboard('user-123', {
        sellerId: otherSellerId,
        dateRange: 'last_30_days',
      });

      assert.strictEqual(result.ok, false);
      if (!result.ok) {
        assert.strictEqual(result.code, ErrorCodes.FORBIDDEN);
      }
    });
  });

  describe('getRevenueAnalytics', () => {
    it('should return revenue analytics with valid request', async () => {
      const result = await service.getRevenueAnalytics('user-123', {
        sellerId,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        groupBy: 'day',
      });

      assert.strictEqual(result.ok, true);
    });

    it('should return error for invalid request', async () => {
      const result = await service.getRevenueAnalytics('user-123', {
        sellerId: 'invalid-uuid',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      assert.strictEqual(result.ok, false);
    });
  });

  describe('getProductAnalytics', () => {
    it('should return product analytics with valid request', async () => {
      const result = await service.getProductAnalytics('user-123', {
        sellerId,
        limit: 50,
      });

      assert.strictEqual(result.ok, true);
    });

    it('should use default limit', async () => {
      const result = await service.getProductAnalytics('user-123', {
        sellerId,
      });

      assert.strictEqual(result.ok, true);
    });
  });

  describe('getCustomerAnalytics', () => {
    it('should return customer analytics with valid request', async () => {
      const result = await service.getCustomerAnalytics('user-123', {
        sellerId,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        limit: 50,
      });

      assert.strictEqual(result.ok, true);
    });
  });

  describe('getInventoryAnalytics', () => {
    it('should return inventory analytics with valid request', async () => {
      const result = await service.getInventoryAnalytics('user-123', sellerId);

      assert.strictEqual(result.ok, true);
      if (result.ok) {
        assert.strictEqual(result.data.inventoryValueMinor, 10000);
      }
    });

    it('should return forbidden when permission denied', async () => {
      mockPermissionChecker.canViewSellerAnalytics.mock.mockImplementationOnce(async () => false);
      
      const result = await service.getInventoryAnalytics('user-123', otherSellerId);

      assert.strictEqual(result.ok, false);
      if (!result.ok) {
        assert.strictEqual(result.code, ErrorCodes.FORBIDDEN);
      }
    });
  });

  describe('getRatingAnalytics', () => {
    it('should return not found when no rating data', async () => {
      const result = await service.getRatingAnalytics('user-123', sellerId);

      assert.strictEqual(result.ok, false);
      if (!result.ok) {
        assert.strictEqual(result.code, ErrorCodes.NOT_FOUND);
      }
    });

    it('should return error when repository not available', async () => {
      const serviceWithoutRating = createSellerAnalyticsService({
        analyticsRepository: mockAnalyticsRepository as any,
        permissionChecker: mockPermissionChecker as any,
      });

      const result = await serviceWithoutRating.getRatingAnalytics('user-123', sellerId);

      assert.strictEqual(result.ok, false);
      if (!result.ok) {
        assert.strictEqual(result.code, ErrorCodes.INTERNAL_ERROR);
      }
    });
  });

  describe('getSearchAnalytics', () => {
    it('should return search analytics when repository available', async () => {
      const result = await service.getSearchAnalytics('user-123', sellerId, '2024-01-01', '2024-01-31');

      assert.strictEqual(result.ok, true);
    });

    it('should return error when repository not available', async () => {
      const serviceWithoutSearch = createSellerAnalyticsService({
        analyticsRepository: mockAnalyticsRepository,
        permissionChecker: mockPermissionChecker,
      });

      const result = await serviceWithoutSearch.getSearchAnalytics('user-123', sellerId, '2024-01-01', '2024-01-31');

      assert.strictEqual(result.ok, false);
      if (!result.ok) {
        assert.strictEqual(result.code, ErrorCodes.INTERNAL_ERROR);
      }
    });
  });

  describe('calculateDailyMetrics', () => {
    it('should calculate daily metrics successfully', async () => {
      const result = await service.calculateDailyMetrics(sellerId, '2024-01-01');

      assert.strictEqual(result.ok, true);
    });
  });

  describe('refreshOverviewSummary', () => {
    it('should refresh overview summary successfully', async () => {
      const result = await service.refreshOverviewSummary();

      assert.strictEqual(result.ok, true);
    });
  });
});
