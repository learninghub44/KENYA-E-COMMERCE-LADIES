import { createProductReviewSchema, createSellerReviewSchema, reportReviewSchema, updateProductReviewSchema } from "./schemas";
import { validateReviewMedia } from "./media-provider";
import type {
  CreateProductReviewInput,
  CreateSellerReviewInput,
  ProductReviewRecord,
  ReviewResult,
  ReviewServiceDependencies,
  SellerReviewRecord
} from "./types";

const DEFAULT_EDIT_WINDOW_HOURS = 72;
const DEFAULT_MAX_IMAGES = 8;
const DEFAULT_MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function failure(code: string, message: string, status: number): ReviewResult<never> {
  return { ok: false, code, message, status };
}

function withinEditWindow(review: { createdAt: string; status: string; deletedAt: string | null }, now: Date, hours: number): boolean {
  if (review.deletedAt || review.status !== "published") return false;
  return now.getTime() - new Date(review.createdAt).getTime() <= hours * 60 * 60 * 1000;
}

export function createReviewService(deps: ReviewServiceDependencies) {
  const editWindowHours = deps.editWindowHours ?? DEFAULT_EDIT_WINDOW_HOURS;
  const mediaPolicy = {
    maxImages: deps.maxImages ?? DEFAULT_MAX_IMAGES,
    maxImageBytes: deps.maxImageBytes ?? DEFAULT_MAX_IMAGE_BYTES
  };

  async function createProductReview(input: CreateProductReviewInput): Promise<ReviewResult<ProductReviewRecord>> {
    const parsed = createProductReviewSchema.safeParse(input);
    if (!parsed.success) return failure("VALIDATION_ERROR", "Product review input is invalid.", 400);

    const orderItem = await deps.eligibility.findCompletedOrderItem({
      buyerId: parsed.data.buyerId,
      orderItemId: parsed.data.orderItemId
    });
    if (!orderItem) return failure("NOT_VERIFIED_PURCHASE", "Only completed purchases can be reviewed.", 403);

    const duplicate = await deps.productReviews.findByOrderItem(orderItem.orderItemId);
    if (duplicate && !duplicate.deletedAt) return failure("DUPLICATE_REVIEW", "This order item already has a review.", 409);

    const media = validateReviewMedia(parsed.data.media, mediaPolicy);
    if (!media.ok) return media;

    const now = new Date().toISOString();
    const review = await deps.productReviews.create({
      productId: orderItem.productId,
      sellerId: orderItem.sellerId,
      buyerId: orderItem.buyerId,
      orderId: orderItem.orderId,
      orderItemId: orderItem.orderItemId,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
      status: "published",
      isVerifiedPurchase: true,
      helpfulCount: 0,
      reportCount: 0,
      publishedAt: now,
      editedAt: null,
      deletedAt: null,
      media: media.data
    });

    await deps.events?.publish({
      eventType: "review.created",
      entityType: "review",
      entityId: review.id,
      actorId: review.buyerId,
      payload: { productId: review.productId, sellerId: review.sellerId, rating: review.rating, recipientUserId: review.sellerId }
    });

    return { ok: true, data: review };
  }

  async function editProductReview(input: unknown): Promise<ReviewResult<ProductReviewRecord>> {
    const parsed = updateProductReviewSchema.safeParse(input);
    if (!parsed.success) return failure("VALIDATION_ERROR", "Product review update input is invalid.", 400);
    const review = await deps.productReviews.findById(parsed.data.reviewId);
    if (!review) return failure("REVIEW_NOT_FOUND", "Review was not found.", 404);
    if (review.buyerId !== parsed.data.buyerId) return failure("FORBIDDEN", "Only the review owner can edit it.", 403);
    if (!withinEditWindow(review, parsed.data.now ?? new Date(), editWindowHours)) {
      return failure("EDIT_WINDOW_EXPIRED", "This review can no longer be edited.", 409);
    }

    const media = parsed.data.media === undefined ? undefined : validateReviewMedia(parsed.data.media, mediaPolicy);
    if (media && !media.ok) return media;
    const values: Parameters<ReviewServiceDependencies["productReviews"]["update"]>[0]["values"] = {
      editedAt: new Date().toISOString()
    };
    if (parsed.data.rating !== undefined) values.rating = parsed.data.rating;
    if (parsed.data.title !== undefined) values.title = parsed.data.title;
    if (parsed.data.body !== undefined) values.body = parsed.data.body;

    const updated = await deps.productReviews.update({
      reviewId: review.id,
      values,
      media: media?.data
    });
    return { ok: true, data: updated };
  }

  async function deleteProductReview(reviewId: string, buyerId: string): Promise<ReviewResult<ProductReviewRecord>> {
    const review = await deps.productReviews.findById(reviewId);
    if (!review) return failure("REVIEW_NOT_FOUND", "Review was not found.", 404);
    if (review.buyerId !== buyerId) return failure("FORBIDDEN", "Only the review owner can delete it.", 403);
    if (!withinEditWindow(review, new Date(), editWindowHours)) {
      return failure("EDIT_WINDOW_EXPIRED", "This review can no longer be deleted by the buyer.", 409);
    }
    const updated = await deps.productReviews.update({ reviewId, values: { status: "removed", deletedAt: new Date().toISOString() } });
    return { ok: true, data: updated };
  }

  async function createSellerReview(input: CreateSellerReviewInput): Promise<ReviewResult<SellerReviewRecord>> {
    const parsed = createSellerReviewSchema.safeParse(input);
    if (!parsed.success) return failure("VALIDATION_ERROR", "Seller review input is invalid.", 400);
    const allowed = await deps.eligibility.buyerCompletedOrder(parsed.data);
    if (!allowed) return failure("NOT_VERIFIED_PURCHASE", "Only completed purchases can be reviewed.", 403);
    const duplicate = await deps.sellerReviews.findByOrderSeller(parsed.data);
    if (duplicate && !duplicate.deletedAt) return failure("DUPLICATE_REVIEW", "This seller order already has feedback.", 409);

    const now = new Date().toISOString();
    const review = await deps.sellerReviews.create({
      sellerId: parsed.data.sellerId,
      buyerId: parsed.data.buyerId,
      orderId: parsed.data.orderId,
      overallRating: parsed.data.overallRating,
      communicationRating: parsed.data.communicationRating,
      shippingRating: parsed.data.shippingRating,
      packagingRating: parsed.data.packagingRating,
      feedback: parsed.data.feedback,
      status: "published",
      helpfulCount: 0,
      reportCount: 0,
      publishedAt: now,
      editedAt: null,
      deletedAt: null
    });
    return { ok: true, data: review };
  }

  return {
    createProductReview,
    editProductReview,
    deleteProductReview,
    createSellerReview,

    async voteHelpful(reviewType: "product" | "seller", reviewId: string, userId: string): Promise<ReviewResult<{ helpfulCount: number }>> {
      const exists = reviewType === "product" ? await deps.productReviews.findById(reviewId) : await deps.sellerReviews.findById(reviewId);
      if (!exists || exists.deletedAt || exists.status === "removed") return failure("REVIEW_NOT_FOUND", "Review was not found.", 404);
      if (await deps.helpfulVotes.hasVoted({ reviewType, reviewId, userId })) {
        return failure("DUPLICATE_HELPFUL_VOTE", "User already marked this review helpful.", 409);
      }
      return { ok: true, data: { helpfulCount: await deps.helpfulVotes.add({ reviewType, reviewId, userId }) } };
    },

    async removeHelpfulVote(reviewType: "product" | "seller", reviewId: string, userId: string): Promise<ReviewResult<{ helpfulCount: number }>> {
      return { ok: true, data: { helpfulCount: await deps.helpfulVotes.remove({ reviewType, reviewId, userId }) } };
    },

    async reportReview(input: unknown): Promise<ReviewResult<{ id: string; createdAt: string }>> {
      const parsed = reportReviewSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Review report input is invalid.", 400);
      const review =
        parsed.data.reviewType === "product"
          ? await deps.productReviews.findById(parsed.data.reviewId)
          : await deps.sellerReviews.findById(parsed.data.reviewId);
      if (!review || review.deletedAt) return failure("REVIEW_NOT_FOUND", "Review was not found.", 404);
      const report = await deps.reports.create(parsed.data);
      if (parsed.data.reviewType === "product") await deps.productReviews.incrementReportCount(parsed.data.reviewId);
      else await deps.sellerReviews.incrementReportCount(parsed.data.reviewId);
      return { ok: true, data: report };
    },

    productReviews(filters: Parameters<ReviewServiceDependencies["productReviews"]["list"]>[0]) {
      return deps.productReviews.list({ ...filters, status: filters.status ?? "published", limit: Math.min(filters.limit ?? 20, 100) });
    },

    sellerReviews(filters: Parameters<ReviewServiceDependencies["sellerReviews"]["list"]>[0]) {
      return deps.sellerReviews.list({ ...filters, status: filters.status ?? "published", limit: Math.min(filters.limit ?? 20, 100) });
    }
  };
}
