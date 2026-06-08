"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/lib/user-context"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, refresh } = useCurrentUser()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    refresh().finally(() => setChecked(true))
  }, [refresh])

  if (!checked) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground text-sm">Cargando...</p></div>
  }

  if (user === null) {
    router.replace("/")
    return null
  }

  if (user === undefined) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground text-sm">Cargando...</p></div>
  }

  return <>{children}</>
}
