import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createDiditProvider, createKycService, type KycRepository, type KycVerificationRecord } from "./index.js";
import type { SellerRecord } from "../seller/index.js";

const userId = "11111111-1111-4111-8111-111111111111";
const sellerId = "22222222-2222-4222-8222-222222222222";

const seller: SellerRecord = {
  id: sellerId,
  ownerId: userId,
  storeName: "Nairobi Style",
  slug: "nairobi-style",
  description: null,
  logoUrl: null,
  bannerUrl: null,
  status: "pending",
  kycStatus: "not_started",
  countryCode: "KE",
  defaultCurrency: "KES",
  supportEmail: null,
  supportPhone: null,
  metadata: {},
  createdAt: "2026-07-02T00:00:00.000Z",
  updatedAt: "2026-07-02T00:00:00.000Z"
};

function createRepository() {
  let kycStatus = seller.kycStatus;
  let record: KycVerificationRecord | null = null;

  const repository: KycRepository = {
    async findSellerById(id) {
      return id === sellerId ? { ...seller, kycStatus } : null;
    },
    async findLatestBySellerId(id) {
      return id === sellerId ? record : null;
    },
    async findByProviderReference(providerReference) {
      return record?.providerReference === providerReference ? record : null;
    },
    async createVerification(input) {
      record = {
        id: "33333333-3333-4333-8333-333333333333",
        sellerId: input.sellerId,
        provider: input.provider,
        providerReference: input.providerReference ?? null,
        status: input.status,
        submittedAt: "2026-07-02T00:00:00.000Z",
        reviewedAt: null,
        expiresAt: null,
        rejectionReason: null,
        metadata: input.metadata
      };
      return record;
    },
    async updateVerification(input) {
      assert.ok(record);
      record = {
        ...record,
        status: input.status,
        rejectionReason: input.rejectionReason ?? null,
        metadata: input.metadata ?? record.metadata
      };
      return record;
    },
    async updateSellerKycStatus(input) {
      kycStatus = input.status;
    }
  };

  return {
    repository,
    get record() {
      return record;
    }
  };
}

describe("kyc service", () => {
  it("falls back to manual review when Didit is unavailable", async () => {
    const repo = createRepository();
    const service = createKycService({ repository: repo.repository, provider: createDiditProvider(null) });

    const result = await service.submit({ sellerId, userId, documents: [{ type: "national_id", storagePath: "kyc/seller/id.png" }] });

    assert.equal(result.ok, true);
    assert.equal(repo.record?.provider, "manual");
    assert.equal(repo.record?.status, "manual_review");
  });

  it("creates a Didit verification and handles an approval webhook", async () => {
    const repo = createRepository();
    const provider = createDiditProvider({
      async createSession() {
        return { id: "didit-1", status: "pending" };
      }
    });
    const service = createKycService({ repository: repo.repository, provider });

    const submitted = await service.submit({ sellerId, userId, idempotencyKey: "seller-kyc-1" });
    assert.equal(submitted.ok, true);
    assert.equal(repo.record?.providerReference, "didit-1");

    const webhook = await service.handleWebhook({ verification_id: "didit-1", status: "approved" });
    assert.equal(webhook.ok, true);
    assert.equal(repo.record?.status, "approved");
  });
});
