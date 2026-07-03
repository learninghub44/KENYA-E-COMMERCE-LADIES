"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Heart } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { AnnouncementBar } from "./announcement-bar"
import { MegaMenu, type MegaMenuItem } from "./mega-menu"
import { AccountDropdown } from "./account-dropdown"
import { SearchTrigger } from "./search-trigger"
import { CartButton } from "./cart-button"
import { ThemeToggle } from "./theme-toggle"
import { MobileNav } from "./mobile-nav"
import { Logo } from "./logo"

interface NavLink {
  name: string
  href: string
  megaMenu?: MegaMenuItem[]
}

const navLinks: NavLink[] = [
  {
    name: "Shop",
    href: "/shop",
    megaMenu: [
      {
        name: "Clothing",
        href: "/category/clothing",
        children: [
          { name: "Dresses", href: "/category/dresses" },
          { name: "Tops", href: "/category/tops" },
          { name: "Bottoms", href: "/category/bottoms" },
          { name: "Outerwear", href: "/category/outerwear" },
          { name: "Kaftans & Maxi", href: "/category/kaftans" },
        ],
      },
      {
        name: "Accessories",
        href: "/category/accessories",
        children: [
          { name: "Handbags", href: "/category/handbags" },
          { name: "Jewelry", href: "/category/jewelry" },
          { name: "Scarves", href: "/category/scarves" },
          { name: "Belts", href: "/category/belts" },
        ],
      },
      {
        name: "Shoes",
        href: "/category/shoes",
        children: [
          { name: "Heels", href: "/category/heels" },
          { name: "Flats", href: "/category/flats" },
          { name: "Sandals", href: "/category/sandals" },
          { name: "Boots", href: "/category/boots" },
        ],
      },
      {
        name: "Beauty",
        href: "/category/beauty",
        children: [
          { name: "Skincare", href: "/category/skincare" },
          { name: "Fragrance", href: "/category/fragrance" },
          { name: "Makeup", href: "/category/makeup" },
        ],
      },
    ],
  },
  {
    name: "Categories",
    href: "/categories",
    megaMenu: [
      {
        name: "Trending",
        href: "/trending",
        children: [
          { name: "New In", href: "/new-arrivals" },
          { name: "Best Sellers", href: "/best-sellers" },
          { name: "Sale", href: "/sale" },
          { name: "Collections", href: "/collections" },
        ],
      },
      {
        name: "By Occasion",
        href: "/occasion",
        children: [
          { name: "Wedding Guest", href: "/occasion/wedding" },
          { name: "Work Wear", href: "/occasion/work" },
          { name: "Evening", href: "/occasion/evening" },
          { name: "Casual", href: "/occasion/casual" },
        ],
      },
      {
        name: "African Fashion",
        href: "/african-fashion",
        children: [
          { name: "Kitenge", href: "/african-fashion/kitenge" },
          { name: "Dashiki", href: "/african-fashion/dashiki" },
          { name: "Ankara", href: "/african-fashion/ankara" },
          { name: "Kente", href: "/african-fashion/kente" },
        ],
      },
    ],
  },
  { name: "New Arrivals", href: "/new-arrivals" },
  { name: "Sale", href: "/sale" },
  { name: "Sellers", href: "/sellers" },
]

interface NavbarProps {
  className?: string
}

function Navbar({ className }: NavbarProps) {
  const pathname = usePathname()
  const [openMegaMenu, setOpenMegaMenu] = React.useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const menuTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

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
            <button
              type="button"
              className="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </button>
            <CartButton itemCount={3} />
          </div>
        </div>
      </div>

      <MobileNav
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        categories={navLinks
          .filter((l) => l.megaMenu)
          .flatMap((l) =>
            (l.megaMenu ?? []).map((m) => ({
              name: m.name,
              href: m.href,
              children: m.children,
            }))
          )}
      />
    </header>
  )
}

export { Navbar }
