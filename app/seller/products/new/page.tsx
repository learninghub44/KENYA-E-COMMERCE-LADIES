"use client"

import { useState } from "react"
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
import { Separator } from "../../../../components/ui/separator"

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

interface Variant {
  id: string
  size: string
  color: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [variants, setVariants] = useState<Variant[]>([])

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

  function onSave(status: "draft" | "published") {
    handleSubmit((data) => {
      router.push("/products")
    })()
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
          <Button variant="outline" onClick={() => onSave("draft")}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button onClick={() => onSave("published")}>
            <Send className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

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
                      <SelectItem value="dresses">Dresses</SelectItem>
                      <SelectItem value="tops">Tops</SelectItem>
                      <SelectItem value="bottoms">Bottoms</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="shoes">Shoes</SelectItem>
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
