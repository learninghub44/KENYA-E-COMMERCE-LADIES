"use client"

import { useState, useEffect, useCallback } from "react"
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table"

interface RevenueByCategory {
  name: string
  value: number
  color: string
}

interface SellerRanking {
  rank: number
  store: string
  owner: string
  revenue: string
  orders: number
  rating: number
}

interface TopProduct {
  name: string
  seller: string
  revenue: string
  units: number
}

interface BiResponse {
  revenueByCategory: RevenueByCategory[]
  sellerRankings: SellerRanking[]
  topProducts: TopProduct[]
  summary: {
    totalRevenue: string
    totalOrders: number
    totalProducts: number
    totalSellers: number
  }
}

export default function BusinessIntelligencePage() {
  const [data, setData] = useState<BiResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/business-intelligence")
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const revenueByCategory = data?.revenueByCategory ?? []
  const sellerRankings = data?.sellerRankings ?? []
  const topProducts = data?.topProducts ?? []
  const summary = data?.summary

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Business Intelligence</h1>
        <p className="text-sm text-muted-foreground">Deep insights into platform performance</p>
      </div>

      {summary && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{summary.totalRevenue}</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{summary.totalOrders.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{summary.totalProducts.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Products</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{summary.totalSellers.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Sellers</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : revenueByCategory.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={revenueByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {revenueByCategory.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] rounded-lg border-2 border-dashed">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">No revenue data yet</p>
                  <p className="text-xs text-muted-foreground">Data will populate as orders are placed</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((p, i) => (
                  <div key={`${p.name}-${i}`} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.seller} &middot; {p.units} units</p>
                    </div>
                    <div className="text-sm font-medium">{p.revenue}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-8">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">No product data yet</p>
                  <p className="text-xs text-muted-foreground">Products will appear once orders exist</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seller Performance Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : sellerRankings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellerRankings.map((s) => (
                  <TableRow key={s.rank}>
                    <TableCell className="font-bold">{s.rank}</TableCell>
                    <TableCell className="font-medium">{s.store}</TableCell>
                    <TableCell>{s.owner}</TableCell>
                    <TableCell>{s.revenue}</TableCell>
                    <TableCell>{s.orders}</TableCell>
                    <TableCell>
                      <Badge variant={s.rating >= 4.5 ? "default" : "secondary"}>{s.rating}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">No seller data yet</p>
                <p className="text-xs text-muted-foreground">Seller rankings will appear once orders exist</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform Growth Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          {summary ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{summary.totalRevenue}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{summary.totalOrders}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{summary.totalProducts}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Total Sellers</p>
                  <p className="text-2xl font-bold">{summary.totalSellers}</p>
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                <p>Growth metrics are tracked over time as orders and products are added to the platform.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-sm text-muted-foreground">Loading growth metrics...</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {sellerRankings.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Seller and buyer distribution across Kenya based on registered addresses.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium">Nairobi</p>
                  <p className="text-xs text-muted-foreground">Primary market hub</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium">Mombasa</p>
                  <p className="text-xs text-muted-foreground">Coastal region</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium">Kisumu</p>
                  <p className="text-xs text-muted-foreground">Western region</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium">Nakuru</p>
                  <p className="text-xs text-muted-foreground">Rift Valley</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium">Eldoret</p>
                  <p className="text-xs text-muted-foreground">North Rift</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium">Other Counties</p>
                  <p className="text-xs text-muted-foreground">Nationwide coverage</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center rounded-lg border-2 border-dashed">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Geographic data will appear as sellers and buyers register from different regions</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
