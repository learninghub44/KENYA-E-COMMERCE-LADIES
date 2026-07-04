"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Search,
  Filter,
  ChevronDown,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  User,
  Mail,
  Calendar,
  Tag,
  ArrowUpCircle,
} from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Badge } from "../../../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Textarea } from "../../../components/ui/textarea"
import { ScrollArea } from "../../../components/ui/scroll-area"
import { Separator } from "../../../components/ui/separator"

interface SupportTicket {
  id: string
  ticket_number: number
  user_id: string | null
  user_type: string
  full_name: string
  email: string
  subject: string
  description: string
  category: string
  status: string
  priority: string
  assigned_to: string | null
  order_number: string | null
  seller_name: string | null
  ai_summary: string | null
  ai_suggested_category: string | null
  ai_suggested_steps: string[] | null
  created_at: string
  updated_at: string
}

interface TicketMessage {
  id: string
  ticket_id: string
  sender_id: string | null
  sender_type: string
  message: string
  is_internal_note: boolean
  created_at: string
}

interface TicketStats {
  open: number
  inProgress: number
  resolved: number
  total: number
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  waiting_for_customer: "bg-orange-100 text-orange-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
}

const CATEGORY_LABELS: Record<string, string> = {
  account: "Account",
  orders: "Orders",
  products: "Products",
  seller_verification: "Seller Verification",
  technical_issue: "Technical Issue",
  login: "Login",
  shipping: "Shipping",
  returns: "Returns",
  marketplace_policy: "Marketplace Policy",
  security: "Security",
  general_question: "General Question",
  feature_request: "Feature Request",
  bug_report: "Bug Report",
  other: "Other",
}

export function SupportClient() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [stats, setStats] = useState<TicketStats>({ open: 0, inProgress: 0, resolved: 0, total: 0 })
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [replyText, setReplyText] = useState("")
  const [isSending, setIsSending] = useState(false)

  const fetchTickets = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (categoryFilter !== "all") params.set("category", categoryFilter)
      if (search) params.set("search", search)

      const res = await fetch(`/api/support/tickets?${params}`)
      if (res.ok) {
        const data = await res.json()
        setTickets(data.tickets)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error)
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, categoryFilter, search])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const fetchMessages = async (ticketId: string) => {
    setIsLoadingMessages(true)
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    fetchMessages(ticket.id)
  }

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return

    setIsSending(true)
    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyText,
          status: "in_progress",
        }),
      })

      if (res.ok) {
        setReplyText("")
        fetchMessages(selectedTicket.id)
        fetchTickets()
      }
    } catch (error) {
      console.error("Failed to send reply:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        fetchTickets()
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket((prev) => (prev ? { ...prev, status } : null))
        }
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
        <p className="text-muted-foreground">Manage customer support requests and inquiries</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="waiting_for_customer">Waiting for Customer</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <Tag className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Ticket List */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : tickets.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No tickets found</p>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => handleSelectTicket(ticket)}
                      className={`w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted ${
                        selectedTicket?.id === ticket.id ? "border-[#1C5C56] bg-muted" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">#{ticket.ticket_number}</span>
                            <Badge variant="outline" className={STATUS_COLORS[ticket.status]}>
                              {ticket.status.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline" className={PRIORITY_COLORS[ticket.priority]}>
                              {ticket.priority}
                            </Badge>
                          </div>
                          <p className="mt-1 truncate text-sm font-medium">{ticket.subject}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {ticket.full_name} · {ticket.email}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {CATEGORY_LABELS[ticket.category] ?? ticket.category} ·{" "}
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Ticket Detail */}
        {selectedTicket ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>#{selectedTicket.ticket_number}</CardTitle>
                <Select
                  value={selectedTicket.status}
                  onValueChange={(value) => handleUpdateStatus(selectedTicket.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting_for_customer">Waiting for Customer</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Ticket Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedTicket.full_name}</span>
                  <Badge variant="outline">{selectedTicket.user_type}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedTicket.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
                </div>
                {selectedTicket.order_number && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span>Order: {selectedTicket.order_number}</span>
                  </div>
                )}
                {selectedTicket.seller_name && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span>Seller: {selectedTicket.seller_name}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* AI Summary */}
              {selectedTicket.ai_summary && (
                <div className="rounded-lg bg-muted p-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ArrowUpCircle className="h-4 w-4" />
                    AI Summary
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedTicket.ai_summary}</p>
                  {selectedTicket.ai_suggested_steps && (
                    <ul className="mt-2 list-disc pl-4 text-sm text-muted-foreground">
                      {selectedTicket.ai_suggested_steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <Separator />

              {/* Description */}
              <div>
                <h4 className="mb-2 text-sm font-medium">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              <Separator />

              {/* Messages */}
              <div>
                <h4 className="mb-2 text-sm font-medium">Conversation</h4>
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`rounded-lg p-3 text-sm ${
                            msg.sender_type === "customer"
                              ? "bg-blue-50 ml-8"
                              : msg.sender_type === "ai"
                              ? "bg-purple-50"
                              : "bg-gray-50 mr-8"
                          }`}
                        >
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium capitalize">{msg.sender_type}</span>
                            <span>{new Date(msg.created_at).toLocaleString()}</span>
                            {msg.is_internal_note && <Badge variant="outline">Internal Note</Badge>}
                          </div>
                          <p className="mt-1 whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              <Separator />

              {/* Reply */}
              <div>
                <Textarea
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                />
                <Button
                  className="mt-2 w-full"
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || isSending}
                >
                  {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send Reply
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Select a ticket to view details</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
