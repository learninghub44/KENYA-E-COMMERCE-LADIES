"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Upload, Store, Instagram, Facebook, Twitter, MessageCircle } from "lucide-react"

import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Label } from "../../../components/ui/label"
import { Separator } from "../../../components/ui/separator"
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
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  whatsapp: z.string().optional(),
  shippingPolicy: z.string().optional(),
  returnsPolicy: z.string().optional(),
  paymentPolicy: z.string().optional(),
})

type StoreFormData = z.infer<typeof storeSchema>

export default function StoreProfilePage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: "My Fashion Store",
      description:
        "Premium African fashion and accessories. Handcrafted with love.",
      email: "store@myfashionstore.com",
      phone: "+254712345678",
      address: "123 Kenyatta Avenue, Nairobi, Kenya",
      instagram: "https://instagram.com/myfashionstore",
      facebook: "https://facebook.com/myfashionstore",
      twitter: "https://twitter.com/myfashionstore",
      whatsapp: "+254712345678",
      shippingPolicy:
        "Free shipping on orders over KES 3,000. Delivery within 3-5 business days.",
      returnsPolicy:
        "Returns accepted within 14 days of delivery. Item must be unused and in original packaging.",
      paymentPolicy:
        "We accept M-Pesa, credit/debit cards, and bank transfers.",
    },
  })

  function onSubmit(data: StoreFormData) {
    console.log("Store profile saved:", data)
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
        <Button onClick={handleSubmit(onSubmit)}>Save Changes</Button>
      </div>

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
                  <button
                    type="button"
                    className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/50"
                  >
                    <Upload className="h-6 w-6" />
                    <span className="sr-only">Upload logo</span>
                  </button>
                </div>
                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <button
                    type="button"
                    className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/50"
                  >
                    <Upload className="h-6 w-6" />
                    <span className="sr-only">Upload cover image</span>
                  </button>
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
                <p className="mt-3 font-medium">Your Store Name</p>
                <p className="text-sm text-muted-foreground">
                  Complete your profile to see a preview.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
