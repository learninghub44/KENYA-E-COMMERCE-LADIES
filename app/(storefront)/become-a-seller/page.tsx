import Link from "next/link"
import { Store, TrendingUp, ShieldCheck, Smartphone, ArrowRight, CheckCircle2 } from "lucide-react"

import { Button } from "../../../components/ui/button"
import { Card, CardContent } from "../../../components/ui/card"

export const metadata = {
  title: "Become a Seller | Zuri Market",
  description: "Sell your fashion, beauty, and lifestyle products to shoppers across Kenya on Zuri Market.",
}

const benefits = [
  {
    icon: TrendingUp,
    title: "Reach more shoppers",
    description: "Get discovered by customers browsing curated categories and trending collections.",
  },
  {
    icon: Smartphone,
    title: "M-Pesa payouts",
    description: "Get paid directly via M-Pesa, card, or bank transfer through secure Paystack/PayHero rails.",
  },
  {
    icon: ShieldCheck,
    title: "Verified & trusted",
    description: "KYC verification and buyer reviews help build trust with every sale you make.",
  },
  {
    icon: Store,
    title: "Your own storefront",
    description: "A branded store page, inventory tools, and order management built for Kenyan sellers.",
  },
]

const steps = [
  "Create your free Zuri Market account",
  "Tell us about your store and complete KYC verification",
  "List your products and set your prices",
  "Start selling and get paid via M-Pesa",
]

export default function BecomeASellerPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-900 via-fuchsia-900 to-purple-900 py-20">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Grow Your Business on Zuri Market
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg text-white/80">
            Join Kenyan sellers reaching new customers with fashion, beauty, and lifestyle products —
            with M-Pesa payouts and tools built for your business.
          </p>
          <Button asChild size="lg" className="bg-white text-rose-900 hover:bg-white/90">
            <Link href="/become-a-seller/apply">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">Why Sell With Us</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Everything you need to run and grow your store, in one place.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <Card key={benefit.title} className="h-full text-center transition-all duration-300 hover:shadow-lg">
                <CardContent className="flex flex-col items-center p-6">
                  <div className="mb-4 rounded-full bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="bg-muted/50 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
          </div>
          <ol className="space-y-4">
            {steps.map((step, index) => (
              <li key={step} className="flex items-start gap-4 rounded-lg bg-background p-4 shadow-sm">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <span className="pt-1 text-sm sm:text-base">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-r from-rose-900 to-purple-900 py-20">
        <div className="relative z-10 mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to start selling?</h2>
          <p className="mb-8 flex items-center justify-center gap-2 text-white/80">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            No listing fees to get started
          </p>
          <Button asChild size="lg" className="bg-white text-rose-900 hover:bg-white/90">
            <Link href="/become-a-seller/apply">
              Create Your Store
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
