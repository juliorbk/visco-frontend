import type { UserDTO } from "./types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

/**
 * Fetches the currently authenticated user from the backend.
 * Safe to call on the server (returns null) and the browser.
 */
export async function fetchUser(): Promise<UserDTO | null> {
  if (!BASE_URL) return null
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      credentials: "include",
    })
    if (res.status === 401 || res.status === 403) return null
    if (!res.ok) return null
    return (await res.json()) as UserDTO
  } catch {
    return null
  }
}

/**
 * Reads the user that was persisted in localStorage by an earlier
 * `fetchUser` or login flow. Returns `undefined` on the server or when
 * nothing has been cached yet, `null` when a previous attempt returned
 * no user, and the `UserDTO` otherwise.
 *
 * Replace module-level mutable state so SSR cannot leak data between
 * requests. Components that need reactive updates should subscribe via
 * `useCurrentUser` from `@/lib/user-context`.
 */
export function getCachedUser(): UserDTO | null | undefined {
  if (typeof window === "undefined") return undefined
  try {
    const raw = window.localStorage.getItem("visco:user")
    if (raw === null) return null
    return JSON.parse(raw) as UserDTO
  } catch {
    return null
  }
}

/** Persist or clear the cached user. Dispatches a window event so
 *  listeners (e.g. UserProvider) can react. */
export function persistUser(user: UserDTO | null): void {
  if (typeof window === "undefined") return
  if (user) {
    window.localStorage.setItem("visco:user", JSON.stringify(user))
  } else {
    window.localStorage.removeItem("visco:user")
  }
  window.dispatchEvent(new Event("visco:user-updated"))
}

export function clearUserCache(): void {
  persistUser(null)
}

export async function isAuthenticated(): Promise<boolean> {
  const u = await fetchUser()
  return u !== null
}
