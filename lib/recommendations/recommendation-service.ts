import type { RecommendationProvider, RecommendationRequest } from "./types.js";

export function createRecommendationService(deps: { provider: RecommendationProvider }) {
  return {
    recommend(input: RecommendationRequest) {
      return deps.provider.recommend({ ...input, limit: Math.min(input.limit ?? 12, 50) });
    }
  };
}

export function createEmptyRecommendationProvider(): RecommendationProvider {
  return {
    async recommend() {
      return [];
    }
  };
}
