import { Star } from "lucide-react"

import { cn } from "../../lib/utils"

interface RatingProps {
  value: number
  max?: number
  size?: "sm" | "md" | "lg"
  showValue?: boolean
  className?: string
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
} as const

const textSizeMap = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
} as const

function Rating({
  value,
  max = 5,
  size = "md",
  showValue = false,
  className,
}: RatingProps) {
  return (
    <div
      className={cn("inline-flex items-center gap-1", className)}
      role="img"
      aria-label={`${value} out of ${max} stars`}
    >
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(value)
        return (
          <Star
            key={i}
            className={cn(
              sizeMap[size],
              "shrink-0",
              filled
                ? "fill-yellow-400 text-yellow-400"
                : "fill-none text-muted-foreground/30"
            )}
            aria-hidden="true"
          />
        )
      })}
      {showValue && (
        <span
          className={cn(
            "ml-1 font-medium text-muted-foreground",
            textSizeMap[size]
          )}
          aria-hidden="true"
        >
          {value.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export { Rating }
