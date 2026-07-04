"use client"

import { useState, useCallback, useEffect } from "react"
import { Play, HardDrive, Database, Zap, Cpu } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import { Progress } from "../../../../components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table"

interface DiagnosticsResponse {
  environment: Record<string, string>
  database: {
    status: string
    latencyMs: number
    profileCount: number
    productCount: number
    orderCount: number
    sellerCount: number
  }
  generatedAt: string
}

export default function DiagnosticsPage() {
  const [data, setData] = useState<DiagnosticsResponse | null>(null)
  const [running, setRunning] = useState(false)
  const [lastRun, setLastRun] = useState<string>("")

  const runDiagnostics = useCallback(async () => {
    setRunning(true)
    try {
      const res = await fetch("/api/admin/diagnostics")
      if (res.ok) {
        const result = await res.json()
        setData(result)
        setLastRun(new Date(result.generatedAt).toLocaleString("en-KE"))
      }
    } catch {
      // Ignore
    } finally {
      setRunning(false)
    }
  }, [])

  useEffect(() => {
    runDiagnostics()
  }, [runDiagnostics])

  const envInfo = data
    ? Object.entries(data.environment).map(([key, value]) => ({ key, value }))
    : []

  const dbStats = data?.database

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Diagnostics</h1>
          <p className="text-sm text-muted-foreground">Environment and system health diagnostics</p>
        </div>
        <Button onClick={runDiagnostics} disabled={running}>
          <Play className={`mr-2 h-4 w-4 ${running ? "animate-spin" : ""}`} />
          {running ? "Running..." : "Run Diagnostics"}
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Environment Information</CardTitle>
          {lastRun && <Badge variant="outline">Last run: {lastRun}</Badge>}
        </CardHeader>
        <CardContent>
          {envInfo.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {envInfo.map((info) => (
                  <TableRow key={info.key}>
                    <TableCell className="font-medium">{info.key}</TableCell>
                    <TableCell>{info.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">Loading environment info...</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dbStats ? (
              <>
                <div className="flex items-center gap-2">
                  <Badge variant={dbStats.status === "healthy" ? "default" : "destructive"}>
                    {dbStats.status === "healthy" ? "Connected" : "Unreachable"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{dbStats.latencyMs}ms latency</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Profiles</p>
                    <p className="font-medium">{dbStats.profileCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Products</p>
                    <p className="font-medium">{dbStats.productCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Orders</p>
                    <p className="font-medium">{dbStats.orderCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sellers</p>
                    <p className="font-medium">{dbStats.sellerCount.toLocaleString()}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Loading...</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Storage metrics unavailable</p>
                <p className="text-xs text-muted-foreground">Supabase storage stats not exposed via API</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Cache
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Cache metrics unavailable</p>
                <p className="text-xs text-muted-foreground">No external cache configured</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Queue metrics unavailable</p>
                <p className="text-xs text-muted-foreground">No queue system configured</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
