# Forecasting Foundation Documentation

## Overview
The forecasting module provides extension hooks for future AI/ML model integration. No machine learning is implemented — only clean interfaces and data structures.

## Architecture

```
App / Cron Job
  -> ForecastingService
    -> ForecastingHookRepository (Supabase)
    -> ForecastingHookHandler (user-registered implementations)
      -> forecasting_hooks table (hook definitions)
      -> hook_invocations table (invocation history)
```

## Database Tables
- `forecasting_hooks` — Hook definitions with schema, active status
- `hook_invocations` — History of all hook invocations with input/output/error

## Available Hooks (8 seeds)

| Hook Name | Input | Output |
|-----------|-------|--------|
| sales_forecast | { period, productId?, category? } | { predictedRevenue, confidence, trend } |
| inventory_forecast | { productId, period } | { reorderPoint, suggestedOrder, daysUntilStockout } |
| revenue_forecast | { period, segment? } | { projectedRevenue, lowerBound, upperBound } |
| customer_lifetime_value | { customerId } | { predictedLtv, confidence, segment } |
| customer_churn | { customerId } | { churnProbability, riskFactors, recommendedActions } |
| demand_forecast | { productId, period } | { predictedDemand, seasonalityIndex, elasticity } |
| seasonal_trends | { category, period } | { peaks, valleys, yearOverYear, recommendedActions } |
| recommendation_analytics | { customerId, context } | { recommendedProducts, relevanceScores, diversity } |

## Key Interfaces

### ForecastingHook
- `id`, `hookName`, `hookType`, `description`, `inputSchema`, `outputSchema`, `isActive`

### ForecastingHookHandler<I, O>
- `hookName: string`
- `execute(input: I): Promise<O>`

### ForecastingService
- `getAvailableHooks(): Promise<ForecastingHook[]>`
- `invokeHook(name, input): Promise<unknown>`
- `registerHandler(handler): void`

## Integrating a Model (Future)
```typescript
const mySalesModel: ForecastingHookHandler<SalesInput, SalesOutput> = {
  hookName: "sales_forecast",
  execute: async (input) => {
    // Call your ML model here
    return { predictedRevenue: 50000, confidence: 0.85, trend: "up" };
  },
};
forecastingService.registerHandler(mySalesModel);
```

## Key Files
- `lib/forecasting/types.ts` — Type definitions for all 8 hooks
- `lib/forecasting/hooks.ts` — Forecasting service, handler registry
- `supabase/migrations/202607020011_event_analytics_observability.sql` — Database schema

## Future Work (Agent 12+)
- ML model integration via handler registration
- Model training pipeline
- Automated hook scheduling
- Forecast accuracy tracking
- A/B testing infrastructure
