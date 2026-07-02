import { assertPermission } from "../permissions/index";
import type { AdminActor } from "../audit/types";
import type { ProductReviewRecord, SellerReviewRecord } from "../reviews/types";
import type { TrustResult, TrustServiceDependencies } from "./types";

function failure(code: string, message: string, status: number): TrustResult<never> {
  return { ok: false, code, message, status };
}

export function createTrustService(deps: TrustServiceDependencies) {
  return {
    async moderateReview(input: {
      actor: AdminActor;
      reviewType: "product" | "seller";
      reviewId: string;
      status: "pending" | "published" | "hidden" | "removed";
      reason: string;
    }): Promise<TrustResult<ProductReviewRecord | SellerReviewRecord>> {
      try {
        assertPermission(input.actor.roles, "admin.moderate");
      } catch {
        return failure("AUTHORIZATION_DENIED", "Actor cannot moderate reviews.", 403);
      }

      const before =
        input.reviewType === "product"
          ? await deps.reviews.findProductReview(input.reviewId)
          : await deps.reviews.findSellerReview(input.reviewId);
      if (!before) return failure("REVIEW_NOT_FOUND", "Review was not found.", 404);

      const updated =
        input.reviewType === "product"
          ? await deps.reviews.setProductStatus({
              reviewId: input.reviewId,
              status: input.status,
              moderatorId: input.actor.userId,
              reason: input.reason
            })
          : await deps.reviews.setSellerStatus({
              reviewId: input.reviewId,
              status: input.status,
              moderatorId: input.actor.userId,
              reason: input.reason
            });

      await deps.audit.writeAdminAudit({
        actor: input.actor,
        action: "review.moderated",
        entityType: "moderation",
        entityId: input.reviewId,
        oldValues: { status: before.status },
        newValues: { status: updated.status },
        metadata: { reviewType: input.reviewType, reason: input.reason }
      });

      return { ok: true, data: updated };
    }
  };
}
