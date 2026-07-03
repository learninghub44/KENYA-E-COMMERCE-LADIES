import { createSupabaseClient } from "../../lib/supabase/server"
import { createSupabaseProductSearchIndex } from "../../lib/marketplace/supabase-search-repository"
import { createSupabaseCategoryRepository } from "../../lib/marketplace/supabase-catalog-repository"
import { createSearchService } from "../../lib/marketplace/search-service"
import { createCatalogService } from "../../lib/marketplace/catalog-service"
import { toCardProduct } from "../../lib/marketplace/product-summary-mapper"
import type { Product } from "../../components/shared/product-card"
import LandingPageClient, { type CategoryDisplay } from "./landing-page-client"

// Server component: fetches real trending products and top-level categories, then hands
// serializable data down to the client component that owns the animated presentation.
// Errors thrown here are caught by app/(storefront)/error.tsx; the fetch itself is covered by
// app/(storefront)/loading.tsx while it's in flight.

async function getHomepageData() {
  const supabase = await createSupabaseClient()
  const searchService = createSearchService({ index: createSupabaseProductSearchIndex(supabase as any) })
  const catalogService = createCatalogService({
    categories: createSupabaseCategoryRepository(supabase as any),
    // Brands/collections aren't used on the homepage; only categories are needed here, but
    // createCatalogService requires all three dependencies.
    brands: { list: async () => [], findBySlug: async () => null },
    collections: {
      findBySlug: async () => null,
      listFeatured: async () => [],
      listProducts: async () => ({ items: [], nextCursor: null }),
    },
  })

  const [featuredResult, categoryTreeResult] = await Promise.all([
    searchService.listFeatured(undefined, 8),
    catalogService.getCategoryTree(true),
  ])

  let trendingProducts: Product[] = featuredResult.ok ? featuredResult.data.items.map(toCardProduct) : []

  // Fall back to newest arrivals if nothing is marked featured yet (e.g. early-stage catalog).
  if (trendingProducts.length === 0) {
    const newArrivals = await searchService.listNewArrivals(undefined, 8)
    if (newArrivals.ok) trendingProducts = newArrivals.data.items.map(toCardProduct)
  }

  const rootCategories = categoryTreeResult.ok ? categoryTreeResult.data.slice(0, 6) : []
  const categories: CategoryDisplay[] = await Promise.all(
    rootCategories.map(async (category) => {
      const { count, error } = await supabase
        .from("product_search_documents")
        .select("product_id", { count: "exact", head: true })
        .eq("category_id", category.id)
        .not("published_at", "is", null)
      if (error) throw new Error(`Failed to count products for category "${category.slug}": ${error.message}`)
      return { name: category.name, slug: category.slug, count: count ?? 0 }
    })
  )

  return { trendingProducts, categories }
}

export default async function LandingPage() {
  const { trendingProducts, categories } = await getHomepageData()
  return <LandingPageClient categories={categories} trendingProducts={trendingProducts} />
}
