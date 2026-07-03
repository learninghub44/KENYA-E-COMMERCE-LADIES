import type { SupabaseClient } from "@supabase/supabase-js";
import type { KycStatus, SellerRecord, SellerRepository, SellerStatus, StoredSellerStatus } from "./types";

type SellerRow = {
  id: string;
  owner_id: string;
  store_name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  status: StoredSellerStatus;
  kyc_status: KycStatus;
  country_code: string | null;
  default_currency: string;
  support_email: string | null;
  support_phone: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

function toSellerRecord(row: SellerRow): SellerRecord {
  return {
    id: row.id,
    ownerId: row.owner_id,
    storeName: row.store_name,
    slug: row.slug,
    description: row.description,
    logoUrl: row.logo_url,
    bannerUrl: row.banner_url,
    status: row.status,
    kycStatus: row.kyc_status,
    countryCode: row.country_code,
    defaultCurrency: row.default_currency,
    supportEmail: row.support_email,
    supportPhone: row.support_phone,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function normalizeStoredStatus(status: SellerStatus): StoredSellerStatus {
  if (status === "approved") return "active";
  if (status === "pending") return "pending_kyc";
  return status;
}

export function createSupabaseSellerRepository(client: SupabaseClient): SellerRepository {
  return {
    async findByOwnerId(userId: string): Promise<SellerRecord | null> {
      const { data, error } = await client.from("sellers").select("*").eq("owner_id", userId).maybeSingle();
      if (error) throw new Error(`Failed to load seller by owner: ${error.message}`);
      return data ? toSellerRecord(data as SellerRow) : null;
    },

    async findById(sellerId: string): Promise<SellerRecord | null> {
      const { data, error } = await client.from("sellers").select("*").eq("id", sellerId).maybeSingle();
      if (error) throw new Error(`Failed to load seller: ${error.message}`);
      return data ? toSellerRecord(data as SellerRow) : null;
    },

    async createSeller(input): Promise<SellerRecord> {
      const { data, error } = await client
        .from("sellers")
        .insert({
          owner_id: input.ownerId,
          store_name: input.storeName,
          slug: input.slug,
          description: input.description ?? null,
          status: normalizeStoredStatus(input.status),
          kyc_status: input.kycStatus,
          country_code: input.countryCode ?? null,
          default_currency: input.defaultCurrency,
          support_email: input.supportEmail ?? null,
          support_phone: input.supportPhone ?? null,
          metadata: input.metadata
        })
        .select("*")
        .single();
      if (error) throw new Error(`Failed to create seller: ${error.message}`);
      return toSellerRecord(data as SellerRow);
    },

    async updateSeller(input): Promise<SellerRecord> {
      const values: Record<string, unknown> = {};
      if (input.values.storeName !== undefined) values.store_name = input.values.storeName;
      if (input.values.slug !== undefined) values.slug = input.values.slug;
      if (input.values.description !== undefined) values.description = input.values.description;
      if (input.values.logoUrl !== undefined) values.logo_url = input.values.logoUrl;
      if (input.values.bannerUrl !== undefined) values.banner_url = input.values.bannerUrl;
      if (input.values.status !== undefined) values.status = input.values.status;
      if (input.values.kycStatus !== undefined) values.kyc_status = input.values.kycStatus;
      if (input.values.countryCode !== undefined) values.country_code = input.values.countryCode;
      if (input.values.defaultCurrency !== undefined) values.default_currency = input.values.defaultCurrency;
      if (input.values.supportEmail !== undefined) values.support_email = input.values.supportEmail;
      if (input.values.supportPhone !== undefined) values.support_phone = input.values.supportPhone;
      if (input.values.metadata !== undefined) values.metadata = input.values.metadata;

      const { data, error } = await client.from("sellers").update(values).eq("id", input.sellerId).select("*").single();
      if (error) throw new Error(`Failed to update seller: ${error.message}`);
      return toSellerRecord(data as SellerRow);
    },

    async addOwnerMember(input): Promise<void> {
      const { error } = await client
        .from("seller_members")
        .upsert({ seller_id: input.sellerId, user_id: input.userId, role: "owner" });
      if (error) throw new Error(`Failed to add seller owner member: ${error.message}`);
    }
  };
}
