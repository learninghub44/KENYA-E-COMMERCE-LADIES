"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Link from "next/link"
import {
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ChevronRight,
} from "lucide-react"

import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { ProductCard, type Product } from "../../components/shared/product-card"
import { EmptyState } from "../../components/shared/empty-state"

export interface CategoryDisplay {
  name: string
  slug: string
  count: number
}

// Photos sourced from Unsplash (free license, unsplash.com/license). Category tiles and the
// trust-badge row use photography instead of icons for a more editorial, less "template" feel.
const CATEGORY_IMAGE_BY_SLUG: Record<string, string> = {
  fashion: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80&auto=format&fit=crop",
  beauty: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80&auto=format&fit=crop",
  skincare: "https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=800&q=80&auto=format&fit=crop",
  accessories: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80&auto=format&fit=crop",
  wellness: "https://images.unsplash.com/photo-1620733723572-11c53f73a416?w=800&q=80&auto=format&fit=crop",
  lifestyle: "https://images.unsplash.com/photo-1603400521630-9f2de124b33b?w=800&q=80&auto=format&fit=crop",
}
const FALLBACK_CATEGORY_IMAGE = CATEGORY_IMAGE_BY_SLUG.fashion!

function imageForCategory(slug: string) {
  return CATEGORY_IMAGE_BY_SLUG[slug] ?? FALLBACK_CATEGORY_IMAGE
}

const features = [
  {
    image: "https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=400&q=80&auto=format&fit=crop",
    title: "Free Delivery",
    description: "Free shipping on orders over KES 5,000 across Kenya",
  },
  {
    image: "https://images.unsplash.com/photo-1742836531239-1fe146bf7e3f?w=400&q=80&auto=format&fit=crop",
    title: "Secure Payments",
    description: "Protected payments via M-Pesa, card, or bank transfer",
  },
  {
    image: "https://images.unsplash.com/photo-1652766540048-de0a878a3266?w=400&q=80&auto=format&fit=crop",
    title: "Authentic Products",
    description: "Every item verified for quality and authenticity",
  },
  {
    image: "https://images.unsplash.com/photo-1512418490979-92798cec1380?w=400&q=80&auto=format&fit=crop",
    title: "Easy Returns",
    description: "30-day return policy, no questions asked",
  },
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

interface LandingPageClientProps {
  categories: CategoryDisplay[]
  trendingProducts: Product[]
}

export default function LandingPageClient({ categories, trendingProducts }: LandingPageClientProps) {
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
                <Link href={categories[0] ? `/categories/${categories[0].slug}` : "/search"}>
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

      {categories.length > 0 && (
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
              const image = imageForCategory(category.slug)
              return (
                <motion.div key={category.slug} variants={itemVariants}>
                  <Link href={`/categories/${category.slug}`} className="group block">
                    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                      <div className="relative h-36 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                        <div className="absolute inset-0 flex items-start justify-end p-4">
                          <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">
                            {category.count.toLocaleString()} items
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
      )}

      <section className="bg-muted/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="mb-12 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Trending Now</h2>
                <p className="mt-2 text-muted-foreground">Most popular items this week</p>
              </div>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/search?sort=featured">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </AnimatedSection>
          {trendingProducts.length > 0 ? (
            <>
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
                  <Link href="/search?sort=featured">
                    View All Trending
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <EmptyState
              icon={ShoppingBag}
              title="New arrivals coming soon"
              description="Sellers are still stocking the shelves — check back shortly, or browse the full catalog."
              action={
                <Button asChild variant="outline">
                  <Link href="/search">Browse all products</Link>
                </Button>
              }
            />
          )}
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
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="h-full text-center transition-all duration-300 hover:shadow-lg">
                <CardContent className="flex flex-col items-center p-6">
                  <div className="mb-4 h-16 w-16 overflow-hidden rounded-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={feature.image} alt="" className="h-full w-full object-cover" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
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
