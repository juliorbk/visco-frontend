"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { SupplierPerformanceMonthlyDTO } from "@/lib/types"

export function PerformanceChartInner({ data }: { data: SupplierPerformanceMonthlyDTO[] }) {
  return (
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
  )
}
