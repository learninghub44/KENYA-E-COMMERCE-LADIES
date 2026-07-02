"use client"

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
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
import { Avatar, AvatarFallback } from "../../../components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table"

const revenueByCategory = [
  { name: "Fashion", value: 1250000, color: "hsl(var(--primary))" },
  { name: "Beauty", value: 890000, color: "#f59e0b" },
  { name: "Accessories", value: 560000, color: "#3b82f6" },
  { name: "Skincare", value: 430000, color: "#8b5cf6" },
  { name: "Wellness", value: 280000, color: "#10b981" },
]

const sellerRankings = [
  { rank: 1, store: "Mrembo Fashions", owner: "Grace Akinyi", revenue: "KES 892K", orders: 1456, rating: 4.8 },
  { rank: 2, store: "Dada Cosmetics", owner: "Achieng Omondi", revenue: "KES 654K", orders: 982, rating: 4.6 },
  { rank: 3, store: "Sista Styles", owner: "Nancy Wairimu", revenue: "KES 431K", orders: 723, rating: 4.5 },
  { rank: 4, store: "Neo Beauty", owner: "Faith Nyambura", revenue: "KES 289K", orders: 456, rating: 4.3 },
  { rank: 5, store: "Amani Collections", owner: "Mary Wambui", revenue: "KES 198K", orders: 312, rating: 4.1 },
]

const topProducts = [
  { name: "African Print Maxi Dress", seller: "Mrembo Fashions", revenue: "KES 245K", units: 342 },
  { name: "Shea Butter Moisturizer", seller: "Dada Cosmetics", revenue: "KES 189K", units: 567 },
  { name: "Beaded Sandals", seller: "Sista Styles", revenue: "KES 156K", units: 234 },
  { name: "Dashiki Blouse", seller: "Neo Beauty", revenue: "KES 123K", units: 187 },
  { name: "Kente Scarf", seller: "Amani Collections", revenue: "KES 98K", units: 345 },
]

const growthData = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
  users: Math.floor(Math.random() * 2000 + 500),
  sellers: Math.floor(Math.random() * 200 + 50),
  products: Math.floor(Math.random() * 5000 + 1000),
}))

export default function BusinessIntelligencePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Business Intelligence</h1>
        <p className="text-sm text-muted-foreground">Deep insights into platform performance</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seller Performance Rankings</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform Growth Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} name="Users" />
                <Line type="monotone" dataKey="sellers" stroke="#f59e0b" strokeWidth={2} name="Sellers" />
                <Line type="monotone" dataKey="products" stroke="#3b82f6" strokeWidth={2} name="Products" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center rounded-lg border-2 border-dashed">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Geographic map visualization</p>
              <p className="text-xs text-muted-foreground">Coming soon with Google Maps integration</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
