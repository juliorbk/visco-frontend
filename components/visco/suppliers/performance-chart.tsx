"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { fetchSupplierPerformance } from "@/lib/services/suppliers"
import type { SupplierPerformanceMonthlyDTO } from "@/lib/types"
import { ArrowPathIcon } from "@heroicons/react/24/outline"

const Chart = dynamic(
  () => import("./performance-chart-inner").then((m) => m.PerformanceChartInner),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

export function SupplierPerformanceChart() {
  const [data, setData] = useState<SupplierPerformanceMonthlyDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSupplierPerformance()
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-serif text-lg font-semibold">Desempeño de Proveedores</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Score promedio mensual sobre 100 — entregas a tiempo y calidad
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-[#7b1a1a]" /> Tier 1
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-[#f4c0c0]" /> Tier 2-3
          </span>
        </div>
      </div>
      <div className="h-[220px]">
        {loading ? (
          <ChartSkeleton />
        ) : data.length === 0 ? (
          <div className="h-full grid place-items-center text-xs text-muted-foreground">
            No hay datos de desempeño disponibles
          </div>
        ) : (
          <Chart data={data} />
        )}
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="h-full grid place-items-center text-muted-foreground">
      <ArrowPathIcon className="size-5 animate-spin" />
    </div>
  )
}
