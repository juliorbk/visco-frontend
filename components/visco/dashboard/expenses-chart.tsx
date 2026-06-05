"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { fetchSpending } from "@/lib/services/dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import type { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const Chart = dynamic(
  () => import("./expenses-chart-inner").then((m) => m.ExpensesChartInner),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

export function ExpensesChart() {
  const [data, setData] = useState<{ month: string; real: number; proyectado: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSpending()
      .then((res) => {
        const mapped = (res.monthlyBreakdown ?? []).map((m) => ({
          month: m.month,
          real: m.actual,
          proyectado: m.projected,
        }))
        setData(mapped)
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-serif text-lg font-semibold">Gastos vs Proyecciones</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Últimos meses · USD</p>
        </div>
        <Legend />
      </div>
      <div className="h-[280px]">
        {loading ? (
          <ChartSkeleton />
        ) : data.length === 0 ? (
          <div className="h-full grid place-items-center text-xs text-muted-foreground">
            Sin datos disponibles
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
    <div className="h-full flex items-end gap-2 px-1">
      {[40, 55, 70, 45, 80, 65].map((h, i) => (
        <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%` }} />
      ))}
    </div>
  )
}

function Legend() {
  return (
    <div className="flex items-center gap-4 text-xs">
      <span className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-sm bg-[#7b1a1a]" /> Real
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-sm bg-[#f4c0c0]" /> Proyectado
      </span>
    </div>
  )
}

export type { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis }
