"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { MapPin, Plus, Pencil, Trash2, Star } from "lucide-react"

import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card"
import { Badge } from "../../../../components/ui/badge"
import { Separator } from "../../../../components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog"
import { Breadcrumbs } from "../../../../components/shared/breadcrumbs"

const addressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(3, "ZIP code is required"),
})

type AddressFormData = z.infer<typeof addressSchema>

interface Address {
  id: string
  name: string
  phone: string
  street: string
  city: string
  state: string
  zip: string
  isDefault: boolean
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  })

  const openAddDialog = () => {
    setEditingId(null)
    reset({ name: "", phone: "", street: "", city: "", state: "", zip: "" })
    setIsDialogOpen(true)
  }

  const openEditDialog = (address: Address) => {
    setEditingId(address.id)
    reset({
      name: address.name,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
    })
    setIsDialogOpen(true)
  }

  const onSubmit = (data: AddressFormData) => {
    if (editingId) {
      setAddresses((prev) =>
        prev.map((a) => (a.id === editingId ? { ...a, ...data } : a))
      )
    } else {
      const newAddress: Address = {
        id: String(Date.now()),
        ...data,
        isDefault: addresses.length === 0,
      }
      setAddresses((prev) => [...prev, newAddress])
    }
    setIsDialogOpen(false)
  }

  const deleteAddress = (id: string) => {
    setAddresses((prev) => {
      const filtered = prev.filter((a) => a.id !== id)
      const deleted = prev.find((a) => a.id === id)
      if (deleted?.isDefault && filtered.length > 0 && filtered[0]) {
        filtered[0].isDefault = true
      }
      return filtered
    })
  }

  const setAsDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
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
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
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
                <Label htmlFor="street">Street Address</Label>
                <Input id="street" {...register("street")} />
                {errors.street && (
                  <p className="text-xs text-destructive">
                    {errors.street.message}
                  </p>
                )}
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
                  <Label htmlFor="state">State</Label>
                  <Input id="state" {...register("state")} />
                  {errors.state && (
                    <p className="text-xs text-destructive">
                      {errors.state.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP</Label>
                  <Input id="zip" {...register("zip")} />
                  {errors.zip && (
                    <p className="text-xs text-destructive">
                      {errors.zip.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingId ? "Save Changes" : "Add Address"}
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
                    <span className="font-medium">{address.name}</span>
                  </div>
                  {address.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="mr-1 h-3 w-3 fill-current" />
                      Default
                    </Badge>
                  )}
                </div>
                <div className="mb-4 space-y-1 text-sm text-muted-foreground">
                  <p>{address.street}</p>
                  <p>
                    {address.city}, {address.state} {address.zip}
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
                  {!address.isDefault && (
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
