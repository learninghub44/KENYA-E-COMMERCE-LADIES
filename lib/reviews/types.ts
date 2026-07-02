import type { AdminActor, AdminResult, CursorPage } from "../audit/types.js";
import type { PlatformEventType } from "../notifications/types.js";

export type ReviewResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; status: number };

export type ReviewStatus = "pending" | "published" | "hidden" | "removed";
export type ReportReviewReason = "spam" | "offensive_content" | "abuse" | "fake_review" | "copyright" | "other";
export type ReviewSort = "most_recent" | "most_helpful" | "lowest_rating" | "highest_rating";

export type ReviewMediaInput = {
  publicId: string;
  secureUrl: string;
  mimeType: string;
  bytes: number;
  width?: number | undefined;
  height?: number | undefined;
  position?: number | undefined;
  altText?: string | undefined;
};

export type ReviewMediaRecord = ReviewMediaInput & {
  id: string;
  reviewId: string;
  position: number;
  deletedAt: string | null;
  createdAt: string;
};

export type ProductReviewRecord = {
  id: string;
  productId: string;
  sellerId: string;
  buyerId: string;
  orderId: string;
  orderItemId: string;
  rating: number;
  title: string;
  body: string;
  status: ReviewStatus;
  isVerifiedPurchase: true;
  helpfulCount: number;
  reportCount: number;
  publishedAt: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  media: ReviewMediaRecord[];
};

export type SellerReviewRecord = {
  id: string;
  sellerId: string;
  buyerId: string;
  orderId: string;
  overallRating: number;
  communicationRating: number;
  shippingRating: number;
  packagingRating: number;
  feedback: string;
  status: ReviewStatus;
  helpfulCount: number;
  reportCount: number;
  publishedAt: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CompletedOrderItemForReview = {
  orderId: string;
  orderItemId: string;
  productId: string;
  sellerId: string;
  buyerId: string;
  orderStatus: "completed";
};

export type CreateProductReviewInput = {
  buyerId: string;
  orderItemId: string;
  rating: number;
  title: string;
  body: string;
  media?: ReviewMediaInput[] | undefined;
};

export type UpdateProductReviewInput = {
  reviewId: string;
  buyerId: string;
  title?: string | undefined;
  body?: string | undefined;
  rating?: number | undefined;
  media?: ReviewMediaInput[] | undefined;
  now?: Date | undefined;
};

export type CreateSellerReviewInput = {
  buyerId: string;
  orderId: string;
  sellerId: string;
  overallRating: number;
  communicationRating: number;
  shippingRating: number;
  packagingRating: number;
  feedback: string;
};

export type ReviewListFilters = {
  productId?: string | undefined;
  sellerId?: string | undefined;
  rating?: number | undefined;
  verifiedOnly?: boolean | undefined;
  withImages?: boolean | undefined;
  status?: ReviewStatus | undefined;
  sort?: ReviewSort | undefined;
  cursor?: string | undefined;
  limit?: number | undefined;
};

export type RatingSummary = {
  entityType: "product" | "seller";
  entityId: string;
  averageRating: number;
  totalReviews: number;
  verifiedReviews: number;
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  score: number;
  updatedAt: string;
};

export type ProductReviewRepository = {
  findById(reviewId: string): Promise<ProductReviewRecord | null>;
  findByOrderItem(orderItemId: string): Promise<ProductReviewRecord | null>;
  create(input: Omit<ProductReviewRecord, "id" | "createdAt" | "updatedAt" | "media"> & { media: ReviewMediaInput[] }): Promise<ProductReviewRecord>;
  update(input: {
    reviewId: string;
    values: Partial<Pick<ProductReviewRecord, "rating" | "title" | "body" | "status" | "editedAt" | "deletedAt" | "publishedAt">>;
    media?: ReviewMediaInput[] | undefined;
  }): Promise<ProductReviewRecord>;
  list(filters: ReviewListFilters): Promise<CursorPage<ProductReviewRecord>>;
  incrementReportCount(reviewId: string): Promise<ProductReviewRecord>;
};

export type SellerReviewRepository = {
  findById(reviewId: string): Promise<SellerReviewRecord | null>;
  findByOrderSeller(input: { orderId: string; sellerId: string; buyerId: string }): Promise<SellerReviewRecord | null>;
  create(input: Omit<SellerReviewRecord, "id" | "createdAt" | "updatedAt">): Promise<SellerReviewRecord>;
  update(input: { reviewId: string; values: Partial<Pick<SellerReviewRecord, "status" | "editedAt" | "deletedAt" | "publishedAt">> }): Promise<SellerReviewRecord>;
  list(filters: ReviewListFilters): Promise<CursorPage<SellerReviewRecord>>;
  incrementReportCount(reviewId: string): Promise<SellerReviewRecord>;
};

export type ReviewEligibilityRepository = {
  findCompletedOrderItem(input: { buyerId: string; orderItemId: string }): Promise<CompletedOrderItemForReview | null>;
  buyerCompletedOrder(input: { buyerId: string; orderId: string; sellerId: string }): Promise<boolean>;
};

export type HelpfulVoteRepository = {
  hasVoted(input: { reviewType: "product" | "seller"; reviewId: string; userId: string }): Promise<boolean>;
  add(input: { reviewType: "product" | "seller"; reviewId: string; userId: string }): Promise<number>;
  remove(input: { reviewType: "product" | "seller"; reviewId: string; userId: string }): Promise<number>;
};

export type ReviewReportRepository = {
  create(input: {
    reviewType: "product" | "seller";
    reviewId: string;
    reporterId: string;
    reason: ReportReviewReason;
    description?: string | undefined;
  }): Promise<{ id: string; createdAt: string }>;
};

export type ReviewEventPublisher = {
  publish(input: {
    eventType: Extract<PlatformEventType, "review.created">;
    entityType: "review";
    entityId: string;
    actorId: string;
    payload: Record<string, unknown>;
  }): Promise<void>;
};

export type ReviewAuditWriter = {
  writeAdminAudit(input: {
    actor: AdminActor;
    action: string;
    entityType: "report" | "moderation";
    entityId: string;
    oldValues?: Record<string, unknown> | undefined;
    newValues?: Record<string, unknown> | undefined;
    metadata?: Record<string, unknown> | undefined;
  }): Promise<void>;
};

export type ReviewServiceDependencies = {
  productReviews: ProductReviewRepository;
  sellerReviews: SellerReviewRepository;
  eligibility: ReviewEligibilityRepository;
  helpfulVotes: HelpfulVoteRepository;
  reports: ReviewReportRepository;
  events?: ReviewEventPublisher | undefined;
  audit?: ReviewAuditWriter | undefined;
  editWindowHours?: number | undefined;
  maxImages?: number | undefined;
  maxImageBytes?: number | undefined;
};

export type ReviewModerationInput = {
  actor: AdminActor;
  reviewType: "product" | "seller";
  reviewId: string;
  status: ReviewStatus;
  reason: string;
};

export type ReviewModerationResult<T> = AdminResult<T>;
