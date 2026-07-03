"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal, CheckCircle, XCircle, Eye, Store, FileText, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"
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

interface SellerRow {
  id: string
  store_name: string
  slug: string
  status: string
  kyc_status: string
  owner_id: string
  default_currency: string
  created_at: string
  profiles: { id: string; display_name: string | null; email: string | null } | null
}

const kycVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  approved: "default",
  pending: "secondary",
  manual_review: "outline",
  rejected: "destructive",
  not_started: "outline",
  expired: "secondary",
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  approved: "default",
  pending: "outline",
  draft: "outline",
  under_review: "secondary",
  rejected: "destructive",
  suspended: "secondary",
  inactive: "secondary",
  closed: "destructive",
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-KE", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value))
}

export function SellersClient({
  initialSellers,
  totalPages,
  currentPage,
  q,
  statusFilter,
  kycFilter,
}: {
  initialSellers: SellerRow[]
  totalPages: number
  currentPage: number
  q?: string
  statusFilter?: string
  kycFilter?: string
}) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectSellerId, setRejectSellerId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [loading, setLoading] = useState(false)

  const handleKycAction = async (sellerId: string, action: "approve" | "reject", reason?: string) => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/kyc", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationId: sellerId, action, rejectionReason: reason }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Action failed")
      window.location.reload()
    } catch {
      setLoading(false)
    }
  }

  const openReject = (sellerId: string) => {
    setRejectSellerId(sellerId)
    setRejectReason("")
    setRejectDialogOpen(true)
  }

  const confirmReject = async () => {
    if (!rejectSellerId || !rejectReason.trim()) return
    await handleKycAction(rejectSellerId, "reject", rejectReason.trim())
  }

  const pageUrl = (page: number) => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (statusFilter) params.set("status", statusFilter)
    if (kycFilter) params.set("kycStatus", kycFilter)
    if (page > 1) params.set("page", String(page))
    const qs = params.toString()
    return qs ? `/admin/sellers?${qs}` : "/admin/sellers"
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Store</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>KYC</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialSellers.map((seller) => (
            <TableRow key={seller.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{seller.store_name}</p>
                    <p className="text-xs text-muted-foreground">{seller.slug}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className="font-medium">{seller.profiles?.display_name ?? "Unknown"}</p>
                <p className="text-xs text-muted-foreground">{seller.profiles?.email}</p>
              </TableCell>
              <TableCell>
                <Badge variant={kycVariant[seller.kyc_status] ?? "outline"}>
                  {seller.kyc_status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant[seller.status] ?? "outline"}>{seller.status}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(seller.created_at)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={loading}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {seller.kyc_status === "pending" || seller.kyc_status === "manual_review" ? (
                      <>
                        <DropdownMenuItem onClick={() => handleKycAction(seller.id, "approve")}>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Approve KYC
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openReject(seller.id)}>
                          <XCircle className="mr-2 h-4 w-4 text-destructive" /> Reject KYC
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    ) : null}
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      <Link href={`/sellers/${seller.slug}`} className="flex-1">View Store</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" /> View Documents
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {initialSellers.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                No sellers found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" disabled={currentPage <= 1} asChild={currentPage > 1}>
              {currentPage > 1 ? (
                <Link href={pageUrl(currentPage - 1)}><ChevronLeft className="h-4 w-4" /></Link>
              ) : (
                <span><ChevronLeft className="h-4 w-4" /></span>
              )}
            </Button>
            <Button variant="outline" size="icon" disabled={currentPage >= totalPages} asChild={currentPage < totalPages}>
              {currentPage < totalPages ? (
                <Link href={pageUrl(currentPage + 1)}><ChevronRight className="h-4 w-4" /></Link>
              ) : (
                <span><ChevronRight className="h-4 w-4" /></span>
              )}
            </Button>
          </div>
        </div>
      )}

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC</DialogTitle>
            <DialogDescription>Provide a reason for rejecting this seller&apos;s KYC verification.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Explain why the KYC is being rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmReject} disabled={!rejectReason.trim() || loading}>
              Reject KYC
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
