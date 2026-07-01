import { normalizeSellerStatus } from "../seller/status.js";
import { kycSubmissionSchema } from "./schemas.js";
import type { KycEventPublisher, KycProvider, KycRepository, KycResult, KycVerificationRecord } from "./types.js";

export type KycServiceDependencies = {
  repository: KycRepository;
  provider: KycProvider;
  events?: KycEventPublisher;
};

function failure(code: string, message: string, status: number): KycResult<never> {
  return { ok: false, code, message, status };
}

function withoutUndefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
}

export function createKycService(deps: KycServiceDependencies) {
  return {
    async submit(input: unknown): Promise<KycResult<KycVerificationRecord>> {
      const parsed = kycSubmissionSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "KYC submission input is invalid.", 400);

      const seller = await deps.repository.findSellerById(parsed.data.sellerId);
      if (!seller) return failure("SELLER_NOT_FOUND", "Seller account was not found.", 404);
      if (seller.ownerId !== parsed.data.userId) return failure("AUTHORIZATION_DENIED", "Only the seller owner can submit KYC.", 403);
      if (["closed", "suspended"].includes(normalizeSellerStatus(seller.status))) {
        return failure("SELLER_NOT_ELIGIBLE", "Seller is not eligible for KYC submission.", 409);
      }

      const current = await deps.repository.findLatestBySellerId(parsed.data.sellerId);
      if (current && current.status === "approved") {
        return failure("KYC_ALREADY_APPROVED", "KYC is already approved for this seller.", 409);
      }

      const providerInput = withoutUndefined({ ...parsed.data, seller });
      const providerResult = await deps.provider.createVerification(providerInput as Parameters<typeof deps.provider.createVerification>[0]);
      const metadata = {
        documents: parsed.data.documents ?? [],
        businessVerificationRequested: parsed.data.businessVerificationRequested,
        idempotencyKey: parsed.data.idempotencyKey,
        provider: providerResult.metadata ?? {}
      };

      const createInput = withoutUndefined({
        sellerId: parsed.data.sellerId,
        provider: providerResult.provider,
        providerReference: providerResult.available ? providerResult.providerReference : undefined,
        status: providerResult.status,
        metadata
      });
      const verification = await deps.repository.createVerification(createInput as Parameters<typeof deps.repository.createVerification>[0]);

      await deps.repository.updateSellerKycStatus({ sellerId: parsed.data.sellerId, status: providerResult.status });
      await deps.events?.publish({
        type: providerResult.status === "rejected" ? "seller.kyc.failed" : "seller.kyc.submitted",
        sellerId: parsed.data.sellerId,
        userId: parsed.data.userId,
        metadata: { status: providerResult.status, provider: providerResult.provider }
      });

      return { ok: true, data: verification };
    },

    async handleWebhook(input: unknown): Promise<KycResult<KycVerificationRecord>> {
      let event;
      try {
        event = await deps.provider.parseWebhook(input);
      } catch {
        return failure("VALIDATION_ERROR", "KYC webhook payload is invalid.", 400);
      }

      const verification = await deps.repository.findByProviderReference(event.providerReference);
      if (!verification) return failure("KYC_VERIFICATION_NOT_FOUND", "KYC verification was not found.", 404);

      const updateInput = withoutUndefined({
        id: verification.id,
        status: event.status,
        rejectionReason: event.rejectionReason,
        metadata: { ...verification.metadata, webhook: event.metadata ?? {} }
      });
      const updated = await deps.repository.updateVerification(updateInput as Parameters<typeof deps.repository.updateVerification>[0]);
      await deps.repository.updateSellerKycStatus({ sellerId: verification.sellerId, status: event.status });

      return { ok: true, data: updated };
    },

    async getStatus(sellerId: string, actorUserId: string): Promise<KycResult<KycVerificationRecord | null>> {
      const seller = await deps.repository.findSellerById(sellerId);
      if (!seller) return failure("SELLER_NOT_FOUND", "Seller account was not found.", 404);
      if (seller.ownerId !== actorUserId) return failure("AUTHORIZATION_DENIED", "Only seller members can view KYC status.", 403);
      return { ok: true, data: await deps.repository.findLatestBySellerId(sellerId) };
    }
  };
}
