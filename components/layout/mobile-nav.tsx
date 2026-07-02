"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { X, ChevronDown } from "lucide-react"

import { cn } from "../../lib/utils"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "../ui/drawer"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion"

interface MobileNavCategory {
  name: string
  href: string
  children?: { name: string; href: string }[]
}

interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories?: MobileNavCategory[]
}

const defaultLinks = [
  { name: "Home", href: "/" },
  { name: "Shop All", href: "/shop" },
  { name: "New Arrivals", href: "/new-arrivals" },
  { name: "Sale", href: "/sale" },
  { name: "Sellers", href: "/sellers" },
]

function MobileNav({ open, onOpenChange, categories = [] }: MobileNavProps) {
  const pathname = usePathname()

  function close() {
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="left">
      <DrawerContent className="inset-x-0 top-0 mt-0 h-full w-full max-w-sm rounded-none border-r">
        <DrawerHeader className="flex items-center justify-between border-b px-4 py-3">
          <DrawerTitle className="text-lg font-bold tracking-tight">
            <Link href="/" onClick={close}>
              KENYA LUXE
            </Link>
          </DrawerTitle>
          <DrawerClose asChild>
            <button
              type="button"
              className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <nav className="space-y-1">
            {defaultLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {categories.length > 0 && (
            <div className="mt-6">
              <Separator className="mb-4" />
              <Accordion type="single" collapsible>
                <AccordionItem value="categories">
                  <AccordionTrigger className="px-3 text-sm font-medium">
                    Categories
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="ml-2 space-y-1">
                      {categories.map((cat) => (
                        <div key={cat.name}>
                          <Link
                            href={cat.href}
                            onClick={close}
                            className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            {cat.name}
                          </Link>
                          {cat.children && cat.children.length > 0 && (
                            <div className="ml-4 space-y-1">
                              {cat.children.map((child) => (
                                <Link
                                  key={child.name}
                                  href={child.href}
                                  onClick={close}
                                  className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                >
                                  {child.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <div className="flex flex-col gap-2">
            <Button variant="default" asChild className="w-full">
              <Link href="/sign-in" onClick={close}>
                Sign In
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/register" onClick={close}>
                Register
              </Link>
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export type { MobileNavCategory }
export { MobileNav }
