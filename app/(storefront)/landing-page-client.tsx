"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Link from "next/link"
import {
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  Truck,
  ShieldCheck,
  BadgeCheck,
  RotateCcw,
} from "lucide-react"

import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { ProductCard, type Product } from "../../components/shared/product-card"
import { EmptyState } from "../../components/shared/empty-state"

export interface CategoryDisplay {
  name: string
  slug: string
  count: number
}

// Photos sourced from Unsplash (free license, unsplash.com/license).
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
    icon: Truck,
    title: "Free delivery",
    description: "On every order over KES 5,000, anywhere in Kenya",
  },
  {
    icon: ShieldCheck,
    title: "Pay sellers directly",
    description: "Send M-Pesa straight to the seller — we never hold or collect your money",
  },
  {
    icon: BadgeCheck,
    title: "Verified sellers",
    description: "Every store on Zuri Market passes ID and quality checks",
  },
  {
    icon: RotateCcw,
    title: "Easy returns",
    description: "30 days to change your mind, no interrogation",
  },
]

// Signature element: a bordered text ribbon modeled on the printed message-borders found on
// real kanga cloth — a strip of words framed by thin rules and small diamond marks. Reused at
// the foot of the hero, between sections, and in the closing banner so it reads as one
// throughline rather than one-off decoration.
function KangaStrip({
  words,
  tone = "gold",
  className = "",
}: {
  words: string
  tone?: "gold" | "teal" | "ink"
  className?: string
}) {
  const toneClasses =
    tone === "gold"
      ? "bg-[#D9A441] text-[#341327]"
      : tone === "teal"
        ? "bg-[#1C5C56] text-[#F6EFE4]"
        : "bg-[#341327] text-[#F6EFE4]"
  return (
    <div className={`w-full overflow-hidden ${toneClasses} ${className}`}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2.5 text-center text-[0.7rem] font-semibold uppercase tracking-[0.25em] sm:text-xs">
        {words.split("·").map((word, i) => (
          <span key={i} className="flex items-center gap-3">
            {i > 0 && <span aria-hidden className="inline-block h-1.5 w-1.5 rotate-45 bg-current opacity-60" />}
            {word.trim()}
          </span>
        ))}
      </div>
    </div>
  )
}

// Abstract diamond lattice, echoing kitenge/kanga geometric borders without reproducing any
// specific cloth's copyrighted print. Rendered as a low-opacity background texture.
function DiamondLattice({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id="diamond-lattice" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M24 4 L44 24 L24 44 L4 24 Z" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#diamond-lattice)" />
    </svg>
  )
}

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
    <div className="font-sans">
      {/* Hero — deep plum ground, no stock photo. The diamond lattice and kanga strip carry the
          identity instead of a generic gradient-and-photo hero. */}
      <section className="relative overflow-hidden bg-[#341327]">
        <DiamondLattice className="pointer-events-none absolute inset-0 text-[#D9A441] opacity-[0.07]" />
        <div className="absolute -left-24 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[#1C5C56] opacity-30 blur-3xl" />
        <div className="absolute -right-16 top-10 h-72 w-72 rounded-full bg-[#D9A441] opacity-20 blur-3xl" />

        <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-5xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D9A441]/40 bg-[#D9A441]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#D9A441]">
              Karibu · Zuri Market
            </span>
            <h1 className="mb-5 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-[#F6EFE4] sm:text-6xl md:text-7xl">
              Beauty, worn
              <br />
              <span className="italic text-[#D9A441]">your way.</span>
            </h1>
            <p className="mx-auto mb-9 max-w-xl text-lg text-[#F6EFE4]/70">
              Fashion, beauty, and wellness from independent Kenyan sellers — every store verified,
              every order backed.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="min-w-[180px] rounded-full bg-[#D9A441] text-[#341327] hover:bg-[#D9A441]/90"
              >
                <Link href={categories[0] ? `/categories/${categories[0].slug}` : "/search"}>
                  Shop now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="min-w-[180px] rounded-full border-[#F6EFE4]/30 bg-transparent text-[#F6EFE4] hover:bg-[#F6EFE4]/10"
              >
                <Link href="/become-a-seller">
                  Become a seller
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        <KangaStrip words="Poa Prices · Verified Sellers · Made For Kenya" tone="gold" />
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="mb-12 text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#1C5C56]">Browse</p>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-[#241A1F] sm:text-4xl">
                Shop by category
              </h2>
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
                    <div className="overflow-hidden rounded-2xl border border-[#341327]/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                      <div className="relative h-40 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#341327]/70 via-transparent to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
                          <h3 className="font-display text-lg font-semibold text-white">{category.name}</h3>
                          <span className="rounded-full bg-[#D9A441] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-[#341327]">
                            {category.count.toLocaleString()} items
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm font-medium text-[#1C5C56]">Shop now</span>
                        <ArrowRight className="h-4 w-4 text-[#1C5C56] transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </section>
      )}

      <KangaStrip words="Trending This Week · Kenya's Sellers, Your Style" tone="teal" />

      <section className="bg-[#F6EFE4] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="mb-12 flex items-end justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#1C5C56]">Right now</p>
                <h2 className="font-display text-3xl font-semibold tracking-tight text-[#241A1F] sm:text-4xl">
                  Trending
                </h2>
              </div>
              <Button asChild variant="ghost" className="hidden text-[#1C5C56] hover:bg-[#1C5C56]/10 sm:inline-flex">
                <Link href="/search?sort=featured">
                  View all
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </AnimatedSection>
          {trendingProducts.length > 0 ? (
            <>
              <div className="relative -mx-4 overflow-hidden px-4">
                <motion.div
                  className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
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
                    View all trending
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
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#1C5C56]">Why Zuri Market</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-[#241A1F] sm:text-4xl">
              Shopping you can trust
            </h2>
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
              <div className="flex h-full flex-col items-center rounded-2xl border border-[#341327]/10 p-6 text-center transition-all duration-300 hover:border-[#D9A441]/40 hover:shadow-lg">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#1C5C56]/10">
                  <feature.icon className="h-6 w-6 text-[#1C5C56]" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-[#241A1F]">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Closing banner — same plum/gold/lattice language as the hero, so the page opens and
          closes on the same note instead of switching to a different template look. */}
      <section className="relative overflow-hidden bg-[#341327] py-20">
        <DiamondLattice className="pointer-events-none absolute inset-0 text-[#D9A441] opacity-[0.06]" />
        <div className="relative z-10 mx-auto max-w-2xl px-4 text-center sm:px-6">
          <AnimatedSection>
            <h2 className="mb-3 font-display text-3xl font-semibold tracking-tight text-[#F6EFE4] sm:text-4xl">
              Asante for shopping local
            </h2>
            <p className="mb-8 text-[#F6EFE4]/70">
              New arrivals and seller drops, straight to your inbox — no spam, ever.
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
                className="h-12 flex-1 rounded-full border-[#F6EFE4]/20 bg-[#F6EFE4]/10 text-[#F6EFE4] placeholder:text-[#F6EFE4]/50 focus-visible:ring-[#D9A441]/50"
                required
                aria-required="true"
              />
              <Button
                type="submit"
                size="lg"
                className="h-12 rounded-full bg-[#D9A441] text-[#341327] hover:bg-[#D9A441]/90"
              >
                Subscribe
              </Button>
            </form>
          </AnimatedSection>
        </div>
        <KangaStrip words="Karibu Tena · Come Back Soon" tone="ink" className="mt-20" />
      </section>
    </div>
  )
}
