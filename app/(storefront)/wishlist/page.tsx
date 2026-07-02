"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, Share2, Trash2 } from "lucide-react"

import { Button } from "../../../components/ui/button"
import { Card, CardContent } from "../../../components/ui/card"
import { ProductCard } from "../../../components/shared/product-card"
import { EmptyState } from "../../../components/shared/empty-state"
import { Breadcrumbs } from "../../../components/shared/breadcrumbs"

const MOCK_WISHLIST = Array.from({ length: 8 }, (_, i) => ({
  id: String(i + 1),
  name: [
    "Premium Ankara Maxi Dress",
    "Silk Blend Wrap Top",
    "Handwoven Kente Blazer",
    "Beaded Evening Gown",
    "Linen Wide Leg Trousers",
    "Embroidered Crop Top",
    "Leather Crossbody Bag",
    "Statement Earrings Set",
  ][i],
  price: [4500, 3200, 8900, 12500, 5600, 2800, 6500, 1800][i],
  comparePrice: [null, 4200, null, 15000, null, 3800, null, 2500][i],
  images: ["/placeholder.svg"],
  rating: [4.5, 3.8, 4.2, 4.8, 4.0, 3.5, 4.6, 4.3][i],
  reviewCount: [24, 12, 45, 78, 33, 8, 56, 19][i],
  isNew: [true, false, false, true, false, true, false, false][i],
  discount: [null, 15, null, 20, null, 25, null, 30][i],
  sellerName: ["Luxe Kenya", "African Trends", "Nairobi Styles", "Elegance Hub"][i % 4],
  slug: `product-${i + 1}`,
}))

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState(MOCK_WISHLIST)

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id))
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
        <Button variant="outline" size="sm" onClick={() => {}}>
          <Share2 className="mr-2 h-4 w-4" />
          Share Wishlist
        </Button>
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
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
