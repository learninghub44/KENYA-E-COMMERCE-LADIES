import Link from "next/link"
import { Store, BadgeCheck, MapPin, Search as SearchIcon } from "lucide-react"

import { createSupabaseClient } from "../../../lib/supabase/server"
import { Card, CardContent } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Input } from "../../../components/ui/input"
import { Button } from "../../../components/ui/button"
import { Rating } from "../../../components/shared/rating"
import { EmptyState } from "../../../components/shared/empty-state"

export const metadata = {
  title: "All Sellers | Zuri Market",
  description: "Browse verified sellers on Zuri Market — Kenyan fashion, beauty, and lifestyle brands.",
}

interface SellerListItem {
  id: string
  storeName: string
  slug: string
  description: string | null
  logoUrl: string | null
  countryCode: string | null
  productCount: number
  rating: number
  reviewCount: number
}

// Server component: mirrors the homepage's pattern of a direct Supabase query for the base list,
// then per-row aggregate counts fetched in parallel. `sellers` and its aggregates
// (product_search_documents, rating_summaries) are all anon-readable per production_hardening.sql
// and the 202607030001 grants fix.
async function getSellers(query: string | undefined): Promise<SellerListItem[]> {
  const supabase = await createSupabaseClient()

  let sellersQuery = supabase
    .from("sellers")
    .select("id, store_name, slug, description, logo_url, country_code")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(48)

  if (query && query.trim().length > 0) {
    sellersQuery = sellersQuery.ilike("store_name", `%${query.trim()}%`)
  }

  const { data: sellers, error } = await sellersQuery
  if (error) throw new Error(`Failed to load sellers: ${error.message}`)
  if (!sellers || sellers.length === 0) return []

  return Promise.all(
    sellers.map(async (seller) => {
      const [{ count }, { data: ratingRow }] = await Promise.all([
        supabase
          .from("product_search_documents")
          .select("product_id", { count: "exact", head: true })
          .eq("seller_id", seller.id)
          .not("published_at", "is", null),
        supabase
          .from("rating_summaries")
          .select("average_rating, total_reviews")
          .eq("entity_type", "seller")
          .eq("entity_id", seller.id)
          .maybeSingle(),
      ])

      return {
        id: seller.id,
        storeName: seller.store_name,
        slug: seller.slug,
        description: seller.description,
        logoUrl: seller.logo_url,
        countryCode: seller.country_code,
        productCount: count ?? 0,
        rating: ratingRow?.average_rating ?? 0,
        reviewCount: ratingRow?.total_reviews ?? 0,
      }
    })
  )
}

export default async function SellersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const sellers = await getSellers(q)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">All Sellers</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Discover independent Kenyan brands and creators selling on Zuri Market.
        </p>
      </div>

      <form action="/sellers" method="GET" className="mx-auto mb-10 flex max-w-md gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search sellers by store name..."
            className="pl-9"
            aria-label="Search sellers"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {sellers.length === 0 ? (
        <EmptyState
          icon={Store}
          title={q ? "No sellers match your search" : "No sellers yet"}
          description={
            q
              ? "Try a different store name, or browse the full list."
              : "Sellers are still joining the marketplace — check back soon."
          }
          action={
            q ? (
              <Button asChild variant="outline">
                <Link href="/sellers">Clear search</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sellers.map((seller) => (
            <Link key={seller.id} href={`/sellers/${seller.slug}`} className="group block">
              <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardContent className="flex h-full flex-col p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-rose-500 to-purple-500 text-white">
                      {seller.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={seller.logoUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Store className="h-6 w-6" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="flex items-center gap-1 truncate font-semibold">
                        {seller.storeName}
                        <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-label="Verified seller" />
                      </h2>
                      {seller.countryCode && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" aria-hidden="true" />
                          {seller.countryCode}
                        </p>
                      )}
                    </div>
                  </div>

                  {seller.description && (
                    <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">{seller.description}</p>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-2">
                    {seller.reviewCount > 0 ? (
                      <Rating value={seller.rating} showValue size="sm" />
                    ) : (
                      <span className="text-xs text-muted-foreground">No reviews yet</span>
                    )}
                    <Badge variant="secondary">{seller.productCount.toLocaleString()} products</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
