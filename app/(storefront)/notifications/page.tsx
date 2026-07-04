"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Bell,
  Package,
  MessageSquare,
  Tag,
  CheckCheck,
  ShoppingBag,
  Star,
  AlertCircle,
  Loader2,
} from "lucide-react"

import { cn } from "../../../lib/utils"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Separator } from "../../../components/ui/separator"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs"
import { EmptyState } from "../../../components/shared/empty-state"
import { Breadcrumbs } from "../../../components/shared/breadcrumbs"

interface Notification {
  id: string
  category: string
  type: string
  title: string
  body: string
  data: Record<string, unknown>
  read_at: string | null
  archived_at: string | null
  created_at: string
}

const FILTER_TABS = [
  { value: "all", label: "All" },
  { value: "orders", label: "Orders" },
  { value: "messaging", label: "Messages" },
  { value: "announcements", label: "Promotions" },
]

const CATEGORY_ICONS: Record<string, typeof Package> = {
  orders: Package,
  messaging: MessageSquare,
  announcements: Tag,
  reviews: Star,
  security: AlertCircle,
  seller: Package,
  account: AlertCircle,
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/notifications")
      if (!res.ok) {
        throw new Error("Failed to load notifications")
      }
      const data = await res.json()
      setNotifications(data.notifications ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.category === activeTab)

  const unreadCount = notifications.filter((n) => !n.read_at).length

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      })
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      )
    } catch {
      // silently fail
    }
  }

  const markAsRead = async (id: string) => {
    const notif = notifications.find((n) => n.id === id)
    if (notif?.read_at) return

    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      })
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        )
      )
    } catch {
      // silently fail
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={AlertCircle}
          title="Failed to load notifications"
          description={error}
        />
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! Notifications will appear here when there's something new."
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Notifications" },
        ]}
      />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              You have {unreadCount} unread{" "}
              {unreadCount === 1 ? "notification" : "notifications"}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          {FILTER_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
              {tab.value !== "all" &&
                notifications.filter((n) => n.category === tab.value && !n.read_at)
                  .length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 px-1.5 text-xs"
                  >
                    {
                      notifications.filter(
                        (n) => n.category === tab.value && !n.read_at
                      ).length
                    }
                  </Badge>
                )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description={`No ${activeTab} notifications.`}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            {filteredNotifications.map((notification, index) => {
              const Icon = CATEGORY_ICONS[notification.category] ?? Bell
              const isUnread = !notification.read_at
              return (
                <div key={notification.id}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full gap-4 p-4 text-left transition-colors hover:bg-muted/50",
                      isUnread && "bg-primary/5"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        notification.category === "orders" && "bg-blue-100 text-blue-600",
                        notification.category === "messaging" &&
                          "bg-purple-100 text-purple-600",
                        notification.category === "announcements" &&
                          "bg-orange-100 text-orange-600",
                        notification.category === "reviews" &&
                          "bg-yellow-100 text-yellow-600",
                        notification.category === "security" &&
                          "bg-red-100 text-red-600"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p
                            className={cn(
                              "text-sm",
                              isUnread && "font-semibold"
                            )}
                          >
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {notification.body}
                          </p>
                        </div>
                        {isUnread && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </button>
                  {index < filteredNotifications.length - 1 && <Separator />}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
