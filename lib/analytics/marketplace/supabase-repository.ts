import {
  AnalyticsDateWindow,
  BrandsAnalytics,
  CategoriesAnalytics,
  MarketplaceAnalyticsRepository,
  OrdersAnalytics,
  ProductsAnalytics,
  RevenueAnalytics,
  SellersAnalytics,
  UsersAnalytics,
} from "./types.js";

export interface SupabaseRpcClient {
  rpc: (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
}

async function rpc<T>(client: SupabaseRpcClient, name: string, window: AnalyticsDateWindow, extra: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await client.rpc(name, {
    p_start_date: window.startDate,
    p_end_date: window.endDate,
    p_previous_start_date: window.previousStartDate,
    p_previous_end_date: window.previousEndDate,
    ...extra,
  });

  if (error) {
    throw new Error(`Failed to execute ${name}: ${JSON.stringify(error)}`);
  }

  return data as T;
}

export function createSupabaseMarketplaceAnalyticsRepository(client: SupabaseRpcClient): MarketplaceAnalyticsRepository {
  return {
    getRevenueAnalytics: (window) => rpc<RevenueAnalytics>(client, "get_marketplace_revenue_analytics", window),
    getOrdersAnalytics: (window) => rpc<OrdersAnalytics>(client, "get_marketplace_orders_analytics", window),
    getUsersAnalytics: (window) => rpc<UsersAnalytics>(client, "get_marketplace_users_analytics", window),
    getSellersAnalytics: (window) => rpc<SellersAnalytics>(client, "get_marketplace_sellers_analytics", window),
    getProductsAnalytics: (window) => rpc<ProductsAnalytics>(client, "get_marketplace_products_analytics", window),
    getCategoriesAnalytics: (window, limit) =>
      rpc<CategoriesAnalytics>(client, "get_marketplace_categories_analytics", window, { p_limit: limit }),
    getBrandsAnalytics: (window, limit) =>
      rpc<BrandsAnalytics>(client, "get_marketplace_brands_analytics", window, { p_limit: limit }),
    async refreshCachedMetrics(metricDate: string) {
      const { error } = await client.rpc("refresh_marketplace_daily_metrics", { p_metric_date: metricDate });
      if (error) {
        throw new Error(`Failed to refresh marketplace metrics: ${JSON.stringify(error)}`);
      }
    },
  };
}
