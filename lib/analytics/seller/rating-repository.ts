import { RatingRepository, RatingAnalytics } from './analytics-service';

// ============================================================================
// RATING REPOSITORY (Agent 9 Integration)
// ============================================================================

export interface SupabaseClient {
  from: (table: string) => {
    select: (columns?: string) => {
      eq: (column: string, value: unknown) => {
        eq: (column: string, value: unknown) => {
          maybeSingle: () => Promise<{ data: unknown; error: unknown }>;
        };
        maybeSingle: () => Promise<{ data: unknown; error: unknown }>;
      };
      maybeSingle: () => Promise<{ data: unknown; error: unknown }>;
    };
  };
}

export function createSupabaseRatingRepository(client: SupabaseClient): RatingRepository {
  return {
    async getProductRating(productId: string): Promise<RatingAnalytics | null> {
      const { data, error } = await client
        .from('rating_summaries')
        .select('*')
        .eq('target_id', productId)
        .eq('target_type', 'product')
        .maybeSingle();

      if (error) {
        console.error('Error fetching product rating:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      const summary = data as Record<string, unknown>;
      const distribution = (summary.distribution as Record<string, number>) || {};

      return {
        averageRating: (summary.average_rating as number) || 0,
        reviewCount: (summary.review_count as number) || 0,
        ratingDistribution: {
          '1': distribution['1'] || 0,
          '2': distribution['2'] || 0,
          '3': distribution['3'] || 0,
          '4': distribution['4'] || 0,
          '5': distribution['5'] || 0,
        },
        ratingTrend: [], // Would need additional table for historical trend data
      };
    },

    async getSellerRating(sellerId: string): Promise<RatingAnalytics | null> {
      const { data, error } = await client
        .from('rating_summaries')
        .select('*')
        .eq('target_id', sellerId)
        .eq('target_type', 'seller')
        .maybeSingle();

      if (error) {
        console.error('Error fetching seller rating:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      const summary = data as Record<string, unknown>;
      const distribution = (summary.distribution as Record<string, number>) || {};

      return {
        averageRating: (summary.average_rating as number) || 0,
        reviewCount: (summary.review_count as number) || 0,
        ratingDistribution: {
          '1': distribution['1'] || 0,
          '2': distribution['2'] || 0,
          '3': distribution['3'] || 0,
          '4': distribution['4'] || 0,
          '5': distribution['5'] || 0,
        },
        ratingTrend: [], // Would need additional table for historical trend data
      };
    },
  };
}
