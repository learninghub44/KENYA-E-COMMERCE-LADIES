import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductReader, PurchasableItem } from "../orders/types";

export function createSupabaseProductReader(client: SupabaseClient): ProductReader {
  return {
    async getPurchasable(productId, variantId): Promise<PurchasableItem | null> {
      const { data: product, error: productError } = await client
        .from("products")
        .select("id, seller_id, name, slug, status, base_price_minor, currency, sellers(id, store_name)")
        .eq("id", productId)
        .maybeSingle();
      if (productError) throw new Error(`Failed to load product: ${productError.message}`);
      if (!product) return null;

      let variant: { id: string; sku: string | null; title: string | null; price_minor: number | null; currency: string; is_active: boolean } | null = null;
      if (variantId) {
        const { data, error } = await client
          .from("product_variants")
          .select("id, sku, title, price_minor, currency, is_active")
          .eq("id", variantId)
          .eq("product_id", productId)
          .maybeSingle();
        if (error) throw new Error(`Failed to load product variant: ${error.message}`);
        if (!data) return null;
        variant = data;
      }

      let inventoryQuery = client
        .from("inventory_items")
        .select("quantity_available, quantity_reserved, track_inventory")
        .eq("product_id", productId);
      inventoryQuery = variantId ? inventoryQuery.eq("variant_id", variantId) : inventoryQuery.is("variant_id", null);
      const { data: inventory, error: inventoryError } = await inventoryQuery.maybeSingle();
      if (inventoryError) throw new Error(`Failed to load inventory: ${inventoryError.message}`);

      const inStock = inventory
        ? !inventory.track_inventory || inventory.quantity_available - inventory.quantity_reserved > 0
        : true;

      const seller = Array.isArray((product as any).sellers) ? (product as any).sellers[0] : (product as any).sellers;

      let imageQuery = client
        .from("product_images")
        .select("url, is_primary, sort_order, variant_id")
        .eq("product_id", productId);
      const { data: images, error: imageError } = await imageQuery;
      if (imageError) throw new Error(`Failed to load product images: ${imageError.message}`);

      const candidates = (images ?? []).filter((img) =>
        variantId ? img.variant_id === variantId || img.variant_id === null : img.variant_id === null
      );
      const pool = candidates.length > 0 ? candidates : images ?? [];
      const sorted = [...pool].sort((a, b) =>
        a.is_primary === b.is_primary ? a.sort_order - b.sort_order : a.is_primary ? -1 : 1
      );
      const imageUrl = sorted[0]?.url ?? null;

      return {
        productId: product.id,
        variantId: variant?.id ?? null,
        sellerId: product.seller_id,
        sellerName: seller?.store_name ?? "",
        productName: product.name,
        productSlug: product.slug,
        variantTitle: variant?.title ?? null,
        sku: variant?.sku ?? null,
        unitPriceMinor: variant?.price_minor ?? product.base_price_minor,
        currency: variant?.currency ?? product.currency,
        isPublished: product.status === "active",
        inStock: variant ? variant.is_active && inStock : inStock,
        imageUrl
      };
    }
  };
}
