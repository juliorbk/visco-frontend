"use client"

import { cn } from "@/lib/utils"
import type { WarehouseStockSummary } from "@/lib/types"
import { Package } from "lucide-react"

export function WarehouseCard({
  warehouse,
  selected,
  onSelect,
}: {
  warehouse: WarehouseStockSummary
  selected: boolean
  onSelect: (w: WarehouseStockSummary) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(warehouse)}
      className={cn(
        "w-full text-left rounded-xl border p-4 transition-all",
        selected
          ? "border-[#7b1a1a] bg-[#7b1a1a]/5 shadow-sm"
          : "border-border bg-card hover:border-[#7b1a1a]/40 hover:shadow-sm",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-10 shrink-0 rounded-lg bg-[#7b1a1a]/10 grid place-items-center">
            <Package className="size-5 text-[#7b1a1a]" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{warehouse.warehouseName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              ID: {warehouse.warehouseId}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-muted/50 p-2 text-center">
          <p className="font-semibold text-foreground">{warehouse.totalStock}</p>
          <p className="text-muted-foreground">En stock</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2 text-center">
          <p className="font-semibold text-foreground">{warehouse.totalPendingStock}</p>
          <p className="text-muted-foreground">Pendiente</p>
        </div>
      </div>
    </button>
  )
}
