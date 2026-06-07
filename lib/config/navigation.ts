import type { UserRole } from "@/lib/types"
import { isAtLeast } from "@/lib/config/roles"
import {
  Squares2X2Icon as LayoutDashboard,
  CubeIcon as Package,
  ShoppingCartIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  TruckIcon,
  DocumentTextIcon,
  BuildingStorefrontIcon,
  PaperAirplaneIcon as DispatchesIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline"
import type { ComponentType } from "react"

export interface NavItem {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
  minRole: UserRole
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, minRole: "WAREHOUSEMAN" },
  { href: "/inventory", label: "Inventory", icon: Package, minRole: "WAREHOUSEMAN" },
  { href: "/warehouses", label: "Warehouses", icon: BuildingStorefrontIcon, minRole: "WAREHOUSEMAN" },
  { href: "/inbounds", label: "Inbounds", icon: TruckIcon, minRole: "WAREHOUSEMAN" },
  { href: "/dispatches", label: "Dispatches", icon: DispatchesIcon, minRole: "WAREHOUSEMAN" },
  { href: "/requisitions", label: "Requisitions", icon: DocumentTextIcon, minRole: "PROCUREMENT" },
  { href: "/procurement", label: "Procurement", icon: ShoppingCartIcon, minRole: "PROCUREMENT" },
  { href: "/suppliers", label: "Suppliers", icon: BuildingOffice2Icon, minRole: "PROCUREMENT" },
  { href: "/reports", label: "Reports", icon: ChartBarIcon, minRole: "MANAGER" },
  { href: "/admin", label: "Admin", icon: ShieldCheckIcon, minRole: "ADMIN" },
]

export const ROUTE_ROLE_MAP: Record<string, UserRole> = {
  "/dashboard": "WAREHOUSEMAN",
  "/inventory": "WAREHOUSEMAN",
  "/warehouses": "WAREHOUSEMAN",
  "/inbounds": "WAREHOUSEMAN",
  "/dispatches": "WAREHOUSEMAN",
  "/requisitions": "PROCUREMENT",
  "/procurement": "PROCUREMENT",
  "/suppliers": "PROCUREMENT",
  "/reports": "MANAGER",
  "/admin": "ADMIN",
  "/forbidden": "WAREHOUSEMAN",
}

export function getVisibleNav(user: { role: UserRole } | null | undefined): NavItem[] {
  if (!user) return []
  return NAV_ITEMS.filter((item) => isAtLeast(user, item.minRole))
}

export function getRequiredRoleForPath(pathname: string): UserRole | null {
  for (const [route, role] of Object.entries(ROUTE_ROLE_MAP)) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      return role
    }
  }
  return null
}
