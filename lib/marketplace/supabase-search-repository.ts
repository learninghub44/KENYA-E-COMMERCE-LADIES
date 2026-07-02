import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductSearchFilters, ProductSearchIndex, ProductSummary, SearchPage } from "./types";

/**
 * Supabase-backed implementation of ProductSearchIndex.
 *
 * Backed by `public.product_search_documents`, the denormalized read table kept in sync with
 * `products` by the `sync_product_search_document` trigger (see
 * supabase/migrations/202607020007_search_discovery.sql). That table does not carry `slug` or
 * product images, so every method here does a second batched lookup against `products` and
 * `product_images` for the page of rows returned, rather than fetching those per-row (avoids N+1).
 *
 * Pagination is offset-based: `cursor` is a base64-encoded offset. This is simpler and safer to
 * ship first than keyset pagination, at the cost of "page N" queries getting slightly more
 * expensive as the offset grows. Fine at marketplace-catalog scale; revisit if pagination deep in
 * result sets becomes a hot path.
 *
 * `sort: "relevance"` without a text query falls back to newest-first (there is no meaningful
 * relevance ranking without a query). With a query, results are still ordered newest-first after
 * the full-text filter — true `ts_rank` ordering would need a Postgres RPC function, which does
 * not exist yet in this schema. Flagging this rather than faking a rank.
 */

type SearchDocumentRow = {
  product_id: string;
  seller_id: string | null;
  category_id: string | null;
  brand_id: string | null;
  brand_name: string | null;
  seller_store_name: string | null;
  name: string | null;
  currency: string | null;
  base_price_minor: number | null;
  compare_at_price_minor: number | null;
  in_stock: boolean | null;
  is_featured: boolean | null;
  published_at: string | null;
  created_at: string | null;
};

const SEARCH_DOCUMENT_COLUMNS =
  "product_id, seller_id, category_id, brand_id, brand_name, seller_store_name, name, currency, base_price_minor, compare_at_price_minor, in_stock, is_featured, published_at, created_at";

function encodeCursor(offset: number): string {
  return Buffer.from(String(offset), "utf-8").toString("base64");
}

function decodeCursor(cursor: string | undefined): number {
  if (!cursor) return 0;
  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf-8");
    const n = Number.parseInt(decoded, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

/** Batch-loads slugs and primary image URLs for a page of search-document rows and assembles ProductSummary[]. */
async function hydrateSummaries(client: SupabaseClient, rows: SearchDocumentRow[]): Promise<ProductSummary[]> {
  if (rows.length === 0) return [];
  const productIds = rows.map((r) => r.product_id);

  const [{ data: products, error: productsError }, { data: images, error: imagesError }] = await Promise.all([
    client.from("products").select("id, slug").in("id", productIds),
    client
      .from("product_images")
      .select("product_id, url, is_primary, sort_order")
      .in("product_id", productIds)
      .is("variant_id", null)
      .order("sort_order", { ascending: true })
  ]);

  if (productsError) throw new Error(`Failed to load product slugs: ${productsError.message}`);
  if (imagesError) throw new Error(`Failed to load product images: ${imagesError.message}`);

  const slugById = new Map<string, string>((products ?? []).map((p: { id: string; slug: string }) => [p.id, p.slug]));

  const imagesByProduct = new Map<string, { url: string; isPrimary: boolean; sortOrder: number }[]>();
  for (const img of (images ?? []) as { product_id: string; url: string; is_primary: boolean; sort_order: number }[]) {
    const list = imagesByProduct.get(img.product_id) ?? [];
    list.push({ url: img.url, isPrimary: img.is_primary, sortOrder: img.sort_order });
    imagesByProduct.set(img.product_id, list);
  }
  const primaryImageByProduct = new Map<string, string>();
  for (const [productId, list] of imagesByProduct) {
    const primary = list.find((i) => i.isPrimary) ?? [...list].sort((a, b) => a.sortOrder - b.sortOrder)[0];
    if (primary) primaryImageByProduct.set(productId, primary.url);
  }

  // Rows whose product row is gone (deleted after the search document was written) are dropped
  // rather than surfaced with a broken link.
  return rows
    .filter((row) => slugById.has(row.product_id))
    .map((row) => ({
      id: row.product_id,
      sellerId: row.seller_id ?? "",
      sellerStoreName: row.seller_store_name ?? "",
      categoryId: row.category_id,
      brandId: row.brand_id,
      brandName: row.brand_name,
      name: row.name ?? "",
      slug: slugById.get(row.product_id)!,
      basePriceMinor: row.base_price_minor ?? 0,
      compareAtPriceMinor: row.compare_at_price_minor,
      currency: row.currency ?? "KES",
      isFeatured: row.is_featured ?? false,
      primaryImageUrl: primaryImageByProduct.get(row.product_id) ?? null,
      inStock: row.in_stock ?? false,
      publishedAt: row.published_at,
      createdAt: row.created_at ?? new Date().toISOString()
    }));
}

export function createSupabaseProductSearchIndex(client: SupabaseClient): ProductSearchIndex {
  async function paginatedQuery(
    build: (q: ReturnType<SupabaseClient["from"]>) => ReturnType<SupabaseClient["from"]>,
    cursor: string | undefined,
    limit: number
  ): Promise<SearchPage<ProductSummary>> {
    const offset = decodeCursor(cursor);
    let query = build(client.from("product_search_documents").select(SEARCH_DOCUMENT_COLUMNS, { count: "exact" }) as any) as any;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw new Error(`Product search query failed: ${error.message}`);

    const rows = (data ?? []) as SearchDocumentRow[];
    const items = await hydrateSummaries(client, rows);
    const nextOffset = offset + rows.length;
    const nextCursor = count !== null && count !== undefined && nextOffset < count ? encodeCursor(nextOffset) : null;

    return { items, nextCursor };
  }

  return {
    async search(filters: ProductSearchFilters): Promise<SearchPage<ProductSummary>> {
      let collectionProductIds: string[] | null = null;
      if (filters.collectionId) {
        const { data, error } = await client
          .from("collection_products")
          .select("product_id")
          .eq("collection_id", filters.collectionId);
        if (error) throw new Error(`Failed to resolve collection products: ${error.message}`);
        collectionProductIds = (data ?? []).map((r: { product_id: string }) => r.product_id);
        if (collectionProductIds.length === 0) return { items: [], nextCursor: null };
      }

      return paginatedQuery(
        (q) => {
          let query = (q as any).not("published_at", "is", null);
          if (filters.q) query = query.textSearch("search_vector", filters.q, { type: "websearch", config: "simple" });
          if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
          if (filters.brandId) query = query.eq("brand_id", filters.brandId);
          if (filters.sellerId) query = query.eq("seller_id", filters.sellerId);
          if (collectionProductIds) query = query.in("product_id", collectionProductIds);
          if (filters.minPriceMinor !== undefined) query = query.gte("base_price_minor", filters.minPriceMinor);
          if (filters.maxPriceMinor !== undefined) query = query.lte("base_price_minor", filters.maxPriceMinor);
          if (filters.color) query = query.contains("colors", [filters.color]);
          if (filters.size) query = query.contains("sizes", [filters.size]);
          if (filters.material) query = query.contains("materials", [filters.material]);
          if (filters.inStockOnly) query = query.eq("in_stock", true);
          if (filters.tags?.length) query = query.overlaps("tags", filters.tags);

          switch (filters.sort) {
            case "newest":
              query = query.order("published_at", { ascending: false, nullsFirst: false });
              break;
            case "price_asc":
              query = query.order("base_price_minor", { ascending: true });
              break;
            case "price_desc":
              query = query.order("base_price_minor", { ascending: false });
              break;
            case "featured":
              query = query.order("is_featured", { ascending: false }).order("published_at", { ascending: false });
              break;
            case "relevance":
            default:
              query = query.order("published_at", { ascending: false });
              break;
          }
          return query.order("product_id", { ascending: true });
        },
        filters.cursor,
        filters.limit
      );
    },

    async findById(productId: string): Promise<ProductSummary | null> {
      const { data, error } = await client
        .from("product_search_documents")
        .select(SEARCH_DOCUMENT_COLUMNS)
        .eq("product_id", productId)
        .maybeSingle();
      if (error) throw new Error(`Failed to load product summary: ${error.message}`);
      if (!data) return null;
      const [summary] = await hydrateSummaries(client, [data as SearchDocumentRow]);
      return summary ?? null;
    },

    async listBySeller(sellerId: string, cursor: string | undefined, limit: number): Promise<SearchPage<ProductSummary>> {
      return paginatedQuery(
        (q) =>
          (q as any)
            .not("published_at", "is", null)
            .eq("seller_id", sellerId)
            .order("published_at", { ascending: false })
            .order("product_id", { ascending: true }),
        cursor,
        limit
      );
    },

    async listFeatured(cursor: string | undefined, limit: number): Promise<SearchPage<ProductSummary>> {
      return paginatedQuery(
        (q) =>
          (q as any)
            .not("published_at", "is", null)
            .eq("is_featured", true)
            .order("published_at", { ascending: false })
            .order("product_id", { ascending: true }),
        cursor,
        limit
      );
    },

    async listNewArrivals(cursor: string | undefined, limit: number): Promise<SearchPage<ProductSummary>> {
      return paginatedQuery(
        (q) =>
          (q as any)
            .not("published_at", "is", null)
            .order("published_at", { ascending: false })
            .order("product_id", { ascending: true }),
        cursor,
        limit
      );
    },

    async listRelated(productId: string, limit: number): Promise<ProductSummary[]> {
      const { data: current, error: currentError } = await client
        .from("product_search_documents")
        .select("category_id, brand_id")
        .eq("product_id", productId)
        .maybeSingle();
      if (currentError) throw new Error(`Failed to load product for related lookup: ${currentError.message}`);
      if (!current) return [];

      const { category_id: categoryId, brand_id: brandId } = current as { category_id: string | null; brand_id: string | null };
      if (!categoryId && !brandId) return [];

      let query = client
        .from("product_search_documents")
        .select(SEARCH_DOCUMENT_COLUMNS)
        .not("published_at", "is", null)
        .neq("product_id", productId)
        .limit(limit);

      query = categoryId ? query.eq("category_id", categoryId) : query.eq("brand_id", brandId as string);
      query = query.order("rating", { ascending: false }).order("sold_count", { ascending: false });

      const { data, error } = await query;
      if (error) throw new Error(`Failed to load related products: ${error.message}`);
      return hydrateSummaries(client, (data ?? []) as SearchDocumentRow[]);
    }
  };
}
