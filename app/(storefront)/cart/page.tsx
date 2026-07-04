"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Trash2,
  ShoppingBag,
  Minus,
  Plus,
  ArrowRight,
  Loader2,
  ImageOff,
} from "lucide-react"

import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Separator } from "../../../components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Price } from "../../../components/shared/price"
import { EmptyState } from "../../../components/shared/empty-state"
import { Breadcrumbs } from "../../../components/shared/breadcrumbs"
import { emitCartUpdated } from "../../../lib/cart/use-cart-count"

interface CartItemView {
  id: string
  productId: string
  variantId: string | null
  name: string
  variant: string | null
  unitPriceMinor: number
  quantity: number
}

interface CartSummaryView {
  cart: { id: string }
  activeItems: CartItemView[]
  savedItems: CartItemView[]
  subtotalMinor: number
  discountMinor: number
  shippingMinor: number
  taxMinor: number
  totalMinor: number
  currency: string
}

function toMajor(minor: number) {
  return minor / 100
}

function mapItem(raw: any): CartItemView {
  return {
    id: raw.id,
    productId: raw.productId,
    variantId: raw.variantId,
    name: raw.productSnapshot?.productName ?? "Product",
    variant: raw.productSnapshot?.variantTitle ?? null,
    unitPriceMinor: raw.unitPriceMinor,
    quantity: raw.quantity,
  }
}

export default function CartPage() {
  const [summary, setSummary] = useState<CartSummaryView | null>(null)
  const [loading, setLoading] = useState(true)
  const [signedOut, setSignedOut] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingItemId, setPendingItemId] = useState<string | null>(null)

  const loadCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart")
      if (res.status === 401) {
        setSignedOut(true)
        setLoading(false)
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Failed to load cart.")
      }
      const data = await res.json()
      setSummary({
        cart: data.cart,
        activeItems: (data.activeItems ?? []).map(mapItem),
        savedItems: (data.savedItems ?? []).map(mapItem),
        subtotalMinor: data.subtotalMinor,
        discountMinor: data.discountMinor,
        shippingMinor: data.shippingMinor,
        taxMinor: data.taxMinor,
        totalMinor: data.totalMinor,
        currency: data.currency,
      })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cart.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return
    setPendingItemId(itemId)
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Could not update quantity.")
      await loadCart()
      emitCartUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update quantity.")
    } finally {
      setPendingItemId(null)
    }
  }

  async function removeItem(itemId: string) {
    setPendingItemId(itemId)
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Could not remove item.")
      await loadCart()
      emitCartUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove item.")
    } finally {
      setPendingItemId(null)
    }
  }

  async function saveForLater(itemId: string) {
    setPendingItemId(itemId)
    try {
      const res = await fetch(`/api/cart/${itemId}/save-for-later`, { method: "POST" })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Could not save item for later.")
      await loadCart()
      emitCartUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save item for later.")
    } finally {
      setPendingItemId(null)
    }
  }

  async function moveToCart(itemId: string) {
    setPendingItemId(itemId)
    try {
      const res = await fetch(`/api/cart/${itemId}/move-to-cart`, { method: "POST" })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Could not move item to cart.")
      await loadCart()
      emitCartUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not move item to cart.")
    } finally {
      setPendingItemId(null)
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
          title="Sign in to view your cart"
          description="Your cart is saved to your account. Sign in to see what you've added."
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
  const savedItems = summary?.savedItems ?? []

  if (activeItems.length === 0 && savedItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything to your cart yet. Start shopping to find your perfect look."
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
  const discount = toMajor(summary?.discountMinor ?? 0)
  const shipping = toMajor(summary?.shippingMinor ?? 0)
  const tax = toMajor(summary?.taxMinor ?? 0)
  const total = toMajor(summary?.totalMinor ?? 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cart" },
        ]}
      />

      <h1 className="mb-8 text-2xl font-bold tracking-tight">Shopping Cart</h1>

      {error && (
        <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1">
          {activeItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Cart Items ({activeItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeItems.map((item) => {
                  const isPending = pendingItemId === item.id
                  return (
                    <div key={item.id}>
                      <div className="flex gap-4">
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-md bg-muted">
                          <ImageOff className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            {item.variant && (
                              <p className="text-sm text-muted-foreground">
                                {item.variant}
                              </p>
                            )}
                            <Price amount={toMajor(item.unitPriceMinor)} currency={currency} size="sm" className="mt-1" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={isPending || item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                                className="h-8 w-16 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                min={1}
                                max={99}
                                disabled={isPending}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={isPending || item.quantity >= 99}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-3">
                              <Price
                                amount={toMajor(item.unitPriceMinor * item.quantity)}
                                currency={currency}
                                size="sm"
                                className="font-semibold"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => removeItem(item.id)}
                                disabled={isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => saveForLater(item.id)}
                        disabled={isPending}
                      >
                        Save for later
                      </Button>
                      <Separator className="mt-4" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {savedItems.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  Saved for Later ({savedItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {savedItems.map((item) => {
                  const isPending = pendingItemId === item.id
                  return (
                    <div key={item.id}>
                      <div className="flex gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-muted">
                          <ImageOff className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            {item.variant && (
                              <p className="text-sm text-muted-foreground">
                                {item.variant}
                              </p>
                            )}
                            <Price amount={toMajor(item.unitPriceMinor)} currency={currency} size="sm" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveToCart(item.id)}
                              disabled={isPending}
                            >
                              Move to cart
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              disabled={isPending}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </div>

        {activeItems.length > 0 && (
          <div className="w-full lg:w-96">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <Price amount={subtotal} currency={currency} size="sm" />
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>
                        -{new Intl.NumberFormat("en-KE", { style: "currency", currency }).format(discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {shipping === 0
                        ? "Calculated at checkout"
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

                <Button className="w-full" size="lg" asChild>
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
