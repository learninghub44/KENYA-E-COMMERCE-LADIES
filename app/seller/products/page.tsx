"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Search,
  Plus,
  MoreHorizontal,
  Copy,
  Archive,
  Trash2,
  Edit,
  Package,
  Send,
  Loader2,
} from "lucide-react"

import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Badge } from "../../../components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import { EmptyState } from "../../../components/shared/empty-state"
import {
  Card,
  CardContent,
} from "../../../components/ui/card"

interface ProductImage {
  id: string
  url: string
  is_primary: boolean
}

interface ProductVariant {
  id: string
  title: string | null
  options: Record<string, string> | null
}

interface InventoryItem {
  id: string
  quantity_available: number
}

interface Product {
  id: string
  name: string
  slug: string
  status: string
  base_price_minor: number
  compare_at_price_minor: number | null
  sku?: string
  product_images: ProductImage[]
  product_variants: ProductVariant[]
  inventory_items: InventoryItem[]
  created_at: string
}

const statusFilterOptions = ["All", "active", "draft", "pending_review", "archived", "rejected"] as const

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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const limit = 10

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (statusFilter !== "All") params.set("status", statusFilter)
      params.set("page", currentPage.toString())
      params.set("limit", limit.toString())

      const res = await fetch(`/api/seller/products?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
        setTotal(data.total || 0)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, currentPage])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleDuplicate = async (id: string) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/seller/products/${id}/duplicate`, { method: "POST" })
      if (res.ok) {
        fetchProducts()
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/seller/products/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchProducts()
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleSubmitForReview = async (id: string) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/seller/products/${id}/submit`, { method: "POST" })
      if (res.ok) {
        fetchProducts()
      }
    } finally {
      setActionLoading(null)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        <Button asChild className="bg-[#1C5C56] hover:bg-[#164a45]">
          <Link href="/seller/products/new">
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilterOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt === "All" ? "All Statuses" : opt.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading products...
            </div>
          </CardContent>
        </Card>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Package}
              title="No products found"
              description="Get started by adding your first product to the catalog, or adjust your filters."
              action={
                <Button asChild className="bg-[#1C5C56] hover:bg-[#164a45]">
                  <Link href="/seller/products/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const primaryImage = product.product_images?.find((img) => img.is_primary) || product.product_images?.[0]
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                            {primaryImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={primaryImage.url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/seller/products/${product.id}`}
                            className="font-medium hover:underline text-[#1C5C56]"
                          >
                            {product.name}
                          </Link>
                        </TableCell>
                        <TableCell>KES {product.base_price_minor.toLocaleString()}</TableCell>
                        <TableCell>
                          <StatusBadge status={product.status} />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={actionLoading === product.id}>
                                {actionLoading === product.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="h-4 w-4" />
                                )}
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/seller/products/${product.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(product.id)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              {(product.status === "draft" || product.status === "rejected") && (
                                <DropdownMenuItem onClick={() => handleSubmitForReview(product.id)}>
                                  <Send className="mr-2 h-4 w-4" />
                                  Submit for Review
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleDelete(product.id)}>
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} ({total} products)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
