import {
  AnalyticsDateWindow,
  AnalyticsResult,
  MarketplaceAnalyticsAuditWriter,
  MarketplaceAnalyticsPermissionChecker,
  MarketplaceAnalyticsRepository,
  MarketplaceAnalyticsRequest,
  MarketplaceDashboard,
  MarketplaceHealthScore,
  MarketplaceKpis,
  MessagingAnalytics,
  NotificationAnalytics,
  ReviewAnalytics,
  SearchAnalytics,
  SearchPerformance,
  failure,
  getMarketplaceDateWindow,
  marketplaceAnalyticsRequestSchema,
  success,
} from "./types.js";

export type MarketplaceAnalyticsServiceDependencies = {
  repository: MarketplaceAnalyticsRepository;
  permissionChecker: MarketplaceAnalyticsPermissionChecker;
  auditWriter?: MarketplaceAnalyticsAuditWriter;
  now?: () => Date;
  currency?: string;
};

export function createMarketplaceAnalyticsService(deps: MarketplaceAnalyticsServiceDependencies) {
  const { repository, permissionChecker, auditWriter, now, currency = "KES" } = deps;

  async function authorize(userId: string): Promise<AnalyticsResult<void>> {
    const allowed = await permissionChecker.canViewMarketplaceAnalytics(userId);
    if (!allowed) {
      return failure("FORBIDDEN", "Marketplace analytics are available only to super admin and admin users.", 403);
    }
    return success(undefined);
  }

  async function parseAndAuthorize(userId: string, params: unknown) {
    const parsed = marketplaceAnalyticsRequestSchema.safeParse(params);
    if (!parsed.success) {
      return { ok: false as const, result: failure("INVALID_INPUT", "Invalid marketplace analytics request.", 400) };
    }
    const auth = await authorize(userId);
    if (!auth.ok) return { ok: false as const, result: auth };
    try {
      return { ok: true as const, window: getMarketplaceDateWindow(parsed.data, now?.() ?? new Date()) };
    } catch (error) {
      return {
        ok: false as const,
        result: failure("INVALID_DATE_RANGE", error instanceof Error ? error.message : "Invalid date range.", 400),
      };
    }
  }

  async function parseSimpleAndAuthorize(userId: string, params: unknown) {
    const parsed = marketplaceAnalyticsRequestSchema.safeParse(params);
    if (!parsed.success) {
      return { ok: false as const, result: failure("INVALID_INPUT", "Invalid marketplace analytics request.", 400) };
    }
    const auth = await authorize(userId);
    if (!auth.ok) return { ok: false as const, result: auth };
    try {
      const window = getMarketplaceDateWindow(parsed.data, now?.() ?? new Date());
      return { ok: true as const, window: { startDate: window.startDate, endDate: window.endDate } };
    } catch (error) {
      return {
        ok: false as const,
        result: failure("INVALID_DATE_RANGE", error instanceof Error ? error.message : "Invalid date range.", 400),
      };
    }
  }

  async function audit(userId: string, section: Parameters<NonNullable<MarketplaceAnalyticsAuditWriter["writeAnalyticsAccess"]>>[0]["section"], dateWindow: AnalyticsDateWindow) {
    await auditWriter?.writeAnalyticsAccess({ userId, section, dateWindow });
  }

  return {
    async getRevenue(userId: string, params: unknown) {
      const request = await parseAndAuthorize(userId, params);
      if (!request.ok) return request.result;
      const data = await repository.getRevenueAnalytics(request.window);
      await audit(userId, "revenue", request.window);
      return success(data);
    },

    async getOrders(userId: string, params: unknown) {
      const request = await parseAndAuthorize(userId, params);
      if (!request.ok) return request.result;
      const data = await repository.getOrdersAnalytics(request.window);
      await audit(userId, "orders", request.window);
      return success(data);
    },

    async getUsers(userId: string, params: unknown) {
      const request = await parseAndAuthorize(userId, params);
      if (!request.ok) return request.result;
      const data = await repository.getUsersAnalytics(request.window);
      await audit(userId, "users", request.window);
      return success(data);
    },

    async getSellers(userId: string, params: unknown) {
      const request = await parseAndAuthorize(userId, params);
      if (!request.ok) return request.result;
      const data = await repository.getSellersAnalytics(request.window);
      await audit(userId, "sellers", request.window);
      return success(data);
    },

    async getProducts(userId: string, params: unknown) {
      const request = await parseAndAuthorize(userId, params);
      if (!request.ok) return request.result;
      const data = await repository.getProductsAnalytics(request.window);
      await audit(userId, "products", request.window);
      return success(data);
    },

    async getCategories(userId: string, params: unknown) {
      const request = await parseAndAuthorize(userId, params);
      if (!request.ok) return request.result;
      const data = await repository.getCategoriesAnalytics(request.window, 25);
      await audit(userId, "categories", request.window);
      return success(data);
    },

    async getBrands(userId: string, params: unknown) {
      const request = await parseAndAuthorize(userId, params);
      if (!request.ok) return request.result;
      const data = await repository.getBrandsAnalytics(request.window, 25);
      await audit(userId, "brands", request.window);
      return success(data);
    },

    async getKpis(userId: string, params: unknown): Promise<AnalyticsResult<MarketplaceKpis>> {
      const request = await parseAndAuthorize(userId, params);
      if (!request.ok) return request.result;
      const [revenue, orders, users, sellers, products, categories, brands] = await Promise.all([
        repository.getRevenueAnalytics(request.window),
        repository.getOrdersAnalytics(request.window),
        repository.getUsersAnalytics(request.window),
        repository.getSellersAnalytics(request.window),
        repository.getProductsAnalytics(request.window),
        repository.getCategoriesAnalytics(request.window, 10),
        repository.getBrandsAnalytics(request.window, 10),
      ]);
      await audit(userId, "kpis", request.window);
      return success({ revenue, orders, users, sellers, products, categories, brands });
    },

    async getDashboard(userId: string, params: unknown): Promise<AnalyticsResult<MarketplaceDashboard>> {
      const request = await parseAndAuthorize(userId, params);
      if (!request.ok) return request.result;
      const [revenue, orders, users, sellers, products, categories, brands] = await Promise.all([
        repository.getRevenueAnalytics(request.window),
        repository.getOrdersAnalytics(request.window),
        repository.getUsersAnalytics(request.window),
        repository.getSellersAnalytics(request.window),
        repository.getProductsAnalytics(request.window),
        repository.getCategoriesAnalytics(request.window, 10),
        repository.getBrandsAnalytics(request.window, 10),
      ]);
      await audit(userId, "dashboard", request.window);
      return success({
        overview: { currency, dateWindow: request.window, generatedAt: (now?.() ?? new Date()).toISOString() },
        revenue, orders, users, sellers, products, categories, brands,
      });
    },

    async getSearchAnalytics(userId: string, params: unknown): Promise<AnalyticsResult<SearchAnalytics>> {
      const request = await parseAndAuthorize(userId, params);
      if (!request.ok) return request.result;
      if (!repository.getSearchAnalytics) {
        return failure("NOT_IMPLEMENTED", "Search analytics are not available.", 501);
      }
      const data = await repository.getSearchAnalytics(request.window);
      await audit(userId, "search", request.window);
      return success(data);
    },

    async getSearchPerformance(userId: string, params: unknown): Promise<AnalyticsResult<SearchPerformance>> {
      const request = await parseSimpleAndAuthorize(userId, params);
      if (!request.ok) return request.result;
      if (!repository.getSearchPerformance) {
        return failure("NOT_IMPLEMENTED", "Search performance is not available.", 501);
      }
      const data = await repository.getSearchPerformance(request.window);
      await audit(userId, "search", request.window as AnalyticsDateWindow);
      return success(data);
    },

    async getReviewAnalytics(userId: string, params: unknown): Promise<AnalyticsResult<ReviewAnalytics>> {
      const request = await parseAndAuthorize(userId, params);
      if (!request.ok) return request.result;
      if (!repository.getReviewAnalytics) {
        return failure("NOT_IMPLEMENTED", "Review analytics are not available.", 501);
      }
      const data = await repository.getReviewAnalytics(request.window);
      await audit(userId, "reviews", request.window);
      return success(data);
    },

    async getMessagingAnalytics(userId: string, params: unknown): Promise<AnalyticsResult<MessagingAnalytics>> {
      const request = await parseAndAuthorize(userId, params);
      if (!request.ok) return request.result;
      if (!repository.getMessagingAnalytics) {
        return failure("NOT_IMPLEMENTED", "Messaging analytics are not available.", 501);
      }
      const data = await repository.getMessagingAnalytics(request.window);
      await audit(userId, "messages", request.window);
      return success(data);
    },

    async getNotificationAnalytics(userId: string, params: unknown): Promise<AnalyticsResult<NotificationAnalytics>> {
      const request = await parseAndAuthorize(userId, params);
      if (!request.ok) return request.result;
      if (!repository.getNotificationAnalytics) {
        return failure("NOT_IMPLEMENTED", "Notification analytics are not available.", 501);
      }
      const data = await repository.getNotificationAnalytics(request.window);
      await audit(userId, "notifications", request.window);
      return success(data);
    },

    async getHealthScore(userId: string, params: unknown): Promise<AnalyticsResult<MarketplaceHealthScore>> {
      const request = await parseSimpleAndAuthorize(userId, params);
      if (!request.ok) return request.result;
      if (!repository.getHealthScore) {
        return failure("NOT_IMPLEMENTED", "Marketplace health score is not available.", 501);
      }
      const data = await repository.getHealthScore(request.window);
      await audit(userId, "health", request.window as AnalyticsDateWindow);
      return success(data);
    },
  };
}

export type MarketplaceAnalyticsService = ReturnType<typeof createMarketplaceAnalyticsService>;
