import {
  AnalyticsDateWindow,
  AnalyticsResult,
  MarketplaceAnalyticsAuditWriter,
  MarketplaceAnalyticsPermissionChecker,
  MarketplaceAnalyticsRepository,
  MarketplaceAnalyticsRequest,
  MarketplaceDashboard,
  MarketplaceKpis,
  failure,
  marketplaceAnalyticsRequestSchema,
  success,
} from "./types.js";

export function formatAnalyticsDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
}

function daysInclusive(startDate: string, endDate: string): number {
  const start = parseDateOnly(startDate).getTime();
  const end = parseDateOnly(endDate).getTime();
  return Math.max(1, Math.round((end - start) / 86_400_000) + 1);
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(2));
}

export function getMarketplaceDateWindow(
  params: MarketplaceAnalyticsRequest,
  now = new Date(),
): AnalyticsDateWindow {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let start = new Date(today);
  let end = new Date(today);

  switch (params.dateRange) {
    case "today":
      break;
    case "yesterday":
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      break;
    case "last_7_days":
      start.setDate(start.getDate() - 6);
      break;
    case "last_30_days":
      start.setDate(start.getDate() - 29);
      break;
    case "last_90_days":
      start.setDate(start.getDate() - 89);
      break;
    case "last_year":
      start.setFullYear(start.getFullYear() - 1);
      break;
    case "custom":
      start = parseDateOnly(params.startDate ?? "");
      end = parseDateOnly(params.endDate ?? "");
      break;
  }

  if (start.getTime() > end.getTime()) {
    throw new Error("startDate cannot be after endDate");
  }

  const windowLength = daysInclusive(formatAnalyticsDate(start), formatAnalyticsDate(end));
  const previousEnd = new Date(start);
  previousEnd.setDate(previousEnd.getDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - windowLength + 1);

  return {
    startDate: formatAnalyticsDate(start),
    endDate: formatAnalyticsDate(end),
    previousStartDate: formatAnalyticsDate(previousStart),
    previousEndDate: formatAnalyticsDate(previousEnd),
  };
}

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
    if (!auth.ok) {
      return { ok: false as const, result: auth };
    }

    try {
      return {
        ok: true as const,
        window: getMarketplaceDateWindow(parsed.data, now?.() ?? new Date()),
      };
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
        overview: {
          currency,
          dateWindow: request.window,
          generatedAt: (now?.() ?? new Date()).toISOString(),
        },
        revenue,
        orders,
        users,
        sellers,
        products,
        categories,
        brands,
      });
    },
  };
}

export type MarketplaceAnalyticsService = ReturnType<typeof createMarketplaceAnalyticsService>;
