"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Eye,
  MoreHorizontal,
  MessageSquare,
  ShoppingCart,
} from "lucide-react"

import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../../components/ui/dropdown-menu"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"

type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled"

const tabs: { label: string; value: OrderStatus | "All" }[] = [
  { label: "All", value: "All" },
  { label: "Pending", value: "Pending" },
  { label: "Processing", value: "Processing" },
  { label: "Shipped", value: "Shipped" },
  { label: "Delivered", value: "Delivered" },
  { label: "Cancelled", value: "Cancelled" },
]

const mockOrders = [
  {
    id: "#ORD-8721",
    customer: "Jane Muthoni",
    items: 2,
    total: 5300,
    status: "Delivered" as OrderStatus,
    date: "2024-12-02",
  },
  {
    id: "#ORD-8720",
    customer: "Akinyi Ochieng",
    items: 1,
    total: 1800,
    status: "Shipped" as OrderStatus,
    date: "2024-12-02",
  },
  {
    id: "#ORD-8719",
    customer: "Wanjiku Kimani",
    items: 3,
    total: 8200,
    status: "Processing" as OrderStatus,
    date: "2024-12-01",
  },
  {
    id: "#ORD-8718",
    customer: "Amina Hassan",
    items: 1,
    total: 2450,
    status: "Pending" as OrderStatus,
    date: "2024-12-01",
  },
  {
    id: "#ORD-8717",
    customer: "Grace Nyambura",
    items: 2,
    total: 3950,
    status: "Delivered" as OrderStatus,
    date: "2024-11-30",
  },
  {
    id: "#ORD-8716",
    customer: "Faith Wanjala",
    items: 1,
    total: 4200,
    status: "Cancelled" as OrderStatus,
    date: "2024-11-29",
  },
  {
    id: "#ORD-8715",
    customer: "Nanjala Simiyu",
    items: 4,
    total: 12100,
    status: "Processing" as OrderStatus,
    date: "2024-11-29",
  },
]

function StatusBadge({ status }: { status: OrderStatus }) {
  const colors: Record<OrderStatus, string> = {
    Pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80",
    Processing: "bg-blue-100 text-blue-800 hover:bg-blue-100/80",
    Shipped: "bg-purple-100 text-purple-800 hover:bg-purple-100/80",
    Delivered: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80",
    Cancelled: "bg-red-100 text-red-800 hover:bg-red-100/80",
  }
  return (
    <Badge className={colors[status]} variant="outline">
      {status}
    </Badge>
  )
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus | "All">("All")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const filtered =
    activeTab === "All"
      ? mockOrders
      : mockOrders.filter((o) => o.status === activeTab)

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">
          View and manage all customer orders.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setActiveTab(tab.value)
              setCurrentPage(1)
            }}
            className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.items}</TableCell>
                  <TableCell>KES {order.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.date}
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
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Select
                            onValueChange={(v) =>
                              // Order status update handler
                              void v
                            }
                          >
                            <SelectTrigger className="border-0 p-0 text-sm font-normal">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Contact Buyer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    <ShoppingCart className="mx-auto mb-2 h-8 w-8" />
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
