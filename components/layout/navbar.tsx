"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Heart } from "lucide-react"

import { cn } from "../../lib/utils"
import type { CategoryNode } from "../../lib/marketplace/types"
import { AnnouncementBar } from "./announcement-bar"
import { MegaMenu, type MegaMenuItem } from "./mega-menu"
import { AccountDropdown } from "./account-dropdown"
import { SearchTrigger } from "./search-trigger"
import { CartButton } from "./cart-button"
import { useCartCount } from "../../lib/cart/use-cart-count"
import { ThemeToggle } from "./theme-toggle"
import { MobileNav } from "./mobile-nav"
import { Logo } from "./logo"

interface NavLink {
  name: string
  href: string
  megaMenu?: MegaMenuItem[]
}

/** Turn a real category tree (top-level categories with children) into nav entries. */
function buildCategoryNavLinks(categories: CategoryNode[]): NavLink[] {
  const topLevel = categories.filter((c) => !c.parentId)
  return topLevel.map((category) => {
    if (!category.children || category.children.length === 0) {
      return { name: category.name, href: `/categories/${category.slug}` }
    }
    return {
      name: category.name,
      href: `/categories/${category.slug}`,
      megaMenu: [
        {
          name: `All ${category.name}`,
          href: `/categories/${category.slug}`,
          children: category.children.map((child) => ({
            name: child.name,
            href: `/categories/${child.slug}`,
          })),
        },
      ],
    }
  })
}

interface NavbarProps {
  className?: string
  categories?: CategoryNode[]
}

function Navbar({ className, categories = [] }: NavbarProps) {
  const pathname = usePathname()
  const [openMegaMenu, setOpenMegaMenu] = React.useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const menuTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const cartCount = useCartCount()

  const navLinks: NavLink[] = React.useMemo(
    () => [
      { name: "All Products", href: "/search" },
      ...buildCategoryNavLinks(categories),
      { name: "New Arrivals", href: "/search?sort=newest" },
      { name: "Sellers", href: "/sellers" },
    ],
    [categories]
  )

  function handleMenuEnter(name: string) {
    if (menuTimerRef.current) clearTimeout(menuTimerRef.current)
    setOpenMegaMenu(name)
  }

  function handleMenuLeave() {
    menuTimerRef.current = setTimeout(() => {
      setOpenMegaMenu(null)
    }, 200)
  }

  function handleMenuEnterDelay(name: string) {
    menuTimerRef.current = setTimeout(() => {
      setOpenMegaMenu(name)
    }, 150)
  }

  React.useEffect(() => {
    return () => {
      if (menuTimerRef.current) clearTimeout(menuTimerRef.current)
    }
  }, [])

  return (
    <header className={cn("sticky top-0 z-40 w-full bg-background", className)}>
      <AnnouncementBar />
      <div className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center lg:flex-none">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="mr-3 rounded-md p-2 text-muted-foreground hover:text-foreground lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo className="shrink-0" />
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() =>
                  link.megaMenu
                    ? handleMenuEnterDelay(link.name)
                    : handleMenuEnter(link.name)
                }
                onMouseLeave={handleMenuLeave}
              >
                <Link
                  href={link.href}
                  className={cn(
                    "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === link.href || openMegaMenu === link.name
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-current={
                    pathname === link.href ? "page" : undefined
                  }
                >
                  {link.name}
                </Link>
                {link.megaMenu && (
                  <MegaMenu
                    items={link.megaMenu}
                    isOpen={openMegaMenu === link.name}
                    onClose={() => setOpenMegaMenu(null)}
                  />
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <SearchTrigger onClick={() => setSearchOpen(true)} />
            <AccountDropdown />
            <Link
              href="/wishlist"
              className="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Link>
            <CartButton itemCount={cartCount} />
          </div>
        </div>
      </div>

      <MobileNav
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        categories={categories
          .filter((c) => !c.parentId)
          .map((c) => ({
            name: c.name,
            href: `/categories/${c.slug}`,
            children: (c.children ?? []).map((child) => ({
              name: child.name,
              href: `/categories/${child.slug}`,
            })),
          }))}
      />
    </header>
  )
}

export { Navbar }
