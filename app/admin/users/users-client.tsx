"use client"

import { useState } from "react"
import { MoreHorizontal, Eye, ShieldAlert, Ban, UserPlus, ShieldCheck } from "lucide-react"
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

interface UserRow {
  id: string
  display_name: string | null
  email: string | null
  avatar_url: string | null
  status: string
  created_at: string
  roles: string[]
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  suspended: "secondary",
  deleted: "destructive",
}

const roleVariant: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  seller: "secondary",
  buyer: "outline",
}

async function apiAction(userId: string, action: string) {
  const res = await fetch("/api/admin/users", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, action }),
  })
  if (!res.ok) throw new Error((await res.json()).error ?? "Action failed")
  window.location.reload()
}

export function UsersClient({ initialUsers }: { initialUsers: UserRow[] }) {
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const handleAction = async (userId: string, action: string) => {
    setLoadingAction(userId + action)
    try {
      await apiAction(userId, action)
    } catch {
      setLoadingAction(null)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialUsers.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{(u.display_name ?? u.email ?? "?")?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{u.display_name ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {u.roles.map((role) => (
                    <Badge key={role} variant={roleVariant[role] ?? "outline"}>{role}</Badge>
                  ))}
                  {u.roles.length === 0 && <Badge variant="outline">buyer</Badge>}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant[u.status] ?? "outline"}>{u.status}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(u.created_at).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={loadingAction !== null}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setSelectedUser(u); setDialogOpen(true) }}>
                      <Eye className="mr-2 h-4 w-4" /> View
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {u.status !== "suspended" && (
                      <DropdownMenuItem onClick={() => handleAction(u.id, "suspend")}>
                        <ShieldAlert className="mr-2 h-4 w-4" /> Suspend
                      </DropdownMenuItem>
                    )}
                    {u.status !== "deleted" && (
                      <DropdownMenuItem className="text-destructive" onClick={() => handleAction(u.id, "ban")}>
                        <Ban className="mr-2 h-4 w-4" /> Ban
                      </DropdownMenuItem>
                    )}
                    {u.status === "suspended" && (
                      <DropdownMenuItem onClick={() => handleAction(u.id, "unsuspend")}>
                        <ShieldCheck className="mr-2 h-4 w-4" /> Unsuspend
                      </DropdownMenuItem>
                    )}
                    {!u.roles.includes("seller") && (
                      <DropdownMenuItem onClick={() => handleAction(u.id, "promote-seller")}>
                        <UserPlus className="mr-2 h-4 w-4" /> Promote to Seller
                      </DropdownMenuItem>
                    )}
                    {!u.roles.includes("admin") && (
                      <DropdownMenuItem onClick={() => handleAction(u.id, "make-admin")}>
                        <ShieldCheck className="mr-2 h-4 w-4" /> Make Admin
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {initialUsers.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {initialUsers.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground text-center">
          Showing {initialUsers.length} users
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Detailed information about {selectedUser?.display_name}</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>{(selectedUser.display_name ?? selectedUser.email ?? "?")?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.display_name ?? "Unknown"}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Roles</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedUser.roles.map((role) => (
                      <Badge key={role} variant={roleVariant[role] ?? "outline"}>{role}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={statusVariant[selectedUser.status] ?? "outline"} className="mt-1">{selectedUser.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium mt-1">
                    {new Date(selectedUser.created_at).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
