import type { RatingSummary, ReviewResult } from "../reviews/types";
export type { RatingSummary };

export type RatingEntityType = "product" | "seller";

export type RatingAggregateInput = {
  entityType: RatingEntityType;
  entityId: string;
};

export type RatingSummaryRepository = {
  get(input: RatingAggregateInput): Promise<RatingSummary | null>;
  recompute(input: RatingAggregateInput): Promise<RatingSummary>;
};

export type RatingServiceDependencies = {
  summaries: RatingSummaryRepository;
};

export type RatingResult<T> = ReviewResult<T>;
