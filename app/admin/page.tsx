"use client"

import {
  Users,
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"

const revenueData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (29 - i))
  return {
    date: date.toLocaleDateString("en-KE", { month: "short", day: "numeric" }),
    revenue: Math.floor(Math.random() * 50000 + 10000),
    fees: Math.floor(Math.random() * 5000 + 500),
  }
})

const stats = [
  { label: "Total Users", value: "24,891", icon: Users, change: "+12%", color: "text-blue-600" },
  { label: "Total Sellers", value: "1,842", icon: Store, change: "+8%", color: "text-emerald-600" },
  { label: "Total Products", value: "45,237", icon: Package, change: "+15%", color: "text-violet-600" },
  { label: "Total Orders", value: "12,456", icon: ShoppingCart, change: "+22%", color: "text-orange-600" },
  { label: "Revenue (KES)", value: "KES 3.2M", icon: TrendingUp, change: "+18%", color: "text-green-600" },
  { label: "Platform Fee", value: "KES 128K", icon: DollarSign, change: "+10%", color: "text-rose-600" },
]

const recentOrders = [
  { id: "#ORD-001", customer: "Jane Wanjiku", seller: "Mrembo Fashions", total: "KES 4,500", status: "Delivered", date: "2025-06-30" },
  { id: "#ORD-002", customer: "Achieng Omondi", seller: "Dada Cosmetics", total: "KES 2,300", status: "Processing", date: "2025-06-30" },
  { id: "#ORD-003", customer: "Faith Nyambura", seller: "Sista Styles", total: "KES 8,700", status: "Pending", date: "2025-06-29" },
  { id: "#ORD-004", customer: "Grace Akinyi", seller: "Mrembo Fashions", total: "KES 1,200", status: "Shipped", date: "2025-06-29" },
  { id: "#ORD-005", customer: "Mary Wambui", seller: "Dada Cosmetics", total: "KES 6,300", status: "Delivered", date: "2025-06-28" },
]

const topSellers = [
  { name: "Mrembo Fashions", revenue: "KES 892K", orders: 1456, avatar: "MF" },
  { name: "Dada Cosmetics", revenue: "KES 654K", orders: 982, avatar: "DC" },
  { name: "Sista Styles", revenue: "KES 431K", orders: 723, avatar: "SS" },
  { name: "Neo Beauty", revenue: "KES 289K", orders: 456, avatar: "NB" },
  { name: "Amani Collections", revenue: "KES 198K", orders: 312, avatar: "AC" },
]

const recentUsers = [
  { name: "Jane Wanjiku", email: "jane@example.com", joined: "2025-06-30", avatar: "JW" },
  { name: "Achieng Omondi", email: "achieng@example.com", joined: "2025-06-29", avatar: "AO" },
  { name: "Faith Nyambura", email: "faith@example.com", joined: "2025-06-28", avatar: "FN" },
  { name: "Grace Akinyi", email: "grace@example.com", joined: "2025-06-27", avatar: "GA" },
  { name: "Mary Wambui", email: "mary@example.com", joined: "2025-06-26", avatar: "MW" },
]

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Delivered: "default",
  Processing: "secondary",
  Pending: "outline",
  Shipped: "secondary",
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform overview at a glance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className={"h-5 w-5 " + stat.color} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="feesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs text-muted-foreground" tick={{ fontSize: 12 }} />
                  <YAxis className="text-xs text-muted-foreground" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revenueGradient)" strokeWidth={2} />
                  <Area type="monotone" dataKey="fees" stroke="#f59e0b" fill="url(#feesGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Sellers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSellers.map((seller) => (
                <div key={seller.name} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{seller.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{seller.name}</p>
                    <p className="text-xs text-muted-foreground">{seller.orders} orders</p>
                  </div>
                  <div className="text-sm font-medium">{seller.revenue}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.seller}</TableCell>
                    <TableCell>{order.total}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{order.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.email} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{user.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{user.joined}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function cn(...inputs: (string | undefined | false | null)[]) {
  return inputs.filter(Boolean).join(" ")
}
