"use client"

import { useState } from "react"
import type { InventoryMovementResponse, MovementType, Page } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowRightLeft, Equal, Truck, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MovementDetailModal } from "@/components/visco/warehouses/movement-detail-modal"
import { exportMovements } from "@/lib/services/warehouse"
import { toast } from "sonner"

const typeConfig: Record<MovementType, { label: string; color: string; icon: typeof ArrowRightLeft }> = {
  TRANSFER: {
    label: "Transferencia",
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 border-blue-200",
    icon: ArrowRightLeft,
  },
  ADJUSTMENT: {
    label: "Ajuste",
    color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 border-amber-200",
    icon: Equal,
  },
  RECEIPT: {
    label: "Recepción",
    color: "text-green-600 bg-green-100 dark:bg-green-900/30 border-green-200",
    icon: Truck,
  },
}

export function MovementsTable({
  data,
  loading,
  totalPages,
  page,
  onPageChange,
  typeFilter,
  onTypeFilterChange,
  warehouseName,
  warehouseId,
}: {
  data: InventoryMovementResponse[]
  loading: boolean
  totalPages: number
  page: number
  onPageChange: (p: number) => void
  typeFilter: string
  onTypeFilterChange: (t: string) => void
  warehouseName?: string | null
  warehouseId?: number | null
}) {
  const [selectedMovement, setSelectedMovement] = useState<InventoryMovementResponse | null>(null)
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const type = typeFilter === "all" ? undefined : typeFilter
      await exportMovements(warehouseId ?? undefined, type)
      toast.success("Movimientos exportados correctamente")
    } catch {
      toast.error("Error al exportar movimientos")
    } finally {
      setExporting(false)
    }
  }
  if (loading) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/60 p-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
        <Loader2 className="size-5 animate-spin" />
        Cargando movimientos…
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
        No hay movimientos registrados.
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-3 flex-wrap">
        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="TRANSFER">Transferencias</SelectItem>
            <SelectItem value="ADJUSTMENT">Ajustes</SelectItem>
            <SelectItem value="RECEIPT">Recepciones</SelectItem>
          </SelectContent>
        </Select>
        {warehouseName && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
            Almacén: <span className="font-medium text-foreground">{warehouseName}</span>
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={exporting || data.length === 0}
          className="ml-auto"
        >
          {exporting ? <Loader2 className="size-4 mr-1 animate-spin" /> : <Download className="size-4 mr-1" />}
          Exportar
        </Button>
      </div>

      <div className="rounded-xl border bg-card divide-y">
        {data.map((m) => {
          const cfg = typeConfig[m.type] ?? { label: m.type, color: "text-gray-600 bg-gray-100 border-gray-200", icon: ArrowRightLeft }
          const Icon = cfg.icon
          return (
            <div
              key={m.id}
              className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => setSelectedMovement(m)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn("size-9 shrink-0 rounded-lg grid place-items-center border", cfg.color)}>
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={cn("text-xs font-medium border-0", cfg.color)}>
                        {cfg.label}
                      </Badge>
                      <span className="text-sm font-medium truncate">{m.productName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <span className="font-mono">{m.productSku}</span>
                      {m.quantity > 0 && (
                        <>
                          {" · "}
                          <span className={cn("font-semibold", m.type === "ADJUSTMENT" ? "text-amber-600" : "")}>
                            {m.type === "TRANSFER" ? `${m.quantity} uds` : m.type === "ADJUSTMENT" ? `→ ${m.stockAfter}` : `${m.quantity} uds`}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{new Date(m.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {m.fromWarehouseName && (
                  <span>Origen: <span className="font-medium text-foreground">{m.fromWarehouseName}</span></span>
                )}
                {m.toWarehouseName && (
                  <span>Destino: <span className="font-medium text-foreground">{m.toWarehouseName}</span></span>
                )}
                <span>Por: <span className="font-medium text-foreground">{m.createdBy}</span></span>
              </div>

              {m.reason && (
                <p className="mt-1 text-xs text-muted-foreground italic">
                  &ldquo;{m.reason}&rdquo;
                </p>
              )}
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0 || loading}
            onClick={() => onPageChange(Math.max(0, page - 1))}
          >
            <ChevronLeft className="size-4 mr-1" />
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page + 1} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => onPageChange(page + 1)}
          >
            Siguiente
            <ChevronRight className="size-4 ml-1" />
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
