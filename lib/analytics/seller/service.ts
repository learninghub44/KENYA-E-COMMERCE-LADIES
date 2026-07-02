import { 
  AnalyticsRepository, 
  RatingRepository, 
  SearchRepository, 
  PermissionChecker,
  Result,
  success,
  error,
  ErrorCodes,
  DashboardData,
  RevenueDataPoint,
  ProductAnalytics,
  CustomerAnalytics,
  InventoryMetrics,
  RatingAnalytics,
  SearchAnalytics,
  TimeGrouping,
  dashboardRequestSchema,
  revenueAnalyticsRequestSchema,
  productAnalyticsRequestSchema,
  customerAnalyticsRequestSchema,
  exportRequestSchema,
} from './analytics-service.js';

// ============================================================================
// DATE RANGE UTILITIES
// ============================================================================

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateRange(range: string, customRange?: { startDate: string; endDate: string }): { startDate: string; endDate: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  
  switch (range) {
    case 'today':
      return {
        startDate: formatDate(today),
        endDate: formatDate(today),
      };
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        startDate: formatDate(yesterday),
        endDate: formatDate(yesterday),
      };
    case 'last_7_days':
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      return {
        startDate: formatDate(sevenDaysAgo),
        endDate: formatDate(today),
      };
    case 'last_30_days':
      return {
        startDate: formatDate(thirtyDaysAgo),
        endDate: formatDate(today),
      };
    case 'last_90_days':
      const ninetyDaysAgo = new Date(today);
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);
      return {
        startDate: formatDate(ninetyDaysAgo),
        endDate: formatDate(today),
      };
    case 'last_year':
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return {
        startDate: formatDate(oneYearAgo),
        endDate: formatDate(today),
      };
    case 'custom':
      if (!customRange) {
        throw new Error('Custom date range requires startDate and endDate');
      }
      return {
        startDate: customRange.startDate,
        endDate: customRange.endDate,
      };
    default:
      return {
        startDate: formatDate(thirtyDaysAgo),
        endDate: formatDate(today),
      };
  }
}

// ============================================================================
// SERVICE DEPENDENCIES
// ============================================================================

export interface SellerAnalyticsServiceDependencies {
  analyticsRepository: AnalyticsRepository;
  ratingRepository?: RatingRepository;
  searchRepository?: SearchRepository;
  permissionChecker: PermissionChecker;
}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

export function createSellerAnalyticsService(deps: SellerAnalyticsServiceDependencies) {
  const { analyticsRepository, ratingRepository, searchRepository, permissionChecker } = deps;

  return {
    // Dashboard
    async getDashboard(userId: string, params: unknown): Promise<Result<DashboardData>> {
      const parsed = dashboardRequestSchema.safeParse(params);
      if (!parsed.success) {
        return error(ErrorCodes.INVALID_INPUT, 'Invalid dashboard request parameters', 400);
      }

      const { sellerId, dateRange, customDateRange } = parsed.data;

      const hasPermission = await permissionChecker.canViewSellerAnalytics(userId, sellerId);
      if (!hasPermission) {
        return error(ErrorCodes.FORBIDDEN, 'You do not have permission to view this seller analytics', 403);
      }

      const { startDate, endDate } = getDateRange(dateRange, customDateRange);

      try {
        const data = await analyticsRepository.getDashboard(sellerId, startDate, endDate);
        return success(data);
      } catch (e) {
        console.error('Error fetching dashboard:', e);
        return error(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch dashboard data', 500);
      }
    },

    // Revenue Analytics
    async getRevenueAnalytics(userId: string, params: unknown): Promise<Result<RevenueDataPoint[]>> {
      const parsed = revenueAnalyticsRequestSchema.safeParse(params);
      if (!parsed.success) {
        return error(ErrorCodes.INVALID_INPUT, 'Invalid revenue analytics request parameters', 400);
      }

      const { sellerId, startDate, endDate, groupBy } = parsed.data;

      const hasPermission = await permissionChecker.canViewSellerAnalytics(userId, sellerId);
      if (!hasPermission) {
        return error(ErrorCodes.FORBIDDEN, 'You do not have permission to view this seller analytics', 403);
      }

      try {
        const data = await analyticsRepository.getRevenueAnalytics(sellerId, startDate, endDate, groupBy);
        return success(data);
      } catch (e) {
        console.error('Error fetching revenue analytics:', e);
        return error(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch revenue analytics', 500);
      }
    },

    // Product Analytics
    async getProductAnalytics(userId: string, params: unknown): Promise<Result<ProductAnalytics[]>> {
      const parsed = productAnalyticsRequestSchema.safeParse(params);
      if (!parsed.success) {
        return error(ErrorCodes.INVALID_INPUT, 'Invalid product analytics request parameters', 400);
      }

      const { sellerId, limit } = parsed.data;

      const hasPermission = await permissionChecker.canViewSellerAnalytics(userId, sellerId);
      if (!hasPermission) {
        return error(ErrorCodes.FORBIDDEN, 'You do not have permission to view this seller analytics', 403);
      }

      try {
        const data = await analyticsRepository.getProductAnalytics(sellerId, limit);
        return success(data);
      } catch (e) {
        console.error('Error fetching product analytics:', e);
        return error(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch product analytics', 500);
      }
    },

    // Customer Analytics
    async getCustomerAnalytics(userId: string, params: unknown): Promise<Result<CustomerAnalytics[]>> {
      const parsed = customerAnalyticsRequestSchema.safeParse(params);
      if (!parsed.success) {
        return error(ErrorCodes.INVALID_INPUT, 'Invalid customer analytics request parameters', 400);
      }

      const { sellerId, startDate, endDate, limit } = parsed.data;

      const hasPermission = await permissionChecker.canViewSellerAnalytics(userId, sellerId);
      if (!hasPermission) {
        return error(ErrorCodes.FORBIDDEN, 'You do not have permission to view this seller analytics', 403);
      }

      try {
        const data = await analyticsRepository.getCustomerAnalytics(sellerId, startDate, endDate, limit);
        return success(data);
      } catch (e) {
        console.error('Error fetching customer analytics:', e);
        return error(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch customer analytics', 500);
      }
    },

    // Inventory Analytics
    async getInventoryAnalytics(userId: string, sellerId: string): Promise<Result<InventoryMetrics>> {
      const hasPermission = await permissionChecker.canViewSellerAnalytics(userId, sellerId);
      if (!hasPermission) {
        return error(ErrorCodes.FORBIDDEN, 'You do not have permission to view this seller analytics', 403);
      }

      try {
        const data = await analyticsRepository.getInventoryAnalytics(sellerId);
        return success(data);
      } catch (e) {
        console.error('Error fetching inventory analytics:', e);
        return error(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch inventory analytics', 500);
      }
    },

    // Rating Analytics (Agent 9 integration)
    async getRatingAnalytics(userId: string, sellerId: string): Promise<Result<RatingAnalytics>> {
      const hasPermission = await permissionChecker.canViewSellerAnalytics(userId, sellerId);
      if (!hasPermission) {
        return error(ErrorCodes.FORBIDDEN, 'You do not have permission to view this seller analytics', 403);
      }

      if (!ratingRepository) {
        return error(ErrorCodes.INTERNAL_ERROR, 'Rating analytics not available', 503);
      }

      try {
        const data = await ratingRepository.getSellerRating(sellerId);
        if (!data) {
          return error(ErrorCodes.NOT_FOUND, 'Rating data not found', 404);
        }
        return success(data);
      } catch (e) {
        console.error('Error fetching rating analytics:', e);
        return error(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch rating analytics', 500);
      }
    },

    // Search Analytics (Agent 10 integration)
    async getSearchAnalytics(userId: string, sellerId: string, startDate: string, endDate: string): Promise<Result<SearchAnalytics>> {
      const hasPermission = await permissionChecker.canViewSellerAnalytics(userId, sellerId);
      if (!hasPermission) {
        return error(ErrorCodes.FORBIDDEN, 'You do not have permission to view this seller analytics', 403);
      }

      if (!searchRepository) {
        return error(ErrorCodes.INTERNAL_ERROR, 'Search analytics not available', 503);
      }

      try {
        const data = await searchRepository.getSearchAnalytics(sellerId, startDate, endDate);
        return success(data);
      } catch (e) {
        console.error('Error fetching search analytics:', e);
        return error(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch search analytics', 500);
      }
    },

    // Calculate Daily Metrics (admin/scheduled job)
    async calculateDailyMetrics(sellerId: string, metricDate: string): Promise<Result<void>> {
      try {
        await analyticsRepository.calculateDailyMetrics(sellerId, metricDate);
        return success(undefined);
      } catch (e) {
        console.error('Error calculating daily metrics:', e);
        return error(ErrorCodes.INTERNAL_ERROR, 'Failed to calculate daily metrics', 500);
      }
    },

    // Refresh Overview Summary (admin/scheduled job)
    async refreshOverviewSummary(): Promise<Result<void>> {
      try {
        await analyticsRepository.refreshOverviewSummary();
        return success(undefined);
      } catch (e) {
        console.error('Error refreshing overview summary:', e);
        return error(ErrorCodes.INTERNAL_ERROR, 'Failed to refresh overview summary', 500);
      }
    },
  };
}

export type SellerAnalyticsService = ReturnType<typeof createSellerAnalyticsService>;
