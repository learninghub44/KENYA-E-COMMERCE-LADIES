"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import { Card, CardContent } from "../../../../components/ui/card"
import { ImageIcon, ArrowLeft, Edit, Eye } from "lucide-react"
import { getMockProducts, type MockProduct } from "../../../../lib/products/mock-store"

export default function SellerProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<MockProduct | null>(null)

  useEffect(() => {
    if (params.id) {
      const products = getMockProducts()
      const found = products.find((p) => p.id === params.id)
      if (found) {
        setProduct(found)
      }
    }
  }, [params.id])

  if (!product) {
    return (
      <div className="space-y-6 text-center py-12">
        <h2 className="text-xl font-semibold">Product not found</h2>
        <Button asChild>
          <Link href="/seller/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/seller/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
          <p className="text-sm text-muted-foreground font-mono">SKU: {product.sku}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              product.status === "Active"
                ? "default"
                : product.status === "Draft"
                ? "secondary"
                : "destructive"
            }
          >
            {product.status}
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/seller/products`}>
              <Eye className="mr-2 h-4 w-4" />
              View List
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/seller/products/${product.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 flex items-center justify-center bg-muted/30">
              <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                {product.images && product.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.images[0]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold">Description</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </CardContent>
          </Card>

          {product.variants && product.variants.length > 0 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="font-semibold">Variants</h2>
                <div className="space-y-2">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{variant.name}</p>
                        {variant.size || variant.color ? (
                          <p className="text-xs text-muted-foreground">
                            {variant.size && `Size: ${variant.size}`}
                            {variant.size && variant.color && " | "}
                            {variant.color && `Color: ${variant.color}`}
                          </p>
                        ) : null}
                      </div>
                      <p className="text-sm font-medium">Stock: {variant.stock}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold">Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold">KES {product.price.toLocaleString()}</span>
                </div>
                {product.comparePrice && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compare Price</span>
                    <span className="text-muted-foreground line-through">
                      KES {product.comparePrice.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock</span>
                  <span className="font-semibold">{product.stock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-semibold">{product.category}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold">Performance</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sales</span>
                  <span className="font-semibold">{product.sales || 0} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue</span>
                  <span className="font-semibold">KES {(product.revenue || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="font-semibold">{product.rating || 5.0}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-semibold text-muted-foreground font-mono">{product.createdAt}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
