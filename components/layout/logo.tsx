"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"

import { cn } from "../../lib/utils"

interface LogoProps {
  className?: string
  href?: string
  onClick?: () => void
}

function Logo({ className, href = "/", onClick }: LogoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Avoid a flash of the wrong variant during hydration by defaulting to the light logo.
  const src = mounted && resolvedTheme === "dark" ? "/logo-dark.svg" : "/logo.svg"

  // Plain <img>, not next/image: this is a small, local, trusted static SVG,
  // and Next's image optimizer refuses to process SVGs unless dangerouslyAllowSVG
  // is enabled globally (a security tradeoff not worth it for one static asset).
  return (
    <Link href={href} onClick={onClick} className={cn("flex items-center", className)} aria-label="Zuri Market home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Zuri Market"
        className="h-9 w-auto sm:h-10"
      />
    </Link>
  )
}

export { Logo }
