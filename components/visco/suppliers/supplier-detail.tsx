"use client"

import {
  Building2,
  Mail,
  Phone,
  MapPin,
  User,
  Star,
  ShoppingCart,
  Pencil,
  Send,
  Clock,
  Ban,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { SupplierDTO } from "@/lib/types"
import { useState } from "react"

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h5 className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
      {children}
    </h5>
  )
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-muted-foreground shrink-0">{icon}</span>
      <div className="min-w-0">
        <span className="text-[11px] text-muted-foreground block leading-none mb-0.5">{label}</span>
        <span className="text-sm text-foreground break-words">{children}</span>
      </div>
    </div>
  )
}

export function SupplierDetail({
  supplier,
  onEdit,
  onDeactivate,
}: {
  supplier: SupplierDTO | null
  onEdit?: (s: SupplierDTO) => void
  onDeactivate?: (s: SupplierDTO) => void
}) {
  const [showDesc, setShowDesc] = useState(false)

  if (!supplier) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/60 p-6 text-center text-sm text-muted-foreground h-full grid place-items-center lg:sticky lg:top-20">
        Selecciona un proveedor para ver el detalle.
      </div>
    )
  }

  const hasMetrics = supplier.rating !== undefined || supplier.totalOrders !== undefined
  const hasRepresentatives = supplier.representatives.length > 0

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs lg:sticky lg:top-20">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="font-serif text-lg font-semibold">Detalles del Proveedor</h3>
        <DropdownMenu>
          <DropdownMenuTrigger className="size-8 grid place-items-center rounded-md hover:bg-secondary text-muted-foreground">
            <ChevronDown className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(supplier)}>
              <Pencil className="size-3.5 mr-2" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Clock className="size-3.5 mr-2" /> Ver historial completo
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => onDeactivate?.(supplier)}
            >
              <Ban className="size-3.5 mr-2" /> Desactivar proveedor
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Avatar + Name */}
      <div className="px-5 py-5 text-center border-b border-border">
        <div className="mx-auto size-16 rounded-full bg-[#fde8e8] grid place-items-center text-[#7b1a1a]">
          <Building2 className="size-7" />
        </div>
        <h4 className="mt-3 font-serif text-xl font-semibold">{supplier.name}</h4>
        <p className="text-xs text-muted-foreground mt-1">
          Moneda: {supplier.currency}
        </p>
      </div>

      {/* Información de Contacto */}
      <div className="px-5 py-4 border-b border-border space-y-3">
        <SectionHeader>Información de Contacto</SectionHeader>
        <InfoRow icon={<Mail className="size-3.5" />} label="Correo electrónico">
          {supplier.contactEmail}
        </InfoRow>
        {supplier.phoneNumbers.length > 0 && (
          <InfoRow icon={<Phone className="size-3.5" />} label="Teléfono">
            {supplier.phoneNumbers[0]}
          </InfoRow>
        )}
        {hasRepresentatives && (
          <InfoRow icon={<User className="size-3.5" />} label="Persona de contacto">
            {supplier.representatives.map((r) => r.fullName).join(", ")}
          </InfoRow>
        )}
      </div>

      {/* Ubicación */}
      {supplier.address && (
        <div className="px-5 py-4 border-b border-border space-y-3">
          <SectionHeader>Ubicación</SectionHeader>
          <InfoRow icon={<MapPin className="size-3.5" />} label="Dirección">
            {supplier.address}
          </InfoRow>
        </div>
      )}

      {/* Métricas y Rendimiento */}
      {hasMetrics && (
        <div className="px-5 py-4 border-b border-border space-y-3">
          <SectionHeader>Métricas y Rendimiento</SectionHeader>
          <div className="flex items-center gap-4">
            {supplier.rating !== undefined && (
              <InfoRow icon={<Star className="size-3.5 text-amber-500" />} label="Calificación">
                {supplier.rating.toFixed(1)}
              </InfoRow>
            )}
            {supplier.totalOrders !== undefined && (
              <InfoRow icon={<ShoppingCart className="size-3.5" />} label="Pedidos">
                {supplier.totalOrders}
              </InfoRow>
            )}
          </div>
        </div>
      )}

      {/* Notas e Historial */}
      {(supplier.description || hasRepresentatives) && (
        <div className="px-5 py-4 border-b border-border space-y-3">
          <SectionHeader>Notas e Historial</SectionHeader>
          {hasRepresentatives && (
            <div>
              <span className="text-[11px] text-muted-foreground block leading-none mb-1">
                Representantes Legales
              </span>
              <ul className="space-y-0.5">
                {supplier.representatives.map((r) => (
                  <li key={r.id} className="text-sm text-foreground flex items-center gap-1.5">
                    <span className="size-1 rounded-full bg-muted-foreground/40" />
                    {r.fullName}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {supplier.description && (
            <div>
              <button
                type="button"
                onClick={() => setShowDesc(!showDesc)}
                className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <FileText className="size-3" />
                Descripción
                {showDesc ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              </button>
              {showDesc && (
                <p className="text-sm text-foreground mt-1.5 leading-relaxed">
                  {supplier.description}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-5 py-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-card"
            onClick={() => onEdit?.(supplier)}
          >
            <Pencil className="size-3.5 mr-1.5" /> Editar
          </Button>
          <Button variant="outline" size="sm" className="bg-card" asChild>
            <a href={`mailto:${supplier.contactEmail}`}>
              <Send className="size-3.5 mr-1.5" /> Enviar Correo
            </a>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="bg-card">
            <Clock className="size-3.5 mr-1.5" /> Ver Historial
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 bg-card"
            onClick={() => onDeactivate?.(supplier)}
          >
            <Ban className="size-3.5 mr-1.5" /> Desactivar
          </Button>
        </div>
      </div>
    </div>
  )
}
