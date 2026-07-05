"use client"

import { useState, useEffect } from "react"
import { X, ArrowRight, Package, ShoppingCart, BarChart3, MessageSquare, HelpCircle } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { createSupabaseBrowserClient } from "../../lib/supabase/client"

interface TourStep {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  highlight: string
  action: string
}

const SELLER_TOUR_STEPS: TourStep[] = [
  {
    title: "Products",
    description: "Add, edit, and manage your product catalog. Upload photos, set prices, and track inventory.",
    icon: Package,
    highlight: "products",
    action: "/seller/products",
  },
  {
    title: "Orders",
    description: "View incoming orders, update their status, and communicate with buyers about deliveries.",
    icon: ShoppingCart,
    highlight: "orders",
    action: "/seller/orders",
  },
  {
    title: "Analytics",
    description: "Track your sales performance, views, and conversion rates over time.",
    icon: BarChart3,
    highlight: "analytics",
    action: "/seller/analytics",
  },
  {
    title: "Messages",
    description: "Respond to customer inquiries and manage conversations with buyers.",
    icon: MessageSquare,
    highlight: "messages",
    action: "/seller/messages",
  },
  {
    title: "Need Help?",
    description: "Check our seller guides, FAQ, or contact support for assistance.",
    icon: HelpCircle,
    highlight: "help",
    action: "/faqs",
  },
]

interface DashboardTourProps {
  role: "seller" | "buyer"
  onComplete: () => void
}

export function DashboardTour({ role, onComplete }: DashboardTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [visible, setVisible] = useState(false)

  const steps = role === "seller" ? SELLER_TOUR_STEPS : []

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const key = `tour_completed_${role}_${user.id}`
      const completed = localStorage.getItem(key)
      if (!completed) {
        setTimeout(() => setVisible(true), 1000)
      }
    })
  }, [role])

  function handleDismiss() {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        localStorage.setItem(`tour_completed_${role}_${user.id}`, "true")
      }
    })
    setVisible(false)
    onComplete()
  }

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      handleDismiss()
    }
  }

  if (!visible || steps.length === 0) return null

  const step = steps[currentStep]
  if (!step) return null
  const Icon = step.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </div>
            <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Icon className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleDismiss}>
              Skip Tour
            </Button>
            <Button className="flex-1" onClick={handleNext}>
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
              {currentStep < steps.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>

          <div className="mt-4 flex justify-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep ? "w-6 bg-primary" : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
