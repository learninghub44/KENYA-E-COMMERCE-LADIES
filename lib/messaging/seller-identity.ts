import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Conversations and orders are keyed by `sellers.id` (a store record), which
 * lives in a different id space from `auth.users.id`. A signed-in user acts
 * as a seller through `seller_members` (owner, manager, or staff role), so
 * callers must never compare `conversation.sellerId === authUserId` directly.
 * These helpers resolve that membership the same way the database's
 * `current_user_can_manage_seller` policy function does.
 */

/**
 * Returns every seller account (store) id the given auth user may act as
 * the seller side for, via seller_members membership.
 */
export async function resolveManagedSellerIds(client: SupabaseClient, userId: string): Promise<string[]> {
  const { data, error } = await client
    .from("seller_members")
    .select("seller_id")
    .eq("user_id", userId);

  if (error || !data) return [];
  return [...new Set(data.map((row: { seller_id: string }) => row.seller_id))];
}

/**
 * Checks whether the given auth user may act as the seller side of a
 * specific seller account (owner, manager, or staff membership).
 */
export async function canActAsSeller(client: SupabaseClient, sellerId: string, userId: string): Promise<boolean> {
  const { data, error } = await client
    .from("seller_members")
    .select("seller_id")
    .eq("seller_id", sellerId)
    .eq("user_id", userId)
    .maybeSingle();

  return !error && !!data;
}
