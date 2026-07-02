"use client"

import { useState } from "react"
import {
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Eye,
  Store,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Badge } from "../../../components/ui/badge"
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

interface Seller {
  id: string
  storeName: string
  owner: string
  email: string
  products: number
  revenue: string
  kycStatus: "Verified" | "Pending" | "Rejected"
  status: "Approved" | "Pending" | "Rejected" | "Suspended"
}

const sellers: Seller[] = [
  { id: "1", storeName: "Mrembo Fashions", owner: "Grace Akinyi", email: "grace@mrembo.com", products: 234, revenue: "KES 892K", kycStatus: "Verified", status: "Approved" },
  { id: "2", storeName: "Dada Cosmetics", owner: "Achieng Omondi", email: "achieng@dada.com", products: 89, revenue: "KES 654K", kycStatus: "Verified", status: "Approved" },
  { id: "3", storeName: "Sista Styles", owner: "Nancy Wairimu", email: "nancy@sista.com", products: 156, revenue: "KES 431K", kycStatus: "Pending", status: "Pending" },
  { id: "4", storeName: "Neo Beauty", owner: "Faith Nyambura", email: "faith@neo.com", products: 45, revenue: "KES 289K", kycStatus: "Verified", status: "Approved" },
  { id: "5", storeName: "Amani Collections", owner: "Mary Wambui", email: "mary@amani.com", products: 67, revenue: "KES 198K", kycStatus: "Rejected", status: "Rejected" },
  { id: "6", storeName: "Zuri Fashion House", owner: "Jane Wanjiku", email: "jane@zuri.com", products: 12, revenue: "KES 56K", kycStatus: "Pending", status: "Pending" },
  { id: "7", storeName: "Kiki Accessories", owner: "Sarah Chelangat", email: "sarah@kiki.com", products: 34, revenue: "KES 145K", kycStatus: "Verified", status: "Suspended" },
  { id: "8", storeName: "Malkia Boutique", owner: "Esther Nyambura", email: "esther@malkia.com", products: 78, revenue: "KES 312K", kycStatus: "Verified", status: "Approved" },
]

const kycVariant: Record<string, "default" | "secondary" | "destructive"> = {
  Verified: "default",
  Pending: "secondary",
  Rejected: "destructive",
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Approved: "default",
  Pending: "outline",
  Rejected: "destructive",
  Suspended: "secondary",
}

const ITEMS_PER_PAGE = 5

export default function SellersPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [page, setPage] = useState(1)

  const filtered = sellers.filter((s) => {
    const matchSearch = s.storeName.toLowerCase().includes(search.toLowerCase()) || s.owner.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "All" || s.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Seller Management</h1>
        <p className="text-sm text-muted-foreground">Manage sellers, KYC, and store approvals</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Sellers</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search sellers..." className="pl-9 w-64" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((seller) => (
                <TableRow key={seller.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Store className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{seller.storeName}</p>
                        <p className="text-xs text-muted-foreground">{seller.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{seller.owner}</TableCell>
                  <TableCell>{seller.products}</TableCell>
                  <TableCell className="font-medium">{seller.revenue}</TableCell>
                  <TableCell>
                    <Badge variant={kycVariant[seller.kycStatus]}>{seller.kycStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[seller.status]}>{seller.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Approve KYC
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <XCircle className="mr-2 h-4 w-4 text-destructive" /> Reject KYC
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ShieldAlert className="mr-2 h-4 w-4" /> Suspend
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" /> View Store
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" /> View Documents
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
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
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
    </div>
  )
}

function ShieldAlert(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  )
}
