"use client"

import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { fetchSpending } from "@/lib/services/dashboard"
import { Skeleton } from "@/components/ui/skeleton"

export function ExpensesBreakdown() {
  const [data, setData] = useState<{ name: string; value: number; color: string }[]>([])
  const [total, setTotal] = useState("$0")
  const [loading, setLoading] = useState(true)

  const COLORS = ["#7b1a1a", "#f4c0c0", "#111827", "#f59e0b", "#3b82f6", "#10b981"]

  useEffect(() => {
    fetchSpending()
      .then((res) => {
        const categories = res.byCategoryPercent ?? {}
        const mapped = Object.entries(categories).map(([name, value], i) => ({
          name,
          value,
          color: COLORS[i % COLORS.length],
        }))
        setData(mapped)
        setTotal(`$${(res.totalMonthly / 1000).toFixed(1)}k`)
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs h-full flex flex-col">
      <div>
        <h3 className="font-serif text-lg font-semibold">Desglose de Gastos</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Distribución mensual por categoría</p>
      </div>

      {loading ? (
        <div className="flex-1 min-h-[200px] flex flex-col items-center justify-center gap-4 mt-2">
          <Skeleton className="size-40 rounded-full" />
          <div className="w-full space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-2.5 rounded-sm" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="relative flex-1 min-h-[200px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={58}
                  outerRadius={86}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #f3f4f6",
                    fontSize: 12,
                    padding: "6px 10px",
                  }}
                  formatter={(v: number, n) => [`${v.toFixed(1)}%`, n]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</div>
                <div className="font-serif text-xl font-semibold">{total}</div>
              </div>
            </div>
          </div>

          <ul className="mt-4 space-y-2">
            {data.map((b) => (
              <li key={b.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="size-2.5 rounded-sm" style={{ background: b.color }} />
                  <span className="text-foreground">{b.name}</span>
                </span>
                <span className="font-medium tabular-nums">{b.value.toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
