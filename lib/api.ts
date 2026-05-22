const BASE_URL = process.env.NEXT_PUBLIC_API_URL

if (!BASE_URL) {
  console.error("[API] NEXT_PUBLIC_API_URL no está definida. Las llamadas fallarán.")
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (options.headers) {
    Object.assign(headers, options.headers)
  }

  const url = `${BASE_URL}${endpoint}`
  console.log(`[API] ${options.method || "GET"} ${url}`) // Debug
  
  const res = await fetch(url, { 
    ...options, 
    headers, 
    credentials: "include" 
  })

  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined") {
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
    if (err.errors?.length) {
      for (const e of err.errors) {
        messages.push(e.defaultMessage ?? e.message ?? e.field)
      }
    }
    if (err.detail) messages.push(err.detail)
    if (err.error) messages.push(err.error)
    throw new Error(messages.join("; ") || `Error ${res.status}`)
  }

  return res.json()
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
}