"use client"

import { useEffect, useState } from "react"
import { Truck, Monitor, DollarSign, CheckCircle2, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { fetchKpis } from "@/lib/services/dashboard"
import { fetchProducts } from "@/lib/services/inventory"
import type { KpiStatsDTO, ProductDTO } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function KpiCards() {
  const [data, setData] = useState<KpiStatsDTO | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [kpiData, allProducts] = await Promise.all([
          fetchKpis(),
          loadAllProducts(),
        ])
        const totalStock = allProducts.reduce((sum, p) => sum + p.totalStock, 0)
        setData({ ...kpiData, totalInventoryUnits: totalStock })
      } catch {
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function loadAllProducts(page = 0, accumulated: ProductDTO[] = []): Promise<ProductDTO[]> {
    const result = await fetchProducts(page, 100)
    const all = [...accumulated, ...result.content]
    if (result.page.number < result.page.totalPages - 1) {
      return loadAllProducts(page + 1, all)
    }
    return all
  }

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
      icon: <Truck className="size-5" />,
      label: "Pedidos totales",
      value: data.totalOrders.toLocaleString(),
      delta: 0,
      trend: "flat" as const,
    },
    {
      icon: <Monitor className="size-5" />,
      label: "Inventario total",
      value: data.totalInventoryUnits.toLocaleString(),
      unit: "unidades",
      delta: 0,
      trend: "flat" as const,
    },
    {
      icon: <DollarSign className="size-5" />,
      label: "Gastos mensuales",
      value: `$${(data.monthlySpend / 1000).toFixed(1)}k`,
      delta: 0,
      trend: "flat" as const,
    },
    {
      icon: <CheckCircle2 className="size-5" />,
      label: "Tasa de cumplimiento",
      value: `${data.fulfillmentRate.toFixed(1)}%`,
      delta: data.fulfillmentRate - 90,
      trend: data.fulfillmentRate >= 90 ? ("up" as const) : ("down" as const),
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
            <div className="size-9 grid place-items-center rounded-lg bg-[#fde8e8] text-[#7b1a1a]">
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
  const Icon = trend === "down" ? TrendingDown : trend === "flat" ? Minus : TrendingUp
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
