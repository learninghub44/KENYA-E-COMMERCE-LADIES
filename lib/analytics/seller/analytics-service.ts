import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

export type DateRange = 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'last_90_days' | 'last_year' | 'custom';

export type TimeGrouping = 'hour' | 'day' | 'week' | 'month' | 'year';

export interface DashboardOverview {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  grossRevenueMinor: number;
  netRevenueMinor: number;
  refundsMinor: number;
  customersNew: number;
  customersReturning: number;
}

export interface ProductMetrics {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  outOfStock: number;
  lowStock: number;
}

export interface InventoryMetrics {
  inventoryValueMinor: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface DailyMetric {
  date: string;
  ordersTotal: number;
  ordersCompleted: number;
  ordersPending: number;
  ordersCancelled: number;
  grossRevenueMinor: number;
  netRevenueMinor: number;
  customersNew: number;
  customersReturning: number;
}

export interface DashboardData {
  overview: DashboardOverview;
  products: ProductMetrics;
  inventory: InventoryMetrics;
  dailyMetrics: DailyMetric[];
}

export interface RevenueDataPoint {
  period: string;
  grossRevenueMinor: number;
  netRevenueMinor: number;
  ordersCount: number;
}

export interface ProductAnalytics {
  productId: string;
  productName: string;
  sku: string | null;
  status: string;
  basePriceMinor: number;
  currency: string;
  totalOrders: number;
  unitsSold: number;
  grossRevenueMinor: number;
  stockAvailable: number;
  stockReserved: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export interface CustomerAnalytics {
  customerId: string;
  displayName: string | null;
  email: string | null;
  orderCount: number;
  totalSpentMinor: number;
  firstOrderAt: string;
  lastOrderAt: string;
  avgOrderValueMinor: number;
  isReturning: boolean;
}

export interface RatingAnalytics {
  averageRating: number;
  reviewCount: number;
  ratingDistribution: Record<string, number>;
  ratingTrend: Array<{ date: string; averageRating: number }>;
}

export interface SearchAnalytics {
  productImpressions: number;
  searchClicks: number;
  searchCTR: number;
  popularSearchTerms: Array<{ term: string; count: number }>;
}

// ============================================================================
// SCHEMAS
// ============================================================================

export const dateRangeSchema = z.enum(['today', 'yesterday', 'last_7_days', 'last_30_days', 'last_90_days', 'last_year', 'custom']);

export const customDateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const timeGroupingSchema = z.enum(['hour', 'day', 'week', 'month', 'year']);

export const dashboardRequestSchema = z.object({
  sellerId: z.string().uuid(),
  dateRange: dateRangeSchema.default('last_30_days'),
  customDateRange: customDateRangeSchema.optional(),
});

export const revenueAnalyticsRequestSchema = z.object({
  sellerId: z.string().uuid(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  groupBy: timeGroupingSchema.default('day'),
});

export const productAnalyticsRequestSchema = z.object({
  sellerId: z.string().uuid(),
  limit: z.number().int().min(1).max(100).default(50),
});

export const customerAnalyticsRequestSchema = z.object({
  sellerId: z.string().uuid(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  limit: z.number().int().min(1).max(100).default(50),
});

export const exportRequestSchema = z.object({
  sellerId: z.string().uuid(),
  reportType: z.enum(['sales', 'revenue', 'inventory', 'orders', 'reviews', 'customers']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  format: z.enum(['csv', 'xlsx', 'pdf']).default('csv'),
});

// ============================================================================
// REPOSITORY INTERFACES
// ============================================================================

export interface AnalyticsRepository {
  getDashboard(sellerId: string, startDate: string, endDate: string): Promise<DashboardData>;
  getRevenueAnalytics(sellerId: string, startDate: string, endDate: string, groupBy: TimeGrouping): Promise<RevenueDataPoint[]>;
  getProductAnalytics(sellerId: string, limit: number): Promise<ProductAnalytics[]>;
  getCustomerAnalytics(sellerId: string, startDate: string, endDate: string, limit: number): Promise<CustomerAnalytics[]>;
  getInventoryAnalytics(sellerId: string): Promise<InventoryMetrics>;
  calculateDailyMetrics(sellerId: string, metricDate: string): Promise<void>;
  refreshOverviewSummary(): Promise<void>;
}

export interface RatingRepository {
  getProductRating(productId: string): Promise<RatingAnalytics | null>;
  getSellerRating(sellerId: string): Promise<RatingAnalytics | null>;
}

export interface SearchRepository {
  getSearchAnalytics(sellerId: string, startDate: string, endDate: string): Promise<SearchAnalytics>;
}

export interface PermissionChecker {
  canViewSellerAnalytics(userId: string, sellerId: string): Promise<boolean>;
}

// ============================================================================
// RESULT TYPES
// ============================================================================

export type Result<T> = 
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; status?: number };

export const success = <T>(data: T): Result<T> => ({ ok: true, data });

export const error = (code: string, message: string, status?: number): Result<never> => ({
  ok: false,
  code,
  message,
  ...(status === undefined ? {} : { status }),
});

// ============================================================================
// ERROR CODES
// ============================================================================

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  INVALID_INPUT: 'INVALID_INPUT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
