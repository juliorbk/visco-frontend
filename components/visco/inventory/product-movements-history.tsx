"use client"

import { useEffect, useState } from "react"
import type { InventoryMovementResponse, Page } from "@/lib/types"
import { fetchMovements } from "@/lib/services/warehouse"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowPathIcon, ArrowsRightLeftIcon, EqualsIcon, TruckIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon } from "@heroicons/react/24/outline"
import { MovementDetailModal } from "@/components/visco/warehouses/movement-detail-modal"

const typeConfig: Record<string, { label: string; color: string; icon: typeof ArrowsRightLeftIcon }> = {
  TRANSFER: { label: "Transferencia", color: "text-sky-700 bg-sky-50 border-sky-200", icon: ArrowsRightLeftIcon },
  ADJUSTMENT: { label: "Ajuste", color: "text-amber-700 bg-amber-50 border-amber-200", icon: EqualsIcon },
  RECEIPT: { label: "Recepción", color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: TruckIcon },
  DISPATCH: { label: "Despacho", color: "text-purple-700 bg-purple-50 border-purple-200", icon: ArrowsRightLeftIcon },
}

const PAGE_SIZE = 10

export function ProductMovementsHistory({ productId }: { productId: number }) {
  const [movements, setMovements] = useState<InventoryMovementResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedMovement, setSelectedMovement] = useState<InventoryMovementResponse | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetchMovements(page, PAGE_SIZE, undefined, undefined, productId)
        setMovements(res.content ?? [])
        setTotalPages(res.page.totalPages)
      } catch {
        setMovements([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [productId, page])

  if (loading) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
        <ArrowPathIcon className="size-5 animate-spin" />
        Cargando historial…
      </div>
    )
  }

  if (movements.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
        No hay movimientos registrados para este producto.
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <ClockIcon className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">Historial de movimientos</span>
      </div>

      <div className="rounded-xl border bg-card divide-y">
        {movements.map((m) => {
          const cfg = typeConfig[m.type] ?? { label: m.type, color: "text-gray-600 bg-gray-100 border-gray-200", icon: ArrowsRightLeftIcon }
          const Icon = cfg.icon
          return (
            <div
              key={m.id}
              className="p-3 hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => setSelectedMovement(m)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={cn("size-8 shrink-0 rounded-lg grid place-items-center border", cfg.color)}>
                    <Icon className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn("text-xs font-medium border-0", cfg.color)}>
                        {cfg.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {m.type === "TRANSFER" && (
                        <>
                          {m.fromWarehouseName} → {m.toWarehouseName} · {m.quantity} uds
                        </>
                      )}
                      {m.type === "ADJUSTMENT" && (
                        <>
                          Stock: {m.stockBefore} → {m.stockAfter}
                        </>
                      )}
                      {m.type === "RECEIPT" && (
                        <>
                          +{m.quantity} uds recibidas
                          {m.fromWarehouseName && ` en ${m.fromWarehouseName}`}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              {m.reason && (
                <p className="mt-1 text-xs text-muted-foreground italic pl-10">
                  &ldquo;{m.reason}&rdquo;
                </p>
              )}
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 px-1">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0 || loading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <ChevronLeftIcon className="size-4 mr-1" /> Anterior
          </Button>
          <span className="text-xs text-muted-foreground">
            Página {page + 1} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente <ChevronRightIcon className="size-4 ml-1" />
          </Button>
        </div>
      )}

      <MovementDetailModal
        movement={selectedMovement}
        open={!!selectedMovement}
        onOpenChange={(o) => { if (!o) setSelectedMovement(null) }}
      />
    </div>
  )
}
