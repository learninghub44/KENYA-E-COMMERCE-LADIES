import { cn } from "../../lib/utils"

interface PriceProps {
  amount: number
  currency?: string
  compareAt?: number
  size?: "sm" | "md" | "lg"
  variant?: "default" | "sale" | "strikethrough"
  className?: string
}

const sizeMap = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
} as const

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function Price({
  amount,
  currency = "KES",
  compareAt,
  size = "md",
  variant = "default",
  className,
}: PriceProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "font-semibold",
          sizeMap[size],
          variant === "sale" && "text-destructive",
          variant === "strikethrough" && "text-muted-foreground line-through"
        )}
      >
        {formatPrice(amount, currency)}
      </span>
      {compareAt != null && compareAt > amount && (
        <span
          className={cn(
            "text-muted-foreground line-through",
            sizeMap[size]
          )}
        >
          {formatPrice(compareAt, currency)}
        </span>
      )}
    </span>
  )
}

export { Price }
