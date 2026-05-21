"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { LayoutDashboard, Package, ShoppingCart, Building2, BarChart3, Truck, FileText, Plus, X, Shield, Settings, Warehouse } from "lucide-react"
import { Logo } from "./logo"
import { getCachedUser, fetchUser } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import type { UserDTO } from "@/lib/types"

const BASE_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/requisitions", label: "Requisitions", icon: FileText },
  { href: "/procurement", label: "Procurement", icon: ShoppingCart },
  { href: "/inbounds", label: "Inbounds", icon: Truck },
  { href: "/suppliers", label: "Suppliers", icon: Building2 },
  { href: "/warehouses", label: "Warehouses", icon: Warehouse },
  { href: "/reports", label: "Reports", icon: BarChart3 },
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const [user, setUser] = useState<UserDTO | null | undefined>(getCachedUser())
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (!user && !fetchedRef.current) {
      fetchedRef.current = true
      fetchUser().then(setUser)
    }
  }, [user])

  const NAV = user?.role === "ADMIN"
    ? [...BASE_NAV, { href: "/admin", label: "Admin", icon: Shield }]
    : BASE_NAV

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 w-[220px] flex-col bg-sidebar text-sidebar-foreground z-50 transition-transform duration-300",
          "md:flex md:translate-x-0 md:z-30",
          open ? "flex translate-x-0" : "hidden -translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 py-6 border-b border-sidebar-border">
          <Logo size="md" />
          <button
            onClick={onClose}
            className="md:hidden size-8 grid place-items-center rounded-md hover:bg-sidebar-accent text-sidebar-foreground/80"
            aria-label="Cerrar menú"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-foreground/85 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-sidebar-primary" aria-hidden />
                )}
                <Icon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <Link
            href="/procurement?new=1"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 w-full rounded-md bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground text-xs font-medium px-3 py-2.5 transition-colors"
          >
            <Plus className="size-3.5" />
            New Purchase Order
          </Link>
        </div>
      </aside>
    </>
  )
}
