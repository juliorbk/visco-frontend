import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import type { CostCenter } from "@/lib/types"

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("es-ES", {
  year: "numeric",
  month: "short",
  day: "numeric",
})

/** "21 may 2026" — used across tables and detail panels. */
export function formatShortDate(value: string | number | Date | null | undefined): string {
  if (value == null) return "—"
  const d = new Date(value)
  if (isNaN(d.getTime())) return "—"
  return SHORT_DATE_FORMATTER.format(d)
}

export function getCostCenterDisplay(cc: CostCenter | null | undefined, fallback = "—") {
  if (!cc) return { primary: fallback }
  const code = cc.code ? `${cc.code}` : ""
  const desc = cc.fullDescription ?? ""
  const primary = [code, desc].filter(Boolean).join(" — ") || fallback
  const secondary = cc.managementDescription ? `Gerencia: ${cc.managementDescription}` : undefined
  return { primary, secondary }
}
