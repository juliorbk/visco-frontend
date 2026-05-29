"use client"

import { useEffect, useState } from "react"
import { TruckIcon, ComputerDesktopIcon, CurrencyDollarIcon, CheckCircleIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from "@heroicons/react/24/outline"
import { fetchKpis } from "@/lib/services/dashboard"
import type { KpiStatsDTO } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function KpiCards() {
  const [data, setData] = useState<KpiStatsDTO | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // Ahora solo hacemos UNA petición ligera y rápida
        const kpiData = await fetchKpis()
        setData(kpiData)
      } catch (error) {
        console.error("Error cargando KPIs", error)
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4 shadow-xs">
            <div className="flex items-start justify-between">
              <Skeleton className="size-9 rounded-lg" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!data) return null

  const items = [
    {
      icon: <TruckIcon className="size-5" />,
      label: "Pedidos totales",
      value: data.totalOrders?.toLocaleString() ?? "0",
      delta: 0,
      trend: "flat" as const,
    },
    {
      icon: <ComputerDesktopIcon className="size-5" />,
      label: "Inventario total",
      // Asumimos que el backend ahora enviará esta propiedad
      value: data.totalInventoryUnits?.toLocaleString() ?? "0", 
      unit: "unidades",
      delta: 0,
      trend: "flat" as const,
    },
    {
      icon: <CurrencyDollarIcon className="size-5" />,
      label: "Gastos mensuales",
      value: `$${((data.monthlySpend ?? 0) / 1000).toFixed(1)}k`,
      delta: 0,
      trend: "flat" as const,
    },
    {
      icon: <CheckCircleIcon className="size-5" />,
      label: "Tasa de cumplimiento",
      value: `${(data.fulfillmentRate ?? 0).toFixed(1)}%`,
      delta: (data.fulfillmentRate ?? 0) - 90,
      trend: (data.fulfillmentRate ?? 0) >= 90 ? ("up" as const) : ("down" as const),
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((k) => (
        <div
          key={k.label}
          className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4 shadow-xs"
        >
          <div className="flex items-start justify-between">
            <div className="size-9 grid place-items-center rounded-lg bg-secondary text-secondary-foreground">
              {k.icon}
            </div>
            <DeltaPill delta={k.delta} trend={k.trend} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className="mt-1 font-serif text-3xl font-semibold text-foreground">
              {k.value}
              {k.unit && (
                <span className="ml-1.5 font-sans text-sm font-normal text-muted-foreground">
                  {k.unit}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function DeltaPill({ delta, trend }: { delta: number; trend?: "up" | "down" | "flat" }) {
  const positive = delta > 0
  const negative = delta < 0
  const Icon = trend === "down" ? ArrowTrendingDownIcon : trend === "flat" ? MinusIcon : ArrowTrendingUpIcon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        positive && "bg-emerald-50 text-emerald-700 ring-emerald-200",
        negative && "bg-red-50 text-red-700 ring-red-200",
        !positive && !negative && "bg-sky-50 text-sky-700 ring-sky-200",
      )}
    >
      <Icon className="size-3" />
      {positive ? "+" : ""}
      {delta.toFixed(1)}%
    </span>
  )
}