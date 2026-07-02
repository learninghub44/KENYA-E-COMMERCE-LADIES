"use client"

import { useState } from "react"
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
  Users,
  DollarSign,
  ShoppingCart,
  Percent,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"

const revenue30Days = Array.from({ length: 30 }).map((_, i) => ({
  day: `Day ${i + 1}`,
  revenue: Math.floor(Math.random() * 30000) + 5000,
  orders: Math.floor(Math.random() * 50) + 5,
}))

const topProducts = [
  { name: "Kitenge Maxi Dress", sales: 184 },
  { name: "Beaded Sandals", sales: 142 },
  { name: "Dashiki Top", sales: 98 },
  { name: "Kente Scarf Set", sales: 76 },
  { name: "Leather Tote Bag", sales: 65 },
  { name: "Ankara Blazer", sales: 54 },
  { name: "Maasai Shuka Blanket", sales: 43 },
  { name: "Cotton Kimono", sales: 32 },
  { name: "Kente Headwrap", sales: 28 },
  { name: "Beaded Necklace", sales: 21 },
]

const statCards = [
  {
    title: "Total Revenue (30d)",
    value: "KES 482,500",
    trend: 12.5,
    icon: DollarSign,
  },
  {
    title: "Total Orders (30d)",
    value: "1,024",
    trend: 8.2,
    icon: ShoppingCart,
  },
  {
    title: "Conversion Rate",
    value: "3.42%",
    trend: 0.8,
    icon: Percent,
  },
  {
    title: "Avg. Order Value",
    value: "KES 471",
    trend: 4.1,
    icon: TrendingUp,
  },
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
          <span className="text-muted-foreground">vs last period</span>
        </div>
      </CardContent>
    </Card>
  )
}

const trafficSources = [
  { source: "Direct", percentage: 35 },
  { source: "Social Media", percentage: 28 },
  { source: "Search Engine", percentage: 22 },
  { source: "Email", percentage: 10 },
  { source: "Referral", percentage: 5 },
]

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30d")

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
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Trend</CardTitle>
            <CardDescription>Daily revenue over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenue30Days}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} hide />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenue30Days}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} hide />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="hsl(var(--chart-2, 210 80% 50%))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Selling Products</CardTitle>
            <CardDescription>Best performing products by units sold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={140}
                  />
                  <Tooltip />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Traffic Sources</CardTitle>
            <CardDescription>Where your visitors come from</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {trafficSources.map((source) => (
              <div key={source.source} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{source.source}</span>
                  <span className="font-medium">{source.percentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
