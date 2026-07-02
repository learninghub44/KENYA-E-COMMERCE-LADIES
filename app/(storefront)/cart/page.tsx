"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Trash2,
  ShoppingBag,
  Minus,
  Plus,
  ArrowRight,
  Tag,
} from "lucide-react"

import { cn } from "../../../lib/utils"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Separator } from "../../../components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Price } from "../../../components/shared/price"
import { EmptyState } from "../../../components/shared/empty-state"
import { Breadcrumbs } from "../../../components/shared/breadcrumbs"

interface CartItem {
  id: string
  name: string
  variant: string
  price: number
  quantity: number
  image: string
  maxQuantity: number
}

const INITIAL_CART: CartItem[] = [
  {
    id: "1",
    name: "Premium Ankara Maxi Dress",
    variant: "Size M / Red",
    price: 4500,
    quantity: 1,
    image: "/placeholder.svg",
    maxQuantity: 10,
  },
  {
    id: "2",
    name: "Handwoven Kente Blazer",
    variant: "Size L / Gold",
    price: 8900,
    quantity: 2,
    image: "/placeholder.svg",
    maxQuantity: 5,
  },
  {
    id: "3",
    name: "Beaded Evening Gown",
    variant: "Size S / Black",
    price: 12500,
    quantity: 1,
    image: "/placeholder.svg",
    maxQuantity: 3,
  },
]

const SHIPPING_ESTIMATE = 500
const TAX_RATE = 0.08

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART)
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([])

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const newQty = item.quantity + delta
        if (newQty < 1 || newQty > item.maxQuantity) return item
        return { ...item, quantity: newQty }
      })
    )
  }

  const setQuantity = (id: string, value: number) => {
    const qty = Math.max(1, Math.min(value, 10))
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    )
  }

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const moveToSaved = (item: CartItem) => {
    removeItem(item.id)
    setSavedForLater((prev) => [...prev, item])
  }

  const moveToCart = (item: CartItem) => {
    setSavedForLater((prev) => prev.filter((i) => i.id !== item.id))
    setCartItems((prev) => [...prev, item])
  }

  const removeSaved = (id: string) => {
    setSavedForLater((prev) => prev.filter((i) => i.id !== id))
  }

  const applyPromo = () => {
    if (promoCode.trim().toLowerCase() === "save10") {
      setPromoApplied(true)
    }
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const discount = promoApplied ? subtotal * 0.1 : 0
  const tax = (subtotal - discount) * TAX_RATE
  const total = subtotal - discount + SHIPPING_ESTIMATE + tax

  if (cartItems.length === 0 && savedForLater.length === 0) {
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cart" },
        ]}
      />

      <h1 className="mb-8 text-2xl font-bold tracking-tight">Shopping Cart</h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Cart Items ({cartItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id}>
                  <div className="flex gap-4">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.variant}
                        </p>
                        <Price amount={item.price} size="sm" className="mt-1" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              setQuantity(item.id, Number(e.target.value))
                            }
                            className="h-8 w-16 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            min={1}
                            max={item.maxQuantity}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={item.quantity >= item.maxQuantity}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-3">
                          <Price
                            amount={item.price * item.quantity}
                            size="sm"
                            className="font-semibold"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(item.id)}
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
                    onClick={() => moveToSaved(item)}
                  >
                    Save for later
                  </Button>
                  <Separator className="mt-4" />
                </div>
              ))}
            </CardContent>
          </Card>

          {savedForLater.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  Saved for Later ({savedForLater.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {savedForLater.map((item) => (
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
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.variant}
                          </p>
                          <Price amount={item.price} size="sm" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveToCart(item)}
                          >
                            Move to cart
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSaved(item.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="w-full lg:w-96">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="pl-9"
                    disabled={promoApplied}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={applyPromo}
                  disabled={promoApplied || !promoCode.trim()}
                >
                  {promoApplied ? "Applied" : "Apply"}
                </Button>
              </div>

              {promoApplied && (
                <p className="text-sm text-green-600">
                  Promo SAVE10 applied! 10% discount
                </p>
              )}

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <Price amount={subtotal} size="sm" />
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount (10%)</span>
                    <span>-KES {discount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {SHIPPING_ESTIMATE === 0
                      ? "Free"
                      : `KES ${SHIPPING_ESTIMATE.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <Price amount={tax} size="sm" />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <Price amount={total} size="md" className="font-bold" />
              </div>

              <Button className="w-full" size="lg" asChild>
                <Link href="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Free shipping on orders over KES 10,000
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
