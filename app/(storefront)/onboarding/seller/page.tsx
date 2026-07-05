"use client"

import { useAuth } from "../../../../lib/auth/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { WizardProvider, WizardShell, StepSidebar, useWizard, useAutosave } from "../../../../components/shared/wizard"
import type { WizardStep } from "../../../../components/shared/wizard"
import {
  SellerWelcomeStep,
  BusinessInfoStep,
  BrandingStep,
  SellerContactStep,
  DeliveryStep,
  PoliciesStep,
  VerificationStep,
  SellerSuccessStep,
} from "../../../../components/shared/onboarding/seller-steps"
import { Loader2, Store } from "lucide-react"

const STEPS: WizardStep[] = [
  { id: "welcome", label: "Welcome" },
  { id: "business", label: "Business Information" },
  { id: "branding", label: "Store Branding", optional: true },
  { id: "contact", label: "Contact Information" },
  { id: "delivery", label: "Delivery Setup" },
  { id: "policies", label: "Marketplace Policies" },
  { id: "verification", label: "Verification", optional: true },
  { id: "success", label: "All Done!" },
]

function SellerOnboardingInner() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<Record<string, unknown>>({})
  const [sellerId, setSellerId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { currentStep, nextStep, prevStep, markComplete, steps: wizardSteps } = useWizard()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirectTo=/onboarding/seller")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    fetch("/api/onboarding/seller")
      .then((r) => r.json())
      .then((d) => {
        if (d.completed) {
          router.push("/seller")
          return
        }
        if (d.seller) {
          setSellerId(d.seller.id)
          setData((prev) => ({
            ...prev,
            storeName: d.seller.storeName ?? "",
            description: d.seller.description ?? "",
            logoUrl: d.seller.logoUrl ?? "",
            bannerUrl: d.seller.bannerUrl ?? "",
            supportEmail: d.seller.supportEmail ?? "",
            supportPhone: d.seller.supportPhone ?? "",
            county: d.seller.county ?? "",
            ...d.onboarding,
          }))
        } else {
          setData((prev) => ({ ...prev, ...d.onboarding }))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user, router])

  const { saveImmediate } = useAutosave({
    userId: user?.id,
    table: "sellers",
    recordId: sellerId,
    data,
    enabled: !loading && !!user && !!sellerId,
  })

  const updateData = useCallback((patch: Record<string, unknown>) => {
    setData((prev) => ({ ...prev, ...patch }))
  }, [])

  const handleNext = useCallback(async () => {
    setSaving(true)
    setError(null)
    try {
      const stepId = wizardSteps[currentStep]?.id ?? "unknown"
      const res = await fetch("/api/onboarding/seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: stepId, data }),
      })
      const result = await res.json()

      if (!res.ok || result.error) {
        // Previously this was never checked, so a failed save (e.g. the
        // seller insert erroring under the hood) silently advanced the
        // wizard anyway, leaving sellerId unset and every later step
        // failing with a 404 the user never saw. Surface it instead.
        setError(result.error || "Something went wrong saving this step. Please try again.")
        return
      }

      if (result.sellerId && !sellerId) {
        setSellerId(result.sellerId)
      }
      markComplete(currentStep)
      if (currentStep === wizardSteps.length - 1) {
        router.push("/seller")
      } else {
        nextStep()
      }
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }, [currentStep, data, wizardSteps, sellerId, markComplete, nextStep, router])

  const currentStepDef = wizardSteps[currentStep]
  const isOptional = currentStepDef?.optional
  const isLast = currentStep === wizardSteps.length - 1

  let canProceed = true
  if (currentStep === 1) {
    canProceed = !!(data.storeName as string)?.trim() && (data.storeName as string).length >= 3
  } else if (currentStep === 5) {
    canProceed = !!data.policiesAccepted
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  function renderStep() {
    switch (currentStepDef?.id) {
      case "welcome": return <SellerWelcomeStep data={data} onUpdate={updateData} />
      case "business": return <BusinessInfoStep data={data} onUpdate={updateData} />
      case "branding": return <BrandingStep data={data} onUpdate={updateData} />
      case "contact": return <SellerContactStep data={data} onUpdate={updateData} />
      case "delivery": return <DeliveryStep data={data} onUpdate={updateData} />
      case "policies": return <PoliciesStep data={data} onUpdate={updateData} />
      case "verification": return <VerificationStep data={data} onUpdate={updateData} />
      case "success": return <SellerSuccessStep data={data} onUpdate={updateData} sellerId={sellerId} />
      default: return null
    }
  }

  return (
    <WizardShell
      sidebar={<StepSidebar icon={Store} />}
      currentStepContent={
        <>
          {error && (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {renderStep()}
        </>
      }
      onNext={handleNext}
      onPrev={prevStep}
      nextLabel={isLast ? "Go to Seller Dashboard" : "Continue"}
      nextDisabled={!canProceed}
      nextLoading={saving}
      isLastStep={isLast}
      showSkip={isOptional && !isLast}
      onSkip={() => { markComplete(currentStep); nextStep() }}
    />
  )
}

export default function SellerOnboardingPage() {
  return (
    <WizardProvider steps={STEPS}>
      <SellerOnboardingInner />
    </WizardProvider>
  )
}
