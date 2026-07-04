"use client"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Loader2,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"

interface AnalyticsData {
  summary: {
    totalRevenue: number
    totalOrders: number
    completedOrders: number
    pendingOrders: number
    cancelledOrders: number
    avgOrderValue: number
    revenueTrend: number
    ordersTrend: number
  }
  products: {
    total: number
    active: number
    draft: number
  }
  daily: Array<{ date: string; revenue: number; orderCount: number }>
  orderStatusBreakdown: Array<{ status: string; count: number }>
  productStatusBreakdown: Array<{ status: string; count: number }>
}

function formatKES(minorUnits: number): string {
  const kES = Math.round(minorUnits / 100)
  return `KES ${kES.toLocaleString()}`
}

function StatCard({
  title,
  value,
  trend,
  icon: Icon,
}: {
  title: string
  value: string
  trend: number
  icon: React.ElementType
}) {
  const isPositive = trend >= 0
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="mt-1 flex items-center gap-1 text-xs">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-emerald-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span className={isPositive ? "text-emerald-500" : "text-red-500"}>
            {isPositive ? "+" : ""}
            {trend}%
          </span>
          <span className="text-muted-foreground">vs last period</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30d")
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(`/api/seller/analytics?range=${dateRange}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load analytics")
        return r.json()
      })
      .then((d: AnalyticsData) => {
        if (!cancelled) setData(d)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [dateRange])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            <p className="text-sm text-muted-foreground">Track your store&apos;s performance.</p>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Track your store&apos;s performance.</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {error ?? "No data available"}
          </CardContent>
        </Card>
      </div>
    )
  }

  const { summary, daily } = data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Track your store&apos;s performance.
          </p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={`Revenue (${dateRange === "7d" ? "7d" : dateRange === "90d" ? "90d" : dateRange === "1y" ? "1y" : "30d"})`}
          value={formatKES(summary.totalRevenue)}
          trend={summary.revenueTrend}
          icon={DollarSign}
        />
        <StatCard
          title={`Orders (${dateRange === "7d" ? "7d" : dateRange === "90d" ? "90d" : dateRange === "1y" ? "1y" : "30d"})`}
          value={summary.totalOrders.toLocaleString()}
          trend={summary.ordersTrend}
          icon={ShoppingCart}
        />
        <StatCard
          title="Avg. Order Value"
          value={formatKES(summary.avgOrderValue)}
          trend={0}
          icon={TrendingUp}
        />
        <StatCard
          title="Products Active"
          value={`${data.products.active}`}
          trend={0}
          icon={ShoppingCart}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Trend</CardTitle>
            <CardDescription>Daily revenue over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {daily.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={daily}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} hide />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 100000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => formatKES(v)} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No revenue data for this period
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders Trend</CardTitle>
            <CardDescription>Daily order count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {daily.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={daily}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} hide />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="orderCount"
                      stroke="hsl(var(--chart-2, 210 80% 50%))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No order data for this period
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Status Breakdown</CardTitle>
            <CardDescription>Orders by status in this period</CardDescription>
          </CardHeader>
          <CardContent>
            {data.orderStatusBreakdown.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.orderStatusBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="status" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                No orders in this period
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Product Status</CardTitle>
            <CardDescription>Products by status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.productStatusBreakdown.map((item) => (
              <div key={item.status} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize">{item.status.replace("_", " ")}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${data.products.total > 0 ? (item.count / data.products.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {data.productStatusBreakdown.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">
                No products yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
