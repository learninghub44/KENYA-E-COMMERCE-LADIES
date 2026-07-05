"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "../../../lib/utils"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"

const COUNTIES = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet",
  "Embu", "Garissa", "Homa Bay", "Isiolo", "Kajiado",
  "Kakamega", "Kericho", "Kiambu", "Kilifi", "Kirinyaga",
  "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia",
  "Lamu", "Machakos", "Makueni", "Mandera", "Marsabit",
  "Meru", "Migori", "Mombasa", "Muranga", "Nairobi",
  "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua",
  "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River",
  "Tharaka-Nithi", "Trans-Nzoia", "Turkana", "Uasin Gishu", "Vihiga",
  "Wajir", "West Pokot",
]

interface CountySelectProps {
  value?: string
  onChange: (value: string) => void
  className?: string
}

export function CountySelect({ value, onChange, className }: CountySelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = COUNTIES.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <span className={value ? "" : "text-muted-foreground"}>
          {value || "Select your county"}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
            <Input
              placeholder="Search counties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-1 h-8 text-sm"
              autoFocus
            />
            <div className="max-h-60 overflow-y-auto">
              {filtered.map((county) => (
                <button
                  key={county}
                  type="button"
                  onClick={() => {
                    onChange(county)
                    setOpen(false)
                    setSearch("")
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent",
                    value === county && "bg-accent"
                  )}
                >
                  <Check className={cn("h-4 w-4", value === county ? "opacity-100" : "opacity-0")} />
                  {county}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No counties found
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
