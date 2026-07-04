"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Truck,
  ShieldCheck,
  BadgeCheck,
  RotateCcw,
} from "lucide-react"

import { Button } from "../../components/ui/button"
import { ProductCard, type Product } from "../../components/shared/product-card"
import { emitCartUpdated } from "../../lib/cart/use-cart-count"

export interface CategoryDisplay {
  name: string
  slug: string
  count: number
}

interface BrandDisplay {
  name: string
  slug: string
  logo: string | null
}

interface LandingPageClientProps {
  categories?: CategoryDisplay[]
  trendingProducts?: Product[]
  newArrivals?: Product[]
  brands?: BrandDisplay[]
}

const CATEGORY_IMAGES: Record<string, string> = {
  fashion: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80&auto=format&fit=crop",
  beauty: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80&auto=format&fit=crop",
  skincare: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80&auto=format&fit=crop",
  accessories: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80&auto=format&fit=crop",
  footwear: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80&auto=format&fit=crop",
  jewelry: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80&auto=format&fit=crop",
  health: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80&auto=format&fit=crop",
  home: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80&auto=format&fit=crop",
}
const FALLBACK_IMG = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80&auto=format&fit=crop"

const HERO_SLIDES = [
  {
    title: "New Season, New Style",
    subtitle: "Discover handcrafted fashion and beauty from Kenya's top independent sellers.",
    cta: "Shop Now",
    link: "/search",
    bg: "from-[#1C5C56] to-[#0f3d38]",
    accent: "#D9A441",
  },
  {
    title: "Glow From Within",
    subtitle: "Organic skincare and beauty essentials — verified, tested, and loved.",
    cta: "Explore Beauty",
    link: "/categories/beauty",
    bg: "from-[#341327] to-[#1a0a14]",
    accent: "#D9A441",
  },
  {
    title: "Handmade With Love",
    subtitle: "Maasai beaded crafts, sisal totes, and artisan jewelry — direct from makers.",
    cta: "View Accessories",
    link: "/categories/accessories",
    bg: "from-[#2d1b0e] to-[#1a1008]",
    accent: "#D9A441",
  },
]

const TRUST_FEATURES = [
  { icon: Truck, title: "Countrywide Delivery", desc: "Fast shipping from Nairobi to Mombasa, Kisumu, and beyond." },
  { icon: ShieldCheck, title: "Verified Sellers", desc: "Every merchant undergoes strict KYC and business registry checks." },
  { icon: BadgeCheck, title: "Direct to Seller", desc: "Chat with owners, choose colors and sizes, pay via M-Pesa." },
  { icon: RotateCcw, title: "Return Guarantees", desc: "Transparent return policies on every order." },
]

export default function LandingPageClient({
  categories = [],
  trendingProducts = [],
  newArrivals = [],
  brands = [],
}: LandingPageClientProps) {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      })
      if (res.ok) emitCartUpdated()
    } catch {
      emitCartUpdated()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1C5C56] to-[#0f3d38]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Category Sidebar */}
            <div className="hidden lg:col-span-3 lg:block">
              <div className="rounded-lg bg-white shadow-sm">
                <nav className="py-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/categories/${cat.slug}`}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#1C5C56]/5 hover:text-[#1C5C56] transition-colors"
                    >
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={CATEGORY_IMAGES[cat.slug] ?? FALLBACK_IMG} alt="" className="h-full w-full object-cover" />
                      </div>
                      <span className="flex-1 truncate font-medium">{cat.name}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            {/* Hero Carousel */}
            <div className="relative overflow-hidden rounded-lg lg:col-span-6">
              <div className="relative h-[280px] sm:h-[360px]">
                {HERO_SLIDES.map((slide, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-700 ${idx === activeSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                  >
                    <div className={`h-full w-full bg-gradient-to-r ${slide.bg} p-8 sm:p-12 flex flex-col justify-center`}>
                      <span className="mb-3 inline-block w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90">
                        Featured
                      </span>
                      <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl leading-tight">
                        {slide.title}
                      </h2>
                      <p className="mt-3 max-w-md text-sm text-white/75 leading-relaxed">
                        {slide.subtitle}
                      </p>
                      <div className="mt-6">
                        <Button asChild className="rounded-full bg-[#D9A441] text-[#1a0a14] hover:bg-[#D9A441]/90 font-semibold">
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
              {/* Carousel controls */}
              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                {HERO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2 rounded-full transition-all ${idx === activeSlide ? "w-6 bg-[#D9A441]" : "w-2 bg-white/40"}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
                className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50"
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Right Promo Blocks */}
            <div className="grid grid-cols-2 gap-4 lg:col-span-3 lg:grid-cols-1">
              <div className="rounded-lg bg-[#D9A441] p-5 text-[#1a0a14]">
                <p className="text-xs font-bold uppercase tracking-wider opacity-70">Direct Checkout</p>
                <h4 className="mt-2 text-lg font-bold leading-tight">Pay Sellers Directly</h4>
                <p className="mt-1 text-xs opacity-80">M-Pesa payments straight to the shop owner.</p>
                <Link href="/about" className="mt-3 inline-flex items-center gap-1 text-xs font-bold hover:underline">
                  Learn more <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="rounded-lg bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Start Selling</p>
                <h4 className="mt-2 text-lg font-bold text-gray-900 leading-tight">Register Your Store</h4>
                <p className="mt-1 text-xs text-gray-500">Reach thousands of shoppers. Get verified in minutes.</p>
                <Link href="/become-a-seller" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#1C5C56] hover:underline">
                  Apply now <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <p className="mt-1 text-sm text-gray-500">Browse our curated collections</p>
          </div>
          <Link href="/categories" className="inline-flex items-center gap-1 text-sm font-semibold text-[#1C5C56] hover:underline">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="aspect-square overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={CATEGORY_IMAGES[cat.slug] ?? FALLBACK_IMG}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-3 text-center">
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#1C5C56]">{cat.name}</h3>
                <p className="mt-0.5 text-xs text-gray-400">{cat.count} items</p>
              </div>
            </Link>
          ))}
          {categories.length === 0 && (
            <>
              {Object.entries(CATEGORY_IMAGES).slice(0, 6).map(([slug, img]) => (
                <Link
                  key={slug}
                  href={`/categories/${slug}`}
                  className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md"
                >
                  <div className="aspect-square overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={slug} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <div className="p-3 text-center">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#1C5C56] capitalize">{slug}</h3>
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>
      </section>

      {/* Trending Products */}
      {trendingProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
              <p className="mt-1 text-sm text-gray-500">Popular items from verified sellers</p>
            </div>
            <Link href="/search" className="inline-flex items-center gap-1 text-sm font-semibold text-[#1C5C56] hover:underline">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {trendingProducts.map((product) => (
              <div key={product.id} className="group">
                <ProductCard product={product} />
                <div className="mt-2 px-1">
                  <Button
                    onClick={(e) => handleAddToCart(product, e)}
                    size="sm"
                    className="w-full bg-[#1C5C56] hover:bg-[#1C5C56]/90 text-white text-xs"
                  >
                    <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Just Arrived</h2>
              <p className="mt-1 text-sm text-gray-500">Fresh drops from our sellers</p>
            </div>
            <Link href="/search?sort=newest" className="inline-flex items-center gap-1 text-sm font-semibold text-[#1C5C56] hover:underline">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {newArrivals.map((product) => (
              <div key={product.id} className="group">
                <ProductCard product={product} />
                <div className="mt-2 px-1">
                  <Button
                    onClick={(e) => handleAddToCart(product, e)}
                    size="sm"
                    className="w-full bg-[#1C5C56] hover:bg-[#1C5C56]/90 text-white text-xs"
                  >
                    <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <section className="bg-white py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Featured Sellers</h2>
              <p className="mt-1 text-sm text-gray-500">Verified local brands you can trust</p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-8">
              {brands.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/sellers/${brand.slug}`}
                  className="group flex flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-gray-50"
                >
                  <div className="h-14 w-14 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                    {brand.logo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={brand.logo} alt={brand.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-400">
                        {brand.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-center text-xs font-medium text-gray-700 group-hover:text-[#1C5C56] line-clamp-1">
                    {brand.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_FEATURES.map((feat) => (
            <div key={feat.title} className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-5">
              <feat.icon className="h-8 w-8 shrink-0 text-[#1C5C56]" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{feat.title}</h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl bg-gradient-to-r from-[#1C5C56] to-[#0f3d38] p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to Start Shopping?</h2>
          <p className="mt-2 text-sm text-white/75">Join thousands of women discovering Kenya&apos;s best independent sellers.</p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Button asChild className="rounded-full bg-[#D9A441] text-[#1a0a14] hover:bg-[#D9A441]/90 font-semibold">
              <Link href="/search">
                Browse Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10">
              <Link href="/become-a-seller">Sell on the Platform</Link>
            </Button>
          </div>
        </div>
      </section>


    </div>
  )
}
