"use client"

import { CubeIcon, MapPinIcon, UserIcon, DocumentTextIcon } from "@heroicons/react/24/outline"
import type { WarehouseDetailResponse } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

export function WarehouseDetailSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-4 w-44" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
      </div>
    </div>
  )
}

export function WarehouseDetail({
  warehouse,
}: {
  warehouse: WarehouseDetailResponse | null
}) {
  if (!warehouse) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
        Selecciona un almacén para ver detalles
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <CubeIcon className="size-4 text-[#7b1a1a]" />
          <h3 className="font-serif font-semibold text-lg">{warehouse.name}</h3>
        </div>
        <Badge variant="secondary" className="text-xs font-mono">
          SAP: {warehouse.sapCenterCode}
        </Badge>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPinIcon className="size-3.5 mt-0.5 shrink-0" />
          <span>{warehouse.physicalAddress || "Sin dirección"}</span>
        </div>
        {warehouse.responsibleUserName && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <UserIcon className="size-3.5 shrink-0" />
            <span>{warehouse.responsibleUserName}</span>
          </div>
        )}
        {warehouse.description && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <DocumentTextIcon className="size-3.5 mt-0.5 shrink-0" />
            <span>{warehouse.description}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{warehouse.totalStock ?? 0}</p>
          <p className="text-xs text-muted-foreground">Stock total</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{warehouse.totalProducts ?? 0}</p>
          <p className="text-xs text-muted-foreground">Productos</p>
        </div>
      </div>
    </div>
  )
}
