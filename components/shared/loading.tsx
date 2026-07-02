import { Loader2 } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "../../lib/utils"
import { Skeleton } from "../ui/skeleton"

interface LoadingProps {
  variant?: "full" | "inline" | "skeleton" | "product-grid" | "table" | "card"
  columns?: number
  rows?: number
  className?: string
  text?: string
}

function LoadingSkeletonGrid({ columns, rows, className }: { columns: number; rows: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)} role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton key={colIdx} className="h-4 flex-1" />
          ))}
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  )
}

function LoadingProductGrid({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4", className)} role="status" aria-label="Loading products">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-5 w-1/3" />
        </div>
      ))}
      <span className="sr-only">Loading products...</span>
    </div>
  )
}

function LoadingTable({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)} role="status" aria-label="Loading table">
      <div className="flex gap-4 border-b pb-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          {Array.from({ length: 4 }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
      <span className="sr-only">Loading table data...</span>
    </div>
  )
}

function Loading({ variant = "full", columns = 4, rows = 3, className, text }: LoadingProps) {
  if (variant === "product-grid") {
    return <LoadingProductGrid className={className} />
  }

  if (variant === "table") {
    return <LoadingTable rows={rows} className={className} />
  }

  if (variant === "skeleton") {
    return <LoadingSkeletonGrid columns={columns} rows={rows} className={className} />
  }

  if (variant === "card") {
    return (
      <div className={cn("space-y-3 rounded-lg border p-4", className)} role="status" aria-label="Loading card">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

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
        <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">{text ?? "Loading..."}</span>
      </div>
    )
  }

  return (
    <div
      className={cn("flex items-center gap-3 py-8", className)}
      role="status"
      aria-label="Loading"
    >
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
      <span className="text-sm text-muted-foreground">{text ?? "Loading..."}</span>
    </div>
  )
}

interface LoadingButtonProps {
  loading?: boolean
  children: ReactNode
  className?: string
  asChild?: boolean
}

export { Loading, LoadingSkeletonGrid, LoadingProductGrid, LoadingTable }
export type { LoadingButtonProps }
