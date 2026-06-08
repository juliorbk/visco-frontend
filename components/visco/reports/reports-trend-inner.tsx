"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const MONTH_LABELS: Record<string, string> = {
  "01": "Ene",
  "02": "Feb",
  "03": "Mar",
  "04": "Abr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Ago",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dic",
}

export function ReportsTrendInner({
  data,
}: {
  data: { month: string; count: number }[]
}) {
  const formatted = data.map((d) => {
    const [, mm] = d.month.split("-")
    return { month: MONTH_LABELS[mm] ?? d.month, count: d.count }
  })

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={formatted} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7b1a1a" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#7b1a1a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "#6b7280" }}
        />
        <YAxis
          allowDecimals={false}
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
          formatter={(v: number) => [`${v} reportes`, undefined]}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#7b1a1a"
          strokeWidth={2}
          fill="url(#reportGradient)"
          name="Reportes"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
