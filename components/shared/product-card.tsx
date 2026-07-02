import Image from "next/image"
import Link from "next/link"

import { cn } from "../../lib/utils"
import { Badge } from "../ui/badge"
import { Card, CardContent } from "../ui/card"
import { Price } from "./price"
import { Rating } from "./rating"

export interface Product {
  id: string
  name: string
  price: number
  comparePrice?: number | null
  images: string[]
  rating: number
  reviewCount: number
  isNew?: boolean
  discount?: number | null
  sellerName: string
  slug: string
}

interface ProductCardProps {
  product: Product
  className?: string
}

const PLACEHOLDER_IMAGE = "/placeholder.svg"

function ProductCard({ product, className }: ProductCardProps) {
  const imageSrc = product.images?.[0] || PLACEHOLDER_IMAGE
  const hasDiscount = product.discount != null && product.discount > 0

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <Card
        className={cn(
          "overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
          className
        )}
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {(product.isNew || hasDiscount) && (
            <div className="absolute left-2 top-2 flex flex-col gap-1">
              {product.isNew && (
                <Badge variant="default" className="text-xs">
                  New
                </Badge>
              )}
              {hasDiscount && (
                <Badge variant="destructive" className="text-xs">
                  -{product.discount}%
                </Badge>
              )}
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <p className="mb-1 truncate text-sm text-muted-foreground">
            {product.sellerName}
          </p>
          <h3 className="mb-1 line-clamp-2 font-medium leading-tight">
            {product.name}
          </h3>
          <div className="mb-2 flex items-center gap-2">
            <Rating value={product.rating} size="sm" />
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>
          <Price
            amount={product.price}
            compareAt={product.comparePrice ?? undefined}
            variant={hasDiscount ? "sale" : "default"}
            size="md"
          />
        </CardContent>
      </Card>
    </Link>
  )
}

export { ProductCard }
