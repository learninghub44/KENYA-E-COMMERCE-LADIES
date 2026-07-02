"use client"

import { useState } from "react"
import { Plus, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Badge } from "../../../components/ui/badge"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog"

interface Notification {
  id: string
  title: string
  message: string
  audience: string
  status: "Sent" | "Scheduled" | "Draft"
  sentAt: string
}

const initialNotifications: Notification[] = [
  { id: "n1", title: "Welcome to the Platform", message: "Thank you for joining Zuri Market!", audience: "All Users", status: "Sent", sentAt: "2025-06-30 10:00" },
  { id: "n2", title: "New Seller Guidelines", message: "Please review the updated seller guidelines.", audience: "Sellers", status: "Sent", sentAt: "2025-06-28 14:30" },
  { id: "n3", title: "Flash Sale Announcement", message: "Get ready for the weekend flash sale!", audience: "All Users", status: "Scheduled", sentAt: "2025-07-01 08:00" },
  { id: "n4", title: "KYC Reminder", message: "Complete your KYC verification to start selling.", audience: "Sellers", status: "Draft", sentAt: "" },
]

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  Sent: "default",
  Scheduled: "secondary",
  Draft: "outline",
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [audience, setAudience] = useState("All")

  const handleSend = () => {
    if (!title || !message) return
    const newNotification: Notification = {
      id: `n${Date.now()}`,
      title,
      message,
      audience: audience === "All" ? "All Users" : audience === "Users" ? "All Users" : "Sellers",
      status: "Sent",
      sentAt: new Date().toLocaleString("en-KE"),
    }
    setNotifications((prev) => [newNotification, ...prev])
    setTitle("")
    setMessage("")
    setAudience("All")
    setDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">Create and manage platform notifications</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Notification</DialogTitle>
              <DialogDescription>Send a notification to platform users</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Notification title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Notification message" value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger id="audience">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Users</SelectItem>
                    <SelectItem value="Users">Buyers Only</SelectItem>
                    <SelectItem value="Sellers">Sellers Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSend}>
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-medium">{n.title}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{n.message}</TableCell>
                  <TableCell>{n.audience}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[n.status]}>{n.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{n.sentAt || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
