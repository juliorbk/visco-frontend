"use client"

import { useState } from "react"
import { Sidebar } from "@/components/visco/sidebar"
import { Topbar } from "@/components/visco/topbar"
import { UserProvider } from "@/lib/user-context"

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <UserProvider>
      <div className="min-h-screen bg-background">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="md:pl-[220px]">
          <Topbar onMenuClick={() => setSidebarOpen((v) => !v)} />
          <main className="px-3 md:px-8 py-4 md:py-6">{children}</main>
        </div>
      </div>
    </UserProvider>
  )
}
