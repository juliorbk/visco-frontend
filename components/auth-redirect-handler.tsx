"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function AuthRedirectHandler() {
  const router = useRouter()

  useEffect(() => {
    const handler = () => router.replace("/")
    window.addEventListener("visco:auth-expired", handler)
    return () => window.removeEventListener("visco:auth-expired", handler)
  }, [router])

  return null
}
