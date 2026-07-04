"use client"

import { useState, useEffect } from "react"
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

import {
  getMockProducts,
  deleteMockProduct,
  addMockProduct,
  updateMockProduct,
  type MockProduct,
} from "../../../lib/products/mock-store"

const statusFilterOptions = ["All", "Active", "Draft", "Out of Stock"] as const

function StatusBadge({ status }: { status: MockProduct["status"] }) {
  const variantMap: Record<MockProduct["status"], "default" | "secondary" | "destructive"> = {
    Active: "default",
    Draft: "secondary",
    "Out of Stock": "destructive",
  }
  return <Badge variant={variantMap[status]}>{status}</Badge>
}

export default function ProductsPage() {
  const [products, setProducts] = useState<MockProduct[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Load from localStorage mock store
  useEffect(() => {
    setProducts(getMockProducts())
  }, [])

  const handleRefresh = () => {
    setProducts(getMockProducts())
  }

  const handleDelete = (id: string) => {
    deleteMockProduct(id)
    handleRefresh()
  }

  const handleArchive = (id: string) => {
    const prod = products.find((p) => p.id === id)
    if (prod) {
      const newStatus = prod.status === "Active" ? "Draft" : "Active"
      updateMockProduct(id, { status: newStatus })
      handleRefresh()
    }
  }

  const handleDuplicate = (id: string) => {
    const prod = products.find((p) => p.id === id)
    if (prod) {
      addMockProduct({
        name: `${prod.name} - Copy`,
        sku: `${prod.sku}-COPY`,
        price: prod.price,
        comparePrice: prod.comparePrice,
        stock: prod.stock,
        status: "Draft",
        category: prod.category,
        description: prod.description,
        images: prod.images,
        variants: prod.variants.map((v) => ({ ...v, id: crypto.randomUUID() })),
      })
      handleRefresh()
    }
  }

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "All" || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        <Button asChild>
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
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilterOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {paginated.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Package}
              title="No products found"
              description="Get started by adding your first product to the catalog, or adjust your filters."
              action={
                <Button asChild>
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
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                          {product.images && product.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.images[0]}
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
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {product.sku}
                      </TableCell>
                      <TableCell>KES {product.price.toLocaleString()}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <StatusBadge status={product.status} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
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
                            <DropdownMenuItem onClick={() => handleArchive(product.id)}>
                              <Archive className="mr-2 h-4 w-4" />
                              {product.status === "Active" ? "Archive" : "Activate"}
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
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
