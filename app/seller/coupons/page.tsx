"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, TicketPercent, Copy, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table"
import {
  Card,
  CardContent,
} from "../../../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "../../../components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters"),
  discountType: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().min(1, "Value must be greater than 0"),
  minPurchase: z.coerce.number().min(0).optional(),
  maxUses: z.coerce.number().int().min(1).optional(),
  expiresAt: z.string().min(1, "Expiry date is required"),
})

type CouponFormData = z.infer<typeof couponSchema>

interface Coupon {
  id: string
  code: string
  type: "percentage" | "fixed"
  value: number
  min_subtotal_minor: number
  usage_limit: number | null
  used_count: number
  ends_at: string | null
  is_active: boolean
  created_at: string
}

function getCouponStatus(coupon: Coupon): "Active" | "Expired" | "Disabled" {
  if (!coupon.is_active) return "Disabled"
  if (coupon.ends_at && new Date(coupon.ends_at) < new Date()) return "Expired"
  return "Active"
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      discountType: "percentage",
      minPurchase: 0,
    },
  })

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch("/api/seller/coupons")
      if (res.ok) {
        const data = await res.json()
        setCoupons(data.coupons || [])
      }
    } catch (err) {
      console.error("Failed to fetch coupons:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCoupons()
  }, [fetchCoupons])

  async function onSubmit(data: CouponFormData) {
    setCreating(true)
    try {
      const res = await fetch("/api/seller/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: data.code,
          type: data.discountType,
          value: data.discountType === "percentage" ? data.value : data.value * 100,
          min_subtotal_minor: (data.minPurchase || 0) * 100,
          usage_limit: data.maxUses || null,
          ends_at: data.expiresAt || null,
        }),
      })
      if (res.ok) {
        const coupon = await res.json()
        setCoupons((prev) => [coupon, ...prev])
        reset()
        setOpen(false)
      }
    } catch (err) {
      console.error("Failed to create coupon:", err)
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/seller/coupons/${id}`, { method: "DELETE" })
    if (res.ok) {
      setCoupons((prev) => prev.filter((c) => c.id !== id))
    }
  }

  async function handleDuplicate(coupon: Coupon) {
    const res = await fetch("/api/seller/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: `${coupon.code}-COPY`,
        type: coupon.type,
        value: coupon.type === "fixed" ? coupon.value / 100 : coupon.value,
        min_subtotal_minor: coupon.min_subtotal_minor,
        usage_limit: coupon.usage_limit,
        ends_at: coupon.ends_at,
      }),
    })
    if (res.ok) {
      const newCoupon = await res.json()
      setCoupons((prev) => [newCoupon, ...prev])
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><div className="h-8 w-32 bg-muted rounded animate-pulse" /><div className="h-4 w-48 bg-muted rounded animate-pulse mt-2" /></div>
          <div className="h-10 w-36 bg-muted rounded animate-pulse" />
        </div>
        <Card><CardContent className="p-0">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 border-b animate-pulse" />)}</CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
          <p className="text-sm text-muted-foreground">Create and manage discount coupons.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Create Coupon</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Coupon</DialogTitle>
              <DialogDescription>Set up a new discount coupon for your customers.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code</Label>
                <Input id="code" {...register("code")} placeholder="e.g. SAVE20" />
                {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select defaultValue="percentage" onValueChange={(v) => setValue("discountType", v as "percentage" | "fixed")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed (KES)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input id="value" type="number" {...register("value")} placeholder="0" />
                  {errors.value && <p className="text-xs text-destructive">{errors.value.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="minPurchase">Min. Purchase (KES)</Label>
                  <Input id="minPurchase" type="number" {...register("minPurchase")} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Max Uses</Label>
                  <Input id="maxUses" type="number" {...register("maxUses")} placeholder="Unlimited" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiry Date</Label>
                <Input id="expiresAt" type="date" {...register("expiresAt")} />
                {errors.expiresAt && <p className="text-xs text-destructive">{errors.expiresAt.message}</p>}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create Coupon"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min. Purchase</TableHead>
                <TableHead>Usage Limit</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => {
                const status = getCouponStatus(coupon)
                return (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                    <TableCell>
                      {coupon.type === "percentage" ? `${coupon.value}%` : `KES ${(coupon.value / 100).toLocaleString()}`}
                    </TableCell>
                    <TableCell>
                      {coupon.min_subtotal_minor > 0 ? `KES ${(coupon.min_subtotal_minor / 100).toLocaleString()}` : "None"}
                    </TableCell>
                    <TableCell>{coupon.usage_limit ?? "Unlimited"}</TableCell>
                    <TableCell>{coupon.used_count}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {coupon.ends_at ? new Date(coupon.ends_at).toLocaleDateString() : "No expiry"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status === "Active" ? "default" : status === "Expired" ? "secondary" : "destructive"}>
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Actions</span></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDuplicate(coupon)}>
                            <Copy className="mr-2 h-4 w-4" />Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(coupon.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
              {coupons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    <TicketPercent className="mx-auto mb-2 h-8 w-8" />
                    No coupons created yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
