"use client"

import { useState } from "react"
import {
  Sparkles, Store, Image as ImageIcon, Phone, Truck,
  ShieldCheck, FileCheck, CheckCircle2, ArrowRight,
  Clock, Upload, Eye, Plus, Package
} from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Textarea } from "../../ui/textarea"
import { Card, CardContent } from "../../ui/card"
import { Checkbox } from "../../ui/checkbox"
import { Badge } from "../../ui/badge"
import { ImageUpload } from "./image-upload"
import { CountySelect } from "./county-select"

interface StepProps {
  data: Record<string, unknown>
  onUpdate: (data: Record<string, unknown>) => void
  sellerId?: string
}

const CATEGORIES = [
  "Fashion & Clothing", "Beauty & Skincare", "Jewelry & Accessories",
  "Home & Living", "Art & Crafts", "Electronics", "Food & Organic",
  "Health & Wellness", "Baby & Kids", "Sports & Fitness",
]

const BUSINESS_TYPES = [
  "Sole Proprietorship", "Partnership", "Limited Company",
  "Informal / Sole Trader", "Cooperative",
]

const DELIVERY_METHODS = [
  "Self Delivery (Within My Area)", "Customer Pickup",
  "Third-Party Courier", "Nationwide Shipping",
]

const POLICIES = [
  {
    title: "Seller Responsibilities",
    items: [
      "Accurate product listings with real photos",
      "Timely order processing and communication",
      "Fair return and refund handling",
      "Compliance with Kenyan consumer protection laws",
    ],
  },
  {
    title: "Prohibited Products",
    items: [
      "Counterfeit or trademark-infringing goods",
      "Weapons, drugs, or controlled substances",
      "Products requiring licenses without proper documentation",
      "Hazardous materials without proper labeling",
    ],
  },
  {
    title: "Marketplace Rules",
    items: [
      "One account per seller — no duplicate stores",
      "All products must be legal in Kenya",
      "Pricing must be transparent — no hidden fees",
      "Respond to customer inquiries within 24 hours",
    ],
  },
]

export function SellerWelcomeStep({ data, onUpdate }: StepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10">
          <Store className="h-8 w-8 text-rose-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Start Selling on Zuri Market</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Reach thousands of customers across Kenya. Set up your store in about 5 minutes.
        </p>
      </div>

      <div className="mx-auto max-w-md space-y-4">
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="font-medium">Takes about 5 minutes</p>
            <p className="text-sm text-muted-foreground">You can save and continue later</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="font-medium">Have your documents ready</p>
            <p className="text-sm text-muted-foreground">Business registration and ID (optional for now)</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <Eye className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="font-medium">Live preview</p>
            <p className="text-sm text-muted-foreground">See how your store looks as you build it</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function BusinessInfoStep({ data, onUpdate }: StepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(field: string, value: string) {
    const newErrors = { ...errors }
    if (field === "storeName" && value.length > 0 && value.length < 3) {
      newErrors.storeName = "Store name must be at least 3 characters"
    } else {
      delete newErrors[field as keyof typeof newErrors]
    }
    setErrors(newErrors)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Business Information</h2>
        <p className="mt-1 text-muted-foreground">
          Tell us about your store. You can edit these details later.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="storeName">Store name *</Label>
          <Input
            id="storeName"
            placeholder="e.g. Amani Beauty Co."
            value={(data.storeName as string) ?? ""}
            onChange={(e) => {
              onUpdate({ storeName: e.target.value })
              validate("storeName", e.target.value)
            }}
          />
          {errors.storeName && <p className="text-sm text-destructive">{errors.storeName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessName">Business name (optional)</Label>
          <Input
            id="businessName"
            placeholder="Legal business name if different"
            value={(data.businessName as string) ?? ""}
            onChange={(e) => onUpdate({ businessName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Business type</Label>
          <div className="grid grid-cols-2 gap-2">
            {BUSINESS_TYPES.map((type) => (
              <Badge
                key={type}
                variant={data.businessType === type ? "default" : "outline"}
                className="cursor-pointer justify-center py-2"
                onClick={() => onUpdate({ businessType: type })}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Business description</Label>
          <Textarea
            id="description"
            placeholder="What do you sell? What makes your store special?"
            rows={3}
            value={(data.description as string) ?? ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">{((data.description as string) ?? "").length}/500</p>
        </div>

        <div className="space-y-2">
          <Label>Business category *</Label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <Badge
                key={cat}
                variant={data.category === cat ? "default" : "outline"}
                className="cursor-pointer justify-center py-2"
                onClick={() => onUpdate({ category: cat })}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>County *</Label>
            <CountySelect
              value={data.county as string}
              onChange={(county) => onUpdate({ county })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="town">Town / City</Label>
            <Input
              id="town"
              placeholder="e.g. Nairobi, Westlands"
              value={(data.town as string) ?? ""}
              onChange={(e) => onUpdate({ town: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address (optional)</Label>
          <Input
            id="address"
            placeholder="Street address or landmark"
            value={(data.address as string) ?? ""}
            onChange={(e) => onUpdate({ address: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}

export function BrandingStep({ data, onUpdate }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Store Branding</h2>
        <p className="mt-1 text-muted-foreground">
          Make your store memorable with a logo and banner. You can skip this and add them later.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Store logo</Label>
          <p className="text-xs text-muted-foreground">Recommended: 512x512px, square format</p>
          <div className="mx-auto max-w-[200px]">
            <ImageUpload
              currentImage={data.logoUrl as string}
              onUpload={(url) => onUpdate({ logoUrl: url })}
              folder="store-logos"
              label="Upload logo"
              aspect="square"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Store banner</Label>
          <p className="text-xs text-muted-foreground">Recommended: 1200x400px, landscape format</p>
          <ImageUpload
            currentImage={data.bannerUrl as string}
            onUpload={(url) => onUpdate({ bannerUrl: url })}
            folder="store-banners"
            label="Upload banner"
            aspect="banner"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="storeDescription">Store description</Label>
          <Textarea
            id="storeDescription"
            placeholder="Tell shoppers what makes your store special"
            rows={4}
            value={(data.storeDescription as string) ?? (data.description as string) ?? ""}
            onChange={(e) => onUpdate({ storeDescription: e.target.value })}
          />
        </div>

        {!!data.logoUrl && !!data.bannerUrl && (
          <div className="rounded-xl border bg-muted/30 p-4">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">Preview</h3>
            <div className="overflow-hidden rounded-lg bg-background">
              {!!data.bannerUrl && (
                <div className="relative aspect-[3/1]">
                  <img src={data.bannerUrl as string} alt="Banner" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex items-center gap-3 p-4">
                {!!data.logoUrl && (
                  <img src={data.logoUrl as string} alt="Logo" className="h-12 w-12 rounded-full object-cover" />
                )}
                <div>
                  <p className="font-semibold">{(data.storeName as string) || "Your Store"}</p>
                  <p className="text-xs text-muted-foreground">{(data.category as string) || "Category"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function SellerContactStep({ data, onUpdate }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Contact Information</h2>
        <p className="mt-1 text-muted-foreground">
          How can customers reach you? This builds trust and helps with order communication.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sellerPhone">Phone number *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="sellerPhone"
              type="tel"
              placeholder="+254 7XX XXX XXX"
              className="pl-10"
              value={(data.supportPhone as string) ?? ""}
              onChange={(e) => onUpdate({ supportPhone: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sellerEmail">Business email *</Label>
          <Input
            id="sellerEmail"
            type="email"
            placeholder="support@yourstore.co.ke"
            value={(data.supportEmail as string) ?? ""}
            onChange={(e) => onUpdate({ supportEmail: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerSupport">Customer support contact (optional)</Label>
          <Input
            id="customerSupport"
            placeholder="WhatsApp, Facebook page, etc."
            value={(data.customerSupport as string) ?? ""}
            onChange={(e) => onUpdate({ customerSupport: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            An additional way for customers to reach you for support
          </p>
        </div>
      </div>
    </div>
  )
}

export function DeliveryStep({ data, onUpdate }: StepProps) {
  const methods = (data.deliveryMethods as string[]) ?? []

  function toggle(method: string) {
    const next = methods.includes(method)
      ? methods.filter((m) => m !== method)
      : [...methods, method]
    onUpdate({ deliveryMethods: next })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Delivery Information</h2>
        <p className="mt-1 text-muted-foreground">
          Zuri Market doesn&apos;t handle shipping — you manage your own deliveries.
          Let customers know how you deliver.
        </p>
      </div>

      <div className="rounded-lg bg-muted/50 p-4 text-sm">
        <p className="font-medium">How delivery works on Zuri Market</p>
        <ul className="mt-2 space-y-1 text-muted-foreground">
          <li>• You set your own delivery areas and prices</li>
          <li>• Buyers pay you directly via M-Pesa</li>
          <li>• You coordinate pickup or delivery with the buyer</li>
          <li>• Mark orders as delivered once confirmed</li>
        </ul>
      </div>

      <div className="space-y-2">
        <Label>Delivery methods *</Label>
        <div className="grid grid-cols-2 gap-2">
          {DELIVERY_METHODS.map((method) => (
            <Badge
              key={method}
              variant={methods.includes(method) ? "default" : "outline"}
              className="cursor-pointer justify-center py-2 text-center"
              onClick={() => toggle(method)}
            >
              {methods.includes(method) && <CheckCircle2 className="mr-1 h-3 w-3" />}
              {method}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deliveryAreas">Delivery areas</Label>
        <Input
          id="deliveryAreas"
          placeholder="e.g. Nairobi CBD, Westlands, Karen"
          value={(data.deliveryAreas as string) ?? ""}
          onChange={(e) => onUpdate({ deliveryAreas: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">Comma-separated list of areas you deliver to</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deliveryTime">Estimated delivery time</Label>
        <Input
          id="deliveryTime"
          placeholder="e.g. Same day, 1-2 days, 3-5 days"
          value={(data.deliveryTime as string) ?? ""}
          onChange={(e) => onUpdate({ deliveryTime: e.target.value })}
        />
      </div>
    </div>
  )
}

export function PoliciesStep({ data, onUpdate }: StepProps) {
  const accepted = (data.policiesAccepted as boolean) ?? false

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Marketplace Policies</h2>
        <p className="mt-1 text-muted-foreground">
          Please review and accept our marketplace policies to continue.
        </p>
      </div>

      <div className="space-y-4">
        {POLICIES.map((policy) => (
          <Card key={policy.title}>
            <CardContent className="p-4">
              <h3 className="font-semibold">{policy.title}</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {policy.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={accepted}
            onCheckedChange={(v) => onUpdate({ policiesAccepted: v === true })}
          />
          <label htmlFor="terms" className="text-sm leading-relaxed">
            I have read and agree to the{" "}
            <a href="/terms" target="_blank" className="underline hover:text-primary">Terms & Conditions</a>,{" "}
            <a href="/privacy" target="_blank" className="underline hover:text-primary">Privacy Policy</a>, and
            the marketplace rules outlined above. I understand that violating these policies may result in
            account suspension.
          </label>
        </div>
      </div>

      {!accepted && (
        <p className="text-sm text-destructive">You must accept the policies to continue</p>
      )}
    </div>
  )
}

export function VerificationStep({ data, onUpdate }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Verification</h2>
        <p className="mt-1 text-muted-foreground">
          Help us verify your business. This step is optional but builds trust with buyers.
        </p>
      </div>

      <div className="rounded-lg bg-muted/50 p-4 text-sm">
        <p className="font-medium">Why verify?</p>
        <ul className="mt-2 space-y-1 text-muted-foreground">
          <li>• Verified badges increase buyer confidence</li>
          <li>• Higher visibility in search results</li>
          <li>• Access to premium seller features</li>
        </ul>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessReg">Business registration number (optional)</Label>
          <Input
            id="businessReg"
            placeholder="e.g. PVT-2024-XXXXXX"
            value={(data.businessRegNumber as string) ?? ""}
            onChange={(e) => onUpdate({ businessRegNumber: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">If you have a registered business</p>
        </div>

        <div className="space-y-2">
          <Label>National ID or Passport</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border-2 border-dashed p-4 text-center text-sm text-muted-foreground">
              <FileCheck className="mx-auto mb-2 h-8 w-8" />
              <p>Front of ID</p>
              <Button variant="outline" size="sm" className="mt-2">Upload</Button>
            </div>
            <div className="rounded-lg border-2 border-dashed p-4 text-center text-sm text-muted-foreground">
              <FileCheck className="mx-auto mb-2 h-8 w-8" />
              <p>Back of ID</p>
              <Button variant="outline" size="sm" className="mt-2">Upload</Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxInfo">Tax information (optional)</Label>
          <Input
            id="taxInfo"
            placeholder="KRA PIN if applicable"
            value={(data.taxInfo as string) ?? ""}
            onChange={(e) => onUpdate({ taxInfo: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}

export function SellerSuccessStep({ data }: StepProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle2 className="h-8 w-8 text-primary" />
      </div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Your store is ready!</h2>
        <p className="mt-2 text-muted-foreground">
          <span className="font-semibold">{(data.storeName as string) || "Your store"}</span> has been
          created. You can now start adding products and making sales.
        </p>
      </div>

      <div className="mx-auto max-w-sm space-y-3 text-left">
        <div className="rounded-lg border p-3">
          <p className="text-sm"><span className="font-medium">Store:</span> {(data.storeName as string) || "Not set"}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-sm"><span className="font-medium">Category:</span> {(data.category as string) || "Not set"}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-sm"><span className="font-medium">County:</span> {(data.county as string) || "Not set"}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button size="lg" onClick={() => window.location.href = "/seller/products/new"}>
          <Plus className="mr-2 h-4 w-4" />
          Add Your First Product
        </Button>
        <Button size="lg" variant="outline" onClick={() => window.location.href = "/seller"}>
          Go to Seller Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
