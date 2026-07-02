import { AlertCircle } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "../ui/button"

interface ErrorStateProps {
  title: string
  description: string
  onRetry?: () => void
  icon?: LucideIcon
  className?: string
}

function ErrorState({
  title,
  description,
  onRetry,
  icon: Icon = AlertCircle,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
      role="alert"
    >
      <div className="mb-4 rounded-full bg-destructive/10 p-4">
        <Icon
          className="h-12 w-12 text-destructive"
          aria-hidden="true"
        />
      </div>
      <h3 className="mb-1 text-lg font-semibold">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

export { ErrorState }
