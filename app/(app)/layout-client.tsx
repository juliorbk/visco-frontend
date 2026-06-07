"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/visco/sidebar"
import { Topbar } from "@/components/visco/topbar"
import { useCurrentUser } from "@/lib/user-context"
import { isAtLeast } from "@/lib/config/roles"
import { getRequiredRoleForPath } from "@/lib/config/navigation"
import { ForbiddenPage } from "@/app/(app)/forbidden/page"

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useCurrentUser()

  const requiredRole = getRequiredRoleForPath(pathname)

  if (user && requiredRole && !isAtLeast(user, requiredRole)) {
    return (
      <>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="md:pl-[220px]">
          <Topbar onMenuClick={() => setSidebarOpen((v) => !v)} />
          <main className="px-3 md:px-8 py-4 md:py-6">
            <ForbiddenPage />
          </main>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="md:pl-[220px]">
        <Topbar onMenuClick={() => setSidebarOpen((v) => !v)} />
        <main className="px-3 md:px-8 py-4 md:py-6">{children}</main>
      </div>
    </div>
  )
}
