"use client"

import Link from "next/link"
import { Clock, Trash2 } from "lucide-react"

import { Button } from "../../../../components/ui/button"
import { ProductCard, type Product as ProductCardType } from "../../../../components/shared/product-card"
import { EmptyState } from "../../../../components/shared/empty-state"
import { Breadcrumbs } from "../../../../components/shared/breadcrumbs"

const MOCK_RECENTLY_VIEWED: ProductCardType[] = Array.from({ length: 8 }, (_, i) => ({
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
  ][i] ?? "",
  price: [4500, 3200, 8900, 12500, 5600, 2800, 6500, 1800][i] ?? 0,
  comparePrice: [null, 4200, null, 15000, null, 3800, null, 2500][i] as number | null | undefined,
  images: ["/placeholder.svg"],
  rating: [4.5, 3.8, 4.2, 4.8, 4.0, 3.5, 4.6, 4.3][i] ?? 0,
  reviewCount: [24, 12, 45, 78, 33, 8, 56, 19][i] ?? 0,
  isNew: [true, false, false, true, false, true, false, false][i] ?? false,
  discount: [null, 15, null, 20, null, 25, null, 30][i] as number | null | undefined,
  sellerName: ["Luxe Kenya", "African Trends", "Nairobi Styles", "Elegance Hub"][i % 4] ?? "",
  slug: `product-${i + 1}`,
}))

export default function RecentlyViewedPage() {
  if (MOCK_RECENTLY_VIEWED.length === 0) {
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
        {MOCK_RECENTLY_VIEWED.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
