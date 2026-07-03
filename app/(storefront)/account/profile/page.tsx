"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Camera, Save, Loader2, Upload, AlertCircle } from "lucide-react"

import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Separator } from "../../../../components/ui/separator"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar"
import { Breadcrumbs } from "../../../../components/shared/breadcrumbs"
import { useAuth } from "../../../../lib/auth/auth-context"

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number required"),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  })

  useEffect(() => {
    if (!user) return

    fetch("/api/account/profile")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load profile")
        return res.json()
      })
      .then((data) => {
        const nameParts = (data?.displayName ?? "").split(" ")
        const firstName = nameParts[0] ?? ""
        const lastName = nameParts.slice(1).join(" ") ?? ""
        reset({
          firstName,
          lastName,
          email: data?.email ?? user.email ?? "",
          phone: data?.phone ?? "",
        })
        setAvatarUrl(data?.avatarUrl ?? null)
      })
      .catch((err) => {
        setError(err.message)
        reset({
          firstName: "",
          lastName: "",
          email: user.email ?? "",
          phone: "",
        })
      })
      .finally(() => setIsLoading(false))
  }, [user, reset])

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true)
    setError(null)
    setSaved(false)

    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: `${data.firstName} ${data.lastName}`.trim(),
          email: data.email,
          phone: data.phone,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error ?? "Failed to save profile")
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("category", "userAvatars")

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })

      if (!uploadRes.ok) {
        const errData = await uploadRes.json()
        throw new Error(errData.error ?? "Upload failed")
      }

      const { url } = await uploadRes.json()

      const profileRes = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: url }),
      })

      if (!profileRes.ok) {
        const errData = await profileRes.json()
        throw new Error(errData.error ?? "Failed to update avatar")
      }

      setAvatarUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-2xl items-center justify-center px-4 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My Account", href: "/account" },
          { label: "Profile" },
        ]}
      />

      <h1 className="mb-6 text-2xl font-bold tracking-tight">Profile Settings</h1>

      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="flex items-center gap-3 p-4 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardContent className="flex flex-col items-center p-6 sm:flex-row sm:gap-6">
          <div className="relative mb-4 sm:mb-0">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl ?? "/placeholder.svg"} />
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="outline"
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div className="text-center sm:text-left">
            <p className="font-medium">Profile Photo</p>
            <p className="text-sm text-muted-foreground">
              JPG, PNG or GIF. Max 2MB.
            </p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
            <CardDescription>
              Update your personal details here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...register("firstName")} />
                {errors.firstName && (
                  <p className="text-xs text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...register("lastName")} />
                {errors.lastName && (
                  <p className="text-xs text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" {...register("phone")} />
              {errors.phone && (
                <p className="text-xs text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <Separator />

            <Button type="submit" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
