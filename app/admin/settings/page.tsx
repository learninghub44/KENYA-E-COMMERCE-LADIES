"use client"

import { useState, useEffect } from "react"
import { Save, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Switch } from "../../../components/ui/switch"
import { Badge } from "../../../components/ui/badge"
import { Skeleton } from "../../../components/ui/skeleton"

interface Settings {
  site_name: string
  site_description: string
  platform_fee_percent: number
  fixed_fee_per_order: number
  sender_name: string
  sender_email: string
  min_password_length: number
  max_login_attempts: number
  session_duration_hours: number
  maintenance_mode: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/settings")
        if (!res.ok) throw new Error("Failed to fetch settings")
        const json = await res.json()
        setSettings(json.settings)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load settings")
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to save")
      }
      toast.success("Settings saved successfully")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
  }

  if (loading || !settings) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-sm text-muted-foreground">Manage global platform configuration</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" value={settings.site_name} onChange={(e) => update("site_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDesc">Site Description</Label>
              <Input id="siteDesc" value={settings.site_description} onChange={(e) => update("site_description", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="platformFee">Platform Fee (%)</Label>
              <Input id="platformFee" type="number" value={settings.platform_fee_percent} onChange={(e) => update("platform_fee_percent", Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fixedFee">Fixed Fee per Order (KES)</Label>
              <Input id="fixedFee" type="number" value={settings.fixed_fee_per_order} onChange={(e) => update("fixed_fee_per_order", Number(e.target.value))} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="senderName">Sender Name</Label>
              <Input id="senderName" value={settings.sender_name} onChange={(e) => update("sender_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderEmail">Sender Email</Label>
              <Input id="senderEmail" type="email" value={settings.sender_email} onChange={(e) => update("sender_email", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="minPassword">Min Password Length</Label>
              <Input id="minPassword" type="number" value={settings.min_password_length} onChange={(e) => update("min_password_length", Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxLogin">Max Login Attempts</Label>
              <Input id="maxLogin" type="number" value={settings.max_login_attempts} onChange={(e) => update("max_login_attempts", Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionDuration">Session Duration (hours)</Label>
              <Input id="sessionDuration" type="number" value={settings.session_duration_hours} onChange={(e) => update("session_duration_hours", Number(e.target.value))} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Maintenance Mode</p>
              <p className="text-sm text-muted-foreground">When enabled, only admins can access the platform</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={settings.maintenance_mode ? "destructive" : "secondary"}>
                {settings.maintenance_mode ? "Active" : "Inactive"}
              </Badge>
              <Switch checked={settings.maintenance_mode} onCheckedChange={(v) => update("maintenance_mode", v)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
