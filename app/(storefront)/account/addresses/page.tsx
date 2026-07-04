"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { MapPin, Plus, Pencil, Trash2, Star, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import {
  Card,
  CardContent,
} from "../../../../components/ui/card"
import { Badge } from "../../../../components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog"
import { Breadcrumbs } from "../../../../components/shared/breadcrumbs"
import { useAuth } from "../../../../lib/auth/auth-context"

const addressSchema = z.object({
  recipient_name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  line1: z.string().min(5, "Street address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  region: z.string().min(1, "State is required"),
  postal_code: z.string().min(3, "ZIP code is required"),
  label: z.string().optional(),
})

type AddressFormData = z.infer<typeof addressSchema>

interface Address {
  id: string
  recipient_name: string
  phone: string
  line1: string
  line2: string | null
  city: string
  region: string | null
  postal_code: string | null
  label: string | null
  country_code: string
  is_default_shipping: boolean
  is_default_billing: boolean
  created_at: string
  updated_at: string
}

export default function AddressesPage() {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  })

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch("/api/account/addresses")
      if (!res.ok) throw new Error("Failed to load addresses")
      const data = await res.json()
      setAddresses(data)
    } catch {
      toast.error("Failed to load addresses")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) fetchAddresses()
  }, [user, fetchAddresses])

  const openAddDialog = () => {
    setEditingId(null)
    reset({
      recipient_name: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      region: "",
      postal_code: "",
      label: "",
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (address: Address) => {
    setEditingId(address.id)
    reset({
      recipient_name: address.recipient_name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      region: address.region ?? "",
      postal_code: address.postal_code ?? "",
      label: address.label ?? "",
    })
    setIsDialogOpen(true)
  }

  const onSubmit = async (data: AddressFormData) => {
    setIsSaving(true)
    try {
      if (editingId) {
        const res = await fetch(`/api/account/addresses/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error("Failed to update address")
        toast.success("Address updated")
      } else {
        const res = await fetch("/api/account/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            is_default_shipping: addresses.length === 0,
            is_default_billing: addresses.length === 0,
          }),
        })
        if (!res.ok) throw new Error("Failed to add address")
        toast.success("Address added")
      }
      await fetchAddresses()
      setIsDialogOpen(false)
    } catch {
      toast.error(editingId ? "Failed to update address" : "Failed to add address")
    } finally {
      setIsSaving(false)
    }
  }

  const deleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete address")
      toast.success("Address deleted")
      await fetchAddresses()
    } catch {
      toast.error("Failed to delete address")
    }
  }

  const setAsDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_default_shipping: true }),
      })
      if (!res.ok) throw new Error("Failed to set default")
      toast.success("Default address updated")
      await fetchAddresses()
    } catch {
      toast.error("Failed to set default address")
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My Account", href: "/account" },
          { label: "Addresses" },
        ]}
      />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Addresses</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Address" : "Add New Address"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient_name">Full Name</Label>
                <Input id="recipient_name" {...register("recipient_name")} />
                {errors.recipient_name && (
                  <p className="text-xs text-destructive">
                    {errors.recipient_name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" {...register("phone")} />
                {errors.phone && (
                  <p className="text-xs text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="line1">Street Address</Label>
                <Input id="line1" {...register("line1")} />
                {errors.line1 && (
                  <p className="text-xs text-destructive">
                    {errors.line1.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="line2">Apartment, Suite, etc. (optional)</Label>
                <Input id="line2" {...register("line2")} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register("city")} />
                  {errors.city && (
                    <p className="text-xs text-destructive">
                      {errors.city.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">State</Label>
                  <Input id="region" {...register("region")} />
                  {errors.region && (
                    <p className="text-xs text-destructive">
                      {errors.region.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">ZIP</Label>
                  <Input id="postal_code" {...register("postal_code")} />
                  {errors.postal_code && (
                    <p className="text-xs text-destructive">
                      {errors.postal_code.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="label">Label (optional)</Label>
                <Input id="label" placeholder="e.g. Home, Work" {...register("label")} />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : editingId ? "Save Changes" : "Add Address"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-1 text-lg font-semibold">No addresses saved</h3>
          <p className="mb-6 text-sm text-muted-foreground">
            Add an address for faster checkout.
          </p>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Address
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardContent className="p-6">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="font-medium">
                      {address.label || address.recipient_name}
                    </span>
                  </div>
                  {address.is_default_shipping && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="mr-1 h-3 w-3 fill-current" />
                      Default
                    </Badge>
                  )}
                </div>
                <div className="mb-4 space-y-1 text-sm text-muted-foreground">
                  <p>{address.recipient_name}</p>
                  <p>{address.line1}</p>
                  {address.line2 && <p>{address.line2}</p>}
                  <p>
                    {address.city}
                    {address.region ? `, ${address.region}` : ""}
                    {address.postal_code ? ` ${address.postal_code}` : ""}
                  </p>
                  <p>{address.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(address)}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteAddress(address.id)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                  {!address.is_default_shipping && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAsDefault(address.id)}
                    >
                      Set as Default
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
