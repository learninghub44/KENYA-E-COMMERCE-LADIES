"use client"

import { useState } from "react"
import { Star, MessageSquareText, Flag, ThumbsUp } from "lucide-react"

import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Textarea } from "../../../components/ui/textarea"
import { Avatar, AvatarFallback } from "../../../components/ui/avatar"
import { Rating } from "../../../components/shared/rating"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import { Separator } from "../../../components/ui/separator"
import { cn } from "../../../lib/utils"

interface Review {
  id: string
  product: string
  reviewer: string
  rating: number
  text: string
  date: string
  status: "Approved" | "Pending" | "Rejected"
}

const mockReviews: Review[] = [
  {
    id: "1",
    product: "Kitenge Maxi Dress",
    reviewer: "Jane Muthoni",
    rating: 5,
    text: "Absolutely love this dress! The fabric is beautiful and the fit is perfect. Received so many compliments.",
    date: "2024-11-28",
    status: "Approved",
  },
  {
    id: "2",
    product: "Beaded Sandals",
    reviewer: "Akinyi Ochieng",
    rating: 4,
    text: "Nice quality sandals. Comfortable for daily wear. Would recommend.",
    date: "2024-11-25",
    status: "Approved",
  },
  {
    id: "3",
    product: "Ankara Blazer",
    reviewer: "Wanjiku Kimani",
    rating: 3,
    text: "Good design but the sizing runs a bit small. Order one size up.",
    date: "2024-11-20",
    status: "Approved",
  },
  {
    id: "4",
    product: "Kente Scarf Set",
    reviewer: "Amina Hassan",
    rating: 5,
    text: "Stunning colors! The craftsmanship is excellent. Makes a great gift.",
    date: "2024-11-18",
    status: "Pending",
  },
  {
    id: "5",
    product: "Dashiki Top",
    reviewer: "Grace Nyambura",
    rating: 2,
    text: "The material was not what I expected. Requested a return.",
    date: "2024-11-15",
    status: "Approved",
  },
]

const ratingDistribution = [
  { stars: 5, count: 42 },
  { stars: 4, count: 28 },
  { stars: 3, count: 12 },
  { stars: 2, count: 5 },
  { stars: 1, count: 3 },
]

const totalReviews = ratingDistribution.reduce((sum, r) => sum + r.count, 0)
const averageRating =
  ratingDistribution.reduce((sum, r) => sum + r.stars * r.count, 0) / totalReviews

export default function ReviewsPage() {
  const [reviews] = useState<Review[]>(mockReviews)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [filterRating, setFilterRating] = useState("all")
  const [filterProduct, setFilterProduct] = useState("all")

  const filtered = reviews.filter((r) => {
    const matchRating = filterRating === "all" || r.rating === Number(filterRating)
    const matchProduct = filterProduct === "all" || r.product === filterProduct
    return matchRating && matchProduct
  })

  const products = [...new Set(reviews.map((r) => r.product))]

  function handleReply(reviewId: string) {
    console.log("Reply to review", reviewId, replyText)
    setReplyText("")
    setReplyingTo(null)
  }

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
              <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
              <Rating value={averageRating} className="mt-1 justify-center" />
              <p className="mt-1 text-sm text-muted-foreground">
                {totalReviews} total reviews
              </p>
            </div>
            <Separator />
            {ratingDistribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-2 text-sm">
                <span className="w-8 text-muted-foreground">{item.stars}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-yellow-400"
                    style={{
                      width: `${(item.count / totalReviews) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground">
                  {item.count}
                </span>
              </div>
            ))}
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
                {products.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filtered.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>
                          {review.reviewer.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {review.reviewer}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            on {review.product}
                          </span>
                        </div>
                        <Rating value={review.rating} size="sm" className="mt-1" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          {review.text}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {review.date}
                          </span>
                          <Badge
                            variant={
                              review.status === "Approved"
                                ? "default"
                                : review.status === "Pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {review.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Report review"
                      >
                        <Flag className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Mark helpful"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {replyingTo === review.id ? (
                    <div className="mt-4 space-y-2 border-t pt-4">
                      <Textarea
                        placeholder="Write your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyText("")
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReply(review.id)}
                          disabled={!replyText.trim()}
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex justify-end border-t pt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(review.id)}
                      >
                        <MessageSquareText className="mr-2 h-4 w-4" />
                        Reply
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
