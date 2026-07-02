"use client"

import { useState } from "react"
import { Plus, Settings2, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import { Switch } from "../../../../components/ui/switch"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Separator } from "../../../../components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog"

interface FeatureFlag {
  id: string
  key: string
  description: string
  enabled: boolean
  defaultValue: boolean
  rolloutPercentage: number
}

const initialFlags: FeatureFlag[] = [
  { id: "f1", key: "new_checkout_flow", description: "Enable the new streamlined checkout experience", enabled: true, defaultValue: false, rolloutPercentage: 100 },
  { id: "f2", key: "seller_analytics_dashboard", description: "Show analytics dashboard for sellers", enabled: true, defaultValue: false, rolloutPercentage: 80 },
  { id: "f3", key: "ai_product_recommendations", description: "AI-powered product recommendations on homepage", enabled: false, defaultValue: false, rolloutPercentage: 0 },
  { id: "f4", key: "social_login", description: "Enable social media login (Google, Facebook)", enabled: true, defaultValue: true, rolloutPercentage: 50 },
  { id: "f5", key: "live_chat_support", description: "Real-time chat support for customers", enabled: false, defaultValue: false, rolloutPercentage: 0 },
  { id: "f6", key: "dark_mode_toggle", description: "Allow users to switch to dark mode", enabled: true, defaultValue: true, rolloutPercentage: 100 },
  { id: "f7", key: "flash_sale_module", description: "Enable flash sale event functionality", enabled: false, defaultValue: false, rolloutPercentage: 0 },
]

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState(initialFlags)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null)
  const [newKey, setNewKey] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newDefaultValue, setNewDefaultValue] = useState(false)

  const toggleFlag = (id: string) => {
    setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)))
  }

  const createFlag = () => {
    if (!newKey) return
    const flag: FeatureFlag = {
      id: `f${Date.now()}`,
      key: newKey,
      description: newDescription,
      enabled: false,
      defaultValue: newDefaultValue,
      rolloutPercentage: 0,
    }
    setFlags((prev) => [...prev, flag])
    setNewKey("")
    setNewDescription("")
    setNewDefaultValue(false)
    setDialogOpen(false)
  }

  const openEdit = (flag: FeatureFlag) => {
    setEditingFlag({ ...flag })
    setEditDialogOpen(true)
  }

  const saveEdit = () => {
    if (!editingFlag) return
    setFlags((prev) => prev.map((f) => (f.id === editingFlag.id ? editingFlag : f)))
    setEditDialogOpen(false)
    setEditingFlag(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feature Flags</h1>
          <p className="text-sm text-muted-foreground">Manage platform feature flags and rollouts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Flag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Feature Flag</DialogTitle>
              <DialogDescription>Add a new feature flag to the platform</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key">Flag Key</Label>
                <Input id="key" placeholder="e.g. new_feature_name" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Input id="desc" placeholder="Describe the feature flag" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={newDefaultValue} onCheckedChange={setNewDefaultValue} id="defaultVal" />
                <Label htmlFor="defaultVal">Default enabled</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={createFlag}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Flags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {flags.map((flag) => (
            <div key={flag.id}>
              <div className="flex items-center justify-between py-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-muted px-2 py-0.5 text-sm font-mono">{flag.key}</code>
                    <Badge variant={flag.enabled ? "default" : "secondary"}>{flag.enabled ? "Enabled" : "Disabled"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{flag.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Default: {flag.defaultValue ? "true" : "false"} &middot; Rollout: {flag.rolloutPercentage}%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {flag.rolloutPercentage < 100 && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {flag.rolloutPercentage}%
                    </span>
                  )}
                  <Switch checked={flag.enabled} onCheckedChange={() => toggleFlag(flag.id)} />
                  <Button variant="ghost" size="icon" onClick={() => openEdit(flag)}>
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Separator />
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Feature Flag</DialogTitle>
            <DialogDescription>Modify the feature flag configuration</DialogDescription>
          </DialogHeader>
          {editingFlag && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Flag Key</Label>
                <Input value={editingFlag.key} onChange={(e) => setEditingFlag({ ...editingFlag, key: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={editingFlag.description} onChange={(e) => setEditingFlag({ ...editingFlag, description: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editingFlag.defaultValue} onCheckedChange={(v) => setEditingFlag({ ...editingFlag, defaultValue: v })} />
                <Label>Default enabled</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editingFlag.enabled} onCheckedChange={(v) => setEditingFlag({ ...editingFlag, enabled: v })} />
                <Label>Currently enabled</Label>
              </div>
              <div className="space-y-2">
                <Label>Rollout Percentage ({editingFlag.rolloutPercentage}%)</Label>
                <Input
                  type="range"
                  min={0}
                  max={100}
                  value={editingFlag.rolloutPercentage}
                  onChange={(e) => setEditingFlag({ ...editingFlag, rolloutPercentage: Number(e.target.value) })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
