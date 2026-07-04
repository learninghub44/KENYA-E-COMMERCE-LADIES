"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Plus,
  Trash2,
  Upload,
  Save,
  Send,
  Loader2,
  X,
  ImageIcon,
} from "lucide-react"

import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Textarea } from "../../../../components/ui/textarea"
import { Label } from "../../../../components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../../components/ui/card"

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  tags: z.string().optional(),
  regularPrice: z.coerce.number().min(1, "Price must be greater than 0"),
  salePrice: z.coerce.number().optional(),
  taxClass: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  stockQuantity: z.coerce.number().int().min(0, "Stock cannot be negative"),
  lowStockThreshold: z.coerce.number().int().min(1, "Threshold must be at least 1"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

interface Category {
  id: string
  name: string
  slug: string
}

interface Variant {
  id: string
  size: string
  color: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [variants, setVariants] = useState<Variant[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedImages, setUploadedImages] = useState<{ url: string; altText: string }[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      lowStockThreshold: 10,
      stockQuantity: 0,
    },
  })

  useEffect(() => {
    fetch("/api/catalog/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data)
        } else if (data?.categories) {
          setCategories(data.categories)
        }
      })
      .catch(() => {})
  }, [])

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      { id: crypto.randomUUID(), size: "", color: "" },
    ])
  }

  function removeVariant(id: string) {
    setVariants((prev) => prev.filter((v) => v.id !== id))
  }

  function updateVariant(id: string, field: keyof Variant, value: string) {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    )
  }

<<<<<<< HEAD
  function onSave(status: "draft" | "published") {
    handleSubmit((data) => {
      router.push("/products")
    })()
=======
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("category", "product")

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (res.ok) {
          const data = await res.json()
          setUploadedImages((prev) => [
            ...prev,
            { url: data.url, altText: file.name.replace(/\.[^/.]+$/, "") },
          ])
        }
      }
    } catch {
      setError("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  function removeImage(index: number) {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSave(status: "draft" | "published") {
    setIsSubmitting(true)
    setError(null)
    try {
      await handleSubmit(async (data) => {
        const body: Record<string, unknown> = {
          name: data.name,
          description: data.description,
          categoryId: data.category || undefined,
          basePriceMinor: Math.round(data.regularPrice * 100),
          compareAtPriceMinor: data.salePrice ? Math.round(data.salePrice * 100) : undefined,
          sku: data.sku,
          stockQuantity: data.stockQuantity,
          lowStockThreshold: data.lowStockThreshold,
          seoTitle: data.metaTitle || undefined,
          seoDescription: data.metaDescription || undefined,
          images: uploadedImages.length > 0
            ? uploadedImages.map((img, i) => ({
                url: img.url,
                altText: img.altText || data.name,
                isPrimary: i === 0,
              }))
            : [{ url: "/placeholder.svg", altText: data.name, isPrimary: true }],
          variants: variants
            .filter((v) => v.size || v.color)
            .map((v) => ({
              title: `${v.size} / ${v.color}`.trim(),
              sku: `${data.sku}-${v.size || "v"}-${v.color || "c"}`,
              options: {
                ...(v.size && { size: v.size }),
                ...(v.color && { color: v.color }),
              },
              priceMinor: Math.round(data.regularPrice * 100),
            })),
        }

        const res = await fetch("/api/seller/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })

        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || "Failed to create product")
        }

        if (status === "published") {
          const product = await res.json()
          await fetch(`/api/seller/products/${product.id}/submit`, {
            method: "POST",
          })
        }

        router.push("/seller/products")
      })()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
>>>>>>> c6c67738eb28cd2ac7754f4cda6db89a8044443b
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Product</h1>
          <p className="text-sm text-muted-foreground">
            Add a new product to your catalog
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onSave("draft")} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Draft
          </Button>
          <Button onClick={() => onSave("published")} disabled={isSubmitting} className="bg-[#1C5C56] hover:bg-[#164a45]">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Publish
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide the core details about your product.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" {...register("name")} placeholder="e.g. Kitenge Maxi Dress" />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe your product in detail..."
                  rows={5}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(v) => setValue("category", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length > 0
                        ? categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))
                        : (
                            <>
                              <SelectItem value="Fashion">Fashion</SelectItem>
                              <SelectItem value="Beauty">Beauty</SelectItem>
                              <SelectItem value="Skincare">Skincare</SelectItem>
                              <SelectItem value="Accessories">Accessories</SelectItem>
                              <SelectItem value="Footwear">Footwear</SelectItem>
                              <SelectItem value="Jewelry">Jewelry</SelectItem>
                            </>
                          )
                      }
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-xs text-destructive">{errors.category.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input id="tags" {...register("tags")} placeholder="e.g. kitenge, summer, dress" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>Upload images for your product. The first image will be the primary display image.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <label
                  htmlFor="image-upload"
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground hover:bg-muted"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {isUploading ? "Uploading..." : "Upload Images"}
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </div>
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="group relative">
                      <img
                        src={img.url}
                        alt={img.altText}
                        className="h-24 w-full rounded-md object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -right-1 -top-1 hidden rounded-full bg-destructive p-1 text-white group-hover:block"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 rounded bg-[#1C5C56] px-1.5 py-0.5 text-xs text-white">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {uploadedImages.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  No images uploaded yet. Click the button above to add product images.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Set your product pricing and tax class.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="regularPrice">Regular Price (KES)</Label>
                  <Input id="regularPrice" type="number" {...register("regularPrice")} placeholder="0" />
                  {errors.regularPrice && (
                    <p className="text-xs text-destructive">{errors.regularPrice.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Sale Price (KES)</Label>
                  <Input id="salePrice" type="number" {...register("salePrice")} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxClass">Tax Class</Label>
                  <Select onValueChange={(v) => setValue("taxClass", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tax class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (16% VAT)</SelectItem>
                      <SelectItem value="reduced">Reduced (8% VAT)</SelectItem>
                      <SelectItem value="exempt">Tax Exempt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
              <CardDescription>Manage stock and identification.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" {...register("sku")} placeholder="e.g. KMD-001" />
                  {errors.sku && (
                    <p className="text-xs text-destructive">{errors.sku.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input id="stockQuantity" type="number" {...register("stockQuantity")} placeholder="0" />
                  {errors.stockQuantity && (
                    <p className="text-xs text-destructive">{errors.stockQuantity.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input id="lowStockThreshold" type="number" {...register("lowStockThreshold")} placeholder="10" />
                  {errors.lowStockThreshold && (
                    <p className="text-xs text-destructive">{errors.lowStockThreshold.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Variants</CardTitle>
                  <CardDescription>Add size, color, or other variants.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addVariant}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Variant
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {variants.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No variants added yet. Click &quot;Add Variant&quot; to create one.
                </p>
              )}
              {variants.map((variant) => (
                <div key={variant.id} className="flex items-end gap-3 rounded-lg border p-3">
                  <div className="flex-1 space-y-2">
                    <Label>Size</Label>
                    <Input
                      value={variant.size}
                      onChange={(e) => updateVariant(variant.id, "size", e.target.value)}
                      placeholder="e.g. M, L, XL"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Color</Label>
                    <Input
                      value={variant.color}
                      onChange={(e) => updateVariant(variant.id, "color", e.target.value)}
                      placeholder="e.g. Red, Blue"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => removeVariant(variant.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
              <CardDescription>Upload product images.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/50"
                  >
                    <Upload className="h-6 w-6" />
                    <span className="sr-only">Upload image {i + 1}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
              <CardDescription>Optimize for search engines.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input id="metaTitle" {...register("metaTitle")} placeholder="SEO title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  {...register("metaDescription")}
                  placeholder="SEO description"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
