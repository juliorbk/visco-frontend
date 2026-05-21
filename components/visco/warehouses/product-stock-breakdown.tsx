"use client"

import { useEffect, useState } from "react"
import { fetchProductStockBreakdown } from "@/lib/services/warehouse"
import type { ProductStockBreakdown } from "@/lib/types"
import { Loader2, Package, Warehouse } from "lucide-react"

export function ProductStockBreakdownView({ productId }: { productId: number }) {
  const [breakdown, setBreakdown] = useState<ProductStockBreakdown | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await fetchProductStockBreakdown(productId)
        setBreakdown(data)
      } catch {
        setBreakdown(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [productId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!breakdown || breakdown.warehouses.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-2">
        Sin desglose disponible
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Package className="size-3.5" />
        <span>Desglose por almacén</span>
      </div>
      <div className="space-y-1.5">
        {breakdown.warehouses.map((w) => (
          <div key={w.warehouseId} className="flex items-center justify-between text-xs rounded-md bg-muted/30 px-2.5 py-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <Warehouse className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{w.warehouseName}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-muted-foreground">
                Pendiente: <span className="font-medium text-foreground">{w.pendingStock}</span>
              </span>
              <span className="font-semibold text-foreground">{w.currentStock}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs pt-1 border-t">
        <span className="text-muted-foreground">Total</span>
        <span className="font-bold text-foreground">{breakdown.totalStock}</span>
      </div>
    </div>
  )
}
