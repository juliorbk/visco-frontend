"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useCurrentUser } from "@/lib/user-context"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, refresh } = useCurrentUser()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let cancelled = false
    refresh()
      .then(() => {
        if (cancelled) return
      })
      .catch(() => {
        if (!cancelled) router.replace("/")
      })
    return () => {
      cancelled = true
    }
  }, [pathname, refresh, router])

  useEffect(() => {
    if (user === undefined) return
    if (user === null) {
      router.replace("/")
    } else {
      setChecked(true)
    }
  }, [user, router])

  if (!checked) return null

  return <>{children}</>
}
