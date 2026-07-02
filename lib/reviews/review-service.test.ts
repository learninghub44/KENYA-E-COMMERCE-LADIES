import assert from "node:assert/strict";
import test from "node:test";
import { createReviewService, type ProductReviewRecord, type ReviewServiceDependencies, type SellerReviewRecord } from "./index";

const buyerId = "11111111-1111-4111-8111-111111111111";
const sellerId = "22222222-2222-4222-8222-222222222222";
const productId = "33333333-3333-4333-8333-333333333333";
const orderId = "44444444-4444-4444-8444-444444444444";
const orderItemId = "55555555-5555-4555-8555-555555555555";

function makeDeps(): ReviewServiceDependencies & { productStore: ProductReviewRecord[]; sellerStore: SellerReviewRecord[] } {
  const productStore: ProductReviewRecord[] = [];
  const sellerStore: SellerReviewRecord[] = [];
  const helpful = new Set<string>();
  const reports: unknown[] = [];

  return {
    productStore,
    sellerStore,
    editWindowHours: 72,
    productReviews: {
      async findById(reviewId) {
        return productStore.find((review) => review.id === reviewId) ?? null;
      },
      async findByOrderItem(id) {
        return productStore.find((review) => review.orderItemId === id) ?? null;
      },
      async create(input) {
        const reviewId = `66666666-6666-4666-8666-66666666666${productStore.length}`;
        const review: ProductReviewRecord = {
          ...input,
          id: reviewId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          media: input.media.map((media, index) => ({
            ...media,
            id: `77777777-7777-4777-8777-77777777777${index}`,
            reviewId,
            position: media.position ?? index,
            deletedAt: null,
            createdAt: new Date().toISOString()
          }))
        };
        productStore.push(review);
        return review;
      },
      async update(input) {
        const review = productStore.find((item) => item.id === input.reviewId);
        assert.ok(review);
        Object.assign(review, input.values, { updatedAt: new Date().toISOString() });
        if (input.media) {
          review.media = input.media.map((media, index) => ({
            ...media,
            id: `media-updated-${index + 1}`,
            reviewId: review.id,
            position: media.position ?? index,
            deletedAt: null,
            createdAt: new Date().toISOString()
          }));
        }
        return review;
      },
      async list(filters) {
        return { items: productStore.filter((review) => !filters.status || review.status === filters.status), nextCursor: null };
      },
      async incrementReportCount(reviewId) {
        const review = productStore.find((item) => item.id === reviewId);
        assert.ok(review);
        review.reportCount += 1;
        return review;
      }
    },
    sellerReviews: {
      async findById(reviewId) {
        return sellerStore.find((review) => review.id === reviewId) ?? null;
      },
      async findByOrderSeller(input) {
        return sellerStore.find((review) => review.orderId === input.orderId && review.sellerId === input.sellerId && review.buyerId === input.buyerId) ?? null;
      },
      async create(input) {
        const review: SellerReviewRecord = {
          ...input,
          id: `88888888-8888-4888-8888-88888888888${sellerStore.length}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        sellerStore.push(review);
        return review;
      },
      async update(input) {
        const review = sellerStore.find((item) => item.id === input.reviewId);
        assert.ok(review);
        Object.assign(review, input.values, { updatedAt: new Date().toISOString() });
        return review;
      },
      async list() {
        return { items: sellerStore, nextCursor: null };
      },
      async incrementReportCount(reviewId) {
        const review = sellerStore.find((item) => item.id === reviewId);
        assert.ok(review);
        review.reportCount += 1;
        return review;
      }
    },
    eligibility: {
      async findCompletedOrderItem(input) {
        if (input.buyerId !== buyerId || input.orderItemId !== orderItemId) return null;
        return { buyerId, orderId, orderItemId, productId, sellerId, orderStatus: "completed" };
      },
      async buyerCompletedOrder(input) {
        return input.buyerId === buyerId && input.orderId === orderId && input.sellerId === sellerId;
      }
    },
    helpfulVotes: {
      async hasVoted(input) {
        return helpful.has(`${input.reviewType}:${input.reviewId}:${input.userId}`);
      },
      async add(input) {
        helpful.add(`${input.reviewType}:${input.reviewId}:${input.userId}`);
        const review = productStore.find((item) => item.id === input.reviewId) ?? sellerStore.find((item) => item.id === input.reviewId);
        assert.ok(review);
        review.helpfulCount += 1;
        return review.helpfulCount;
      },
      async remove(input) {
        helpful.delete(`${input.reviewType}:${input.reviewId}:${input.userId}`);
        const review = productStore.find((item) => item.id === input.reviewId) ?? sellerStore.find((item) => item.id === input.reviewId);
        assert.ok(review);
        review.helpfulCount = Math.max(0, review.helpfulCount - 1);
        return review.helpfulCount;
      }
    },
    reports: {
      async create(input) {
        reports.push(input);
        return { id: `99999999-9999-4999-8999-99999999999${reports.length}`, createdAt: new Date().toISOString() };
      }
    }
  };
}

test("creates only verified purchase product reviews and prevents duplicates", async () => {
  const deps = makeDeps();
  const service = createReviewService(deps);

  const created = await service.createProductReview({
    buyerId,
    orderItemId,
    rating: 5,
    title: "Excellent texture",
    body: "The item matched the order and the quality was lovely.",
    media: [{ publicId: "reviews/1", secureUrl: "https://res.cloudinary.com/demo/image/upload/reviews/1.jpg", mimeType: "image/jpeg", bytes: 1000 }]
  });
  assert.equal(created.ok, true);
  assert.equal(created.ok && created.data.isVerifiedPurchase, true);
  assert.equal(created.ok && created.data.media.length, 1);

  const duplicate = await service.createProductReview({ buyerId, orderItemId, rating: 4, title: "Still good", body: "Trying to review the same order item again." });
  assert.equal(duplicate.ok, false);
  assert.equal(!duplicate.ok && duplicate.code, "DUPLICATE_REVIEW");

  const notVerified = await service.createProductReview({
    buyerId: "99999999-9999-4999-8999-999999999999",
    orderItemId,
    rating: 5,
    title: "No order",
    body: "This buyer should not be allowed to review."
  });
  assert.equal(notVerified.ok, false);
  assert.equal(!notVerified.ok && notVerified.code, "NOT_VERIFIED_PURCHASE");
});

test("enforces media limits and edit window ownership", async () => {
  const deps = makeDeps();
  const service = createReviewService({ ...deps, maxImageBytes: 10 });
  const tooLarge = await service.createProductReview({
    buyerId,
    orderItemId,
    rating: 5,
    title: "Pretty finish",
    body: "The image should fail because it is too large.",
    media: [{ publicId: "reviews/large", secureUrl: "https://res.cloudinary.com/demo/image/upload/reviews/large.jpg", mimeType: "image/jpeg", bytes: 11 }]
  });
  assert.equal(tooLarge.ok, false);
  assert.equal(!tooLarge.ok && tooLarge.code, "IMAGE_TOO_LARGE");

  const created = await createReviewService(deps).createProductReview({ buyerId, orderItemId, rating: 5, title: "Pretty finish", body: "The review can be edited in window." });
  assert.equal(created.ok, true);
  const reviewId = created.ok ? created.data.id : "";

  const forbidden = await createReviewService(deps).editProductReview({ reviewId, buyerId: sellerId, title: "Nope" });
  assert.equal(forbidden.ok, false);
  assert.equal(!forbidden.ok && forbidden.code, "FORBIDDEN");

  assert.ok(deps.productStore[0]);
  deps.productStore[0].createdAt = new Date(Date.now() - 100 * 60 * 60 * 1000).toISOString();
  const expired = await createReviewService(deps).editProductReview({ reviewId, buyerId, title: "Too late now" });
  assert.equal(expired.ok, false);
  assert.equal(!expired.ok && expired.code, "EDIT_WINDOW_EXPIRED");
});

test("handles helpful voting, reporting, and seller reviews", async () => {
  const deps = makeDeps();
  const service = createReviewService(deps);
  const productReview = await service.createProductReview({ buyerId, orderItemId, rating: 5, title: "Helpful", body: "This review will collect helpful votes." });
  assert.equal(productReview.ok, true);
  const reviewId = productReview.ok ? productReview.data.id : "";

  const vote = await service.voteHelpful("product", reviewId, sellerId);
  assert.deepEqual(vote.ok && vote.data, { helpfulCount: 1 });
  const duplicateVote = await service.voteHelpful("product", reviewId, sellerId);
  assert.equal(duplicateVote.ok, false);
  assert.equal(!duplicateVote.ok && duplicateVote.code, "DUPLICATE_HELPFUL_VOTE");

  const report = await service.reportReview({ reviewType: "product", reviewId, reporterId: sellerId, reason: "spam" });
  assert.equal(report.ok, true);
  assert.ok(deps.productStore[0]);
  assert.equal(deps.productStore[0].reportCount, 1);

  const sellerReview = await service.createSellerReview({
    buyerId,
    orderId,
    sellerId,
    overallRating: 5,
    communicationRating: 5,
    shippingRating: 4,
    packagingRating: 5,
    feedback: "The seller communicated clearly and packed the item carefully."
  });
  assert.equal(sellerReview.ok, true);
  assert.equal(deps.sellerStore.length, 1);
});
