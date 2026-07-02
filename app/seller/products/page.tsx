"use client"

import { useState } from "react"
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
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"

type ProductStatus = "Active" | "Draft" | "Out of Stock"

const mockProducts = [
  {
    id: "1",
    name: "Kitenge Maxi Dress",
    sku: "KMD-001",
    price: 3500,
    stock: 45,
    status: "Active" as ProductStatus,
    image: null,
  },
  {
    id: "2",
    name: "Beaded Sandals",
    sku: "BS-002",
    price: 1800,
    stock: 22,
    status: "Active" as ProductStatus,
    image: null,
  },
  {
    id: "3",
    name: "Ankara Blazer",
    sku: "AB-003",
    price: 5200,
    stock: 0,
    status: "Out of Stock" as ProductStatus,
    image: null,
  },
  {
    id: "4",
    name: "Kente Scarf Set",
    sku: "KSS-004",
    price: 2450,
    stock: 18,
    status: "Active" as ProductStatus,
    image: null,
  },
  {
    id: "5",
    name: "Dashiki Top",
    sku: "DT-005",
    price: 1950,
    stock: 7,
    status: "Active" as ProductStatus,
    image: null,
  },
  {
    id: "6",
    name: "Maasai Shuka Blanket",
    sku: "MSB-006",
    price: 4200,
    stock: 12,
    status: "Draft" as ProductStatus,
    image: null,
  },
  {
    id: "7",
    name: "Leather Tote Bag",
    sku: "LTB-007",
    price: 6800,
    stock: 9,
    status: "Active" as ProductStatus,
    image: null,
  },
  {
    id: "8",
    name: "Cotton Kimono",
    sku: "CK-008",
    price: 2800,
    stock: 0,
    status: "Out of Stock" as ProductStatus,
    image: null,
  },
]

const statusFilterOptions = ["All", "Active", "Draft", "Out of Stock"] as const

function StatusBadge({ status }: { status: ProductStatus }) {
  const variantMap: Record<ProductStatus, "default" | "secondary" | "destructive"> = {
    Active: "default",
    Draft: "secondary",
    "Out of Stock": "destructive",
  }
  return <Badge variant={variantMap[status]}>{status}</Badge>
}

export default function ProductsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const filtered = mockProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
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
          <Link href="/products/new">
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
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          <CardContent>
            <EmptyState
              icon={Package}
              title="No products yet"
              description="Get started by adding your first product to the catalog."
              action={
                <Button asChild>
                  <Link href="/products/new">
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
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                          <Package className="h-5 w-5" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/products/${product.id}`}
                          className="font-medium hover:underline"
                        >
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
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
                              <Link href={`/products/${product.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
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
