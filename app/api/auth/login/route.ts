import { NextResponse } from "next/server"
import { users } from "@/lib/users"
import { signJwt } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    const user = users.find((u) => u.email === email)
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const token = signJwt({
      sub: user.id,
      name: user.name,
      role: user.role,
    })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
