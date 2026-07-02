"use client"

import { useState } from "react"
import {
  Bell,
  CreditCard,
  Clock,
  Lock,
  Shield,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react"

import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Switch } from "../../../components/ui/switch"
import { Separator } from "../../../components/ui/separator"
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
  { id: "payout", label: "Payouts", description: "When a payout is processed or pending" },
  { id: "kyc-update", label: "KYC Updates", description: "When your KYC status changes" },
]

export default function SettingsPage() {
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    "new-order": true,
    "order-shipped": true,
    "order-delivered": true,
    "new-review": true,
    "new-message": true,
    "low-stock": true,
    payout: false,
    "kyc-update": true,
  })

  const [showPassword, setShowPassword] = useState(false)

  function toggleNotification(id: string) {
    setNotifications((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your seller account settings.
        </p>
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
                checked={notifications[event.id] ?? false}
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
            <CardTitle className="text-base">Payment Information</CardTitle>
          </div>
          <CardDescription>
            Manage your payout methods and banking details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">M-Pesa Paybill</p>
              <p className="text-xs text-muted-foreground">
                **** **** 4567
              </p>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
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
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
              (day) => (
                <div key={day} className="flex items-center gap-4">
                  <span className="w-24 text-sm font-medium">{day}</span>
                  <Input
                    defaultValue={day === "Sunday" ? "Closed" : "09:00 - 18:00"}
                    className="w-40"
                  />
                </div>
              )
            )}
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
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
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
