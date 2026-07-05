"use client"

import { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from "react"

export interface WizardStep {
  id: string
  label: string
  optional?: boolean
}

interface WizardContextValue {
  currentStep: number
  steps: WizardStep[]
  totalSteps: number
  completedSteps: Set<number>
  direction: "forward" | "backward"
  goToStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  markComplete: (step: number) => void
  isStepAccessible: (step: number) => boolean
}

const WizardContext = createContext<WizardContextValue | null>(null)

export function useWizard() {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error("useWizard must be used within WizardProvider")
  return ctx
}

interface WizardProviderProps {
  steps: WizardStep[]
  initialStep?: number
  completedSteps?: number[]
  onStepChange?: (step: number) => void
  children: ReactNode
}

export function WizardProvider({
  steps,
  initialStep = 0,
  completedSteps: initialCompleted = [],
  onStepChange,
  children,
}: WizardProviderProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [completed, setCompleted] = useState<Set<number>>(
    () => new Set(initialCompleted)
  )
  const [direction, setDirection] = useState<"forward" | "backward">("forward")

  const markComplete = useCallback((step: number) => {
    setCompleted((prev) => {
      const next = new Set(prev)
      next.add(step)
      return next
    })
  }, [])

  const isStepAccessible = useCallback(
    (step: number) => {
      if (step === 0) return true
      if (completed.has(step - 1)) return true
      if (step <= Math.max(0, ...completed)) return true
      return false
    },
    [completed]
  )

  const goToStep = useCallback(
    (step: number) => {
      if (step < 0 || step >= steps.length) return
      if (!isStepAccessible(step)) return
      setDirection(step > currentStep ? "forward" : "backward")
      setCurrentStep(step)
    },
    [currentStep, steps.length, isStepAccessible]
  )

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      markComplete(currentStep)
      setDirection("forward")
      setCurrentStep((s) => s + 1)
    }
  }, [currentStep, steps.length, markComplete])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setDirection("backward")
      setCurrentStep((s) => s - 1)
    }
  }, [currentStep])

  useEffect(() => {
    onStepChange?.(currentStep)
  }, [currentStep, onStepChange])

  return (
    <WizardContext.Provider
      value={{
        currentStep,
        steps,
        totalSteps: steps.length,
        completedSteps: completed,
        direction,
        goToStep,
        nextStep,
        prevStep,
        markComplete,
        isStepAccessible,
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}
