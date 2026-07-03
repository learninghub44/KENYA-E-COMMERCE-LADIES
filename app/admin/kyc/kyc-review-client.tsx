"use client"

import { useState } from "react"
import { CheckCircle, XCircle, FileText, Clock, Store, User } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Avatar, AvatarFallback } from "../../../components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog"
import { Textarea } from "../../../components/ui/textarea"
import { Label } from "../../../components/ui/label"

interface KycItem {
  id: string
  seller_id: string
  provider: string
  provider_reference: string | null
  status: string
  submitted_at: string
  reviewed_at: string | null
  rejection_reason: string | null
  metadata: Record<string, unknown>
  sellers: {
    id: string
    store_name: string
    slug: string
    status: string
    kyc_status: string
    created_at: string
    profiles: {
      id: string
      display_name: string | null
      email: string | null
    } | null
  } | null
}

export function KycReviewClient({
  verifications,
  formatDate: formatDateFn,
  kycVariant,
}: {
  verifications: KycItem[]
  formatDate: (v: string) => string
  kycVariant: Record<string, "default" | "secondary" | "destructive" | "outline">
}) {
  const [selected, setSelected] = useState<KycItem | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: "approve" | "reject") => {
    if (!selected) return
    if (action === "reject" && !rejectReason.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/admin/kyc", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationId: selected.id,
          action,
          rejectionReason: action === "reject" ? rejectReason.trim() : undefined,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Action failed")
      window.location.reload()
    } catch {
      setLoading(false)
    }
  }

  const openReview = (item: KycItem) => {
    setSelected(item)
    setRejectReason("")
    setReviewDialogOpen(true)
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Seller</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {verifications.map((v) => (
            <TableRow key={v.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{v.sellers?.store_name ?? "Unknown Store"}</p>
                    <p className="text-xs text-muted-foreground">{v.sellers?.slug}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback>{(v.sellers?.profiles?.display_name ?? v.sellers?.profiles?.email ?? "?")?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{v.sellers?.profiles?.display_name ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{v.sellers?.profiles?.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm capitalize">{v.provider}</span>
              </TableCell>
              <TableCell>
                <Badge variant={kycVariant[v.status] ?? "outline"}>
                  {v.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">{formatDateFn(v.submitted_at)}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => openReview(v)}>
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Review KYC Verification</DialogTitle>
            <DialogDescription>
              Review seller identity documents and approve or reject.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg border">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{(selected.sellers?.profiles?.display_name ?? selected.sellers?.profiles?.email ?? "?")?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selected.sellers?.store_name}</h3>
                  <p className="text-sm text-muted-foreground">{selected.sellers?.profiles?.display_name} &middot; {selected.sellers?.profiles?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">KYC Status</p>
                  <Badge variant={kycVariant[selected.status] ?? "outline"} className="mt-1">
                    {selected.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Provider</p>
                  <p className="text-sm font-medium capitalize mt-1">{selected.provider}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="text-sm mt-1">{formatDateFn(selected.submitted_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Seller Status</p>
                  <p className="text-sm capitalize mt-1">{selected.sellers?.status}</p>
                </div>
              </div>

              {selected.rejection_reason && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-xs font-medium text-destructive">Rejection Reason</p>
                  <p className="text-sm mt-1">{selected.rejection_reason}</p>
                </div>
              )}

              {selected.status === "pending" || selected.status === "manual_review" ? (
                <>
                  <div className="border-t pt-4">
                    <Label htmlFor="reject-reason">Rejection Reason (required if rejecting)</Label>
                    <Textarea
                      id="reject-reason"
                      placeholder="Provide a reason if rejecting..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => handleAction("approve")}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleAction("reject")}
                      disabled={loading || !rejectReason.trim()}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <DialogFooter>
                  <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
