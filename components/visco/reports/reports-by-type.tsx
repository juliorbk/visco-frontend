"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import type { ReportAnalyticsDTO } from "@/lib/types"
import { REPORT_TYPE_LABELS } from "@/lib/types"

const Chart = dynamic(
  () => import("./reports-by-type-inner").then((m) => m.ReportsByTypeInner),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

const TYPE_COLORS: Record<string, string> = {
  STOCK_INVENTORY: "#7b1a1a",
  STOCK_MOVEMENTS: "#1e40af",
  CRITICAL_ALERTS: "#b45309",
  WAREHOUSE_ANALYSIS: "#6d28d9",
}

export function ReportsByType({
  data,
  loading,
}: {
  data: ReportAnalyticsDTO | null
  loading: boolean
}) {
  const chartData = data
    ? Object.entries(data.reportsByType)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({
          type: REPORT_TYPE_LABELS[k as keyof typeof REPORT_TYPE_LABELS] ?? k,
          count: v,
          fill: TYPE_COLORS[k] ?? "#7b1a1a",
        }))
        .sort((a, b) => b.count - a.count)
    : []

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <h3 className="font-serif text-lg font-semibold mb-1">
        Reportes por tipo
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Distribución por categoría
      </p>
      <div className="h-[280px]">
        {loading ? (
          <ChartSkeleton />
        ) : chartData.length === 0 ? (
          <div className="h-full grid place-items-center text-xs text-muted-foreground">
            Sin datos disponibles
          </div>
        ) : (
          <Chart data={chartData} />
        )}
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="h-full flex flex-col justify-center gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-6 rounded-md" style={{ width: `${40 + (i * 15)}%` }} />
      ))}
    </div>
  )
}
