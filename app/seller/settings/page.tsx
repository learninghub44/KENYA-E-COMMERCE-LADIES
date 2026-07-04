"use client"

import { useState, useEffect } from "react"
import {
  Bell,
  CreditCard,
  Clock,
  Lock,
  Shield,
  AlertTriangle,
  Loader2,
  Save,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Switch } from "../../../components/ui/switch"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card"

const notificationEvents = [
  { id: "new-order", label: "New Orders", description: "When a customer places a new order" },
  { id: "order-shipped", label: "Order Shipped", description: "When an order status changes to shipped" },
  { id: "order-delivered", label: "Order Delivered", description: "When an order is marked as delivered" },
  { id: "new-review", label: "New Reviews", description: "When a customer leaves a new review" },
  { id: "new-message", label: "New Messages", description: "When a customer sends you a message" },
  { id: "low-stock", label: "Low Stock Alerts", description: "When a product runs low on stock" },
  { id: "payment-confirmed", label: "Buyer Payment Confirmed", description: "When a buyer marks their direct payment to you as sent" },
  { id: "kyc-update", label: "KYC Updates", description: "When your KYC status changes" },
]

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

interface SettingsData {
  storeName: string
  slug: string
  description: string
  supportEmail: string
  supportPhone: string
  logoUrl: string
  bannerUrl: string
  storeHours: Record<string, string>
  notifications: Record<string, boolean>
  mpesaNumber: string
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SettingsData | null>(null)

  useEffect(() => {
    fetch("/api/seller/settings")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load settings")
        return r.json()
      })
      .then((d: SettingsData) => setSettings(d))
      .catch(() => {
        setSettings({
          storeName: "",
          slug: "",
          description: "",
          supportEmail: "",
          supportPhone: "",
          logoUrl: "",
          bannerUrl: "",
          storeHours: Object.fromEntries(DAYS.map((d) => [d, d === "Sunday" ? "Closed" : "09:00 - 18:00"])),
          notifications: Object.fromEntries(notificationEvents.map((e) => [e.id, true])),
          mpesaNumber: "",
        })
      })
      .finally(() => setLoading(false))
  }, [])

  function toggleNotification(id: string) {
    if (!settings) return
    setSettings({
      ...settings,
      notifications: { ...settings.notifications, [id]: !settings.notifications[id] },
    })
  }

  function updateStoreHours(day: string, value: string) {
    if (!settings) return
    setSettings({
      ...settings,
      storeHours: { ...settings.storeHours, [day]: value },
    })
  }

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    try {
      const res = await fetch("/api/seller/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: settings.storeName,
          description: settings.description,
          supportEmail: settings.supportEmail,
          supportPhone: settings.supportPhone,
          storeHours: settings.storeHours,
          notifications: settings.notifications,
          mpesaNumber: settings.mpesaNumber,
        }),
      })
      if (!res.ok) throw new Error("Failed to save")
      const updated = await res.json()
      setSettings(updated)
      toast.success("Settings saved successfully")
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your seller account settings.</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!settings) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your seller account settings.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-[#1C5C56] hover:bg-[#1C5C56]/90">
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Notification Preferences</CardTitle>
          </div>
          <CardDescription>
            Choose which notifications you want to receive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="text-sm font-medium">{event.label}</p>
                <p className="text-xs text-muted-foreground">
                  {event.description}
                </p>
              </div>
              <Switch
                checked={settings.notifications[event.id] ?? false}
                onCheckedChange={() => toggleNotification(event.id)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Buyer Payment Details</CardTitle>
          </div>
          <CardDescription>
            Zuri Market is a listings platform — we never collect, hold, or process payments.
            Buyers pay you directly, so keep the M-Pesa number shown to them up to date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="mpesa-number">M-Pesa number shown to buyers</Label>
            <Input
              id="mpesa-number"
              value={settings.mpesaNumber}
              onChange={(e) => setSettings({ ...settings, mpesaNumber: e.target.value })}
              placeholder="e.g. 0712345678"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Store Hours</CardTitle>
          </div>
          <CardDescription>
            Set your store&apos;s operating hours for customer communication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {DAYS.map((day) => (
              <div key={day} className="flex items-center gap-4">
                <span className="w-24 text-sm font-medium">{day}</span>
                <Input
                  value={settings.storeHours[day] ?? ""}
                  onChange={(e) => updateStoreHours(day, e.target.value)}
                  className="w-40"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Change Password</CardTitle>
          </div>
          <CardDescription>
            Update your account password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
          <Button>Update Password</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Add an extra layer of security to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">2FA via Authenticator App</p>
              <p className="text-xs text-muted-foreground">
                Not enabled yet
              </p>
            </div>
            <Button variant="outline" size="sm">
              Enable
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base text-destructive">
              Danger Zone
            </CardTitle>
          </div>
          <CardDescription>
            Irreversible actions for your store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4">
            <div>
              <p className="text-sm font-medium">Deactivate Store</p>
              <p className="text-xs text-muted-foreground">
                Permanently deactivate your store and remove all listings.
              </p>
            </div>
            <Button variant="destructive">Deactivate</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
