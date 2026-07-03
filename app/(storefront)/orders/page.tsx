"use client"

import { useState } from "react"
import Link from "next/link"
import { Package, ChevronRight } from "lucide-react"

import { cn } from "../../../lib/utils"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs"
import { Separator } from "../../../components/ui/separator"
import { Price } from "../../../components/shared/price"
import { EmptyState } from "../../../components/shared/empty-state"
import { Breadcrumbs } from "../../../components/shared/breadcrumbs"

interface Order {
  id: string
  orderNumber: string
  date: string
  status: "processing" | "shipped" | "delivered" | "cancelled"
  itemCount: number
  total: number
  items: { name: string }[]
}

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
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
    month: "long",
    day: "numeric",
  })
}

export default function OrdersPage() {
  const [orders] = useState<Order[]>([])
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter)

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
          {filteredOrders.map((order) => (
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
                          variant={STATUS_STYLES[order.status]}
                          className="capitalize"
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.date)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Price amount={order.total} size="md" className="font-semibold" />
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
