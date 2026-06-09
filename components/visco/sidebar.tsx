"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { Logo } from "./logo"
import { useCurrentUser } from "@/lib/user-context"
import { cn } from "@/lib/utils"
import { getVisibleNav } from "@/lib/config/navigation"
import { canCreatePurchaseOrder } from "@/lib/permissions"

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { user } = useCurrentUser()

  const NAV = getVisibleNav(user)

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
          <Link
            href="/dashboard"
            onClick={onClose}
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
            aria-label="Ir al dashboard"
          >
            <Logo size="md" variant="white" />
          </Link>
          <button
            onClick={onClose}
            className="md:hidden size-8 grid place-items-center rounded-md hover:bg-sidebar-accent text-sidebar-foreground/80"
            aria-label="Cerrar menú"
          >
            <XMarkIcon className="size-5" />
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

        {canCreatePurchaseOrder(user) && (
          <div className="p-3 border-t border-sidebar-border">
            <Link
              href="/procurement?new=1"
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 w-full rounded-md bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground text-xs font-medium px-3 py-2.5 transition-colors"
            >
              <PlusIcon className="size-3.5" />
              Nueva Orden de Compra
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
