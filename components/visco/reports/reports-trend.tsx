"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import type { ReportAnalyticsDTO } from "@/lib/types"

const Chart = dynamic(
  () => import("./reports-trend-inner").then((m) => m.ReportsTrendInner),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

export function ReportsTrend({
  data,
  loading,
}: {
  data: ReportAnalyticsDTO | null
  loading: boolean
}) {
  const hasData = (data?.monthlyTrend?.length ?? 0) > 0

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <h3 className="font-serif text-lg font-semibold mb-1">
        Reportes generados por mes
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Últimos 6 meses
      </p>
      <div className="h-[280px]">
        {loading ? (
          <ChartSkeleton />
        ) : !hasData ? (
          <div className="h-full grid place-items-center text-xs text-muted-foreground">
            Sin datos disponibles
          </div>
        ) : (
          <Chart data={data!.monthlyTrend} />
        )}
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="h-full flex items-end gap-2 px-1">
      {[30, 45, 60, 35, 55, 70].map((h, i) => (
        <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%` }} />
      ))}
    </div>
  )
}
