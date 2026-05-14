"use client"

import { useState } from "react"
import { PageHeader } from "@/components/visco/page-header"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  reportTrendCurrent,
  categoryExpenses,
} from "@/lib/mock-data"
import {
  Calendar,
  ChevronRight,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Package,
  TrendingUp,
  TrendingDown,
  Users,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

const REPORTS = [
  {
    id: "expenses",
    title: "Expenses",
    subtitle: "Análisis de costos por categoría",
    icon: DollarSign,
  },
  {
    id: "inventory",
    title: "Inventory",
    subtitle: "Niveles de stock y rotación",
    icon: Package,
  },
  {
    id: "performance",
    title: "Performance",
    subtitle: "KPIs de proveedores y SLAs",
    icon: Users,
  },
]

export default function ReportsPage() {
  const [range, setRange] = useState("month")
  const [activeReport, setActiveReport] = useState("expenses")

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Genera, descarga y comparte reportes ejecutivos en tiempo real."
        actions={
          <>
            <Button size="sm" className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white">
              <FileText className="size-4" /> Export PDF
            </Button>
            <Button size="sm" variant="outline" className="bg-card">
              <FileSpreadsheet className="size-4" /> Export Excel
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT COLUMN */}
        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <h3 className="font-serif text-base font-semibold mb-3">Time Range</h3>
            <RadioGroup value={range} onValueChange={setRange} className="space-y-2">
              {[
                { v: "7d", l: "Last 7 Days" },
                { v: "month", l: "This Month" },
                { v: "quarter", l: "This Quarter" },
                { v: "ytd", l: "Year to Date" },
              ].map((opt) => (
                <Label
                  key={opt.v}
                  htmlFor={`r-${opt.v}`}
                  className={cn(
                    "flex items-center gap-2.5 cursor-pointer rounded-md px-2 py-1.5 transition-colors",
                    range === opt.v && "bg-[#fde8e8]",
                  )}
                >
                  <RadioGroupItem
                    id={`r-${opt.v}`}
                    value={opt.v}
                    className="border-[#7b1a1a]/50 text-[#7b1a1a]"
                  />
                  <span className="text-sm">{opt.l}</span>
                </Label>
              ))}
              <Label
                htmlFor="r-custom"
                className={cn(
                  "flex items-center gap-2.5 cursor-pointer rounded-md px-2 py-1.5 transition-colors",
                  range === "custom" && "bg-[#fde8e8]",
                )}
              >
                <RadioGroupItem
                  id="r-custom"
                  value="custom"
                  className="border-[#7b1a1a]/50 text-[#7b1a1a]"
                />
                <span className="text-sm">Custom Range</span>
                <Calendar className="size-3.5 ml-auto text-muted-foreground" />
              </Label>
            </RadioGroup>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <h3 className="font-serif text-base font-semibold mb-3">Report Library</h3>
            <ul className="space-y-2">
              {REPORTS.map((r) => {
                const Icon = r.icon
                const active = activeReport === r.id
                return (
                  <li key={r.id}>
                    <button
                      onClick={() => setActiveReport(r.id)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                        active
                          ? "bg-[#7b1a1a] text-white"
                          : "hover:bg-secondary text-foreground",
                      )}
                    >
                      <div
                        className={cn(
                          "size-8 rounded-md grid place-items-center shrink-0",
                          active ? "bg-white/15" : "bg-[#fde8e8] text-[#7b1a1a]",
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{r.title}</div>
                        <div
                          className={cn(
                            "text-xs truncate",
                            active ? "text-white/80" : "text-muted-foreground",
                          )}
                        >
                          {r.subtitle}
                        </div>
                      </div>
                      <ChevronRight className="size-4 opacity-60 shrink-0" />
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="rounded-xl bg-[#1f2937] text-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <Sparkles className="size-4" />
              <span className="uppercase tracking-wider">Custom Report</span>
            </div>
            <h3 className="font-serif text-lg font-semibold mt-2">
              Construye tu propio reporte
            </h3>
            <p className="text-sm text-white/70 mt-1 mb-4">
              Combina dimensiones, métricas y filtros con el builder visual.
            </p>
            <Button variant="outline" className="w-full bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white">
              Launch Builder
            </Button>
          </section>
        </div>

        {/* RIGHT AREA */}
        <div className="lg:col-span-2 space-y-4">
          <TrendCard />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CategoryCard />
            <MetricCard
              variant="dark"
              label="Total Spend"
              value="$2.4M"
              delta="+12%"
              trend="up"
              caption="vs último mes"
            />
            <MetricCard
              variant="light"
              label="Invoices Proc."
              value="842"
              delta="-3%"
              trend="down"
              caption="vs último mes"
            />
          </div>

          <EfficiencyCard />
        </div>
      </div>
    </div>
  )
}

function TrendCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-serif text-lg font-semibold">Total Expenditures</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Trailing 30 days vs previous period
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#7b1a1a]" /> Current
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#f4c0c0]" /> Previous
          </span>
        </div>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={reportTrendCurrent} margin={{ top: 5, right: 10, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="cur" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7b1a1a" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#7b1a1a" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="prev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f4c0c0" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#f4c0c0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="day"
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
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #f3f4f6",
                fontSize: 12,
                padding: "8px 10px",
              }}
              formatter={(v: number) => [`$${v.toLocaleString()}`, undefined]}
            />
            <Area
              type="monotone"
              dataKey="previous"
              stroke="#f4c0c0"
              strokeWidth={2}
              fill="url(#prev)"
            />
            <Area
              type="monotone"
              dataKey="current"
              stroke="#7b1a1a"
              strokeWidth={2.5}
              fill="url(#cur)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function CategoryCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
        Expenses by Category
      </div>
      <div className="mt-1 font-serif text-xl font-semibold">5 categorías</div>
      <div className="h-[100px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={categoryExpenses} margin={{ top: 4, right: 0, left: -32, bottom: 0 }}>
            <XAxis
              dataKey="cat"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "#6b7280" }}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                borderRadius: 6,
                border: "1px solid #f3f4f6",
                fontSize: 11,
                padding: "4px 8px",
              }}
            />
            <Bar dataKey="value" fill="#7b1a1a" radius={[3, 3, 0, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function MetricCard({
  variant,
  label,
  value,
  delta,
  trend,
  caption,
}: {
  variant: "dark" | "light"
  label: string
  value: string
  delta: string
  trend: "up" | "down"
  caption: string
}) {
  const dark = variant === "dark"
  const Icon = trend === "up" ? TrendingUp : TrendingDown
  return (
    <div
      className={cn(
        "rounded-xl border p-5 shadow-xs flex flex-col justify-between min-h-[140px]",
        dark ? "bg-[#7b1a1a] text-white border-[#7b1a1a]" : "bg-card border-border",
      )}
    >
      <div className={cn("text-xs uppercase tracking-wider font-medium", dark ? "text-white/70" : "text-muted-foreground")}>
        {label}
      </div>
      <div>
        <div className="font-serif text-3xl font-semibold mt-1">{value}</div>
        <div
          className={cn(
            "mt-1 flex items-center gap-1 text-xs",
            dark
              ? "text-white/80"
              : trend === "up"
                ? "text-emerald-600"
                : "text-red-600",
          )}
        >
          <Icon className="size-3.5" />
          <span className="font-medium">{delta}</span>
          <span className={cn(dark ? "text-white/60" : "text-muted-foreground")}>{caption}</span>
        </div>
      </div>
    </div>
  )
}

function EfficiencyCard() {
  const score = 94
  const circumference = 2 * Math.PI * 38
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="rounded-xl bg-[#1f2937] text-white p-6 shadow-xs flex items-center justify-between gap-6">
      <div>
        <div className="text-xs uppercase tracking-wider text-white/70 font-medium">
          Efficiency Score
        </div>
        <div className="mt-2 font-serif text-5xl font-semibold leading-none">
          {score}
          <span className="text-2xl text-white/60 font-normal"> / 100</span>
        </div>
        <p className="mt-3 text-sm text-white/75 max-w-md text-pretty">
          Tu organización está operando 12 puntos por encima del benchmark del sector. Mantén las
          aprobaciones automatizadas para sostener este score.
        </p>
      </div>
      <div className="relative size-24 shrink-0">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="#f4c0c0"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center font-serif text-lg font-semibold">
          {score}%
        </div>
      </div>
    </div>
  )
}
