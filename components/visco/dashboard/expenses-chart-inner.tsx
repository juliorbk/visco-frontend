"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function ExpensesChartInner({ data }: { data: { month: string; real: number; proyectado: number }[] }) {
  return (
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
  )
}
