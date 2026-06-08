"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import type { ReportAnalyticsDTO } from "@/lib/types"

const COLORS: Record<string, string> = {
  COMPLETED: "#16a34a",
  PENDING: "#f59e0b",
  PROCESSING: "#3b82f6",
  FAILED: "#dc2626",
}

const LABELS: Record<string, string> = {
  COMPLETED: "Completado",
  PENDING: "Pendiente",
  PROCESSING: "Procesando",
  FAILED: "Error",
}

export function ReportsStatusPie({
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
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    )
  }

  const byStatus = data?.reportsByStatus ?? {}
  const pieData = Object.entries(byStatus).map(([status, count]) => ({
    name: LABELS[status] ?? status,
    value: count,
    color: COLORS[status] ?? "#9ca3af",
  }))

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <h3 className="font-serif text-lg font-semibold mb-4">Estado de Reportes</h3>
      <div className="h-48">
        {pieData.length === 0 ? (
          <div className="h-full grid place-items-center text-xs text-muted-foreground">
            Sin datos
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #f3f4f6",
                    fontSize: 12,
                    padding: "8px 10px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 mt-1">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
