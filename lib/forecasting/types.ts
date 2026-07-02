import { z } from "zod";

// ============================================================
// FORECASTING HOOK DEFINITIONS
// ============================================================

export const HOOK_TYPES = [
  "forecast",
  "ml_model",
  "analytics",
  "recommendation",
] as const;
export type HookType = (typeof HOOK_TYPES)[number];

export const HOOK_STATUSES = ["pending", "running", "completed", "failed"] as const;
export type HookInvocationStatus = (typeof HOOK_STATUSES)[number];

export interface ForecastingHook {
  id: string;
  hookName: string;
  hookType: HookType;
  description: string | null;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  isActive: boolean;
  lastInvokedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HookInvocation {
  id: string;
  hookId: string;
  inputData: Record<string, unknown>;
  outputData: Record<string, unknown>;
  durationMs: number;
  status: HookInvocationStatus;
  errorMessage: string | null;
  invokedAt: string;
}

// ============================================================
// FORECAST INPUTS / OUTPUTS
// ============================================================

export interface SalesForecastInput {
  lookbackDays: number;
  forecastDays: number;
}

export interface SalesForecastOutput {
  predictions: Array<{ date: string; predictedValue: number; confidenceLower: number; confidenceUpper: number }>;
  confidence: number;
}

export interface InventoryForecastInput {
  productIds: string[];
  forecastDays: number;
}

export interface InventoryForecastOutput {
  recommendations: Array<{ productId: string; currentStock: number; predictedDemand: number; recommendedReorder: number }>;
}

export interface RevenueForecastInput {
  period: string;
  granularity: string;
}

export interface RevenueForecastOutput {
  projections: Array<{ date: string; projectedRevenue: number }>;
  seasonality: Record<string, number>;
}

export interface CustomerLifetimeValueInput {
  customerIds: string[];
}

export interface CustomerLifetimeValueOutput {
  predictions: Array<{ customerId: string; predictedLtv: number; confidence: number }>;
}

export interface CustomerChurnInput {
  lookbackDays: number;
}

export interface CustomerChurnOutput {
  atRiskCustomers: Array<{ customerId: string; churnProbability: number; riskFactors: string[] }>;
  churnRate: number;
}

export interface DemandForecastInput {
  categoryIds: string[];
  forecastDays: number;
}

export interface DemandForecastOutput {
  demandPredictions: Array<{ categoryId: string; productId: string; predictedDemand: number; seasonalityFactor: number }>;
}

export interface SeasonalTrendsInput {
  years: number;
}

export interface SeasonalTrendsOutput {
  trends: Array<{ period: string; metric: string; value: number; change: number }>;
  seasonality: Record<string, number>;
}

export interface RecommendationAnalyticsInput {
  modelId: string;
}

export interface RecommendationAnalyticsOutput {
  metrics: { precision: number; recall: number; coverage: number; diversity: number };
  suggestions: Array<{ type: string; description: string; priority: string }>;
}

// ============================================================
// HOOK HANDLER INTERFACE
// ============================================================

export interface ForecastingHookHandler<TInput, TOutput> {
  hookName: string;
  execute(input: TInput): Promise<TOutput>;
}

export interface ForecastingHookRepository {
  listActiveHooks(): Promise<ForecastingHook[]>;
  getHookByName(hookName: string): Promise<ForecastingHook | null>;
  recordInvocation(invocation: {
    hookId: string;
    inputData: Record<string, unknown>;
    outputData: Record<string, unknown>;
    durationMs: number;
    status: HookInvocationStatus;
    errorMessage?: string;
  }): Promise<void>;
  updateLastInvoked(hookId: string): Promise<void>;
}

// ============================================================
// FORECASTING SERVICE INTERFACE
// ============================================================

export interface ForecastingService {
  getAvailableHooks(): Promise<ForecastingHook[]>;
  invokeHook<TInput, TOutput>(hookName: string, input: TInput): Promise<TOutput>;
  getInvocationHistory(hookName: string, limit?: number): Promise<HookInvocation[]>;
}

// ============================================================
// SCHEMAS
// ============================================================

export const salesForecastInputSchema = z.object({
  lookbackDays: z.number().int().positive().default(90),
  forecastDays: z.number().int().positive().default(30),
});

export const inventoryForecastInputSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1),
  forecastDays: z.number().int().positive().default(30),
});

export const revenueForecastInputSchema = z.object({
  period: z.string().default("year"),
  granularity: z.string().default("month"),
});

export const customerLtvInputSchema = z.object({
  customerIds: z.array(z.string().uuid()).min(1),
});

export const customerChurnInputSchema = z.object({
  lookbackDays: z.number().int().positive().default(90),
});

export const demandForecastInputSchema = z.object({
  categoryIds: z.array(z.string().uuid()).min(1),
  forecastDays: z.number().int().positive().default(30),
});

export const seasonalTrendsInputSchema = z.object({
  years: z.number().int().positive().default(3),
});

export const recommendationAnalyticsInputSchema = z.object({
  modelId: z.string().min(1),
});
