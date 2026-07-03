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
  ChevronRight,
} from "lucide-react"

import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Separator } from "../../../components/ui/separator"
import { Price } from "../../../components/shared/price"
import { Breadcrumbs } from "../../../components/shared/breadcrumbs"
import { useAuth } from "../../../lib/auth/auth-context"

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

export default function AccountDashboard() {
  const { user } = useAuth()
  const displayName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Guest"
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
          Welcome back, {displayName}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your account
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Orders", value: "0", icon: Package },
          { label: "Active Orders", value: "0", icon: ShoppingBag },
          { label: "Wishlist Items", value: "0", icon: Heart },
          { label: "Reviews", value: "0", icon: Star },
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
          <div className="flex flex-col items-center py-8 text-center">
            <Package className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-1 text-lg font-semibold">No orders yet</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Start shopping to see your orders here.
            </p>
            <Button asChild>
              <Link href="/">Start Shopping</Link>
            </Button>
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
