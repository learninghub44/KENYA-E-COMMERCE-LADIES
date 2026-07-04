import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductSummary, WishlistRepository } from "./types";
import { createSupabaseProductSearchIndex } from "./supabase-search-repository";

export function createSupabaseWishlistRepository(client: SupabaseClient): WishlistRepository {
  const searchIndex = createSupabaseProductSearchIndex(client);

  return {
    async findOrCreate(userId: string, name: string): Promise<{ id: string }> {
      const { data: existing, error: findError } = await client
        .from("wishlists")
        .select("id")
        .eq("user_id", userId)
        .eq("name", name)
        .maybeSingle();
      if (findError) throw new Error(`Failed to load wishlist: ${findError.message}`);
      if (existing) return { id: existing.id as string };

      const { data: created, error: createError } = await client
        .from("wishlists")
        .insert({ user_id: userId, name, is_default: name === "Default" })
        .select("id")
        .single();
      if (createError) throw new Error(`Failed to create wishlist: ${createError.message}`);
      return { id: created.id as string };
    },

    async addItem(wishlistId: string, productId: string): Promise<void> {
      const { error } = await client
        .from("wishlist_items")
        .upsert({ wishlist_id: wishlistId, product_id: productId }, { onConflict: "wishlist_id,product_id" });
      if (error) throw new Error(`Failed to add wishlist item: ${error.message}`);
    },

    async removeItem(wishlistId: string, productId: string): Promise<void> {
      const { error } = await client
        .from("wishlist_items")
        .delete()
        .eq("wishlist_id", wishlistId)
        .eq("product_id", productId);
      if (error) throw new Error(`Failed to remove wishlist item: ${error.message}`);
    },

    async listItems(wishlistId: string): Promise<ProductSummary[]> {
      const { data, error } = await client
        .from("wishlist_items")
        .select("product_id, created_at")
        .eq("wishlist_id", wishlistId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(`Failed to list wishlist items: ${error.message}`);

      // Hydrate through the shared search index so pricing/image/rating shape stays in sync with
      // every other surface (search, collections). Products that were deleted or unpublished
      // since being wishlisted resolve to null and are dropped rather than erroring the whole list.
      const summaries = await Promise.all(
        (data ?? []).map((row) => searchIndex.findById(row.product_id as string))
      );
      return summaries.filter((s): s is ProductSummary => s !== null);
    },

    async count(wishlistId: string): Promise<number> {
      const { count, error } = await client
        .from("wishlist_items")
        .select("product_id", { count: "exact", head: true })
        .eq("wishlist_id", wishlistId);
      if (error) throw new Error(`Failed to count wishlist items: ${error.message}`);
      return count ?? 0;
    }
  };
}
