"use client"

import * as React from "react"
import Link from "next/link"
import { Instagram, Twitter, Facebook, Youtube } from "lucide-react"

import { cn } from "../../lib/utils"
import type { CategoryNode } from "../../lib/marketplace/types"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { Logo } from "./logo"

interface FooterColumn {
  title: string
  links: { name: string; href: string }[]
}

function buildShopColumn(categories: CategoryNode[]): FooterColumn {
  const topLevel = categories.filter((c) => !c.parentId).slice(0, 3)
  return {
    title: "Shop",
    links: [
      { name: "All Products", href: "/search" },
      { name: "New Arrivals", href: "/search?sort=newest" },
      ...topLevel.map((c) => ({ name: c.name, href: `/categories/${c.slug}` })),
    ],
  }
}

const staticColumns: FooterColumn[] = [
  {
    title: "About",
    links: [
      { name: "Our Story", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
      { name: "Blog", href: "/blog" },
      { name: "Sustainability", href: "/sustainability" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Contact Us", href: "/contact" },
      { name: "FAQs", href: "/faqs" },
      { name: "Shipping & Delivery", href: "/shipping" },
      { name: "Returns & Exchanges", href: "/returns" },
      { name: "Size Guide", href: "/size-guide" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  },
]

const socialLinks = [
  { name: "Instagram", icon: Instagram, href: "https://instagram.com" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
  { name: "Facebook", icon: Facebook, href: "https://facebook.com" },
  { name: "YouTube", icon: Youtube, href: "https://youtube.com" },
]

interface FooterProps {
  className?: string
  categories?: CategoryNode[]
}

function Footer({ className, categories = [] }: FooterProps) {
  const [email, setEmail] = React.useState("")
  const columns = React.useMemo(
    () => [buildShopColumn(categories), ...staticColumns],
    [categories]
  )

  function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEmail("")
  }

  return (
    <footer className={cn("border-t bg-background", className)}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground">
              Kenya's marketplace for women's fashion, beauty, wellness, and
              lifestyle products from verified sellers. Discover. Shop. Empower.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="mt-6 flex gap-2"
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                aria-label="Email for newsletter"
                className="flex-1"
                required
              />
              <Button type="submit" variant="default">
                Subscribe
              </Button>
            </form>
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    aria-label={social.name}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                )
              })}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground">
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Zuri Market. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block h-5 w-8 rounded border bg-muted" />
              <span className="inline-block h-5 w-8 rounded border bg-muted" />
              <span className="inline-block h-5 w-8 rounded border bg-muted" />
              <span className="text-xs">We accept all major cards</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <select
                className="rounded border bg-background px-2 py-1 text-xs"
                aria-label="Select language"
                defaultValue="en"
              >
                <option value="en">English</option>
                <option value="sw">Kiswahili</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
