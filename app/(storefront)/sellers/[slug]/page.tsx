"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Store, Package, Calendar, MapPin, ShieldCheck, BadgeCheck } from "lucide-react"

import { cn } from "../../../../lib/utils"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import { Input } from "../../../../components/ui/input"
import { Separator } from "../../../../components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "../../../../components/ui/avatar"
import { Skeleton } from "../../../../components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select"
import { Breadcrumbs } from "../../../../components/shared/breadcrumbs"
import { ProductCard } from "../../../../components/shared/product-card"
import { Rating } from "../../../../components/shared/rating"
import { EmptyState } from "../../../../components/shared/empty-state"

const sellersData: Record<string, {
  name: string
  slug: string
  tagline: string
  description: string
  avatar: string
  coverImage: string
  rating: number
  reviewCount: number
  memberSince: string
  productCount: number
  location: string
  products: Array<{
    id: string
    name: string
    price: number
    comparePrice: number | null
    images: string[]
    rating: number
    reviewCount: number
    isNew: boolean
    discount: number | null
    sellerName: string
    slug: string
  }>
}> = {
  "nairobi-styles": {
    name: "Nairobi Styles",
    slug: "nairobi-styles",
    tagline: "Contemporary African fashion for the modern woman",
    description: "Nairobi Styles is a premium fashion brand based in Nairobi, Kenya, specializing in contemporary African-inspired clothing. Founded in 2023, we blend traditional craftsmanship with modern design to create unique pieces that celebrate African heritage. Every garment is carefully crafted by local artisans using high-quality materials sourced from across the continent.",
    avatar: "/placeholder.svg",
    coverImage: "/placeholder.svg",
    rating: 4.9,
    reviewCount: 312,
    memberSince: "2023",
    productCount: 48,
    location: "Nairobi, Kenya",
    products: [
      { id: "1", name: "Premium African Print Maxi Dress", price: 8500, comparePrice: 12000, images: [], rating: 4.8, reviewCount: 124, isNew: true, discount: 29, sellerName: "Nairobi Styles", slug: "premium-african-print-maxi-dress" },
      { id: "2", name: "Kente Print Wrap Skirt", price: 4800, comparePrice: null, images: [], rating: 4.8, reviewCount: 98, isNew: true, discount: null, sellerName: "Nairobi Styles", slug: "kente-print-wrap-skirt" },
      { id: "3", name: "Linen Blend Wide Leg Pants", price: 6200, comparePrice: 7800, images: [], rating: 4.7, reviewCount: 89, isNew: false, discount: 21, sellerName: "Nairobi Styles", slug: "linen-blend-wide-leg-pants" },
      { id: "4", name: "Ankara Print Bomber Jacket", price: 7200, comparePrice: null, images: [], rating: 4.6, reviewCount: 56, isNew: true, discount: null, sellerName: "Nairobi Styles", slug: "ankara-print-bomber-jacket" },
      { id: "5", name: "Batik Print Jumpsuit", price: 5800, comparePrice: null, images: [], rating: 4.5, reviewCount: 78, isNew: false, discount: null, sellerName: "Nairobi Styles", slug: "batik-print-jumpsuit" },
      { id: "6", name: "Dashiki Inspired Blouse", price: 3500, comparePrice: 4500, images: [], rating: 4.7, reviewCount: 112, isNew: true, discount: 22, sellerName: "Nairobi Styles", slug: "dashiki-inspired-blouse" },
      { id: "7", name: "Embroidered Linen Shirt Dress", price: 6500, comparePrice: null, images: [], rating: 4.6, reviewCount: 43, isNew: false, discount: null, sellerName: "Nairobi Styles", slug: "embroidered-linen-shirt-dress" },
      { id: "8", name: "African Print Wide Leg Jumpsuit", price: 7800, comparePrice: 9500, images: [], rating: 4.9, reviewCount: 201, isNew: true, discount: 18, sellerName: "Nairobi Styles", slug: "african-print-wide-leg-jumpsuit" },
      { id: "9", name: "Kitenge Print Midi Dress", price: 5200, comparePrice: null, images: [], rating: 4.7, reviewCount: 67, isNew: false, discount: null, sellerName: "Nairobi Styles", slug: "kitenge-print-midi-dress" },
    ],
  },
  "safari-chic": {
    name: "Safari Chic",
    slug: "safari-chic",
    tagline: "Safari-inspired elegance",
    description: "Safari Chic brings you the best of African safari-inspired fashion. Our collections feature neutral tones, natural fabrics, and timeless silhouettes that capture the spirit of the wild.",
    avatar: "/placeholder.svg",
    coverImage: "/placeholder.svg",
    rating: 4.7,
    reviewCount: 178,
    memberSince: "2022",
    productCount: 36,
    location: "Nairobi, Kenya",
    products: [
      { id: "10", name: "Linen Blend Tailored Blazer", price: 9500, comparePrice: null, images: [], rating: 4.7, reviewCount: 67, isNew: true, discount: null, sellerName: "Safari Chic", slug: "linen-blend-tailored-blazer" },
      { id: "11", name: "Organic Cotton Kimono", price: 5500, comparePrice: 7200, images: [], rating: 4.6, reviewCount: 45, isNew: false, discount: 24, sellerName: "Safari Chic", slug: "organic-cotton-kimono" },
      { id: "12", name: "Embroidered Linen Top", price: 4200, comparePrice: null, images: [], rating: 4.2, reviewCount: 28, isNew: false, discount: null, sellerName: "Safari Chic", slug: "embroidered-linen-blouse" },
    ],
  },
}

export default function SellerPage() {
  const params = useParams()
  const slug = params.slug as string
  const seller = sellersData[slug]

  const [sortBy, setSortBy] = useState("newest")

  const sortedProducts = seller
    ? [...seller.products].sort((a, b) => {
        switch (sortBy) {
          case "price-asc": return a.price - b.price
          case "price-desc": return b.price - a.price
          case "rating": return b.rating - a.rating
          default: return 0
        }
      })
    : []

  if (!seller) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <EmptyState
          icon={Store}
          title="Seller Not Found"
          description={`The seller "${slug}" could not be found. Please check the URL or browse our sellers.`}
          action={
            <Button asChild>
              <Link href="/sellers">Browse Sellers</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <div className="relative">
        <div className="relative h-48 overflow-hidden bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 sm:h-56 md:h-64">
          <Image
            src={seller.coverImage}
            alt={`${seller.name} cover`}
            fill
            className="object-cover opacity-40"
            priority
          />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 mb-8 flex flex-col items-center gap-6 sm:-mt-20 sm:flex-row sm:items-end">
            <Avatar className="h-28 w-28 border-4 border-background sm:h-32 sm:w-32">
              <AvatarImage src={seller.avatar} alt={seller.name} />
              <AvatarFallback className="text-2xl font-bold">{seller.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{seller.name}</h1>
                <Badge variant="secondary" className="gap-1">
                  <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                  Verified Seller
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{seller.tagline}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:justify-start">
                <span className="flex items-center gap-1">
                  <Rating value={seller.rating} size="sm" />
                  <span>{seller.rating} ({seller.reviewCount})</span>
                </span>
                <span className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  {seller.productCount} products
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Since {seller.memberSince}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {seller.location}
                </span>
              </div>
            </div>

            <Button className="hidden sm:inline-flex gap-2">
              <ShieldCheck className="h-4 w-4" />
              Contact Seller
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <div className="space-y-6">
              <div>
                <h2 className="mb-3 text-lg font-semibold">About the Seller</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{seller.description}</p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-3 text-sm font-medium">Store Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Products</span>
                    <span className="font-medium">{seller.productCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="font-medium">{seller.rating} / 5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reviews</span>
                    <span className="font-medium">{seller.reviewCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-medium">{seller.memberSince}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full sm:hidden gap-2">
                <ShieldCheck className="h-4 w-4" />
                Contact Seller
              </Button>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {seller.productCount} product{seller.productCount !== 1 ? "s" : ""}
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]" aria-label="Sort products">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {sortedProducts.length === 0 ? (
              <div className="py-16">
                <EmptyState
                  icon={Package}
                  title="No products yet"
                  description="This seller hasn't listed any products yet. Check back later."
                />
              </div>
            ) : (
              <motion.div
                className="grid gap-6 grid-cols-2 md:grid-cols-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
