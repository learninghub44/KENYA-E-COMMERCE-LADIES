import type { SupabaseClient } from "@supabase/supabase-js";
import type { InventoryReservationRepository } from "../orders/types";

type ReservationItem = { productId: string; variantId?: string | null; quantity: number };

async function releaseAll(client: SupabaseClient, items: ReservationItem[]): Promise<void> {
  for (const item of items) {
    const { error } = await client.rpc("release_inventory_item", {
      p_product_id: item.productId,
      p_variant_id: item.variantId ?? null,
      p_quantity: item.quantity
    });
    if (error) throw new Error(`Failed to release inventory: ${error.message}`);
  }
}

// Reservation is delegated to the reserve_inventory_item/release_inventory_item Postgres
// functions (see supabase/migrations/202607040001_atomic_inventory_reservation.sql), which
// perform the availability check and the increment inside a single `SELECT ... FOR UPDATE`
// + `UPDATE` under one row lock. That makes two concurrent checkouts racing on the same
// low-stock item mutually exclusive instead of both reading a stale "available" snapshot.
export function createSupabaseInventoryRepository(client: SupabaseClient): InventoryReservationRepository {
  return {
    async reserve(items) {
      const reserved: ReservationItem[] = [];
      for (const item of items) {
        const { data, error } = await client
          .rpc("reserve_inventory_item", {
            p_product_id: item.productId,
            p_variant_id: item.variantId ?? null,
            p_quantity: item.quantity
          })
          .maybeSingle();

        if (error) {
          if (reserved.length > 0) await releaseAll(client, reserved);
          throw new Error(`Failed to reserve inventory: ${error.message}`);
        }

        const result = data as { ok: boolean; available: number | null } | null;
        if (!result || !result.ok) {
          if (reserved.length > 0) await releaseAll(client, reserved);
          return {
            ok: false,
            productId: item.productId,
            variantId: item.variantId ?? null,
            available: result?.available ?? 0
          };
        }

        reserved.push(item);
      }
      return { ok: true };
    },

    async release(items) {
      await releaseAll(client, items);
    }
  };
}
