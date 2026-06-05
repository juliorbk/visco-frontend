const BASE_URL = process.env.NEXT_PUBLIC_API_URL

if (!BASE_URL) {
  console.error("[API] NEXT_PUBLIC_API_URL no está definida. Las llamadas fallarán.")
}

export interface RequestOptions extends RequestInit {
  /** When true, do not perform the implicit logout/redirect on 401/403.
   *  Useful for probes like /api/auth/me that expect to return null. */
  skipAuthRedirect?: boolean
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuthRedirect, ...init } = options
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (init.headers) {
    Object.assign(headers, init.headers)
  }

  const url = `${BASE_URL}${endpoint}`
  if (process.env.NODE_ENV === "development")
    console.log(`[API] ${init.method || "GET"} ${url}`)

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  })

  if (res.status === 401 || res.status === 403) {
    if (!skipAuthRedirect && typeof window !== "undefined") {
      window.location.href = "/"
    }
    throw new Error("Sesión expirada")
  }

  if (res.status === 204) {
    return undefined as T
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `Error ${res.status}` }))
    const messages: string[] = []
    if (Array.isArray(err.errors) && err.errors.length) {
      for (const e of err.errors) {
        if (!e) continue
        const m = e.defaultMessage ?? e.message ?? e.field
        if (m) messages.push(String(m))
      }
    }
    if (err.detail) messages.push(String(err.detail))
    if (err.error) messages.push(String(err.error))
    throw new Error(messages.join("; ") || `Error ${res.status}`)
  }

  return res.json()
}

export const api = {
  get: <T>(endpoint: string, signal?: AbortSignal, skipAuthRedirect?: boolean) =>
    request<T>(endpoint, { signal, skipAuthRedirect }),
  post: <T>(endpoint: string, body?: unknown, signal?: AbortSignal, skipAuthRedirect?: boolean) =>
    request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      signal,
      skipAuthRedirect,
    }),
  put: <T>(endpoint: string, body?: unknown, signal?: AbortSignal, skipAuthRedirect?: boolean) =>
    request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      signal,
      skipAuthRedirect,
    }),
  patch: <T>(endpoint: string, body?: unknown, signal?: AbortSignal, skipAuthRedirect?: boolean) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      signal,
      skipAuthRedirect,
    }),
  delete: <T>(endpoint: string, signal?: AbortSignal, skipAuthRedirect?: boolean) =>
    request<T>(endpoint, { method: "DELETE", signal, skipAuthRedirect }),
}