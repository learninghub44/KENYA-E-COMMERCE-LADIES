"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import {
  Package,
  Truck,
  CheckCircle2,
  MapPin,
  MessageSquare,
  Loader2,
  ImageOff,
  XCircle,
} from "lucide-react"

import { cn } from "../../../../lib/utils"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import { Separator } from "../../../../components/ui/separator"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card"
import { Price } from "../../../../components/shared/price"
import { Breadcrumbs } from "../../../../components/shared/breadcrumbs"

interface OrderPageProps {
  params: Promise<{ id: string }>
}

interface OrderItemView {
  id: string
  name: string
  variant: string | null
  quantity: number
  unitPriceMinor: number
  totalMinor: number
}

interface OrderDetail {
  id: string
  orderNumber: string
  createdAt: string
  status: string
  items: OrderItemView[]
  shippingAddress: {
    recipientName: string
    phone: string
    line1: string
    line2?: string | null
    city: string
    region?: string | null
    postalCode?: string | null
    countryCode: string
  }
  subtotalMinor: number
  discountMinor: number
  shippingMinor: number
  taxMinor: number
  totalMinor: number
  currency: string
}

const STEPS = [
  { key: "placed", label: "Order Placed", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
]

const STATUS_STEP_MAP: Record<string, number> = {
  draft: 0,
  pending_payment: 0,
  pending: 0,
  paid: 1,
  confirmed: 1,
  processing: 1,
  ready_for_shipment: 1,
  shipped: 2,
  delivered: 3,
  completed: 3,
  cancelled: -1,
  refunded: -1,
  returned: -1,
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function OrderDetailPage({ params }: OrderPageProps) {
  const { id } = use(params)
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setNotFound(false)
      try {
        const res = await fetch(`/api/orders/${id}`)
        if (res.status === 404 || res.status === 403) {
          setNotFound(true)
          return
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? "Failed to load order.")
        }
        const data = await res.json()
        setOrder({
          id: data.id,
          orderNumber: data.orderNumber,
          createdAt: data.placedAt ?? data.createdAt,
          status: data.status,
          items: (data.items ?? []).map((item: any) => ({
            id: item.id,
            name: item.productName,
            variant: item.variantTitle,
            quantity: item.quantity,
            unitPriceMinor: item.unitPriceMinor,
            totalMinor: item.totalMinor,
          })),
          shippingAddress: data.shippingAddress,
          subtotalMinor: data.subtotalMinor,
          discountMinor: data.discountMinor,
          shippingMinor: data.shippingMinor,
          taxMinor: data.taxMinor,
          totalMinor: data.totalMinor,
          currency: data.currency,
        })
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function cancelOrder() {
    if (!order) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Could not cancel order.")
      const data = await res.json()
      setOrder((prev) => (prev ? { ...prev, status: data.status } : prev))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel order.")
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl items-center justify-center px-4 py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (notFound || !order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Order not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">This order could not be loaded.</p>
        <Button asChild className="mt-6">
          <Link href="/orders">Back to Orders</Link>
        </Button>
      </div>
    )
  }

  const currentStep = STATUS_STEP_MAP[order.status] ?? 0
  const canCancel = ["draft", "pending_payment", "pending", "paid", "confirmed"].includes(order.status)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My Orders", href: "/orders" },
          { label: order.orderNumber },
        ]}
      />

      {error && (
        <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {order.orderNumber}
            </h1>
            <Badge
              variant={
                currentStep === -1
                  ? "destructive"
                  : order.status === "delivered" || order.status === "completed"
                  ? "outline"
                  : order.status === "shipped"
                  ? "secondary"
                  : "default"
              }
              className="capitalize"
            >
              {order.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          {canCancel && (
            <Button variant="outline" size="sm" onClick={cancelOrder} disabled={cancelling}>
              <XCircle className="mr-2 h-4 w-4" />
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href="/messages">
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Seller
            </Link>
          </Button>
        </div>
      </div>

      {currentStep >= 0 && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => {
                const isActive = index <= currentStep
                const isLast = index === STEPS.length - 1
                return (
                  <div
                    key={step.key}
                    className={cn(
                      "flex flex-col items-center",
                      !isLast && "flex-1"
                    )}
                  >
                    <div className="flex w-full items-center">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <step.icon className="h-5 w-5" />
                      </div>
                      {!isLast && (
                        <div
                          className={cn(
                            "h-0.5 flex-1",
                            index < currentStep ? "bg-primary" : "bg-muted"
                          )}
                        />
                      )}
                    </div>
                    <span
                      className={cn(
                        "mt-2 text-xs",
                        isActive ? "font-medium text-primary" : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id}>
                  <div className="flex gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-muted">
                      <ImageOff className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex flex-1 items-center justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.variant && (
                          <p className="text-sm text-muted-foreground">
                            {item.variant}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <Price amount={item.totalMinor / 100} currency={order.currency} size="sm" />
                    </div>
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{order.shippingAddress.recipientName}</p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.city}
                {order.shippingAddress.region ? `, ${order.shippingAddress.region}` : ""}{" "}
                {order.shippingAddress.postalCode ?? ""}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.countryCode}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.phone}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-80">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <Price amount={order.subtotalMinor / 100} currency={order.currency} size="sm" />
                </div>
                {order.discountMinor > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <Price amount={-(order.discountMinor / 100)} currency={order.currency} size="sm" />
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <Price amount={order.shippingMinor / 100} currency={order.currency} size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <Price amount={order.taxMinor / 100} currency={order.currency} size="sm" />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <Price amount={order.totalMinor / 100} currency={order.currency} size="md" className="font-bold" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
