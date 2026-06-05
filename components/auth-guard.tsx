"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useCurrentUser } from "@/lib/user-context"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, refresh } = useCurrentUser()
  const [checked, setChecked] = useState(false)
  const [initialRefreshDone, setInitialRefreshDone] = useState(false)

  useEffect(() => {
    let cancelled = false
    refresh()
      .then(() => {
        if (cancelled) return
        setInitialRefreshDone(true)
      })
      .catch(() => {
        if (cancelled) return
        setInitialRefreshDone(true)
      })
    return () => {
      cancelled = true
    }
  }, [refresh])

  useEffect(() => {
    if (user === undefined) return
    if (user === null) {
      router.replace("/")
    } else {
      setChecked(true)
    }
  }, [user, router])

  if (!checked || !initialRefreshDone) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p>Loading...</p></div>
  }

  return <>{children}</>
}
