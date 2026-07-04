import { createSupabaseClient } from "../../lib/supabase/server"
import { createSupabaseProductSearchIndex } from "../../lib/marketplace/supabase-search-repository"
import { createSupabaseCategoryRepository } from "../../lib/marketplace/supabase-catalog-repository"
import { createSearchService } from "../../lib/marketplace/search-service"
import { createCatalogService } from "../../lib/marketplace/catalog-service"
import { toCardProduct } from "../../lib/marketplace/product-summary-mapper"
import type { Product } from "../../components/shared/product-card"
import LandingPageClient, { type CategoryDisplay } from "./landing-page-client"

async function getHomepageData() {
  const supabase = await createSupabaseClient()
  const searchService = createSearchService({ index: createSupabaseProductSearchIndex(supabase as any) })
  const catalogService = createCatalogService({
    categories: createSupabaseCategoryRepository(supabase as any),
    brands: { list: async () => [], findBySlug: async () => null },
    collections: {
      findBySlug: async () => null,
      listFeatured: async () => [],
      listProducts: async () => ({ items: [], nextCursor: null }),
    },
  })

  const [featuredResult, newArrivalsResult, categoryTreeResult] = await Promise.all([
    searchService.listFeatured(undefined, 8),
    searchService.listNewArrivals(undefined, 8),
    catalogService.getCategoryTree(true),
  ])

  const featuredProducts: Product[] = featuredResult.ok ? featuredResult.data.items.map(toCardProduct) : []
  const newArrivals: Product[] = newArrivalsResult.ok ? newArrivalsResult.data.items.map(toCardProduct) : []

  const trendingProducts = featuredProducts.length > 0 ? featuredProducts : newArrivals

  const rootCategories = categoryTreeResult.ok ? categoryTreeResult.data.slice(0, 8) : []
  const categories: CategoryDisplay[] = await Promise.all(
    rootCategories.map(async (category) => {
      const { count } = await supabase
        .from("product_search_documents")
        .select("product_id", { count: "exact", head: true })
        .eq("category_id", category.id)
        .not("published_at", "is", null)
      return { name: category.name, slug: category.slug, count: count ?? 0 }
    })
  )

  const brandsResult = await supabase
    .from("sellers")
    .select("store_name, slug, logo_url")
    .eq("status", "approved")
    .not("store_name", "is", null)
    .limit(8)

  const brands = (brandsResult.data ?? [])
    .filter((b) => b.store_name)
    .map((b) => ({
      name: b.store_name!,
      slug: b.slug ?? "",
      logo: b.logo_url ?? null,
    }))

  return { trendingProducts, newArrivals, categories, brands }
}

export default async function LandingPage() {
  const { trendingProducts, newArrivals, categories, brands } = await getHomepageData()
  return (
    <LandingPageClient
      categories={categories}
      trendingProducts={trendingProducts}
      newArrivals={newArrivals}
      brands={brands}
    />
  )
}
