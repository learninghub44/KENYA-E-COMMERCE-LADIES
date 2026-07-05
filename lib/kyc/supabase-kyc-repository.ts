import type { SupabaseClient } from "@supabase/supabase-js";
import type { SellerRecord } from "../seller/types";
import type { KycRepository, KycVerificationRecord } from "./types";

function mapSeller(row: Record<string, unknown>): SellerRecord {
  return {
    id: row.id as string,
    ownerId: row.owner_id as string,
    storeName: row.store_name as string,
    slug: row.slug as string,
    description: row.description as string | null,
    logoUrl: row.logo_url as string | null,
    bannerUrl: row.banner_url as string | null,
    status: row.status as SellerRecord["status"],
    kycStatus: row.kyc_status as SellerRecord["kycStatus"],
    countryCode: row.country_code as string | null,
    defaultCurrency: row.default_currency as string,
    supportEmail: row.support_email as string | null,
    supportPhone: row.support_phone as string | null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapVerification(row: Record<string, unknown>): KycVerificationRecord {
  return {
    id: row.id as string,
    sellerId: row.seller_id as string,
    provider: row.provider as "didit" | "manual",
    providerReference: row.provider_reference as string | null,
    status: row.status as KycVerificationRecord["status"],
    submittedAt: row.submitted_at as string,
    reviewedAt: row.reviewed_at as string | null,
    expiresAt: row.expires_at as string | null,
    rejectionReason: row.rejection_reason as string | null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
  };
}

export function createSupabaseKycRepository(client: SupabaseClient): KycRepository {
  return {
    async findSellerById(sellerId: string): Promise<SellerRecord | null> {
      const { data, error } = await client
        .from("sellers")
        .select("*")
        .eq("id", sellerId)
        .maybeSingle();

      if (error || !data) return null;
      return mapSeller(data as Record<string, unknown>);
    },

    async findLatestBySellerId(sellerId: string): Promise<KycVerificationRecord | null> {
      const { data, error } = await client
        .from("kyc_verifications")
        .select("*")
        .eq("seller_id", sellerId)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;
      return mapVerification(data as Record<string, unknown>);
    },

    async findByProviderReference(providerReference: string): Promise<KycVerificationRecord | null> {
      const { data, error } = await client
        .from("kyc_verifications")
        .select("*")
        .eq("provider_reference", providerReference)
        .maybeSingle();

      if (error || !data) return null;
      return mapVerification(data as Record<string, unknown>);
    },

    async createVerification(input): Promise<KycVerificationRecord> {
      const { data, error } = await client
        .from("kyc_verifications")
        .insert({
          seller_id: input.sellerId,
          provider: input.provider,
          provider_reference: input.providerReference ?? null,
          status: input.status,
          metadata: input.metadata,
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Failed to create KYC verification: ${error?.message ?? "unknown error"}`);
      }
      return mapVerification(data as Record<string, unknown>);
    },

    async updateVerification(input): Promise<KycVerificationRecord> {
      const updates: Record<string, unknown> = {
        status: input.status,
        reviewed_at: new Date().toISOString(),
      };
      if (input.rejectionReason !== undefined) updates.rejection_reason = input.rejectionReason;
      if (input.metadata !== undefined) updates.metadata = input.metadata;

      const { data, error } = await client
        .from("kyc_verifications")
        .update(updates)
        .eq("id", input.id)
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Failed to update KYC verification: ${error?.message ?? "unknown error"}`);
      }
      return mapVerification(data as Record<string, unknown>);
    },

    async updateSellerKycStatus(input): Promise<void> {
      const { error } = await client
        .from("sellers")
        .update({ kyc_status: input.status })
        .eq("id", input.sellerId);

      if (error) {
        throw new Error(`Failed to update seller KYC status: ${error?.message ?? "unknown error"}`);
      }
    },
  };
}
