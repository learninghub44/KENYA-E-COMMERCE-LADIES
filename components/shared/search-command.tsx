"use client"

import { Search } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { cn } from "../../lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "../ui/dialog"
import { Input } from "../ui/input"

interface SearchItem {
  id: string
  label: string
  category: string
  href?: string
}

interface SearchCommandProps {
  placeholder?: string
  items?: SearchItem[]
  onSelect?: (item: SearchItem) => void
  className?: string
}

const DEFAULT_ITEMS: SearchItem[] = [
  { id: "1", label: "Women's Dresses", category: "Categories" },
  { id: "2", label: "African Print Tops", category: "Categories" },
  { id: "3", label: "Handmade Jewelry", category: "Categories" },
  { id: "4", label: "Kikoy Fabric", category: "Categories" },
  { id: "5", label: "Leather Sandals", category: "Products" },
  { id: "6", label: "Dashiki Midi Dress", category: "Products" },
  { id: "7", label: "Beaded Earrings Set", category: "Products" },
  { id: "8", label: "Kitenge Skirt", category: "Products" },
  { id: "9", label: "Nairobi Fashion House", category: "Sellers" },
  { id: "10", label: "Mombasa Crafts", category: "Sellers" },
]

function SearchCommand({
  placeholder = "Search products, categories, sellers...",
  items = DEFAULT_ITEMS,
  onSelect,
  className,
}: SearchCommandProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(
    () =>
      query.trim()
        ? items.filter((item) =>
            item.label.toLowerCase().includes(query.toLowerCase())
          )
        : items,
    [items, query]
  )

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery("")
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filtered.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex(
          (prev) => (prev - 1 + filtered.length) % filtered.length
        )
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault()
        onSelect?.(filtered[selectedIndex])
        setOpen(false)
      }
    },
    [filtered, selectedIndex, onSelect]
  )

  return (
    <div className={cn(className)}>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Open search"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-left">{placeholder}</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[15%] translate-y-0 sm:max-w-[500px]">
          <DialogHeader>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedIndex(0)
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="border-none pl-10 shadow-none focus-visible:ring-0"
                aria-label="Search"
              />
            </div>
          </DialogHeader>
          <div
            className="max-h-[300px] overflow-y-auto"
            role="listbox"
            aria-label="Search results"
          >
            {filtered.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </p>
            )}
            {filtered.map((item, index) => {
              const isPrevCategory =
                index === 0 || filtered[index - 1]?.category !== item.category
              return (
                <div key={item.id} role="option" aria-selected={selectedIndex === index}>
                  {isPrevCategory && (
                    <p className="px-2 pb-1 pt-3 text-xs font-semibold text-muted-foreground">
                      {item.category}
                    </p>
                  )}
                  <button
                    onClick={() => {
                      onSelect?.(item)
                      setOpen(false)
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "w-full rounded-sm px-2 py-2 text-left text-sm transition-colors",
                      selectedIndex === index
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground"
                    )}
                  >
                    {item.label}
                  </button>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { SearchCommand }
export type { SearchItem }
