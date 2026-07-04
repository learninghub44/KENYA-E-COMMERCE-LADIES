"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Clock } from "lucide-react"

import { Button } from "../../../../components/ui/button"
import { ProductCard, type Product as ProductCardType } from "../../../../components/shared/product-card"
import { EmptyState } from "../../../../components/shared/empty-state"
import { Breadcrumbs } from "../../../../components/shared/breadcrumbs"

function getRecentlyViewed(): ProductCardType[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem("recently_viewed")
    if (!stored) return []
    const items = JSON.parse(stored) as ProductCardType[]
    return Array.isArray(items) ? items.slice(0, 20) : []
  } catch {
    return []
  }
}

export default function RecentlyViewedPage() {
  const [recentlyViewed, setRecentlyViewed] = useState<ProductCardType[]>([])

  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed())
  }, [])

  if (recentlyViewed.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          icon={Clock}
          title="No recently viewed items"
          description="Products you view will appear here so you can easily find them again."
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
          { label: "My Account", href: "/account" },
          { label: "Recently Viewed" },
        ]}
      />

      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        Recently Viewed
      </h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {recentlyViewed.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
