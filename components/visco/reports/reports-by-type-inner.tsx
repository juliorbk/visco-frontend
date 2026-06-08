"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts"

export function ReportsByTypeInner({
  data,
}: {
  data: { type: string; count: number; fill: string }[]
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "#6b7280" }}
        />
        <YAxis
          type="category"
          dataKey="type"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "#6b7280" }}
          width={110}
        />
        <Tooltip
          cursor={{ fill: "rgba(123,26,26,0.05)" }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #f3f4f6",
            fontSize: 12,
            padding: "8px 10px",
          }}
          formatter={(v: number) => [`${v} reportes`, undefined]}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
