"use client"

import { useEffect, useState, type ReactNode } from "react"

interface LiveRegionProps {
  children: ReactNode
  politeness?: "polite" | "assertive"
  className?: string
}

function LiveRegion({ children, politeness = "polite", className }: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className={`sr-only ${className ?? ""}`}
    >
      {children}
    </div>
  )
}

function useAnnounce() {
  const [message, setMessage] = useState("")
  const [key, setKey] = useState(0)

  const announce = (msg: string) => {
    setMessage(msg)
    setKey((k) => k + 1)
  }

  const Announcer = () => (
    <div
      key={key}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )

  return { announce, Announcer }
}

export { LiveRegion, useAnnounce }
