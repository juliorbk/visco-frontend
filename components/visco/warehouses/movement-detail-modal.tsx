"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { InventoryMovementResponse } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { ArrowsRightLeftIcon, EqualsIcon, TruckIcon, CalendarIcon, UserIcon, CubeIcon, ArrowDownIcon, ArrowUpIcon, DocumentTextIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"

const typeConfig: Record<string, { label: string; color: string; icon: typeof ArrowsRightLeftIcon }> = {
  TRANSFER: {
    label: "Transferencia",
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 border-blue-200",
    icon: ArrowsRightLeftIcon,
  },
  ADJUSTMENT: {
    label: "Ajuste",
    color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 border-amber-200",
    icon: EqualsIcon,
  },
  INPUT: {
    label: "Entrada",
    color: "text-green-600 bg-green-100 dark:bg-green-900/30 border-green-200",
    icon: TruckIcon,
  },
  OUTPUT: {
    label: "Salida",
    color: "text-red-600 bg-red-100 dark:bg-red-900/30 border-red-200",
    icon: ArrowsRightLeftIcon,
  },
}

export function MovementDetailModal({
  movement,
  open,
  onOpenChange,
}: {
  movement: InventoryMovementResponse | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  if (!movement) return null

  const cfg = typeConfig[movement.type] ?? { label: movement.type, color: "text-gray-600 bg-gray-100 border-gray-200", icon: ArrowsRightLeftIcon }
  const Icon = cfg.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <div className={cn("size-8 rounded-lg grid place-items-center border", cfg.color)}>
              <Icon className="size-4" />
            </div>
            Detalle de Movimiento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn("text-sm font-medium border-0", cfg.color)}>
              {cfg.label}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">#{movement.id}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DetailItem icon={CubeIcon} label="Producto" value={`${movement.productName} (${movement.productSku})`} />
            <DetailItem icon={CalendarIcon} label="Fecha" value={new Date(movement.createdAt).toLocaleString()} />
            <DetailItem icon={UserIcon} label="Realizado por" value={movement.createdByName} />
            <DetailItem
              icon={movement.type === "TRANSFER" ? ArrowDownIcon : movement.type === "ADJUSTMENT" ? EqualsIcon : ArrowUpIcon}
              label={movement.type === "TRANSFER" ? "Cantidad" : movement.type === "ADJUSTMENT" ? "Nuevo stock" : "Cantidad recibida"}
              value={
                movement.type === "TRANSFER"
                  ? `${movement.quantity} uds`
                  : movement.type === "ADJUSTMENT"
                    ? `→ ${movement.stockAfter}`
                    : `${movement.quantity} uds`
              }
            />
            {movement.stockBefore != null && movement.type !== "ADJUSTMENT" && (
              <DetailItem icon={ArrowUpIcon} label="Stock antes" value={`${movement.stockBefore}`} />
            )}
            {movement.stockAfter != null && (
              <DetailItem icon={ArrowUpIcon} label="Stock después" value={`${movement.stockAfter}`} />
            )}
          </div>

          <div className="space-y-2 pt-2 border-t">
            {movement.fromWarehouseName && (
              <div className="flex items-center gap-2 text-sm">
                <ArrowDownIcon className="size-4 text-red-500" />
                <span className="text-muted-foreground">Origen:</span>
                <span className="font-medium">{movement.fromWarehouseName}</span>
              </div>
            )}
            {movement.toWarehouseName && (
              <div className="flex items-center gap-2 text-sm">
                <ArrowUpIcon className="size-4 text-green-500" />
                <span className="text-muted-foreground">Destino:</span>
                <span className="font-medium">{movement.toWarehouseName}</span>
              </div>
            )}
          </div>

          {movement.reason && (
            <div className="flex items-start gap-2 pt-2 border-t">
              <DocumentTextIcon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-muted-foreground">Motivo:</span>
                <p className="text-sm italic text-muted-foreground mt-0.5">&ldquo;{movement.reason}&rdquo;</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CubeIcon
  label: string
  value: string
}) {
  return (
    <div className="rounded-md border bg-[#fafafa] px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </div>
      <div className="mt-0.5 text-sm font-medium text-foreground truncate">{value}</div>
    </div>
  )
}
