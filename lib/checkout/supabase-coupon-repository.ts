import type { SupabaseClient } from "@supabase/supabase-js";
import type { CouponRecord, CouponRepository } from "../orders/types";

type CouponRow = {
  id: string;
  code: string;
  type: CouponRecord["type"];
  scope: CouponRecord["scope"];
  seller_id: string | null;
  value: number;
  currency: string | null;
  min_subtotal_minor: number;
  starts_at: string | null;
  ends_at: string | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
};

function toCouponRecord(row: CouponRow): CouponRecord {
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    scope: row.scope,
    sellerId: row.seller_id,
    value: row.value,
    currency: row.currency,
    minSubtotalMinor: row.min_subtotal_minor,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    usageLimit: row.usage_limit,
    usedCount: row.used_count,
    isActive: row.is_active
  };
}

const COUPON_COLUMNS = "id, code, type, scope, seller_id, value, currency, min_subtotal_minor, starts_at, ends_at, usage_limit, used_count, is_active";

export function createSupabaseCouponRepository(client: SupabaseClient): CouponRepository {
  return {
    async findActiveByCode(code): Promise<CouponRecord | null> {
      const { data, error } = await client
        .from("coupons")
        .select(COUPON_COLUMNS)
        .ilike("code", code)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw new Error(`Failed to load coupon: ${error.message}`);
      return data ? toCouponRecord(data as CouponRow) : null;
    },

    async incrementUsage(couponId): Promise<void> {
      const { data, error } = await client.from("coupons").select("used_count").eq("id", couponId).single();
      if (error) throw new Error(`Failed to load coupon usage: ${error.message}`);
      const { error: updateError } = await client
        .from("coupons")
        .update({ used_count: (data.used_count as number) + 1 })
        .eq("id", couponId);
      if (updateError) throw new Error(`Failed to increment coupon usage: ${updateError.message}`);
    }
  };
}
