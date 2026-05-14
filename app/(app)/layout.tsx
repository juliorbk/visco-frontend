import type React from "react"
import { Sidebar } from "@/components/visco/sidebar"
import { Topbar } from "@/components/visco/topbar"
import { AuthGuard } from "@/components/auth-guard"
import { AppLayoutClient } from "./layout-client"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppLayoutClient>
        {children}
      </AppLayoutClient>
    </AuthGuard>
  )
}
