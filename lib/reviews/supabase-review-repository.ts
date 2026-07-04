import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CursorPage
} from "../audit/types";
import type {
  CompletedOrderItemForReview,
  HelpfulVoteRepository,
  ProductReviewRecord,
  ProductReviewRepository,
  ReviewEligibilityRepository,
  ReviewListFilters,
  ReviewMediaInput,
  ReviewMediaRecord,
  ReviewReportRepository,
  SellerReviewRecord,
  SellerReviewRepository
} from "./types";

type ReviewMediaRow = {
  id: string;
  review_id: string;
  public_id: string;
  secure_url: string;
  mime_type: string;
  bytes: number;
  width: number | null;
  height: number | null;
  position: number;
  alt_text: string | null;
  deleted_at: string | null;
  created_at: string;
};

function toMediaRecord(row: ReviewMediaRow): ReviewMediaRecord {
  return {
    id: row.id,
    reviewId: row.review_id,
    publicId: row.public_id,
    secureUrl: row.secure_url,
    mimeType: row.mime_type,
    bytes: row.bytes,
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    position: row.position,
    altText: row.alt_text ?? undefined,
    deletedAt: row.deleted_at,
    createdAt: row.created_at
  };
}

type ProductReviewRow = {
  id: string;
  product_id: string;
  seller_id: string;
  buyer_id: string;
  order_id: string;
  order_item_id: string;
  rating: number;
  title: string;
  body: string;
  status: ProductReviewRecord["status"];
  is_verified_purchase: true;
  helpful_count: number;
  report_count: number;
  published_at: string | null;
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

const PRODUCT_REVIEW_COLUMNS =
  "id, product_id, seller_id, buyer_id, order_id, order_item_id, rating, title, body, status, is_verified_purchase, helpful_count, report_count, published_at, edited_at, deleted_at, created_at, updated_at";

async function loadMedia(client: SupabaseClient, reviewIds: string[]): Promise<Map<string, ReviewMediaRecord[]>> {
  if (reviewIds.length === 0) return new Map();
  const { data, error } = await client
    .from("review_media")
    .select("id, review_id, public_id, secure_url, mime_type, bytes, width, height, position, alt_text, deleted_at, created_at")
    .in("review_id", reviewIds)
    .is("deleted_at", null)
    .order("position", { ascending: true });
  if (error) throw new Error(`Failed to load review media: ${error.message}`);

  const byReview = new Map<string, ReviewMediaRecord[]>();
  for (const row of (data ?? []) as ReviewMediaRow[]) {
    const list = byReview.get(row.review_id) ?? [];
    list.push(toMediaRecord(row));
    byReview.set(row.review_id, list);
  }
  return byReview;
}

async function toProductReviewRecord(client: SupabaseClient, row: ProductReviewRow): Promise<ProductReviewRecord> {
  const media = await loadMedia(client, [row.id]);
  return {
    id: row.id,
    productId: row.product_id,
    sellerId: row.seller_id,
    buyerId: row.buyer_id,
    orderId: row.order_id,
    orderItemId: row.order_item_id,
    rating: row.rating,
    title: row.title,
    body: row.body,
    status: row.status,
    isVerifiedPurchase: row.is_verified_purchase,
    helpfulCount: row.helpful_count,
    reportCount: row.report_count,
    publishedAt: row.published_at,
    editedAt: row.edited_at,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    media: media.get(row.id) ?? []
  };
}

function applySort(query: any, sort: ReviewListFilters["sort"]) {
  switch (sort) {
    case "most_helpful":
      return query.order("helpful_count", { ascending: false }).order("created_at", { ascending: false });
    case "lowest_rating":
      return query.order("rating", { ascending: true }).order("created_at", { ascending: false });
    case "highest_rating":
      return query.order("rating", { ascending: false }).order("created_at", { ascending: false });
    case "most_recent":
    default:
      return query.order("created_at", { ascending: false });
  }
}

export function createSupabaseProductReviewRepository(client: SupabaseClient): ProductReviewRepository {
  return {
    async findById(reviewId: string): Promise<ProductReviewRecord | null> {
      const { data, error } = await client
        .from("product_reviews")
        .select(PRODUCT_REVIEW_COLUMNS)
        .eq("id", reviewId)
        .maybeSingle();
      if (error) throw new Error(`Failed to load review: ${error.message}`);
      return data ? toProductReviewRecord(client, data as ProductReviewRow) : null;
    },

    async findByOrderItem(orderItemId: string): Promise<ProductReviewRecord | null> {
      const { data, error } = await client
        .from("product_reviews")
        .select(PRODUCT_REVIEW_COLUMNS)
        .eq("order_item_id", orderItemId)
        .maybeSingle();
      if (error) throw new Error(`Failed to load review for order item: ${error.message}`);
      return data ? toProductReviewRecord(client, data as ProductReviewRow) : null;
    },

    async create(input): Promise<ProductReviewRecord> {
      const { data, error } = await client
        .from("product_reviews")
        .insert({
          product_id: input.productId,
          seller_id: input.sellerId,
          buyer_id: input.buyerId,
          order_id: input.orderId,
          order_item_id: input.orderItemId,
          rating: input.rating,
          title: input.title,
          body: input.body,
          status: input.status,
          is_verified_purchase: input.isVerifiedPurchase,
          helpful_count: input.helpfulCount,
          report_count: input.reportCount,
          published_at: input.publishedAt,
          edited_at: input.editedAt,
          deleted_at: input.deletedAt
        })
        .select(PRODUCT_REVIEW_COLUMNS)
        .single();
      if (error) throw new Error(`Failed to create review: ${error.message}`);

      if (input.media.length > 0) {
        const { error: mediaError } = await client.from("review_media").insert(
          input.media.map((m: ReviewMediaInput, i: number) => ({
            review_id: data.id,
            public_id: m.publicId,
            secure_url: m.secureUrl,
            mime_type: m.mimeType,
            bytes: m.bytes,
            width: m.width ?? null,
            height: m.height ?? null,
            position: m.position ?? i,
            alt_text: m.altText ?? null
          }))
        );
        if (mediaError) throw new Error(`Failed to attach review media: ${mediaError.message}`);
      }

      return toProductReviewRecord(client, data as ProductReviewRow);
    },

    async update(input): Promise<ProductReviewRecord> {
      const values: Record<string, unknown> = {};
      if (input.values.rating !== undefined) values.rating = input.values.rating;
      if (input.values.title !== undefined) values.title = input.values.title;
      if (input.values.body !== undefined) values.body = input.values.body;
      if (input.values.status !== undefined) values.status = input.values.status;
      if (input.values.editedAt !== undefined) values.edited_at = input.values.editedAt;
      if (input.values.deletedAt !== undefined) values.deleted_at = input.values.deletedAt;
      if (input.values.publishedAt !== undefined) values.published_at = input.values.publishedAt;

      const { data, error } = await client
        .from("product_reviews")
        .update(values)
        .eq("id", input.reviewId)
        .select(PRODUCT_REVIEW_COLUMNS)
        .single();
      if (error) throw new Error(`Failed to update review: ${error.message}`);

      if (input.media !== undefined) {
        const { error: deleteError } = await client
          .from("review_media")
          .update({ deleted_at: new Date().toISOString() })
          .eq("review_id", input.reviewId)
          .is("deleted_at", null);
        if (deleteError) throw new Error(`Failed to clear existing review media: ${deleteError.message}`);

        if (input.media.length > 0) {
          const { error: mediaError } = await client.from("review_media").insert(
            input.media.map((m, i) => ({
              review_id: input.reviewId,
              public_id: m.publicId,
              secure_url: m.secureUrl,
              mime_type: m.mimeType,
              bytes: m.bytes,
              width: m.width ?? null,
              height: m.height ?? null,
              position: m.position ?? i,
              alt_text: m.altText ?? null
            }))
          );
          if (mediaError) throw new Error(`Failed to attach review media: ${mediaError.message}`);
        }
      }

      return toProductReviewRecord(client, data as ProductReviewRow);
    },

    async list(filters: ReviewListFilters): Promise<CursorPage<ProductReviewRecord>> {
      const limit = Math.min(filters.limit ?? 20, 100);
      let query = client.from("product_reviews").select(PRODUCT_REVIEW_COLUMNS).is("deleted_at", null);
      if (filters.productId) query = query.eq("product_id", filters.productId);
      if (filters.sellerId) query = query.eq("seller_id", filters.sellerId);
      if (filters.rating) query = query.eq("rating", filters.rating);
      if (filters.verifiedOnly) query = query.eq("is_verified_purchase", true);
      if (filters.status) query = query.eq("status", filters.status);
      query = applySort(query, filters.sort);
      query = query.limit(limit + 1);
      if (filters.cursor) query = query.lt("created_at", filters.cursor);

      const { data, error } = await query;
      if (error) throw new Error(`Failed to list reviews: ${error.message}`);
      const rows = (data ?? []) as ProductReviewRow[];
      const page = rows.slice(0, limit);
      const items = await Promise.all(page.map((row) => toProductReviewRecord(client, row)));
      return {
        items,
        nextCursor: rows.length > limit ? page[page.length - 1]!.created_at : null
      };
    },

    async incrementReportCount(reviewId: string): Promise<ProductReviewRecord> {
      const { data: current, error: readError } = await client
        .from("product_reviews")
        .select("report_count")
        .eq("id", reviewId)
        .single();
      if (readError) throw new Error(`Failed to load review: ${readError.message}`);
      const { data, error } = await client
        .from("product_reviews")
        .update({ report_count: (current.report_count ?? 0) + 1 })
        .eq("id", reviewId)
        .select(PRODUCT_REVIEW_COLUMNS)
        .single();
      if (error) throw new Error(`Failed to increment report count: ${error.message}`);
      return toProductReviewRecord(client, data as ProductReviewRow);
    }
  };
}

type SellerReviewRow = {
  id: string;
  seller_id: string;
  buyer_id: string;
  order_id: string;
  overall_rating: number;
  communication_rating: number;
  shipping_rating: number;
  packaging_rating: number;
  feedback: string;
  status: SellerReviewRecord["status"];
  helpful_count: number;
  report_count: number;
  published_at: string | null;
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

const SELLER_REVIEW_COLUMNS =
  "id, seller_id, buyer_id, order_id, overall_rating, communication_rating, shipping_rating, packaging_rating, feedback, status, helpful_count, report_count, published_at, edited_at, deleted_at, created_at, updated_at";

function toSellerReviewRecord(row: SellerReviewRow): SellerReviewRecord {
  return {
    id: row.id,
    sellerId: row.seller_id,
    buyerId: row.buyer_id,
    orderId: row.order_id,
    overallRating: row.overall_rating,
    communicationRating: row.communication_rating,
    shippingRating: row.shipping_rating,
    packagingRating: row.packaging_rating,
    feedback: row.feedback,
    status: row.status,
    helpfulCount: row.helpful_count,
    reportCount: row.report_count,
    publishedAt: row.published_at,
    editedAt: row.edited_at,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function createSupabaseSellerReviewRepository(client: SupabaseClient): SellerReviewRepository {
  return {
    async findById(reviewId: string): Promise<SellerReviewRecord | null> {
      const { data, error } = await client.from("seller_reviews").select(SELLER_REVIEW_COLUMNS).eq("id", reviewId).maybeSingle();
      if (error) throw new Error(`Failed to load seller review: ${error.message}`);
      return data ? toSellerReviewRecord(data as SellerReviewRow) : null;
    },

    async findByOrderSeller(input): Promise<SellerReviewRecord | null> {
      const { data, error } = await client
        .from("seller_reviews")
        .select(SELLER_REVIEW_COLUMNS)
        .eq("order_id", input.orderId)
        .eq("seller_id", input.sellerId)
        .eq("buyer_id", input.buyerId)
        .maybeSingle();
      if (error) throw new Error(`Failed to load seller review: ${error.message}`);
      return data ? toSellerReviewRecord(data as SellerReviewRow) : null;
    },

    async create(input): Promise<SellerReviewRecord> {
      const { data, error } = await client
        .from("seller_reviews")
        .insert({
          seller_id: input.sellerId,
          buyer_id: input.buyerId,
          order_id: input.orderId,
          overall_rating: input.overallRating,
          communication_rating: input.communicationRating,
          shipping_rating: input.shippingRating,
          packaging_rating: input.packagingRating,
          feedback: input.feedback,
          status: input.status,
          helpful_count: input.helpfulCount,
          report_count: input.reportCount,
          published_at: input.publishedAt,
          edited_at: input.editedAt,
          deleted_at: input.deletedAt
        })
        .select(SELLER_REVIEW_COLUMNS)
        .single();
      if (error) throw new Error(`Failed to create seller review: ${error.message}`);
      return toSellerReviewRecord(data as SellerReviewRow);
    },

    async update(input): Promise<SellerReviewRecord> {
      const values: Record<string, unknown> = {};
      if (input.values.status !== undefined) values.status = input.values.status;
      if (input.values.editedAt !== undefined) values.edited_at = input.values.editedAt;
      if (input.values.deletedAt !== undefined) values.deleted_at = input.values.deletedAt;
      if (input.values.publishedAt !== undefined) values.published_at = input.values.publishedAt;
      const { data, error } = await client
        .from("seller_reviews")
        .update(values)
        .eq("id", input.reviewId)
        .select(SELLER_REVIEW_COLUMNS)
        .single();
      if (error) throw new Error(`Failed to update seller review: ${error.message}`);
      return toSellerReviewRecord(data as SellerReviewRow);
    },

    async list(filters: ReviewListFilters): Promise<CursorPage<SellerReviewRecord>> {
      const limit = Math.min(filters.limit ?? 20, 100);
      let query = client.from("seller_reviews").select(SELLER_REVIEW_COLUMNS).is("deleted_at", null);
      if (filters.sellerId) query = query.eq("seller_id", filters.sellerId);
      if (filters.status) query = query.eq("status", filters.status);
      query = query.order("created_at", { ascending: false }).limit(limit + 1);
      if (filters.cursor) query = query.lt("created_at", filters.cursor);

      const { data, error } = await query;
      if (error) throw new Error(`Failed to list seller reviews: ${error.message}`);
      const rows = (data ?? []) as SellerReviewRow[];
      const page = rows.slice(0, limit);
      return {
        items: page.map(toSellerReviewRecord),
        nextCursor: rows.length > limit ? page[page.length - 1]!.created_at : null
      };
    },

    async incrementReportCount(reviewId: string): Promise<SellerReviewRecord> {
      const { data: current, error: readError } = await client
        .from("seller_reviews")
        .select("report_count")
        .eq("id", reviewId)
        .single();
      if (readError) throw new Error(`Failed to load seller review: ${readError.message}`);
      const { data, error } = await client
        .from("seller_reviews")
        .update({ report_count: (current.report_count ?? 0) + 1 })
        .eq("id", reviewId)
        .select(SELLER_REVIEW_COLUMNS)
        .single();
      if (error) throw new Error(`Failed to increment report count: ${error.message}`);
      return toSellerReviewRecord(data as SellerReviewRow);
    }
  };
}

export function createSupabaseReviewEligibilityRepository(client: SupabaseClient): ReviewEligibilityRepository {
  return {
    async findCompletedOrderItem(input): Promise<CompletedOrderItemForReview | null> {
      const { data, error } = await client
        .from("order_items")
        .select("id, product_id, seller_id, order_id, orders!inner(id, buyer_id, status)")
        .eq("id", input.orderItemId)
        .eq("orders.buyer_id", input.buyerId)
        .eq("orders.status", "completed")
        .maybeSingle();
      if (error) throw new Error(`Failed to verify purchase: ${error.message}`);
      if (!data || !data.product_id) return null;

      return {
        orderId: data.order_id as string,
        orderItemId: data.id as string,
        productId: data.product_id as string,
        sellerId: data.seller_id as string,
        buyerId: input.buyerId,
        orderStatus: "completed"
      };
    },

    async buyerCompletedOrder(input): Promise<boolean> {
      const { data, error } = await client
        .from("orders")
        .select("id")
        .eq("id", input.orderId)
        .eq("buyer_id", input.buyerId)
        .eq("seller_id", input.sellerId)
        .eq("status", "completed")
        .maybeSingle();
      if (error) throw new Error(`Failed to verify purchase: ${error.message}`);
      return data !== null;
    }
  };
}

export function createSupabaseHelpfulVoteRepository(client: SupabaseClient): HelpfulVoteRepository {
  const table = (reviewType: "product" | "seller") => (reviewType === "product" ? "product_reviews" : "seller_reviews");

  return {
    async hasVoted(input): Promise<boolean> {
      const { data, error } = await client
        .from("review_helpful_votes")
        .select("id")
        .eq("review_type", input.reviewType)
        .eq("review_id", input.reviewId)
        .eq("user_id", input.userId)
        .maybeSingle();
      if (error) throw new Error(`Failed to check helpful vote: ${error.message}`);
      return data !== null;
    },

    async add(input): Promise<number> {
      const { error: insertError } = await client
        .from("review_helpful_votes")
        .insert({ review_type: input.reviewType, review_id: input.reviewId, user_id: input.userId });
      if (insertError) throw new Error(`Failed to add helpful vote: ${insertError.message}`);

      const { data: current, error: readError } = await client
        .from(table(input.reviewType))
        .select("helpful_count")
        .eq("id", input.reviewId)
        .single();
      if (readError) throw new Error(`Failed to load review: ${readError.message}`);
      const nextCount = (current.helpful_count ?? 0) + 1;
      const { error: updateError } = await client.from(table(input.reviewType)).update({ helpful_count: nextCount }).eq("id", input.reviewId);
      if (updateError) throw new Error(`Failed to update helpful count: ${updateError.message}`);
      return nextCount;
    },

    async remove(input): Promise<number> {
      const { error: deleteError } = await client
        .from("review_helpful_votes")
        .delete()
        .eq("review_type", input.reviewType)
        .eq("review_id", input.reviewId)
        .eq("user_id", input.userId);
      if (deleteError) throw new Error(`Failed to remove helpful vote: ${deleteError.message}`);

      const { data: current, error: readError } = await client
        .from(table(input.reviewType))
        .select("helpful_count")
        .eq("id", input.reviewId)
        .single();
      if (readError) throw new Error(`Failed to load review: ${readError.message}`);
      const nextCount = Math.max(0, (current.helpful_count ?? 0) - 1);
      const { error: updateError } = await client.from(table(input.reviewType)).update({ helpful_count: nextCount }).eq("id", input.reviewId);
      if (updateError) throw new Error(`Failed to update helpful count: ${updateError.message}`);
      return nextCount;
    }
  };
}

export function createSupabaseReviewReportRepository(client: SupabaseClient): ReviewReportRepository {
  return {
    async create(input): Promise<{ id: string; createdAt: string }> {
      const { data, error } = await client
        .from("review_reports")
        .insert({
          review_type: input.reviewType,
          review_id: input.reviewId,
          reporter_id: input.reporterId,
          reason: input.reason,
          description: input.description ?? null
        })
        .select("id, created_at")
        .single();
      if (error) throw new Error(`Failed to file review report: ${error.message}`);
      return { id: data.id as string, createdAt: data.created_at as string };
    }
  };
}
