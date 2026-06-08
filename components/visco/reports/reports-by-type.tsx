"use client"

import { Skeleton } from "@/components/ui/skeleton"
import type { ReportAnalyticsDTO } from "@/lib/types"
import { REPORT_TYPE_LABELS } from "@/lib/types"

export function ReportsByType({
  data,
  loading,
}: {
  data: ReportAnalyticsDTO | null
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="flex-1 h-5" />
              <Skeleton className="w-12 h-5" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const byType = data?.reportsByType ?? {}
  const total = Object.values(byType).reduce((s, c) => s + c, 0) || 1

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <h3 className="font-serif text-lg font-semibold mb-4">Por Tipo de Reporte</h3>
      <div className="space-y-3">
        {Object.entries(byType).map(([type, count]) => (
          <div key={type} className="flex items-center gap-3">
            <div className="flex-1 text-sm text-muted-foreground">
              {REPORT_TYPE_LABELS[type as keyof typeof REPORT_TYPE_LABELS] ?? type}
            </div>
            <div className="flex items-center gap-2 flex-1">
              <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#7b1a1a]"
                  style={{ width: `${(count / total) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                {count}
              </span>
            </div>
          </div>
        ))}
        {Object.keys(byType).length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4">Sin datos</div>
        )}
      </div>
    </div>
  )
}
