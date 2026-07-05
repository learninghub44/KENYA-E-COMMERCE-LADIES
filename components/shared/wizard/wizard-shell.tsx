"use client"

import { type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../../lib/utils"
import { Button } from "../../ui/button"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { useWizard } from "./wizard-context"
import { ProgressBar } from "./progress-bar"

interface WizardShellProps {
  children?: ReactNode
  sidebar?: ReactNode
  currentStepContent: ReactNode
  onNext?: () => void | Promise<void>
  onPrev?: () => void
  nextLabel?: string
  prevLabel?: string
  nextDisabled?: boolean
  nextLoading?: boolean
  isLastStep?: boolean
  showSkip?: boolean
  onSkip?: () => void
  className?: string
}

const slideVariants = {
  enter: (direction: string) => ({
    x: direction === "forward" ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: string) => ({
    x: direction === "forward" ? -80 : 80,
    opacity: 0,
  }),
}

export function WizardShell({
  sidebar,
  currentStepContent,
  onNext,
  onPrev,
  nextLabel = "Continue",
  prevLabel = "Back",
  nextDisabled = false,
  nextLoading = false,
  isLastStep = false,
  showSkip = false,
  onSkip,
  className,
}: WizardShellProps) {
  const { direction, currentStep, totalSteps } = useWizard()

  return (
    <div className={cn("flex min-h-screen flex-col", className)}>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6">
          <a href="/" className="text-xl font-bold tracking-tight">
            Zuri Market
          </a>
          <div className="ml-auto">
            <ProgressBar className="w-48 sm:w-64" />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {sidebar && (
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-24">{sidebar}</div>
          </aside>
        )}

        <main className="flex-1 lg:ml-12">
          <div className="mx-auto max-w-2xl">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                {currentStepContent}
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex items-center justify-between border-t pt-6">
              <div>
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={onPrev}
                    disabled={nextLoading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {prevLabel}
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {showSkip && onSkip && (
                  <Button variant="ghost" onClick={onSkip} disabled={nextLoading}>
                    Skip
                  </Button>
                )}
                <Button
                  onClick={onNext}
                  disabled={nextDisabled || nextLoading}
                >
                  {nextLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : isLastStep ? null : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}
                  {nextLoading ? "Saving..." : nextLabel}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
