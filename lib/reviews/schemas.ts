import { z } from "zod";

const starRating = z.number().int().min(1).max(5);

export const reviewMediaSchema = z.object({
  publicId: z.string().min(1).max(255),
  secureUrl: z.string().url(),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  bytes: z.number().int().positive(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  position: z.number().int().min(0).optional(),
  altText: z.string().max(160).optional()
});

export const createProductReviewSchema = z.object({
  buyerId: z.string().uuid(),
  orderItemId: z.string().uuid(),
  rating: starRating,
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(10).max(5000),
  media: z.array(reviewMediaSchema).max(8).optional()
});

export const updateProductReviewSchema = z.object({
  reviewId: z.string().uuid(),
  buyerId: z.string().uuid(),
  rating: starRating.optional(),
  title: z.string().trim().min(3).max(120).optional(),
  body: z.string().trim().min(10).max(5000).optional(),
  media: z.array(reviewMediaSchema).max(8).optional(),
  now: z.date().optional()
});

export const createSellerReviewSchema = z.object({
  buyerId: z.string().uuid(),
  orderId: z.string().uuid(),
  sellerId: z.string().uuid(),
  overallRating: starRating,
  communicationRating: starRating,
  shippingRating: starRating,
  packagingRating: starRating,
  feedback: z.string().trim().min(10).max(5000)
});

export const reportReviewSchema = z.object({
  reviewType: z.enum(["product", "seller"]),
  reviewId: z.string().uuid(),
  reporterId: z.string().uuid(),
  reason: z.enum(["spam", "offensive_content", "abuse", "fake_review", "copyright", "other"]),
  description: z.string().trim().max(2000).optional()
});

export const reviewListFiltersSchema = z.object({
  productId: z.string().uuid().optional(),
  sellerId: z.string().uuid().optional(),
  rating: starRating.optional(),
  verifiedOnly: z.boolean().optional(),
  withImages: z.boolean().optional(),
  status: z.enum(["pending", "published", "hidden", "removed"]).optional(),
  sort: z.enum(["most_recent", "most_helpful", "lowest_rating", "highest_rating"]).optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional()
});
