"use client"

import { Building2, Star, User, Mail, Factory, Cpu, Truck, Wrench, Layers } from "lucide-react"
import { ComplianceBadge } from "@/components/visco/status-badge"
import type { Supplier } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const ICONS: Record<string, React.ElementType> = {
  Electrónica: Cpu,
  Óptica: Layers,
  Eléctrica: Factory,
  Empaques: Truck,
  Químicos: Wrench,
  Servicios: Building2,
}

export function SupplierCard({
  supplier,
  selected,
  onSelect,
}: {
  supplier: Supplier
  selected?: boolean
  onSelect: (s: Supplier) => void
}) {
  const Icon = ICONS[supplier.category] ?? Building2
  return (
    <button
      onClick={() => onSelect(supplier)}
      className={cn(
        "text-left w-full rounded-xl border bg-card p-5 transition-colors shadow-xs",
        selected
          ? "border-[#7b1a1a] ring-2 ring-[#7b1a1a]/15"
          : "border-border hover:border-[#7b1a1a]/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="size-10 rounded-lg bg-[#fde8e8] grid place-items-center text-[#7b1a1a] shrink-0">
          <Icon className="size-5" />
        </div>
        <ComplianceBadge status={supplier.compliance} />
      </div>

      <h3 className="mt-4 font-serif text-lg font-semibold text-foreground leading-tight">
        {supplier.name}
      </h3>
      <p className="text-xs text-muted-foreground mt-0.5">
        {supplier.category} · {supplier.type}
      </p>

      <div className="flex items-center gap-1 mt-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              "size-3.5",
              i <= Math.round(supplier.rating)
                ? "fill-amber-400 text-amber-400"
                : "text-border",
            )}
          />
        ))}
        <span className="ml-1 text-xs font-medium text-foreground tabular-nums">
          {supplier.rating.toFixed(1)}
        </span>
      </div>

      <div className="mt-4 space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="size-3.5" />
          <span className="text-foreground">{supplier.contactName}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground truncate">
          <Mail className="size-3.5 shrink-0" />
          <span className="truncate">{supplier.email}</span>
        </div>
      </div>
    </button>
  )
}
