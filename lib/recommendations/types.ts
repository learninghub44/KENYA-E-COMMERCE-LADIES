import type { SearchProduct } from "../search/types";

export type RecommendationStrategy =
  | "recently_viewed"
  | "similar_category"
  | "similar_brand"
  | "same_seller"
  | "frequently_bought_together"
  | "personalized";

export type RecommendationRequest = {
  userId?: string | undefined;
  productId?: string | undefined;
  categoryId?: string | undefined;
  brandId?: string | undefined;
  sellerId?: string | undefined;
  strategy: RecommendationStrategy;
  limit?: number | undefined;
};

export type RecommendationProvider = {
  recommend(input: RecommendationRequest & { limit: number }): Promise<SearchProduct[]>;
};
