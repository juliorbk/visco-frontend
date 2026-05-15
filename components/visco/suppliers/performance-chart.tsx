"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { fetchSupplierPerformance } from "@/lib/services/suppliers"
import type { SupplierPerformanceMonthlyDTO } from "@/lib/types"
import { Loader2 } from "lucide-react"

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
          <div className="h-full grid place-items-center text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-full grid place-items-center text-xs text-muted-foreground">
            No hay datos de desempeño disponibles
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                domain={[0, 100]}
              />
              <Tooltip
                cursor={{ fill: "rgba(123,26,26,0.05)" }}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #f3f4f6",
                  fontSize: 12,
                  padding: "8px 10px",
                }}
              />
              <Bar dataKey="a" name="Tier 1" fill="#7b1a1a" radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Bar dataKey="b" name="Tier 2-3" fill="#f4c0c0" radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
