import type { SellerResult, SellerStatus, SellerDashboard, SellerEventPublisher, SellerRecord, SellerRepository, SellerRoleRepository } from "./types";
import { sellerApplicationSchema, slugifyStoreName, storeProfileSchema } from "./schemas";
import { canTransitionSellerStatus, normalizeSellerStatus } from "./status";

export type SellerServiceDependencies = {
  sellers: SellerRepository;
  roles: SellerRoleRepository;
  events?: SellerEventPublisher;
};

function failure(code: string, message: string, status: number): SellerResult<never> {
  return { ok: false, code, message, status };
}

function mergeMetadata(existing: Record<string, unknown>, next: Record<string, unknown>): Record<string, unknown> {
  return { ...existing, ...next };
}

function withoutUndefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
}

function completionFor(seller: SellerRecord): number {
  const metadata = seller.metadata;
  const fields = [
    seller.storeName,
    seller.description,
    seller.logoUrl,
    seller.bannerUrl,
    metadata.storeUrl,
    metadata.businessCategory,
    seller.supportEmail,
    seller.supportPhone,
    metadata.businessAddress,
    metadata.storePolicies
  ];
  const complete = fields.filter(Boolean).length;
  return Math.round((complete / fields.length) * 100);
}

export function createSellerService(deps: SellerServiceDependencies) {
  return {
    async apply(input: unknown): Promise<SellerResult<SellerRecord>> {
      const parsed = sellerApplicationSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Seller application input is invalid.", 400);

      const existing = await deps.sellers.findByOwnerId(parsed.data.userId);
      if (existing) return failure("SELLER_ALREADY_EXISTS", "This user already owns a seller account.", 409);

      const createInput = withoutUndefined({
        ownerId: parsed.data.userId,
        storeName: parsed.data.storeName,
        slug: slugifyStoreName(parsed.data.storeName),
        description: parsed.data.storeDescription,
        status: "draft",
        kycStatus: "not_started",
        countryCode: parsed.data.countryCode,
        defaultCurrency: parsed.data.defaultCurrency,
        supportEmail: parsed.data.supportEmail,
        supportPhone: parsed.data.supportPhone,
        metadata: {
          storeUrl: parsed.data.storeUrl,
          businessCategory: parsed.data.businessCategory,
          businessAddress: parsed.data.businessAddress,
          taxInformation: parsed.data.taxInformation,
          visibility: "private"
        }
      });
      const seller = await deps.sellers.createSeller(createInput as Parameters<typeof deps.sellers.createSeller>[0]);

      await deps.sellers.addOwnerMember({ sellerId: seller.id, userId: parsed.data.userId });
      await deps.roles.grantSellerRole({ userId: parsed.data.userId, grantedBy: parsed.data.userId });
      await deps.events?.publish({
        type: "seller.application.received",
        sellerId: seller.id,
        userId: parsed.data.userId
      });

      return { ok: true, data: seller };
    },

    async updateStore(input: unknown, actorUserId: string): Promise<SellerResult<SellerRecord>> {
      const parsed = storeProfileSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Store profile input is invalid.", 400);

      const seller = await deps.sellers.findById(parsed.data.sellerId);
      if (!seller) return failure("SELLER_NOT_FOUND", "Seller account was not found.", 404);
      if (seller.ownerId !== actorUserId) return failure("AUTHORIZATION_DENIED", "Only the seller owner can update this store.", 403);
      if (normalizeSellerStatus(seller.status) === "closed") return failure("SELLER_CLOSED", "Closed seller accounts cannot be updated.", 409);

      const metadata = mergeMetadata(seller.metadata, {
        storeUrl: parsed.data.storeUrl ?? seller.metadata.storeUrl,
        businessCategory: parsed.data.businessCategory ?? seller.metadata.businessCategory,
        businessAddress: parsed.data.businessAddress ?? seller.metadata.businessAddress,
        storePolicies: parsed.data.storePolicies ?? seller.metadata.storePolicies,
        socialLinks: parsed.data.socialLinks ?? seller.metadata.socialLinks,
        businessHours: parsed.data.businessHours ?? seller.metadata.businessHours,
        visibility: parsed.data.visibility ?? seller.metadata.visibility
      });

      const values = withoutUndefined({
        storeName: parsed.data.storeName,
        slug: parsed.data.storeName ? slugifyStoreName(parsed.data.storeName) : undefined,
        description: parsed.data.storeDescription,
        logoUrl: parsed.data.logoUrl,
        bannerUrl: parsed.data.bannerUrl,
        supportEmail: parsed.data.supportEmail,
        supportPhone: parsed.data.supportPhone,
        metadata
      });

      const updated = await deps.sellers.updateSeller({
        sellerId: seller.id,
        values: values as Parameters<typeof deps.sellers.updateSeller>[0]["values"]
      });

      return { ok: true, data: updated };
    },

    async submitApplication(sellerId: string, actorUserId: string): Promise<SellerResult<SellerRecord>> {
      const seller = await deps.sellers.findById(sellerId);
      if (!seller) return failure("SELLER_NOT_FOUND", "Seller account was not found.", 404);
      if (seller.ownerId !== actorUserId) return failure("AUTHORIZATION_DENIED", "Only the seller owner can submit this application.", 403);
      if (!canTransitionSellerStatus(seller.status, "pending")) {
        return failure("INVALID_STATUS_TRANSITION", "Seller application cannot be submitted from its current status.", 409);
      }

      const updated = await deps.sellers.updateSeller({ sellerId, values: { status: "pending" } });
      return { ok: true, data: updated };
    },

    async transitionStatus(sellerId: string, nextStatus: SellerStatus): Promise<SellerResult<SellerRecord>> {
      const seller = await deps.sellers.findById(sellerId);
      if (!seller) return failure("SELLER_NOT_FOUND", "Seller account was not found.", 404);
      if (!canTransitionSellerStatus(seller.status, nextStatus)) {
        return failure("INVALID_STATUS_TRANSITION", "Seller status transition is not allowed.", 409);
      }

      const updated = await deps.sellers.updateSeller({ sellerId, values: { status: nextStatus } });
      if (nextStatus === "approved") {
        await deps.events?.publish({ type: "seller.approved", sellerId, userId: seller.ownerId });
      }
      if (nextStatus === "rejected") {
        await deps.events?.publish({ type: "seller.rejected", sellerId, userId: seller.ownerId });
      }

      return { ok: true, data: updated };
    },

    async getBySlug(slug: string): Promise<SellerResult<SellerRecord>> {
      const seller = await deps.sellers.findBySlug(slug);
      if (!seller) return failure("SELLER_NOT_FOUND", "Seller not found.", 404);
      return { ok: true, data: seller };
    },

    async getDashboard(sellerId: string, actorUserId: string): Promise<SellerResult<SellerDashboard>> {
      const seller = await deps.sellers.findById(sellerId);
      if (!seller) return failure("SELLER_NOT_FOUND", "Seller account was not found.", 404);
      if (seller.ownerId !== actorUserId) return failure("AUTHORIZATION_DENIED", "Only seller members can view this dashboard.", 403);

      return {
        ok: true,
        data: {
          seller,
          applicationStatus: normalizeSellerStatus(seller.status),
          kycStatus: seller.kycStatus,
          storeCompletion: completionFor(seller),
          statistics: {
            productsReady: normalizeSellerStatus(seller.status) === "approved" && seller.kycStatus === "approved",
            salesAnalyticsReady: false
          },
          recentActivity: [],
          notifications: [],
          quickActions: ["complete-store-profile", "submit-kyc", "review-application-status"]
        }
      };
    }
  };
}
