"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Package, ChevronRight, Loader2 } from "lucide-react"

import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs"
import { Price } from "../../../components/shared/price"
import { EmptyState } from "../../../components/shared/empty-state"
import { Breadcrumbs } from "../../../components/shared/breadcrumbs"

interface OrderView {
  id: string
  orderNumber: string
  createdAt: string
  status: string
  itemCount: number
  totalMinor: number
  currency: string
}

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
]

const STATUS_GROUPS: Record<string, string> = {
  draft: "pending",
  pending_payment: "pending",
  pending: "pending",
  paid: "pending",
  confirmed: "processing",
  processing: "processing",
  ready_for_shipment: "processing",
  shipped: "shipped",
  delivered: "delivered",
  completed: "delivered",
  cancelled: "cancelled",
  refunded: "cancelled",
  returned: "cancelled",
}

const STATUS_STYLES: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  processing: "default",
  shipped: "secondary",
  delivered: "outline",
  cancelled: "destructive",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderView[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [signedOut, setSignedOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/orders?limit=50")
        if (res.status === 401) {
          setSignedOut(true)
          setLoading(false)
          return
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? "Failed to load orders.")
        }
        const data = await res.json()
        const items = (data.items ?? []).map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          createdAt: order.placedAt ?? order.createdAt,
          status: order.status,
          itemCount: (order.items ?? []).reduce((sum: number, item: any) => sum + item.quantity, 0),
          totalMinor: order.totalMinor,
          currency: order.currency,
        }))
        setOrders(items)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => STATUS_GROUPS[o.status] === statusFilter)

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl items-center justify-center px-4 py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (signedOut) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <EmptyState
          icon={Package}
          title="Sign in to view your orders"
          description="Your order history is tied to your account. Sign in to see it."
          action={
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          }
        />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="You haven't placed any orders yet. Start shopping to see your orders here."
          action={
            <Button asChild>
              <Link href="/">Start Shopping</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My Orders" },
        ]}
      />

      <h1 className="mb-6 text-2xl font-bold tracking-tight">My Orders</h1>

      {error && (
        <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders found"
          description={`No orders with status "${statusFilter}".`}
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const group = STATUS_GROUPS[order.status] ?? "pending"
            return (
              <Card key={order.id} className="transition-colors hover:bg-muted/50">
                <Link href={`/orders/${order.id}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">
                            {order.orderNumber}
                          </span>
                          <Badge
                            variant={STATUS_STYLES[group]}
                            className="capitalize"
                          >
                            {order.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Price amount={order.totalMinor / 100} currency={order.currency} size="md" className="font-semibold" />
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
