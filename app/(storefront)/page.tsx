"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import {
  Sparkles,
  ShoppingBag,
  Palette,
  Heart,
  ShieldCheck,
  Truck,
  Lock,
  RefreshCw,
  ArrowRight,
  ChevronRight,
} from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { ProductCard } from "../../components/shared/product-card"
import { Rating } from "../../components/shared/rating"
import { Price } from "../../components/shared/price"

const categories = [
  { name: "Fashion", slug: "fashion", icon: ShoppingBag, color: "from-pink-500 to-rose-500", count: "2,400+" },
  { name: "Beauty", slug: "beauty", icon: Sparkles, color: "from-purple-500 to-violet-500", count: "1,800+" },
  { name: "Skincare", slug: "skincare", icon: Palette, color: "from-green-400 to-emerald-500", count: "950+" },
  { name: "Accessories", slug: "accessories", icon: Heart, color: "from-amber-400 to-orange-500", count: "1,200+" },
  { name: "Wellness", slug: "wellness", icon: ShieldCheck, color: "from-sky-400 to-blue-500", count: "680+" },
  { name: "Lifestyle", slug: "lifestyle", icon: Sparkles, color: "from-teal-400 to-cyan-500", count: "890+" },
]

const trendingProducts = [
  { id: "1", name: "Premium African Print Maxi Dress", price: 8500, comparePrice: 12000, images: [], rating: 4.8, reviewCount: 124, isNew: true, discount: 29, sellerName: "Nairobi Styles", slug: "premium-african-print-maxi-dress" },
  { id: "2", name: "Handcrafted Beaded Statement Necklace", price: 3200, comparePrice: null, images: [], rating: 4.6, reviewCount: 89, isNew: true, discount: null, sellerName: "Makena Accessories", slug: "handcrafted-beaded-statement-necklace" },
  { id: "3", name: "Organic Shea Butter Moisturizer", price: 1800, comparePrice: 2500, images: [], rating: 4.9, reviewCount: 256, isNew: false, discount: 28, sellerName: "PureGlow Kenya", slug: "organic-shea-butter-moisturizer" },
  { id: "4", name: "Linen Blend Tailored Blazer", price: 9500, comparePrice: null, images: [], rating: 4.7, reviewCount: 67, isNew: true, discount: null, sellerName: "Safari Chic", slug: "linen-blend-tailored-blazer" },
  { id: "5", name: "Leather Crossbody Bag", price: 6200, comparePrice: 7800, images: [], rating: 4.5, reviewCount: 143, isNew: false, discount: 21, sellerName: "Urban Leather Co.", slug: "leather-crossbody-bag" },
  { id: "6", name: "Kente Print Wrap Skirt", price: 4800, comparePrice: null, images: [], rating: 4.8, reviewCount: 98, isNew: true, discount: null, sellerName: "Accra Threads", slug: "kente-print-wrap-skirt" },
  { id: "7", name: "Vitamin C Brightening Serum", price: 2400, comparePrice: 3200, images: [], rating: 4.7, reviewCount: 312, isNew: false, discount: 25, sellerName: "GlowLab Africa", slug: "vitamin-c-brightening-serum" },
  { id: "8", name: "Handwoven Raffia Sandals", price: 3600, comparePrice: null, images: [], rating: 4.4, reviewCount: 76, isNew: true, discount: null, sellerName: "Coastal Crafts", slug: "handwoven-raffia-sandals" },
]

const features = [
  { icon: Truck, title: "Free Delivery", description: "Free shipping on orders over KES 5,000 across Kenya" },
  { icon: Lock, title: "Secure Payments", description: "Protected payments via M-Pesa, card, or bank transfer" },
  { icon: ShieldCheck, title: "Authentic Products", description: "Every item verified for quality and authenticity" },
  { icon: RefreshCw, title: "Easy Returns", description: "30-day return policy, no questions asked" },
]

function AnimatedSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function LandingPage() {
  return (
    <div>
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-gradient-to-br from-rose-900 via-fuchsia-900 to-purple-900">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge variant="secondary" className="mb-6 inline-flex items-center gap-1.5 px-4 py-1.5 text-sm">
              <Sparkles className="h-4 w-4" />
              Curated Luxury for the Modern Woman
            </Badge>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Discover Your Style
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80 sm:text-xl">
              Explore an exclusive collection of African-inspired fashion, beauty, and lifestyle products from Kenya&apos;s finest creators and brands.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="min-w-[180px] bg-white text-rose-900 hover:bg-white/90">
                <Link href="/categories/fashion">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="min-w-[180px] border-white/30 text-white hover:bg-white/10">
                <Link href="/become-a-seller">
                  Become a Seller
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">Shop by Category</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Find everything you need from our curated collections
            </p>
          </div>
        </AnimatedSection>
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <motion.div key={category.slug} variants={itemVariants}>
                <Link href={`/categories/${category.slug}`} className="group block">
                  <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className={cn("bg-gradient-to-br p-6", category.color)}>
                      <div className="flex items-center justify-between">
                        <Icon className="h-10 w-10 text-white" aria-hidden="true" />
                        <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">
                          {category.count} items
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">Shop Now</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      <section className="bg-muted/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="mb-12 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Trending Now</h2>
                <p className="mt-2 text-muted-foreground">Most popular items this week</p>
              </div>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/trending">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </AnimatedSection>
          <div className="relative -mx-4 overflow-hidden px-4">
            <motion.div
              className="flex gap-6 overflow-x-auto pb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {trendingProducts.map((product) => (
                <div key={product.id} className="min-w-[260px] flex-shrink-0 sm:min-w-[280px]">
                  <ProductCard product={product} />
                </div>
              ))}
            </motion.div>
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Button asChild variant="outline">
              <Link href="/trending">
                View All Trending
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">Why Shop With Us</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              We make luxury shopping effortless and secure
            </p>
          </div>
        </AnimatedSection>
        <motion.div
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div key={feature.title} variants={itemVariants}>
                <Card className="h-full text-center transition-all duration-300 hover:shadow-lg">
                  <CardContent className="flex flex-col items-center p-6">
                    <div className="mb-4 rounded-full bg-primary/10 p-3">
                      <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="mb-2 font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-r from-rose-900 to-purple-900 py-20">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 mx-auto max-w-2xl px-4 text-center sm:px-6">
          <AnimatedSection>
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Stay In the Loop</h2>
            <p className="mb-8 text-white/80">
              Subscribe to receive exclusive offers, new arrivals, and style inspiration straight to your inbox.
            </p>
            <form
              className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
              aria-label="Newsletter subscription"
            >
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <Input
                id="newsletter-email"
                type="email"
                placeholder="Enter your email"
                className="h-12 flex-1 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/30"
                required
                aria-required="true"
              />
              <Button type="submit" size="lg" className="h-12 bg-white text-rose-900 hover:bg-white/90">
                Subscribe
              </Button>
            </form>
            <p className="mt-4 text-xs text-white/50">
              No spam, ever. Unsubscribe anytime.
            </p>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
