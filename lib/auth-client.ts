export interface UserInfo {
  id: string
  name: string
  email: string
  role: string
}

let cachedUser: UserInfo | null | undefined = undefined

export async function fetchUser(): Promise<UserInfo | null> {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" })
    if (!res.ok) {
      cachedUser = null
      return null
    }
    const data = await res.json()
    cachedUser = { id: data.id, name: data.name, email: data.email, role: data.role }
    return cachedUser
  } catch {
    cachedUser = null
    return null
  }
}

export function getCachedUser(): UserInfo | null | undefined {
  return cachedUser
}

export function clearUserCache(): void {
  cachedUser = undefined
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await fetchUser()
  return user !== null
}
