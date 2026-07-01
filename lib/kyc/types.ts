import type { KycStatus, SellerNotificationEvent, SellerRecord } from "../seller/types.js";

export type KycDocumentInput = {
  type: "national_id" | "passport" | "business_registration" | "tax_certificate" | "proof_of_address";
  storagePath: string;
};

export type KycSubmissionInput = {
  sellerId: string;
  userId: string;
  documents?: KycDocumentInput[];
  businessVerificationRequested?: boolean;
  idempotencyKey?: string;
};

export type KycVerificationRecord = {
  id: string;
  sellerId: string;
  provider: "didit" | "manual";
  providerReference: string | null;
  status: KycStatus;
  submittedAt: string;
  reviewedAt: string | null;
  expiresAt: string | null;
  rejectionReason: string | null;
  metadata: Record<string, unknown>;
};

export type KycProviderResult =
  | {
      available: true;
      provider: "didit";
      providerReference: string;
      status: Exclude<KycStatus, "not_started">;
      metadata?: Record<string, unknown>;
    }
  | {
      available: false;
      provider: "manual";
      status: "manual_review";
      metadata?: Record<string, unknown>;
    };

export type KycProvider = {
  createVerification(input: KycSubmissionInput & { seller: SellerRecord }): Promise<KycProviderResult>;
  parseWebhook(input: unknown): Promise<KycWebhookEvent>;
};

export type KycWebhookEvent = {
  providerReference: string;
  status: Exclude<KycStatus, "not_started">;
  rejectionReason?: string;
  metadata?: Record<string, unknown>;
};

export type KycRepository = {
  findSellerById(sellerId: string): Promise<SellerRecord | null>;
  findLatestBySellerId(sellerId: string): Promise<KycVerificationRecord | null>;
  findByProviderReference(providerReference: string): Promise<KycVerificationRecord | null>;
  createVerification(input: {
    sellerId: string;
    provider: "didit" | "manual";
    providerReference?: string;
    status: Exclude<KycStatus, "not_started">;
    metadata: Record<string, unknown>;
  }): Promise<KycVerificationRecord>;
  updateVerification(input: {
    id: string;
    status: Exclude<KycStatus, "not_started">;
    rejectionReason?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<KycVerificationRecord>;
  updateSellerKycStatus(input: { sellerId: string; status: KycStatus }): Promise<void>;
};

export type KycEventPublisher = {
  publish(event: { type: SellerNotificationEvent; sellerId: string; userId: string; metadata?: Record<string, unknown> }): Promise<void>;
};

export type KycResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; status: number };
