import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BrandRecord,
  BrandRepository,
  CategoryRecord,
  CategoryRepository,
  CollectionRecord,
  CollectionRepository,
  ProductSummary,
  SearchPage
} from "./types";
import { createSupabaseProductSearchIndex } from "./supabase-search-repository";

function toCategoryRecord(row: Record<string, unknown>): CategoryRecord {
  return {
    id: row.id as string,
    parentId: (row.parent_id as string | null) ?? null,
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string | null) ?? null,
    sortOrder: (row.sort_order as number) ?? 0,
    isActive: (row.is_active as boolean) ?? true,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string
  };
}

function toBrandRecord(row: Record<string, unknown>): BrandRecord {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string | null) ?? null,
    logoUrl: (row.logo_url as string | null) ?? null,
    isVerified: (row.is_verified as boolean) ?? false,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string
  };
}

function toCollectionRecord(row: Record<string, unknown>): CollectionRecord {
  return {
    id: row.id as string,
    sellerId: (row.seller_id as string | null) ?? null,
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string | null) ?? null,
    status: row.status as CollectionRecord["status"],
    startsAt: (row.starts_at as string | null) ?? null,
    endsAt: (row.ends_at as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string
  };
}

export function createSupabaseCategoryRepository(client: SupabaseClient): CategoryRepository {
  return {
    async list(activeOnly = true): Promise<CategoryRecord[]> {
      let query = client.from("categories").select("*").order("sort_order", { ascending: true });
      if (activeOnly) query = query.eq("is_active", true);
      const { data, error } = await query;
      if (error) throw new Error(`Failed to list categories: ${error.message}`);
      return (data ?? []).map(toCategoryRecord);
    },

    async findBySlug(slug: string): Promise<CategoryRecord | null> {
      const { data, error } = await client.from("categories").select("*").eq("slug", slug).maybeSingle();
      if (error) throw new Error(`Failed to load category "${slug}": ${error.message}`);
      return data ? toCategoryRecord(data) : null;
    }
  };
}

export function createSupabaseBrandRepository(client: SupabaseClient): BrandRepository {
  return {
    async list(): Promise<BrandRecord[]> {
      const { data, error } = await client.from("brands").select("*").order("name", { ascending: true });
      if (error) throw new Error(`Failed to list brands: ${error.message}`);
      return (data ?? []).map(toBrandRecord);
    },

    async findBySlug(slug: string): Promise<BrandRecord | null> {
      const { data, error } = await client.from("brands").select("*").eq("slug", slug).maybeSingle();
      if (error) throw new Error(`Failed to load brand "${slug}": ${error.message}`);
      return data ? toBrandRecord(data) : null;
    }
  };
}

export function createSupabaseCollectionRepository(client: SupabaseClient): CollectionRepository {
  // Reuses the search index to hydrate ProductSummary rows once product IDs for the collection
  // are known, so image/slug hydration logic lives in exactly one place.
  const searchIndex = createSupabaseProductSearchIndex(client);

  return {
    async findBySlug(sellerId: string | null, slug: string): Promise<CollectionRecord | null> {
      let query = client.from("collections").select("*").eq("slug", slug);
      query = sellerId ? query.eq("seller_id", sellerId) : query.is("seller_id", null);
      const { data, error } = await query.maybeSingle();
      if (error) throw new Error(`Failed to load collection "${slug}": ${error.message}`);
      return data ? toCollectionRecord(data) : null;
    },

    async listFeatured(now: string): Promise<CollectionRecord[]> {
      const { data, error } = await client
        .from("collections")
        .select("*")
        .eq("status", "published")
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order("created_at", { ascending: false });
      if (error) throw new Error(`Failed to list featured collections: ${error.message}`);
      return (data ?? []).map(toCollectionRecord);
    },

    async listProducts(collectionId: string, cursor: string | undefined, limit: number): Promise<SearchPage<ProductSummary>> {
      // search() already resolves collection membership via collection_products and filters to
      // published products, so delegate rather than duplicating that lookup here. Note: this
      // orders by published_at (search()'s "newest"), not collection_products.sort_order — curated
      // manual ordering within a collection isn't exposed by ProductSearchFilters yet.
      return searchIndex.search({ collectionId, cursor, limit, sort: "newest" });
    }
  };
}
