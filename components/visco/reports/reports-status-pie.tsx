"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import type { ReportAnalyticsDTO } from "@/lib/types"

const Chart = dynamic(
  () => import("./reports-status-pie-inner").then((m) => m.ReportsStatusPieInner),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Completado",
  FAILED: "Error",
  PENDING: "Pendiente",
  PROCESSING: "Procesando",
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "#059669",
  FAILED: "#dc2626",
  PENDING: "#d97706",
  PROCESSING: "#2563eb",
}

export function ReportsStatusPie({
  data,
  loading,
}: {
  data: ReportAnalyticsDTO | null
  loading: boolean
}) {
  const chartData = data
    ? Object.entries(data.reportsByStatus)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({
          name: STATUS_LABELS[k] ?? k,
          value: v,
          color: STATUS_COLORS[k] ?? "#7b1a1a",
        }))
    : []

  const total = chartData.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <h3 className="font-serif text-lg font-semibold mb-1">
        Estado de reportes
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Distribución por estado · {total} total
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <>
            <div className="flex items-center justify-center">
              <Skeleton className="size-44 rounded-full" />
            </div>
            <div className="md:col-span-2 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-3 rounded-sm" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </>
        ) : chartData.length === 0 ? (
          <div className="md:col-span-3 py-10 text-center text-xs text-muted-foreground">
            Sin datos disponibles
          </div>
        ) : (
          <>
            <div className="relative flex items-center justify-center" style={{ minHeight: 220 }}>
              <Chart data={chartData} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Total
                  </div>
                  <div className="font-serif text-xl font-semibold">
                    {total}
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 flex items-center">
              <ul className="w-full space-y-2.5">
                {chartData.map((d) => (
                  <li key={d.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-sm" style={{ background: d.color }} />
                      <span className="text-foreground">{d.name}</span>
                    </span>
                    <span className="font-medium tabular-nums">
                      {d.value}{" "}
                      <span className="text-xs text-muted-foreground">
                        ({total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%)
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="flex items-center justify-center">
      <Skeleton className="size-44 rounded-full" />
    </div>
  )
}
