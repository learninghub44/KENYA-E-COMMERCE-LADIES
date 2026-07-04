"use client"

import { useState, useEffect, useCallback } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table"

interface SearchQuery {
  query: string
  count: number
  results: number
  clicks: number
}

interface ZeroResultQuery {
  query: string
  count: number
}

interface SearchAnalyticsResponse {
  topQueries: SearchQuery[]
  zeroResultQueries: ZeroResultQuery[]
  trendData: { date: string; searches: number }[]
}

export default function SearchAnalyticsPage() {
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null)
  const [data, setData] = useState<SearchAnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/search-analytics")
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const topQueries = data?.topQueries ?? []
  const zeroResultQueries = data?.zeroResultQueries ?? []
  const trendData = data?.trendData ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search Analytics</h1>
        <p className="text-sm text-muted-foreground">Monitor search performance on the platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Volume Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading trend data...</p>
          ) : trendData.length > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <Tooltip />
                  <Line type="monotone" dataKey="searches" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[250px] rounded-lg border-2 border-dashed">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">No search trend data available</p>
                <p className="text-xs text-muted-foreground">Search events will appear here once recorded</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Search Queries</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : topQueries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query</TableHead>
                    <TableHead>Searches</TableHead>
                    <TableHead>Results</TableHead>
                    <TableHead>Clicks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topQueries.map((sq) => (
                    <TableRow
                      key={sq.query}
                      className="cursor-pointer"
                      onClick={() => setSelectedQuery(sq.query)}
                    >
                      <TableCell className="font-medium">{sq.query}</TableCell>
                      <TableCell>{sq.count.toLocaleString()}</TableCell>
                      <TableCell>{sq.results}</TableCell>
                      <TableCell>
                        <span className="text-green-600">{sq.clicks}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-8">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">No search queries recorded yet</p>
                  <p className="text-xs text-muted-foreground">Data will populate as users search</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zero-Result Queries</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : zeroResultQueries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zeroResultQueries.map((zq) => (
                    <TableRow key={zq.query}>
                      <TableCell className="font-medium text-destructive">{zq.query}</TableCell>
                      <TableCell>{zq.count}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Add Product</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-8">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">No zero-result queries</p>
                  <p className="text-xs text-muted-foreground">Failed searches will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
