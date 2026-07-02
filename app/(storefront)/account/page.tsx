"use client"

import Link from "next/link"
import {
  Package,
  Heart,
  Star,
  ShoppingBag,
  User,
  MapPin,
  Shield,
  MessageSquare,
  Bell,
  Clock,
  Eye,
  ChevronRight,
} from "lucide-react"

import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Separator } from "../../../components/ui/separator"
import { Price } from "../../../components/shared/price"
import { Breadcrumbs } from "../../../components/shared/breadcrumbs"

const QUICK_LINKS = [
  { label: "Profile", href: "/account/profile", icon: User },
  { label: "Orders", href: "/orders", icon: Package },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Recently Viewed", href: "/account/recently-viewed", icon: Clock },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Security", href: "/account/security", icon: Shield },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Notifications", href: "/notifications", icon: Bell },
]

const RECENT_ORDERS = [
  {
    id: "1",
    orderNumber: "ORD-2024-003",
    date: "2024-12-28",
    status: "processing",
    total: 5600,
    itemCount: 1,
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    date: "2024-12-20",
    status: "shipped",
    total: 11800,
    itemCount: 2,
  },
  {
    id: "3",
    orderNumber: "ORD-2024-001",
    date: "2024-12-15",
    status: "delivered",
    total: 25900,
    itemCount: 3,
  },
  {
    id: "4",
    orderNumber: "ORD-2024-005",
    date: "2024-10-05",
    status: "delivered",
    total: 32000,
    itemCount: 4,
  },
  {
    id: "5",
    orderNumber: "ORD-2024-004",
    date: "2024-11-10",
    status: "cancelled",
    total: 14200,
    itemCount: 2,
  },
]

const STATUS_STYLES: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  processing: "default",
  shipped: "secondary",
  delivered: "outline",
  cancelled: "destructive",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function AccountDashboard() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My Account" },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, Grace
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your account
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Orders", value: "12", icon: Package },
          { label: "Active Orders", value: "2", icon: ShoppingBag },
          { label: "Wishlist Items", value: "8", icon: Heart },
          { label: "Reviews", value: "5", icon: Star },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex flex-col items-center p-4 text-center">
              <stat.icon className="mb-2 h-6 w-6 text-primary" />
              <span className="text-2xl font-bold">{stat.value}</span>
              <span className="text-xs text-muted-foreground">
                {stat.label}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Orders</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/orders">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {RECENT_ORDERS.slice(0, 5).map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {order.orderNumber}
                      </span>
                      <Badge
                        variant={STATUS_STYLES[order.status]}
                        className="capitalize"
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.date)} &middot; {order.itemCount}{" "}
                      {order.itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <Price amount={order.total} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <h2 className="mb-4 text-lg font-semibold">Quick Links</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {QUICK_LINKS.map((link) => (
          <Link key={link.label} href={link.href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <link.icon className="mb-3 h-8 w-8 text-primary" />
                <span className="text-sm font-medium">{link.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
