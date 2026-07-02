"use client"

import { useState } from "react"
import { Download, Warehouse } from "lucide-react"

import { Button } from "../../../components/ui/button"
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"

type StockStatus = "In Stock" | "Low Stock" | "Out of Stock"

const inventory = [
  {
    product: "Kitenge Maxi Dress",
    sku: "KMD-001",
    stock: 45,
    reserved: 3,
    available: 42,
    threshold: 10,
    status: "In Stock" as StockStatus,
  },
  {
    product: "Beaded Sandals",
    sku: "BS-002",
    stock: 5,
    reserved: 1,
    available: 4,
    threshold: 15,
    status: "Low Stock" as StockStatus,
  },
  {
    product: "Ankara Blazer",
    sku: "AB-003",
    stock: 0,
    reserved: 0,
    available: 0,
    threshold: 10,
    status: "Out of Stock" as StockStatus,
  },
  {
    product: "Kente Scarf Set",
    sku: "KSS-004",
    stock: 18,
    reserved: 2,
    available: 16,
    threshold: 12,
    status: "In Stock" as StockStatus,
  },
  {
    product: "Dashiki Top",
    sku: "DT-005",
    stock: 7,
    reserved: 1,
    available: 6,
    threshold: 10,
    status: "Low Stock" as StockStatus,
  },
  {
    product: "Maasai Shuka Blanket",
    sku: "MSB-006",
    stock: 12,
    reserved: 0,
    available: 12,
    threshold: 10,
    status: "In Stock" as StockStatus,
  },
  {
    product: "Leather Tote Bag",
    sku: "LTB-007",
    stock: 9,
    reserved: 2,
    available: 7,
    threshold: 10,
    status: "Low Stock" as StockStatus,
  },
  {
    product: "Cotton Kimono",
    sku: "CK-008",
    stock: 0,
    reserved: 0,
    available: 0,
    threshold: 10,
    status: "Out of Stock" as StockStatus,
  },
]

function StockStatusBadge({ status }: { status: StockStatus }) {
  const colors: Record<StockStatus, string> = {
    "In Stock": "bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80",
    "Low Stock": "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80",
    "Out of Stock": "bg-red-100 text-red-800 hover:bg-red-100/80",
  }
  return (
    <Badge className={colors[status]} variant="outline">
      {status}
    </Badge>
  )
}

export default function InventoryPage() {
  const [search, setSearch] = useState("")

  const filtered = inventory.filter(
    (item) =>
      item.product.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Track stock levels across all products.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>Update Stock</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Stock Overview</CardTitle>
            <div className="relative w-64">
              <Input
                placeholder="Search inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Low Stock Threshold</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.sku}>
                  <TableCell className="font-medium">{item.product}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.sku}
                  </TableCell>
                  <TableCell>{item.stock}</TableCell>
                  <TableCell>{item.reserved}</TableCell>
                  <TableCell>
                    <span
                      className={
                        item.available === 0
                          ? "text-destructive font-medium"
                          : item.available <= item.threshold
                          ? "text-yellow-600 font-medium"
                          : ""
                      }
                    >
                      {item.available}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.threshold}
                  </TableCell>
                  <TableCell>
                    <StockStatusBadge status={item.status} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-muted-foreground"
                  >
                    <Warehouse className="mx-auto mb-2 h-8 w-8" />
                    No inventory items found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
