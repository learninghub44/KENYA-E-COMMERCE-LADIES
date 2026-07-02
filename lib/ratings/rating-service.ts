import type { RatingAggregateInput, RatingResult, RatingServiceDependencies, RatingSummary } from "./types";

function failure(code: string, message: string, status: number): RatingResult<never> {
  return { ok: false, code, message, status };
}

export function createRatingService(deps: RatingServiceDependencies) {
  return {
    async summary(input: RatingAggregateInput): Promise<RatingResult<RatingSummary>> {
      const summary = await deps.summaries.get(input);
      if (!summary) return failure("SUMMARY_NOT_FOUND", "Rating summary was not found.", 404);
      return { ok: true, data: summary };
    },

    async recompute(input: RatingAggregateInput): Promise<RatingResult<RatingSummary>> {
      return { ok: true, data: await deps.summaries.recompute(input) };
    }
  };
}
