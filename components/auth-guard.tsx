"use client"

import { useEffect, useState } from "react"
import { useCurrentUser } from "@/lib/user-context"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, refresh } = useCurrentUser()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    refresh().finally(() => setChecked(true))
  }, [refresh])

  if (!checked) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p>Loading...</p></div>
  }

  if (user === null) {
    window.location.href = "/"
    return null
  }

  if (user === undefined) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p>Loading...</p></div>
  }

  return <>{children}</>
}