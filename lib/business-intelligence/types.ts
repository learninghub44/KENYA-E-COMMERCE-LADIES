import { z } from "zod";

export type BiDateRange =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "last_90_days"
  | "last_year"
  | "custom";

export type BiRankedItem = {
  id: string;
  name: string;
  revenueMinor: number;
  growthRate: number;
  orderCount?: number;
  buyerCount?: number;
  conversionRate?: number;
};

export type BiProductTrends = {
  newProducts: number;
  previousNewProducts: number;
  activeProducts: number;
  newActiveProducts: number;
  growthRate: number;
};

export type BiCustomerTrends = {
  newCustomers: number;
  previousNewCustomers: number;
  growthRate: number;
};

export type BiRevenueTrends = {
  currentRevenue: number;
  previousRevenue: number;
  growthRate: number;
};

export type BusinessIntelligence = {
  fastestGrowingCategories: BiRankedItem[];
  highestRevenueCategories: BiRankedItem[];
  highestConversionCategories: BiRankedItem[];
  lowestPerformingCategories: BiRankedItem[];
  bestPerformingBrands: BiRankedItem[];
  lowestPerformingBrands: BiRankedItem[];
  fastestGrowingSellers: BiRankedItem[];
  productGrowthTrends: BiProductTrends;
  customerGrowthTrends: BiCustomerTrends;
  revenueTrends: BiRevenueTrends;
};

export type BiSellerGrowth = {
  id: string;
  name: string;
  currentOrders: number;
  previousOrders: number;
  growthRate: number;
};

export const biDateRangeSchema = z.enum([
  "today",
  "yesterday",
  "last_7_days",
  "last_30_days",
  "last_90_days",
  "last_year",
  "custom",
]);

const biRequestBaseSchema = z.object({
  dateRange: biDateRangeSchema.default("last_30_days"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const biRequestSchema = biRequestBaseSchema.superRefine((value, ctx) => {
  if (value.dateRange === "custom" && (!value.startDate || !value.endDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Custom date ranges require startDate and endDate",
    });
  }
});

export type BiRequest = z.infer<typeof biRequestSchema>;

export interface BusinessIntelligenceRepository {
  getBusinessIntelligence(window: {
    startDate: string;
    endDate: string;
    previousStartDate: string;
    previousEndDate: string;
  }): Promise<BusinessIntelligence>;
}
