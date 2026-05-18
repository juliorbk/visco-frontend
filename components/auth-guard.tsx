"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { fetchUser } from "@/lib/auth-client"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)
  const redirectingRef = useRef(false)

  useEffect(() => {
    fetchUser().then((user) => {
      if (!user && !redirectingRef.current) {
        redirectingRef.current = true
        router.replace("/")
      } else if (user) {
        setChecked(true)
      }
    })
  }, [pathname, router])

  if (!checked) return null

  return <>{children}</>
}
