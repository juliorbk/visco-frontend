"use client"

import { Building2, MessageSquare, MoreVertical, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { OrderStatusBadge } from "@/components/visco/status-badge"
import type { Supplier } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function SupplierDetail({
  supplier,
  onEdit,
  onDeactivate,
}: {
  supplier: Supplier | null
  onEdit?: (s: Supplier) => void
  onDeactivate?: (s: Supplier) => void
}) {
  if (!supplier) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/60 p-6 text-center text-sm text-muted-foreground h-full grid place-items-center lg:sticky lg:top-20">
        Selecciona un proveedor para ver el detalle.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs lg:sticky lg:top-20">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="font-serif text-lg font-semibold">Detalles del Proveedor</h3>
        <DropdownMenu>
          <DropdownMenuTrigger className="size-8 grid place-items-center rounded-md hover:bg-secondary text-muted-foreground">
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(supplier)}>Editar</DropdownMenuItem>
            <DropdownMenuItem>Ver historial completo</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => onDeactivate?.(supplier)}
            >
              Desactivar proveedor
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="px-5 py-5 text-center border-b border-border">
        <div className="mx-auto size-16 rounded-full bg-[#fde8e8] grid place-items-center text-[#7b1a1a]">
          <Building2 className="size-7" />
        </div>
        <h4 className="mt-3 font-serif text-xl font-semibold">{supplier.name}</h4>
        <p className="text-xs text-muted-foreground mt-1">
          Proveedor Nivel {supplier.tier} · Desde {supplier.since}
        </p>
      </div>

      <div className="px-5 py-4 border-b border-border">
        <h5 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
          Certificaciones Activas
        </h5>
        <div className="flex flex-wrap gap-1.5">
          {supplier.certifications.map((c) => (
            <span
              key={c.name}
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset",
                c.status === "active"
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-amber-50 text-amber-700 ring-amber-200",
              )}
            >
              {c.name}
            </span>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Historial Reciente
          </h5>
          <button className="text-xs text-[#7b1a1a] hover:underline font-medium">Ver todo</button>
        </div>
        <ul className="space-y-1.5">
          {supplier.recentOrders.map((o) => (
            <li
              key={o.id}
              className="flex items-center justify-between text-sm border-b border-border last:border-b-0 pb-1.5 last:pb-0"
            >
              <div>
                <div className="font-medium text-[#7b1a1a]">{o.id}</div>
                <div className="text-xs text-muted-foreground">{o.date}</div>
              </div>
              <OrderStatusBadge status={o.status} />
            </li>
          ))}
        </ul>
      </div>

      <div className="px-5 py-4 flex flex-col sm:flex-row gap-2">
        <Button variant="outline" className="flex-1 bg-card">
          <MessageSquare className="size-4" /> Mensaje
        </Button>
        <Button className="flex-1 bg-[#7b1a1a] hover:bg-[#5c1212] text-white">
          <Plus className="size-4" /> Nueva Orden
        </Button>
      </div>
    </div>
  )
}
