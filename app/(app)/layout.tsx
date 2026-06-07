import type React from "react"
import { UserProvider } from "@/lib/user-context"
import { AuthGuard } from "@/components/auth-guard"
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
