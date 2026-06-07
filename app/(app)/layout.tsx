import type React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { UserProvider } from "@/lib/user-context"
import { AppLayoutClient } from "./layout-client"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <AuthGuard>
        <AppLayoutClient>
          {children}
        </AppLayoutClient>
      </AuthGuard>
    </UserProvider>
  )
}
