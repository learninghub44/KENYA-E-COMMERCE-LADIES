"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Store, Package, Calendar, MapPin, ShieldCheck, BadgeCheck } from "lucide-react"

import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import { Separator } from "../../../../components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "../../../../components/ui/avatar"
import { Skeleton } from "../../../../components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select"
import { ProductCard, type Product } from "../../../../components/shared/product-card"
import { Rating } from "../../../../components/shared/rating"
import { EmptyState } from "../../../../components/shared/empty-state"

interface SellerResponse {
  seller: {
    id: string
    storeName: string
    slug: string
    description: string | null
    logoUrl: string | null
    bannerUrl: string | null
    countryCode: string | null
    metadata: Record<string, unknown>
    createdAt: string
  }
  rating: { averageRating: number; totalReviews: number } | null
}

interface ProductSummaryLike {
  id: string
  name: string
  slug: string
  basePriceMinor: number
  compareAtPriceMinor: number | null
  primaryImageUrl: string | null
  sellerStoreName: string
  publishedAt: string | null
  rating: number
  reviewCount: number
}

function toCardProduct(summary: ProductSummaryLike): Product {
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
    rating: summary.rating,
    reviewCount: summary.reviewCount,
    isNew,
    discount,
    sellerName: summary.sellerStoreName,
    slug: summary.slug,
  }
}

export default function SellerPage() {
  const params = useParams()
  const slug = params.slug as string

  const [data, setData] = useState<SellerResponse | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setNotFound(false)
      try {
        const sellerRes = await fetch(`/api/sellers/${encodeURIComponent(slug)}`)
        if (sellerRes.status === 404) {
          if (!cancelled) setNotFound(true)
          return
        }
        if (!sellerRes.ok) throw new Error("Failed to load seller")
        const sellerData: SellerResponse = await sellerRes.json()
        if (cancelled) return
        setData(sellerData)

        const sp = new URLSearchParams()
        sp.set("sellerId", sellerData.seller.id)
        sp.set("limit", "200")
        const productRes = await fetch(`/api/products/search?${sp.toString()}`)
        if (productRes.ok) {
          const productData = (await productRes.json()) as { items: ProductSummaryLike[] }
          if (!cancelled) setProducts(productData.items.map(toCardProduct))
        }
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [slug])

  const seller = data?.seller

  const rating = data?.rating ?? null
  const avgRating = rating?.averageRating ?? 0
  const reviewCount = rating?.totalReviews ?? 0
  const productCount = products.length

  const memberSince = seller ? new Date(seller.createdAt).getFullYear().toString() : ""
  const location = seller?.countryCode ?? "Kenya"

  const tagline = seller?.description
    ? seller.description.split(".")[0] + "."
    : ""

  const sortedProducts = useMemo(
    () =>
      [...products].sort((a, b) => {
        switch (sortBy) {
          case "price-asc": return a.price - b.price
          case "price-desc": return b.price - a.price
          case "rating": return b.rating - a.rating
          default: return 0
        }
      }),
    [products, sortBy]
  )

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-28 w-28 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !seller) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <EmptyState
          icon={Store}
          title="Seller Not Found"
          description={`The seller "${slug}" could not be found. Please check the URL or browse our sellers.`}
          action={
            <Button asChild>
              <Link href="/sellers">Browse Sellers</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <div className="relative">
        <div className="relative h-48 overflow-hidden bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 sm:h-56 md:h-64">
          {seller.bannerUrl && (
            <Image
              src={seller.bannerUrl}
              alt={`${seller.storeName} cover`}
              fill
              className="object-cover opacity-40"
              priority
            />
          )}
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 mb-8 flex flex-col items-center gap-6 sm:-mt-20 sm:flex-row sm:items-end">
            <Avatar className="h-28 w-28 border-4 border-background sm:h-32 sm:w-32">
              <AvatarImage src={seller.logoUrl ?? undefined} alt={seller.storeName} />
              <AvatarFallback className="text-2xl font-bold">{seller.storeName.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{seller.storeName}</h1>
                <Badge variant="secondary" className="gap-1">
                  <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                  Verified Seller
                </Badge>
              </div>
              {seller.description && (
                <p className="mt-1 text-sm text-muted-foreground">{tagline}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:justify-start">
                {(reviewCount > 0) && (
                  <span className="flex items-center gap-1">
                    <Rating value={avgRating} size="sm" />
                    <span>{avgRating.toFixed(1)} ({reviewCount})</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  {productCount} products
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Since {memberSince}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {location}
                </span>
              </div>
            </div>

            <Button className="hidden sm:inline-flex gap-2">
              <ShieldCheck className="h-4 w-4" />
              Contact Seller
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <div className="space-y-6">
              <div>
                <h2 className="mb-3 text-lg font-semibold">About the Seller</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{seller.description ?? "No description provided."}</p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-3 text-sm font-medium">Store Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Products</span>
                    <span className="font-medium">{productCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="font-medium">{reviewCount > 0 ? `${avgRating.toFixed(1)} / 5.0` : "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reviews</span>
                    <span className="font-medium">{reviewCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-medium">{memberSince}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full sm:hidden gap-2">
                <ShieldCheck className="h-4 w-4" />
                Contact Seller
              </Button>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {productCount} product{productCount !== 1 ? "s" : ""}
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]" aria-label="Sort products">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {sortedProducts.length === 0 ? (
              <div className="py-16">
                <EmptyState
                  icon={Package}
                  title="No products yet"
                  description="This seller hasn't listed any products yet. Check back later."
                />
              </div>
            ) : (
              <motion.div
                className="grid gap-6 grid-cols-2 md:grid-cols-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
