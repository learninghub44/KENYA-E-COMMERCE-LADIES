import { createSupabaseClient } from "../../lib/supabase/server"
import { createSupabaseProductSearchIndex } from "../../lib/marketplace/supabase-search-repository"
import { createSupabaseCategoryRepository } from "../../lib/marketplace/supabase-catalog-repository"
import { createSearchService } from "../../lib/marketplace/search-service"
import { createCatalogService } from "../../lib/marketplace/catalog-service"
import type { Product } from "../../components/shared/product-card"
import LandingPageClient, { type CategoryDisplay } from "./landing-page-client"

// Server component: fetches real trending products and top-level categories, then hands
// serializable data down to the client component that owns the animated presentation.
// Errors thrown here are caught by app/(storefront)/error.tsx; the fetch itself is covered by
// app/(storefront)/loading.tsx while it's in flight.

function toCardProduct(summary: {
  id: string
  name: string
  slug: string
  basePriceMinor: number
  compareAtPriceMinor: number | null
  primaryImageUrl: string | null
  sellerStoreName: string
  isFeatured: boolean
  publishedAt: string | null
}): Product {
  const price = summary.basePriceMinor / 100
  const comparePrice = summary.compareAtPriceMinor != null ? summary.compareAtPriceMinor / 100 : null
  const discount =
    comparePrice != null && comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : null
  const isNew = summary.publishedAt
    ? Date.now() - new Date(summary.publishedAt).getTime() < 1000 * 60 * 60 * 24 * 30
    : false

  return {
    id: summary.id,
    name: summary.name,
    price,
    comparePrice,
    images: summary.primaryImageUrl ? [summary.primaryImageUrl] : [],
    // Rating/review count aren't part of ProductSummary yet (they live on rating_summaries,
    // joined into product_search_documents but not selected by the search index today) —
    // showing 0 rather than a fabricated number until that's wired through.
    rating: 0,
    reviewCount: 0,
    isNew,
    discount,
    sellerName: summary.sellerStoreName,
    slug: summary.slug,
  }
}

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
