"use client"

import { cn } from "../../../lib/utils"
import { Check, Circle } from "lucide-react"
import { useWizard } from "./wizard-context"

interface StepSidebarProps {
  className?: string
  icon?: React.ComponentType<{ className?: string }>
}

export function StepSidebar({ className, icon: Icon }: StepSidebarProps) {
  const { steps, currentStep, completedSteps, goToStep, isStepAccessible } = useWizard()

  return (
    <nav className={cn("space-y-1", className)} aria-label="Onboarding steps">
      {steps.map((step, i) => {
        const isActive = i === currentStep
        const isComplete = completedSteps.has(i)
        const isAccessible = isStepAccessible(i)

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => goToStep(i)}
            disabled={!isAccessible}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all",
              isActive && "bg-primary/10 text-primary font-medium",
              isComplete && !isActive && "text-muted-foreground hover:bg-muted/50",
              !isActive && !isComplete && "text-muted-foreground/60",
              !isAccessible && "opacity-40 cursor-not-allowed"
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium border",
                isActive && "bg-primary text-primary-foreground border-primary",
                isComplete && !isActive && "bg-primary/10 text-primary border-primary/30",
                !isActive && !isComplete && "bg-muted border-border text-muted-foreground"
              )}
            >
              {isComplete && !isActive ? (
                <Check className="h-3.5 w-3.5" />
              ) : Icon && !isActive && !isComplete ? (
                <Icon className="h-3.5 w-3.5" />
              ) : (
                i + 1
              )}
            </span>
            <span className="truncate">{step.label}</span>
            {step.optional && !isComplete && (
              <span className="ml-auto text-xs text-muted-foreground/60">Optional</span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
