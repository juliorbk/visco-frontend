import type { UserRole } from "@/lib/types"

export const ROLE_LEVELS: Record<UserRole, number> = {
  SUPERADMIN: 5,
  ADMIN: 4,
  MANAGER: 3,
  PROCUREMENT: 2,
  WAREHOUSEMAN: 1,
}

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPERADMIN: "Super Admin",
  ADMIN: "Admin",
  MANAGER: "Gerente",
  PROCUREMENT: "Compras",
  WAREHOUSEMAN: "Almacenista",
}

export const ROLE_BADGE: Record<UserRole, string> = {
  SUPERADMIN: "bg-purple-100 text-purple-800 ring-purple-200",
  ADMIN: "bg-red-100 text-red-800 ring-red-200",
  MANAGER: "bg-blue-100 text-blue-800 ring-blue-200",
  PROCUREMENT: "bg-amber-100 text-amber-800 ring-amber-200",
  WAREHOUSEMAN: "bg-green-100 text-green-800 ring-green-200",
}

export function isAtLeast(user: { role: UserRole } | null | undefined, minRole: UserRole): boolean {
  if (!user) return false
  return ROLE_LEVELS[user.role] >= ROLE_LEVELS[minRole]
}

export function isExactly(user: { role: UserRole } | null | undefined, role: UserRole): boolean {
  if (!user) return false
  return user.role === role
}

export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role] ?? role
}

export function getRoleBadge(role: UserRole): string {
  return ROLE_BADGE[role] ?? "bg-gray-100 text-gray-700 ring-gray-200"
}
