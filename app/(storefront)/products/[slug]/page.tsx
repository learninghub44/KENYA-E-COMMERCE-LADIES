"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  Heart,
  Share2,
  Minus,
  Plus,
  ShoppingCart,
  Flag,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  Check,
  MessageCircle,
  Twitter,
  Facebook,
} from "lucide-react"

import { cn } from "../../../../lib/utils"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import { Input } from "../../../../components/ui/input"
import { Separator } from "../../../../components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "../../../../components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../../components/ui/tabs"
import { Card, CardContent } from "../../../../components/ui/card"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../../../../components/ui/tooltip"
import { Breadcrumbs } from "../../../../components/shared/breadcrumbs"
import { ProductCard } from "../../../../components/shared/product-card"
import { Rating } from "../../../../components/shared/rating"
import { Price } from "../../../../components/shared/price"

const product = {
  id: "1",
  name: "Premium African Print Maxi Dress",
  slug: "premium-african-print-maxi-dress",
  price: 8500,
  comparePrice: 12000,
  description: "Make a statement with this stunning premium African print maxi dress. Crafted from high-quality Ankara fabric, featuring an elegant floor-length silhouette with a flattering fit-and-flare design. Perfect for weddings, galas, and special occasions. Features a flattering V-neckline, adjustable waist tie, and flowy skirt. Each piece is uniquely patterned, ensuring you stand out from the crowd.",
  images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
  rating: 4.8,
  reviewCount: 124,
  discount: 29,
  isNew: true,
  seller: {
    name: "Nairobi Styles",
    slug: "nairobi-styles",
    avatar: "/placeholder.svg",
    rating: 4.9,
    productCount: 48,
    memberSince: "2023",
  },
  variants: {
    colors: ["Gold", "Emerald", "Ruby Red", "Royal Blue", "Ivory"],
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
  },
  category: { name: "Fashion", slug: "fashion" },
  tags: ["Dresses", "African Print", "Maxi", "Formal Wear"],
}

const reviews = [
  { id: "1", author: "Grace W.", avatar: "/placeholder.svg", rating: 5, date: "2 weeks ago", text: "Absolutely stunning dress! The fabric is high quality and the fit is perfect. Received so many compliments at the wedding I attended." },
  { id: "2", author: "Faith M.", avatar: "/placeholder.svg", rating: 5, date: "1 month ago", text: "Beautiful craftsmanship and vibrant colors. True to size. Will definitely be ordering more from this seller." },
  { id: "3", author: "Amina K.", avatar: "/placeholder.svg", rating: 4, date: "2 months ago", text: "Lovely dress! The pattern is even more beautiful in person. Slightly longer than expected but still works perfectly with heels." },
]

const relatedProducts = [
  { id: "2", name: "Handcrafted Beaded Statement Necklace", price: 3200, comparePrice: null, images: [], rating: 4.6, reviewCount: 89, isNew: true, discount: null, sellerName: "Makena Accessories", slug: "handcrafted-beaded-statement-necklace" },
  { id: "3", name: "Kente Print Wrap Skirt", price: 4800, comparePrice: null, images: [], rating: 4.8, reviewCount: 98, isNew: true, discount: null, sellerName: "Accra Threads", slug: "kente-print-wrap-skirt" },
  { id: "4", name: "Linen Blend Tailored Blazer", price: 9500, comparePrice: null, images: [], rating: 4.7, reviewCount: 67, isNew: true, discount: null, sellerName: "Safari Chic", slug: "linen-blend-tailored-blazer" },
  { id: "5", name: "Leather Crossbody Bag", price: 6200, comparePrice: 7800, images: [], rating: 4.5, reviewCount: 143, isNew: false, discount: 21, sellerName: "Urban Leather Co.", slug: "leather-crossbody-bag" },
]

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [selectedColor, setSelectedColor] = useState(product.variants.colors[0] ?? product.variants.colors[0])
  const [selectedSize, setSelectedSize] = useState(product.variants.sizes[2] ?? product.variants.sizes[2])
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  function handleQuantityChange(delta: number) {
    setQuantity((prev) => Math.max(1, prev + delta))
  }

  function handleAddToCart() {
    // placeholder
  }

  function handleImageNav(direction: -1 | 1) {
    setSelectedImageIndex((prev) => {
      const next = prev + direction
      if (next < 0) return product.images.length - 1
      if (next >= product.images.length) return 0
      return next
    })
  }

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Categories", href: "/categories" },
            { label: product.category.name, href: `/categories/${product.category.slug}` },
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
              <button
                type="button"
                className="absolute inset-0 z-10"
                onClick={() => setIsLightboxOpen(true)}
                aria-label="Enlarge image"
              >
                <Image
                  src={product.images[selectedImageIndex] ?? "/placeholder.svg"}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </button>

              {product.isNew && (
                <Badge className="absolute left-3 top-3 z-20">New</Badge>
              )}
              {product.discount != null && product.discount > 0 && (
                <Badge variant="destructive" className="absolute left-3 top-12 z-20">
                  -{product.discount}%
                </Badge>
              )}

              <button
                type="button"
                onClick={() => handleImageNav(-1)}
                className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/80 p-1.5 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => handleImageNav(1)}
                className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/80 p-1.5 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex gap-3 overflow-x-auto pb-2" role="tablist" aria-label="Product images">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={selectedImageIndex === index}
                  aria-label={`View image ${index + 1}`}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-muted transition-colors",
                    selectedImageIndex === index
                      ? "border-primary"
                      : "border-transparent hover:border-muted-foreground/30"
                  )}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{product.name}</h1>
              <div className="mt-2 flex items-center gap-3">
                <Rating value={product.rating} showValue size="md" />
                <Link href="#reviews" className="text-sm text-muted-foreground underline-offset-2 hover:underline">
                  ({product.reviewCount} reviews)
                </Link>
              </div>
              <div className="mt-4">
                <Price amount={product.price} compareAt={product.comparePrice} variant="sale" size="lg" />
              </div>
            </div>

            <Separator />

            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <Separator />

            <div>
              <h3 className="mb-3 text-sm font-medium">Color: <span className="text-muted-foreground font-normal">{selectedColor}</span></h3>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color selection">
                {product.variants.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    role="radio"
                    aria-checked={selectedColor === color}
                    aria-label={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                      selectedColor === color
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background hover:bg-accent"
                    )}
                  >
                    {selectedColor === color && <Check className="h-3.5 w-3.5" />}
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium">Size: <span className="text-muted-foreground font-normal">{selectedSize}</span></h3>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size selection">
                {product.variants.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    role="radio"
                    aria-checked={selectedSize === size}
                    aria-label={`Size ${size}`}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "inline-flex h-10 w-12 items-center justify-center rounded-md border text-sm font-medium transition-all",
                      selectedSize === size
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background hover:bg-accent"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <Link href="/size-guide" className="mt-2 inline-block text-xs text-primary underline-offset-2 hover:underline">
                Size Guide
              </Link>
            </div>

            <Separator />

            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-md border" role="group" aria-label="Quantity selector">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="flex h-10 w-10 items-center justify-center rounded-l-md transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="flex h-10 w-14 items-center justify-center border-x text-sm font-medium" aria-live="polite" aria-atomic="true">
                  {quantity}
                </div>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  className="flex h-10 w-10 items-center justify-center rounded-r-md transition-colors hover:bg-accent"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <span className="text-sm text-muted-foreground">
                KES {(product.price * quantity).toLocaleString()}
              </span>
            </div>

            <div className="flex gap-3">
              <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart} aria-label="Add to cart">
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 flex-shrink-0"
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      aria-pressed={isWishlisted}
                    >
                      <Heart className={cn("h-5 w-5 transition-colors", isWishlisted && "fill-red-500 text-red-500")} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={product.seller.avatar} alt={product.seller.name} />
                  <AvatarFallback>{product.seller.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Link href={`/sellers/${product.seller.slug}`} className="font-medium hover:underline">
                    {product.seller.name}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Rating value={product.seller.rating} size="sm" />
                    <span>{product.seller.productCount} products</span>
                    <span>&middot;</span>
                    <span>Since {product.seller.memberSince}</span>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/sellers/${product.seller.slug}`}>Visit Store</Link>
                </Button>
              </CardContent>
            </Card>

            <div>
              <h3 className="mb-3 text-sm font-medium">Share</h3>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="Share on WhatsApp">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>WhatsApp</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="Share on Twitter">
                        <Twitter className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Twitter</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="Share on Facebook">
                        <Facebook className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Facebook</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="Copy link">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy link</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Flag className="h-4 w-4" />
              <Link href={`/report?product=${product.slug}`} className="hover:underline">
                Report this product
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-12" />

        <Tabs defaultValue="description" className="mx-auto max-w-3xl">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="pt-6">
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p>{product.description}</p>
              <h4 className="mt-6 font-medium text-foreground">Product Details</h4>
              <ul>
                <li>Material: Premium Ankara Cotton Blend</li>
                <li>Silhouette: Fit and Flare</li>
                <li>Neckline: V-Neck</li>
                <li>Length: Floor-Length (Maxi)</li>
                <li>Care: Hand wash cold, line dry</li>
                <li>Made in Kenya</li>
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="pt-6" id="reviews">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold">{product.rating}</div>
                  <Rating value={product.rating} size="sm" />
                  <p className="mt-1 text-xs text-muted-foreground">{product.reviewCount} reviews</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="flex gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.avatar} alt={review.author} />
                      <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{review.author}</h4>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                      <Rating value={review.rating} size="sm" className="mt-1" />
                      <p className="mt-2 text-sm text-muted-foreground">{review.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="shipping" className="pt-6">
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground">Shipping</h4>
                <p className="mt-1">Free delivery on orders over KES 5,000. Standard delivery takes 2-5 business days within Kenya. Express delivery available at extra cost. International shipping available for select items.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Returns</h4>
                <p className="mt-1">We accept returns within 30 days of delivery. Items must be unworn, unwashed, and with all tags attached. Refunds are processed within 5-7 business days after we receive the returned item.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-12" />

        <section>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Related Products</h2>
              <p className="text-sm text-muted-foreground">You might also like</p>
            </div>
            <Button asChild variant="ghost">
              <Link href={`/categories/${product.category.slug}`}>
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {relatedProducts.map((p) => (
              <div key={p.id} className="min-w-[260px] flex-shrink-0 sm:min-w-[280px]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      </div>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleImageNav(-1) }}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleImageNav(1) }}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div
            className="relative h-[80vh] w-[80vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={product.images[selectedImageIndex] ?? "/placeholder.svg"}
              alt={product.name}
              fill
              sizes="80vw"
              className="object-contain"
              priority
            />
          </div>
          <div className="absolute bottom-6 text-sm text-white/60">
            {selectedImageIndex + 1} / {product.images.length}
          </div>
        </div>
      )}
    </div>
  )
}
