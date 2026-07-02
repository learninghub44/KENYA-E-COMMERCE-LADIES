"use client"

import * as React from "react"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"

import { cn } from "../../lib/utils"
import { Badge } from "../ui/badge"

interface CartButtonProps {
  itemCount?: number
  className?: string
}

function CartButton({ itemCount = 0, className }: CartButtonProps) {
  return (
    <Link
      href="/cart"
      className={cn(
        "relative inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingBag className="h-5 w-5" />
      {itemCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] leading-none"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </Badge>
      )}
    </Link>
  )
}

export { CartButton }
