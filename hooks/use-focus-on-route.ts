"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

function useFocusOnRoute() {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.focus()
      window.scrollTo({ top: 0, behavior: "instant" })
    }
  }, [pathname])

  return ref
}

export { useFocusOnRoute }
