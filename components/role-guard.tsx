"use client"

import type { UserRole } from "@/lib/types"
import { useCurrentUser } from "@/lib/user-context"
import { isAtLeast } from "@/lib/config/roles"
import { ForbiddenPage } from "@/app/(app)/forbidden/page"

export function RoleGuard({
  children,
  minRole,
  fallback,
}: {
  children: React.ReactNode
  minRole: UserRole
  fallback?: React.ReactNode
}) {
  const { user } = useCurrentUser()

  if (!user) return null
  if (!isAtLeast(user, minRole)) {
    return fallback ? <>{fallback}</> : <ForbiddenPage />
  }

  return <>{children}</>
}
