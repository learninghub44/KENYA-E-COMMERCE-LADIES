"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { cn } from "../../lib/utils"

interface SearchTriggerProps {
  onClick: () => void
  className?: string
}

function SearchTrigger({ onClick, className }: SearchTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
      aria-label="Open search"
    >
      <Search className="h-5 w-5" />
    </button>
  )
}

export { SearchTrigger }
