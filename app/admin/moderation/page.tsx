"use client"

import { useCallback, useEffect, useState } from "react"
import {
  AlertTriangle,
  MoreHorizontal,
  Ban,
  MessageSquare,
  Shield,
  ShoppingBag,
  Star,
  Store,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
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

type ReportRow = {
  id: string
  targetType: "product" | "seller" | "buyer" | "message" | "store"
  targetId: string
  reporterId: string
  reason: string
  status: "open" | "assigned" | "in_review" | "resolved" | "dismissed"
  createdAt: string
}

type ReviewReportRow = {
  id: string
  reviewId: string
  reviewType: string
  reporterId: string
  reason: string
  status: string
  createdAt: string
}

type MessageRow = {
  id: string
  conversationId: string
  senderId: string
  body: string | null
  deletedAt: string | null
  reportCount: number
  createdAt: string
}

const tabIcons: Record<string, React.ElementType> = {
  products: ShoppingBag,
  reviews: Star,
  sellers: Store,
  messages: MessageSquare,
}

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  open: "destructive",
  assigned: "secondary",
  in_review: "secondary",
  resolved: "outline",
  dismissed: "outline",
}

const targetTypeByTab: Record<string, ReportRow["targetType"]> = {
  products: "product",
  sellers: "seller",
}

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState("products")
  const [reports, setReports] = useState<ReportRow[]>([])
  const [reviewReports, setReviewReports] = useState<ReviewReportRow[]>([])
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [loading, setLoading] = useState(false)
  const [actingId, setActingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadTab = useCallback(async (tab: string) => {
    setLoading(true)
    setError(null)
    try {
      if (tab === "messages") {
        const res = await fetch("/api/admin/moderation/messages")
        if (!res.ok) throw new Error("Failed to load reported messages")
        const data = await res.json()
        setMessages(data.items ?? [])
      } else if (tab === "reviews") {
        const res = await fetch("/api/admin/moderation/reviews")
        if (!res.ok) throw new Error("Failed to load review reports")
        const data = await res.json()
        setReviewReports(data.items ?? [])
      } else {
        const targetType = targetTypeByTab[tab]
        const res = await fetch(`/api/admin/reports?targetType=${targetType}`)
        if (!res.ok) throw new Error("Failed to load reports")
        const data = await res.json()
        setReports(data.items ?? [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTab(activeTab)
  }, [activeTab, loadTab])

  async function handleReportAction(reportId: string, action: "dismiss" | "resolve") {
    setActingId(reportId)
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, action }),
      })
      if (!res.ok) throw new Error("Action failed")
      await loadTab(activeTab)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed")
    } finally {
      setActingId(null)
    }
  }

  async function handleReviewReportAction(reportId: string, action: "dismiss" | "resolve") {
    setActingId(reportId)
    try {
      const res = await fetch("/api/admin/moderation/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, action }),
      })
      if (!res.ok) throw new Error("Action failed")
      await loadTab("reviews")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed")
    } finally {
      setActingId(null)
    }
  }

  async function handleMessageAction(
    messageId: string,
    senderId: string,
    action: "delete_message" | "warn_user" | "suspend_messaging"
  ) {
    setActingId(messageId)
    try {
      const res = await fetch("/api/admin/moderation/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          messageId: action === "delete_message" ? messageId : undefined,
          userId: action !== "delete_message" ? senderId : undefined,
        }),
      })
      if (!res.ok) throw new Error("Action failed")
      await loadTab("messages")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed")
    } finally {
      setActingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Content Moderation</h1>
        <p className="text-sm text-muted-foreground">Review and moderate reported content</p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          {Object.entries(tabIcons).map(([key, Icon]) => (
            <TabsTrigger key={key} value={key} className="gap-2">
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline capitalize">{key}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {(["products", "sellers"] as const).map((key) => (
          <TabsContent key={key} value={key}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{key} Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : reports.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-center">
                    <Shield className="mb-2 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No reports yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Target ID</TableHead>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                              <span className="truncate max-w-[160px]">{report.targetId}</span>
                            </div>
                          </TableCell>
                          <TableCell className="truncate max-w-[140px]">{report.reporterId}</TableCell>
                          <TableCell className="max-w-[200px] truncate capitalize">{report.reason.replace(/_/g, " ")}</TableCell>
                          <TableCell className="text-muted-foreground">{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={statusVariant[report.status]}>{report.status.replace(/_/g, " ")}</Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={actingId === report.id}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleReportAction(report.id, "dismiss")}>
                                  Dismiss Report
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleReportAction(report.id, "resolve")}
                                >
                                  Mark Resolved
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Reviews Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : reviewReports.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <Shield className="mb-2 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No reports yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Review</TableHead>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviewReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <span className="truncate max-w-[160px] capitalize">{report.reviewType} review</span>
                          </div>
                        </TableCell>
                        <TableCell className="truncate max-w-[140px]">{report.reporterId}</TableCell>
                        <TableCell className="max-w-[200px] truncate capitalize">{report.reason.replace(/_/g, " ")}</TableCell>
                        <TableCell className="text-muted-foreground">{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[report.status] ?? "secondary"}>{report.status.replace(/_/g, " ")}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={actingId === report.id}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleReviewReportAction(report.id, "dismiss")}>
                                Dismiss Report
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleReviewReportAction(report.id, "resolve")}
                              >
                                Mark Resolved
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Messages Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <Shield className="mb-2 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No reports yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Message</TableHead>
                      <TableHead>Sender</TableHead>
                      <TableHead>Reports</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell className="font-medium max-w-[220px] truncate">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            {message.body ?? "[attachment]"}
                          </div>
                        </TableCell>
                        <TableCell className="truncate max-w-[140px]">{message.senderId}</TableCell>
                        <TableCell>{message.reportCount}</TableCell>
                        <TableCell className="text-muted-foreground">{new Date(message.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={message.deletedAt ? "outline" : "destructive"}>
                            {message.deletedAt ? "Removed" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={actingId === message.id}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleMessageAction(message.id, message.senderId, "warn_user")}>
                                <AlertTriangle className="mr-2 h-4 w-4" /> Warn User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                disabled={Boolean(message.deletedAt)}
                                onClick={() => handleMessageAction(message.id, message.senderId, "delete_message")}
                              >
                                <Shield className="mr-2 h-4 w-4" /> Remove Content
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleMessageAction(message.id, message.senderId, "suspend_messaging")}
                              >
                                <Ban className="mr-2 h-4 w-4" /> Suspend Messaging
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
