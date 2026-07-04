"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Star,
  Archive,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Badge } from "../../../components/ui/badge"
import { Skeleton } from "../../../components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
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

interface ProductImage {
  url: string
  is_primary: boolean
}

interface ProductSeller {
  store_name: string
}

interface ProductInventory {
  quantity_available: number
  quantity_reserved: number
}

interface Product {
  id: string
  name: string
  status: string
  base_price_minor: number
  is_featured: boolean
  created_at: string
  product_images: ProductImage[]
  sellers: ProductSeller
  inventory_items: ProductInventory[]
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  pending_review: "outline",
  draft: "secondary",
  rejected: "destructive",
  archived: "secondary",
}

const statusLabel: Record<string, string> = {
  active: "Active",
  pending_review: "Pending Review",
  draft: "Draft",
  rejected: "Rejected",
  archived: "Archived",
}

const ITEMS_PER_PAGE = 10

export default function ProductsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [page, setPage] = useState(1)
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (statusFilter !== "All") params.set("status", statusFilter.toLowerCase().replace(" ", "_"))
    params.set("page", String(page))
    params.set("limit", String(ITEMS_PER_PAGE))

    try {
      const res = await fetch(`/api/admin/products?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setProducts(data.products)
      setTotal(data.total)
    } catch {
      setToast({ message: "Failed to load products", type: "error" })
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const handleAction = async (productId: string, action: string) => {
    setActionLoading(productId)
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setToast({ message: `Product ${action}d successfully`, type: "success" })
      fetchProducts()
    } catch {
      setToast({ message: `Failed to ${action} product`, type: "error" })
    } finally {
      setActionLoading(null)
    }
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const formatPrice = (minor: number) => `KES ${(minor / 100).toLocaleString()}`

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-md px-4 py-2 text-sm text-white shadow-lg ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Product Moderation</h1>
        <p className="text-sm text-muted-foreground">Review, approve, and manage platform products</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Products</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-9 w-64"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending Review">Pending Review</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24 ml-auto" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No products found.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const primaryImage = product.product_images?.find((img) => img.is_primary)
                    const stock = product.inventory_items?.reduce(
                      (acc, inv) => acc + (inv.quantity_available ?? 0) - (inv.quantity_reserved ?? 0),
                      0
                    ) ?? 0
                    const statusKey = product.status ?? "draft"

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {primaryImage ? (
                              <img
                                src={primaryImage.url}
                                alt={product.name}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xs font-bold">
                                {product.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.is_featured && (
                                <Badge variant="outline" className="mt-0.5 text-xs">
                                  <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{product.sellers?.store_name ?? "—"}</TableCell>
                        <TableCell className="font-medium">{formatPrice(product.base_price_minor)}</TableCell>
                        <TableCell>
                          <span className={stock === 0 ? "text-destructive" : ""}>
                            {stock}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[statusKey] ?? "secondary"}>
                            {statusLabel[statusKey] ?? statusKey}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={actionLoading === product.id}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {statusKey === "pending_review" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleAction(product.id, "approve")}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAction(product.id, "reject")}>
                                    <XCircle className="mr-2 h-4 w-4 text-destructive" /> Reject
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem onClick={() => handleAction(product.id, product.is_featured ? "unfeature" : "feature")}>
                                <Star className="mr-2 h-4 w-4 text-yellow-500" />
                                {product.is_featured ? "Unfeature" : "Feature"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleAction(product.id, "archive")}>
                                <Archive className="mr-2 h-4 w-4" /> Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} ({total} total)
                  </p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
