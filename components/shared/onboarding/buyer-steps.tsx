"use client"

import { useState } from "react"
import { ShoppingBag, Store, ArrowRight, User, Phone, Camera, MapPin, Heart, Bell, CheckCircle2, Sparkles } from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Card, CardContent } from "../../ui/card"
import { Switch } from "../../ui/switch"
import { Badge } from "../../ui/badge"
import { ImageUpload } from "./image-upload"
import { CountySelect } from "./county-select"

interface StepProps {
  data: Record<string, unknown>
  onUpdate: (data: Record<string, unknown>) => void
}

const INTERESTS = [
  "Fashion & Clothing", "Beauty & Skincare", "Jewelry & Accessories",
  "Home & Living", "Art & Crafts", "Electronics", "Food & Organic",
  "Health & Wellness", "Baby & Kids", "Sports & Fitness",
]

export function WelcomeStep({ data, onUpdate }: StepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Zuri Market</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Discover unique fashion, beauty, and lifestyle products from Kenyan sellers.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card
          className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
            data.role === "buyer" ? "ring-2 ring-primary bg-primary/5" : ""
          }`}
          onClick={() => onUpdate({ role: "buyer" })}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Shop on Zuri Market</h3>
              <p className="text-sm text-muted-foreground">Browse and buy from local sellers</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
            data.role === "seller" ? "ring-2 ring-primary bg-primary/5" : ""
          }`}
          onClick={() => onUpdate({ role: "seller" })}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10">
              <Store className="h-6 w-6 text-rose-500" />
            </div>
            <div>
              <h3 className="font-semibold">Sell on Zuri Market</h3>
              <p className="text-sm text-muted-foreground">Reach thousands of customers across Kenya</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        You can always switch later from your account settings.
      </p>
    </div>
  )
}

export function FullNameStep({ data, onUpdate }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">What&apos;s your name?</h2>
        <p className="mt-1 text-muted-foreground">
          We&apos;ll use this to personalize your experience.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="displayName">Full name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="displayName"
            placeholder="Jane Doe"
            className="pl-10"
            value={(data.displayName as string) ?? ""}
            onChange={(e) => onUpdate({ displayName: e.target.value })}
            autoFocus
          />
        </div>
        {(data.displayName as string)?.length > 0 && (data.displayName as string).length < 2 && (
          <p className="text-sm text-destructive">Name must be at least 2 characters</p>
        )}
      </div>
    </div>
  )
}

export function PhotoStep({ data, onUpdate }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add a profile photo</h2>
        <p className="mt-1 text-muted-foreground">
          Help sellers and buyers recognize you. This step is optional.
        </p>
      </div>
      <div className="mx-auto max-w-xs">
        <ImageUpload
          currentImage={data.avatarUrl as string}
          onUpload={(url) => onUpdate({ avatarUrl: url })}
          folder="avatars"
          label="Upload photo"
          aspect="square"
        />
      </div>
    </div>
  )
}

export function PhoneStep({ data, onUpdate }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Phone number</h2>
        <p className="mt-1 text-muted-foreground">
          For order updates and delivery notifications. Optional but recommended.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            placeholder="+254 7XX XXX XXX"
            className="pl-10"
            value={(data.phone as string) ?? ""}
            onChange={(e) => onUpdate({ phone: e.target.value })}
          />
        </div>
        {!!data.phone && !(data.phone as string).match(/^\+?[0-9\s-]{10,}$/) && (
          <p className="text-sm text-destructive">Please enter a valid phone number</p>
        )}
      </div>
    </div>
  )
}

export function LocationStep({ data, onUpdate }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Where are you located?</h2>
        <p className="mt-1 text-muted-foreground">
          Helps us show you nearby sellers and relevant products.
        </p>
      </div>
      <div className="space-y-2">
        <Label>County</Label>
        <CountySelect
          value={data.county as string}
          onChange={(county) => onUpdate({ county })}
        />
      </div>
    </div>
  )
}

export function InterestsStep({ data, onUpdate }: StepProps) {
  const selected = (data.interests as string[]) ?? []

  function toggle(interest: string) {
    const next = selected.includes(interest)
      ? selected.filter((i) => i !== interest)
      : [...selected, interest]
    onUpdate({ interests: next })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">What are you interested in?</h2>
        <p className="mt-1 text-muted-foreground">
          We&apos;ll customize your feed with products you love. Skip if you prefer to explore.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {INTERESTS.map((interest) => (
          <Badge
            key={interest}
            variant={selected.includes(interest) ? "default" : "outline"}
            className="cursor-pointer text-sm py-1.5 px-3"
            onClick={() => toggle(interest)}
          >
            {selected.includes(interest) && <CheckCircle2 className="mr-1 h-3 w-3" />}
            {interest}
          </Badge>
        ))}
      </div>
    </div>
  )
}

export function NotificationsStep({ data, onUpdate }: StepProps) {
  const prefs = (data.notifications as Record<string, boolean>) ?? {
    email: true,
    push: true,
    sms: false,
    deals: true,
    orders: true,
    newSellers: false,
  }

  function update(key: string, value: boolean) {
    onUpdate({ notifications: { ...prefs, [key]: value } })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Notification preferences</h2>
        <p className="mt-1 text-muted-foreground">
          Choose how you&apos;d like to hear from us.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Channels</h3>
        {[
          { key: "email", label: "Email notifications", desc: "Order confirmations, account updates" },
          { key: "push", label: "Push notifications", desc: "Real-time alerts on your device" },
          { key: "sms", label: "SMS notifications", desc: "Critical delivery updates via text" },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
            <Switch
              checked={prefs[item.key]}
              onCheckedChange={(v) => update(item.key, v)}
            />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Content</h3>
        {[
          { key: "deals", label: "Deals & promotions", desc: "Sales, discounts, and special offers" },
          { key: "orders", label: "Order updates", desc: "Shipping, delivery, and return status" },
          { key: "newSellers", label: "New sellers", desc: "When new sellers join in your areas of interest" },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
            <Switch
              checked={prefs[item.key]}
              onCheckedChange={(v) => update(item.key, v)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ConfirmationStep({ data }: StepProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle2 className="h-8 w-8 text-primary" />
      </div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">You&apos;re all set!</h2>
        <p className="mt-2 text-muted-foreground">
          Your Zuri Market account is ready. Start exploring unique products from Kenyan sellers.
        </p>
      </div>

      <div className="mx-auto max-w-sm space-y-3 text-left">
        <div className="rounded-lg border p-3">
          <p className="text-sm"><span className="font-medium">Name:</span> {(data.displayName as string) || "Not set"}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-sm"><span className="font-medium">Phone:</span> {(data.phone as string) || "Not set"}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-sm"><span className="font-medium">County:</span> {(data.county as string) || "Not set"}</p>
        </div>
        {!!data.interests && (data.interests as string[]).length > 0 && (
          <div className="rounded-lg border p-3">
            <p className="text-sm font-medium mb-1">Interests:</p>
            <div className="flex flex-wrap gap-1">
              {(data.interests as string[]).map((i) => (
                <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button size="lg" onClick={() => window.location.href = "/"}>
          Start Shopping
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
