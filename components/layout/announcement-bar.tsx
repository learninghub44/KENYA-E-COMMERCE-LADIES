"use client"

import * as React from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "../../lib/utils"

const DISMISSED_KEY = "announcement-bar-dismissed"

const messages = [
  "Free shipping on orders over KES 5,000",
  "New collection drops every Friday",
  "Sign up & get 10% off your first order",
]

interface AnnouncementBarProps {
  className?: string
}

function AnnouncementBar({ className }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = React.useState(true)
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(DISMISSED_KEY)
    if (stored !== "true") {
      setDismissed(false)
    }
  }, [])

  React.useEffect(() => {
    if (dismissed) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [dismissed])

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem(DISMISSED_KEY, "true")
  }

  if (!mounted || dismissed) return null

  return (
    <div
      className={cn(
        "relative flex h-9 items-center justify-center bg-gradient-to-r from-rose-900 via-primary to-rose-800 px-4 text-xs font-medium text-primary-foreground",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentIndex}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {messages[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute right-3 inline-flex items-center justify-center rounded-full p-0.5 transition-opacity hover:opacity-70"
        aria-label="Dismiss announcement"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export { AnnouncementBar }
