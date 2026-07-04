"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "../../../../../components/ui/button"
import { Input } from "../../../../../components/ui/input"
import { Textarea } from "../../../../../components/ui/textarea"
import { Label } from "../../../../../components/ui/label"
import { ArrowLeft, Save, Loader2 } from "lucide-react"

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  comparePrice: z.coerce.number().optional(),
  sku: z.string().min(1, "SKU is required"),
  stock: z.coerce.number().int().nonnegative("Stock cannot be negative"),
  category: z.string().min(1, "Category is required"),
})

type ProductForm = z.infer<typeof productSchema>

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
  product_images: { id: string; url: string; is_primary: boolean }[]
  product_variants: { id: string; title: string | null; sku: string; price_minor: number; options: Record<string, string> | null }[]
  inventory_items: { id: string; quantity_available: number; low_stock_threshold: number }[]
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  })

  useEffect(() => {
    if (params.id) {
      fetch(`/api/seller/products/${params.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Not found")
          return res.json()
        })
        .then((data: Product) => {
          setProduct(data)
          const inventory = data.inventory_items?.[0]
          reset({
            name: data.name,
            description: data.description || "",
            price: data.base_price_minor / 100,
            comparePrice: data.compare_at_price_minor ? data.compare_at_price_minor / 100 : undefined,
            sku: data.product_variants?.[0]?.sku || data.slug,
            stock: inventory?.quantity_available ?? 0,
            category: data.category_id || "",
          })
        })
        .catch(() => setNotFound(true))
        .finally(() => setLoading(false))
    }
  }, [params.id, reset])

  const onSubmit = async (data: ProductForm) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const body: Record<string, unknown> = {
        name: data.name,
        description: data.description,
        basePriceMinor: Math.round(data.price * 100),
        compareAtPriceMinor: data.comparePrice ? Math.round(data.comparePrice * 100) : null,
        categoryId: data.category || null,
        stockQuantity: data.stock,
      }

      const res = await fetch(`/api/seller/products/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Failed to update product")
      }

      router.push("/seller/products")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/seller/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">Edit Product</h1>
          <p className="text-sm text-muted-foreground font-mono">Product ID: {params.id}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...register("sku")} />
              {errors.sku && (
                <p className="text-sm text-destructive">{errors.sku.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" {...register("category")} />
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (KES)</Label>
                <Input id="price" type="number" step="0.01" {...register("price")} />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="comparePrice">Compare at (KES)</Label>
                <Input
                  id="comparePrice"
                  type="number"
                  step="0.01"
                  {...register("comparePrice")}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={5}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock quantity</Label>
          <Input id="stock" type="number" {...register("stock")} />
          {errors.stock && (
            <p className="text-sm text-destructive">{errors.stock.message}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isSubmitting} className="bg-[#1C5C56] hover:bg-[#164a45]">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/seller/products">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
