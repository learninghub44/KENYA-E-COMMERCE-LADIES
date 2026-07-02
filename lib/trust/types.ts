import type { AdminActor } from "../audit/types.js";
import type { ProductReviewRecord, ReviewModerationInput, ReviewModerationResult, SellerReviewRecord } from "../reviews/types.js";

export type TrustReviewRepository = {
  findProductReview(reviewId: string): Promise<ProductReviewRecord | null>;
  findSellerReview(reviewId: string): Promise<SellerReviewRecord | null>;
  setProductStatus(input: { reviewId: string; status: ReviewModerationInput["status"]; moderatorId: string; reason: string }): Promise<ProductReviewRecord>;
  setSellerStatus(input: { reviewId: string; status: ReviewModerationInput["status"]; moderatorId: string; reason: string }): Promise<SellerReviewRecord>;
};

export type TrustAuditWriter = {
  writeAdminAudit(input: {
    actor: AdminActor;
    action: string;
    entityType: "moderation";
    entityId: string;
    oldValues?: Record<string, unknown> | undefined;
    newValues?: Record<string, unknown> | undefined;
    metadata?: Record<string, unknown> | undefined;
  }): Promise<void>;
};

export type TrustServiceDependencies = {
  reviews: TrustReviewRepository;
  audit: TrustAuditWriter;
};

export type TrustResult<T> = ReviewModerationResult<T>;
