import { ExportRepository, ExportData } from './export-service';

// ============================================================================
// SUPABASE EXPORT REPOSITORY
// ============================================================================

export interface SupabaseClient {
  from: (table: string) => {
    select: (columns?: string) => {
      eq: (column: string, value: unknown) => {
        gte: (column: string, value: unknown) => {
          lte: (column: string, value: unknown) => {
            order: (column: string, options?: { ascending: boolean }) => {
              limit: (count: number) => Promise<{ data: unknown; error: unknown }>;
            };
            limit: (count: number) => Promise<{ data: unknown; error: unknown }>;
          };
          order: (column: string, options?: { ascending: boolean }) => {
            limit: (count: number) => Promise<{ data: unknown; error: unknown }>;
          };
          limit: (count: number) => Promise<{ data: unknown; error: unknown }>;
        };
        order: (column: string, options?: { ascending: boolean }) => {
          limit: (count: number) => Promise<{ data: unknown; error: unknown }>;
        };
        limit: (count: number) => Promise<{ data: unknown; error: unknown }>;
      };
      order: (column: string, options?: { ascending: boolean }) => {
        limit: (count: number) => Promise<{ data: unknown; error: unknown }>;
      };
      limit: (count: number) => Promise<{ data: unknown; error: unknown }>;
    };
  };
}

export function createSupabaseExportRepository(client: SupabaseClient): ExportRepository {
  return {
    async getSalesReport(sellerId: string, startDate: string, endDate: string): Promise<ExportData> {
      const result = await client
        .from('orders')
        .select('order_number, created_at, status, total_minor, currency, buyer_id')
        .eq('seller_id', sellerId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })
        .limit(10000);

      const { data, error } = result as { data: unknown; error: unknown };

      if (error) {
        throw new Error(`Failed to fetch sales report: ${JSON.stringify(error)}`);
      }

      const rows = (data as unknown[]) || [];

      return {
        headers: ['Order Number', 'Date', 'Status', 'Total', 'Currency', 'Buyer ID'],
        rows: rows.map((row: unknown) => ({
          'Order Number': (row as Record<string, unknown>).order_number,
          'Date': (row as Record<string, unknown>).created_at,
          'Status': (row as Record<string, unknown>).status,
          'Total': (row as Record<string, unknown>).total_minor,
          'Currency': (row as Record<string, unknown>).currency,
          'Buyer ID': (row as Record<string, unknown>).buyer_id,
        })),
      };
    },

    async getRevenueReport(sellerId: string, startDate: string, endDate: string): Promise<ExportData> {
      const result = await client
        .from('seller_daily_metrics')
        .select('metric_date, gross_revenue_minor, net_revenue_minor, refunds_minor, orders_total')
        .eq('seller_id', sellerId)
        .gte('metric_date', startDate)
        .lte('metric_date', endDate)
        .order('metric_date', { ascending: false })
        .limit(10000);

      const { data, error } = result as { data: unknown; error: unknown };

      if (error) {
        throw new Error(`Failed to fetch revenue report: ${JSON.stringify(error)}`);
      }

      const rows = (data as unknown[]) || [];

      return {
        headers: ['Date', 'Gross Revenue', 'Net Revenue', 'Refunds', 'Orders'],
        rows: rows.map((row: unknown) => ({
          'Date': (row as Record<string, unknown>).metric_date,
          'Gross Revenue': (row as Record<string, unknown>).gross_revenue_minor,
          'Net Revenue': (row as Record<string, unknown>).net_revenue_minor,
          'Refunds': (row as Record<string, unknown>).refunds_minor,
          'Orders': (row as Record<string, unknown>).orders_total,
        })),
      };
    },

    async getInventoryReport(sellerId: string): Promise<ExportData> {
      const result = await client
        .from('products')
        .select('name, sku, status, base_price_minor, currency')
        .eq('seller_id', sellerId)
        .order('name', { ascending: true })
        .limit(10000);

      const { data, error } = result as { data: unknown; error: unknown };

      if (error) {
        throw new Error(`Failed to fetch inventory report: ${JSON.stringify(error)}`);
      }

      const rows = (data as unknown[]) || [];

      return {
        headers: ['Product Name', 'SKU', 'Status', 'Base Price', 'Currency'],
        rows: rows.map((row: unknown) => ({
          'Product Name': (row as Record<string, unknown>).name,
          'SKU': (row as Record<string, unknown>).sku,
          'Status': (row as Record<string, unknown>).status,
          'Base Price': (row as Record<string, unknown>).base_price_minor,
          'Currency': (row as Record<string, unknown>).currency,
        })),
      };
    },

    async getOrdersReport(sellerId: string, startDate: string, endDate: string): Promise<ExportData> {
      const result = await client
        .from('orders')
        .select('order_number, created_at, status, payment_status, fulfillment_status, total_minor, currency')
        .eq('seller_id', sellerId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })
        .limit(10000);

      const { data, error } = result as { data: unknown; error: unknown };

      if (error) {
        throw new Error(`Failed to fetch orders report: ${JSON.stringify(error)}`);
      }

      const rows = (data as unknown[]) || [];

      return {
        headers: ['Order Number', 'Date', 'Status', 'Payment Status', 'Fulfillment Status', 'Total', 'Currency'],
        rows: rows.map((row: unknown) => ({
          'Order Number': (row as Record<string, unknown>).order_number,
          'Date': (row as Record<string, unknown>).created_at,
          'Status': (row as Record<string, unknown>).status,
          'Payment Status': (row as Record<string, unknown>).payment_status,
          'Fulfillment Status': (row as Record<string, unknown>).fulfillment_status,
          'Total': (row as Record<string, unknown>).total_minor,
          'Currency': (row as Record<string, unknown>).currency,
        })),
      };
    },

    async getReviewsReport(sellerId: string, startDate: string, endDate: string): Promise<ExportData> {
      const result = await client
        .from('seller_reviews')
        .select('created_at, overall_rating, communication_rating, shipping_rating, packaging_rating, title, body')
        .eq('seller_id', sellerId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })
        .limit(10000);

      const { data, error } = result as { data: unknown; error: unknown };

      if (error) {
        throw new Error(`Failed to fetch reviews report: ${JSON.stringify(error)}`);
      }

      const rows = (data as unknown[]) || [];

      return {
        headers: ['Date', 'Overall Rating', 'Communication', 'Shipping', 'Packaging', 'Title', 'Body'],
        rows: rows.map((row: unknown) => ({
          'Date': (row as Record<string, unknown>).created_at,
          'Overall Rating': (row as Record<string, unknown>).overall_rating,
          'Communication': (row as Record<string, unknown>).communication_rating,
          'Shipping': (row as Record<string, unknown>).shipping_rating,
          'Packaging': (row as Record<string, unknown>).packaging_rating,
          'Title': (row as Record<string, unknown>).title,
          'Body': (row as Record<string, unknown>).body,
        })),
      };
    },

    async getCustomersReport(sellerId: string, startDate: string, endDate: string): Promise<ExportData> {
      const result = await client
        .from('orders')
        .select('buyer_id, created_at, total_minor, currency')
        .eq('seller_id', sellerId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })
        .limit(10000);

      const { data, error } = result as { data: unknown; error: unknown };

      if (error) {
        throw new Error(`Failed to fetch customers report: ${JSON.stringify(error)}`);
      }

      const rows = (data as unknown[]) || [];

      // Aggregate by customer
      const customerMap = new Map<string, { totalSpent: number; orderCount: number }>();

      for (const row of rows) {
        const buyerId = (row as Record<string, unknown>).buyer_id as string;
        const total = (row as Record<string, unknown>).total_minor as number;
        
        const existing = customerMap.get(buyerId) || { totalSpent: 0, orderCount: 0 };
        existing.totalSpent += total;
        existing.orderCount += 1;
        customerMap.set(buyerId, existing);
      }

      return {
        headers: ['Customer ID', 'Total Spent', 'Order Count', 'Average Order Value'],
        rows: Array.from(customerMap.entries()).map(([customerId, stats]) => ({
          'Customer ID': customerId,
          'Total Spent': stats.totalSpent,
          'Order Count': stats.orderCount,
          'Average Order Value': stats.orderCount > 0 ? Math.round(stats.totalSpent / stats.orderCount) : 0,
        })),
      };
    },
  };
}
