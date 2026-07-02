"use client"

import { use } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  MessageSquare,
  ChevronRight,
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

const MOCK_ORDER = {
  id: "1",
  orderNumber: "ORD-2024-001",
  date: "2024-12-15",
  status: "shipped" as const,
  items: [
    {
      id: "1",
      name: "Premium Ankara Maxi Dress",
      variant: "Size M / Red",
      price: 4500,
      quantity: 1,
      image: "/placeholder.svg",
    },
    {
      id: "2",
      name: "Handwoven Kente Blazer",
      variant: "Size L / Gold",
      price: 8900,
      quantity: 2,
      image: "/placeholder.svg",
    },
    {
      id: "3",
      name: "Beaded Evening Gown",
      variant: "Size S / Black",
      price: 12500,
      quantity: 1,
      image: "/placeholder.svg",
    },
  ],
  shippingAddress: {
    name: "Jane Akinyi",
    street: "45 Moi Avenue",
    city: "Nairobi",
    state: "Nairobi County",
    zip: "00100",
    country: "Kenya",
    phone: "+254 712 345 678",
  },
  paymentMethod: "Credit Card (VISA ending in 4242)",
  subtotal: 30400,
  shipping: 500,
  tax: 2472,
  total: 33372,
  estimatedDelivery: "2024-12-22",
}

const STEPS = [
  { key: "placed", label: "Order Placed", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
]

const STATUS_STEP_MAP: Record<string, number> = {
  processing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: -1,
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
  const order = MOCK_ORDER
  const currentStep = STATUS_STEP_MAP[order.status] ?? 0

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My Orders", href: "/orders" },
          { label: order.orderNumber },
        ]}
      />

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {order.orderNumber}
            </h1>
            <Badge
              variant={
                order.status === "cancelled"
                  ? "destructive"
                  : order.status === "delivered"
                  ? "outline"
                  : order.status === "shipped"
                  ? "secondary"
                  : "default"
              }
              className="capitalize"
            >
              {order.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Placed on {formatDate(order.date)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {}}>
            <Truck className="mr-2 h-4 w-4" />
            Track Package
          </Button>
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
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex flex-1 items-center justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.variant}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <Price amount={item.price * item.quantity} size="sm" />
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
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.street}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.zip}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.country}
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
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {order.paymentMethod}
              </p>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <Price amount={order.subtotal} size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <Price amount={order.shipping} size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <Price amount={order.tax} size="sm" />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <Price amount={order.total} size="md" className="font-bold" />
              </div>

              <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Estimated delivery:{" "}
                  <span className="font-medium text-foreground">
                    {formatDate(order.estimatedDelivery)}
                  </span>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
