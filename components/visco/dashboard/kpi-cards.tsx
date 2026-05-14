import { Truck, Monitor, DollarSign, CheckCircle2, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPI {
  icon: React.ReactNode
  label: string
  value: string
  unit?: string
  delta: number
  trend?: "up" | "down" | "flat"
}

const items: KPI[] = [
  {
    icon: <Truck className="size-5" />,
    label: "Pedidos totales",
    value: "1,284",
    delta: 12,
    trend: "up",
  },
  {
    icon: <Monitor className="size-5" />,
    label: "Inventario total",
    value: "45,910",
    unit: "unidades",
    delta: -3,
    trend: "down",
  },
  {
    icon: <DollarSign className="size-5" />,
    label: "Gastos mensuales",
    value: "$284.5k",
    delta: 0,
    trend: "flat",
  },
  {
    icon: <CheckCircle2 className="size-5" />,
    label: "Tasa de cumplimiento",
    value: "98.2%",
    delta: 2.4,
    trend: "up",
  },
]

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((k) => (
        <div
          key={k.label}
          className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4 shadow-xs"
        >
          <div className="flex items-start justify-between">
            <div className="size-9 grid place-items-center rounded-lg bg-[#fde8e8] text-[#7b1a1a]">
              {k.icon}
            </div>
            <DeltaPill delta={k.delta} trend={k.trend} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className="mt-1 font-serif text-3xl font-semibold text-foreground">
              {k.value}
              {k.unit && (
                <span className="ml-1.5 font-sans text-sm font-normal text-muted-foreground">
                  {k.unit}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function DeltaPill({ delta, trend }: { delta: number; trend?: "up" | "down" | "flat" }) {
  const positive = delta > 0
  const negative = delta < 0
  const Icon = trend === "down" ? TrendingDown : trend === "flat" ? Minus : TrendingUp
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        positive && "bg-emerald-50 text-emerald-700 ring-emerald-200",
        negative && "bg-red-50 text-red-700 ring-red-200",
        !positive && !negative && "bg-sky-50 text-sky-700 ring-sky-200",
      )}
    >
      <Icon className="size-3" />
      {positive ? "+" : ""}
      {delta}%
    </span>
  )
}
