import { NextResponse } from "next/server"
import { verifyJwt, signJwt } from "@/lib/auth"
import { users } from "@/lib/users"

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Token no proporcionado" }, { status: 401 })
  }

  const token = authHeader.slice(7)
  const payload = verifyJwt(token)
  if (!payload) {
    return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 })
  }

  const user = users.find((u) => u.id === payload.sub)
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  const newToken = signJwt({
    sub: user.id,
    name: user.name,
    role: user.role,
  })

  return NextResponse.json({ token: newToken })
}
