"use client"

import { useState } from "react"
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

const envInfo = [
  { key: "Node Version", value: "22.14.0" },
  { key: "Platform", value: "Linux x64" },
  { key: "Memory", value: "8 GB / 16 GB" },
  { key: "CPU", value: "4 vCPUs (Intel Xeon)" },
  { key: "Uptime", value: "14 days, 6 hours" },
]

export default function DiagnosticsPage() {
  const [running, setRunning] = useState(false)
  const [lastRun, setLastRun] = useState("2025-06-30 15:30:00")

  const runDiagnostics = () => {
    setRunning(true)
    setTimeout(() => {
      setLastRun(new Date().toLocaleString("en-KE"))
      setRunning(false)
    }, 2000)
  }

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
          <Badge variant="outline">Last run: {lastRun}</Badge>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Disk Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Used: 120 GB</span>
                <span className="text-muted-foreground">of 200 GB</span>
              </div>
              <Progress value={60} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Uploads</p>
                <p className="font-medium">85 GB</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Logs</p>
                <p className="font-medium">12 GB</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Backups</p>
                <p className="font-medium">23 GB</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Free</p>
                <p className="font-medium">80 GB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Used: 4.2 GB</span>
                <span className="text-muted-foreground">of 10 GB</span>
              </div>
              <Progress value={42} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tables</p>
                <p className="font-medium">42</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rows</p>
                <p className="font-medium">2.1M</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Connections</p>
                <p className="font-medium">23 / 100</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Query Time</p>
                <p className="font-medium">avg 23ms</p>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Hit Rate</p>
                <p className="text-2xl font-bold text-green-600">94.5%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Size</p>
                <p className="text-2xl font-bold">256 MB</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entries</p>
                <p className="font-medium">12,450</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">TTL</p>
                <p className="font-medium">3600s</p>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Depth</p>
                <p className="text-2xl font-bold">234</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processed</p>
                <p className="text-2xl font-bold">45.2K</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="font-medium text-destructive">12</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rate</p>
                <p className="font-medium">34/min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
