"use client"

import {
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline"
import type { ReportAnalyticsDTO } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function ReportKpis({
  data,
  loading,
}: {
  data: ReportAnalyticsDTO | null
  loading: boolean
}) {
  const totalByStatus = data
    ? data.completedReports + data.failedReports + data.pendingReports
    : 0

  const kpis = [
    {
      icon: <DocumentTextIcon className="size-5" />,
      label: "Total reportes",
      value: data?.totalReports?.toLocaleString() ?? "0",
      color: "bg-[#7b1a1a]/10 text-[#7b1a1a]",
    },
    {
      icon: <CalendarIcon className="size-5" />,
      label: "Reportes programados",
      value: data?.totalScheduledReports?.toLocaleString() ?? "0",
      color: "bg-sky-100 text-sky-700",
    },
    {
      icon: <CheckCircleIcon className="size-5" />,
      label: "Completados",
      value: data?.completedReports?.toLocaleString() ?? "0",
      subtitle: totalByStatus > 0
        ? `${((data!.completedReports / totalByStatus) * 100).toFixed(0)}% de éxito`
        : undefined,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      icon: <XCircleIcon className="size-5" />,
      label: "Fallidos",
      value: data?.failedReports?.toLocaleString() ?? "0",
      color: "bg-red-100 text-red-700",
    },
    {
      icon: <ClockIcon className="size-5" />,
      label: "Pendientes / en proceso",
      value: data?.pendingReports?.toLocaleString() ?? "0",
      color: "bg-amber-100 text-amber-700",
    },
    {
      icon: <ArrowUpIcon className="size-5" />,
      label: "Registros exportados",
      value: data?.totalRecordsExported?.toLocaleString() ?? "0",
      color: "bg-violet-100 text-violet-700",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {loading
        ? Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3"
            >
              <Skeleton className="size-9 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          ))
        : kpis.map((k) => (
            <div
              key={k.label}
              className="rounded-xl border border-border bg-card p-4 shadow-xs flex flex-col gap-3"
            >
              <div className={cn("size-9 rounded-lg grid place-items-center", k.color)}>
                {k.icon}
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{k.label}</div>
                <div className="mt-0.5 font-serif text-2xl font-semibold">
                  {k.value}
                </div>
                {k.subtitle && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {k.subtitle}
                  </div>
                )}
              </div>
            </div>
          ))}
    </div>
  )
}
