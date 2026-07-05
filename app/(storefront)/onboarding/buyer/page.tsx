"use client"

import { useAuth } from "../../../../lib/auth/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { WizardProvider, WizardShell, StepSidebar, useWizard, useAutosave } from "../../../../components/shared/wizard"
import type { WizardStep } from "../../../../components/shared/wizard"
import {
  WelcomeStep,
  FullNameStep,
  PhotoStep,
  PhoneStep,
  LocationStep,
  InterestsStep,
  NotificationsStep,
  ConfirmationStep,
} from "../../../../components/shared/onboarding/buyer-steps"
import { Loader2, ShoppingBag } from "lucide-react"

const STEPS: WizardStep[] = [
  { id: "welcome", label: "Welcome" },
  { id: "name", label: "Full Name" },
  { id: "photo", label: "Profile Photo", optional: true },
  { id: "phone", label: "Phone Number", optional: true },
  { id: "location", label: "Location", optional: true },
  { id: "interests", label: "Interests", optional: true },
  { id: "notifications", label: "Notifications", optional: true },
  { id: "confirmation", label: "All Done!" },
]

function BuyerOnboardingInner() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<Record<string, unknown>>({ role: "buyer" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const { currentStep, nextStep, prevStep, markComplete, steps: wizardSteps } = useWizard()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirectTo=/onboarding/buyer")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    fetch("/api/onboarding/buyer")
      .then((r) => r.json())
      .then((d) => {
        if (d.completed) {
          router.push("/")
          return
        }
        setData((prev) => ({
          ...prev,
          displayName: d.profile?.displayName ?? "",
          phone: d.profile?.phone ?? "",
          avatarUrl: d.profile?.avatarUrl ?? "",
          county: d.profile?.county ?? "",
          ...d.onboarding,
        }))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user, router])

  const { saveImmediate } = useAutosave({
    userId: user?.id,
    table: "profiles",
    recordId: user?.id,
    data,
    enabled: !loading && !!user,
  })

  const updateData = useCallback((patch: Record<string, unknown>) => {
    setData((prev) => ({ ...prev, ...patch }))
  }, [])

  const handleNext = useCallback(async () => {
    setSaving(true)
    try {
      const stepId = wizardSteps[currentStep]?.id ?? "unknown"
      await fetch("/api/onboarding/buyer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: stepId, data }),
      })
      markComplete(currentStep)
      if (currentStep === wizardSteps.length - 1) {
        router.push("/")
      } else {
        nextStep()
      }
    } finally {
      setSaving(false)
    }
  }, [currentStep, data, wizardSteps, markComplete, nextStep, router])

  const handleSkip = useCallback(() => {
    markComplete(currentStep)
    if (currentStep === wizardSteps.length - 1) {
      router.push("/")
    } else {
      nextStep()
    }
  }, [currentStep, wizardSteps, markComplete, nextStep, router])

  const currentStepDef = wizardSteps[currentStep]
  const isOptional = currentStepDef?.optional
  const isLast = currentStep === wizardSteps.length - 1
  const canProceed = currentStep === 0
    ? !!data.role
    : currentStep === 1
    ? (data.displayName as string)?.length >= 2
    : true

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
      case "welcome": return <WelcomeStep data={data} onUpdate={updateData} />
      case "name": return <FullNameStep data={data} onUpdate={updateData} />
      case "photo": return <PhotoStep data={data} onUpdate={updateData} />
      case "phone": return <PhoneStep data={data} onUpdate={updateData} />
      case "location": return <LocationStep data={data} onUpdate={updateData} />
      case "interests": return <InterestsStep data={data} onUpdate={updateData} />
      case "notifications": return <NotificationsStep data={data} onUpdate={updateData} />
      case "confirmation": return <ConfirmationStep data={data} onUpdate={updateData} />
      default: return null
    }
  }

  return (
    <WizardShell
      sidebar={<StepSidebar icon={ShoppingBag} />}
      currentStepContent={renderStep()}
      onNext={handleNext}
      onPrev={prevStep}
      nextLabel={isLast ? "Start Shopping" : "Continue"}
      nextDisabled={!canProceed}
      nextLoading={saving}
      isLastStep={isLast}
      showSkip={isOptional && !isLast}
      onSkip={handleSkip}
    />
  )
}

export default function BuyerOnboardingPage() {
  return (
    <WizardProvider steps={STEPS}>
      <BuyerOnboardingInner />
    </WizardProvider>
  )
}
