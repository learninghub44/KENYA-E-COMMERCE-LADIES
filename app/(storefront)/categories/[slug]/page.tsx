"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Star,
  PackageOpen,
  Grid3X3,
  List,
} from "lucide-react"

import { cn } from "../../../../lib/utils"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Card, CardContent } from "../../../../components/ui/card"
import { Badge } from "../../../../components/ui/badge"
import { Separator } from "../../../../components/ui/separator"
import { Checkbox } from "../../../../components/ui/checkbox"
import { Label } from "../../../../components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select"
import { Slider } from "../../../../components/ui/slider"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../../../components/ui/drawer"
import { Breadcrumbs } from "../../../../components/shared/breadcrumbs"
import { ProductCard, type Product, type ProductSummaryLike, toCardProduct } from "../../../../components/shared/product-card"
import { EmptyState } from "../../../../components/shared/empty-state"
import type { CategoryRecord } from "../../../../lib/marketplace/types"

const COLOR_SWATCHES = [
  { name: "Black", class: "bg-black" },
  { name: "Red", class: "bg-red-600" },
  { name: "Gold", class: "bg-yellow-500" },
  { name: "Blue", class: "bg-blue-700" },
  { name: "Green", class: "bg-green-700" },
  { name: "White", class: "bg-white border" },
  { name: "Brown", class: "bg-amber-800" },
  { name: "Purple", class: "bg-purple-700" },
]

const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"]

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
]

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string

  const [category, setCategory] = useState<CategoryRecord | null>(null)
  const [categoryLoading, setCategoryLoading] = useState(true)
  const [categoryError, setCategoryError] = useState(false)

  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)

  const [sortBy, setSortBy] = useState("newest")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [minRating, setMinRating] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const itemsPerPage = 12

  useEffect(() => {
    let cancelled = false
    async function load() {
      setCategoryLoading(true)
      setCategoryError(false)
      try {
        const res = await fetch(`/api/catalog/categories/${slug}`)
        if (!res.ok) {
          if (!cancelled) setCategoryError(true)
          return
        }
        const data = await res.json()
        if (!cancelled) setCategory(data)
      } catch {
        if (!cancelled) setCategoryError(true)
      } finally {
        if (!cancelled) setCategoryLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [slug])

  useEffect(() => {
    const cat = category
    if (!cat) return
    const catId = cat.id
    let cancelled = false
    async function load() {
      setProductsLoading(true)
      try {
        const res = await fetch(`/api/products/search?categoryId=${catId}&limit=200`)
        if (!res.ok) {
          if (!cancelled) setProducts([])
          return
        }
        const data = await res.json() as { items: ProductSummaryLike[] }
        if (!cancelled) setProducts(data.items.map(toCardProduct))
      } catch {
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setProductsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [category])

  const brands = useMemo(() => {
    const unique = new Set(products.map(p => p.sellerName).filter(Boolean))
    return Array.from(unique).sort()
  }, [products])

  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 20000 }
    const prices = products.map(p => p.price)
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }, [products])

  useEffect(() => {
    setPriceRange([priceBounds.min, priceBounds.max])
  }, [priceBounds.min, priceBounds.max])

  function toggleBrand(brand: string) {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    )
    setCurrentPage(1)
  }

  function toggleSize(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
    setCurrentPage(1)
  }

  function toggleColor(color: string) {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    )
    setCurrentPage(1)
  }

  function clearFilters() {
    setPriceRange([priceBounds.min, priceBounds.max])
    setSelectedBrands([])
    setSelectedSizes([])
    setSelectedColors([])
    setMinRating(0)
    setCurrentPage(1)
  }

  const isLoading = categoryLoading || productsLoading

  const sorted = useMemo(() => {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case "price-asc": return a.price - b.price
        case "price-desc": return b.price - a.price
        case "rating": return b.rating - a.rating
        default: return 0
      }
    })
  }, [products, sortBy])

  const filtered = useMemo(() => {
    return sorted.filter((p) => {
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.sellerName)) return false
      if (minRating > 0 && p.rating < minRating) return false
      return true
    })
  }, [sorted, priceRange, selectedBrands, minRating])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const paginated = useMemo(() => {
    return filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  }, [filtered, currentPage])
  const hasActiveFilters = priceRange[0] > priceBounds.min || priceRange[1] < priceBounds.max || selectedBrands.length > 0 || selectedSizes.length > 0 || selectedColors.length > 0 || minRating > 0
  const filterCount = [selectedBrands.length, selectedSizes.length, selectedColors.length, minRating > 0 ? 1 : 0, (priceRange[0] > priceBounds.min || priceRange[1] < priceBounds.max) ? 1 : 0].reduce((a, b) => a + b, 0)

  const FilterContent = () => (
    <div className="space-y-6" role="form" aria-label="Filter products">
      <div>
        <h4 className="mb-3 text-sm font-medium">Price Range</h4>
        <div className="space-y-3">
          <Slider
            value={priceRange}
            onValueChange={(val) => { setPriceRange(val as [number, number]); setCurrentPage(1) }}
            min={priceBounds.min}
            max={priceBounds.max}
            step={500}
            aria-label="Price range"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>KES {priceRange[0].toLocaleString()}</span>
            <span>KES {priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="mb-3 text-sm font-medium">Brand</h4>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label key={brand} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
                aria-label={`Filter by brand: ${brand}`}
              />
              {brand}
            </label>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="mb-3 text-sm font-medium">Size</h4>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors",
                selectedSizes.includes(size)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
              )}
              aria-pressed={selectedSizes.includes(size)}
              aria-label={`Size ${size}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="mb-3 text-sm font-medium">Color</h4>
        <div className="flex flex-wrap gap-2">
          {COLOR_SWATCHES.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => toggleColor(color.name)}
              className={cn(
                "inline-flex h-8 items-center justify-center rounded-full border px-3 text-xs font-medium transition-colors",
                selectedColors.includes(color.name)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
              )}
              aria-pressed={selectedColors.includes(color.name)}
              aria-label={`Color ${color.name}`}
            >
              {color.name}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="mb-3 text-sm font-medium">Minimum Rating</h4>
        <div className="flex flex-wrap gap-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => { setMinRating(minRating === rating ? 0 : rating); setCurrentPage(1) }}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                minRating === rating
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
              )}
              aria-pressed={minRating === rating}
              aria-label={`${rating} stars and up`}
            >
              <Star className="h-3 w-3 fill-current" />
              {rating}+
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  if (categoryLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (categoryError || !category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <EmptyState
          icon={PackageOpen}
          title="Category Not Found"
          description={`The category "${slug}" could not be found. Please check the URL or browse our available categories.`}
          action={
            <Button asChild>
              <Link href="/categories">Browse Categories</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Categories", href: "/categories" },
              { label: category.name },
            ]}
          />
          <div className="relative aspect-[3/1] overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 to-primary/5">
            <Image
              src="/placeholder.svg"
              alt={category.name}
              fill
              className="object-cover opacity-30"
              priority
            />
            <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12">
              <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                {category.name}
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                {category.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-24">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs text-primary hover:underline"
                    aria-label="Clear all filters"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          <div className="flex-1">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Drawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <DrawerTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden" aria-label="Open filters">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Filters
                      {filterCount > 0 && (
                        <Badge variant="default" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                          {filterCount}
                        </Badge>
                      )}
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Filters</DrawerTitle>
                      <DrawerDescription>
                        Refine your product search
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="max-h-[60vh] overflow-y-auto px-4">
                      <FilterContent />
                    </div>
                    <DrawerFooter>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => { clearFilters(); setIsFilterOpen(false) }}
                        >
                          Clear All
                        </Button>
                        <DrawerClose asChild>
                          <Button className="flex-1">Apply Filters</Button>
                        </DrawerClose>
                      </div>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>

                <p className="text-sm text-muted-foreground">
                  {filtered.length} product{filtered.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center rounded-md border sm:flex" role="group" aria-label="View mode">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={cn("rounded-l-md p-2 transition-colors", viewMode === "grid" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground")}
                    aria-label="Grid view"
                    aria-pressed={viewMode === "grid"}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={cn("rounded-r-md border-l p-2 transition-colors", viewMode === "list" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground")}
                    aria-label="List view"
                    aria-pressed={viewMode === "list"}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                <Select value={sortBy} onValueChange={(val) => { setSortBy(val); setCurrentPage(1) }}>
                  <SelectTrigger className="w-[180px]" aria-label="Sort by">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="py-20">
                <EmptyState
                  icon={PackageOpen}
                  title="No products found"
                  description="Try adjusting your filters or search criteria to find what you're looking for."
                  action={
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  }
                />
              </div>
            ) : (
              <motion.div
                className={cn(
                  "grid gap-6",
                  viewMode === "grid"
                    ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {paginated.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            )}

            {totalPages > 1 && (
              <nav className="mt-12 flex items-center justify-center gap-1" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                    className="min-w-[36px]"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  Next
                </Button>
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
