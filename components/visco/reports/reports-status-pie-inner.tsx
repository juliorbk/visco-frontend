"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

export function ReportsStatusPieInner({
  data,
}: {
  data: { name: string; value: number; color: string }[]
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          innerRadius={64}
          outerRadius={96}
          paddingAngle={3}
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
          formatter={(v: number, n) => [`${v} reportes`, n]}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
