"use client"

import {
  BuildingOffice2Icon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon,
  StarIcon,
  ShoppingCartIcon,
  PencilIcon,
  PaperAirplaneIcon,
  ClockIcon,
  NoSymbolIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TagIcon,
} from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { SupplierDTO } from "@/lib/types"
import { getCachedUser } from "@/lib/auth-client"
import { canEditSupplier, canDeactivateSupplier } from "@/lib/permissions"
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
  const user = getCachedUser()
  const canEdit = canEditSupplier(user)
  const canDeactivate = canDeactivateSupplier(user)

  if (!supplier) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/60 p-6 text-center text-sm text-muted-foreground h-full grid place-items-center lg:sticky lg:top-20">
        Select a supplier to view its details.
      </div>
    )
  }

  const hasMetrics = supplier.rating !== undefined || supplier.totalOrders !== undefined
  const hasRepresentatives = supplier.representatives.length > 0

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs lg:sticky lg:top-20">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="font-serif text-lg font-semibold">Supplier details</h3>
        {(canEdit || canDeactivate) && (
          <DropdownMenu>
            <DropdownMenuTrigger className="size-8 grid place-items-center rounded-md hover:bg-secondary text-muted-foreground">
              <ChevronDownIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit?.(supplier)}>
                  <PencilIcon className="size-3.5 mr-2" /> Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <ClockIcon className="size-3.5 mr-2" /> View full history
              </DropdownMenuItem>
              {canDeactivate && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => onDeactivate?.(supplier)}
                  >
                    <NoSymbolIcon className="size-3.5 mr-2" /> Deactivate supplier
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Avatar + Name */}
      <div className="px-5 py-5 text-center border-b border-border">
        <div className="mx-auto size-16 rounded-full bg-[#fde8e8] grid place-items-center text-[#7b1a1a]">
          <BuildingOffice2Icon className="size-7" />
        </div>
        <h4 className="mt-3 font-serif text-xl font-semibold break-words">{supplier.name}</h4>
        {supplier.categoryName ? (
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#fde8e8] text-[#7b1a1a] px-2.5 py-0.5 text-xs font-medium max-w-full">
            <TagIcon className="size-3 shrink-0" />
            <span className="truncate">{supplier.categoryName}</span>
          </span>
        ) : (
          <p className="text-xs text-muted-foreground mt-1">
            Currency: {supplier.currency}
          </p>
        )}
        {supplier.categoryName && (
          <p className="text-xs text-muted-foreground mt-1">
            Currency: {supplier.currency}
          </p>
        )}
      </div>

      {/* Contact info */}
      <div className="px-5 py-4 border-b border-border space-y-3">
        <SectionHeader>Contact information</SectionHeader>
        <InfoRow icon={<EnvelopeIcon className="size-3.5" />} label="Email">
          {supplier.contactEmail}
        </InfoRow>
        {supplier.phoneNumbers.length > 0 && (
          <InfoRow icon={<PhoneIcon className="size-3.5" />} label="Phone">
            {supplier.phoneNumbers[0]}
          </InfoRow>
        )}
        {hasRepresentatives && (
          <InfoRow icon={<UserIcon className="size-3.5" />} label="Contact person">
            {supplier.representatives.map((r) => r.fullName).join(", ")}
          </InfoRow>
        )}
      </div>

      {/* Location */}
      {supplier.address && (
        <div className="px-5 py-4 border-b border-border space-y-3">
          <SectionHeader>Location</SectionHeader>
          <InfoRow icon={<MapPinIcon className="size-3.5" />} label="Address">
            {supplier.address}
          </InfoRow>
        </div>
      )}

      {/* Metrics & performance */}
      {hasMetrics && (
        <div className="px-5 py-4 border-b border-border space-y-3">
          <SectionHeader>Metrics & performance</SectionHeader>
          <div className="flex items-center gap-4">
            {supplier.rating !== undefined && (
              <InfoRow icon={<StarIcon className="size-3.5 text-amber-500" />} label="Rating">
                {supplier.rating.toFixed(1)}
              </InfoRow>
            )}
            {supplier.totalOrders !== undefined && (
              <InfoRow icon={<ShoppingCartIcon className="size-3.5" />} label="Orders">
                {supplier.totalOrders}
              </InfoRow>
            )}
          </div>
        </div>
      )}

      {/* Notes & history */}
      {(supplier.description || hasRepresentatives) && (
        <div className="px-5 py-4 border-b border-border space-y-3">
          <SectionHeader>Notes & history</SectionHeader>
          {hasRepresentatives && (
            <div>
              <span className="text-[11px] text-muted-foreground block leading-none mb-1">
                Legal representatives
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
                <DocumentTextIcon className="size-3" />
                Description
                {showDesc ? <ChevronUpIcon className="size-3" /> : <ChevronDownIcon className="size-3" />}
              </button>
              {showDesc && (
                <p className="text-sm text-foreground mt-1.5 leading-relaxed break-words">
                  {supplier.description}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {(canEdit || canDeactivate) && (
        <div className="px-5 py-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                className="bg-card"
                onClick={() => onEdit?.(supplier)}
              >
                <PencilIcon className="size-3.5 mr-1.5" /> Edit
              </Button>
            )}
            <Button variant="outline" size="sm" className="bg-card" asChild>
              <a href={`mailto:${supplier.contactEmail}`}>
                <PaperAirplaneIcon className="size-3.5 mr-1.5" /> Send email
              </a>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="bg-card">
              <ClockIcon className="size-3.5 mr-1.5" /> View history
            </Button>
            {canDeactivate && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 bg-card"
                onClick={() => onDeactivate?.(supplier)}
              >
                <NoSymbolIcon className="size-3.5 mr-1.5" /> Deactivate
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
