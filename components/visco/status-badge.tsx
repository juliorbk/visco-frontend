import { cn } from "@/lib/utils"

type Variant =
  | "completed"
  | "pending"
  | "transit"
  | "cancelled"
  | "approved"
  | "draft"
  | "in-stock"
  | "low-stock"
  | "out-of-stock"
  | "compliance-total"
  | "compliance-review"
  | "compliance-critical"

const styles: Record<Variant, string> = {
  completed: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  approved: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  "in-stock": "bg-emerald-100 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-100 text-amber-800 ring-amber-200",
  transit: "bg-sky-100 text-sky-700 ring-sky-200",
  cancelled: "bg-red-100 text-red-700 ring-red-200",
  draft: "bg-gray-200 text-gray-700 ring-gray-300",
  "low-stock": "bg-[#fde8e8] text-[#7b1a1a] ring-[#f4c0c0]",
  "out-of-stock": "bg-gray-900 text-white ring-gray-900",
  "compliance-total": "bg-emerald-100 text-emerald-700 ring-emerald-200",
  "compliance-review": "bg-amber-100 text-amber-800 ring-amber-200",
  "compliance-critical": "bg-red-100 text-red-700 ring-red-200",
}

export function StatusBadge({
  variant,
  children,
  className,
}: {
  variant: Variant
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset whitespace-nowrap",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: Variant; label: string }> = {
    BORRADOR: { variant: "draft", label: "Borrador" },
    PENDIENTE: { variant: "pending", label: "Pendiente" },
    APROBADO: { variant: "approved", label: "Aprobado" },
    EN_TRANSITO: { variant: "transit", label: "En Tránsito" },
    RECIBIDO: { variant: "completed", label: "Recibido" },
    CANCELADO: { variant: "cancelled", label: "Cancelado" },
  }
  const m = map[status] ?? { variant: "draft" as Variant, label: status }
  return <StatusBadge variant={m.variant}>{m.label}</StatusBadge>
}

export function InventoryStatusBadge({ status }: { status: string }) {
  if (status === "Sin stock") return <StatusBadge variant="out-of-stock">Sin stock</StatusBadge>
  if (status === "Bajo stock") return <StatusBadge variant="low-stock">Bajo stock</StatusBadge>
  return <StatusBadge variant="in-stock">En stock</StatusBadge>
}

export function ComplianceBadge({ status }: { status: string }) {
  if (status === "Total") return <StatusBadge variant="compliance-total">Total</StatusBadge>
  if (status === "Revision") return <StatusBadge variant="compliance-review">Revisión</StatusBadge>
  return <StatusBadge variant="compliance-critical">Crítico</StatusBadge>
}
