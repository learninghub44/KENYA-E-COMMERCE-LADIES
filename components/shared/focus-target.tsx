"use client"

import type { ReactNode } from "react"
import { useFocusOnRoute } from "../../hooks/use-focus-on-route"

interface FocusTargetProps {
  children: ReactNode
  className?: string
}

function FocusTarget({ children, className }: FocusTargetProps) {
  const ref = useFocusOnRoute()

  return (
    <div ref={ref} tabIndex={-1} className={className} id="route-content">
      {children}
    </div>
  )
}

export { FocusTarget }
