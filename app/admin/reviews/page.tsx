"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, MoreHorizontal, CheckCircle, XCircle, Star, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Badge } from "../../../components/ui/badge"
import { Skeleton } from "../../../components/ui/skeleton"
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
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"

interface ReviewProduct {
  name: string
}

interface ReviewProfile {
  display_name: string
}

interface Review {
  id: string
  product_id: string
  rating: number
  title: string
  body: string
  status: string
  is_verified_purchase: boolean
  created_at: string
  products: ReviewProduct
  profiles: ReviewProfile
}

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  approved: "default",
  pending: "secondary",
  rejected: "destructive",
}

const statusLabel: Record<string, string> = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
}

const ITEMS_PER_PAGE = 10

export default function ReviewsPage() {
  const [search, setSearch] = useState("")
  const [ratingFilter, setRatingFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [page, setPage] = useState(1)
  const [reviews, setReviews] = useState<Review[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (statusFilter !== "All") params.set("status", statusFilter.toLowerCase())
    if (ratingFilter !== "All") params.set("rating", ratingFilter)
    params.set("page", String(page))
    params.set("limit", String(ITEMS_PER_PAGE))

    try {
      const res = await fetch(`/api/admin/reviews?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setReviews(data.reviews)
      setTotal(data.total)
    } catch {
      setToast({ message: "Failed to load reviews", type: "error" })
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, ratingFilter, page])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const handleAction = async (reviewId: string, action: string) => {
    setActionLoading(reviewId)
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setToast({ message: `Review ${action === "remove" ? "removed" : action + "d"} successfully`, type: "success" })
      fetchReviews()
    } catch {
      setToast({ message: `Failed to ${action} review`, type: "error" })
    } finally {
      setActionLoading(null)
    }
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-md px-4 py-2 text-sm text-white shadow-lg ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reviews Moderation</h1>
        <p className="text-sm text-muted-foreground">Moderate all platform reviews</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Reviews</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  className="pl-9 w-56"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                />
              </div>
              <Select value={ratingFilter} onValueChange={(v) => { setRatingFilter(v); setPage(1) }}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No reviews found.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="max-w-md">Review</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">{review.products?.name ?? "—"}</TableCell>
                      <TableCell>{review.profiles?.display_name ?? "—"}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-yellow-500">
                          <Star className="h-4 w-4 fill-current" />
                          {review.rating}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-md truncate text-muted-foreground">
                        {review.title && <span className="font-medium text-foreground">{review.title}: </span>}
                        {review.body}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[review.status] ?? "secondary"}>
                          {statusLabel[review.status] ?? review.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={actionLoading === review.id}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {review.status !== "approved" && (
                              <DropdownMenuItem onClick={() => handleAction(review.id, "approve")}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Approve
                              </DropdownMenuItem>
                            )}
                            {review.status !== "rejected" && (
                              <DropdownMenuItem onClick={() => handleAction(review.id, "reject")}>
                                <XCircle className="mr-2 h-4 w-4 text-destructive" /> Reject
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleAction(review.id, "feature")}>
                              <Star className="mr-2 h-4 w-4 text-yellow-500" /> Feature
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleAction(review.id, "remove")}>
                              <Trash2 className="mr-2 h-4 w-4" /> Remove
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
                    Page {page} of {totalPages} ({total} total)
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
