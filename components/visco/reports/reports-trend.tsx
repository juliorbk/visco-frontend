"use client"

import {
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import type { ReportAnalyticsDTO } from "@/lib/types"

export function ReportsTrend({
  data,
  loading,
}: {
  data: ReportAnalyticsDTO | null
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  const chartData = data?.monthlyTrend ?? []

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <h3 className="font-serif text-lg font-semibold mb-4">Reportes por Mes</h3>
      <div className="h-48">
        {chartData.length === 0 ? (
          <div className="h-full grid place-items-center text-xs text-muted-foreground">
            Sin datos
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#6b7280" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                allowDecimals={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #f3f4f6",
                  fontSize: 12,
                  padding: "8px 10px",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#7b1a1a"
                strokeWidth={2}
                dot={{ fill: "#7b1a1a", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
