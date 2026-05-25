"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { fetchUser } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchUser()
      .then((user) => {
        if (cancelled) return
        if (!user) {
          router.replace("/")
        } else {
          setChecked(true)
        }
      })
      .catch(() => {
        if (!cancelled) router.replace("/")
      })
    return () => { cancelled = true }
  }, [pathname])

  if (!checked) return null

  return <>{children}</>
}
