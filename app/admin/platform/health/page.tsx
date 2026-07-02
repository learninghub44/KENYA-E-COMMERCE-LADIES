"use client"

import { useState, useCallback } from "react"
import { RefreshCw, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import { Progress } from "../../../../components/ui/progress"

interface Service {
  name: string
  status: "healthy" | "warning" | "critical"
  responseTime: string
  lastChecked: string
  uptime: number
}

interface Incident {
  date: string
  description: string
  resolved: boolean
}

const serviceIcons: Record<string, string> = {
  Database: "🗄️",
  Storage: "📦",
  Search: "🔍",
  Cache: "⚡",
  Queue: "📨",
  Email: "📧",
  AI: "🤖",
}

const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
  healthy: "default",
  warning: "secondary",
  critical: "destructive",
}

const statusIcons: Record<string, React.ElementType> = {
  healthy: CheckCircle,
  warning: AlertTriangle,
  critical: XCircle,
}

const servicesTemplate: Service[] = [
  { name: "Database", status: "healthy", responseTime: "12ms", lastChecked: "Just now", uptime: 99.98 },
  { name: "Storage", status: "healthy", responseTime: "45ms", lastChecked: "Just now", uptime: 99.95 },
  { name: "Search", status: "healthy", responseTime: "23ms", lastChecked: "Just now", uptime: 99.99 },
  { name: "Cache", status: "healthy", responseTime: "3ms", lastChecked: "Just now", uptime: 100 },
  { name: "Queue", status: "warning", responseTime: "156ms", lastChecked: "Just now", uptime: 99.5 },
  { name: "Email", status: "healthy", responseTime: "234ms", lastChecked: "Just now", uptime: 99.8 },
  { name: "AI", status: "critical", responseTime: "1.2s", lastChecked: "Just now", uptime: 97.2 },
]

const incidents: Incident[] = [
  { date: "2025-06-28", description: "Database connection pool exhausted due to traffic spike", resolved: true },
  { date: "2025-06-15", description: "Email delivery delayed for 30 minutes", resolved: true },
  { date: "2025-05-22", description: "Search index rebuild completed slowly", resolved: true },
]

function getOverallStatus(services: Service[]): "Healthy" | "Warning" | "Critical" {
  if (services.some((s) => s.status === "critical")) return "Critical"
  if (services.some((s) => s.status === "warning")) return "Warning"
  return "Healthy"
}

function cycleStatus(status: string): string {
  const cycle: Record<string, string> = { healthy: "warning", warning: "critical", critical: "healthy" }
  return cycle[status] || "healthy"
}

export default function PlatformHealthPage() {
  const [services, setServices] = useState(servicesTemplate)
  const [refreshing, setRefreshing] = useState(false)

  const overallStatus = getOverallStatus(services)
  const overallBadgeVariant: "default" | "secondary" | "destructive" = overallStatus === "Healthy" ? "default" : overallStatus === "Warning" ? "secondary" : "destructive"
  const OverallIcon = overallStatus === "Healthy" ? CheckCircle : overallStatus === "Warning" ? AlertTriangle : XCircle

  const refresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => {
      setServices((prev) =>
        prev.map((s) => ({
          ...s,
          status: cycleStatus(s.status) as "healthy" | "warning" | "critical",
          responseTime: `${Math.floor(Math.random() * 200 + 1)}ms`,
          lastChecked: "Just now",
        }))
      )
      setRefreshing(false)
    }, 1500)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Health</h1>
          <p className="text-sm text-muted-foreground">System status and service monitoring</p>
        </div>
        <Button onClick={refresh} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Overall Status</CardTitle>
          <Badge variant={overallBadgeVariant} className="gap-1 text-sm px-3 py-1">
            <OverallIcon className="h-4 w-4" />
            {overallStatus}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((service) => {
              const Icon = statusIcons[service.status]
              return (
                <Card key={service.name}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{serviceIcons[service.name]}</span>
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <div className="flex items-center gap-1">
                            <Icon className={`h-3 w-3 ${service.status === "healthy" ? "text-green-500" : service.status === "warning" ? "text-yellow-500" : "text-destructive"}`} />
                            <span className="text-xs capitalize text-muted-foreground">{service.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Response</span>
                        <span>{service.responseTime}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Uptime</span>
                        <span>{service.uptime}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Checked</span>
                        <span>{service.lastChecked}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {incidents.map((incident, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${incident.resolved ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
                  {incident.resolved ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{incident.description}</p>
                  <p className="text-xs text-muted-foreground">{incident.date}</p>
                </div>
                <Badge variant={incident.resolved ? "default" : "secondary"}>{incident.resolved ? "Resolved" : "Ongoing"}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
