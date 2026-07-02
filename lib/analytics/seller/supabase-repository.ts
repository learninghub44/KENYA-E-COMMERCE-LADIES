import { 
  AnalyticsRepository,
  DashboardData,
  RevenueDataPoint,
  ProductAnalytics,
  CustomerAnalytics,
  InventoryMetrics,
  TimeGrouping,
} from './analytics-service.js';

// ============================================================================
// SUPABASE REPOSITORY IMPLEMENTATION
// ============================================================================

export interface SupabaseClient {
  rpc: (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
}

export function createSupabaseAnalyticsRepository(client: SupabaseClient): AnalyticsRepository {
  return {
    async getDashboard(sellerId: string, startDate: string, endDate: string): Promise<DashboardData> {
      const { data, error } = await client.rpc('get_seller_dashboard', {
        p_seller_id: sellerId,
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) {
        throw new Error(`Failed to fetch dashboard: ${JSON.stringify(error)}`);
      }

      const result = data as Record<string, unknown>;
      
      return {
        overview: {
          totalOrders: (result.overview as Record<string, unknown>).total_orders as number,
          completedOrders: (result.overview as Record<string, unknown>).completed_orders as number,
          pendingOrders: (result.overview as Record<string, unknown>).pending_orders as number,
          cancelledOrders: (result.overview as Record<string, unknown>).cancelled_orders as number,
          grossRevenueMinor: (result.overview as Record<string, unknown>).gross_revenue_minor as number,
          netRevenueMinor: (result.overview as Record<string, unknown>).net_revenue_minor as number,
          refundsMinor: (result.overview as Record<string, unknown>).refunds_minor as number,
          customersNew: (result.overview as Record<string, unknown>).customers_new as number,
          customersReturning: (result.overview as Record<string, unknown>).customers_returning as number,
        },
        products: {
          totalProducts: (result.products as Record<string, unknown>).total_products as number,
          activeProducts: (result.products as Record<string, unknown>).active_products as number,
          draftProducts: (result.products as Record<string, unknown>).draft_products as number,
          outOfStock: (result.products as Record<string, unknown>).out_of_stock as number,
          lowStock: (result.products as Record<string, unknown>).low_stock as number,
        },
        inventory: {
          inventoryValueMinor: (result.inventory as Record<string, unknown>).inventory_value_minor as number,
          lowStockCount: (result.inventory as Record<string, unknown>).low_stock_count as number,
          outOfStockCount: (result.inventory as Record<string, unknown>).out_of_stock_count as number,
        },
        dailyMetrics: ((result.daily_metrics as unknown[]) || []).map((m: unknown) => ({
          date: (m as Record<string, unknown>).date as string,
          ordersTotal: (m as Record<string, unknown>).orders_total as number,
          ordersCompleted: (m as Record<string, unknown>).orders_completed as number,
          ordersPending: (m as Record<string, unknown>).orders_pending as number,
          ordersCancelled: (m as Record<string, unknown>).orders_cancelled as number,
          grossRevenueMinor: (m as Record<string, unknown>).gross_revenue_minor as number,
          netRevenueMinor: (m as Record<string, unknown>).net_revenue_minor as number,
          customersNew: (m as Record<string, unknown>).customers_new as number,
          customersReturning: (m as Record<string, unknown>).customers_returning as number,
        })),
      };
    },

    async getRevenueAnalytics(sellerId: string, startDate: string, endDate: string, groupBy: TimeGrouping): Promise<RevenueDataPoint[]> {
      const { data, error } = await client.rpc('get_seller_revenue_analytics', {
        p_seller_id: sellerId,
        p_start_date: startDate,
        p_end_date: endDate,
        p_group_by: groupBy,
      });

      if (error) {
        throw new Error(`Failed to fetch revenue analytics: ${JSON.stringify(error)}`);
      }

      return ((data as unknown[]) || []).map((item: unknown) => ({
        period: (item as Record<string, unknown>).period as string,
        grossRevenueMinor: (item as Record<string, unknown>).gross_revenue_minor as number,
        netRevenueMinor: (item as Record<string, unknown>).net_revenue_minor as number,
        ordersCount: (item as Record<string, unknown>).orders_count as number,
      }));
    },

    async getProductAnalytics(sellerId: string, limit: number): Promise<ProductAnalytics[]> {
      const { data, error } = await client.rpc('get_seller_product_analytics', {
        p_seller_id: sellerId,
        p_limit: limit,
      });

      if (error) {
        throw new Error(`Failed to fetch product analytics: ${JSON.stringify(error)}`);
      }

      return ((data as unknown[]) || []).map((item: unknown) => ({
        productId: (item as Record<string, unknown>).product_id as string,
        productName: (item as Record<string, unknown>).product_name as string,
        sku: (item as Record<string, unknown>).sku as string | null,
        status: (item as Record<string, unknown>).status as string,
        basePriceMinor: (item as Record<string, unknown>).base_price_minor as number,
        currency: (item as Record<string, unknown>).currency as string,
        totalOrders: (item as Record<string, unknown>).total_orders as number,
        unitsSold: (item as Record<string, unknown>).units_sold as number,
        grossRevenueMinor: (item as Record<string, unknown>).gross_revenue_minor as number,
        stockAvailable: (item as Record<string, unknown>).stock_available as number,
        stockReserved: (item as Record<string, unknown>).stock_reserved as number,
        isLowStock: (item as Record<string, unknown>).is_low_stock as boolean,
        isOutOfStock: (item as Record<string, unknown>).is_out_of_stock as boolean,
      }));
    },

    async getCustomerAnalytics(sellerId: string, startDate: string, endDate: string, limit: number): Promise<CustomerAnalytics[]> {
      const { data, error } = await client.rpc('get_seller_customer_analytics', {
        p_seller_id: sellerId,
        p_start_date: startDate,
        p_end_date: endDate,
        p_limit: limit,
      });

      if (error) {
        throw new Error(`Failed to fetch customer analytics: ${JSON.stringify(error)}`);
      }

      return ((data as unknown[]) || []).map((item: unknown) => ({
        customerId: (item as Record<string, unknown>).customer_id as string,
        displayName: (item as Record<string, unknown>).display_name as string | null,
        email: (item as Record<string, unknown>).email as string | null,
        orderCount: (item as Record<string, unknown>).order_count as number,
        totalSpentMinor: (item as Record<string, unknown>).total_spent_minor as number,
        firstOrderAt: (item as Record<string, unknown>).first_order_at as string,
        lastOrderAt: (item as Record<string, unknown>).last_order_at as string,
        avgOrderValueMinor: (item as Record<string, unknown>).avg_order_value_minor as number,
        isReturning: (item as Record<string, unknown>).is_returning as boolean,
      }));
    },

    async getInventoryAnalytics(sellerId: string): Promise<InventoryMetrics> {
      const { data, error } = await client.rpc('get_seller_dashboard', {
        p_seller_id: sellerId,
        p_start_date: new Date().toISOString().split('T')[0],
        p_end_date: new Date().toISOString().split('T')[0],
      });

      if (error) {
        throw new Error(`Failed to fetch inventory analytics: ${JSON.stringify(error)}`);
      }

      const result = data as Record<string, unknown>;
      const inventory = result.inventory as Record<string, unknown>;

      return {
        inventoryValueMinor: inventory.inventory_value_minor as number,
        lowStockCount: inventory.low_stock_count as number,
        outOfStockCount: inventory.out_of_stock_count as number,
      };
    },

    async calculateDailyMetrics(sellerId: string, metricDate: string): Promise<void> {
      const { error } = await client.rpc('calculate_seller_daily_metrics', {
        p_seller_id: sellerId,
        p_metric_date: metricDate,
      });

      if (error) {
        throw new Error(`Failed to calculate daily metrics: ${JSON.stringify(error)}`);
      }
    },

    async refreshOverviewSummary(): Promise<void> {
      const { error } = await client.rpc('refresh_seller_overview_summary', {});

      if (error) {
        throw new Error(`Failed to refresh overview summary: ${JSON.stringify(error)}`);
      }
    },
  };
}
