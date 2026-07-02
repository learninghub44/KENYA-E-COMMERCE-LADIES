"use client"

import { useEffect, useRef } from "react"

function SkipNav() {
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Tab" && ref.current) {
        ref.current.classList.remove("-translate-y-full")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <a
      ref={ref}
      href="#main-content"
      className="fixed left-4 top-4 z-[100] -translate-y-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-transform focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      Skip to main content
    </a>
  )
}

export { SkipNav }
