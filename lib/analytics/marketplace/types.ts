import { z } from "zod";

export type MarketplaceDateRange =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "last_90_days"
  | "last_year"
  | "custom";

export type MarketplaceAnalyticsSection =
  | "dashboard"
  | "kpis"
  | "revenue"
  | "orders"
  | "users"
  | "sellers"
  | "products"
  | "categories"
  | "brands"
  | "search"
  | "reviews"
  | "messages"
  | "notifications"
  | "health"
  | "bi"
  | "export";

export type AnalyticsDateWindow = {
  startDate: string;
  endDate: string;
  previousStartDate: string;
  previousEndDate: string;
};

export type GrowthMetric = {
  current: number;
  previous: number;
  growthRate: number;
};

export type RevenueAnalytics = {
  gmvMinor: number;
  marketplaceRevenueMinor: number;
  commissionRevenueMinor: number;
  sellerRevenueMinor: number;
  averageOrderValueMinor: number;
  revenueGrowth: GrowthMetric;
};

export type OrdersAnalytics = {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  processingOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  orderGrowth: GrowthMetric;
  averageOrdersPerDay: number;
  averageOrdersPerSeller: number;
};

export type UsersAnalytics = {
  totalBuyers: number;
  activeBuyers: number;
  newBuyers: number;
  returningBuyers: number;
  buyerGrowth: GrowthMetric;
  buyerRetentionRate: number;
  buyerAcquisitionRate: number;
};

export type SellersAnalytics = {
  totalSellers: number;
  verifiedSellers: number;
  pendingVerification: number;
  activeSellers: number;
  suspendedSellers: number;
  sellerGrowth: GrowthMetric;
  sellerActivationRate: number;
};

export type ProductsAnalytics = {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  pendingReviewProducts: number;
  publishedProducts: number;
  rejectedProducts: number;
  outOfStockProducts: number;
  productGrowth: GrowthMetric;
  productApprovalRate: number;
};

export type RankedMetric = {
  id: string;
  name: string;
  count: number;
  revenueMinor: number;
  growthRate: number;
  revenueShare: number;
};

export type CategoriesAnalytics = {
  totalCategories: number;
  mostActiveCategories: RankedMetric[];
  highestRevenueCategories: RankedMetric[];
  fastestGrowingCategories: RankedMetric[];
  categoryGrowth: GrowthMetric;
  categoryRevenueShare: RankedMetric[];
};

export type BrandsAnalytics = {
  totalBrands: number;
  topBrands: RankedMetric[];
  fastestGrowingBrands: RankedMetric[];
  highestRevenueBrands: RankedMetric[];
  brandGrowth: GrowthMetric;
  brandRevenue: RankedMetric[];
};

// ===== SEARCH ANALYTICS =====

export type PopularKeyword = {
  query: string;
  count: number;
  lastSearchedAt: string;
};

export type TrendingSearch = {
  query: string;
  count: number;
};

export type SearchAnalytics = {
  totalSearches: number;
  searchesPerDay: number;
  popularKeywords: PopularKeyword[];
  searchCtr: number;
  searchConversions: number;
  zeroResultSearches: number;
  trendingSearches: TrendingSearch[];
  searchGrowth: GrowthMetric;
};

export type SearchPerformance = {
  totalSearches: number;
  uniqueSearchers: number;
  searchesWithResults: number;
  zeroResultSearches: number;
  averageResultsPerSearch: number;
  searchSuccessRate: number;
  zeroResultRate: number;
};

// ===== REVIEW ANALYTICS =====

export type RatingDistribution = {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
};

export type RatedItem = {
  id: string;
  name: string;
  averageRating: number;
  totalReviews: number;
};

export type ReviewAnalytics = {
  reviewsSubmitted: number;
  averageMarketplaceRating: number;
  ratingDistribution: RatingDistribution;
  reviewGrowth: GrowthMetric;
  topRatedProducts: RatedItem[];
  lowestRatedProducts: RatedItem[];
  topRatedSellers: RatedItem[];
  verifiedReviewPercentage: number;
  averageSellerRating: number;
};

// ===== MESSAGING ANALYTICS =====

export type MessagingAnalytics = {
  conversationsStarted: number;
  activeConversations: number;
  messagesSent: number;
  sellerResponseTime: number;
  buyerResponseTime: number;
  conversationGrowth: GrowthMetric;
  messageGrowth: GrowthMetric;
};

// ===== NOTIFICATION ANALYTICS =====

export type NotificationTypeDistribution = {
  orders: number;
  messaging: number;
  seller: number;
  account: number;
  reviews: number;
  announcements: number;
  security: number;
};

export type EmailDelivery = {
  total: number;
  sent: number;
  failed: number;
};

export type NotificationAnalytics = {
  notificationsSent: number;
  readRate: number;
  openRate: number;
  deliverySuccess: number;
  notificationTypeDistribution: NotificationTypeDistribution;
  notificationGrowth: GrowthMetric;
  emailDelivery: EmailDelivery;
};

// ===== HEALTH SCORE =====

export type HealthScoreComponent = {
  score: number;
  maxScore: number;
  label: string;
};

export type MarketplaceHealthScore = {
  score: number;
  components: {
    sellerActivity: HealthScoreComponent;
    productApprovalRate: HealthScoreComponent;
    revenueGrowth: HealthScoreComponent;
    customerGrowth: HealthScoreComponent;
    averageRatings: HealthScoreComponent;
    searchPerformance: HealthScoreComponent;
    inventoryHealth: HealthScoreComponent;
  };
  maxScore: number;
  status: "healthy" | "moderate" | "critical";
  periodStart: string;
  periodEnd: string;
};

// ===== AGGREGATES =====

export type MarketplaceKpis = {
  revenue: RevenueAnalytics;
  orders: OrdersAnalytics;
  users: UsersAnalytics;
  sellers: SellersAnalytics;
  products: ProductsAnalytics;
  categories: CategoriesAnalytics;
  brands: BrandsAnalytics;
};

export type MarketplaceDashboard = MarketplaceKpis & {
  overview: {
    currency: string;
    dateWindow: AnalyticsDateWindow;
    generatedAt: string;
  };
};

export type AnalyticsResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; status: number };

export const marketplaceDateRangeSchema = z.enum([
  "today",
  "yesterday",
  "last_7_days",
  "last_30_days",
  "last_90_days",
  "last_year",
  "custom",
]);

const marketplaceAnalyticsRequestBaseSchema = z.object({
  dateRange: marketplaceDateRangeSchema.default("last_30_days"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const marketplaceAnalyticsRequestSchema = marketplaceAnalyticsRequestBaseSchema
  .superRefine((value, context) => {
    if (value.dateRange === "custom" && (!value.startDate || !value.endDate)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom date ranges require startDate and endDate",
      });
    }
  });

export const marketplaceListRequestSchema = marketplaceAnalyticsRequestBaseSchema
  .extend({
    cursor: z.string().optional(),
    limit: z.number().int().min(1).max(100).default(25),
  })
  .superRefine((value, context) => {
    if (value.dateRange === "custom" && (!value.startDate || !value.endDate)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom date ranges require startDate and endDate",
      });
    }
  });

export type MarketplaceAnalyticsRequest = z.infer<typeof marketplaceAnalyticsRequestSchema>;
export type MarketplaceListRequest = z.infer<typeof marketplaceListRequestSchema>;

export const success = <T>(data: T): AnalyticsResult<T> => ({ ok: true, data });

export const failure = (
  code: string,
  message: string,
  status = 500,
): AnalyticsResult<never> => ({ ok: false, code, message, status });

export interface MarketplaceAnalyticsRepository {
  getRevenueAnalytics(window: AnalyticsDateWindow): Promise<RevenueAnalytics>;
  getOrdersAnalytics(window: AnalyticsDateWindow): Promise<OrdersAnalytics>;
  getUsersAnalytics(window: AnalyticsDateWindow): Promise<UsersAnalytics>;
  getSellersAnalytics(window: AnalyticsDateWindow): Promise<SellersAnalytics>;
  getProductsAnalytics(window: AnalyticsDateWindow): Promise<ProductsAnalytics>;
  getCategoriesAnalytics(window: AnalyticsDateWindow, limit: number): Promise<CategoriesAnalytics>;
  getBrandsAnalytics(window: AnalyticsDateWindow, limit: number): Promise<BrandsAnalytics>;
  getSearchAnalytics?(window: AnalyticsDateWindow): Promise<SearchAnalytics>;
  getSearchPerformance?(window: { startDate: string; endDate: string }): Promise<SearchPerformance>;
  getReviewAnalytics?(window: AnalyticsDateWindow): Promise<ReviewAnalytics>;
  getMessagingAnalytics?(window: AnalyticsDateWindow): Promise<MessagingAnalytics>;
  getNotificationAnalytics?(window: AnalyticsDateWindow): Promise<NotificationAnalytics>;
  getHealthScore?(window: { startDate: string; endDate: string }): Promise<MarketplaceHealthScore>;
  refreshCachedMetrics?(metricDate: string): Promise<void>;
}

export interface MarketplaceAnalyticsPermissionChecker {
  canViewMarketplaceAnalytics(userId: string): Promise<boolean>;
}

export interface MarketplaceAnalyticsAuditWriter {
  writeAnalyticsAccess(input: {
    userId: string;
    section: MarketplaceAnalyticsSection;
    dateWindow: AnalyticsDateWindow;
  }): Promise<void>;
}

// ===== DATE HELPERS =====

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
