"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle2, ShoppingBag, Eye, Loader2, AlertCircle } from "lucide-react"

import { Button } from "../../../../components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card"
import { Separator } from "../../../../components/ui/separator"
import { EmptyState } from "../../../../components/shared/empty-state"

interface OrderItem {
  id: string
  productName: string
  variantTitle: string | null
  quantity: number
  unitPriceMinor: number
  totalMinor: number
}

interface Order {
  id: string
  orderNumber: string
  status: string
  subtotalMinor: number
  shippingMinor: number
  discountMinor: number
  taxMinor: number
  totalMinor: number
  currency: string
  placedAt: string | null
  createdAt: string
  shippingAddress: {
    recipientName: string
    line1: string
    city: string
    countryCode: string
  }
  items: OrderItem[]
}

interface OrderSuccessPageProps {
  params: Promise<{ id: string }>
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function formatAmount(amountMinor: number) {
  return `KES ${(amountMinor / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
}

export default function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/orders/${id}`)
        if (res.status === 404) {
          setOrder(null)
          return
        }
        if (!res.ok) {
          throw new Error("Failed to load order details")
        }
        const data = await res.json()
        setOrder(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16">
        <EmptyState
          icon={AlertCircle}
          title="Failed to load order"
          description={error}
        />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16">
        <EmptyState
          icon={AlertCircle}
          title="Order not found"
          description="We couldn't find this order. It may have been removed or the link is incorrect."
        />
        <Button asChild className="mt-4">
          <Link href="/orders">View All Orders</Link>
        </Button>
      </div>
    )
  }

  const orderDate = new Date(order.placedAt ?? order.createdAt)
  const estimatedDelivery = addDays(orderDate, 7)

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Order Confirmed!
        </h1>
        <p className="mb-2 text-lg text-muted-foreground">
          Thank you for your purchase
        </p>

        <Card className="mb-8 mt-6 text-left">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Order Number
                </span>
                <span className="font-semibold">{order.orderNumber}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Date</span>
                <span>{formatDate(orderDate)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Estimated Delivery
                </span>
                <span className="font-medium">
                  {formatDate(estimatedDelivery)}
                </span>
              </div>
              <Separator />

              {order.items.length > 0 && (
                <>
                  <div>
                    <p className="text-sm font-medium mb-3">Order Items</p>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.productName}
                            {item.variantTitle ? ` (${item.variantTitle})` : ""}
                            {item.quantity > 1 ? ` x${item.quantity}` : ""}
                          </span>
                          <span>{formatAmount(item.totalMinor)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatAmount(order.subtotalMinor)}</span>
                </div>
                {order.shippingMinor > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{formatAmount(order.shippingMinor)}</span>
                  </div>
                )}
                {order.discountMinor > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span>-{formatAmount(order.discountMinor)}</span>
                  </div>
                )}
                {order.taxMinor > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatAmount(order.taxMinor)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatAmount(order.totalMinor)}</span>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-1">Shipping Address</p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress.recipientName}
                  <br />
                  {order.shippingAddress.line1}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.countryCode}
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                A confirmation email has been sent to your email address with
                all the details of your order.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href={`/orders/${id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Order
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
