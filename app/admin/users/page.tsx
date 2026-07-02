"use client"

import { useState } from "react"
import {
  Search,
  MoreHorizontal,
  Eye,
  ShieldAlert,
  Ban,
  UserPlus,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Badge } from "../../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
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
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog"

interface User {
  id: string
  name: string
  email: string
  role: "Buyer" | "Seller" | "Admin"
  status: "Active" | "Suspended" | "Banned"
  orders: number
  joined: string
  avatar: string
}

const allUsers: User[] = [
  { id: "1", name: "Jane Wanjiku", email: "jane@example.com", role: "Buyer", status: "Active", orders: 12, joined: "2025-01-15", avatar: "JW" },
  { id: "2", name: "Achieng Omondi", email: "achieng@example.com", role: "Seller", status: "Active", orders: 0, joined: "2025-02-20", avatar: "AO" },
  { id: "3", name: "Faith Nyambura", email: "faith@example.com", role: "Buyer", status: "Suspended", orders: 3, joined: "2025-03-10", avatar: "FN" },
  { id: "4", name: "Grace Akinyi", email: "grace@example.com", role: "Seller", status: "Active", orders: 0, joined: "2025-03-22", avatar: "GA" },
  { id: "5", name: "Mary Wambui", email: "mary@example.com", role: "Buyer", status: "Banned", orders: 1, joined: "2025-04-01", avatar: "MW" },
  { id: "6", name: "Sarah Chelangat", email: "sarah@example.com", role: "Admin", status: "Active", orders: 0, joined: "2025-04-15", avatar: "SC" },
  { id: "7", name: "Esther Nyambura", email: "esther@example.com", role: "Buyer", status: "Active", orders: 8, joined: "2025-05-01", avatar: "EN" },
  { id: "8", name: "Nancy Wairimu", email: "nancy@example.com", role: "Seller", status: "Pending", orders: 0, joined: "2025-05-20", avatar: "NW" },
]

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Active: "default",
  Suspended: "secondary",
  Banned: "destructive",
  Pending: "outline",
}

const roleVariant: Record<string, "default" | "secondary" | "outline"> = {
  Admin: "default",
  Seller: "secondary",
  Buyer: "outline",
}

const ITEMS_PER_PAGE = 5

export default function UsersPage() {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("All")
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = allUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === "All" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground">Manage platform users and their roles</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Users</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-9 w-64"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                />
              </div>
              <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1) }}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Roles</SelectItem>
                  <SelectItem value="Buyer">Buyer</SelectItem>
                  <SelectItem value="Seller">Seller</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleVariant[user.role]}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[user.status]}>{user.status}</Badge>
                  </TableCell>
                  <TableCell>{user.orders}</TableCell>
                  <TableCell className="text-muted-foreground">{user.joined}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedUser(user); setDialogOpen(true) }}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ShieldAlert className="mr-2 h-4 w-4" /> Suspend
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Ban className="mr-2 h-4 w-4" /> Ban
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <UserPlus className="mr-2 h-4 w-4" /> Promote to Seller
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ShieldCheck className="mr-2 h-4 w-4" /> Make Admin
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Detailed information about {selectedUser?.name}</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>{selectedUser.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Badge variant={roleVariant[selectedUser.role]}>{selectedUser.role}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={statusVariant[selectedUser.status]}>{selectedUser.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Orders</p>
                  <p className="font-medium">{selectedUser.orders}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">{selectedUser.joined}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
