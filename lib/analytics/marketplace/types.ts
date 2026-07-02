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
  | "brands";

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
