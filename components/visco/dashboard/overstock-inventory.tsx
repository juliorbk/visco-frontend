"use client"

import { useEffect, useState } from "react"
import { ArchiveBoxIcon } from "@heroicons/react/24/outline"
import { fetchOverstockInventory } from "@/lib/services/dashboard"
import type { CriticalInventoryItemDTO } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function OverstockInventory() {
  const [items, setItems] = useState<CriticalInventoryItemDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOverstockInventory()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs h-full">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <ArchiveBoxIcon className="size-4 text-rose-500" />
        <h3 className="font-serif text-lg font-semibold">Stock Excedido</h3>
      </div>
      {loading ? (
        <ul className="p-3 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className="flex items-center gap-3 rounded-lg p-3 ring-1 ring-inset ring-border">
              <Skeleton className="size-9 rounded-md shrink-0" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-44" />
              </div>
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          No hay productos con stock excedido
        </div>
      ) : (
        <ul className="p-3 space-y-2">
          {items.map((it) => (
            <li
              key={it.productId}
              className="flex items-center gap-3 rounded-lg p-3 ring-1 ring-inset bg-rose-50 ring-rose-200"
            >
              <div className="size-9 rounded-md grid place-items-center shrink-0 bg-rose-100 text-rose-700">
                <ArchiveBoxIcon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{it.productName}</div>
                <div className="text-xs text-muted-foreground">
                  Stock actual: <span className="font-medium text-foreground">{it.currentStock}</span>{" "}
                  <span className="opacity-70">unidades</span> · Máx. {it.maxStock ?? "—"}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
