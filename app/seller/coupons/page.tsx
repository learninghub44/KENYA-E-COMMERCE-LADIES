"use client"

import { useState } from "react"
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
  CardHeader,
  CardTitle,
  CardDescription,
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
  discountType: "percentage" | "fixed"
  value: number
  minPurchase: number
  maxUses: number | null
  used: number
  expiresAt: string
  status: "Active" | "Expired" | "Disabled"
}

const mockCoupons: Coupon[] = [
  {
    id: "1",
    code: "WELCOME20",
    discountType: "percentage",
    value: 20,
    minPurchase: 2000,
    maxUses: 100,
    used: 45,
    expiresAt: "2025-03-01",
    status: "Active",
  },
  {
    id: "2",
    code: "FLAT500",
    discountType: "fixed",
    value: 500,
    minPurchase: 3000,
    maxUses: 50,
    used: 12,
    expiresAt: "2025-02-15",
    status: "Active",
  },
  {
    id: "3",
    code: "SUMMER15",
    discountType: "percentage",
    value: 15,
    minPurchase: 1500,
    maxUses: null,
    used: 78,
    expiresAt: "2024-12-31",
    status: "Expired",
  },
  {
    id: "4",
    code: "VIP1000",
    discountType: "fixed",
    value: 1000,
    minPurchase: 8000,
    maxUses: 20,
    used: 20,
    expiresAt: "2025-06-01",
    status: "Disabled",
  },
]

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons)
  const [open, setOpen] = useState(false)

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

  function onSubmit(data: CouponFormData) {
    const newCoupon: Coupon = {
      id: crypto.randomUUID(),
      code: data.code,
      discountType: data.discountType,
      value: data.value,
      minPurchase: data.minPurchase ?? 0,
      maxUses: data.maxUses ?? null,
      used: 0,
      expiresAt: data.expiresAt,
      status: "Active",
    }
    setCoupons((prev) => [newCoupon, ...prev])
    reset()
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage discount coupons.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Coupon</DialogTitle>
              <DialogDescription>
                Set up a new discount coupon for your customers.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code</Label>
                <Input id="code" {...register("code")} placeholder="e.g. SAVE20" />
                {errors.code && (
                  <p className="text-xs text-destructive">{errors.code.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select
                    defaultValue="percentage"
                    onValueChange={(v) =>
                      setValue("discountType", v as "percentage" | "fixed")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed (KES)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input id="value" type="number" {...register("value")} placeholder="0" />
                  {errors.value && (
                    <p className="text-xs text-destructive">{errors.value.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="minPurchase">Min. Purchase (KES)</Label>
                  <Input
                    id="minPurchase"
                    type="number"
                    {...register("minPurchase")}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Max Uses</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    {...register("maxUses")}
                    placeholder="Unlimited"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiry Date</Label>
                <Input id="expiresAt" type="date" {...register("expiresAt")} />
                {errors.expiresAt && (
                  <p className="text-xs text-destructive">{errors.expiresAt.message}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit">Create Coupon</Button>
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
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-medium">
                    {coupon.code}
                  </TableCell>
                  <TableCell>
                    {coupon.discountType === "percentage"
                      ? `${coupon.value}%`
                      : `KES ${coupon.value.toLocaleString()}`}
                  </TableCell>
                  <TableCell>
                    {coupon.minPurchase > 0
                      ? `KES ${coupon.minPurchase.toLocaleString()}`
                      : "None"}
                  </TableCell>
                  <TableCell>
                    {coupon.maxUses ?? "Unlimited"}
                  </TableCell>
                  <TableCell>{coupon.used}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {coupon.expiresAt}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        coupon.status === "Active"
                          ? "default"
                          : coupon.status === "Expired"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {coupon.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {coupons.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-12 text-center text-muted-foreground"
                  >
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
