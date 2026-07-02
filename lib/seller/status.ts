import type { SellerStatus, StoredSellerStatus } from "./types";

export const SELLER_STATUS_TRANSITIONS: Record<SellerStatus, readonly SellerStatus[]> = {
  draft: ["pending"],
  pending: ["under_review", "rejected", "closed"],
  under_review: ["approved", "rejected", "suspended"],
  approved: ["suspended", "inactive", "closed"],
  rejected: ["draft", "pending", "closed"],
  suspended: ["approved", "closed"],
  inactive: ["approved", "closed"],
  closed: []
};

export function normalizeSellerStatus(status: StoredSellerStatus): SellerStatus {
  if (status === "pending_kyc") return "pending";
  if (status === "active") return "approved";
  return status;
}

export function canTransitionSellerStatus(from: StoredSellerStatus, to: SellerStatus): boolean {
  return SELLER_STATUS_TRANSITIONS[normalizeSellerStatus(from)].includes(to);
}

export function assertSellerStatusTransition(from: StoredSellerStatus, to: SellerStatus): void {
  if (!canTransitionSellerStatus(from, to)) {
    throw new Error(`Seller status cannot transition from ${normalizeSellerStatus(from)} to ${to}.`);
  }
}
