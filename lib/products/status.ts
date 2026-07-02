import type { ProductRecord, ProductStatus, StoredProductStatus } from "./types.js";

export const PRODUCT_STATUS_TRANSITIONS: Record<ProductStatus, readonly ProductStatus[]> = {
  draft: ["pending_review", "archived"],
  pending_review: ["approved", "rejected", "draft"],
  approved: ["published", "rejected", "archived"],
  published: ["approved", "suspended", "archived"],
  rejected: ["draft", "archived"],
  suspended: ["approved", "archived"],
  archived: ["draft"]
};

/**
 * Maps a stored row (status enum + publishedAt + isSuspended) to the richer application-level
 * lifecycle status. See docs/products/lifecycle.md for the full state machine and the reason
 * `approved`/`published`/`suspended` do not each have a dedicated stored enum value yet.
 */
export function normalizeProductStatus(record: Pick<ProductRecord, "status" | "publishedAt" | "isSuspended">): ProductStatus {
  if (record.status === "archived" && record.isSuspended) return "suspended";
  if (record.status === "active") return record.publishedAt ? "published" : "approved";
  return record.status;
}

/** Maps an application-level status back to what must be written to the stored columns. */
export function toStoredProductStatus(status: ProductStatus): {
  status: StoredProductStatus;
  publishedAt: "now" | "clear" | "keep";
  isSuspended: boolean;
} {
  switch (status) {
    case "approved":
      return { status: "active", publishedAt: "clear", isSuspended: false };
    case "published":
      return { status: "active", publishedAt: "now", isSuspended: false };
    case "suspended":
      return { status: "archived", publishedAt: "keep", isSuspended: true };
    case "draft":
    case "pending_review":
    case "rejected":
    case "archived":
      return { status, publishedAt: status === "draft" ? "clear" : "keep", isSuspended: false };
  }
}

export function canTransitionProductStatus(from: ProductStatus, to: ProductStatus): boolean {
  return PRODUCT_STATUS_TRANSITIONS[from].includes(to);
}

export function assertProductStatusTransition(from: ProductStatus, to: ProductStatus): void {
  if (!canTransitionProductStatus(from, to)) {
    throw new Error(`Product status cannot transition from ${from} to ${to}.`);
  }
}
