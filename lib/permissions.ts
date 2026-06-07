import type { UserRole } from "@/lib/types"

function hasRole(user: { role: UserRole } | null | undefined, ...allowed: UserRole[]): boolean {
  if (!user) return false
  return allowed.includes(user.role)
}

export function canViewSuppliers(user: { role: UserRole } | null | undefined): boolean {
  return hasRole(user, "ADMIN", "MANAGER", "PROCUREMENT", "WAREHOUSEMAN")
}

export function canCreateSupplier(user: { role: UserRole } | null | undefined): boolean {
  return hasRole(user, "ADMIN", "MANAGER", "PROCUREMENT")
}

export function canEditSupplier(user: { role: UserRole } | null | undefined): boolean {
  return hasRole(user, "ADMIN", "MANAGER", "PROCUREMENT")
}

export function canDeactivateSupplier(user: { role: UserRole } | null | undefined): boolean {
  return hasRole(user, "ADMIN", "MANAGER")
}

export function canCreatePurchaseOrder(user: { role: UserRole } | null | undefined): boolean {
  return hasRole(user, "ADMIN", "PROCUREMENT")
}

export function canCreateSupplierFromPo(user: { role: UserRole } | null | undefined): boolean {
  return hasRole(user, "ADMIN", "PROCUREMENT")
}

export function canManageRequisitions(user: { role: UserRole } | null | undefined): boolean {
  return hasRole(user, "ADMIN", "PROCUREMENT")
}

export function canManageSupplierCategories(
  user: { role: UserRole } | null | undefined,
): boolean {
  return hasRole(user, "ADMIN", "MANAGER")
}
