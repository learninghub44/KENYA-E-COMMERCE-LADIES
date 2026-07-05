"use client"

import { useState, useEffect } from "react"
import { Star, MessageSquareText, Loader2 } from "lucide-react"

import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Avatar, AvatarFallback } from "../../../components/ui/avatar"
import { Rating } from "../../../components/shared/rating"
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
import { Separator } from "../../../components/ui/separator"

interface ReviewItem {
  id: string
  productId: string
  productName: string
  productImage: string | null
  buyerId: string
  rating: number
  title: string
  body: string
  status: string
  isVerifiedPurchase: boolean
  helpfulCount: number
  reportCount: number
  createdAt: string
  publishedAt: string | null
}

interface ReviewSummary {
  averageRating: number
  totalReviews: number
  distribution: Array<{ stars: number; count: number }>
}

interface ReviewsData {
  items: ReviewItem[]
  total: number
  summary: ReviewSummary
  productOptions: Array<{ id: string; name: string }>
  nextCursor: string | null
}

export default function ReviewsPage() {
  const [data, setData] = useState<ReviewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterRating, setFilterRating] = useState("all")
  const [filterProduct, setFilterProduct] = useState("all")

  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const params = new URLSearchParams()
    if (filterRating !== "all") params.set("rating", filterRating)
    if (filterProduct !== "all") params.set("productId", filterProduct)

    fetch(`/api/seller/reviews?${params.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load reviews")
        return r.json()
      })
      .then((d: ReviewsData) => {
        if (!cancelled) setData(d)
      })
      .catch(() => {
        if (!cancelled) setData({ items: [], total: 0, summary: { averageRating: 0, totalReviews: 0, distribution: [] }, productOptions: [], nextCursor: null })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [filterRating, filterProduct])

  function handleReply(reviewId: string) {
    setReplyText("")
    setReplyingTo(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
          <p className="text-sm text-muted-foreground">Manage customer reviews and feedback.</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  const reviews = data?.items ?? []
  const summary = data?.summary ?? { averageRating: 0, totalReviews: 0, distribution: [] }
  const productOptions = data?.productOptions ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          Manage customer reviews and feedback.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rating Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <span className="text-4xl font-bold">{summary.averageRating.toFixed(1)}</span>
              <Rating value={summary.averageRating} className="mt-1 justify-center" />
              <p className="mt-1 text-sm text-muted-foreground">
                {summary.totalReviews} total reviews
              </p>
            </div>
            <Separator />
            {summary.distribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-2 text-sm">
                <span className="w-8 text-muted-foreground">{item.stars}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-yellow-400"
                    style={{
                      width: `${summary.totalReviews > 0 ? (item.count / summary.totalReviews) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground">
                  {item.count}
                </span>
              </div>
            ))}
            {summary.distribution.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">No reviews yet</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                {[5, 4, 3, 2, 1].map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s} Stars
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterProduct} onValueChange={setFilterProduct}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {productOptions.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No reviews match your filters
                </CardContent>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>
                            {review.buyerId.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              Buyer
                            </span>
                            <span className="text-xs text-muted-foreground">
                              on {review.productName}
                            </span>
                          </div>
                          <Rating value={review.rating} size="sm" className="mt-1" />
                          {review.title && (
                            <p className="mt-2 text-sm font-medium">{review.title}</p>
                          )}
                          <p className="mt-1 text-sm text-muted-foreground">
                            {review.body}
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                            <Badge
                              variant={
                                review.status === "published"
                                  ? "default"
                                  : review.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {review.status}
                            </Badge>
                            {review.isVerifiedPurchase && (
                              <Badge variant="outline" className="text-xs">
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
