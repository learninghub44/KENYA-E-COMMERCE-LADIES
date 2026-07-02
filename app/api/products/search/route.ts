import { NextRequest, NextResponse } from "next/server";
import { createSupabaseProductSearchIndex } from "../../../../lib/marketplace/supabase-search-repository";
import { createSearchService } from "../../../../lib/marketplace/search-service";
import { createSupabaseClient } from "../../../../lib/supabase/server";
import type { ProductSearchFilters } from "../../../../lib/marketplace/types";

// Public catalog search — no auth required, matches the "everyone reads product search
// documents" RLS policy on product_search_documents.
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const sort = params.get("sort") ?? "relevance";

    const filters: Record<string, unknown> = {
      q: params.get("q") ?? undefined,
      categoryId: params.get("categoryId") ?? undefined,
      brandId: params.get("brandId") ?? undefined,
      sellerId: params.get("sellerId") ?? undefined,
      collectionId: params.get("collectionId") ?? undefined,
      color: params.get("color") ?? undefined,
      size: params.get("size") ?? undefined,
      material: params.get("material") ?? undefined,
      inStockOnly: params.get("inStockOnly") === "true" ? true : undefined,
      minPriceMinor: params.has("minPriceMinor") ? Number(params.get("minPriceMinor")) : undefined,
      maxPriceMinor: params.has("maxPriceMinor") ? Number(params.get("maxPriceMinor")) : undefined,
      sort: ["relevance", "newest", "price_asc", "price_desc", "featured"].includes(sort) ? sort : "relevance",
      cursor: params.get("cursor") ?? undefined,
      limit: params.has("limit") ? Number(params.get("limit")) : undefined
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
