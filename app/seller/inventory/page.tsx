"use client"

import { useState, useEffect, useCallback } from "react"
import { Warehouse } from "lucide-react"

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
} from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"

type StockStatus = "In Stock" | "Low Stock" | "Out of Stock"

interface InventoryItem {
  id: string
  product_id: string
  variant_id: string | null
  quantity_available: number
  quantity_reserved: number
  low_stock_threshold: number
  track_inventory: boolean
  products: {
    id: string
    name: string
    slug: string
    base_price_minor: number
    currency: string
  }
  product_variants: {
    id: string
    sku: string
    title: string | null
    options: Record<string, string> | null
  } | null
}

function getStockStatus(item: InventoryItem): StockStatus {
  const available = item.quantity_available - item.quantity_reserved
  if (available <= 0) return "Out of Stock"
  if (available <= item.low_stock_threshold) return "Low Stock"
  return "In Stock"
}

function StockStatusBadge({ status }: { status: StockStatus }) {
  const colors: Record<StockStatus, string> = {
    "In Stock": "bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80",
    "Low Stock": "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80",
    "Out of Stock": "bg-red-100 text-red-800 hover:bg-red-100/80",
  }
  return <Badge className={colors[status]} variant="outline">{status}</Badge>
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch("/api/seller/inventory")
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
    } catch (err) {
      console.error("Failed to fetch inventory:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  async function handleSaveStock(itemId: string) {
    const newQty = parseInt(editValue, 10)
    if (isNaN(newQty) || newQty < 0) {
      setEditingId(null)
      return
    }

    const res = await fetch("/api/seller/inventory", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inventoryItemId: itemId, quantityAvailable: newQty }),
    })

    if (res.ok) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity_available: newQty } : item
        )
      )
    }
    setEditingId(null)
  }

  const filtered = items.filter(
    (item) =>
      item.products.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.product_variants?.sku || "").toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><div className="h-8 w-32 bg-muted rounded animate-pulse" /><div className="h-4 w-48 bg-muted rounded animate-pulse mt-2" /></div>
        </div>
        <Card><CardContent className="p-0">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 border-b animate-pulse" />)}</CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">Track stock levels across all products.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Stock Overview</CardTitle>
            <div className="relative w-64">
              <Input placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
              {filtered.map((item) => {
                const available = item.quantity_available - item.quantity_reserved
                const status = getStockStatus(item)
                const sku = item.product_variants?.sku || "—"
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.products.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{sku}</TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <input
                          type="number"
                          className="w-20 border rounded px-2 py-1 text-sm"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleSaveStock(item.id)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleSaveStock(item.id); if (e.key === "Escape") setEditingId(null) }}
                          autoFocus
                          min={0}
                        />
                      ) : (
                        <button
                          className="hover:underline cursor-pointer"
                          onClick={() => { setEditingId(item.id); setEditValue(String(item.quantity_available)) }}
                        >
                          {item.quantity_available}
                        </button>
                      )}
                    </TableCell>
                    <TableCell>{item.quantity_reserved}</TableCell>
                    <TableCell>
                      <span className={available === 0 ? "text-destructive font-medium" : available <= item.low_stock_threshold ? "text-yellow-600 font-medium" : ""}>
                        {available}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.low_stock_threshold}</TableCell>
                    <TableCell><StockStatusBadge status={status} /></TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
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
