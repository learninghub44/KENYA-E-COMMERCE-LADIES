"use client"

import { cn } from "../../../lib/utils"
import { Check } from "lucide-react"
import { useWizard } from "./wizard-context"

interface ProgressBarProps {
  className?: string
}

export function ProgressBar({ className }: ProgressBarProps) {
  const { currentStep, totalSteps, completedSteps } = useWizard()
  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-3 flex justify-between">
        {Array.from({ length: totalSteps }, (_, i) => (
          <button
            key={i}
            type="button"
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-all",
              i === currentStep
                ? "bg-primary text-primary-foreground scale-110"
                : completedSteps.has(i)
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            )}
            aria-label={`Go to step ${i + 1}`}
          >
            {completedSteps.has(i) ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              i + 1
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
