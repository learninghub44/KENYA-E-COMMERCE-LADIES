"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "../../lib/utils"

interface MegaMenuChild {
  name: string
  href: string
}

interface MegaMenuItem {
  name: string
  href: string
  image?: string
  children?: MegaMenuChild[]
}

interface MegaMenuProps {
  items: MegaMenuItem[]
  isOpen: boolean
  onClose: () => void
  className?: string
}

function MegaMenu({ items, isOpen, onClose, className }: MegaMenuProps) {
  const panelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "absolute left-0 top-full z-50 w-full border-t bg-background shadow-xl",
            className
          )}
        >
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="mb-3 block text-sm font-semibold uppercase tracking-wide text-foreground hover:text-primary"
                >
                  {item.name}
                </Link>
                {item.image && (
                  <div className="mb-3 overflow-hidden rounded-md bg-muted">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-40 w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                )}
                {item.children && item.children.length > 0 && (
                  <ul className="space-y-2">
                    {item.children.map((child) => (
                      <li key={child.name}>
                        <Link
                          href={child.href}
                          onClick={onClose}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export type { MegaMenuItem, MegaMenuChild }
export { MegaMenu }
