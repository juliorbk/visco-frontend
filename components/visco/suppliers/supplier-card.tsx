"use client"

import { Building2 } from "lucide-react"
import type { SupplierDTO } from "@/lib/types"
import { cn } from "@/lib/utils"

export function SupplierCard({
  supplier,
  selected,
  onSelect,
}: {
  supplier: SupplierDTO
  selected?: boolean
  onSelect: (s: SupplierDTO) => void
}) {
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
          <Building2 className="size-5" />
        </div>
      </div>

      <h3 className="mt-4 font-serif text-lg font-semibold text-foreground leading-tight">
        {supplier.name}
      </h3>
      <p className="text-xs text-muted-foreground mt-0.5">
        {supplier.sapCode} · {supplier.currency}
      </p>

      <div className="mt-4 space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground truncate">
          <span className="truncate">{supplier.contactEmail}</span>
        </div>
        {supplier.phoneNumbers.length > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{supplier.phoneNumbers[0]}</span>
          </div>
        )}
      </div>
    </button>
  )
}
