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
import type { SupplierDTO } from "@/lib/types"

export function SupplierDetail({
  supplier,
  onEdit,
  onDeactivate,
}: {
  supplier: SupplierDTO | null
  onEdit?: (s: SupplierDTO) => void
  onDeactivate?: (s: SupplierDTO) => void
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
          SAP: {supplier.sapCode} · {supplier.currency}
        </p>
      </div>

      {supplier.representatives.length > 0 && (
        <div className="px-5 py-4 border-b border-border">
          <h5 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
            Representantes Legales
          </h5>
          <ul className="space-y-1">
            {supplier.representatives.map((r) => (
              <li key={r.id} className="text-sm text-foreground">
                {r.fullName}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="px-5 py-4 space-y-3 border-b border-border text-sm">
        <div>
          <span className="text-xs text-muted-foreground block">Email</span>
          <span className="text-foreground">{supplier.contactEmail}</span>
        </div>
        {supplier.phoneNumbers.length > 0 && (
          <div>
            <span className="text-xs text-muted-foreground block">Teléfono</span>
            <span className="text-foreground">{supplier.phoneNumbers[0]}</span>
          </div>
        )}
        <div>
          <span className="text-xs text-muted-foreground block">Dirección</span>
          <span className="text-foreground">{supplier.address}</span>
        </div>
        {supplier.description && (
          <div>
            <span className="text-xs text-muted-foreground block">Descripción</span>
            <span className="text-foreground">{supplier.description}</span>
          </div>
        )}
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
