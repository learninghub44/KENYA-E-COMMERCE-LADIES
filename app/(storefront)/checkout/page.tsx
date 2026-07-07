"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Truck, ShieldCheck, ChevronRight, Loader2, ImageOff, ShoppingBag } from "lucide-react"
import { emitCartUpdated } from "../../../lib/cart/use-cart-count"

import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Separator } from "../../../components/ui/separator"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card"
import { Price } from "../../../components/shared/price"
import { EmptyState } from "../../../components/shared/empty-state"
import { Breadcrumbs } from "../../../components/shared/breadcrumbs"

const shippingSchema = z.object({
  recipientName: z.string().min(1, "Full name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  line1: z.string().min(5, "Address must be at least 5 characters"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  countryCode: z.string().length(2, "Use a 2-letter country code, e.g. KE"),
  notes: z.string().max(500).optional(),
})

type ShippingFormData = z.infer<typeof shippingSchema>

interface CartItemView {
  id: string
  name: string
  variant: string | null
  quantity: number
  unitPriceMinor: number
  imageUrl: string | null
}

interface CartSummaryView {
  cart: { id: string }
  activeItems: CartItemView[]
  subtotalMinor: number
  shippingMinor: number
  taxMinor: number
  totalMinor: number
  currency: string
}

function toMajor(minor: number) {
  return minor / 100
}

export default function CheckoutPage() {
  const router = useRouter()
  const [summary, setSummary] = useState<CartSummaryView | null>(null)
  const [loading, setLoading] = useState(true)
  const [signedOut, setSignedOut] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      countryCode: "KE",
    },
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/cart")
        if (res.status === 401) {
          setSignedOut(true)
          setLoading(false)
          return
        }
        if (!res.ok) throw new Error("Failed to load cart.")
        const data = await res.json()
        setSummary({
          cart: data.cart,
          activeItems: (data.activeItems ?? []).map((item: any) => ({
            id: item.id,
            name: item.productSnapshot?.productName ?? "Product",
            variant: item.productSnapshot?.variantTitle ?? null,
            quantity: item.quantity,
            unitPriceMinor: item.unitPriceMinor,
            imageUrl: item.productSnapshot?.imageUrl ?? null,
          })),
          subtotalMinor: data.subtotalMinor,
          shippingMinor: data.shippingMinor,
          taxMinor: data.taxMinor,
          totalMinor: data.totalMinor,
          currency: data.currency,
        })
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Failed to load cart.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const onSubmit = async (data: ShippingFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: {
            recipientName: data.recipientName,
            phone: data.phone,
            line1: data.line1,
            line2: data.line2 || undefined,
            city: data.city,
            region: data.region || undefined,
            postalCode: data.postalCode || undefined,
            countryCode: data.countryCode.toUpperCase(),
          },
          notes: data.notes || undefined,
        }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(body.error ?? "Could not place order.")
      }
      const firstOrder = body.orders?.[0]
      emitCartUpdated()
      router.push(firstOrder ? `/orders/${firstOrder.id}` : "/orders")
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not place order.")
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (signedOut) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Sign in to check out"
          description="Sign in to your account to complete your order."
          action={
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const activeItems = summary?.activeItems ?? []

  if (activeItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add something to your cart before checking out."
          action={
            <Button asChild>
              <Link href="/">Start Shopping</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const currency = summary?.currency ?? "KES"
  const subtotal = toMajor(summary?.subtotalMinor ?? 0)
  const shipping = toMajor(summary?.shippingMinor ?? 0)
  const tax = toMajor(summary?.taxMinor ?? 0)
  const total = toMajor(summary?.totalMinor ?? 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
      />

      <h1 className="mb-8 text-2xl font-bold tracking-tight">Checkout</h1>

      {submitError && (
        <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Truck className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="recipientName">Full Name</Label>
                    <Input id="recipientName" {...register("recipientName")} />
                    {errors.recipientName && (
                      <p className="text-xs text-destructive">{errors.recipientName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" placeholder="+254 700 000 000" {...register("phone")} />
                    {errors.phone && (
                      <p className="text-xs text-destructive">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="line1">Address</Label>
                  <Input id="line1" {...register("line1")} />
                  {errors.line1 && (
                    <p className="text-xs text-destructive">{errors.line1.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="line2">Apartment, suite, etc. (optional)</Label>
                  <Input id="line2" {...register("line2")} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...register("city")} />
                    {errors.city && (
                      <p className="text-xs text-destructive">{errors.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">County / Region</Label>
                    <Input id="region" {...register("region")} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input id="postalCode" {...register("postalCode")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="countryCode">Country Code</Label>
                    <Input id="countryCode" placeholder="KE" maxLength={2} {...register("countryCode")} />
                    {errors.countryCode && (
                      <p className="text-xs text-destructive">{errors.countryCode.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Order notes (optional)</Label>
                  <Input id="notes" placeholder="Delivery instructions..." {...register("notes")} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldCheck className="h-5 w-5" />
                  Payment
                </CardTitle>
                <CardDescription>
                  Payment is collected after your order is confirmed. You&apos;ll receive payment instructions by message.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  No card details are collected on this page.
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Placing order..." : "Place Order"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="w-full lg:w-96">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
                      ) : (
                        <ImageOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      {item.variant && (
                        <p className="text-xs text-muted-foreground">{item.variant}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <Price amount={toMajor(item.unitPriceMinor * item.quantity)} currency={currency} size="sm" />
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <Price amount={subtotal} currency={currency} size="sm" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {shipping === 0
                        ? "Free"
                        : new Intl.NumberFormat("en-KE", { style: "currency", currency }).format(shipping)}
                    </span>
                  </div>
                  {tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <Price amount={tax} currency={currency} size="sm" />
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <Price amount={total} currency={currency} size="md" className="font-bold" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
