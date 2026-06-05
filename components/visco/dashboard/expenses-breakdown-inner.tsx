"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

export function ExpensesBreakdownInner({
  data,
  total,
}: {
  data: { name: string; value: number; color: string }[]
  total: string
}) {
  return (
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
  )
}
