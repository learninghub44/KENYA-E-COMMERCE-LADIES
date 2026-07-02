"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingCart,
  BarChart3,
  Search,
  BrainCircuit,
  Shield,
  Star,
  HeartPulse,
  Stethoscope,
  Flag,
  Bell,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  SearchIcon,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Separator } from "../../components/ui/separator"
import { ScrollArea } from "../../components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Users", href: "/users", icon: Users },
      { label: "Sellers", href: "/sellers", icon: Store },
      { label: "Products", href: "/products", icon: Package },
      { label: "Orders", href: "/orders", icon: ShoppingCart },
    ],
  },
  {
    title: "Analytics",
    items: [
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Search Analytics", href: "/search-analytics", icon: Search },
      { label: "Business Intelligence", href: "/business-intelligence", icon: BrainCircuit },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Moderation", href: "/moderation", icon: Shield },
      { label: "Reviews", href: "/reviews", icon: Star },
    ],
  },
  {
    title: "Platform",
    items: [
      { label: "Health", href: "/platform/health", icon: HeartPulse },
      { label: "Diagnostics", href: "/platform/diagnostics", icon: Stethoscope },
      { label: "Feature Flags", href: "/platform/feature-flags", icon: Flag },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
]

function SidebarNav({
  collapsed,
  onNavClick,
}: {
  collapsed: boolean
  onNavClick?: () => void
}) {
  const pathname = usePathname()

  return (
    <ScrollArea className="flex-1 px-3 py-4">
      <div className="space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h4>
            )}
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const href = item.href === "/" ? "" : item.href
                const fullPath = `/${href}`
                const isActive = pathname === fullPath || pathname.startsWith(fullPath + "/")
                return (
                  <Link
                    key={item.label}
                    href={item.href === "" ? "/" : item.href}
                    onClick={onNavClick}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

function AdminTopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search anything..."
            className="pl-9"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-[10px]">
            3
          </Badge>
        </Button>
        <Separator orientation="vertical" className="h-8" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://avatar.vercel.sh/admin" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium">Admin</p>
                <p className="text-xs text-muted-foreground">admin@kenyaecoladies.com</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r bg-sidebar lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Store className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">KEC Ladies</span>
        </div>
        <SidebarNav collapsed={false} />
      </aside>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-40 lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Store className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">KEC Ladies</span>
          </div>
          <SidebarNav onNavClick={() => document.body.click()} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col">
        <AdminTopBar />
        <main id="main-content" className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
