"use client"

import { useState } from "react"
import {
  AlertTriangle,
  MoreHorizontal,
  XCircle,
  Ban,
  MessageSquare,
  Shield,
  ShoppingBag,
  Star,
  Store,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog"

interface Report {
  id: string
  item: string
  reporter: string
  reason: string
  date: string
  status: "Pending" | "Reviewed" | "Dismissed"
}

const productsReports: Report[] = [
  { id: "r1", item: "Kente Scarf", reporter: "Jane W.", reason: "Counterfeit product", date: "2025-06-30", status: "Pending" },
  { id: "r2", item: "Ankara Jumpsuit", reporter: "Faith N.", reason: "Inappropriate images", date: "2025-06-29", status: "Pending" },
  { id: "r3", item: "Beaded Sandals", reporter: "Grace A.", reason: "Wrong size listed", date: "2025-06-28", status: "Reviewed" },
]

const reviewsReports: Report[] = [
  { id: "r4", item: "Review on Mrembo Fashions", reporter: "System", reason: "Spam review", date: "2025-06-30", status: "Pending" },
  { id: "r5", item: "Review on Dada Cosmetics", reporter: "Nancy W.", reason: "Fake review", date: "2025-06-27", status: "Pending" },
]

const sellersReports: Report[] = [
  { id: "r6", item: "Amani Collections", reporter: "Mary W.", reason: "Fraudulent activity", date: "2025-06-29", status: "Pending" },
  { id: "r7", item: "Kiki Accessories", reporter: "System", reason: "Policy violation", date: "2025-06-25", status: "Reviewed" },
]

const messagesReports: Report[] = [
  { id: "r8", item: "Message from User #1234", reporter: "System", reason: "Harassment", date: "2025-06-28", status: "Pending" },
]

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  Pending: "destructive",
  Reviewed: "secondary",
  Dismissed: "outline",
}

const tabIcons: Record<string, React.ElementType> = {
  products: ShoppingBag,
  reviews: Star,
  sellers: Store,
  messages: MessageSquare,
}

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState("products")
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const reportsMap: Record<string, Report[]> = {
    products: productsReports,
    reviews: reviewsReports,
    sellers: sellersReports,
    messages: messagesReports,
  }

  const currentReports = reportsMap[activeTab] || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Content Moderation</h1>
        <p className="text-sm text-muted-foreground">Review and moderate reported content</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          {Object.entries(tabIcons).map(([key, Icon]) => (
            <TabsTrigger key={key} value={key} className="gap-2">
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline capitalize">{key}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(reportsMap).map(([key, reports]) => (
          <TabsContent key={key} value={key}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{key} Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-center">
                    <Shield className="mb-2 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No reports yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
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
                              {report.item}
                            </div>
                          </TableCell>
                          <TableCell>{report.reporter}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{report.reason}</TableCell>
                          <TableCell className="text-muted-foreground">{report.date}</TableCell>
                          <TableCell>
                            <Badge variant={statusVariant[report.status]}>{report.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Dismiss Report</DropdownMenuItem>
                                <DropdownMenuItem>
                                  <AlertTriangle className="mr-2 h-4 w-4" /> Warn User
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <XCircle className="mr-2 h-4 w-4" /> Remove Content
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Ban className="mr-2 h-4 w-4" /> Ban User
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
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>Review the reported content</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Item</p>
                <p className="font-medium">{selectedReport.item}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reporter</p>
                <p className="font-medium">{selectedReport.reporter}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reason</p>
                <p className="font-medium">{selectedReport.reason}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{selectedReport.date}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
