"use client"

import { useState } from "react"
import { Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Separator } from "../../../components/ui/separator"
import { Switch } from "../../../components/ui/switch"
import { Badge } from "../../../components/ui/badge"

export default function SettingsPage() {
  const [siteName, setSiteName] = useState("Zuri Market")
  const [siteDescription, setSiteDescription] = useState("Zuri Market is Kenya's multi-vendor marketplace for women's fashion, beauty, skincare, wellness, accessories, and lifestyle products from verified sellers.")
  const [platformFee, setPlatformFee] = useState("5")
  const [fixedFee, setFixedFee] = useState("50")
  const [senderName, setSenderName] = useState("Zuri Market")
  const [senderEmail, setSenderEmail] = useState("noreply@zurimarket.dev")
  const [minPasswordLength, setMinPasswordLength] = useState("8")
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5")
  const [sessionDuration, setSessionDuration] = useState("24")
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-sm text-muted-foreground">Manage global platform configuration</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          {saved ? "Saved!" : "Save Changes"}
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
              <Input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDesc">Site Description</Label>
              <Input id="siteDesc" value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input id="logo" placeholder="/logo.png" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="favicon">Favicon URL</Label>
              <Input id="favicon" placeholder="/favicon.ico" />
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
              <Input id="platformFee" type="number" value={platformFee} onChange={(e) => setPlatformFee(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fixedFee">Fixed Fee per Order (KES)</Label>
              <Input id="fixedFee" type="number" value={fixedFee} onChange={(e) => setFixedFee(e.target.value)} />
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
              <Input id="senderName" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderEmail">Sender Email</Label>
              <Input id="senderEmail" type="email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} />
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
              <Input id="minPassword" type="number" value={minPasswordLength} onChange={(e) => setMinPasswordLength(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxLogin">Max Login Attempts</Label>
              <Input id="maxLogin" type="number" value={maxLoginAttempts} onChange={(e) => setMaxLoginAttempts(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionDuration">Session Duration (hours)</Label>
              <Input id="sessionDuration" type="number" value={sessionDuration} onChange={(e) => setSessionDuration(e.target.value)} />
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
              <Badge variant={maintenanceMode ? "destructive" : "secondary"}>
                {maintenanceMode ? "Active" : "Inactive"}
              </Badge>
              <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
