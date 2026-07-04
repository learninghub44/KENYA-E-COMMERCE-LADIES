"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Upload, Store, Instagram, Facebook, Twitter, MessageCircle, CheckCircle2, AlertCircle, Loader2, X, ImageIcon } from "lucide-react"

import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Label } from "../../../components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card"

const storeSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal("")),
  address: z.string().min(5, "Address must be at least 5 characters").optional().or(z.literal("")),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  whatsapp: z.string().optional(),
  shippingPolicy: z.string().optional(),
  returnsPolicy: z.string().optional(),
  paymentPolicy: z.string().optional(),
})

type StoreFormData = z.infer<typeof storeSchema>

export type StoreProfileInitialValues = {
  storeName: string
  description: string
  supportEmail: string
  supportPhone: string
  addressLine1: string
  addressCity: string
  addressCountryCode: string
  instagram: string
  facebook: string
  twitter: string
  whatsapp: string
  shippingPolicy: string
  returnsPolicy: string
  paymentPolicy: string
}

export function StoreProfileForm({ initialValues }: { initialValues: StoreProfileInitialValues }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: initialValues.storeName,
      description: initialValues.description,
      email: initialValues.supportEmail,
      phone: initialValues.supportPhone,
      address: initialValues.addressLine1,
      instagram: initialValues.instagram,
      facebook: initialValues.facebook,
      twitter: initialValues.twitter,
      whatsapp: initialValues.whatsapp,
      shippingPolicy: initialValues.shippingPolicy,
      returnsPolicy: initialValues.returnsPolicy,
      paymentPolicy: initialValues.paymentPolicy,
    },
  })

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "cover"
  ) {
    const file = e.target.files?.[0]
    if (!file) return

    const setUploading = type === "logo" ? setIsUploadingLogo : setIsUploadingCover
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("category", "product")

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        if (type === "logo") {
          setLogoUrl(data.url)
        } else {
          setCoverUrl(data.url)
        }
      } else {
        setStatus({ type: "error", message: "Failed to upload image" })
      }
    } catch {
      setStatus({ type: "error", message: "Failed to upload image" })
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(data: StoreFormData) {
    setSaving(true)
    setStatus(null)
    try {
      const res = await fetch("/api/sellers/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: data.name,
          storeDescription: data.description,
          supportEmail: data.email || undefined,
          supportPhone: data.phone || undefined,
          businessAddress: data.address
            ? {
                line1: data.address,
                city: initialValues.addressCity || "Nairobi",
                countryCode: initialValues.addressCountryCode || "KE",
              }
            : undefined,
          socialLinks: {
            instagram: data.instagram || "",
            facebook: data.facebook || "",
            twitter: data.twitter || "",
            whatsapp: data.whatsapp || "",
          },
          storePolicies: {
            shipping: data.shippingPolicy || undefined,
            returns: data.returnsPolicy || undefined,
          },
          logoUrl: logoUrl,
          bannerUrl: coverUrl,
        }),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        setStatus({ type: "error", message: json.error ?? "Failed to save store profile." })
        return
      }

      setStatus({ type: "success", message: "Store profile saved." })
      router.refresh()
    } catch {
      setStatus({ type: "error", message: "Network error while saving. Please try again." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Store Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage your store information and branding.
          </p>
        </div>
        <Button onClick={handleSubmit(onSubmit)} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {status && (
        <div
          className={`flex items-center gap-2 rounded-md border p-3 text-sm ${
            status.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {status.message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Your store logo and cover image.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Store Logo</Label>
                  <div className="relative">
                    {logoUrl ? (
                      <div className="relative">
                        <img
                          src={logoUrl}
                          alt="Store logo"
                          className="h-32 w-32 rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setLogoUrl(null)}
                          className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="logo-upload"
                        className="flex h-32 w-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/50"
                      >
                        {isUploadingLogo ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <>
                            <ImageIcon className="h-6 w-6" />
                            <span className="sr-only">Upload logo</span>
                          </>
                        )}
                      </label>
                    )}
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, "logo")}
                      disabled={isUploadingLogo}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <div className="relative">
                    {coverUrl ? (
                      <div className="relative">
                        <img
                          src={coverUrl}
                          alt="Store cover"
                          className="h-32 w-full rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setCoverUrl(null)}
                          className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="cover-upload"
                        className="flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/50"
                      >
                        {isUploadingCover ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <>
                            <ImageIcon className="h-6 w-6" />
                            <span className="sr-only">Upload cover image</span>
                          </>
                        )}
                      </label>
                    )}
                    <input
                      id="cover-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, "cover")}
                      disabled={isUploadingCover}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Store Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Store Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How customers can reach you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...register("phone")} />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register("address")} />
                {errors.address && (
                  <p className="text-xs text-destructive">{errors.address.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Connect your social media profiles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { icon: Instagram, label: "Instagram", key: "instagram" },
                { icon: Facebook, label: "Facebook", key: "facebook" },
                { icon: Twitter, label: "Twitter", key: "twitter" },
                { icon: MessageCircle, label: "WhatsApp", key: "whatsapp" },
              ].map(({ icon: Icon, label, key }) => (
                <div key={key} className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  <div className="flex-1">
                    <Label htmlFor={key} className="sr-only">
                      {label}
                    </Label>
                    <Input
                      id={key}
                      {...register(key as keyof StoreFormData)}
                      placeholder={`${label} URL`}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Store Policies</CardTitle>
              <CardDescription>Set your store policies for customers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shippingPolicy">Shipping Policy</Label>
                <Textarea
                  id="shippingPolicy"
                  {...register("shippingPolicy")}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="returnsPolicy">Returns Policy</Label>
                <Textarea
                  id="returnsPolicy"
                  {...register("returnsPolicy")}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentPolicy">Payment Policy</Label>
                <Textarea
                  id="paymentPolicy"
                  {...register("paymentPolicy")}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Note: payment policy text isn&apos;t persisted yet — the backend schema only stores shipping and returns policies today.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <Store className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="mt-3 font-medium">{initialValues.storeName || "Your Store Name"}</p>
                <p className="text-sm text-muted-foreground">
                  {initialValues.description || "Complete your profile to see a preview."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
