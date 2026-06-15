import type { UserRole } from "@/lib/types"
import { isAtLeast, isExactly } from "@/lib/config/roles"

type UserRef = { role: UserRole } | null | undefined

export function canViewSuppliers(user: UserRef): boolean {
  return isAtLeast(user, "WAREHOUSEMAN")
}

export function canCreateSupplier(user: UserRef): boolean {
  return isAtLeast(user, "PROCUREMENT")
}

export function canEditSupplier(user: UserRef): boolean {
  return isAtLeast(user, "PROCUREMENT")
}

export function canDeactivateSupplier(user: UserRef): boolean {
  return isAtLeast(user, "MANAGER")
}

export function canDeleteSupplier(user: UserRef): boolean {
  return isExactly(user, "SUPERADMIN")
}

export function canCreatePurchaseOrder(user: UserRef): boolean {
  return isAtLeast(user, "PROCUREMENT")
}

export function canCreateSupplierFromPo(user: UserRef): boolean {
  return isAtLeast(user, "PROCUREMENT")
}

export function canManageRequisitions(user: UserRef): boolean {
  return isAtLeast(user, "PROCUREMENT")
}

export function canApproveRequisitions(user: UserRef): boolean {
  return isAtLeast(user, "MANAGER")
}

export function canApprovePurchaseOrders(user: UserRef): boolean {
  return isAtLeast(user, "MANAGER")
}

export function canManageSupplierCategories(user: UserRef): boolean {
  return isAtLeast(user, "MANAGER")
}

export function canViewAdminPanel(user: UserRef): boolean {
  return isAtLeast(user, "ADMIN")
}

export function canDelete(user: UserRef): boolean {
  return isExactly(user, "SUPERADMIN")
}
