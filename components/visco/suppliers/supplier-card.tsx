"use client"

import { EnvelopeIcon, PhoneIcon, StarIcon, ShoppingCartIcon } from "@heroicons/react/24/outline"
import type { SupplierDTO, SupplierCategoryDTO } from "@/lib/types"
import { cn } from "@/lib/utils"
import { getCategoryIcon, getCategoryColorHex } from "@/lib/config/supplier-category-icons"

export function SupplierCard({
  supplier,
  selected,
  onSelect,
  categories,
}: {
  supplier: SupplierDTO
  selected?: boolean
  onSelect: (s: SupplierDTO) => void
  categories: SupplierCategoryDTO[]
}) {
  const category = categories.find((c) => c.id === supplier.categoryId)
  const CategoryIcon = getCategoryIcon(category?.icon)
  const categoryColor = getCategoryColorHex(category?.color)
  const statusLabel = supplier.active ? "ACTIVO" : "INACTIVO"
  const statusClass = supplier.active
    ? "bg-emerald-100 text-emerald-700"
    : "bg-gray-200 text-gray-600"

  return (
    <button
      onClick={() => onSelect(supplier)}
      className={cn(
        "text-left w-full rounded-xl border bg-card p-5 transition-all duration-200 shadow-xs hover:shadow-md",
        selected
          ? "border-[#7b1a1a] ring-2 ring-[#7b1a1a]/15 shadow-md"
          : "border-border hover:border-[#7b1a1a]/40 hover:shadow-sm",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="size-10 rounded-lg grid place-items-center shrink-0" style={{ backgroundColor: `${categoryColor}1a`, color: categoryColor }}>
          <CategoryIcon className="size-5" />
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap",
            statusClass,
          )}
        >
          {statusLabel}
        </span>
      </div>

      <h3 className="mt-4 font-serif text-lg font-semibold text-foreground leading-tight">
        {supplier.name}
      </h3>
      <div className="mt-1 flex items-center gap-2 flex-wrap">
        <p className="text-xs text-muted-foreground">
          {supplier.currency}
        </p>
        {supplier.categoryName && (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium max-w-full" style={{ backgroundColor: `${categoryColor}1a`, color: categoryColor }}>
            <CategoryIcon className="size-3 shrink-0" />
            <span className="truncate">{supplier.categoryName}</span>
          </span>
        )}
      </div>

      <div className="mt-4 space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground truncate">
          <EnvelopeIcon className="size-3.5 shrink-0" />
          <span className="truncate">{supplier.contactEmail}</span>
        </div>
        {supplier.phoneNumbers.length > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <PhoneIcon className="size-3.5 shrink-0" />
            <span>{supplier.phoneNumbers[0]}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
        {supplier.rating !== undefined && (
          <span className="flex items-center gap-1">
            <StarIcon className="size-3.5 text-amber-500" />
            {supplier.rating.toFixed(1)}
          </span>
        )}
        {supplier.totalOrders !== undefined && (
          <span className="flex items-center gap-1">
            <ShoppingCartIcon className="size-3.5" />
            {supplier.totalOrders}+ Pedidos
          </span>
        )}
      </div>
    </button>
  )
}
