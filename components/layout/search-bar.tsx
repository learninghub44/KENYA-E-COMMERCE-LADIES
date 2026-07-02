"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

import { cn } from "../../lib/utils"
import { Input } from "../ui/input"

const RECENT_KEY = "recent-searches"
const MAX_RECENT = 5

const trending = [
  "Summer Dresses",
  "Handbags",
  "African Prints",
  "Gold Jewelry",
  "Kaftans",
]

const categories = [
  { name: "Dresses", href: "/category/dresses" },
  { name: "Tops", href: "/category/tops" },
  { name: "Bags", href: "/category/bags" },
  { name: "Shoes", href: "/category/shoes" },
  { name: "Jewelry", href: "/category/jewelry" },
]

interface SearchBarProps {
  open: boolean
  onClose: () => void
  className?: string
}

function SearchBar({ open, onClose, className }: SearchBarProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [query, setQuery] = React.useState("")
  const [recent, setRecent] = React.useState<string[]>([])
  const [suggestions, setSuggestions] = React.useState<string[]>([])

  React.useEffect(() => {
    if (open) {
      const stored = localStorage.getItem(RECENT_KEY)
      if (stored) {
        try {
          setRecent(JSON.parse(stored))
        } catch {
          /* empty */
        }
      }
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery("")
      setSuggestions([])
    }
  }, [open])

  React.useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }
    const timer = setTimeout(() => {
      setSuggestions(
        trending
          .filter((t) => t.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3)
      )
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose])

  function saveSearch(term: string) {
    const trimmed = term.trim()
    if (!trimmed) return
    const updated = [trimmed, ...recent.filter((r) => r !== trimmed)].slice(
      0,
      MAX_RECENT
    )
    setRecent(updated)
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    saveSearch(query)
  }

  function handleSuggestionClick(suggestion: string) {
    setQuery(suggestion)
    saveSearch(suggestion)
  }

  function clearRecent() {
    setRecent([])
    localStorage.removeItem(RECENT_KEY)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "fixed inset-0 z-50 flex items-start justify-center bg-background/95 backdrop-blur-sm pt-20",
            className
          )}
        >
          <div
            className="absolute inset-0"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-2xl px-4"
          >
            <form onSubmit={handleSubmit} className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="h-14 w-full rounded-full border-2 pl-12 pr-14 text-base shadow-lg"
                aria-label="Search products"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </form>

            {suggestions.length > 0 && (
              <div className="mt-4 rounded-lg border bg-background p-4 shadow-lg">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Suggestions
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSuggestionClick(s)}
                      className="rounded-full bg-muted px-3 py-1 text-sm transition-colors hover:bg-accent"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!query && (
              <div className="mt-6 space-y-6">
                {recent.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Recent Searches
                      </p>
                      <button
                        type="button"
                        onClick={clearRecent}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recent.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => handleSuggestionClick(r)}
                          className="rounded-full bg-muted px-3 py-1 text-sm transition-colors hover:bg-accent"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Trending
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {trending.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleSuggestionClick(t)}
                        className="rounded-full bg-muted px-3 py-1 text-sm transition-colors hover:bg-accent"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Shop by Category
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                    {categories.map((cat) => (
                      <Link
                        key={cat.name}
                        href={cat.href}
                        onClick={onClose}
                        className="rounded-lg border bg-card px-3 py-2 text-center text-sm transition-colors hover:bg-accent"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { SearchBar }
