"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart, Loader2, Trash2 } from "lucide-react"

import { Button } from "../../../components/ui/button"
import { ProductCard, type Product as ProductCardType } from "../../../components/shared/product-card"
import { EmptyState } from "../../../components/shared/empty-state"
import { Breadcrumbs } from "../../../components/shared/breadcrumbs"

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

function toCardProduct(summary: ProductSummaryLike): ProductCardType {
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

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<ProductCardType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch("/api/wishlist")
        if (res.status === 401) {
          if (!cancelled) {
            setError("Please sign in to view your wishlist.")
            setIsLoading(false)
          }
          return
        }
        if (!res.ok) throw new Error("Failed to load wishlist")
        const data: ProductSummaryLike[] = await res.json()
        if (!cancelled) setWishlist(data.map(toCardProduct))
      } catch {
        if (!cancelled) setError("Something went wrong loading your wishlist.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const removeFromWishlist = async (id: string) => {
    const previous = wishlist
    setRemovingId(id)
    setWishlist((prev) => prev.filter((item) => item.id !== id))
    try {
      const res = await fetch(`/api/wishlist/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to remove item")
    } catch {
      // Roll back on failure so the UI doesn't silently drift from the server.
      setWishlist(previous)
    } finally {
      setRemovingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          icon={Heart}
          title="Couldn't load your wishlist"
          description={error}
          action={
            <Button asChild>
              <Link href="/">Browse Products</Link>
            </Button>
          }
        />
      </div>
    )
  }

  if (wishlist.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save items you love to your wishlist and come back to them later."
          action={
            <Button asChild>
              <Link href="/">Browse Products</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Wishlist" },
        ]}
      />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          My Wishlist ({wishlist.length})
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {wishlist.map((item) => (
          <div key={item.id} className="relative group">
            <ProductCard product={item} />
            <Button
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => removeFromWishlist(item.id)}
              disabled={removingId === item.id}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
