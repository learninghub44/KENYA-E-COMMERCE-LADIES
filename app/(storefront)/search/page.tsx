"use client"

import { useMemo, useState, useCallback, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  AlertTriangle,
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
import { ProductCard, type Product } from "../../../components/shared/product-card"
import { EmptyState } from "../../../components/shared/empty-state"

// Colors are a fixed swatch vocabulary for the filter UI (not fetched — there's no "colors"
// table, `colors` on product_search_documents is a free-text array). Matches the same 8-value
// set sellers are guided toward when tagging products.
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

const RATING_OPTIONS = [
  { value: "4", label: "4★ & above" },
  { value: "3", label: "3★ & above" },
  { value: "2", label: "2★ & above" },
  { value: "1", label: "1★ & above" },
]

// Values match ProductSearchFilters["sort"] directly so no client/server mapping is needed.
const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
]

const PAGE_SIZE = 12

interface Filters {
  categories: string[]
  minPrice: string
  maxPrice: string
  brands: string[]
  rating: string
  colors: string[]
}

interface CatalogOption {
  id: string
  name: string
  slug: string
}

interface CategoryNodeLike extends CatalogOption {
  children?: CategoryNodeLike[]
}

function flattenCategories(nodes: CategoryNodeLike[]): CatalogOption[] {
  const flat: CatalogOption[] = []
  for (const node of nodes) {
    flat.push({ id: node.id, name: node.name, slug: node.slug })
    if (node.children?.length) flat.push(...flattenCategories(node.children))
  }
  return flat
}

interface ProductSummaryLike {
  id: string
  name: string
  slug: string
  basePriceMinor: number
  compareAtPriceMinor: number | null
  primaryImageUrl: string | null
  sellerStoreName: string
  publishedAt: string | null
  rating: number
  reviewCount: number
}

function toCardProduct(summary: ProductSummaryLike): Product {
  const price = summary.basePriceMinor / 100
  const comparePrice = summary.compareAtPriceMinor != null ? summary.compareAtPriceMinor / 100 : null
  const discount =
    comparePrice != null && comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : null
  const isNew = summary.publishedAt
    ? Date.now() - new Date(summary.publishedAt).getTime() < 1000 * 60 * 60 * 24 * 30
    : false

  return {
    id: summary.id,
    name: summary.name,
    price,
    comparePrice,
    images: summary.primaryImageUrl ? [summary.primaryImageUrl] : [],
    rating: summary.rating,
    reviewCount: summary.reviewCount,
    isNew,
    discount,
    sellerName: summary.sellerStoreName,
    slug: summary.slug,
  }
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const query = searchParams.get("q") || ""
  const sortParam = searchParams.get("sort") || "relevance"
  const pageParam = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1)
  const categorySlugs = useMemo(() => searchParams.get("categories")?.split(",").filter(Boolean) ?? [], [searchParams])
  const brandSlugs = useMemo(() => searchParams.get("brands")?.split(",").filter(Boolean) ?? [], [searchParams])
  const minPriceParam = searchParams.get("minPrice") || ""
  const maxPriceParam = searchParams.get("maxPrice") || ""
  const ratingParam = searchParams.get("rating") || ""
  const colorsParam = useMemo(() => searchParams.get("colors")?.split(",").filter(Boolean) ?? [], [searchParams])

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

  const [categories, setCategories] = useState<CatalogOption[]>([])
  const [brands, setBrands] = useState<CatalogOption[]>([])
  const [catalogLoaded, setCatalogLoaded] = useState(false)

  const [products, setProducts] = useState<Product[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [searchError, setSearchError] = useState<string | null>(null)

  useEffect(() => setSearchInput(query), [query])

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

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          fetch("/api/catalog/categories"),
          fetch("/api/catalog/brands"),
        ])
        const categoryTree: CategoryNodeLike[] = categoriesRes.ok ? await categoriesRes.json() : []
        const brandList: CatalogOption[] = brandsRes.ok ? await brandsRes.json() : []
        if (cancelled) return
        setCategories(flattenCategories(categoryTree))
        setBrands(brandList)
      } catch {
        // Filter lists are a progressive enhancement; leave them empty on failure.
      } finally {
        if (!cancelled) setCatalogLoaded(true)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const categoryIds = useMemo(
    () => categorySlugs.map((slug) => categories.find((c) => c.slug === slug)?.id).filter((id): id is string => Boolean(id)),
    [categorySlugs, categories]
  )
  const brandIds = useMemo(
    () => brandSlugs.map((slug) => brands.find((b) => b.slug === slug)?.id).filter((id): id is string => Boolean(id)),
    [brandSlugs, brands]
  )

  // Fetch products whenever any search-affecting param changes. Waits for catalogLoaded so
  // category/brand slugs can be resolved to IDs before the request goes out.
  useEffect(() => {
    if (!catalogLoaded) return
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setSearchError(null)
      try {
        const sp = new URLSearchParams()
        if (query) sp.set("q", query)
        sp.set("sort", sortParam)
        sp.set("page", String(pageParam))
        sp.set("limit", String(PAGE_SIZE))
        if (categoryIds.length) sp.set("categoryIds", categoryIds.join(","))
        if (brandIds.length) sp.set("brandIds", brandIds.join(","))
        if (minPriceParam) sp.set("minPriceMinor", String(Math.round(Number(minPriceParam) * 100)))
        if (maxPriceParam) sp.set("maxPriceMinor", String(Math.round(Number(maxPriceParam) * 100)))
        if (ratingParam) sp.set("minRating", ratingParam)
        if (colorsParam.length) sp.set("colors", colorsParam.join(","))

        const res = await fetch(`/api/products/search?${sp.toString()}`)
        if (!res.ok) {
          const body = await res.json().catch(() => null)
          throw new Error(body?.error ?? "Search failed. Please try again.")
        }
        const data = (await res.json()) as { items: ProductSummaryLike[]; totalCount?: number }
        if (cancelled) return
        setProducts(data.items.map(toCardProduct))
        setTotalCount(data.totalCount ?? data.items.length)
      } catch (e) {
        if (!cancelled) {
          setSearchError(e instanceof Error ? e.message : "Search failed. Please try again.")
          setProducts([])
          setTotalCount(0)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [catalogLoaded, query, sortParam, pageParam, categoryIds, brandIds, minPriceParam, maxPriceParam, ratingParam, colorsParam])

  /** Builds a /search href from the current params with the given patch applied (undefined/"" deletes the key). */
  const hrefWith = useCallback(
    (patch: Record<string, string | undefined>) => {
      const sp = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === "") sp.delete(key)
        else sp.set(key, value)
      }
      const qs = sp.toString()
      return `/search${qs ? `?${qs}` : ""}`
    },
    [searchParams]
  )

  const navigateWith = useCallback((patch: Record<string, string | undefined>) => router.push(hrefWith(patch)), [hrefWith, router])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigateWith({ q: searchInput || undefined, page: undefined })
  }

  const toggleListParam = (paramName: string, current: string[], value: string) => {
    const next = current.includes(value) ? current.filter((c) => c !== value) : [...current, value]
    navigateWith({ [paramName]: next.length ? next.join(",") : undefined, page: undefined })
  }

  const clearFilters = () => {
    navigateWith({
      categories: undefined,
      brands: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      rating: undefined,
      colors: undefined,
      page: undefined,
    })
  }

  const activeFilterCount =
    categorySlugs.length +
    brandSlugs.length +
    colorsParam.length +
    (minPriceParam ? 1 : 0) +
    (maxPriceParam ? 1 : 0) +
    (ratingParam ? 1 : 0)

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const currentPage = Math.min(pageParam, totalPages)

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-xs text-primary">
            Clear all
          </Button>
        )}
      </div>

      <Separator />

      <div>
        <h4 className="mb-3 text-sm font-medium">Category</h4>
        <div className="space-y-2">
          {categories.length === 0 && catalogLoaded && (
            <p className="text-xs text-muted-foreground">No categories available yet.</p>
          )}
          {categories.map((cat) => (
            <label key={cat.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={categorySlugs.includes(cat.slug)}
                onCheckedChange={() => toggleListParam("categories", categorySlugs, cat.slug)}
              />
              {cat.name}
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
            defaultValue={minPriceParam}
            onBlur={(e) => navigateWith({ minPrice: e.target.value || undefined, page: undefined })}
            className="h-9"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            defaultValue={maxPriceParam}
            onBlur={(e) => navigateWith({ maxPrice: e.target.value || undefined, page: undefined })}
            className="h-9"
          />
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="mb-3 text-sm font-medium">Brand</h4>
        <div className="space-y-2">
          {brands.length === 0 && catalogLoaded && (
            <p className="text-xs text-muted-foreground">No brands available yet.</p>
          )}
          {brands.map((brand) => (
            <label key={brand.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={brandSlugs.includes(brand.slug)}
                onCheckedChange={() => toggleListParam("brands", brandSlugs, brand.slug)}
              />
              {brand.name}
            </label>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="mb-3 text-sm font-medium">Rating</h4>
        <RadioGroup value={ratingParam} onValueChange={(value) => navigateWith({ rating: value, page: undefined })}>
          {RATING_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center gap-2 text-sm">
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
              onClick={() => toggleListParam("colors", colorsParam, color.name)}
              className={cn(
                "h-8 w-8 rounded-full border-2 transition-all",
                color.class,
                colorsParam.includes(color.name) ? "border-primary ring-2 ring-primary ring-offset-1" : "border-transparent"
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
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowMobileFilters(!showMobileFilters)}>
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Searching…" : `${totalCount} ${totalCount === 1 ? "result" : "results"}`}
            {query && (
              <>
                {" "}
                for &quot;<span className="font-medium">{query}</span>&quot;
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortParam} onValueChange={(value) => navigateWith({ sort: value !== "relevance" ? value : undefined, page: undefined })}>
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
          {categorySlugs.map((slug) => {
            const label = categories.find((c) => c.slug === slug)?.name ?? slug
            return (
              <Badge key={slug} variant="secondary" className="gap-1">
                {label}
                <button type="button" onClick={() => toggleListParam("categories", categorySlugs, slug)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
          {brandSlugs.map((slug) => {
            const label = brands.find((b) => b.slug === slug)?.name ?? slug
            return (
              <Badge key={slug} variant="secondary" className="gap-1">
                {label}
                <button type="button" onClick={() => toggleListParam("brands", brandSlugs, slug)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
          {colorsParam.map((color) => (
            <Badge key={color} variant="secondary" className="gap-1">
              {color}
              <button type="button" onClick={() => toggleListParam("colors", colorsParam, color)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {minPriceParam && (
            <Badge variant="secondary" className="gap-1">
              Min: KES {Number(minPriceParam).toLocaleString()}
              <button type="button" onClick={() => navigateWith({ minPrice: undefined, page: undefined })}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {maxPriceParam && (
            <Badge variant="secondary" className="gap-1">
              Max: KES {Number(maxPriceParam).toLocaleString()}
              <button type="button" onClick={() => navigateWith({ maxPrice: undefined, page: undefined })}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {ratingParam && (
            <Badge variant="secondary" className="gap-1">
              {ratingParam}★ & above
              <button type="button" onClick={() => navigateWith({ rating: undefined, page: undefined })}>
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
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
            <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-xl bg-background p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowMobileFilters(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <FilterSidebar />
              <Button className="mt-6 w-full" onClick={() => setShowMobileFilters(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1">
          {searchError ? (
            <EmptyState
              icon={AlertTriangle}
              title="Something went wrong"
              description={searchError}
              action={
                <Button variant="outline" onClick={() => navigateWith({})}>
                  Try again
                </Button>
              }
            />
          ) : !isLoading && products.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No results found"
              description={
                query
                  ? `We couldn't find any matches for "${query}". Try adjusting your filters or search terms.`
                  : "No products match the selected filters. Try widening your criteria."
              }
              action={
                <Button variant="outline" onClick={() => (query ? navigateWith({ categories: undefined, brands: undefined, minPrice: undefined, maxPrice: undefined, rating: undefined, colors: undefined, page: undefined }) : router.push("/search"))}>
                  Clear all filters
                </Button>
              }
            />
          ) : (
            <>
              <div
                className={cn(
                  "grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 transition-opacity",
                  isLoading && "opacity-50"
                )}
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href={hrefWith({ page: currentPage > 1 ? String(currentPage - 1) : undefined })} />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <PaginationItem key={p}>
                          <PaginationLink href={hrefWith({ page: p > 1 ? String(p) : undefined })} isActive={p === currentPage}>
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext href={hrefWith({ page: currentPage < totalPages ? String(currentPage + 1) : undefined })} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
