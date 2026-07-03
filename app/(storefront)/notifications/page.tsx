"use client"

import { useState } from "react"
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
  type: "order" | "message" | "promotion" | "review" | "alert"
  title: string
  description: string
  time: string
  read: boolean
}

const FILTER_TABS = [
  { value: "all", label: "All" },
  { value: "order", label: "Orders" },
  { value: "message", label: "Messages" },
  { value: "promotion", label: "Promotions" },
]

const TYPE_ICONS = {
  order: Package,
  message: MessageSquare,
  promotion: Tag,
  review: Star,
  alert: AlertCircle,
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeTab, setActiveTab] = useState("all")

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.type === activeTab)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    )
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
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
                notifications.filter((n) => n.type === tab.value && !n.read)
                  .length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 px-1.5 text-xs"
                  >
                    {
                      notifications.filter(
                        (n) => n.type === tab.value && !n.read
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
              const Icon = TYPE_ICONS[notification.type]
              return (
                <div key={notification.id}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full gap-4 p-4 text-left transition-colors hover:bg-muted/50",
                      !notification.read && "bg-primary/5"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        notification.type === "order" && "bg-blue-100 text-blue-600",
                        notification.type === "message" &&
                          "bg-purple-100 text-purple-600",
                        notification.type === "promotion" &&
                          "bg-orange-100 text-orange-600",
                        notification.type === "review" &&
                          "bg-yellow-100 text-yellow-600",
                        notification.type === "alert" &&
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
                              !notification.read && "font-semibold"
                            )}
                          >
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {notification.description}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {notification.time}
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
