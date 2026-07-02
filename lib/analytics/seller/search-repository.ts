import { SearchRepository, SearchAnalytics } from './analytics-service.js';

// ============================================================================
// SEARCH REPOSITORY (Agent 10 Integration)
// ============================================================================

export interface SupabaseClient {
  from: (table: string) => {
    select: (columns?: string) => {
      gte: (column: string, value: unknown) => {
        lte: (column: string, value: unknown) => {
          order: (column: string, options?: { ascending: boolean }) => {
            limit: (count: number) => Promise<{ data: unknown; error: unknown }>;
          };
        };
      };
    };
  };
}

export function createSupabaseSearchRepository(client: SupabaseClient): SearchRepository {
  return {
    async getSearchAnalytics(sellerId: string, startDate: string, endDate: string): Promise<SearchAnalytics> {
      // Get popular search terms for the seller's products
      const { data: popularTermsData, error: popularTermsError } = await client
        .from('popular_search_terms')
        .select('term, count')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('count', { ascending: false })
        .limit(10);

      if (popularTermsError) {
        console.error('Error fetching popular search terms:', popularTermsError);
      }

      const popularSearchTerms = ((popularTermsData as unknown[]) || []).map((item: unknown) => ({
        term: (item as Record<string, unknown>).term as string,
        count: (item as Record<string, unknown>).count as number,
      }));

      // For now, return placeholder data for impressions and clicks
      // These would need to be tracked in a separate analytics events table
      return {
        productImpressions: 0,
        searchClicks: 0,
        searchCTR: 0,
        popularSearchTerms,
      };
    },
  };
}
