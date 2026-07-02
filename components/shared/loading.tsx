import { Loader2 } from "lucide-react"

import { cn } from "../../lib/utils"
import { Skeleton } from "../ui/skeleton"

interface LoadingProps {
  variant?: "full" | "inline" | "skeleton"
  columns?: number
  rows?: number
  className?: string
}

function Loading({
  variant = "full",
  columns = 4,
  rows = 3,
  className,
}: LoadingProps) {
  if (variant === "full") {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
          className
        )}
        role="status"
        aria-label="Loading"
      >
        <Loader2
          className="h-10 w-10 animate-spin text-primary"
          aria-hidden="true"
        />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (variant === "inline") {
    return (
      <div
        className={cn("flex items-center gap-3 py-8", className)}
        role="status"
        aria-label="Loading"
      >
        <Loader2
          className="h-5 w-5 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)} role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex gap-4"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              className="h-4 flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export { Loading }
