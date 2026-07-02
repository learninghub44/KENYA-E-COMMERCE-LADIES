"use client"

import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"

const revenueData = [
  { day: "Mon", revenue: 12400 },
  { day: "Tue", revenue: 18200 },
  { day: "Wed", revenue: 15800 },
  { day: "Thu", revenue: 22100 },
  { day: "Fri", revenue: 19400 },
  { day: "Sat", revenue: 25600 },
  { day: "Sun", revenue: 20300 },
]

const stats = [
  {
    title: "Total Revenue",
    value: "KES 134,200",
    trend: 12.5,
    icon: DollarSign,
  },
  {
    title: "Total Orders",
    value: "1,342",
    trend: 8.2,
    icon: ShoppingCart,
  },
  {
    title: "Active Products",
    value: "486",
    trend: -3.1,
    icon: Package,
  },
  {
    title: "New Customers",
    value: "2,847",
    trend: 18.6,
    icon: Users,
  },
]

const recentOrders = [
  {
    id: "#ORD-8721",
    customer: "Jane Muthoni",
    product: "Kitenge Maxi Dress",
    amount: "KES 3,500",
    status: "Delivered" as const,
    date: "2024-12-02",
  },
  {
    id: "#ORD-8720",
    customer: "Akinyi Ochieng",
    product: "Beaded Sandals",
    amount: "KES 1,800",
    status: "Shipped" as const,
    date: "2024-12-02",
  },
  {
    id: "#ORD-8719",
    customer: "Wanjiku Kimani",
    product: "Ankara Blazer",
    amount: "KES 5,200",
    status: "Processing" as const,
    date: "2024-12-01",
  },
  {
    id: "#ORD-8718",
    customer: "Amina Hassan",
    product: "Kente Scarf Set",
    amount: "KES 2,450",
    status: "Pending" as const,
    date: "2024-12-01",
  },
  {
    id: "#ORD-8717",
    customer: "Grace Nyambura",
    product: "Dashiki Top",
    amount: "KES 1,950",
    status: "Delivered" as const,
    date: "2024-11-30",
  },
]

const lowStock = [
  { name: "Kitenge Maxi Dress", sku: "KMD-001", stock: 3, threshold: 10 },
  { name: "Beaded Sandals", sku: "BS-002", stock: 5, threshold: 15 },
  { name: "Ankara Blazer", sku: "AB-003", stock: 2, threshold: 10 },
  { name: "Kente Scarf Set", sku: "KSS-004", stock: 4, threshold: 12 },
  { name: "Dashiki Top", sku: "DT-005", stock: 1, threshold: 10 },
]

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
          <span className="text-muted-foreground">vs last month</span>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    Delivered: "default",
    Shipped: "secondary",
    Processing: "outline",
    Pending: "outline",
  }
  return <Badge variant={variants[status] ?? "outline"}>{status}</Badge>
}

export default function SellerDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Revenue (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStock.map((item) => (
              <div
                key={item.sku}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-semibold text-destructive">{item.stock}</p>
                  <p className="text-xs text-muted-foreground">
                    threshold: {item.threshold}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.product}</TableCell>
                  <TableCell>{order.amount}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
