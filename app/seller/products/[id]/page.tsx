"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import { Card, CardContent } from "../../../../components/ui/card"
import { ImageIcon, ArrowLeft, Edit, Eye, Loader2 } from "lucide-react"

interface ProductImage {
  id: string
  url: string
  is_primary: boolean
  alt_text: string | null
}

interface ProductVariant {
  id: string
  title: string | null
  sku: string
  price_minor: number
  options: Record<string, string> | null
  is_active: boolean
}

interface InventoryItem {
  id: string
  quantity_available: number
  quantity_reserved: number
  low_stock_threshold: number
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  status: string
  base_price_minor: number
  compare_at_price_minor: number | null
  currency: string
  category_id: string | null
  product_images: ProductImage[]
  product_variants: ProductVariant[]
  inventory_items: InventoryItem[]
  created_at: string
  updated_at: string
}

function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    draft: "secondary",
    pending_review: "outline",
    archived: "destructive",
    rejected: "destructive",
  }
  const labelMap: Record<string, string> = {
    active: "Active",
    draft: "Draft",
    pending_review: "Pending Review",
    archived: "Archived",
    rejected: "Rejected",
  }
  return <Badge variant={variantMap[status] || "secondary"}>{labelMap[status] || status}</Badge>
}

export default function SellerProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetch(`/api/seller/products/${params.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Not found")
          return res.json()
        })
        .then((data) => setProduct(data))
        .catch(() => setNotFound(true))
        .finally(() => setLoading(false))
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-6 text-center py-12">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading product...</p>
      </div>
    )
  }

  if (notFound || !product) {
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

  const primaryImage = product.product_images?.find((img) => img.is_primary) || product.product_images?.[0]
  const inventory = product.inventory_items?.[0]
  const totalStock = inventory?.quantity_available ?? 0

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
          <p className="text-sm text-muted-foreground font-mono">Slug: {product.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={product.status} />
          <Button variant="outline" size="sm" asChild>
            <Link href="/seller/products">
              <Eye className="mr-2 h-4 w-4" />
              View List
            </Link>
          </Button>
          <Button size="sm" asChild className="bg-[#1C5C56] hover:bg-[#164a45]">
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
                {primaryImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={primaryImage.url}
                    alt={primaryImage.alt_text || product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>

          {product.description && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="font-semibold">Description</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              </CardContent>
            </Card>
          )}

          {product.product_variants && product.product_variants.length > 0 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="font-semibold">Variants</h2>
                <div className="space-y-2">
                  {product.product_variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{variant.title || variant.sku}</p>
                        {variant.options && Object.keys(variant.options).length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {Object.entries(variant.options)
                              .map(([key, val]) => `${key}: ${val}`)
                              .join(" | ")}
                          </p>
                        )}
                      </div>
                      <p className="text-sm font-medium">
                        KES {(variant.price_minor / 100).toLocaleString()}
                      </p>
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
                  <span className="font-semibold">KES {(product.base_price_minor / 100).toLocaleString()}</span>
                </div>
                {product.compare_at_price_minor && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compare Price</span>
                    <span className="text-muted-foreground line-through">
                      KES {(product.compare_at_price_minor / 100).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock</span>
                  <span className="font-semibold">{totalStock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency</span>
                  <span className="font-semibold">{product.currency}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold">Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-semibold text-muted-foreground font-mono">
                    {new Date(product.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="font-semibold text-muted-foreground font-mono">
                    {new Date(product.updated_at).toLocaleDateString()}
                  </span>
                </div>
                {inventory && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reserved</span>
                      <span className="font-semibold">{inventory.quantity_reserved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Low Stock At</span>
                      <span className="font-semibold">{inventory.low_stock_threshold}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
