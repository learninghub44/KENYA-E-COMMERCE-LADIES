import type { SupabaseClient } from "@supabase/supabase-js";
import type { InventoryReservationRepository } from "../orders/types";

type ReservationItem = { productId: string; variantId?: string | null; quantity: number };

type InventoryRow = {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity_available: number;
  quantity_reserved: number;
  track_inventory: boolean;
};

async function loadRow(client: SupabaseClient, item: ReservationItem): Promise<InventoryRow | null> {
  let query = client
    .from("inventory_items")
    .select("id, product_id, variant_id, quantity_available, quantity_reserved, track_inventory")
    .eq("product_id", item.productId);
  query = item.variantId ? query.eq("variant_id", item.variantId) : query.is("variant_id", null);
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(`Failed to load inventory: ${error.message}`);
  return data as InventoryRow | null;
}

// NOTE: reservation uses a read-then-write update rather than a single atomic
// SQL statement/RPC, so it is not safe against concurrent checkouts racing
// on the same low-stock item. Acceptable for now; revisit with a Postgres
// function (e.g. `reserve_inventory`) if checkout volume makes this a problem.
export function createSupabaseInventoryRepository(client: SupabaseClient): InventoryReservationRepository {
  return {
    async reserve(items) {
      const reserved: ReservationItem[] = [];
      for (const item of items) {
        const row = await loadRow(client, item);
        if (!row || !row.track_inventory) {
          reserved.push(item);
          continue;
        }
        const available = row.quantity_available - row.quantity_reserved;
        if (available < item.quantity) {
          if (reserved.length > 0) {
            await createSupabaseInventoryRepository(client).release(reserved);
          }
          return { ok: false, productId: item.productId, variantId: item.variantId ?? null, available };
        }
        const { error } = await client
          .from("inventory_items")
          .update({ quantity_reserved: row.quantity_reserved + item.quantity })
          .eq("id", row.id);
        if (error) throw new Error(`Failed to reserve inventory: ${error.message}`);
        reserved.push(item);
      }
      return { ok: true };
    },

    async release(items) {
      for (const item of items) {
        const row = await loadRow(client, item);
        if (!row || !row.track_inventory) continue;
        const { error } = await client
          .from("inventory_items")
          .update({ quantity_reserved: Math.max(0, row.quantity_reserved - item.quantity) })
          .eq("id", row.id);
        if (error) throw new Error(`Failed to release inventory: ${error.message}`);
      }
    }
  };
}
