"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import type { UserDTO } from "./types"
import { fetchUser as fetchUserImpl, persistUser } from "./auth-client"

interface UserContextValue {
  user: UserDTO | null | undefined
  refresh: () => Promise<void>
  setUser: (user: UserDTO | null) => void
}

const UserContext = createContext<UserContextValue | null>(null)

function readInitialUser(): UserDTO | null | undefined {
  if (typeof window === "undefined") return undefined
  try {
    const raw = window.localStorage.getItem("visco:user")
    if (raw === null) return null
    return JSON.parse(raw) as UserDTO
  } catch {
    return null
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserDTO | null | undefined>(readInitialUser)

  const refresh = useCallback(async () => {
    const u = await fetchUserImpl()
    persistUser(u)
    setUserState(u)
  }, [])

  const setUser = useCallback((u: UserDTO | null) => {
    persistUser(u)
    setUserState(u)
  }, [])

  // Listen for cross-component updates (login/logout/profile change)
  useEffect(() => {
    const onUpdate = () => setUserState(readInitialUser())
    window.addEventListener("visco:user-updated", onUpdate)
    window.addEventListener("storage", onUpdate)
    return () => {
      window.removeEventListener("visco:user-updated", onUpdate)
      window.removeEventListener("storage", onUpdate)
    }
  }, [])

  // Initial fetch only when we don't have a cached value
  useEffect(() => {
    if (user === undefined) {
      refresh()
    }
  }, [user, refresh])

  return (
    <UserContext.Provider value={{ user, refresh, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useCurrentUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error("useCurrentUser must be used within a UserProvider")
  }
  return ctx
}
