import type { UserDTO } from "./types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

let cachedUser: UserDTO | null | undefined = undefined

export async function fetchUser(): Promise<UserDTO | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, { credentials: "include" })
    if (!res.ok) {
      cachedUser = null
      return null
    }
    const data: UserDTO = await res.json()
    cachedUser = data
    return cachedUser
  } catch {
    cachedUser = null
    return null
  }
}

export function getCachedUser(): UserDTO | null | undefined {
  return cachedUser
}

export function clearUserCache(): void {
  cachedUser = undefined
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await fetchUser()
  return user !== null
}
