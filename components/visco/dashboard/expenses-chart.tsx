"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { fetchSpending } from "@/lib/services/dashboard"
import { Skeleton } from "@/components/ui/skeleton"

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
          <div className="h-full flex items-end gap-2 px-1">
            {[40, 55, 70, 45, 80, 65].map((h, i) => (
              <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%` }} />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="h-full grid place-items-center text-xs text-muted-foreground">
            Sin datos disponibles
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <YAxis
                tickFormatter={(v) => `$${v / 1000}k`}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <Tooltip
                cursor={{ fill: "rgba(123,26,26,0.05)" }}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #f3f4f6",
                  fontSize: 12,
                  padding: "8px 10px",
                }}
                formatter={(v: number) => [`$${v.toLocaleString()}`, undefined]}
              />
              <Bar dataKey="real" name="Real" fill="#7b1a1a" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar
                dataKey="proyectado"
                name="Proyectado"
                fill="#f4c0c0"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
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
