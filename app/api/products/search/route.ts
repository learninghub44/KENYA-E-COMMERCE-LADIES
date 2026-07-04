import { NextRequest, NextResponse } from "next/server";
import { createSupabaseProductSearchIndex } from "../../../../lib/marketplace/supabase-search-repository";
import { createSearchService } from "../../../../lib/marketplace/search-service";
import { createSupabaseClient } from "../../../../lib/supabase/server";
import type { ProductSearchFilters } from "../../../../lib/marketplace/types";

// Public catalog search — no auth required, matches the "everyone reads product search
// documents" RLS policy on product_search_documents.
//
// Accepts either `cursor` (opaque, as returned in the previous response's nextCursor) or a plain
// `page` number (1-based) for UIs that want numbered pagination. `page` is converted to a cursor
// here so the base64-offset encoding stays internal to the search index adapter rather than
// leaking into every caller.
function pageToCursor(page: number, limit: number): string {
  const offset = Math.max(0, (page - 1) * limit);
  return Buffer.from(String(offset), "utf-8").toString("base64");
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const sort = params.get("sort") ?? "relevance";
    const limit = params.has("limit") ? Number(params.get("limit")) : 24;
    const page = params.has("page") ? Number(params.get("page")) : undefined;

    const filters: Record<string, unknown> = {
      q: params.get("q") ?? undefined,
      categoryId: params.get("categoryId") ?? undefined,
      categoryIds: params.get("categoryIds")?.split(",").filter(Boolean),
      brandId: params.get("brandId") ?? undefined,
      brandIds: params.get("brandIds")?.split(",").filter(Boolean),
      sellerId: params.get("sellerId") ?? undefined,
      collectionId: params.get("collectionId") ?? undefined,
      color: params.get("color") ?? undefined,
      colors: params.get("colors")?.split(",").filter(Boolean),
      size: params.get("size") ?? undefined,
      material: params.get("material") ?? undefined,
      minRating: params.has("minRating") ? Number(params.get("minRating")) : undefined,
      inStockOnly: params.get("inStockOnly") === "true" ? true : undefined,
      minPriceMinor: params.has("minPriceMinor") ? Number(params.get("minPriceMinor")) : undefined,
      maxPriceMinor: params.has("maxPriceMinor") ? Number(params.get("maxPriceMinor")) : undefined,
      sort: ["relevance", "newest", "price_asc", "price_desc", "featured", "rating"].includes(sort) ? sort : "relevance",
      cursor: page !== undefined && Number.isFinite(page) && page > 0 ? pageToCursor(page, limit) : params.get("cursor") ?? undefined,
      limit
    };
    for (const key of Object.keys(filters)) {
      if (filters[key] === undefined) delete filters[key];
    }

    const supabase = await createSupabaseClient();
    const service = createSearchService({ index: createSupabaseProductSearchIndex(supabase as any) });
    const result = await service.search(filters as ProductSearchFilters);

    if (!result.ok) {
      return NextResponse.json({ error: result.message, code: result.code }, { status: result.status });
    }
    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
