"use client"

import { useState, useEffect, useCallback } from "react"
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

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null)
  const [newKey, setNewKey] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newDefaultValue, setNewDefaultValue] = useState(false)

  const fetchFlags = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/feature-flags")
      if (res.ok) {
        const data = await res.json()
        setFlags(data.flags)
      }
    } catch {
      // Ignore fetch errors
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFlags()
  }, [fetchFlags])

  const toggleFlag = async (flag: FeatureFlag) => {
    const updated = { ...flag, enabled: !flag.enabled }
    setFlags((prev) => prev.map((f) => (f.id === flag.id ? updated : f)))
    try {
      await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: flag.key, description: flag.description, enabled: updated.enabled }),
      })
    } catch {
      setFlags((prev) => prev.map((f) => (f.id === flag.id ? flag : f)))
    }
  }

  const createFlag = async () => {
    if (!newKey) return
    try {
      const res = await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: newKey,
          description: newDescription,
          enabled: false,
          defaultValue: newDefaultValue,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setFlags((prev) => [...prev, data.flag])
      }
    } catch {
      // Ignore
    }
    setNewKey("")
    setNewDescription("")
    setNewDefaultValue(false)
    setDialogOpen(false)
  }

  const openEdit = (flag: FeatureFlag) => {
    setEditingFlag({ ...flag })
    setEditDialogOpen(true)
  }

  const saveEdit = async () => {
    if (!editingFlag) return
    setFlags((prev) => prev.map((f) => (f.id === editingFlag.id ? editingFlag : f)))
    try {
      await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: editingFlag.key,
          description: editingFlag.description,
          enabled: editingFlag.enabled,
          defaultValue: editingFlag.defaultValue,
        }),
      })
    } catch {
      // Ignore
    }
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
          {loading && (
            <p className="text-sm text-muted-foreground">Loading feature flags...</p>
          )}
          {!loading && flags.length === 0 && (
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">No feature flags configured</p>
                <p className="text-xs text-muted-foreground">Create a flag to get started</p>
              </div>
            </div>
          )}
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
                  <Switch checked={flag.enabled} onCheckedChange={() => toggleFlag(flag)} />
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
