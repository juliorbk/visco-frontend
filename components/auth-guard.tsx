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
    console.log("[AuthGuard] running refresh, user currently:", user)
    let cancelled = false
    refresh()
      .then((u) => {
        console.log("[AuthGuard] refresh completed, user:", user)
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
    console.log("[AuthGuard] user effect triggered, user:", user, "checked:", checked)
    if (user === undefined) return
    if (user === null) {
      router.replace("/")
    } else {
      setChecked(true)
    }
  }, [user, router])

  console.log("[AuthGuard] rendering, checked:", checked, "user:", user)

  if (!checked) return <div className="min-h-screen bg-background flex items-center justify-center"><p>Loading...</p></div>

  return <>{children}</>
}
