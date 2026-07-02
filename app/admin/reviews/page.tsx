"use client"

import { useState } from "react"
import { MoreHorizontal, CheckCircle, XCircle, Star, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
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
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"

interface Review {
  id: string
  product: string
  reviewer: string
  rating: number
  text: string
  status: "Approved" | "Pending" | "Rejected"
  date: string
}

const reviews: Review[] = [
  { id: "rv1", product: "African Print Maxi Dress", reviewer: "Jane W.", rating: 5, text: "Absolutely beautiful dress! The fabric is high quality and fits perfectly.", status: "Approved", date: "2025-06-30" },
  { id: "rv2", product: "Shea Butter Moisturizer", reviewer: "Faith N.", rating: 4, text: "Great moisturizer, leaves my skin feeling soft.", status: "Approved", date: "2025-06-28" },
  { id: "rv3", product: "Beaded Sandals", reviewer: "Grace A.", rating: 1, text: "Very poor quality. The beads fell off after one wear.", status: "Pending", date: "2025-06-27" },
  { id: "rv4", product: "Dashiki Blouse", reviewer: "Nancy W.", rating: 5, text: "Love this blouse! Gets compliments everywhere I go.", status: "Approved", date: "2025-06-25" },
  { id: "rv5", product: "Kente Scarf", reviewer: "Mary W.", rating: 3, text: "It's okay, but the color is slightly different from the photo.", status: "Pending", date: "2025-06-24" },
  { id: "rv6", product: "Kitenge Face Mask Set", reviewer: "Sarah C.", rating: 2, text: "This is a spam review just testing the system.", status: "Rejected", date: "2025-06-23" },
]

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  Approved: "default",
  Pending: "secondary",
  Rejected: "destructive",
}

export default function ReviewsPage() {
  const [ratingFilter, setRatingFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")

  const filtered = reviews.filter((r) => {
    const matchRating = ratingFilter === "All" || r.rating === Number(ratingFilter)
    const matchStatus = statusFilter === "All" || r.status === statusFilter
    return matchRating && matchStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reviews Moderation</h1>
        <p className="text-sm text-muted-foreground">Moderate all platform reviews</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Reviews</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
              {filtered.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">{review.product}</TableCell>
                  <TableCell>{review.reviewer}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      {review.rating}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-md truncate text-muted-foreground">{review.text}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[review.status]}>{review.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{review.date}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <XCircle className="mr-2 h-4 w-4 text-destructive" /> Reject
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Star className="mr-2 h-4 w-4 text-yellow-500" /> Feature
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
