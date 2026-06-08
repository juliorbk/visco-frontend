"use client"

import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function ExpensesChartInner({ data }: { data: { month: string; actual: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
          width={52}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #f3f4f6",
            fontSize: 12,
            padding: "8px 10px",
          }}
          formatter={(v: number) => [`$${v.toLocaleString()}`, "Gasto"]}
        />
        <Line
          type="monotone"
          dataKey="actual"
          name="Gasto"
          stroke="#7b1a1a"
          strokeWidth={2}
          dot={{ fill: "#7b1a1a", r: 4, strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 6, fill: "#7b1a1a", stroke: "#fff" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
