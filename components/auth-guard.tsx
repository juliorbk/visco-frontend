"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { fetchUser } from "@/lib/auth-client"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    fetchUser().then((user) => {
      if (!user) {
        router.replace("/")
      } else {
        setChecked(true)
      }
    })
  }, [pathname, router])

  if (!checked) return null

  return <>{children}</>
}
