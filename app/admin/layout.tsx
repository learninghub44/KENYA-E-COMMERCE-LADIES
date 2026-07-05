"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
  LogOut,
  User,
  SearchIcon,
  FileCheck,
  HeadphonesIcon,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { createSupabaseBrowserClient } from "../../lib/supabase/client"
import { normalizeRoles, permissionsForRoles } from "../../lib/permissions/index"
import type { Permission } from "../../types/permissions"
import { Button } from "../../components/ui/button"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
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
  permission: Permission
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard, permission: "admin.access" },
      { label: "Users", href: "/admin/users", icon: Users, permission: "user.manage" },
      { label: "Sellers", href: "/admin/sellers", icon: Store, permission: "user.manage" },
      { label: "Products", href: "/admin/products", icon: Package, permission: "admin.moderate" },
      { label: "Orders", href: "/admin/orders", icon: ShoppingCart, permission: "order.manage" },
    ],
  },
  {
    title: "Verification",
    items: [
      { label: "KYC Reviews", href: "/admin/kyc", icon: FileCheck, permission: "kyc.review" },
    ],
  },
  {
    title: "Analytics",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3, permission: "admin.role.manage" },
      { label: "Search Analytics", href: "/admin/search-analytics", icon: Search, permission: "admin.role.manage" },
      { label: "Business Intelligence", href: "/admin/business-intelligence", icon: BrainCircuit, permission: "admin.role.manage" },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Moderation", href: "/admin/moderation", icon: Shield, permission: "admin.moderate" },
      { label: "Reviews", href: "/admin/reviews", icon: Star, permission: "admin.moderate" },
    ],
  },
  {
    title: "Platform",
    items: [
      { label: "Health", href: "/admin/platform/health", icon: HeartPulse, permission: "admin.role.manage" },
      { label: "Diagnostics", href: "/admin/platform/diagnostics", icon: Stethoscope, permission: "admin.role.manage" },
      { label: "Feature Flags", href: "/admin/platform/feature-flags", icon: Flag, permission: "admin.role.manage" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Tickets", href: "/admin/support", icon: HeadphonesIcon, permission: "admin.moderate" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Notifications", href: "/admin/notifications", icon: Bell, permission: "admin.role.manage" },
      { label: "Settings", href: "/admin/settings", icon: Settings, permission: "admin.role.manage" },
    ],
  },
]

function SidebarNav({
  collapsed,
  onNavClick,
  permissions,
}: {
  collapsed: boolean
  onNavClick?: () => void
  permissions: Set<Permission>
}) {
  const pathname = usePathname()

  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => permissions.has(item.permission)),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <ScrollArea className="flex-1 px-3 py-4">
      <div className="space-y-6">
        {visibleSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h4>
            )}
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.label}
                    href={item.href}
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

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  super_admin: "Super Admin",
  moderator: "Moderator",
  kyc_reviewer: "KYC Reviewer",
  support: "Support",
}

function AdminTopBar({
  displayName,
  email,
  roleLabel,
  unreadCount,
  onLogout,
}: {
  displayName: string
  email: string
  roleLabel: string
  unreadCount: number
  onLogout: () => void
}) {
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "AD"

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
        <Link href="/admin/notifications">
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-[10px]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        </Link>
        <Separator orientation="vertical" className="h-8" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-medium">{displayName}</p>
              <p className="text-xs font-normal text-muted-foreground">{email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onSelect={onLogout}>
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
  const router = useRouter()
  const [permissions, setPermissions] = useState<Set<Permission>>(new Set())
  const [profile, setProfile] = useState({ displayName: "", email: "", roleLabel: "Admin" })
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const supabase = createSupabaseBrowserClient()

    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.replace("/admin/login")
          return
        }

        const [roleResult, profileResult, notifResult] = await Promise.allSettled([
          supabase.from("user_roles").select("role").eq("user_id", user.id),
          // .maybeSingle(), not .single(): a missing profiles row (e.g. an
          // admin account created before the auto-provision trigger existed)
          // must not throw here, or this screen hangs on "Loading admin
          // console…" forever since nothing would ever call setLoading(false).
          supabase.from("profiles").select("display_name, email").eq("id", user.id).maybeSingle(),
          supabase
            .from("notifications")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("status", "unread"),
        ])

        if (cancelled) return

        const roleRows = roleResult.status === "fulfilled" ? roleResult.value.data : null
        const profileRow = profileResult.status === "fulfilled" ? profileResult.value.data : null
        const count = notifResult.status === "fulfilled" ? notifResult.value.count : null

        // Self-heal: if the profile row is missing, create it now instead of
        // leaving this admin permanently stuck with a blank name every load.
        if (profileResult.status === "fulfilled" && !profileRow) {
          await supabase.from("profiles").upsert({
            id: user.id,
            email: user.email,
            display_name: user.email?.split("@")[0] ?? null,
          })
        }

        const roles = normalizeRoles((roleRows ?? []).map((row: { role: string }) => row.role))
        const perms = permissionsForRoles(roles)

        setPermissions(perms)
        setUnreadCount(count ?? 0)
        setProfile({
          displayName: profileRow?.display_name || user.email?.split("@")[0] || "Admin",
          email: profileRow?.email || user.email || "",
          roleLabel: roles.map((r) => ROLE_LABELS[r] ?? r).join(", ") || "Admin",
        })

        if (roles.length === 0) {
          // Authenticated but no admin role at all -- middleware would also
          // bounce this request server-side, but if it somehow lands here,
          // don't leave the user staring at an empty shell with no nav items.
          router.replace("/")
          return
        }
      } catch (err) {
        console.error("Failed to load admin session", err)
        router.replace("/admin/login")
        return
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [router])

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading admin console…</div>
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r bg-sidebar lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Store className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Kenya E-Commerce</span>
        </div>
        <SidebarNav collapsed={false} permissions={permissions} />
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
            <span className="text-lg font-bold">Kenya E-Commerce</span>
          </div>
          <SidebarNav collapsed={false} onNavClick={() => document.body.click()} permissions={permissions} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col">
        <AdminTopBar
          displayName={profile.displayName}
          email={profile.email}
          roleLabel={profile.roleLabel}
          unreadCount={unreadCount}
          onLogout={handleLogout}
        />
        <main id="main-content" className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
