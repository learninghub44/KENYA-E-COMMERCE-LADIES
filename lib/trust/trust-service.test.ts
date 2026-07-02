import assert from "node:assert/strict";
import test from "node:test";
import { createTrustService } from "./index.js";
import type { ProductReviewRecord } from "../reviews/index.js";

const review: ProductReviewRecord = {
  id: "review-1",
  productId: "33333333-3333-4333-8333-333333333333",
  sellerId: "22222222-2222-4222-8222-222222222222",
  buyerId: "11111111-1111-4111-8111-111111111111",
  orderId: "44444444-4444-4444-8444-444444444444",
  orderItemId: "55555555-5555-4555-8555-555555555555",
  rating: 5,
  title: "Good",
  body: "Good product and delivery.",
  status: "published",
  isVerifiedPurchase: true,
  helpfulCount: 0,
  reportCount: 0,
  publishedAt: new Date().toISOString(),
  editedAt: null,
  deletedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  media: []
};

test("moderates reviews with admin permission and writes audit", async () => {
  const audits: unknown[] = [];
  const service = createTrustService({
    reviews: {
      async findProductReview(reviewId) {
        return reviewId === review.id ? review : null;
      },
      async findSellerReview() {
        return null;
      },
      async setProductStatus(input) {
        review.status = input.status;
        return review;
      },
      async setSellerStatus() {
        throw new Error("not used");
      }
    },
    audit: {
      async writeAdminAudit(input) {
        audits.push(input);
      }
    }
  });

  const denied = await service.moderateReview({
    actor: { userId: "admin", roles: ["buyer"] },
    reviewType: "product",
    reviewId: review.id,
    status: "hidden",
    reason: "Policy review"
  });
  assert.equal(denied.ok, false);
  assert.equal(!denied.ok && denied.code, "AUTHORIZATION_DENIED");

  const updated = await service.moderateReview({
    actor: { userId: "admin", roles: ["admin"] },
    reviewType: "product",
    reviewId: review.id,
    status: "hidden",
    reason: "Policy review"
  });
  assert.equal(updated.ok, true);
  assert.equal(review.status, "hidden");
  assert.equal(audits.length, 1);
});
