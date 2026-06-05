import "server-only"
import { createHmac, timingSafeEqual } from "crypto"

const SECRET = process.env.JWT_SECRET
if (!SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable is required in production")
  }
}
const ACTIVE_SECRET = SECRET ?? "visco-dev-secret-key-2026"
const EXPIRY = "24h"

interface JwtPayload {
  sub: string
  name: string
  role: string
  iat: number
  exp: number
}

function base64url(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

function base64urlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/")
  while (str.length % 4) str += "="
  return Buffer.from(str, "base64").toString("utf-8")
}

export function signJwt(payload: Omit<JwtPayload, "iat" | "exp">): string {
  const now = Math.floor(Date.now() / 1000)
  const exp = now + 24 * 60 * 60
  const full: JwtPayload = { ...payload, iat: now, exp }

  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const body = base64url(JSON.stringify(full))
  const signature = createHmac("sha256", ACTIVE_SECRET)
    .update(`${header}.${body}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")

  return `${header}.${body}.${signature}`
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const [header, body, signature] = parts
    const expectedSig = createHmac("sha256", ACTIVE_SECRET)
      .update(`${header}.${body}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
    .replace(/\//g, "_")

    const sigBuf = Buffer.from(signature, "utf-8")
    const expectedBuf = Buffer.from(expectedSig, "utf-8")
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return null
    }

    const decoded = JSON.parse(base64urlDecode(body)) as JwtPayload
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null

    return decoded
  } catch {
    return null
  }
}
