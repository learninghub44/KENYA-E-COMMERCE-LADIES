"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import QRCode from "qrcode"
import { Shield, Smartphone, Save, Loader2, AlertCircle, CheckCircle, Copy, X } from "lucide-react"
import { toast } from "sonner"

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
import { Badge } from "../../../../components/ui/badge"
import { Switch } from "../../../../components/ui/switch"
import { Breadcrumbs } from "../../../../components/shared/breadcrumbs"
import { createSupabaseBrowserClient } from "../../../../lib/supabase/client"

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type PasswordFormData = z.infer<typeof passwordSchema>

export default function SecurityPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorLoading, setTwoFactorLoading] = useState(false)
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false)
  const [twoFactorSecret, setTwoFactorSecret] = useState("")
  const [twoFactorUri, setTwoFactorUri] = useState("")
  const [verifyCode, setVerifyCode] = useState("")
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("")
  const qrCodeGenerated = useRef(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  // Check 2FA status on mount
  useEffect(() => {
    fetch("/api/account/2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status" }),
    })
      .then((res) => res.json())
      .then((data) => {
        setTwoFactorEnabled(data.enabled ?? false)
      })
      .catch(() => {})
  }, [])

  // Generate QR code when URI changes
  useEffect(() => {
    if (twoFactorUri && showTwoFactorSetup && !qrCodeGenerated.current) {
      qrCodeGenerated.current = true
      QRCode.toDataURL(twoFactorUri, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
        .then((url) => {
          setQrCodeDataUrl(url)
        })
        .catch(() => {
          toast.error("Failed to generate QR code")
        })
    }
  }, [twoFactorUri, showTwoFactorSetup])

  const onSubmit = async (data: PasswordFormData) => {
    setIsSaving(true)
    setError(null)

    try {
      const supabase = createSupabaseBrowserClient()

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email ?? "",
        password: data.currentPassword,
      })

      if (signInError) {
        setError("Current password is incorrect.")
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      toast.success("Password updated successfully")
      reset()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleTwoFactorToggle = async (checked: boolean) => {
    if (!checked && twoFactorEnabled) {
      // Disable 2FA
      setTwoFactorLoading(true)
      try {
        const res = await fetch("/api/account/2fa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "disable" }),
        })

        if (res.ok) {
          setTwoFactorEnabled(false)
          toast.success("Two-factor authentication disabled")
        } else {
          toast.error("Failed to disable 2FA")
        }
      } catch {
        toast.error("Failed to disable 2FA")
      } finally {
        setTwoFactorLoading(false)
      }
    } else if (checked && !twoFactorEnabled) {
      // Start 2FA setup
      setTwoFactorLoading(true)
      try {
        const res = await fetch("/api/account/2fa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "setup" }),
        })

        if (res.ok) {
          const data = await res.json()
          setTwoFactorSecret(data.secret)
          setTwoFactorUri(data.uri)
          setShowTwoFactorSetup(true)
        } else {
          toast.error("Failed to setup 2FA")
        }
      } catch {
        toast.error("Failed to setup 2FA")
      } finally {
        setTwoFactorLoading(false)
      }
    }
  }

  const handleVerifyCode = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      toast.error("Please enter a 6-digit code")
      return
    }

    setTwoFactorLoading(true)
    try {
      const res = await fetch("/api/account/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", code: verifyCode }),
      })

      if (res.ok) {
        setTwoFactorEnabled(true)
        setShowTwoFactorSetup(false)
        setVerifyCode("")
        toast.success("Two-factor authentication enabled successfully!")
      } else {
        const data = await res.json()
        toast.error(data.error || "Invalid code. Please try again.")
      }
    } catch {
      toast.error("Failed to verify code")
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const copySecret = () => {
    navigator.clipboard.writeText(twoFactorSecret)
    toast.success("Secret copied to clipboard")
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My Account", href: "/account" },
          { label: "Security" },
        ]}
      />

      <h1 className="mb-6 text-2xl font-bold tracking-tight">Security Settings</h1>

      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="flex items-center gap-3 p-4 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Use a strong password that you don&apos;t use elsewhere.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...register("currentPassword")}
              />
              {errors.currentPassword && (
                <p className="text-xs text-destructive">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-xs text-destructive">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              Password must be at least 8 characters, include an uppercase
              letter and a number.
            </div>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? "Updating..." : "Update Password"}
            </Button>
          </CardContent>
        </Card>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-factor authentication</p>
              <p className="text-sm text-muted-foreground">
                Secure your account with an authenticator app.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={twoFactorEnabled ? "bg-green-100 text-green-700" : ""}>
                {twoFactorEnabled ? "Enabled" : "Disabled"}
              </Badge>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={handleTwoFactorToggle}
                disabled={twoFactorLoading}
              />
            </div>
          </div>

          {twoFactorLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </div>
          )}

          {/* 2FA Setup Modal */}
          {showTwoFactorSetup && (
            <div className="rounded-lg border-2 border-dashed border-[#1C5C56] bg-muted/50 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Setup Two-Factor Authentication</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowTwoFactorSetup(false)
                    setVerifyCode("")
                    setQrCodeDataUrl("")
                    qrCodeGenerated.current = false
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3 text-sm">
                <p>1. Install an authenticator app like Google Authenticator or Authy.</p>
                <p>2. Scan this QR code or enter the secret key manually:</p>
                
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white p-2">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="QR Code for 2FA setup"
                        className="h-[200px] w-[200px]"
                      />
                    ) : (
                      <div className="flex h-[200px] w-[200px] items-center justify-center bg-gray-100">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-xs text-muted-foreground">Secret key:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-muted px-2 py-1 text-xs break-all">
                        {twoFactorSecret}
                      </code>
                      <Button variant="ghost" size="sm" onClick={copySecret}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <p>3. Enter the 6-digit code from your authenticator app:</p>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                    className="w-32 font-mono text-lg"
                  />
                  <Button
                    onClick={handleVerifyCode}
                    disabled={verifyCode.length !== 6 || twoFactorLoading}
                  >
                    {twoFactorLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Verify & Enable
                  </Button>
                </div>
              </div>
            </div>
          )}

          {twoFactorEnabled && !showTwoFactorSetup && (
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
              <CheckCircle className="mb-2 h-4 w-4" />
              Two-factor authentication is enabled. Your account is protected with an additional layer of security.
            </div>
          )}

          {!twoFactorEnabled && !showTwoFactorSetup && (
            <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
              <Shield className="mb-2 h-4 w-4" />
              Two-factor authentication adds an extra layer of security to your account. When enabled, you&apos;ll need to enter a code from your authenticator app when signing in.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
