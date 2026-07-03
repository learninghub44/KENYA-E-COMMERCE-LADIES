"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function RevenueChart({ data }: { data: { day: string; revenue: number }[] }) {
  const hasData = data.some((d) => d.revenue > 0);

  if (!hasData) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
        No revenue in the last 7 days yet.
      </div>
    );
  }

  return (
    <div className="h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(value: number) => [`KES ${value.toLocaleString()}`, "Revenue"]} />
          <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
