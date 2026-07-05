import { NextRequest, NextResponse } from "next/server";
import { createSupabaseCategoryRepository } from "../../../../../lib/marketplace/supabase-catalog-repository";
import { createCatalogService } from "../../../../../lib/marketplace/catalog-service";
import { createSupabaseClient } from "../../../../../lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createSupabaseClient();
    const service = createCatalogService({
      categories: createSupabaseCategoryRepository(supabase as any),
      brands: { list: async () => [], findBySlug: async () => null },
      collections: {
        findBySlug: async () => null,
        listFeatured: async () => [],
        listProducts: async () => ({ items: [], nextCursor: null })
      }
    });

    const result = await service.getCategoryBySlug(slug);
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }
    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
