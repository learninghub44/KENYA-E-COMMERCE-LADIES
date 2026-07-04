"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  Truck,
  ShieldCheck,
  BadgeCheck,
  RotateCcw,
  Sparkles,
  Clock,
  ChevronLeft,
} from "lucide-react"

import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { ProductCard, type Product } from "../../components/shared/product-card"
import { EmptyState } from "../../components/shared/empty-state"
import { emitCartUpdated } from "../../lib/cart/use-cart-count"

export interface CategoryDisplay {
  name: string
  slug: string
  count: number
}

// Curated Unsplash images for categories (clean fashion and beauty photography)
const CATEGORY_IMAGE_BY_SLUG: Record<string, string> = {
  fashion: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80&auto=format&fit=crop",
  beauty: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80&auto=format&fit=crop",
  skincare: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80&auto=format&fit=crop",
  accessories: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80&auto=format&fit=crop",
  footwear: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80&auto=format&fit=crop",
  jewelry: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80&auto=format&fit=crop",
}
const FALLBACK_CATEGORY_IMAGE = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80&auto=format&fit=crop"

function imageForCategory(slug: string) {
  return CATEGORY_IMAGE_BY_SLUG[slug] ?? FALLBACK_CATEGORY_IMAGE
}

// Side navigation categories with Unsplash thumbnail images
const SIDE_CATEGORIES = [
  { name: "Women's Fashion", slug: "fashion", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=80&q=80&auto=format&fit=crop" },
  { name: "Cosmetics & Makeup", slug: "beauty", img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=80&q=80&auto=format&fit=crop" },
  { name: "Natural Skincare", slug: "skincare", img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=80&q=80&auto=format&fit=crop" },
  { name: "Bags & Accessories", slug: "accessories", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=80&q=80&auto=format&fit=crop" },
  { name: "Chic Footwear", slug: "footwear", img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=80&q=80&auto=format&fit=crop" },
  { name: "Fine Jewelry", slug: "jewelry", img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=80&q=80&auto=format&fit=crop" }
]

const HERO_CAROUSEL_SLIDES = [
  {
    title: "Kitenge Luxury Drop",
    subtitle: "Stunning handcrafted maxi dresses & tailor-made Ankara blazers designed in Nairobi.",
    cta: "Shop Fashion",
    link: "/categories/fashion",
    img: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=1200&q=80&auto=format&fit=crop",
    discount: "Up to 30% Off"
  },
  {
    title: "Glow From Within",
    subtitle: "Organic shea butter moisturizers & Vitamin C serums from verified local beauty brands.",
    cta: "Explore Skincare",
    link: "/categories/skincare",
    img: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=1200&q=80&auto=format&fit=crop",
    discount: "Beauty Deals"
  },
  {
    title: "Maasai Beaded Crafts",
    subtitle: "Authentic sandals, handwoven sisal totes, and statement jewelry pieces.",
    cta: "View Accessories",
    link: "/categories/accessories",
    img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&q=80&auto=format&fit=crop",
    discount: "Free Delivery"
  }
]

const FEATURED_BRANDS = [
  { name: "Zuri Designs", img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&q=80&auto=format&fit=crop" },
  { name: "Pwani Organics", img: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=150&q=80&auto=format&fit=crop" },
  { name: "Mara Crafts", img: "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=150&q=80&auto=format&fit=crop" },
  { name: "Silk Secrets", img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&q=80&auto=format&fit=crop" },
  { name: "Amani Apparels", img: "https://images.unsplash.com/photo-1548624149-f7b2e65cbdde?w=150&q=80&auto=format&fit=crop" }
]

// Fallback high-quality product data matching Supabase/Seller schema if DB is empty
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Kitenge Luxury Maxi Dress",
    price: 3500,
    comparePrice: 4800,
    images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80"],
    rating: 4.8,
    reviewCount: 24,
    isNew: true,
    discount: 27,
    sellerName: "Zuri Designs Kenya",
    slug: "kitenge-luxury-maxi-dress"
  },
  {
    id: "2",
    name: "Maasai Beaded Leather Sandals",
    price: 1800,
    comparePrice: 2500,
    images: ["https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=800&auto=format&fit=crop&q=80"],
    rating: 4.7,
    reviewCount: 38,
    isNew: false,
    discount: 28,
    sellerName: "Mara Crafts",
    slug: "maasai-beaded-leather-sandals"
  },
  {
    id: "3",
    name: "Ankara Fitted Blazer",
    price: 5200,
    comparePrice: 6500,
    images: ["https://images.unsplash.com/photo-1548624149-f7b2e65cbdde?w=800&auto=format&fit=crop&q=80"],
    rating: 4.9,
    reviewCount: 12,
    isNew: true,
    discount: 20,
    sellerName: "Amani Apparels",
    slug: "ankara-fitted-blazer"
  },
  {
    id: "4",
    name: "Organic Coconut & Shea Body Butter",
    price: 1200,
    comparePrice: 1600,
    images: ["https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80"],
    rating: 4.6,
    reviewCount: 57,
    isNew: false,
    discount: 25,
    sellerName: "Pwani Organics",
    slug: "organic-coconut-shea-body-butter"
  },
  {
    id: "5",
    name: "Vitamin C & Hyaluronic Glow Serum",
    price: 2100,
    comparePrice: 2800,
    images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80"],
    rating: 4.5,
    reviewCount: 22,
    isNew: true,
    discount: 25,
    sellerName: "Zuri Beauty Lab",
    slug: "vitamin-c-hyaluronic-glow-serum"
  },
  {
    id: "6",
    name: "Handwoven Sisal & Leather Tote",
    price: 3800,
    comparePrice: 5000,
    images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80"],
    rating: 4.8,
    reviewCount: 16,
    isNew: false,
    discount: 24,
    sellerName: "Machakos Weavers",
    slug: "handwoven-sisal-leather-tote"
  },
  {
    id: "7",
    name: "Satin Hair Bonnet & Pillowcase Set",
    price: 950,
    comparePrice: 1400,
    images: ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80"],
    rating: 4.7,
    reviewCount: 31,
    isNew: false,
    discount: 32,
    sellerName: "Silk Secrets Kenya",
    slug: "satin-hair-bonnet-pillowcase-set"
  },
  {
    id: "8",
    name: "Velvet Matte Lipstick - Nairobi Red",
    price: 1500,
    comparePrice: 2200,
    images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80"],
    rating: 4.9,
    reviewCount: 84,
    isNew: false,
    discount: 31,
    sellerName: "Zuri Beauty Lab",
    slug: "velvet-matte-lipstick-nairobi-red"
  }
]

// Dummy shopping activity simulation names and items
const SIMULATED_BUYERS = ["Grace", "Amina", "Wanjiku", "Akinyi", "Nekesa", "Muthoni", "Fatuma", "Chepngetich"]
const SIMULATED_TOWNS = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Nyeri", "Machakos"]

interface PurchaseNotification {
  id: number
  buyerName: string
  town: string
  productName: string
  image: string
}

export default function LandingPageClient({
  categories = [],
  trendingProducts = [],
}: LandingPageClientProps) {
  // State for slides
  const [activeSlide, setActiveSlide] = useState(0)
  
  // Real-time flash sale countdown state (initialized to 3h 44m 12s)
  const [timeLeft, setTimeLeft] = useState(13452) // in seconds
  
  // Simulated purchases state
  const [activePurchase, setActivePurchase] = useState<PurchaseNotification | null>(null)
  
  // Local state to simulate addition to cart for instant real-time feedback
  const [localCartItems, setLocalCartItems] = useState<Record<string, number>>({})

  // Merge Supabase trending products with fallbacks if DB has no contents
  const displayProducts = trendingProducts.length > 0 ? trendingProducts : FALLBACK_PRODUCTS

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_CAROUSEL_SLIDES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  // Live countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 14400 // Reset to 4 hours if hits 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Simulated real-time shopper notification loops (pops up every 18 seconds)
  useEffect(() => {
    const showNotification = () => {
      const buyer = SIMULATED_BUYERS[Math.floor(Math.random() * SIMULATED_BUYERS.length)] || "Grace"
      const town = SIMULATED_TOWNS[Math.floor(Math.random() * SIMULATED_TOWNS.length)] || "Nairobi"
      const product = displayProducts[Math.floor(Math.random() * displayProducts.length)]
      if (!product) return
      
      setActivePurchase({
        id: Date.now(),
        buyerName: buyer,
        town: town,
        productName: product.name,
        image: product.images[0] || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=80&q=80&auto=format&fit=crop"
      })

      // Hide after 5 seconds
      setTimeout(() => {
        setActivePurchase(null)
      }, 5000)
    }

    // First trigger in 8 seconds
    const timeout = setTimeout(() => {
      showNotification()
      const interval = setInterval(showNotification, 18000)
      return () => clearInterval(interval)
    }, 8000)

    return () => clearTimeout(timeout)
  }, [displayProducts])

  // Format seconds to hh:mm:ss
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return {
      hours: h.toString().padStart(2, "0"),
      minutes: m.toString().padStart(2, "0"),
      seconds: s.toString().padStart(2, "0")
    }
  }

  const { hours, minutes, seconds } = formatTime(timeLeft)

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Optimistic UI state increase
    setLocalCartItems((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] ?? 0) + 1
    }))

    // Call actual cart endpoints so that it persists if user is logged in
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      })
      if (response.ok) {
        emitCartUpdated()
      }
    } catch (err) {
      console.warn("Failed to write to API cart, falling back to local state trigger", err)
    }
    
    // Fallback/direct event dispatch
    emitCartUpdated()
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#241A1F]">
      {/* Dynamic Purchase alert banner in bottom corner */}
      <AnimatePresence>
        {activePurchase && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: -50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 30, x: -30 }}
            className="fixed bottom-6 left-6 z-50 flex max-w-sm items-center gap-3 rounded-xl border border-[#341327]/10 bg-white/95 p-3 shadow-2xl backdrop-blur-md"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePurchase.image}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 text-xs">
              <p className="font-semibold text-[#1C5C56]">
                {activePurchase.buyerName} from {activePurchase.town}
              </p>
              <p className="text-muted-foreground mt-0.5">
                just ordered {activePurchase.productName}
              </p>
              <span className="text-[10px] text-muted-foreground/75 mt-1 block">
                verified purchase
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Jumia Split Hub Banner Section */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          
          {/* Left Vertical Sidebar categories */}
          <div className="hidden rounded-xl border border-[#341327]/10 bg-white p-3 shadow-sm lg:block lg:col-span-1">
            <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </h3>
            <nav className="space-y-1">
              {SIDE_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-[#241A1F] transition-all hover:bg-[#F6EFE4]/60 hover:text-[#1C5C56]"
                >
                  <div className="h-6 w-6 shrink-0 overflow-hidden rounded-md bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cat.img}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="flex-1 truncate">{cat.name}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Center Carousel Slider (Plum and Gold premium presentation) */}
          <div className="relative overflow-hidden rounded-xl bg-[#341327] shadow-lg lg:col-span-2">
            <div className="relative h-[320px] w-full sm:h-[400px]">
              {HERO_CAROUSEL_SLIDES.map((slide, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    idx === activeSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.img}
                    alt=""
                    className="h-full w-full object-cover opacity-45"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#341327] via-[#341327]/85 to-transparent" />
                  
                  <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-8 sm:px-12 max-w-lg text-white">
                    <span className="mb-2 inline-block rounded-full bg-[#D9A441] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#341327]">
                      {slide.discount}
                    </span>
                    <h2 className="font-display text-3xl font-bold tracking-tight text-[#F6EFE4] sm:text-4xl md:text-5xl leading-none">
                      {slide.title}
                    </h2>
                    <p className="mt-3 text-sm text-[#F6EFE4]/80 leading-relaxed">
                      {slide.subtitle}
                    </p>
                    <div className="mt-6">
                      <Button asChild className="rounded-full bg-[#D9A441] text-[#341327] hover:bg-[#D9A441]/90">
                        <Link href={slide.link}>
                          {slide.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Slider controls */}
            <div className="absolute bottom-4 right-4 z-20 flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setActiveSlide(
                    (prev) =>
                      (prev - 1 + HERO_CAROUSEL_SLIDES.length) %
                      HERO_CAROUSEL_SLIDES.length
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveSlide((prev) => (prev + 1) % HERO_CAROUSEL_SLIDES.length)
                }
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Promotional static blocks */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:col-span-1">
            <div className="relative overflow-hidden rounded-xl bg-[#1C5C56] p-5 text-white shadow-sm flex flex-col justify-between min-h-[140px] sm:min-h-[190px]">
              <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9A441]">
                  Direct Checkout
                </span>
                <h4 className="mt-1.5 font-display text-lg font-semibold leading-tight text-[#F6EFE4]">
                  Pay Sellers Directly
                </h4>
                <p className="mt-1 text-xs text-[#F6EFE4]/80">
                  Send M-Pesa payments straight to the shop owner — no escrow, no fees.
                </p>
              </div>
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D9A441] hover:underline"
              >
                How it works
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-[#341327]/10 bg-white p-5 shadow-sm flex flex-col justify-between min-h-[140px] sm:min-h-[190px]">
              <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-[#D9A441]/10 blur-xl" />
              <div>
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Start Selling
                </span>
                <h4 className="mt-1.5 font-display text-lg font-semibold leading-tight text-[#341327]">
                  Register Your Store
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Reach thousands of ladies searching for style and skincare. Get verified in minutes.
                </p>
              </div>
              <Link
                href="/become-a-seller"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1C5C56] hover:underline"
              >
                Submit KYC guidelines
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Real-time Ticking Countdown Flash Sale Section */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-white border border-red-100 shadow-xl">
          <div className="bg-red-600 px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
              <h3 className="font-display text-xl font-bold uppercase tracking-wider">
                Flash Deals
              </h3>
            </div>
            
            <div className="flex items-center gap-2 bg-black/25 px-4 py-1.5 rounded-lg border border-white/20">
              <Clock className="h-4 w-4 text-red-300" />
              <span className="text-xs uppercase font-medium tracking-wide mr-1 text-red-200">
                Ends In:
              </span>
              <div className="flex items-center gap-1 font-mono text-sm font-bold">
                <span className="bg-black/60 px-2 py-0.5 rounded text-white">{hours}</span>
                <span>:</span>
                <span className="bg-black/60 px-2 py-0.5 rounded text-white">{minutes}</span>
                <span>:</span>
                <span className="bg-black/60 px-2 py-0.5 rounded text-white">{seconds}</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              {displayProducts.slice(0, 4).map((product, idx) => {
                const stockLeft = [4, 6, 2, 8][idx] ?? 5
                const totalStock = 12
                const percentSold = Math.round(((totalStock - stockLeft) / totalStock) * 100)
                
                return (
                  <div key={product.id} className="group relative flex flex-col rounded-xl border border-muted/75 bg-[#FDFBF7] p-3 transition-all duration-300 hover:shadow-lg">
                    {/* Discount badge */}
                    {product.discount && (
                      <span className="absolute left-4 top-4 z-10 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                        -{product.discount}% OFF
                      </span>
                    )}

                    <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden rounded-lg bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.images[0] || FALLBACK_CATEGORY_IMAGE}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    <div className="mt-3 flex-1 flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                        {product.sellerName}
                      </span>
                      <Link href={`/products/${product.slug}`} className="mt-0.5 line-clamp-1 text-sm font-semibold text-[#241A1F] hover:underline">
                        {product.name}
                      </Link>

                      {/* Pricing */}
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-base font-bold text-red-600">
                          KES {product.price.toLocaleString()}
                        </span>
                        {product.comparePrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            KES {product.comparePrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Stock Level Progress Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                          <span>{stockLeft} items left</span>
                          <span>{percentSold}% claimed</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-red-600 transition-all duration-1000"
                            style={{ width: `${percentSold}%` }}
                          />
                        </div>
                      </div>

                      {/* Add to Cart button */}
                      <div className="mt-4 pt-2">
                        <Button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="w-full rounded-lg bg-[#341327] hover:bg-[#341327]/90 text-white text-xs font-bold py-2"
                        >
                          <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Grid Section */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between border-b pb-4">
          <div>
            <h3 className="font-display text-2xl font-bold tracking-tight text-[#341327]">
              Trending Women's Items
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Curated drops from verified independent boutiques across Kenya
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1C5C56] hover:underline"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {displayProducts.map((product) => (
            <div
              key={product.id}
              className="group relative rounded-xl border border-[#341327]/10 bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-lg"
            >
              <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden rounded-lg bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.images[0] || FALLBACK_CATEGORY_IMAGE}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
              
              <div className="mt-3 flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  {product.sellerName}
                </span>
                <Link href={`/products/${product.slug}`} className="mt-0.5 line-clamp-2 text-sm font-medium text-[#241A1F] hover:underline">
                  {product.name}
                </Link>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-[#341327]">
                      KES {product.price.toLocaleString()}
                    </span>
                    {product.comparePrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        KES {product.comparePrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <Button
                    onClick={(e) => handleAddToCart(product, e)}
                    size="icon"
                    className="h-8 w-8 rounded-full bg-[#1C5C56]/10 text-[#1C5C56] hover:bg-[#1C5C56] hover:text-white"
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Verified Local Brands Banner */}
      <section className="bg-white border-y border-[#341327]/5 py-12 my-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#1C5C56] mb-8">
            Shop Verified Local Brands
          </h4>
          <div className="flex flex-wrap items-center justify-center gap-10">
            {FEATURED_BRANDS.map((brand) => (
              <div key={brand.name} className="flex flex-col items-center gap-2 group">
                <div className="h-16 w-16 overflow-hidden rounded-full border border-muted bg-muted transition-transform group-hover:scale-105">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={brand.img}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-xs font-semibold text-[#241A1F]/80">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex gap-4 rounded-xl border border-muted bg-white p-5 shadow-sm">
            <Truck className="h-8 w-8 text-[#1C5C56] shrink-0" />
            <div>
              <h5 className="font-semibold text-[#241A1F] text-sm">Country-wide Delivery</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Fast shipping from sellers in Nairobi to Kisumu, Mombasa, and beyond.
              </p>
            </div>
          </div>
          <div className="flex gap-4 rounded-xl border border-muted bg-white p-5 shadow-sm">
            <ShieldCheck className="h-8 w-8 text-[#1C5C56] shrink-0" />
            <div>
              <h5 className="font-semibold text-[#241A1F] text-sm">Verified Sellers</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Every merchant undergoes strict business registry and ID kyc checks.
              </p>
            </div>
          </div>
          <div className="flex gap-4 rounded-xl border border-muted bg-white p-5 shadow-sm">
            <BadgeCheck className="h-8 w-8 text-[#1C5C56] shrink-0" />
            <div>
              <h5 className="font-semibold text-[#241A1F] text-sm">Direct Dealings</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Chat with the business owners, choose matching colors/sizes, and pay via M-Pesa.
              </p>
            </div>
          </div>
          <div className="flex gap-4 rounded-xl border border-muted bg-white p-5 shadow-sm">
            <RotateCcw className="h-8 w-8 text-[#1C5C56] shrink-0" />
            <div>
              <h5 className="font-semibold text-[#241A1F] text-sm">Seller Return Guarantees</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Enjoy transparent return guidelines as agreed on product orders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing Newsletter Section */}
      <section className="relative overflow-hidden bg-[#341327] py-20 mt-16 text-center text-white">
        <div className="relative z-10 mx-auto max-w-2xl px-4">
          <h3 className="font-display text-3xl font-bold tracking-tight text-[#F6EFE4] sm:text-4xl">
            Get Drops Straight To Your Inbox
          </h3>
          <p className="mt-3 text-sm text-[#F6EFE4]/80 max-w-md mx-auto">
            Stay up to date with new boutique collections and weekly flash coupon codes.
          </p>
          <form className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
            <Input
              type="email"
              placeholder="Enter your email"
              className="h-12 flex-1 rounded-full border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-[#D9A441]/50"
              required
            />
            <Button type="submit" className="h-12 rounded-full bg-[#D9A441] text-[#341327] hover:bg-[#D9A441]/90 px-6 font-semibold">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}

interface LandingPageClientProps {
  categories?: CategoryDisplay[]
  trendingProducts?: Product[]
}
