"use client"

import { useState, useCallback, useEffect } from "react"
import { RefreshCw, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"

interface HealthCheck {
  service: string
  status: "healthy" | "warning" | "critical"
  message: string
  latencyMs: number
  checkedAt: string
}

interface HealthResponse {
  overall: "healthy" | "warning" | "critical"
  checks: HealthCheck[]
  stats: { userCount: number; productCount: number; orderCount: number }
  generatedAt: string
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

const serviceIcons: Record<string, string> = {
  Database: "🗄️",
  Storage: "📦",
  Products: "🛍️",
  Orders: "📋",
}

export default function PlatformHealthPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHealth = useCallback(async () => {
    setRefreshing(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/health")
      if (!res.ok) throw new Error("Failed to fetch health")
      const data = await res.json()
      setHealth(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchHealth()
  }, [fetchHealth])

  const overallStatus = health?.overall ?? "healthy"
  const overallLabel = overallStatus === "healthy" ? "Healthy" : overallStatus === "warning" ? "Warning" : "Critical"
  const overallBadgeVariant: "default" | "secondary" | "destructive" = overallStatus === "healthy" ? "default" : overallStatus === "warning" ? "secondary" : "destructive"
  const OverallIcon = statusIcons[overallStatus] ?? CheckCircle

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Health</h1>
          <p className="text-sm text-muted-foreground">System status and service monitoring</p>
        </div>
        <Button onClick={fetchHealth} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Overall Status</CardTitle>
          <Badge variant={overallBadgeVariant} className="gap-1 text-sm px-3 py-1">
            <OverallIcon className="h-4 w-4" />
            {overallLabel}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(health?.checks ?? []).map((check) => {
              const Icon = statusIcons[check.status] ?? CheckCircle
              return (
                <Card key={check.service}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{serviceIcons[check.service] ?? "⚙️"}</span>
                        <div>
                          <p className="font-medium">{check.service}</p>
                          <div className="flex items-center gap-1">
                            <Icon className={`h-3 w-3 ${check.status === "healthy" ? "text-green-500" : check.status === "warning" ? "text-yellow-500" : "text-destructive"}`} />
                            <span className="text-xs capitalize text-muted-foreground">{check.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Latency</span>
                        <span>{check.latencyMs}ms</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Message</span>
                        <span className="truncate max-w-[150px]">{check.message}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            {!health && !error && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Loading health status...</p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {health?.stats && (
        <Card>
          <CardHeader>
            <CardTitle>Platform Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="text-center">
                <p className="text-3xl font-bold">{health.stats.userCount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{health.stats.productCount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{health.stats.orderCount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">No recent incidents</p>
              <p className="text-xs text-muted-foreground">Incident history will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
