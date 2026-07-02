"use client"

import { useState } from "react"
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
import { Badge } from "../../../components/ui/badge"
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

const topQueries: SearchQuery[] = [
  { query: "maxi dress", count: 1234, results: 45, clicks: 234 },
  { query: "shea butter", count: 987, results: 23, clicks: 156 },
  { query: "beaded sandals", count: 876, results: 12, clicks: 89 },
  { query: "ankara", count: 765, results: 34, clicks: 198 },
  { query: "kente scarf", count: 654, results: 18, clicks: 76 },
  { query: "dashiki", count: 543, results: 15, clicks: 65 },
  { query: "lipstick", count: 432, results: 28, clicks: 123 },
  { query: "face mask", count: 321, results: 10, clicks: 45 },
]

const zeroResultQueries: ZeroResultQuery[] = [
  { query: "wedding gown", count: 89 },
  { query: "swimwear", count: 67 },
  { query: "denim jacket", count: 54 },
  { query: "leather bag", count: 43 },
  { query: "sneakers", count: 32 },
]

const trendData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (29 - i))
  return {
    date: date.toLocaleDateString("en-KE", { month: "short", day: "numeric" }),
    searches: Math.floor(Math.random() * 1000 + 200),
  }
})

export default function SearchAnalyticsPage() {
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null)

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
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Search Queries</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zero-Result Queries</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
