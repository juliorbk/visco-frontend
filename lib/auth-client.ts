export interface UserInfo {
  sub: string
  name: string
  role: string
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("visco_jwt")
}

export function setToken(token: string): void {
  localStorage.setItem("visco_jwt", token)
}

export function removeToken(): void {
  localStorage.removeItem("visco_jwt")
}

export function decodeToken(token: string): UserInfo | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const body = parts[1]
    const decoded = JSON.parse(atob(body.replace(/-/g, "+").replace(/_/g, "/")))
    return { sub: decoded.sub, name: decoded.name, role: decoded.role }
  } catch {
    return null
  }
}

export function getUser(): UserInfo | null {
  const token = getToken()
  if (!token) return null
  return decodeToken(token)
}

export function isAuthenticated(): boolean {
  const token = getToken()
  if (!token) return false
  const user = decodeToken(token)
  return user !== null
}
