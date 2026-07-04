"use client"

import { useMemo, useState, useCallback, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Star,
} from "lucide-react"

import { cn } from "../../../lib/utils"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Separator } from "../../../components/ui/separator"
import { Checkbox } from "../../../components/ui/checkbox"
import { Label } from "../../../components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../../components/ui/pagination"
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group"
import { Price } from "../../../components/shared/price"
import { Rating } from "../../../components/shared/rating"
import { ProductCard, type Product as ProductCardType } from "../../../components/shared/product-card"
import { EmptyState } from "../../../components/shared/empty-state"

interface SearchProduct extends ProductCardType {
  category: string
  brand: string
  colors: string[]
}

const MOCK_PRODUCTS: SearchProduct[] = Array.from({ length: 24 }, (_, i) => ({
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
  ][i % 8] ?? "",
  price: [4500, 3200, 8900, 12500, 5600, 2800, 6500, 1800][i % 8] ?? 0,
  comparePrice: [null, 4200, null, 15000, null, 3800, null, 2500][i % 8] as number | null | undefined,
  images: [`/placeholder.svg`],
  rating: [4.5, 3.8, 4.2, 4.8, 4.0, 3.5, 4.6, 4.3][i % 8] ?? 0,
  reviewCount: [24, 12, 45, 78, 33, 8, 56, 19][i % 8] ?? 0,
  isNew: [true, false, false, true, false, true, false, false][i % 8] ?? false,
  discount: [null, 15, null, 20, null, 25, null, 30][i % 8] as number | null | undefined,
  sellerName: [
    "Luxe Kenya",
    "African Trends",
    "Nairobi Styles",
    "Elegance Hub",
  ][i % 4] ?? "",
  slug: `product-${i + 1}`,
  category: [
    "Dresses",
    "Tops",
    "Outerwear",
    "Dresses",
    "Bottoms",
    "Tops",
    "Accessories",
    "Accessories",
  ][i % 8] ?? "",
  brand: [
    "Luxe Africa",
    "Safari Chic",
    "Nairobi Luxe",
    "Malaika",
    "Zuri",
    "Kente House",
    "Beaded Bliss",
    "Afro Glam",
  ][i % 8] ?? "",
  colors: ["Black", "Red", "Gold", "Blue", "Green", "White", "Brown", "Purple"],
}))

const CATEGORIES = [
  "Dresses",
  "Tops",
  "Bottoms",
  "Outerwear",
  "Accessories",
  "Shoes",
  "Bags",
  "Jewelry",
]

const BRANDS = [
  "Luxe Africa",
  "Safari Chic",
  "Nairobi Luxe",
  "Malaika",
  "Zuri",
  "Kente House",
  "Beaded Bliss",
  "Afro Glam",
]

const RATING_OPTIONS = [
  { value: "4", label: "4★ & above" },
  { value: "3", label: "3★ & above" },
  { value: "2", label: "2★ & above" },
  { value: "1", label: "1★ & above" },
]

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

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
]

interface Filters {
  categories: string[]
  minPrice: string
  maxPrice: string
  brands: string[]
  rating: string
  colors: string[]
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const query = searchParams.get("q") || ""
  const sortParam = searchParams.get("sort") || "relevance"
  const pageParam = Number.parseInt(searchParams.get("page") || "1", 10)

  const [searchInput, setSearchInput] = useState(query)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    minPrice: "",
    maxPrice: "",
    brands: [],
    rating: "",
    colors: [],
  })
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      if (searchInput !== query) {
        const sp = new URLSearchParams()
        if (searchInput) sp.set("q", searchInput)
        const sort = searchParams.get("sort")
        if (sort) sp.set("sort", sort)
        router.push(`/search${sp.toString() ? `?${sp.toString()}` : ""}`)
      }
    }, 300)
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchInput, query, searchParams, router])

  const updateURL = useCallback(
    (params: Record<string, string | undefined>) => {
      const sp = new URLSearchParams()
      if (query) sp.set("q", query)
      if (sortParam !== "relevance") sp.set("sort", sortParam)
      if (pageParam > 1) sp.set("page", String(pageParam))
      const merged = { ...Object.fromEntries(sp), ...params }
      const clean = Object.entries(merged).filter(
        ([, v]) => v !== undefined && v !== ""
      )
      const qs = new URLSearchParams(clean as [string, string][]).toString()
      router.push(`/search${qs ? `?${qs}` : ""}`)
    },
    [query, sortParam, pageParam, router]
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const sp = new URLSearchParams()
    if (searchInput) sp.set("q", searchInput)
    const sort = searchParams.get("sort")
    if (sort) sp.set("sort", sort)
    router.push(`/search${sp.toString() ? `?${sp.toString()}` : ""}`)
  }

  const handleSort = (value: string) => {
    const sp = new URLSearchParams()
    if (query) sp.set("q", query)
    if (value !== "relevance") sp.set("sort", value)
    router.push(`/search${sp.toString() ? `?${sp.toString()}` : ""}`)
  }

  const toggleFilter = (
    key: keyof Filters,
    value: string,
    current: string[]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: current.includes(value)
        ? current.filter((c) => c !== value)
        : [...current, value],
    }))
  }

  const clearFilters = () => {
    setFilters({
      categories: [],
      minPrice: "",
      maxPrice: "",
      brands: [],
      rating: "",
      colors: [],
    })
  }

  const activeFilterCount =
    filters.categories.length +
    filters.brands.length +
    filters.colors.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.rating ? 1 : 0)

  const filteredProducts = useMemo(() => {
    let results = [...MOCK_PRODUCTS]

    if (query) {
      const q = query.toLowerCase()
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sellerName.toLowerCase().includes(q)
      )
    }

    if (filters.categories.length > 0) {
      results = results.filter((p) => filters.categories.includes(p.category))
    }

    if (filters.brands.length > 0) {
      results = results.filter((p) => filters.brands.includes(p.brand))
    }

    if (filters.colors.length > 0) {
      results = results.filter((p) =>
        p.colors.some((c) => filters.colors.includes(c))
      )
    }

    if (filters.minPrice) {
      results = results.filter(
        (p) => p.price >= Number.parseFloat(filters.minPrice)
      )
    }

    if (filters.maxPrice) {
      results = results.filter(
        (p) => p.price <= Number.parseFloat(filters.maxPrice)
      )
    }

    if (filters.rating) {
      const minRating = Number.parseInt(filters.rating, 10)
      results = results.filter((p) => p.rating >= minRating)
    }

    switch (sortParam) {
      case "newest":
        break
      case "price-asc":
        results.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        results.sort((a, b) => b.price - a.price)
        break
      case "rating":
        results.sort((a, b) => b.rating - a.rating)
        break
      default:
        break
    }

    return results
  }, [query, sortParam, filters])

  const pageSize = 8
  const totalPages = Math.ceil(filteredProducts.length / pageSize)
  const currentPage = Math.min(pageParam, totalPages || 1)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-auto p-0 text-xs text-primary"
          >
            Clear all
          </Button>
        )}
      </div>

      <Separator />

      <div>
        <h4 className="mb-3 text-sm font-medium">Category</h4>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <label
              key={cat}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={filters.categories.includes(cat)}
                onCheckedChange={() =>
                  toggleFilter("categories", cat, filters.categories)
                }
              />
              {cat}
            </label>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="mb-3 text-sm font-medium">Price Range (KES)</h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, minPrice: e.target.value }))
            }
            className="h-9"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
            }
            className="h-9"
          />
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="mb-3 text-sm font-medium">Brand</h4>
        <div className="space-y-2">
          {BRANDS.map((brand) => (
            <label
              key={brand}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={filters.brands.includes(brand)}
                onCheckedChange={() =>
                  toggleFilter("brands", brand, filters.brands)
                }
              />
              {brand}
            </label>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="mb-3 text-sm font-medium">Rating</h4>
        <RadioGroup
          value={filters.rating}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, rating: value }))
          }
        >
          {RATING_OPTIONS.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-2 text-sm"
            >
              <RadioGroupItem value={option.value} id={`rating-${option.value}`} />
              <Label htmlFor={`rating-${option.value}`}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      <div>
        <h4 className="mb-3 text-sm font-medium">Color</h4>
        <div className="flex flex-wrap gap-2">
          {COLOR_SWATCHES.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() =>
                toggleFilter("colors", color.name, filters.colors)
              }
              className={cn(
                "h-8 w-8 rounded-full border-2 transition-all",
                color.class,
                filters.colors.includes(color.name)
                  ? "border-primary ring-2 ring-primary ring-offset-1"
                  : "border-transparent"
              )}
              aria-label={color.name}
              title={color.name}
            />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
      </form>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "result" : "results"}
            {query && (
              <>
                {" "}
                for "<span className="font-medium">{query}</span>"
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortParam} onValueChange={handleSort}>
            <SelectTrigger className="w-[180px]">
              <ChevronDown className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {filters.categories.map((cat) => (
            <Badge key={cat} variant="secondary" className="gap-1">
              {cat}
              <button
                type="button"
                onClick={() =>
                  toggleFilter("categories", cat, filters.categories)
                }
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.brands.map((brand) => (
            <Badge key={brand} variant="secondary" className="gap-1">
              {brand}
              <button
                type="button"
                onClick={() => toggleFilter("brands", brand, filters.brands)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.colors.map((color) => (
            <Badge key={color} variant="secondary" className="gap-1">
              {color}
              <button
                type="button"
                onClick={() => toggleFilter("colors", color, filters.colors)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.minPrice && (
            <Badge variant="secondary" className="gap-1">
              Min: KES {Number(filters.minPrice).toLocaleString()}
              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, minPrice: "" }))
                }
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.maxPrice && (
            <Badge variant="secondary" className="gap-1">
              Max: KES {Number(filters.maxPrice).toLocaleString()}
              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, maxPrice: "" }))
                }
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.rating && (
            <Badge variant="secondary" className="gap-1">
              {filters.rating}★ & above
              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, rating: "" }))
                }
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <Card className="sticky top-24 p-4">
            <FilterSidebar />
          </Card>
        </aside>

        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-xl bg-background p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileFilters(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <FilterSidebar />
              <Button
                className="mt-6 w-full"
                onClick={() => setShowMobileFilters(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1">
          {paginatedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href={`/search?${new URLSearchParams(
                            Object.entries({
                              q: query || undefined,
                              sort: sortParam !== "relevance" ? sortParam : undefined,
                              page:
                                currentPage > 1
                                  ? String(currentPage - 1)
                                  : undefined,
                            }).filter(([, v]) => v !== undefined) as [string, string][]
                          ).toString()}`}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (p) => (
                          <PaginationItem key={p}>
                            <PaginationLink
                              href={`/search?${new URLSearchParams(
                                Object.entries({
                                  q: query || undefined,
                                  sort:
                                    sortParam !== "relevance"
                                      ? sortParam
                                      : undefined,
                                  page: p > 1 ? String(p) : undefined,
                                }).filter(([, v]) => v !== undefined) as [string, string][]
                              ).toString()}`}
                              isActive={p === currentPage}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext
                          href={`/search?${new URLSearchParams(
                            Object.entries({
                              q: query || undefined,
                              sort: sortParam !== "relevance" ? sortParam : undefined,
                              page:
                                currentPage < totalPages
                                  ? String(currentPage + 1)
                                  : undefined,
                            }).filter(([, v]) => v !== undefined) as [string, string][]
                          ).toString()}`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={Search}
              title="No results found"
              description={
                query
                  ? `We couldn't find any matches for "${query}". Try adjusting your filters or search terms.`
                  : "No products match the selected filters. Try widening your criteria."
              }
              action={
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    Suggestions:
                  </p>
                  <ul className="text-sm text-muted-foreground">
                    <li>Check your spelling</li>
                    <li>Try broader search terms</li>
                    <li>Remove some filters</li>
                  </ul>
                  <Button
                    variant="outline"
                    onClick={() => {
                      clearFilters()
                      router.push("/search")
                    }}
                  >
                    Clear all filters
                  </Button>
                </div>
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}
