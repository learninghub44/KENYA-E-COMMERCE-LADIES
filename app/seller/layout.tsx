import type { ReactNode } from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  BarChart3,
  TicketPercent,
  MessageSquare,
  Star,
  Store,
  ShieldCheck,
  Settings,
  Bell,
  ChevronDown,
  Menu,
  X,
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet"
import { Separator } from "../../components/ui/separator"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/inventory", label: "Inventory", icon: Warehouse },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/coupons", label: "Coupons", icon: TicketPercent },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/store", label: "Store Profile", icon: Store },
  { href: "/kyc", label: "KYC", icon: ShieldCheck },
  { href: "/settings", label: "Settings", icon: Settings },
]

function SidebarNav() {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground"
        >
          <item.icon className="h-4 w-4" aria-hidden="true" />
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r bg-background p-4 lg:flex">
        <Link href="/" className="mb-6 flex items-center gap-2 px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            K
          </div>
          <span className="text-sm font-semibold">Seller Hub</span>
        </Link>
        <SidebarNav />
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-4">
              <Link href="/" className="mb-6 flex items-center gap-2 px-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                  K
                </div>
                <span className="text-sm font-semibold">Seller Hub</span>
              </Link>
              <SidebarNav />
            </SheetContent>
          </Sheet>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium sm:inline">
              My Store
            </span>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                3
              </span>
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatars/seller.jpg" alt="Seller" />
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main id="main-content" className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
